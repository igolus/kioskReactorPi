#!/bin/bash

# Crée un log horodaté au format YYYY-MM-DD
DATE=$(date +%F)
LOG_DIR="/cygdrive/c/kioskReactor/logs"
LOG_FILE="$LOG_DIR/log-$DATE.log"

# Créer le dossier s’il n’existe pas
if [ ! -d "$LOG_DIR" ]; then
  mkdir -p "$LOG_DIR"

fi

if [ ! -f "$LOG_FILE" ]; then
  touch "$LOG_FILE"
fi

chmod 777 "$LOG_DIR"
# Attendre la création du fichier puis modifier ses droits
chmod 666 "$LOG_FILE"

# Rediriger toute la sortie (stdout et stderr) vers tee
exec > >(tee -a "$LOG_FILE") 2>&1

# Nettoyage du Temp du compte de session (%LOCALAPPDATA%\Temp : dossiers
# _MEI de PyInstaller, *.tmp.node, wct*.tmp, cache electron-updater...) AVANT
# de lancer quoi que ce soit : chaque lancement y laisse des restes jamais
# effaces et le disque se remplit (2026-10-22). Seules les entrees de plus
# d'une heure partent — les services deja actifs gardent leur dossier en
# cours d'usage. Borne a 120 s et ne sort jamais en erreur (cf. cleanTemp.sh).
if [ -f /cygdrive/c/kioskReactor/cleanTemp.sh ]; then
  bash /cygdrive/c/kioskReactor/cleanTemp.sh || true
else
  echo "cleanTemp.sh absent, nettoyage du Temp ignore"
fi

# Purge des logs (15 jours) : PAS ici. L'ancien `find -mtime +5` tournait sous
# le compte de session, avant la remise au propre des ACL, et echouait sur les
# fichiers d'un autre compte. Elle est faite par purgeLogs.sh, appele depuis
# scriptUtil\services-install.bat (eleve admin, juste apres reset_acl.bat et
# avant la reinstallation des services qui ecrivent dans logs/).


ONLINE=1
TRY=0
while [ $ONLINE -ne 0 ] && [ $TRY -le 10000 ]
do
   content=`curl -IL google.com`
   if [[ "$content" == *"200 OK"* ]]; then
     ONLINE=0
   fi
   if [ $ONLINE -ne 0 ]
     then
	   echo "Waiting for online internet..."
       sleep 2
   fi
   TRY=$((TRY+1))
done

echo "Online !!!"

# Retient le lancement de Chrome tant que le serveur WebSocket (wsServer.js,
# port 8080) n'ecoute pas.
#
# POURQUOI : le script kioskReactorJs charge par la page ouvre son socket UNE
# seule fois, au chargement. Au boot, Chrome chargeait la page ~4 s AVANT que
# wsServer.js n'ecoute (borne 113, 2026-10-12 : page a 12:36:45, serveur a
# 12:36:49) : connexion refusee, jamais retentee, plus aucune impression ni
# voix de la journee jusqu'a un rechargement depuis l'admin. La page sait
# desormais se reconnecter (shellWsWatchdog cote borne), ce garde-fou evite en
# plus de partir d'emblee sur un socket mort.
#
# Remplace l'ancien wait-for-ws, qui attendait un `wsInit` dans config.json que
# wsServer.js n'ecrit plus (ligne en commentaire) et qui n'etait jamais appele.
#
# Test du port par curl : code de sortie 7 = connexion refusee (rien n'ecoute).
# Tout autre code (28 timeout, 52 reponse vide, 0) = le port repond ; le
# serveur http sous-jacent n'a pas de handler de requete, curl peut donc
# attendre jusqu'a --max-time, ce qui n'est pas un echec. Borne a 90 s : une
# borne ne doit jamais rester sans navigateur, meme si le serveur WS est en
# panne — la page se reconnectera seule quand il reviendra.
WS_PORT_WAIT_MAX_SECONDS=90

wait-for-ws-port() {
    local waited=0
    echo "wait-for-ws-port: attente du serveur WebSocket sur 127.0.0.1:8080..."
    while true; do
        curl -s -o /dev/null --max-time 2 http://127.0.0.1:8080/
        if [ $? -ne 7 ]; then
            echo "$(date '+%Y-%m-%d %H:%M:%S') - wait-for-ws-port: port 8080 ouvert apres ${waited}s"
            return 0
        fi
        if [ $waited -ge $WS_PORT_WAIT_MAX_SECONDS ]; then
            echo "$(date '+%Y-%m-%d %H:%M:%S') - WARNING: wait-for-ws-port: port 8080 toujours ferme apres ${waited}s, lancement du navigateur quand meme"
            return 1
        fi
        sleep 1
        waited=$((waited+1))
    done
}

# Wrapper function to run a service with crash detection and auto-restart
run_service() {
    local service_name=$1
    local service_dir=$2
    local service_script=$3

    while true; do
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting $service_name..."

        cd "$service_dir"
        node "$service_script"
        exit_code=$?

        # Service crashed
        echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $service_name crashed with exit code $exit_code"

        # Send MQTT notification with JSON payload
        curl -s "http://127.0.0.1:4000/mqtt/publish?topic=programCrash&message={\"name\":\"$service_name\"}" || true

        # Wait before restarting
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Restarting $service_name in 5 seconds..."
        sleep 5
    done
}

cd /cygdrive/c/kioskReactor/conf/
deviceId=`jq '.deviceId' './config.json' | tr -d '"'`
echo $deviceId

launchSystem() {

  # VPN en PREMIER : les services lances ensuite (lifeCheck, wsServer,
  # commandLauncher) et le navigateur ont besoin du reseau du site des leur
  # demarrage — le lancer apres eux leur faisait rater leurs premiers appels.
  echo Vpn
  cd /cygdrive/c/kioskReactor/scriptUtil/Agent_Multi-Thread/_command_list_apiborne
  chmod +x ./Vpn-on.bat
  ./Vpn-on.bat &

  echo SafiKiosk
  if [ -d "/cygdrive/C/tools/SafiKioskExe" ]; then
  cd /cygdrive/C/tools/SafiKioskExe
  if [ -f "./SafiKiosk.exe" ]; then
    ./SafiKiosk.exe &
  else
    echo "SafiKiosk.exe not found, skipping launch."
  fi
  else
    echo "Directory /cygdrive/C/tools/SafiKioskExe does not exist, skipping SafiKiosk.exe launch."
  fi

#  cd  /cygdrive/c/kioskReactor
#  ./ngrok config add-authtoken 27Kywp1WpRFQhtoIPZeIRqHg3qP_96QRrV5uQhBE5g1mESYy
#
#  echo ngrokChecker
#  if [ -n "$deviceId" ] && [ "$deviceId" != "null" ]; then
#    cd /cygdrive/c/kioskReactor/programs/jsScripts/ngrokCheck
#    node checker.js &
#  else
#    echo "deviceId non défini, ngrokCheck ignoré."
#  fi

  echo launchSystem
  run_service "lifeCheckRunner" "/cygdrive/c/kioskReactor/programs/jsScripts/lifeCheck" "lifeCheckRunner.js" &

  echo listener
  run_service "listener" "/cygdrive/c/kioskReactor/programs/jsScripts/keyBoardListener" "listener.js" &

  echo wsServer
  run_service "wsServer" "/cygdrive/c/kioskReactor/programs/jsScripts/webSocket" "wsServer.js" &

  echo commandLauncher
  run_service "commandLauncher" "/cygdrive/c/kioskReactor/programs/jsScripts/commandsListener" "commandLauncher.js" &

  echo services-install
  cd /cygdrive/c/kioskReactor/scriptUtil
  ./services-install.bat &

}

# Lance les programmes supplementaires declares dans conf/extraPrograms.json
# Format attendu (tableau d'objets) :
# [
#   { "name": "monProgramme", "folder": "/cygdrive/c/tools/monProg", "command": "./monProg.exe --option" }
# ]
# "folder" est optionnel. Si le fichier est absent ou invalide, rien n'est lance et le script continue.
launchExtraPrograms() {
  local extraFile="/cygdrive/c/kioskReactor/conf/extraPrograms.json"

  if [ ! -f "$extraFile" ]; then
    echo "extraPrograms: $extraFile absent, aucun programme supplementaire."
    return 0
  fi

  if ! jq -e 'type == "array"' "$extraFile" > /dev/null 2>&1; then
    echo "extraPrograms: $extraFile invalide (JSON incorrect ou pas un tableau), ignore."
    return 0
  fi

  local count
  count=$(jq 'length' "$extraFile" 2>/dev/null || echo 0)
  echo "extraPrograms: $count programme(s) a lancer."

  local i=0
  while [ "$i" -lt "$count" ]; do
    local name folder command
    name=$(jq -r ".[$i].name // \"extra-$i\"" "$extraFile" 2>/dev/null | tr -d '\r')
    folder=$(jq -r ".[$i].folder // \"\"" "$extraFile" 2>/dev/null | tr -d '\r')
    command=$(jq -r ".[$i].command // \"\"" "$extraFile" 2>/dev/null | tr -d '\r')
    i=$((i+1))

    if [ -z "$command" ]; then
      echo "extraPrograms: [$name] pas de \"command\", ignore."
      continue
    fi

    if [ -n "$folder" ] && [ ! -d "$folder" ]; then
      echo "extraPrograms: [$name] dossier introuvable ($folder), ignore."
      continue
    fi

    echo "extraPrograms: lancement de [$name] dans '${folder:-.}' : $command"
    (
      if [ -n "$folder" ]; then
        cd "$folder" || exit 1
      fi
      eval "$command"
    ) &
  done
}

cd /cygdrive/c/kioskReactor/conf/

minimalCreditToLock=`jq '.minimalCreditToLock' './config.json' | tr -d '"'`
credit=`jq '.credit' './brand.json' | tr -d '"'`
blockWhenInsufficientCredit=`jq '.blockWhenInsufficientCredit' './brand.json' | tr -d '"'`
screenSize=`jq '.screenSize' './config.json' | tr -d '"'`
screenOrientation=`jq '.screenRotation' './config.json' | tr -d '"'`

creditl=`echo $credit | sed 's/\\r//g'`

minimalCreditToLock=-2000

launchBrowser() {
	cd /cygdrive/c/kioskReactor/scriptUtil/chrome
	chmod +x ./chromeKioskRemoteDebugger.bat
	./chromeKioskRemoteDebugger.bat $url &
}

cd /cygdrive/c/kioskReactor/programs/jsScripts/init
node startupInit.js

if [ $credit == "null" -o $blockWhenInsufficientCredit == "false" ]; then
	url=https://us-central1-totemsystem-5889b.cloudfunctions.net/homePage/$deviceId
	launchSystem
	# Chrome seulement une fois le WS du shell joignable (cf. wait-for-ws-port).
	wait-for-ws-port
	launchBrowser
else
	echo "else"
	if (( $creditl < $minimalCreditToLock )); then
		# Page "sans credit" locale : aucun service lance, rien a attendre.
		url=file:///C:/kioskReactor/programs/pages/nocredit.html
		launchBrowser
	else
		url=https://us-central1-totemsystem-5889b.cloudfunctions.net/homePage/$deviceId
		launchSystem
		wait-for-ws-port
		launchBrowser
	fi
fi

echo $url

launchExtraPrograms

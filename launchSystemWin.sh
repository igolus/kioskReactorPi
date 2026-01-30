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


# Supprimer les logs de plus de 5 jours
find "$LOG_DIR" -name "*.log" -mtime +5 -exec rm -f {} \;

# Rediriger toute la sortie (stdout et stderr) vers tee
exec > >(tee -a "$LOG_FILE") 2>&1


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

wait-for-ws() {
	echo "wait-for-ws"
	cd /cygdrive/c/kioskReactor/conf/
    wsInit=`jq '.wsInit' './config.json' | tr -d '"'`
	wsInitl=`echo $wsInit | sed 's/\\r//g'`
	echo wsInitl
    while [ $wsInitl == 0 ]
    do
       wsInit=`jq '.wsInit' './config.json' | tr -d '"'`
	   wsInitl=`echo $wsInit | sed 's/\\r//g'`
       echo "Waiting forweb socket..."
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

  cd /cygdrive/c/kioskReactor/scriptUtil/Agent_Multi-Thread/_command_list_apiborne
  chmod +x ./Vpn-on.bat
  ./Vpn-on.bat &

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
	launchBrowser
else
	echo "else"
	if (( $creditl < $minimalCreditToLock )); then
		url=file:///C:/kioskReactor/programs/pages/nocredit.html
		launchBrowser
	else
		url=https://us-central1-totemsystem-5889b.cloudfunctions.net/homePage/$deviceId
		launchSystem
		launchBrowser
	fi
fi

echo $url
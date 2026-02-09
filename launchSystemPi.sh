#!/bin/bash
# Crée un log horodaté au format YYYY-MM-DD
DATE=$(date +%F)
LOG_DIR="$HOME/kioskReactor/logs"
LOG_FILE="$LOG_DIR/log-$DATE.log"
# Créer le dossier s'il n'existe pas
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
   content=$(curl -IL google.com)
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
	cd $HOME/kioskReactor/conf/
    wsInit=$(jq '.wsInit' './config.json' | tr -d '"')
	wsInitl=$(echo $wsInit | sed 's/\\r//g')
	echo $wsInitl
    while [ $wsInitl == 0 ]
    do
       wsInit=$(jq '.wsInit' './config.json' | tr -d '"')
	   wsInitl=$(echo $wsInit | sed 's/\\r//g')
       echo "Waiting for web socket..."
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
cd $HOME/kioskReactor/conf/
deviceId=$(jq '.deviceId' './config.json' | tr -d '"')
echo $deviceId
launchSystem() {
  # echo "wsServer"
  # run_service "wsServer" "$HOME/kioskReactor/programs/jsScripts/webSocket" "wsServer.js" &
  echo "commandLauncher"
  run_service "commandLauncher" "$HOME/kioskReactor/programs/jsScripts/commandsListener" "commandLauncher.js" &
}
cd $HOME/kioskReactor/conf/
cd $HOME/kioskReactor/programs/jsScripts/init
node startupInit.js
launchSystem
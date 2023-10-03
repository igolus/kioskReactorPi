#!/bin/bash
export DISPLAY=:0.0

url=`jq '.deviceId' /home/pi/kioskReactor/conf/config.json | tr -d '"'`
echo $url

set -x #echo on
#/usr/bin/chromium-browser --noerrdialogs --incognito --disable-pinch --overscroll-history-navigation=0 --disable-infobars --remote-debugging-port=9222 https://us-central1-totemsystem-5889b.cloudfunctions.net/homePage/$url &

wait-for-url() {
    echo "Testing $1"
    timeout -s TERM 45 bash -c \
    'while [[ "$(curl -s -o /dev/null -L -w ''%{http_code}'' ${0})" != "200" ]];\
    do echo "Waiting for ${0}" && sleep 2;\
    done' ${1}
    echo "OK!"
    curl -I $1
}

cd /home/pi/kioskReactor/programs/jsScripts/lifeCheck
sudo node lifeCheckRunner.js &
cd /home/pi/kioskReactor/programs/jsScripts/webSocket
sudo node wsServer.js &
cd /home/pi/kioskReactor/programs/jsScripts/serverService
sudo node services.js &
cd /home/pi/kioskReactor/programs/jsScripts/commandsListener
sudo node commandLauncher.js &
cd /home/pi/kioskReactor/programs/PyScripts
sudo python3 usb-serial-reader.py &
sudo python3 takeASnap.py &
python3 playSound.py &
sudo python3 inactivityMouseCheck.py &

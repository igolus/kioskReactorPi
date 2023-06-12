#!/bin/bash

#url=`jq '.deviceId' /home/pi/kioskReactor/conf/config.json | tr -d '"'`
#echo $url

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

launchSystem() {
	echo launchSystem
	cd /cygdrive/c/kioskReactor/programs/jsScripts/init
	node startupInit.js
	cd  /cygdrive/c/kioskReactor/programs/jsScripts/webSocket
	node wsServer.js &
	#cd /cygdrive/c/kioskReactor/programs/jsScripts/serverService
	#node services.js &
	cd /cygdrive/c/kioskReactor/programs/jsScripts/commandsListener
	node commandLauncher.js &
}

cd /cygdrive/c/kioskReactor/conf/
deviceId=`jq '.deviceId' './config.json' | tr -d '"'`
echo $deviceId
minimalCreditToLock=`jq '.minimalCreditToLock' './config.json' | tr -d '"'`
credit=`jq '.credit' './config.json' | tr -d '"'`
blockWhenInsufficientCredit=`jq '.blockWhenInsufficientCredit' './config.json' | tr -d '"'`
screenSize=`jq '.screenSize' './config.json' | tr -d '"'`
screenOrientation=`jq '.screenRotation' './config.json' | tr -d '"'`
echo "screenOrientation"
echo $screenOrientation

#exit 0

echo $url
echo $minimalCreditToLock
echo $credit
echo $minimalCreditToLock
echo $screenSize

launchBrowser() {
	echo $url
	cd '/cygdrive/C/Program Files/Google/Chrome/Application'
	./chrome.exe --no-sandbox --no-first-run --fast --fast-start --password-store=basic --disable-features=TouchpadOverscrollHistoryNavigation --disable-features=TranslateUI --noerrdialogs --incognito --disable-pinch --overscroll-history-navigation=0 --disable-infobars --remote-debugging-port=9222 $url &
}


if [ $ONLINE -ne 0 ]; then
 url="http://127.0.0.1:8081/home"
 launchBrowser
 launchSystem
 exit 0
fi

if [ $credit == "null" -o $blockWhenInsufficientCredit == "false" ]; then
	url=https://us-central1-totemsystem-5889b.cloudfunctions.net/homePage/$deviceId
	launchBrowser
	launchSystem
else
	if (( $credit < $minimalCreditToLock )); then
		url=file:///C:/kioskReactor/programs/pages/nocredit.html
		launchBrowser
	else
		url=https://us-central1-totemsystem-5889b.cloudfunctions.net/homePage/$deviceId
		launchBrowser
		launchSystem
	fi
fi

echo $url

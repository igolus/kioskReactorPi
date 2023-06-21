#!/bin/bash

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

launchSystem() {
	echo launchSystem
	cd  /cygdrive/c/kioskReactor/programs/jsScripts/webSocket
	node wsServer.js &
	cd /cygdrive/c/kioskReactor/programs/jsScripts/commandsListener
	node commandLauncher.js &
}

cd /cygdrive/c/kioskReactor/conf/
deviceId=`jq '.deviceId' './config.json' | tr -d '"'`
echo $deviceId
minimalCreditToLock=`jq '.minimalCreditToLock' './config.json' | tr -d '"'`
credit=`jq '.credit' './brand.json' | tr -d '"'`
blockWhenInsufficientCredit=`jq '.blockWhenInsufficientCredit' './brand.json' | tr -d '"'`
screenSize=`jq '.screenSize' './config.json' | tr -d '"'`
screenOrientation=`jq '.screenRotation' './config.json' | tr -d '"'`

creditl=`echo $credit | sed 's/\\r//g'`

minimalCreditToLock=-2000

launchBrowser() {
	wait-for-ws
	#echo $url
	cd '/cygdrive/C/Program Files/Google/Chrome/Application'
	./chrome.exe --no-sandbox --no-first-run --fast --fast-start --password-store=basic --disable-features=TouchpadOverscrollHistoryNavigation --disable-features=TranslateUI --noerrdialogs --incognito --disable-pinch --overscroll-history-navigation=0 --disable-infobars --remote-debugging-port=9222 $url &
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

#!/bin/bash
cd /home/pi/rocketKiosk/programs/jsScripts/init
sudo node startupInit.js

deviceId=`jq '.deviceId' /home/pi/rocketKiosk/conf/config.json | tr -d '"'`
minimalCreditToLock=`jq '.minimalCreditToLock' /home/pi/rocketKiosk/conf/brand.json | tr -d '"'`
credit=`jq '.credit' /home/pi/rocketKiosk/conf/brand.json | tr -d '"'`
echo $url
echo $minimalCreditToLock
echo $credit

launchBrowser() {
	echo $url
	sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'
	sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences
	chromium-browser --no-sandbox --kiosk --window-size=1360,768 --no-first-run --fast --fast-start --password-store=basic --disable-features=TouchpadOverscrollHistoryNavigation --disable-features=TranslateUI --noerrdialogs --incognito --disable-pinch --overscroll-history-navigation=0 --disable-infobars --remote-debugging-port=9222 $url &
}


launchSystem() {
	#chromium
	cd /home/pi/rocketKiosk
	/home/pi/rocketKiosk/launchSystem.sh
}


if [ $credit == "null" ]; then
	url=https://us-central1-totemsystem-5889b.cloudfunctions.net/homePage/$deviceId
	launchBrowser
	launchSystem
else
	if (( $credit < $minimalCreditToLock )); then
		url=file:///home/pi/rocketKiosk/programs/pages/nocredit.html
		launchBrowser
	else
		url=https://us-central1-totemsystem-5889b.cloudfunctions.net/homePage/$deviceId
		launchBrowser
		launchSystem
	fi
fi

echo $url


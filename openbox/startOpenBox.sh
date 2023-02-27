#!/bin/bash
ONLINE=1
TRY=0
while [ $ONLINE -ne 0 ] && [ $TRY -le 10 ]
do
   ping -q -c 1 -w 1 www.google.com >/dev/null 2>&1
   ONLINE=$?
   if [ $ONLINE -ne 0 ]
     then
       sleep 2
   fi
   echo $TRY
   TRY=$((TRY+1))
done

echo $ONLINE

if [ $ONLINE -eq 0 ]; then
  echo "We are on line!"
fi

cd /home/pi/kioskReactor/programs/jsScripts/init
sudo node startupInit.js

deviceId=`jq '.deviceId' /home/pi/kioskReactor/conf/config.json | tr -d '"'`
minimalCreditToLock=`jq '.minimalCreditToLock' /home/pi/kioskReactor/conf/brand.json | tr -d '"'`
credit=`jq '.credit' /home/pi/kioskReactor/conf/brand.json | tr -d '"'`
blockWhenInsufficientCredit=`jq '.blockWhenInsufficientCredit' /home/pi/kioskReactor/conf/brand.json | tr -d '"'`
screenSize=`jq '.screenSize' /home/pi/kioskReactor/conf/device.json | tr -d '"'`
if [ screenSize == "null" ]; then
  screenSize="1360,768"
fi

DISPLAY=:0 xrandr --output HDMI-1 --rotate right
#DISPLAY=:0 xinput set-prop 'Windows pointer' "Coordinate Transformation Matrix" 0.000000, 1.000000, 0.000000, -1.000000, 0.000000, 1.000000, 0.000000, 0.000000, 1.000000

echo $url
echo $minimalCreditToLock
echo $credit
echo $minimalCreditToLock
echo $screenSize

launchBrowser() {
	echo $url
	sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'
	sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences
	chromium-browser --no-sandbox --kiosk --window-size=$screenSize --no-first-run --fast --fast-start --password-store=basic --disable-features=TouchpadOverscrollHistoryNavigation --disable-features=TranslateUI --noerrdialogs --incognito --disable-pinch --overscroll-history-navigation=0 --disable-infobars --remote-debugging-port=9222 $url &
}


launchSystem() {
	#chromium
	cd /home/pi/kioskReactor
	/home/pi/kioskReactor/launchSystem.sh
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
		url=file:///home/pi/kioskReactor/programs/pages/nocredit.html
		launchBrowser
	else
		url=https://us-central1-totemsystem-5889b.cloudfunctions.net/homePage/$deviceId
		launchBrowser
		launchSystem
	fi
fi

echo $url

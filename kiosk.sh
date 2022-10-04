#!/bin/bash
xset s noblank
xset s off
xset -dpms
xset s activate
xset s 1      
setterm -powersave off

unclutter -idle 0.5 -root &

sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/pi/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/pi/.config/chromium/Default/Preferences

url=`cat /home/pi/totemSystem/programs/config.json | jq -r '.launchUrl'`

/usr/bin/chromium-browser --noerrdialogs --kiosk --incognito --disable-pinch --overscroll-history-navigation=0 --disable-infobars --remote-debugging-port=9222 $url

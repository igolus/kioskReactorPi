#!/bin/bash

ONLINE=1
while [ $ONLINE -ne 0 ]
do
   ping -q -c 1 -w 1 www.google.com >/dev/null 2>&1
   ONLINE=$?
   if [ $ONLINE -ne 0 ]
     then
       sleep 2
   fi
done
echo "We are on line!"

cd /home/pi/kioskReactor/programs/jsScripts/init
sudo node startupInit.js lite

cd /home/pi/kioskReactor/programs/jsScripts/webSocket
sudo node wsServer.js &
cd /home/pi/kioskReactor/programs/jsScripts/commandsListener
sudo node commandLauncher.js &
cd /home/pi/kioskReactor/programs/PyScripts
sudo python3 usb-serial-reader.py &
sudo python3 inactivityMouseCheck.py &
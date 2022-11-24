#!/bin/bash
cd /home/pi/kioskReactor/programs/jsScripts/webSocket
sudo node wsServer.js &
cd /home/pi/kioskReactor/programs/jsScripts/commandsListener
sudo node commandLauncher.js &
cd /home/pi/kioskReactor/programs/PyScripts
sudo python3 usb-serial-reader.py &
sudo python3 inactivityMouseCheck.py &
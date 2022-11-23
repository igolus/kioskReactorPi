#!/bin/bash
export DISPLAY=:0.0

cd /home/pi/kioskReactor/programs/jsScripts/webSocket
sudo node wsServer.js &
cd /home/pi/kioskReactor/programs/jsScripts/commandsListener
sudo node commandLauncher.js &
cd /home/pi/kioskReactor/programs/PyScripts
sudo python3 usb-serial-reader.py &
sudo python3 takeASnap.py &
python3 playSound.py &
sudo python3 inactivityMouseCheck.py &
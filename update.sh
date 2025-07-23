#!/bin/sh
ps -W | awk '/chrome.exe/,NF=1' | xargs kill -f
ps -W | awk '/node.exe/,NF=1' | xargs kill -f
ps -W | awk '/node/,NF=1' | xargs kill -f

cd /cygdrive/c/kioskReactor/scriptUtil/Agent_Multi-Thread
chmod +x ./killer.bat
./killer.bat

git config --global http.sslVerify false
ansible-pull -U https://github.com/igolus/rocketKioskPi.git local-windows.yml
#chmod 777 /cygdrive/c/kioskReactor/programs/jsScripts/cmdmp3.exe

cd /cygdrive/c/kioskReactor/programs/jsScripts
npm install --build-from-source --force
chmod -R 777 /cygdrive/c/kioskReactor

# Should be migrated to a proper c/kioskReactor/scriptUtil/_command_list_apiborne/Update.bat
#cd /cygdrive/c/kioskReactor/scriptUtil/_command_list_apiborne
#chmod +x ./Reboot.bat
#./Reboot.bat

#!/bin/sh
ps -W | awk '/chrome.exe/,NF=1' | xargs kill -f
ps -W | awk '/node.exe/,NF=1' | xargs kill -f
ps -W | awk '/node/,NF=1' | xargs kill -f
git config --global http.sslVerify false
ansible-pull -U https://github.com/igolus/rocketKioskPi.git local-windows.yml
#chmod 777 /cygdrive/c/kioskReactor/programs/jsScripts/cmdmp3.exe

cd /cygdrive/c/kioskReactor/programs/jsScripts
npm install --build-from-source --force
#!/bin/sh
ansible-pull -U https://github.com/igolus/rocketKioskPi.git local-windows.yml
chmod 777 /cygdrive/c/kioskReactor/programs/jsScripts/cmdmp3.exe
cd /cygdrive/c/kioskReactor/programs/jsScripts
npm install --build-from-source --force
#!/bin/sh
ansible-pull -U https://github.com/igolus/rocketKioskPi.git local-windows.yml
chmod -R 777 /cygdrive/c/kioskReactor
cd /cygdrive/c/kioskReactor/programs/jsScripts
npm install --build-from-source --force

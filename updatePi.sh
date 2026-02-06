#!/bin/bash

# Kill le script de lancement et ses enfants
pkill -f "launchSystemPi.sh" 2>/dev/null
sleep 1

# Kill all node processes
killall -9 node 2>/dev/null
sleep 2

git config --global http.sslVerify false
ansible-pull -U https://github.com/igolus/rocketKioskPi.git local-pi.yml

cd $HOME/kioskReactor/programs/jsScripts
npm install --prefer-ipv4

chmod -R 755 $HOME/kioskReactor
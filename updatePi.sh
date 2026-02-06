#!/bin/bash

# Kill all node processes
killall -9 node 2>/dev/null

git config --global http.sslVerify false
ansible-pull -U https://github.com/igolus/rocketKioskPi.git local-pi.yml

cd $HOME/kioskReactor/programs/jsScripts
npm install --prefer-ipv4

chmod -R 755 $HOME/kioskReactor
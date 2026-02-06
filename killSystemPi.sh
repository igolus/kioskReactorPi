#!/bin/bash
echo "Killing all kioskReactor services..."

pkill -f "launchSystemPi.sh" 2>/dev/null
sleep 1
killall -9 node 2>/dev/null

echo "Done."
#!/bin/sh
# Kill bash processes first (to stop run_service loops from restarting services)
ps -W | awk '/bash.exe/,NF=1' | xargs kill -f

# Then kill the services
ps -W | awk '/chrome.exe/,NF=1' | xargs kill -f
ps -W | awk '/node.exe/,NF=1' | xargs kill -f
ps -W | awk '/node/,NF=1' | xargs kill -f
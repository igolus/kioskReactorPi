#!/bin/sh
ps -W | awk '/chrome.exe/,NF=1' | xargs kill -f
ps -W | awk '/node.exe/,NF=1' | xargs kill -f
ps -W | awk '/node/,NF=1' | xargs kill -f
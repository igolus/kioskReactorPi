import websocket;

#!/usr/bin/env python

import asyncio
import websockets
import json
import requests

urlWs = "ws://localhost:8080"

async def snap(globalExtId):
    message = "{\"commandType\": \"snap\"}"
    if (globalExtId != None):
        message = "{\"commandType\": \"snap\",  \"commandParam\":\"" + globalExtId[0] + "\"}"
    print(message)  
    if (globalExtId != None):
        print("globalExtId " + globalExtId[0])  
    async with websockets.connect(urlWs) as websocket:
        await websocket.send(message);
        
async def cancelSnap():
    message = "{\"commandType\": \"cancelsnap\"}"
    async with websockets.connect(urlWs) as websocket:
        await websocket.send(message);

async def triggerQrCode(code):
    message = "{\"eventType\": \"qrcode\",  \"eventValue\":\"" + code + "\"}"
    async with websockets.connect(urlWs) as websocket:
        await websocket.send(message);

async def triggerInactivity():
    message = "{\"commandType\": \"inactivity\"}"
    async with websockets.connect(urlWs) as websocket:
        await websocket.send(message);

def postQrCodeAsync(url, code):
    res = requests.post(url + "/" + code, False)
    print(res.content)

    with websockets.connect(urlWs) as websocket:
        websocket.send(str(res.content.decode()));

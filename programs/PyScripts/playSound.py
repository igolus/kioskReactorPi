import json
import pygame
import websocket
import _thread
import time
import os
import time

def on_message(ws, message):
	print(message)
	event = json.loads(message)
	commandType = event['commandType']
	if commandType == "playmp3":
		print(event['commandParam'])
		file = event['commandParam']
		pygame.mixer.init()
		filePath = "../jsScripts/" + file
		if os.path.exists(filePath):
			pygame.mixer.music.load(filePath)
			pygame.mixer.music.set_volume(1.0)
			pygame.mixer.music.play()
			os.remove(filePath)

def on_error(ws, error):
    raise error

def on_close(ws, close_status_code, close_msg):
	print("### closed ###")

def on_open(ws):
	print("Opened connection")

if __name__ == "__main__":
	init = False
	websocket.enableTrace(True)
	while not init:
		try:
			ws = websocket.WebSocketApp("ws://localhost:8080",
										on_open=on_open,
										on_message=on_message,
										on_error=on_error,
										on_close=on_close)

			ws.run_forever()  # Set dispatcher to automatic reconnection
			init = True;
		except:
			print("Cannot connect to web socket !!")
		time.sleep(3)

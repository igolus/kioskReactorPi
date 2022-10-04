from evdev import InputDevice, ecodes, list_devices, categorize
import signal, sys
import asyncio
import json
import time
import threading
import commod
import asyncio

lastCheck = time.time()

with open('../../conf/device.json') as f:
    device = json.load(f);

mouseDevice = device.get('mouseSystemDevPath')

with open('../../conf/project.json') as f:
    projectConf = json.load(f);

durationInactivityTouchScreen = projectConf.get('mouseSystemDevPath')

if durationInactivityTouchScreen is None:
    durationInactivityTouchScreen = 120

if mouseDevice is None:
    mouseDevice = "/dev/input/event3"

print(durationInactivityTouchScreen)
print(mouseDevice)


def signal_handler(signal, frame):
    print('Stopping')
    dev.ungrab()
    sys.exit(0)


def triggerInactivity():
    global lastCheck
    global loop
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    asyncio.get_event_loop().run_until_complete(commod.triggerInactivity())
    lastCheck = time.time()


def checkInactivity():
    now = time.time()
    diff = now - lastCheck
    # print(diff)
    if diff >= durationInactivityTouchScreen:
        triggerInactivity()
    threading.Timer(3, checkInactivity).start()


async def main():
    print("starting inactity check")
    global lastCheck
    if not projectConf['useInactivityTouchScreen']:
        print("InactivityTouchScreen not active")
        sys.exit()

    checkInactivity()
    dev = None
    # find usb hid device
    devices = map(InputDevice, list_devices())
    for device in devices:
        print(device.name, device.fn)
        if mouseDevice in device.fn:
            dev = InputDevice(device.fn)

    if dev is None:
        print('No mouse')
        sys.exit()

    signal.signal(signal.SIGINT, signal_handler)
    dev.grab()

    # process usb hid events and format barcode data
    barcode = ""
    try:
        for event in dev.read_loop():
            lastCheck = time.time()
            # print(event)

    except KeyboardInterrupt:
        dev.close()


asyncio.run(main())

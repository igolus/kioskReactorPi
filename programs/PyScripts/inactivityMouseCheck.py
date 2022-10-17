from __future__ import print_function

import re
import sys
import select
import atexit
import termios
import optparse
import json
import time
import threading
import commod
import asyncio

try:
    input = raw_input
except NameError:
    pass

from evdev import ecodes, list_devices, AbsInfo, InputDevice

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
    #print(diff)
    if diff >= durationInactivityTouchScreen:
        triggerInactivity()
    threading.Timer(3, checkInactivity).start()


def main():
    global lastCheck
    checkInactivity()
    devices = [InputDevice(mouseDevice)]

    print(str(devices))
    if not devices:
        devices = select_devices()
    else:
        devices = [InputDevice(path) for path in devices]

    if sys.stdin.isatty():
        toggle_tty_echo(sys.stdin, enable=False)
        atexit.register(toggle_tty_echo, sys.stdin, enable=True)

    print('Listening for events (press ctrl-c to exit) ...')
    fd_to_device = {dev.fd: dev for dev in devices}
    while True:
        r, w, e = select.select(fd_to_device, [], [])

        for fd in r:
            for event in fd_to_device[fd].read():
                lastCheck = time.time()
                #print(event)


def toggle_tty_echo(fh, enable=True):
    flags = termios.tcgetattr(fh.fileno())
    if enable:
        flags[3] |= termios.ECHO
    else:
        flags[3] &= ~termios.ECHO
    termios.tcsetattr(fh.fileno(), termios.TCSANOW, flags)


if __name__ == '__main__':
    try:
        ret = main()
    except (KeyboardInterrupt, EOFError):
        ret = 0
    sys.exit(ret)
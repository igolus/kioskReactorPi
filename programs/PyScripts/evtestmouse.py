# encoding: utf-8

'''
Usage: evtest [options] [<device>, ...]

Input device enumerator and event monitor.

Running evtest without any arguments will let you select
from a list of all readable input devices.

Options:
  -h, --help          Show this help message and exit.
  -c, --capabilities  List device capabilities and exit.
  -g, --grab          Other applications will not receive events from
                      the selected devices while evtest is running.

Examples:
  evtest /dev/input/event0 /dev/input/event1
'''


from __future__ import print_function

import re
import sys
import select
import atexit
import termios
import optparse
import commod
import time
import threading
import json
import asyncio

lastCheck = time.time()

with open('../../conf/project.json') as f:
    projectConf = json.load(f);

durationInactivityTouchScreen = projectConf.get('durationInactivityTouchScreen')

try:
    input = raw_input
except NameError:
    pass

from evdev import ecodes, list_devices, AbsInfo, InputDevice


def parseopt():
    parser = optparse.OptionParser(add_help_option=False)
    parser.add_option('-h', '--help', action='store_true')
    parser.add_option('-g', '--grab', action='store_true')
    parser.add_option('-c', '--capabilities', action='store_true')
    return parser.parse_args()

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
    threading.Timer(3,checkInactivity).start()


def main():
    checkInactivity()
    opts, devices = parseopt()
    if opts.help:
        print(__doc__.strip())
        return 0

    devices = [InputDevice(path) for path in devices]

    #if opts.capabilities:
    #    for device in devices:
    #        print_capabilities(device)
    #    return 0

    if opts.grab:
        for device in devices:
            device.grab()

    # Disable tty echoing if stdin is a tty.
    if sys.stdin.isatty():
        toggle_tty_echo(sys.stdin, enable=False)
        atexit.register(toggle_tty_echo, sys.stdin, enable=True)

    #print('Listening for events (press ctrl-c to exit) ...')
    fd_to_device = {dev.fd: dev for dev in devices}
    while True:
        r, w, e = select.select(fd_to_device, [], [])

        for fd in r:
            for event in fd_to_device[fd].read():
                global lastCheck
                lastCheck = time.time()


#def select_devices(device_dir='/dev/input'):
#    '''
#    Select one or more devices from a list of accessible input devices.
#    '''
#
#    def devicenum(device_path):
#        digits = re.findall(r'\d+$', device_path)
#        return [int(i) for i in digits]
#
#    devices = sorted(list_devices(device_dir), key=devicenum)
#    devices = [InputDevice(path) for path in devices]
#    if not devices:
#        msg = 'error: no input devices found (do you have rw permission on %s/*?)'
#        print(msg % device_dir, file=sys.stderr)
#        sys.exit(1)
#
#    dev_format = '{0:<3} {1.path:<20} {1.name:<35} {1.phys:<35} {1.uniq:<4}'
#    dev_lines = [dev_format.format(num, dev) for num, dev in enumerate(devices)]
#
#    print('ID  {:<20} {:<35} {:<35} {}'.format('Device', 'Name', 'Phys', 'Uniq'))
#    print('-' * len(max(dev_lines, key=len)))
#    print('\n'.join(dev_lines))
#    print()
#
#    choices = input('Select devices [0-%s]: ' % (len(dev_lines) - 1))
#
#    try:
#        choices = choices.split()
#        choices = [devices[int(num)] for num in choices]
#    except ValueError:
#        choices = None
#
#    if not choices:
#        msg = 'error: invalid input - please enter one or more numbers separated by spaces'
#        print(msg, file=sys.stderr)
#        sys.exit(1)
#
#    return choices


#def print_capabilities(device):
#    capabilities = device.capabilities(verbose=True)
#    input_props = device.input_props(verbose=True)
#
#    print('Device name: {.name}'.format(device))
#    print('Device info: {.info}'.format(device))
#    print('Repeat settings: {}\n'.format(device.repeat))
#
#    if ('EV_LED', ecodes.EV_LED) in capabilities:
#        leds = ','.join(i[0] for i in device.leds(True))
#        print('Active LEDs: %s' % leds)
#
#    active_keys = ','.join(k[0] for k in device.active_keys(True))
#    print('Active keys: %s\n' % active_keys)
#
#    if input_props:
#        print('Input properties:')
#        for type, code in input_props:
#            print('  %s %s' % (type, code))
#        print()
#
#    print('Device capabilities:')
#    for type, codes in capabilities.items():
#        print('  Type {} {}:'.format(*type))
#        for code in codes:
#            # code <- ('BTN_RIGHT', 273) or (['BTN_LEFT', 'BTN_MOUSE'], 272)
#            if isinstance(code[1], AbsInfo):
#                print('    Code {:<4} {}:'.format(*code[0]))
#                print('      {}'.format(code[1]))
#            else:
#                # Multiple names may resolve to one value.
#                s = ', '.join(code[0]) if isinstance(code[0], list) else code[0]
#                print('    Code {:<4} {}'.format(s, code[1]))
#        print('')


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
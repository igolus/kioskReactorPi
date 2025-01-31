# This demo code is issued by DSD TECH Team exclusively for the SH-UR01A USB Relay
import glob
import sys

import serial  # pip install pyserial
import time
import serial.tools.list_ports


def serial_ports():
    """ Lists serial port names

        :raises EnvironmentError:
            On unsupported or unknown platforms
        :returns:
            A list of the serial ports available on the system
    """
    if sys.platform.startswith('win'):
        ports = ['COM%s' % (i + 1) for i in range(256)]
    elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
        # this excludes your current terminal "/dev/tty"
        ports = glob.glob('/dev/tty[A-Za-z]*')
    elif sys.platform.startswith('darwin'):
        ports = glob.glob('/dev/tty.*')
    else:
        raise EnvironmentError('Unsupported platform')

    result = []
    for port in ports:
        try:
            s = serial.Serial(port)
            s.close()
            result.append(port)
        except (OSError, serial.SerialException):
            pass
    return result



ports_list = list(serial.tools.list_ports.comports())
ports = serial_ports()


if len(ports_list) <= 0:
    print("no serial port")
else:
    print("serial port as follow:")
    for comport in ports_list:
        print(list(comport)[0], list(comport)[1])

# Modifiez ici le nom du port série selon votre configuration (ex. 'COM10' sous Windows)
# ser = serial.Serial('COM10', 9600, timeout=0.5)
#
# if ser.is_open:
#     print("open success")
#     print(ser.name)
# else:
#     print("open failed")
#
# # Relay Off
# myLen = ser.write(b'AT+CH1=0')
# time.sleep(3)
#
# # Relay ON
# myLen = ser.write(b'AT+CH1=1')
#
# ser.close()
# print("serial close")

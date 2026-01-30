const conf = require('../../../conf/config.json');
var SerialPort;
var serialportInstance = null;
const {loggerCommand} = require("../util/loggerUtil");

try {
    sportData = require("serialport");
    SerialPort = sportData.SerialPort;
    if (conf.comPort) {
        serialportInstance = new SerialPort({ path: conf.comPort, baudRate: 9600 }, function (err) {
            if (err) {
                loggerCommand.error('Error open serialport:', err.message);
                serialportInstance = null;
            } else {
                loggerCommand.info('Serial port opened successfully on ' + conf.comPort);
            }
        });

        // Handle async errors to prevent process crash
        serialportInstance.on('error', function(err) {
            loggerCommand.error('Serial port error:', err.message);
        });
    } else {
        loggerCommand.warn('No comPort configured in config.json');
    }
}
catch (error) {
    loggerCommand.error('Unable to create serialport:', error.message);
    serialportInstance = null;
}


function turnRelayOff() {
    try {
        if (!serialportInstance) {
            loggerCommand.error('Serial port not initialized - cannot turn relay off');
            return;
        }
        serialportInstance.write('AT+CH1=0', (err) => {
            if (err) {
                loggerCommand.error('Error writing to serial port:', err.message);
            }
        });
    }
    catch (error) {
        console.log(error)
        loggerCommand.error('Error turnRelayOff:', error.message);
    }
}

function turnRelayOn() {
    try {
        if (!serialportInstance) {
            loggerCommand.error('Serial port not initialized - cannot turn relay on');
            return;
        }
        serialportInstance.write('AT+CH1=1', (err) => {
            if (err) {
                loggerCommand.error('Error writing to serial port:', err.message);
            }
        });
    }
    catch (error) {
        console.log(error)
        loggerCommand.error('Error turnRelayOn:', error.message);
    }
}

// Export des deux fonctions
module.exports = {
    turnRelayOff,
    turnRelayOn
};

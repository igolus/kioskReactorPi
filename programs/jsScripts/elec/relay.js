const conf = require('../../../conf/config.json');
var SerialPort;
var serialportInstance;
const {loggerCommand} = require("../util/loggerUtil");

try {
    sportData = require("serialport");
    SerialPort = sportData.SerialPort;
    serialportInstance = new SerialPort({ path: conf.comPort, baudRate: 9600 }, function (err) {
        if (err) {
            loggerCommand.error('Error open serialport:', err.message);
        }
    });
}
catch (error) {
    loggerCommand.error('unbale to create serialport:', error.message);
}


function turnRelayOff() {
    try {
        serialportInstance.write('AT+CH1=0');
    }
    catch (error) {
        console.log(e)
        loggerCommand.error('Error turnRelayOff:', error.message);
    }
}

function turnRelayOn() {
    try {
        serialportInstance.write('AT+CH1=1');
    }
    catch (error) {
        console.log(e)
        loggerCommand.error('Error turnRelayOff:', error.message);
    }
}

// Export des deux fonctions
module.exports = {
    turnRelayOff,
    turnRelayOn
};

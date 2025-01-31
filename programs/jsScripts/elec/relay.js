const {SerialPort} = require("serialport");
const conf = require('../../../conf/config.json');
const serialport = new SerialPort({ path: conf.comPort, baudRate: 9600 })

function turnRelayOff() {

    serialport.write('AT+CH1=0');
    // serialport.close();
}

function turnRelayOn() {
    // const serialport = new SerialPort({ path: portName, baudRate: 9600 })
    serialport.write('AT+CH1=1');
    // serialport.close();
}

// Export des deux fonctions
module.exports = {
    turnRelayOff,
    turnRelayOn
};

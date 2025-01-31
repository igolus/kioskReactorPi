// testRelay.js
const { turnRelayOff, turnRelayOn } = require('./elec/relay');
const {SerialPort} = require("serialport");

// Nom du port série (adapté à votre configuration, ex: COM10, COM4, etc.)
const portName = 'COM3';

async function main() {
    try {

        var value = await SerialPort.list();
        console.log('ports: ' + JSON.stringify(value));
        // console.log('Éteindre le relais...');
        // turnRelayOff(portName);
        // turnRelayOn(portName);
        //
        // // Attente de 3 secondes (optionnel)
        // await new Promise(res => setTimeout(res, 3000));
        //
        // console.log('Allumer le relais...');
        // await turnRelayOn(portName);

    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

main();
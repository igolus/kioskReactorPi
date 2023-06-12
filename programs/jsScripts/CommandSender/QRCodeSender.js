var keypress = require('keypress');
const {sendEvent} = require("./SendEventUtil");
const {eventTypeQrCode, buildEventJson} = require("../webSocket/eventTypes");

keypress(process.stdin);

let buffer = "";

function sendQrCode(buffer) {
    sendEvent(buildEventJson(eventTypeQrCode, buffer))
}

process.stdin.on('keypress', function (ch, key) {
    console.log('got "keypress"', key);
    console.log('got "char"', ch);
    buffer += ch;
    if (key && key.name === 'return') {
        sendQrCode(buffer)
        buffer = "";
    }

    if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
    }

});

process.stdin.setRawMode(true);
process.stdin.resume();

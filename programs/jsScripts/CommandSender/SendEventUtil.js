const WebSocket = require("ws");
const config = require("../../../conf/config.json");
const {buildEventJson, eventTypeSnapReady, eventTypeQrCode} = require("../webSocket/eventTypes");


const sendEvent = (event) => {
    try {
        const wsLocalSocket = new WebSocket(config.urlWsLocal);
        wsLocalSocket.onopen = function(open) {
            wsLocalSocket.send(event, {binary: true});
            wsLocalSocket.close()
        }
    }
    catch (err) {
        console.log(err);
    }

}

module.exports = {
    sendEvent: sendEvent
}


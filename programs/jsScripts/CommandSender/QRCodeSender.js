const WebSocket = require("ws");
const config = require("../../../conf/config.json");
const {buildEventJson, eventTypeSnapReady, eventTypeQrCode} = require("../webSocket/eventTypes");
const wsLocalSocket = new WebSocket(config.urlWsLocal);


wsLocalSocket.onopen = function(open) {
    wsLocalSocket.send(buildEventJson(eventTypeQrCode, "toto"), {binary: true});
    wsLocalSocket.close()
}



const WebSocket = require("ws").Server;
const HttpsServer = require('http').createServer;
const server = HttpsServer()
const config = require('../../../conf/config.json');
const axios = require('axios');
const {loggerWs} = require("../util/loggerUtil");
const {getCurrentDevice} = require("../dbUtil/deviceUtil");
const {getCurrentProject} = require("../dbUtil/projectUtil");
const {eventTypeQrCode, eventTypeSnapReady, eventTypeInactivity, eventTypePaymentDone} = require("./eventTypes");
const {commandTypeReboot, commandTypeOpenUrl, commandTypeUpdate,
    commandTypePrintTicket, commandTypeSpeak, internalCommandTypePlayMp3, internalCommandTypeSnap,
    internalCommandTypeCancelSnap, internalCommandTypeInactivity, commandTypeDeployWebSite, commandTypeNGrok,
    commandTypePrintFromUrl, commandTypeOpenRelay, commandTypeCloseRelay,
    commandTypeSsh, commandTypeUploadLogs, commandTypeUploadDmpLogs,
} = require("./commandTypes");
const {listenToEvents, listenToCommands} = require("../dbUtil/eventsUtil");
require('../util/healthChecker')
const {readConfig, writeDeviceAndProjectConfig, writeConfig} = require("../util/configFileUtil");

const wsSocket =new WebSocket({
    server: server,
});
getCurrentDevice().then(device => {
    if (!device) {
        return;
    }

    listenToEvents(device.id, (event) => {
        //checkData(dataJson)
        if (checkData(event)) {
            broadCastMessage(wsSocket, event)
            triggerWebHook(wsSocket, event, currentProject.webHookEventUrl)
        }
    })
    listenToCommands(device.id, (command) => {
        broadCastMessage(wsSocket, command);
    })
})


const allCommands = [commandTypeOpenUrl, commandTypeReboot, commandTypeUpdate,
    commandTypePrintTicket, commandTypeSpeak, internalCommandTypePlayMp3,
    internalCommandTypeSnap, internalCommandTypeCancelSnap, internalCommandTypeInactivity,
    commandTypeDeployWebSite, commandTypeNGrok, commandTypeSsh, commandTypePrintFromUrl,
    commandTypeOpenRelay, commandTypeCloseRelay, commandTypeUploadLogs, commandTypeUploadDmpLogs]

const noParamCommands = [commandTypeReboot, internalCommandTypeInactivity,
    internalCommandTypeSnap, internalCommandTypeCancelSnap, commandTypeDeployWebSite,
    commandTypeUpdate, commandTypeOpenRelay, commandTypeCloseRelay, commandTypeUploadLogs, commandTypeUploadDmpLogs]

const noParamEvents = [eventTypeInactivity]

const allEvents = [eventTypeQrCode, eventTypeSnapReady, eventTypeInactivity, eventTypePaymentDone]
let device;
let currentProject;

function checkData(data) {
    const command = data;
    console.log(JSON.stringify(command, null, 2))
    if ((!command.commandType || (!command.commandParam && !noParamCommands.includes(command.commandType) ))
        && (!command.eventType || (!command.eventValue && !noParamEvents.includes(command.eventType))  )) {
        loggerWs.info("cond1")
        return false;
    }
    if ((typeof command.commandType !== "string" || (command.commandParam && typeof command.commandParam !== "string")) &&
        (typeof command.eventType !== "string" || (command.eventValue && typeof command.eventValue !== "string"))
    ) {
        loggerWs.info("cond2")
        return false;
    }
    if (!allCommands.includes(command.commandType && command.commandType.toLowerCase())
        && !allEvents.includes(command.eventType && command.eventType.toLowerCase())) {
        loggerWs.info("cond3")
        return false;
    }
    return true;
}

loggerWs.info("WS Server running on 8080 ")

function broadCastMessage(ws, message) {
    wsSocket.clients.forEach(function each(client) {
        //console.log("client.readyState " + client.readyState)
        if (client.readyState === 1) {
            loggerWs.info("sending to client " + client + " DATA:" + JSON.stringify(message));
            client.send(JSON.stringify(message), {binary: true});
        }
    });
}

function triggerWebHook(ws, dataJson, webHookUrl) {
    if (webHookUrl) {
        const headers = {
            'Content-Type': 'application/json',
            'deviceId': config.deviceId,
            'Authorization': currentProject.authKey
        }
        loggerWs.info('Sending data to ' + webHookUrl);
        loggerWs.info('data ' + JSON.stringify(dataJson, null, 2));
        axios.post(webHookUrl, dataJson, {
            headers: headers
        })
            .then(response => {
                loggerWs.info("Reponse webhook " + JSON.stringify(response.data));
                let dataResp = response.data;
                if (dataResp && Array.isArray(response.data)) {
                    dataResp.forEach(item => broadCastMessage(ws, item))
                }
            })
            .catch(error => {
                loggerWs.error('Unable to trigger webhook', error);
            });
    }

}


wsSocket.on('connection', function connection(ws) {
    //console.log("connection done ")
    ws.on('message', function incoming(data, isBinary, ) {
        if (data.toString() === "") {
            return;
        }
        let goodMessage = true;
        let dataJson;
        try {
            dataJson = JSON.parse(data.toString());
            loggerWs.info("dataJson " + JSON.stringify(dataJson));
            if (!checkData(dataJson)) {
                loggerWs.error("Bad format message");
                goodMessage = false;
            }
        }
        catch (err) {
            loggerWs.error(err);
            goodMessage = false;
        }
        if (goodMessage) {
            try {
                let typeCommand = dataJson.commandType;
                let typeEvent = dataJson.eventType;

                if (typeCommand) {
                    loggerWs.info("BroadCast event ")
                    broadCastMessage(ws, dataJson, isBinary);
                } else if (typeEvent) {
                    loggerWs.info("Trigger webhook")
                    broadCastMessage(ws, dataJson, isBinary)
                    if (currentProject && currentProject.webHookEventUrl && currentProject.webHookEventUrl != "") {
                        triggerWebHook(ws, dataJson, currentProject.webHookEventUrl)
                    }

                }
            }
            catch (err)
            {
                loggerWs.error(err);
            }
        }

    });
});

// let isLite = myArgs.length > 0 && myArgs[0].toLowerCase() === 'lite';

(async () => {
    device = await getCurrentDevice();
    currentProject = await getCurrentProject(device)
    server.listen(8080);
    // let conf = readConfig();
    // conf.wsInit = 1;
    // await writeConfig(conf);
})();


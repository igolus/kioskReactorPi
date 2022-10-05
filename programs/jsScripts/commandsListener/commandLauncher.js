const {startSeverAndConfigureListening, delay} = require("./commandUtil");
const WebSocket = require("ws");
const axios = require('axios')
const {loggerCommand} = require("../util/loggerUtil");
const {getOpenUrlCommand, geRebootCommand,
    getUpdateCommand, getTicketCommand,
    getSpeakCommand, getSnapCommand, getCancelSnapCommand, getInactivityCommand, getDeployWebSiteCommand
} = require("../webSocket/actionUtil");
const {exec, spawn} = require("child_process");
const {getCurrentDevice} = require("../dbUtil/deviceUtil");
const {getCurrentProject} = require("../dbUtil/projectUtil");
const {execPrintTicket} = require("./printUtil");
const {speak} = require("./textToSpeech");
const {uploadSnap} = require("./snapUtil");
const {inactivityCommand} = require("./inactivityCommand");
const {deployWebSiteCommand} = require("./deployWebSiteCommand");
const localChromeDebuggerServerJsonCheck = 'http://127.0.0.1:9222/json';
const versionUtil = require('../dbUtil/versionUtil')
const deviceUtil = require('../dbUtil/deviceUtil')

const updatingUrl = "file:///home/pi/rocketKiosk/programs/pages/updating.html";
const deploySiteUrl = "file:///home/pi/rocketKiosk/programs/pages/deploySite.html";
const defaultUrl = "file:///home/pi/rocketKiosk/programs/pages/default.html";

// TEST ANSIBLE2
let wsChromeSocket;
let device;
let project;
let lastUrl;
let currentUrl;

function chromeNavigateHome(project) {
    if (project.homePageUrl) {
        chromeNavigate(project.homePageUrl)
    }
    else {
        chromeNavigate(defaultUrl)
    }
}

function chromeNavigateBack(project) {
    loggerCommand.info("lastUrl: " + lastUrl)
    if (lastUrl) {
        chromeNavigate(lastUrl)
    }
    else {
        chromeNavigateHome(project);
    }
}

function chromeNavigate(openUrl) {
    lastUrl = currentUrl;
    currentUrl = openUrl;

    if (openUrl && wsChromeSocket && wsChromeSocket.readyState === WebSocket.OPEN) {
        const dataChangeUrl = {
            id: 2,
            method: "Page.navigate",
            params: {
                url: openUrl
            }
        }
        loggerCommand.info("Change url " + openUrl);
        wsChromeSocket.send(JSON.stringify(dataChangeUrl))
    }
}

function execCommand(command, callBackDone) {
    loggerCommand.info("running command: " + command);
    try {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                loggerCommand.error(error)
                return;
            }
            if (stderr) {
                loggerCommand.error(stderr)
                return;
            }
            if (stdout) {
                loggerCommand.info(stdout)
            }
            loggerCommand.info(`command Done`);
            if (callBackDone) {
                callBackDone()
            }
        });
    } catch (error) {
        loggerCommand.error("Unable to rune command " + error)
    }
}

function updateDevice(device) {
    loggerCommand.info(`reboot !!`);
    chromeNavigate(updatingUrl)
    //ws.send(buildCommandJson(commandTypeOpenUrl, updatingUrl), {binary: true});
    let command = "sudo ansible-pull --extra-vars \"user=pi\" -U https://github.com/igolus/rocketKioskPi.git"
    let commandReboot = "sudo reboot"
    execCommand(command, () => {
        versionUtil.getVersion().then(versionItem => {
            console.log("versionItem " + JSON.stringify(versionItem))
            device.version =  versionItem.version;
            deviceUtil.updateDevice(device).then(data => {
                execCommand(commandReboot);
            })
        })
    });
}

function rebootDevice() {
    loggerCommand.info(`reboot !!`);
    execCommand("sudo reboot");
}

function printTicket(ticketSourceCode) {
    loggerCommand.info(`print Ticket !!`);
    execPrintTicket(device.localPrinterIp, ticketSourceCode);
}


function onEvent(dataJSON, ws, device, project) {
    loggerCommand.info("data JSON " + JSON.stringify(dataJSON))
    let openUrl = getOpenUrlCommand(dataJSON);
    if (openUrl) {
        chromeNavigate(openUrl);
    }
    const reboot = geRebootCommand(dataJSON);
    if (reboot) {
        rebootDevice();
    }
    const update = getUpdateCommand(dataJSON);
    if (update) {
        updateDevice(device);
    }
    const ticketSourceCode = getTicketCommand(dataJSON);
    if (ticketSourceCode) {
        printTicket(ticketSourceCode);
    }

    const snap = getSnapCommand(dataJSON);
    if (snap) {
        uploadSnap(ws, device, dataJSON);
    }

    const cancelSnap = getCancelSnapCommand(dataJSON);
    if (cancelSnap) {
        chromeNavigateBack(project)
    }

    const inactivity = getInactivityCommand(dataJSON);
    if (inactivity) {
        inactivityCommand (project, ws, chromeNavigate);
    }

    const deployWebSite = getDeployWebSiteCommand(dataJSON);
    if (deployWebSite) {
        chromeNavigate(deploySiteUrl);
        deployWebSiteCommand (project, chromeNavigateHome);
        chromeNavigateHome(project);
    }

    const textSpeak = getSpeakCommand(dataJSON);
    if (textSpeak) {
        speak(textSpeak, ws, project).then(() => {
            console.log("Speak");
        });
    }
}


// (async () => {
//     device = await getCurrentDevice();
//     project = await getCurrentProject(device)
//     await startSeverAndConfigureListening(onEvent, device, project);
// })();

if (process.argv.length > 2 && process.argv[2] === "local") {
    (async () => {
        device = await getCurrentDevice();
        project = await getCurrentProject(device)
        await startSeverAndConfigureListening(onEvent, device, project);
    })();
}
else {
    (async () => {
        let init = false;
        device = await getCurrentDevice();
        project = await getCurrentProject(device);
        while (!init) {
            try {
                const resChrome = await axios.get(localChromeDebuggerServerJsonCheck);
                const data = resChrome.data;
                if (data.length > 0) {
                    const firstTab = data[0];
                    const wsUrl = firstTab.webSocketDebuggerUrl;
                    wsChromeSocket = new WebSocket(wsUrl);
                    loggerCommand.info("wsChromeSocket opened " + wsUrl)
                    init = true;
                    await startSeverAndConfigureListening(onEvent, device, project);
                } else {
                    loggerCommand.info("No tabs open " + resp.data)
                }
            } catch (err) {
                loggerCommand.info("Unable to communicate with chrome", err);
                //return;
            }
            await delay(1000)
        }

    })();
}
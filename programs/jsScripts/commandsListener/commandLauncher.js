const {startSeverAndConfigureListening, delay} = require("./commandUtil");
const WebSocket = require("ws");
const axios = require('axios')
const {loggerCommand} = require("../util/loggerUtil");
const {getOpenUrlCommand, geRebootCommand,
    getUpdateCommand, getTicketCommand,
    getSpeakCommand, getSnapCommand, getCancelSnapCommand, getInactivityCommand, getDeployWebSiteCommand,
    getTicketCommandTargetIp
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
const localChromeDebuggerServerJsonCheckWin = 'http://localhost:9222/json';
const versionUtil = require('../dbUtil/versionUtil')
const deviceUtil = require('../dbUtil/deviceUtil')

const updatingUrl = "https://totemsystem-5889b.web.app/static/updating.html";
const deploySiteUrl = "https://totemsystem-5889b.web.app/static/deploySite.html";
const defaultUrl = "https://totemsystem-5889b.web.app/static/default.html";
const conf = require('../../../conf/config.json');
const {execCommand} = require("../util/commandUtil");

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


function updateVersionAndReboot(device) {
    try {
        versionUtil.getVersion().then(versionItem => {
            console.log("versionItem " + JSON.stringify(versionItem))
            device.version = versionItem.version;
            deviceUtil.updateDevice(device).then(data => {
                try {
                    rebootDevice()
                } catch (err) {
                    loggerCommand.error("unable to update device version")
                }
            })
        })
    } catch (err) {
        loggerCommand.error("unable to get version")
    }
}

function updateDevice(device) {
    loggerCommand.info(`reboot !!`);
    chromeNavigate(updatingUrl)
    let command;
    let commandReboot;

    if (conf.windows) {
        command = "c:\\cygwin64\\bin\\bash.exe C:\\kioskReactor\\update.sh"
        commandReboot = "shutdown /r"
    }
    else {
        command = "sudo ansible-pull --extra-vars \"user=pi\" -U https://github.com/igolus/rocketKioskPi.git"
        commandReboot = "sudo reboot"
    }

    execCommand(command, () => {
        updateVersionAndReboot(device);
    }, () => {
        updateVersionAndReboot(device);
    });

}

function rebootDevice() {
    loggerCommand.info(`reboot !!`);
    if (conf.windows) {
        execCommand("shutdown /r");
    }
    else {
        execCommand("sudo reboot");
    }

}

function printTicket(ticketSourceCode) {
    loggerCommand.info(`print Ticket !!`);
    loggerCommand.info(ticketSourceCode);
    loggerCommand.info(device.localPrinterIp);
    execPrintTicket(device.localPrinterIp, ticketSourceCode, false, device);
}

function printTicketTargetIp(ticketWithIpTarget) {
    // source: decode,
    //     ip: input.commandContext

    loggerCommand.info(`print Ticket !! on ip ` + ticketWithIpTarget.ip);
    execPrintTicket(ticketWithIpTarget.ip, ticketWithIpTarget.source, true, device);
}


function onEvent(dataJSON, ws, device, project) {
    loggerCommand.info("data JSON " + JSON.stringify(dataJSON))
    let openUrl = getOpenUrlCommand(dataJSON);
    if (openUrl && !device.lite) {
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

    const ticketWithIpTarget = getTicketCommandTargetIp(dataJSON);
    if (ticketWithIpTarget) {
        printTicketTargetIp(ticketWithIpTarget);
    }

    const snap = getSnapCommand(dataJSON);
    if (snap && !device.lite) {
        uploadSnap(ws, device, dataJSON);
    }

    const cancelSnap = getCancelSnapCommand(dataJSON);
    if (cancelSnap && !device.lite) {
        chromeNavigateBack(project)
    }

    const inactivity = getInactivityCommand(dataJSON);
    if (inactivity) {
        inactivityCommand (project, ws, chromeNavigate);
    }

    const deployWebSite = getDeployWebSiteCommand(dataJSON);
    if (deployWebSite) {
        chromeNavigate(deploySiteUrl);
        deployWebSiteCommand (project, device, chromeNavigateHome);
        chromeNavigateHome(project);
    }

    const textSpeak = getSpeakCommand(dataJSON);
    if (textSpeak) {
        speak(textSpeak, ws, project).then(() => {
            console.log("Speak");
        });
    }
}

console.log("START")

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
        console.log(JSON.stringify(device))
        if (device.lite) {
            await startSeverAndConfigureListening(onEvent, device, project);
        }
        else {
            while (!init) {
                try {
                    //const resChrome = await axios.get(conf.windows ? localChromeDebuggerServerJsonCheckWin : localChromeDebuggerServerJsonCheck);
                    const resChrome = await axios.get("http://127.0.0.1:9222/json");
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
        }

    })();
}


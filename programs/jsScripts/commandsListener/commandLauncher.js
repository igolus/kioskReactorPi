const {startSeverAndConfigureListening, delay} = require("./commandUtil");
const WebSocket = require("ws");
const axios = require('axios')
const {loggerCommand} = require("../util/loggerUtil");
const {getOpenUrlCommand, geRebootCommand,
    getUpdateCommand, getTicketCommand,
    getSpeakCommand, getSnapCommand, getCancelSnapCommand, getInactivityCommand, getDeployWebSiteCommand,
    getTicketCommandTargetIp, getNGrokCommand, getPrintFromUrlCommand, getOpenRelayCommand, getCloseRelayCommand,
    getSshCommand, getUploadLogsCommand, getUploadDmpLogsCommand
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
const {startNGrok, stopNGrok} = require("./ngrok");
const {turnRelayOn, turnRelayOff} = require("../elec/relay");
const {uploadLogs, uploadDmpLogs} = require("./logUtil");

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
        try {
            wsChromeSocket.send(JSON.stringify(dataChangeUrl));
        } catch (err) {
            loggerCommand.error("Failed to send to Chrome: " + err.message);
        }
    }
}

function printFromUrl(url) {
    if (url) {
        //printFromUrlCommand(device, url)
        //loggerCommand.info("print from url " + url);
        // wsChromeSocket.send(JSON.stringify(dataChangeUrl))
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
            }).catch((err) => {
                console.log("error")
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
        execCommand("shutdown /r /t 0 /f");
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
    loggerCommand.info(`print Ticket !! on ip ` + ticketWithIpTarget.ip);
    execPrintTicket(ticketWithIpTarget.ip, ticketWithIpTarget.source, true, device);
}

function openRelay() {
    loggerCommand.info(`openRelay`);
    turnRelayOn();
}

function closeRelay() {
    loggerCommand.info(`closeRelay`);
    turnRelayOff();
}

function onEvent(dataJSON, ws, device, project) {
    loggerCommand.info("data JSON " + JSON.stringify(dataJSON))
    let openUrl = getOpenUrlCommand(dataJSON);
    if (openUrl && !device.lite) {
        chromeNavigate(openUrl);
    }

    if (getUploadDmpLogsCommand(dataJSON)) {
        uploadDmpLogs(device);
    }

    if (getUploadLogsCommand(dataJSON)) {
        uploadLogs(device);
    }

    if (getOpenRelayCommand(dataJSON)) {
        openRelay();
    }

    if (getCloseRelayCommand(dataJSON)) {
        closeRelay();
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

    // const upload = getSnapCommand(dataJSON);
    // if (snap && !device.lite) {
    //     uploadSnap(ws, device, dataJSON);
    // }

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
        speak(textSpeak, ws, project)
            .then(() => {
                loggerCommand.info("Speak completed");
            })
            .catch((err) => {
                loggerCommand.error("Speak failed: " + err.message);
            });
    }

    const printUrl = getPrintFromUrlCommand(dataJSON);
    if (printUrl) {
        printFromUrl(printUrl);
    }

    const ngrokParam = getNGrokCommand(dataJSON);
    if (ngrokParam === "start") {
        startNGrok()
    }
    if (ngrokParam === "stop") {
        stopNGrok()
    }

    const sshParam = getSshCommand(dataJSON);
    if (sshParam === "start") {
        startNGrok(22)
    }
}

console.log("START")

// Helper function to load configuration with retry and graceful degradation
async function loadConfiguration(maxAttempts = 5) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            loggerCommand.info(`Attempting to load device configuration (attempt ${attempt}/${maxAttempts})`);
            const device = await getCurrentDevice();

            if (!device) {
                loggerCommand.warn(`Device configuration not found (attempt ${attempt}/${maxAttempts})`);
                if (attempt < maxAttempts) {
                    await delay(5000 * attempt); // Increasing delay
                    continue;
                }
                throw new Error("Device configuration not found after all retries");
            }

            loggerCommand.info("Device configuration loaded successfully: " + device.id);

            try {
                const project = await getCurrentProject(device);
                if (project) {
                    loggerCommand.info("Project configuration loaded successfully");
                } else {
                    loggerCommand.warn("Project configuration not found - running with device config only");
                }
                return { device, project };
            } catch (projectError) {
                loggerCommand.warn("Failed to load project configuration: " + projectError.message);
                loggerCommand.info("Continuing with device configuration only");
                return { device, project: null };
            }

        } catch (error) {
            lastError = error;
            loggerCommand.error(`Failed to load configuration (attempt ${attempt}/${maxAttempts}): ${error.message}`);

            if (attempt < maxAttempts) {
                const delayMs = 5000 * attempt;
                loggerCommand.info(`Retrying in ${delayMs}ms...`);
                await delay(delayMs);
            }
        }
    }

    // All attempts failed
    loggerCommand.error("CRITICAL: Unable to load device configuration after all attempts");
    loggerCommand.error("Last error: " + (lastError ? lastError.message : "unknown"));
    loggerCommand.info("System will continue in degraded mode - some features may not work");

    // Return minimal configuration to allow system to continue
    return {
        device: {
            id: conf.deviceId || "unknown",
            lite: true,  // Force lite mode if can't connect to Firebase
            offline: true  // Flag to indicate offline mode
        },
        project: null
    };
}

if (process.argv.length > 2 && process.argv[2] === "local") {
    (async () => {
        try {
            const config = await loadConfiguration();
            device = config.device;
            project = config.project;
            await startSeverAndConfigureListening(onEvent, device, project);
        } catch (err) {
            loggerCommand.error("Fatal error during local startup: " + err.message);
            process.exit(1);
        }
    })();
}
else {
    (async () => {
        try {
            // Load configuration with retry logic
            const config = await loadConfiguration();
            device = config.device;
            project = config.project;

            console.log(JSON.stringify(device))

            if (device.lite || device.offline) {
                loggerCommand.info("Starting in lite/offline mode - no Chrome automation");
                await startSeverAndConfigureListening(onEvent, device, project);
            }
            else {
                let init = false;
                loggerCommand.info("Starting in full mode - waiting for Chrome to be available");

                while (!init) {
                    try {
                        // const resChrome = await axios.get(conf.windows ? localChromeDebuggerServerJsonCheckWin : localChromeDebuggerServerJsonCheck);
                        const resChrome = await axios.get("http://127.0.0.1:9222/json");
                        const data = resChrome.data;
                        if (data.length > 0) {
                            const firstTab = data[0];
                            const wsUrl = firstTab.webSocketDebuggerUrl;
                            wsChromeSocket = new WebSocket(wsUrl);
                            wsChromeSocket.on('error', (err) => {
                                loggerCommand.error("Chrome WebSocket error: " + err.message);
                            });
                            wsChromeSocket.on('close', () => {
                                loggerCommand.info("Chrome WebSocket closed");
                            });
                            loggerCommand.info("wsChromeSocket opened " + wsUrl)
                            init = true;
                            await startSeverAndConfigureListening(onEvent, device, project);
                        } else {
                            loggerCommand.info("No tabs open in Chrome")
                        }
                    } catch (err) {
                        loggerCommand.info("Unable to communicate with Chrome, retrying...");
                    }
                    await delay(1000)
                }
            }
        } catch (err) {
            loggerCommand.error("Fatal error during startup: " + err.message);
            loggerCommand.error(err.stack);
            // Don't exit - let system continue in degraded mode
            loggerCommand.info("Attempting to continue in emergency mode...");
            try {
                device = { id: conf.deviceId || "unknown", lite: true, offline: true, emergency: true };
                project = null;
                await startSeverAndConfigureListening(onEvent, device, project);
            } catch (emergencyErr) {
                loggerCommand.error("Emergency mode also failed: " + emergencyErr.message);
                process.exit(1);
            }
        }
    })();
}


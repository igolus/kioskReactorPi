const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const {loggerCommand} = require("../util/loggerUtil");
var esprima = require('esprima');
const { exec } = require('child_process');

let isRestartingService = false;

const restartEpsonService = () => {
    if (isRestartingService) {
        loggerCommand.info("Service restart already in progress, skipping...");
        return;
    }

    const serviceName = "EPSON_Port_Communication_Service";

    loggerCommand.info(`Stopping ${serviceName}...`);
    exec(`net stop "${serviceName}"`, (errStop, stdoutStop, stderrStop) => {
        // Attendre 1 seconde que le service soit bien arrêté
        setTimeout(() => {
            loggerCommand.info(`Starting ${serviceName}...`);
            exec(`net start "${serviceName}"`, (errStart, stdoutStart, stderrStart) => {
                if (errStart && !errStart.message.includes("d�j� �t� d�marr�") && !errStart.message.includes("already been started")) {
                    loggerCommand.error("Service start error: " + errStart.message);
                } else {
                    loggerCommand.info("EPSON service restarted successfully");
                }
            });
        }, 1000);
    });
};


const execPrintTicket = async (ip, sourceCode, useIp, device) => {
    try {
        loggerCommand.info("execPrintTicket start")
        loggerCommand.info(sourceCode)
        let printer;
        if (device.usbDevice && !useIp) {
            printer = new ThermalPrinter({
                type: PrinterTypes.EPSON,                                  // Printer type: 'star' or 'epson'
                interface: ip,                                              // Printer interface
                driver: require('printer'),
                characterSet: 'SLOVENIA',                                 // Printer character set - default: SLOVENIA
                removeSpecialCharacters: false,                           // Removes special characters - default: false
                lineCharacter: "=",                                       // Set character for lines - default: "-"
                options: {                                                 // Additional options
                    timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
                }
            });
        }
        else {
            if (sourceCode && useIp) {
                sourceCode = sourceCode.substring(1);
                sourceCode = sourceCode.slice(0, -1);
                sourceCode = sourceCode.replaceAll("\\n", "\n");
                sourceCode = sourceCode.replaceAll("\\\"", "\"");
            }
            printer = new ThermalPrinter({
                type: PrinterTypes.EPSON,                                  // Printer type: 'star' or 'epson'
                interface: `tcp://${ip}:9100`,                             // Printer interface
                characterSet: 'SLOVENIA',                                 // Printer character set - default: SLOVENIA
                removeSpecialCharacters: false,                           // Removes special characters - default: false
                lineCharacter: "=",                                       // Set character for lines - default: "-"
                options: {                                                 // Additional options
                    timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
                }
            });
        }


        loggerCommand.info("PRINT !!!")
        if (sourceCode) {
            try {
                esprima.parse(sourceCode);
            } catch (err) {
                loggerCommand.error(err);
                return;
            }
            eval(sourceCode);
            printer.partialCut();
            printer.execute().then(data => {
                loggerCommand.info("Print done");

            })
                .catch(error => loggerCommand.error(error))
                .finally(() => {
                    if (!useIp) {
                        setTimeout(() => {
                            restartEpsonService();
                        }, 5000);
                    }
                });
        }
    }
    catch (err) {
        loggerCommand.error(err);
    }
}

module.exports = {
    execPrintTicket: execPrintTicket
}

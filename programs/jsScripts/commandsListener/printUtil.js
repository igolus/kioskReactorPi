const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const {loggerCommand} = require("../util/loggerUtil");
var esprima = require('esprima');

const execPrintTicket = async (ip, sourceCode) => {
    try {
        let printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,                                  // Printer type: 'star' or 'epson'
            interface: `tcp://${ip}:9100`,                                 // Printer interface
            characterSet: 'SLOVENIA',                                 // Printer character set - default: SLOVENIA
            removeSpecialCharacters: false,                           // Removes special characters - default: false
            lineCharacter: "=",                                       // Set character for lines - default: "-"
            options: {                                                 // Additional options
                timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
            }
        });

        if (sourceCode) {
            try {
                esprima.parse(sourceCode);
            } catch (err) {
                loggerCommand.error(err);
                return;
            }
            eval(sourceCode);
            printer.cut();
            printer.execute().then(data => {
                loggerCommand.info("Print done")
            })
        }
    }
    catch (err) {
        loggerCommand.error(err);
    }
}

module.exports = {
    execPrintTicket: execPrintTicket
}
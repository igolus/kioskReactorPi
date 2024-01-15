const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const {loggerCommand} = require("../util/loggerUtil");
var esprima = require('esprima');
const conf = require('../../../conf/config.json');
const fs = require("fs");
const Downloader = require("nodejs-file-downloader");
const jimp = require("jimp");


//async function downloadOrGetFile(url, width, extension) {
//    let buff = new Buffer.from(width + url);
//    let fileName = buff.toString('base64') + "." + extension;
//    const path = "./" + fileName;
//    if (fs.existsSync(path)) {
//        return path
//    }
//    const downloader = new Downloader({
//        url: url,
//        directory: ".",
//        fileName: fileName
//    });
//    try {
//        const {filePath,downloadStatus} = await downloader.download(); //Downloader.download() resolves with some useful properties.
//        const image = await jimp.read(path);
//        await image.resize(width, jimp.AUTO);
//        console.log("All done");
//        return path
//    } catch (error) {
//        console.log("Download failed", error);
//    }
//}

const execPrintTicket = async (ip, sourceCode, useIp, device) => {
    try {
        console.log(sourceCode)
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
            if (sourceCode) {
                sourceCode = sourceCode.substring(1);
                sourceCode = sourceCode.slice(0, -1);
                sourceCode = sourceCode.replaceAll("\\n", "\n");
                sourceCode = sourceCode.replaceAll("\\\"", "\"");
            }
            console.log("printerIp");
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


        console.log("PRINT !!!")
        if (sourceCode) {

            //sourceCode = sourceCode.substring(1);
            //sourceCode = sourceCode.slice(0, -1);
            //sourceCode = sourceCode.replaceAll("\\n", "\n");
            //sourceCode = sourceCode.replaceAll("\\\"", "\"");
            //if (sourceCode.charAt(0) == '\"') {
            //	sourceCode = sourceCode.substring(1);
            //	sourceCode = sourceCode.slice(0, -1);
            //}

            console.log(sourceCode)
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

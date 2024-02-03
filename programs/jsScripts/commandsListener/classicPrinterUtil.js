const fs = require('fs');
const https = require('https');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// console.log(printer.getPrinters())

const {print} = require("pdf-to-printer");
const {loggerCommand} = require("../util/loggerUtil");
const {parse} = require("url");

function processResponse(file, fileName, device, loggerCommand) {
    return function (response) {
        response.pipe(file);
        file.on("finish", async () => {
            file.close();
            console.log(JSON.stringify(device))
            loggerCommand.info("Download Completed");
            await print(fileName, {printer: device.classicPrinterName})
            try {
                await fs.unlinkSync(fileName);
            }
            catch (error) {
                loggerCommand.error("Unable to delete temp file " + fileName)
            }
            loggerCommand.info(`File ${fileName} has been deleted.`);
        });
    };
}

function printFromUrlCommand(device, urlparam) {
    try {
        let urlWithStringQuery = parse(urlparam);
        if (!urlparam.endsWith(".pdf")) {
            loggerCommand.error("Only PDF are supported !!");
            return;
        }
        if (!device.classicPrinterName || device.classicPrinterName == '') {
            loggerCommand.error("Printer device name not set !!");
            return;
        }
        let fileName = uuidv4() + ".pdf";
        const file = fs.createWriteStream(fileName);
        if (urlWithStringQuery.protocol == "https:") {
            https.get(urlparam, processResponse(file, fileName, device, loggerCommand));
        }
        else {
            http.get(urlparam, processResponse(file, fileName, device, loggerCommand));
        }

    }
    catch (error) {
        loggerCommand.error(error);
    }
}


module.exports =  {
    printFromUrlCommand: printFromUrlCommand
}
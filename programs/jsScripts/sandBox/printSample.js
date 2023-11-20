const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const Downloader = require("nodejs-file-downloader");
const jimp= require("jimp");
const fs= require('fs');
async function downloadOrGetFile(url, width, extension) {
    let buff = new Buffer.from(width + url);
    let fileName = buff.toString('base64') + "." + extension;
    const path = "./" + fileName;
    if (fs.existsSync(path)) {
        return path
    }
    const downloader = new Downloader({
        url: url,
        directory: ".",
        fileName: fileName
    });
    try {
        const {filePath,downloadStatus} = await downloader.download(); //Downloader.download() resolves with some useful properties.
        const image = await jimp.read(path);
        await image.resize(width, jimp.AUTO);
        console.log("All done");
        return path
    } catch (error) {
        console.log("Download failed", error);
    }
}

(async () => {
    try {
        console.log("main");

        let printer;
        printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,                                  // Printer type: 'star' or 'epson'
            interface: 'tcp://192.168.1.10',                                              // Printer interface
            //driver: require('printer'),
            characterSet: 'SLOVENIA',                                 // Printer character set - default: SLOVENIA
            removeSpecialCharacters: false,                           // Removes special characters - default: false
            lineCharacter: "=",                                       // Set character for lines - default: "-"
            options: {                                                 // Additional options
                timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
            }
        });
        // const path = await downloadOrGetFile("https://firebasestorage.googleapis.com/v0/b/castreactor.appspot.com/o/rgfTLMEhQAKo80CCAwnM%2Fmedias%2FINSAMono.png?alt=media&token=63af9efb-ea9a-432f-a52b-6bcb1f815809", 600, "png")
        // console.log(path)
        await printer.printImage(await downloadOrGetFile("https://firebasestorage.googleapis.com/v0/b/castreactor.appspot.com/o/rgfTLMEhQAKo80CCAwnM%2Fmedias%2FINSAMono.png?alt=media&token=63af9efb-ea9a-432f-a52b-6bcb1f815809", 600, "png"));
        await printer.cut();
        await printer.execute();

    }
    catch (error) {
        console.log(error);
    }
})()

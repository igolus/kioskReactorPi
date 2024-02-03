// var {printer, util} = require("printer");
const printer  = require("printer");
const fs = require('fs');
const path = require('path');
const filename = 'file.pdf';
const printername = "ET-2750 Series(Network)";
const https = require('https');

console.log(printer.getPrinters())

const {print} = require("pdf-to-printer");

const url="https://www.cartegrise.com/pdf/declaration-cession-cerfa-15776-01.pdf";

const file = fs.createWriteStream("filed.pdf");
const request = https.get(url, function(response) {
    response.pipe(file);

    // after download completed close filestream
    file.on("finish", () => {
        file.close();
        print("./file.pdf", {printer: "ET-2750 Series(Network)"}).then(console.log);
        console.log("Download Completed");
    });
});

// print("./file.pdf", {printer: "ET-2750 Series(Network)"}).then(console.log);


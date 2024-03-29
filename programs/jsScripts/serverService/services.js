var express = require('express');
var app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs')
const {loggerCommand} = require("../util/loggerUtil");
const {exec} = require("child_process");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

function execCommand(command) {
    return new Promise((resolve, reject) => {

        try {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    loggerCommand.error(error)
                    reject(error);
                    return;
                }
                if (stderr) {
                    loggerCommand.error(stderr)
                    reject(stderr);
                    return;
                }
                if (stdout) {
                    loggerCommand.info(stdout)
                }
                //loggerCommand.info(`command Done`);
                //if (callBackDone) {
                resolve(stdout)
                //}
            });
        } catch (error) {
            loggerCommand.error("Unable to run command " + error)
            reject(error);
        }

    });
    //loggerCommand.info("running command: " + command);

}

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/listSSIDs', async function (req, res) {
    let out = await execCommand("sudo iwlist wlan0 scan|grep SSID");
    const ssidsAvailable = getSsidsAvailable(out);
    console.log(ssidsAvailable);
    res.json(ssidsAvailable);
})

app.post('/connectWifi', async function (req, res) {
    const body = req.body;
    let out = await execCommand("sudo /home/pi/kioskReactor/fillSsid.sh '" + body.ssid + "' '" + body.pass + "'");
    console.log(out)
    out = await execCommand("sudo reboot");
    console.log(out)
    res.json({});
})

app.get('/jquery', function(request, response) {
    const data = fs.readFileSync('../../pages/jquery-3.6.3.min.js', 'utf8');
    response.set('Content-Type', 'text/javascript');
    response.send(Buffer.from(data));
});

app.get('/bootStrapJs', function(request, response) {
    const data = fs.readFileSync('../../pages/bootstrap.min.js', 'utf8');
    response.set('Content-Type', 'text/javascript');
    response.send(Buffer.from(data));
});

app.get('/bootStrapCss', function(request, response) {
    const data = fs.readFileSync('../../pages/bootstrap.min.css', 'utf8');
    response.set('Content-Type', 'text/css');
    response.send(Buffer.from(data));
});

function getSsidsAvailable(dataRaw) {
    var rx = /ESSID\:\"(.*)\"/g;
    var arr = rx.exec(dataRaw);
    let split = dataRaw.split(/ESSID\:\"/);
    let all = [];
    split.forEach(ssid => {
        all.push(ssid.trim()
            .replace(/\\n/g, "")
            .replace('"',''))
    })
    console.log(split)
    console.log(all)
    all = [...new Set(all)];
    return all.filter(ssid => ssid !== '')
}


app.get('/home', async function(request, response) {
    const data = fs.readFileSync('../../pages/connectWifi.html', 'utf8');
    response.set('Content-Type', 'text/html');
    response.send(Buffer.from(data));
});

app.post('/connect', async function (req, res) {
    console.log(JSON.stringify(req.body))
    res.json({});
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
})

console.log("listening on 8081");

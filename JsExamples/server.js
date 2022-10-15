var express = require('express');
const bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', function(req, res){
    console.log("Called on web hook")
    const body = req.body;
    console.log('Got body:', JSON.stringify(req.body, null, 2));
    if (body.eventType && body.eventType == "qrcode") {
        const targetUrl = "https://display-parameters.com?qrcode=" + body.eventValue;
        res.json([
            {
                commandType: "openUrl",
                commandParam: targetUrl
            }
        ]);
        res.status(200)
        return;
    }
    res.status(200)
    res.json([]);
});

app.listen(3008);
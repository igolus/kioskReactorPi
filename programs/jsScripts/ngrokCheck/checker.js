const {getCurrentDevice} = require("../dbUtil/deviceUtil");
const axios = require("axios");
const {loggerCommand} = require("../util/loggerUtil");
const {delay} = require("../commandsListener/commandUtil");
const deviceUtil = require("../dbUtil/deviceUtil");

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

(async () => {
    let init = false;
    const device = await getCurrentDevice();
    //let processed = false;
    while (true) {
        try {
            const res = await axios.get('http://127.0.0.1:4040/api/tunnels', {
            })
            const data = res.data;
            //console.log(JSON.stringify(device, null, 2));
            // console.log(JSON.stringify(data, null, 2));
            let publicUrl = data.tunnels[0].public_url;

            const rdpAddress = publicUrl.split("//") [1];
            console.log(rdpAddress);

            device.rdpAddress = rdpAddress;
            await deviceUtil.updateDevice(device)
            await sleep(20000);
        } catch (error) {
            device.rdpAddress = null;
            await deviceUtil.updateDevice(device)

            await delay(2000);
        }
    }
    process.exit();

})();

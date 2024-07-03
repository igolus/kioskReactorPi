const {getCurrentDevice, getCurrentBrand, getIca} = require("../dbUtil/deviceUtil");
const {getCurrentProject} = require("../dbUtil/projectUtil");
const {startSeverAndConfigureListening} = require("../commandsListener/commandUtil");
const axios = require("axios");
const config = require('../../../conf/config.json');
const fs = require('node:fs');

const https = require("https");
const {execCommand, execCommandSync} = require("../util/commandUtil");

function writeIcaVersion(versionNum) {
    console.error("writing versionNum " + versionNum)

    try {
        return fs.writeFileSync('./icaversion.txt', versionNum);
    }
    catch (e) {
        console.error("unable to write version file");
        process.exit(0);
    }

    fs.writeFileSync('./icaversion.txt', versionNum, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    });
}

function readIcaVersion(versionNum) {
    try {
        return fs.readFileSync('./icaversion.txt').toString();
    }
    catch (e) {
        return null;
    }

}

function installNewVersion(versionNum) {
    console.log(`new Version ${versionNum} Downloaded`)
    console.log(`installing Version ${versionNum} Downloaded`)

    try {
        execCommandSync("icanope.exe /S")
    }
    catch (e) {
        console.error("Error during installation " + e.message)
        process.exit(0);
    }
    try {
        execCommandSync("cp dmpconnect_params.ini \"C:\\Program Files (x86)\\DmpConnect-JS2\"")
    }
    catch (e) {
        console.error("Error during installation " + e.message)
        process.exit(0);
    }
    try {
        execCommandSync("net stop DmpConnect-JS2")
    }
    catch (e) {
        console.error("Error during installation " + e.message)
        process.exit(0);
    }
    try {
        execCommandSync("net start DmpConnect-JS2")
    }
    catch (e) {
        console.error("Error during installation " + e.message)
        process.exit(0);
    }
    console.log("Icanopee Installation finished !!")

}

(async () => {
    try {
        const actualVersion = readIcaVersion();
        const device = await getCurrentDevice();
        // console.log(device.brandId);
        // const ica = await getIca(device.brandId);
        //const officialVersion = await getIca(device.brandId);
        // console.log(JSON.stringify(device.brandId));
        console.log(JSON.stringify(ica));

        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        let connect = await axios.post("https://clients.icanopee.net/api/login_check",
            {
                username: ica.icaLogin,
                password: ica.icaPass,
            },
            {
                httpsAgent: agent
            });

        // console.log(JSON.stringify(connect.data.token));
        let versions =await axios.get("https://clients.icanopee.net/api/customer_area/builds?product=337",
            {
                headers: {
                    Authorization: `Bearer ${connect.data.token}`
                },
                httpsAgent: agent
            });
        // console.log(JSON.stringify(versions.data));
        let winVersion =  versions.data.find(v => v.filename.endsWith("dev.exe") && v.version === ica.officialVersion);
        if (!winVersion) {
            console.log("No version " + ica.officialVersion + " listed");
            return;
        }
        let versionNum = winVersion.version;


        // console.log(JSON.stringify(winVersion, null, 2))
        if (!actualVersion || actualVersion !== versionNum) {
            console.log("New Icanopee version available");

            let download =await axios.get(`https://clients.icanopee.net/api/customer_area/builds/download/${winVersion.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${connect.data.token}`
                    },
                    httpsAgent: agent,
                    responseType: "stream"
                });
            // console.log(JSON.stringify(download.data, null, 2))
            const writer = fs.createWriteStream("./icanope.exe");

            download.data.pipe(writer);

            writer.on('finish', () => {
                writer.close(() => {
                    installNewVersion(versionNum);
                    writeIcaVersion(versionNum);
                    process.exit(0);

                });
            });
            writer.on('error', () => console.error("Error de telechargement"));
        }
        else {
            console.log("Icanopee is up to date");
            process.exit(0);
        }
    }
    catch (error) {
        console.log(error);
        process.exit(0);
    }
    finally {

    }
})();
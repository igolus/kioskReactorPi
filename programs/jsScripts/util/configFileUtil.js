const fs = require('fs')
const {getDevice} = require("../dbUtil/deviceUtil");
const {getCurrentProject} = require("../dbUtil/projectUtil");
const {getBrand} = require("../dbUtil/brandUtil");
const confFileSource='../../../conf/config.json'
const deviceFileSource='../../../conf/device.json'
const projectFileSource='../../../conf/project.json'
const brandFileSource='../../../conf/brand.json'

const readConfig = () => {
    const configData = fs.readFileSync(confFileSource, 'utf8');
    const configJson = JSON.parse(configData);
    return configJson;
}

const writeConfig = (configJson) => {
    fs.writeFileSync(confFileSource, JSON.stringify(configJson, null, 2), 'utf8');
}

const writeDeviceAndProjectConfig = async (deviceId) => {
    const device = await getDevice(deviceId)
    const project = await getCurrentProject(device)
    fs.writeFileSync(deviceFileSource, JSON.stringify(device), 'utf8');
    if (project) {
        fs.writeFileSync(projectFileSource, JSON.stringify(project), 'utf8');
    }
    if (device && device.brandId) {
        const brand = await getBrand(device.brandId);
        fs.writeFileSync(brandFileSource, JSON.stringify(brand, null, 2), 'utf8');
    }
}

module.exports = {
    readConfig: readConfig,
    writeConfig: writeConfig,
    writeDeviceAndProjectConfig: writeDeviceAndProjectConfig,
}

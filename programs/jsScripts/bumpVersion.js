const versionUtil = require("./dbUtil/versionUtil");


(async () => {
    // let versionItem = await versionUtil.getVersion();
    // console.log(versionItem)
    // versionItem.version = "1.0.1"
    //await versionUtil.updateVersion(versionItem);
    await versionUtil.updateVersionRelease(process.argv[2]);
})();

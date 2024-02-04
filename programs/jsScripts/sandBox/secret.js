const {SecretManagerServiceClient} = require('@google-cloud/secret-manager').v1;
const env = require('dotenv').config();

(async () => {
    const client = new SecretManagerServiceClient();
    const [version] = await client.accessSecretVersion({
        name: 'projects/totemsystem-5889b/secrets/secret/versions/latest',
    });
    const payload = version.payload.data.toString('utf8');
    console.log(`Secret data: ${payload}`);
})();
const env=require('dotenv').config()
/**
 * This snippet has been automatically generated and should be regarded as a code template only.
 * It will require modifications to work.
 * It may require correct/in-range values for request initialization.
 * TODO(developer): Uncomment these variables before running the sample.
 */
/**
 *  Optional. Recommended.
 *  BCP-47 (https://www.rfc-editor.org/rfc/bcp/bcp47.txt) language tag.
 *  If not specified, the API will return all supported voices.
 *  If specified, the ListVoices call will only return voices that can be used
 *  to synthesize this language_code. For example, if you specify `"en-NZ"`,
 *  all `"en-NZ"` voices will be returned. If you specify `"no"`, both
 *  `"no-\*"` (Norwegian) and `"nb-\*"` (Norwegian Bokmal) voices will be
 *  returned.
 */
    // const languageCode = 'abc123'

    // Imports the Texttospeech library
const {TextToSpeechClient} = require('@google-cloud/text-to-speech').v1;

// Instantiates a client
const texttospeechClient = new TextToSpeechClient();

async function callListVoices() {
    // Construct request
    const request = {
    };

    // Run request
    const response = await texttospeechClient.listVoices(request);
    console.log(response);
}

callListVoices();

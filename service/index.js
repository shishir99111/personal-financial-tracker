const Airtable = require('airtable');
const config = require('../config')
Airtable.configure({ 
    endpointUrl: config['PLATFORM']['AIRTABLE'].ENDPOINT_URL,
    apiKey: process.env.AIRTABLE_API_KEY,
})

module.exports = {
    getAirtableClient: () => Airtable
}
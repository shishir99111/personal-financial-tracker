const fs = require('fs');


const readFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

/**
 * 
 * URL: 'https://api.airtable.com/v0/appwvNxLhoiLYparm/tbl8Y5PzoGqOluNzX?maxRecords=1&sort[0][field]=S. no.&sort[0][direction]=desc'
 */
const getLastRecordId = async (base, { TABLE_ID }) => {
    // fetch last record
    const lastRecord = await base(TABLE_ID).select({
        maxRecords: 1,
        sort: [{field: "S. no.", direction: "desc"}],
        view: "Grid view"
    }).firstPage();

    const lastRecordSnum = lastRecord[0].fields['S. no.']
    console.log('lastRecordSnum', lastRecordSnum);
    return lastRecordSnum;
}

const sanitiseField = (result, field) => {
    switch(field){
        // Convert to number
        case 'S. no.':
            result = +result;
            break;
        // Convert to float and remove commas
        case 'Balance':
        case 'Debit':
        case 'Credit':
            result = result !== '' ? parseFloat(result.replace(/\,/g,'')) : 0;
            break;
        // Enum values
        case 'Dr / Cr':
            result = result.replace(/(\r\n|\n|\r)/gm, "");
            break;
        // No formatting required for these fields
        case 'Transaction Date':
        case 'Value Date':
        case 'Description':
        case 'Chq / Ref No.':
        case 'default':
            break;
    }
    return result;
}

const UpdateRecords = async (data, base, { TABLE_ID, TARGET_FIELDS, KOTAK_FIELD_MAPPING }) => {
    const records = data.map((record, i) => {
        return {
            "fields": TARGET_FIELDS.reduce(function(res, field) {
                res[field] = sanitiseField(record[KOTAK_FIELD_MAPPING[field]], field);
                return res;
            }, {})
        }
    })
    try{
        console.log('records', records);
        const updateSummary = await base(TABLE_ID).create(records);
        return updateSummary;
    } catch(e) {
        console.log(e);
        throw e;
    }
}

module.exports = { readFile, getLastRecordId, sanitiseField, UpdateRecords };
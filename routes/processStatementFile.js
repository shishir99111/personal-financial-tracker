const path = require('path');
const papaParse = require('papaparse');
const config = require('../config')
const { readFile, getLastRecordId, sanitiseField, UpdateRecords } = require(path.join(__dirname, '../helpers/processStatementHelper'));
const getAirtableClient = require(path.join(__dirname, '../service')).getAirtableClient();


            

const fn = async (req, res)=>{
    // Parsing account statement file
    const bank = req.body.bank;
    const filePath = req.file.path;
    let data = await readFile(filePath);
    const meta = {
        APP: req.body.app,
        BANK: req.body.bank
    }

    try {
        console.log('Processing statement started');

        const APP_CONFIG = config["APPS"][meta.APP]
        const TARGET_CONFIG = APP_CONFIG['TARGET']
        const BANK_INPUT_CONFIG = APP_CONFIG['BANK_INPUTS'][meta.BANK]
        
        const BASE_ID =  TARGET_CONFIG['BASE_ID']
        const TABLE_ID = TARGET_CONFIG['TABLE_ID']
        const TARGET_FIELDS = TARGET_CONFIG['FIELDS']
        
        const KOTAK_FIELD_MAPPING = BANK_INPUT_CONFIG['mapping']
        const skip_lines_at_beginning = BANK_INPUT_CONFIG['skip_lines_at_beginning']
        const skip_lines_at_end = BANK_INPUT_CONFIG['skip_lines_at_end']
        const payment_id_param_seq = TARGET_FIELDS[BANK_INPUT_CONFIG['payment_id_param_seq'][0]]

        const base = Airtable.base(BASE_ID);

        const lastRecordSnum = await getLastRecordId(base, { TABLE_ID, payment_id_param_seq });

        // Sanitising data to remove unwanted lines
        data = data.split('\n');
        data.splice(0, skip_lines_at_beginning);
        data.splice(data.length - skip_lines_at_end, skip_lines_at_end);
        
        // Filtering records after last record Snum
        data.splice(0, lastRecordSnum)

        console.log(data);
        if(data.length == 0)    return { errMsg: 'No new records to update'};

        const jsonData = await papaParse.parse(data.join('\n'), {})

        const updateSummary = await UpdateRecords(jsonData.data, base, { TABLE_ID, TARGET_FIELDS, KOTAK_FIELD_MAPPING });

        console.log('updateSummary', updateSummary);
        
        res.send({ updateSummary });
    } catch (e){
        console.log(e);
    }
}
module.exports = fn;
const fs = require('fs');
const { log } = require('../utils/debugLog');
const HoseError = require("../utils/HoseError");
const { isString, isObject } = require('../utils/typeValidators');

/**
 * Default JSON parser for the package
 * @param {String} fileUri - URI of the JSON file
 * @returns {Object} content - The parsed JavaScript object
 * @throws HoseError - Throws error in case of parsing failure 
 */
let jsonParser = (fileUri) => {
  
  if (!isString(fileUri)) {
    throw new HoseError("Hose Error: improper file-uri passed");
  }

  log("File URI - " + fileUri + " passed to default JSON parser");

  try {

    let rawdata = fs.readFileSync(fileUri, 'utf8');
    let content = JSON.parse(rawdata);

    log("Parse successful");
    log("Content parsed - " + JSON.stringify(content));

    if (!isObject(content)) {
      throw new HoseError("Parsed content is not a JS object");
    }

    return content;

  } catch (error) {
    throw new HoseError("Hose Error: Error while parsing data - "
     +  error.message);
  }
}

module.exports = { jsonParser };
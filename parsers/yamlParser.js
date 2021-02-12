const fs = require('fs');
const HoseError = require("../utils/HoseError");
const yaml = require('js-yaml');
const { log } = require('../utils/debugLog');
const { isString, isObject } = require('../utils/typeValidators');

/**
 * Default YAML parser for the package
 * @param {String} fileUri - URI of the YAML file
 * @returns {Object} content - The parsed JavaScript object
 * @throws HoseError - Throws error in case of parsing failure 
 */
let yamlParser = (fileUri) => {
  
  if (!isString(fileUri)) {
    throw new HoseError("Hose Error: improper file-uri passed.");
  }

  log("File URI - " + fileUri + " passed to default YAML parser");

  try {

    let content = yaml.load(fs.readFileSync(fileUri, 'utf8'));

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

module.exports = { yamlParser };
const fs = require('fs');
const { log } = require('../utils/debugLog');
const HoseError = require("../utils/HoseError");

/**
 * Default .env-formatted-file parser for the package
 * @param {String} fileUri - URI of the file that is formatted like .env files
 * @returns {Object} content - The parsed JavaScript object
 * @throws HoseError - Throws error in case of parsing failure 
 */
let envParser = (fileUri) => {
  
  if (typeof fileUri !== 'string' && !(fileUri instanceof String)) {
    throw new HoseError("Hose Error: improper file-uri passed.");
  }
  
  log("File URI - " + fileUri + " passed to default env-formatted-file parser");

  const NEWLINE = '\n'
  const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/
  const RE_NEWLINES = /\\n/g
  const NEWLINES_MATCH = /\n|\r|\r\n/


  try {

    const content = {};

    fs.readFileSync(fileUri, 'utf8')
      .toString()
      .split(NEWLINES_MATCH)
      .forEach(function (line, idx) {
        const keyValueArr = line.match(RE_INI_KEY_VAL)
        if (keyValueArr != null) {
          const key = keyValueArr[1]
          let val = (keyValueArr[2] || '')
          const end = val.length - 1
          const isDoubleQuoted = val[0] === '"' && val[end] === '"'
          const isSingleQuoted = val[0] === "'" && val[end] === "'"
      
          if (isSingleQuoted || isDoubleQuoted) {
            val = val.substring(1, end)      
            if (isDoubleQuoted) {
              val = val.replace(RE_NEWLINES, NEWLINE)
            }
          } else {
            val = val.trim()
          }

          if (!isNaN(val)) {
            content[key] = Number(val); 
          } else {
            content[key] = val;
          }          
        }
      });

    log("Parse successful");
    log("Content parsed - " + JSON.stringify(content));

    if (typeof content !== 'object' || content === null) {
      throw new HoseError("Parsed content is not a JS object");
    }

    return content;

  } catch (error) {
    throw new HoseError("Hose Error: Error while parsing data - "
     +  error.message);
  }
}

module.exports = { envParser };
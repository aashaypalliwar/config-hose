const HoseError = require("./HoseError");
const { isString } = require("./typeValidators");

/**
 * Gives absolute path to a file
 * @param {String} relativePath
 */
let getFileURI = (relativePath) => {
  
  if (!isString(relativePath)) {
    throw new HoseError("Hose Error: Relative path to a file must be a string");
  }

  let absolutePath = process.cwd() + relativePath.trim();

  return absolutePath;

}

let getDefaultParserTypeForFile = (path) => {

  if (!isString(path)) {
    throw new HoseError("Hose Error: Path to a file must be a string");
  }

  if (path.toLowerCase().trim().endsWith(".json")) {
    return "JSON";
  } else if (path.toLowerCase().trim().endsWith(".yaml") || path.toLowerCase().trim().endsWith(".yml")) {
    return "YAML";
  } else {
    return "ENV";
  }
}

module.exports = {
  getFileURI,
  getDefaultParserTypeForFile
}
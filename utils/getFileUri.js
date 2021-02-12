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

  let absolutePath = process.cwd() + relativePath;

  return absolutePath;

}

module.exports = {
  getFileURI
}
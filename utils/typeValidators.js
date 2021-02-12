const fs = require("fs")

let isString = (val) => {
  return (typeof val === 'string' || val instanceof String); 
}

let isFunction = (val) => {
  return typeof val === "function";
}

let isObject = (val) => {
  return typeof val === 'object' && val !== null && val != undefined;
}

let isFile = (path) => {
  return isString(path) && fs.existsSync(path) && fs.statSync(path).isFile();
}

module.exports = {
  isString,
  isFunction,
  isObject,
  isFile
}
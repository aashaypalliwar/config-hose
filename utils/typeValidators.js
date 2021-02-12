
let isString = (val) => {
  return (typeof val === 'string' || val instanceof String); 
}

let isFunction = (val) => {
  return typeof val === "function";
}

let isObject = (val) => {
  return typeof val === 'object' && val !== null && val != undefined;
}

module.exports = {
  isString,
  isFunction,
  isObject
}
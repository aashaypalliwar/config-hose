/**
 * Logs required events when being run in debug mode
 * @param {String} statement - Statement to be logged on console in debug mode. 
 */
let log = (statement) => {
  if (process.env.HOSE_MODE === "debug") {
    console.log(statement);
  }
}

module.exports = {
  log
}
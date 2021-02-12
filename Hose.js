const { jsonParser } = require("./parsers/jsonParser");
const { yamlParser } = require("./parsers/yamlParser");
const { envParser } = require("./parsers/envParser");
const HoseError = require("./utils/HoseError");


class Hose {

  /**
   * Initialize variaous objects to be used as registers
   */
  initRegistries() {
    this.customParsers = {};
  }

  /**
   * Loads default parsers for later usage
   * Parsers loaded are:
   * 1. jsonParser
   * 2. yamlParser
   * 3. envParser
   */
  loadDefaultParsers() {
    
    this.defaultParsers = {
      jsonParser,
      yamlParser,
      envParser
    }

  }

  /**
   * Register custom parsers provided by the user
   * @param {String} alias Alias to the custom parser the user wants to set
   * @param {Function} parser The custom parser function
   */
  setCustomParser(alias, parser) {

    if (typeof parser !== "function") {
      throw new HoseError("Hose Error: Custom parser must be a function");
    }

    if (typeof alias !== 'string' && !(alias instanceof String)) {
      throw new HoseError("Hose Error: Alias to a custom parser must be a string");
    }

    this.customParsers[alias] = parser;

  }

  /**
   * Get registered custom parser
   * @param {String} alias Alias to the required custom parser 
   */
  getCustomParser(alias) {

    if (typeof alias !== 'string' && !(alias instanceof String)) {
      throw new HoseError("Hose Error: Alias to a custom parser must be a string");
    }

    if (!this.customParsers.hasOwnProperty(alias)) {
      throw new HoseError(`Hose Error: The parser with alias ${alias} is not registered`);
    }

    return this.customParsers[alias];

  }

  constructor(configDefinitionSource, fileType = 'JSON') {

    this.initRegistries();
    this.loadDefaultParsers();

    // this.configRegister = null //Object that holds configuration
    // this.parserRegister = null//Object that holds all parsers
    // this.fileRegister = null  //Object that holds all fileRegister
    // this.variablesWithUnknownSource  = null // Array of variables with unknown source.
  }
}

module.exports = Hose;
const { jsonParser } = require("./parsers/jsonParser");
const { yamlParser } = require("./parsers/yamlParser");
const { envParser } = require("./parsers/envParser");
const HoseError = require("./utils/HoseError");
const { isString, isFunction, isFile, isObject } = require("./utils/typeValidators");
const { getFileURI, getDefaultParserTypeForFile } = require("./utils/getFileInfo");


class Hose {

  /**
   * Initialize variaous objects to be used as registers
   */
  initRegistries() {
    this.customParsers = {};
    this.supportedDefinitionFormats = ["JSON", "YAML"];
    this.fileRegister = {};
    this.config = {};
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
      "JSON": jsonParser,
      "YAML": yamlParser,
      "ENV": envParser
    }

  }

  /**
   * Load definition from source-definition file
   * @param {String} configDefinitionSource 
   * @param {String} fileType 
   */
  loadDefinition(configDefinitionSource, fileType) {
 
    if (!this.supportedDefinitionFormats.includes(fileType)) {
      throw new HoseError(`Hose Error: Definition file of unsupported format - ${fileType}`);
    }

    // let defUri = getFileURI(configDefinitionSource);
    let defUri = configDefinitionSource;
    
    if (!isFile(defUri)) {
      throw new HoseError("Hose Error: Definition file does not exist");
    }

    this.definition = this.defaultParsers[fileType](defUri);

  }

  /**
   * Loads file register with file-parser mappings
   */
  loadFileMetadata() {

    let files = this.definition.files;

    for (const file in files) {
      let fileUri = null;
      let isDefault = false;
      let parserAlias = null;

      if (isString(files[file])) {

        fileUri = getFileURI(files[file]);
        isDefault = true;
        parserAlias = getDefaultParserTypeForFile(fileUri);    

      } else if (isObject(files[file])) {

        let fileData = files[file];

        fileUri = (fileData["isAbsolute"] === true) ? 
          fileData["fileUri"] : getFileURI(fileData["fileUri"]);

        // If a specific default parser is mentioned.
        if (isString(fileData["useDefault"])) {

          let defaultParserAvailable = this.defaultParsers
            .hasOwnProperty(fileData["useDefault"].trim().toUpperCase());

          if (defaultParserAvailable) {
            isDefault = true;
            parserAlias = fileData["useDefault"].trim().toUpperCase();
          } else {
            throw new HoseError(`Hose Error: The requested default parser for file ${file} is not available`);
          }

        } else {
          if (isString(fileData["parserAlias"])) {
            isDefault = false;
            parserAlias = fileData["parserAlias"];
          } else {
            isDefault = true;
            parserAlias = getDefaultParserTypeForFile(fileUri); 
          }
        }

      }

      this.fileRegister[file] = {
        fileUri,
        isDefault,
        parserAlias
      }

    }

  }

  /**
   * Register custom parsers provided by the user
   * @param {String} alias Alias to the custom parser the user wants to set
   * @param {Function} parser The custom parser function
   */
  setCustomParser(alias, parser) {

    if (!isFunction(parser)) {
      throw new HoseError("Hose Error: Custom parser must be a function");
    }

    if (!isString(alias)) {
      throw new HoseError("Hose Error: Alias to a custom parser must be a string");
    }

    this.customParsers[alias] = parser;

  }

  /**
   * Get registered custom parser
   * @param {String} alias Alias to the required custom parser 
   */
  getCustomParser(alias) {

    if (!isString(alias)) {
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
    this.loadDefinition(configDefinitionSource, fileType);
    this.loadFileMetadata();

    // this.variablesWithUnknownSource  = null // Array of variables with unknown source.
  }
}

module.exports = Hose;
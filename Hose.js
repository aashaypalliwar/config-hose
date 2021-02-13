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
    this.variableGroups = [];
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

    //Load definition
    this.definition = this.defaultParsers[fileType](defUri);

    //Load config-identifier
    this.config_identifier = isString(this.definition.config_identifier) ?
    process.env[this.definition.config_identifier]
    : process.env["NODE_ENV"];

    if(!isString(this.config_identifier)) {
      throw new HoseError("Hose Error: The configuration identifier is undefined");
    }

    //Load error-mode
    let defined_error_mode = (isString(this.definition.error_mode)) ? this.definition.error_mode : "noisy";
    this.noisyError = (defined_error_mode === "silent") ? false : true;
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
    this.populateVariables();

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

  /**
   * Initialize variable register
   */
  loadVariableRegister() {

    for (const group of this.definition.variableGroups) {

      if (group["source"].hasOwnProperty(this.config_identifier)) {
        this.variableGroups.push({
          "variables": [...group["variables"]],
          "source": group["source"][this.config_identifier],
          "resolved": false,
          "head": 0
        });

        for (const variable of group["variables"]) {
          this.config[variable] = {
            "value": undefined,
            "available": false
          }
        }        
      }

    }
    
    if (this.variableGroups.length === 0 && this.noisyError) {
      throw new HoseError("Hose Error: No variables defined for the provided config-mode");
    }

  }

  /**
   * Populate config variables with values fetched from the source files
   */
  populateVariables() {
    
    for (const group of this.variableGroups) {

      if (!group.resolved){
        let variableList = group.variables;
        let variableCount = group.variables.length;
        let head = group.head;

        while (true) {

          if(head === group.source.length) {
            let variables = group.variables.join(", ")
            throw new HoseError(`Hose Error: Variable(s) - ${variables} - not found in the designated fiels`);
          }

          let resolvedCount = 0;
          let unresolvedVariables = [];
          let fileAlias = group.source[head];

          if(!this.fileRegister.hasOwnProperty(fileAlias)) {
            throw new HoseError(`Hose Error: File alias - ${fileAlias} is not provided in list of files`)
          }

          let parserGroup = (this.fileRegister[fileAlias].isDefault) ? this.defaultParsers : this.customParsers;
          let parserAlias = this.fileRegister[fileAlias].parserAlias;

          if (!this.fileRegister[fileAlias].isDefault && !this.customParsers.hasOwnProperty(parserAlias)) break;

          let parser = parserGroup[parserAlias];

          let content = parser(this.fileRegister[fileAlias].fileUri);
          if (!isObject(content)) {
            throw new HoseError(`Hose Error: Parsed content is not an object for file with alias - ${fileAlias}`);
          }

          for (const variable of variableList) {

            if (content.hasOwnProperty(variable)) {
              this.config[variable].value = content[variable];
              this.config[variable].available = true;
              resolvedCount += 1;
            } else {
              unresolvedVariables.push(variable);
            }
          }

          if (resolvedCount === variableCount) {
            group.resolved = true;
            break;
          } else {
            variableList = [...unresolvedVariables];
            group.variables = [...unresolvedVariables];
            variableCount = variableList.length;
            head += 1;
            group.head = head;
          }
        }

      }
    }

  }

  /**
   * Getter function for getting the value of a config-variable
   * @param {String} key 
   */
  get(key) {
    
    if(!isString(key)) {
      throw new HoseError("Hose Error: The key to a config-variable must be a string");
    }

    if(!this.config.hasOwnProperty(key)) {
      throw new HoseError("Hose Error: The requested config-variable is not declared in definition file");
    }

    if(!this.config[key].available) {
      if (this.noisyError) {
        throw new HoseError("Hose Error: The custom parser required for fetching the value of requested variable is not set");
      } else {
        return null;
      }
    }

    return this.config[key].value;

  }

  constructor(configDefinitionSource, fileType = 'JSON') {

    this.initRegistries();
    this.loadDefaultParsers();
    this.loadDefinition(configDefinitionSource, fileType);
    this.loadFileMetadata();
    this.loadVariableRegister();
    this.populateVariables();

  }
}

module.exports = Hose;
# Config Hose

Config Hose is an unopinionated, pluggable and no-nonsense configuration manager that enables its users to decouple configuration management logic from the source code. 

Unlike other available packages, hose removes ambiguity of usage by providing a way of defining config-variables and their respective sources. Users can define their own parsers and plug it into the hose or use the default parsers to siphon the configurations from the files of their choice and even validate them before using.

With one definition file, the hose interface does all the heavy lifting and routes the configurations from various sources (possibly of different type) depending on the configuration identifier environment variable of user's choice.

The hose, by default, provides support for JSON, YAML and .env-type files.

---
## Installation

Using NPM:

```sh
$ npm install config-hose --save
```

## Usage
Config-hose requires a definition file written in JSON or YAML.
An example JSON file is as follows:

```json
{
    "config_identifier": "CONFIG_TYPE",

    "files": {
        "env": "/config/dev/.env.dev",
        "env_prod": "/config/prod/.env.prod",
        "config_dev": {
            "fileUri": "/config/dev/config.json",
            "parserAlias": "myJson"
        },
        "config_dev_defaults": "/config/dev/config_def.json",
        "config_prod": "/config/prod/config.json",
        "keys_dev": {
            "fileUri": "/config/dev/keys",
            "useDefault": "ENV"
        },
        "keys_prod": {
            "fileUri": "/config/prod/key.yaml",
            "parserAlias": "validate_and_fetch_keys"
        }
    },

    "variableGroups": [{
            "variables": ["PORT", "MONGO_URI", "REDIS_URI"],
            "source": {
                "development": ["env"],
                "production": ["env_prod"]
            }
        },
        {
            "variables": ["EMAIL", "JWT_EXPIRES_IN", "COOKIE_EXPIRES_IN"],
            "source": {
                "development": ["config_dev", "config_dev_defaults"],
                "production": ["config_prod"]
            }
        },
        {
            "variables": ["FCM_API_KEY", "MAILGUN_KEY", "GCP_API_KEY"],
            "source": {
                "development": ["keys_dev"],
                "production": ["keys_prod"]
            }
        }
    ]
}
```
## Usage in code

```javascript
const Hose = require('config-hose');
const hose = new Hose("./definition.json");

hose.setCustomParser("myJson", myJsonParser);
hose.setCustomParser("validate_and_fetch_keys", prodKeyParser);

console.log(hose.get("EMAIL"));
console.log(hose.get("PORT"));
console.log(hose.get("FCM_API_KEY"));
```

Note that the cutom parser function should accept a path to a file and return a JavaScript object with key-value pairs of the required configuration variables. Additional validation and error-detection may be implemented in the custom-parser as per the user's need. 

The following command will make config-hose get the variable values from the "development" source of respective variable groups and provide them in the code.
```sh
$ CONFIG_TYPE=development node index.js
```

The following command will make config-hose get the variable values from the "production" source of respective variable groups and provide them in the code.
```sh
$ CONFIG_TYPE=production node index.js
```

If multiple file-aliases are provided in the source array (as done for the "development" source of the second group above), the hose uses rest of the files as fall-back in case some variables are not found in the first file of the list.

## Options
```json
{
    "config_identifier": "CONFIG_TYPE",
    "error_mode": "silent",
    "immutable": false,

    "files": {
      
    },
    "variableGroups": [
      
    ]
}
```
1. "config_identifier" - It is the environment variable that holds the value which identfies file sources to be used for fetching values for a variable groups. Default - NODE_ENV
2. "error_mode" - If silent, .get() for unavailable (but declared) values return null, otherwise throws error. Default- "noisy". Variables which are not present in a particular config-mode will always throw error on .get()
3. "immutable" - If false, mutations on the variables in business logic will be reflected in later .get()'s., otherwise the config-variables will give same values everytime. Default - true

```json
{   
    "files": {
        "env_dev": "/config/dev/.env",   
    }
}
```
In case of simple declaration of file and its alias, default JSON parser will be used to fetch values if the path to the file ends in .json. Default YAML parser will be used if path ends in .yaml or .yml . In all other cases, file type will be assumed to be like .env file and parsed using default ENV parser. 

```json
{   
    "files": {
        "keys_prod": {
            "fileUri": "/usr/app/prod/keys",
            "isAbsolute": true,
            "useDefault": "ENV"
        }  
    }
}
```
1. "useDefault" option may be used to explicitly mention the default parser to be employeed. Legal values - "JSON", "YAML" and "ENV".
2. "isAbsolute", if set to true, will use the path as the absolute path to the file. Default value is false, in which case the path is relative to the current working directory of the process.

## Debug
```sh
$ HOSE_MODE=debug CONFIG_TYPE=development node index.js
```
Setting HOSE_MODE environment variable to "debug" outputs event logs on the console. These events can help in debugging configuration bugs entailing to Config Hose.

<br/>

---

<h3 align="center">Feel free to contact me for further discussion!</h3>
<p align="center">
  <a href="https://www.linkedin.com/in/aashay-palliwar/" target="_blank">LinkedIn</a>
</p>
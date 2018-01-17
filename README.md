[![NPM version](https://badge.fury.io/js/raml-to-typescript.svg)](http://badge.fury.io/js/raml-to-typescript)
[![Dependency Status](https://david-dm.org/ducin/raml-to-typescript/status.svg)](https://david-dm.org/ducin/raml-to-typescript)
[![devDependency Status](https://david-dm.org/ducin/raml-to-typescript/dev-status.svg)](https://david-dm.org/ducin/raml-to-typescript#info=devDependencies)

# raml-to-typescript

RAML to TypeScript Definition Files Converter. Uses [`raml2obj`](https://www.npmjs.com/package/raml2obj) and [`json-schema-to-typescript`](https://www.npmjs.com/package/json-schema-to-typescript).

See the [changelog](CHANGELOG.md).

## install

locally:

    npm install --save raml-to-typescript

globally:

    npm install -g raml-to-typescript

## usage

as a CLI tool:

    raml2ts -i example-contract/geo.raml -o example-dts

as a library:

```js
const raml2ts = require('raml-to-typescript');
raml2ts.generateDefinitions(contractFilePath, outputDir)
  .then(successCb)
  .catch(errorCb)
// or
raml2ts.generateDefinitions(contractFilePath, outputDir, json2tsOptions)
  .then(successCb)
  .catch(errorCb)
```

## example

RAML file:

```raml
#%RAML 1.0
title: Example Service

/geo:

/countries:
  description: |
    Collection of all countries.
  get:
    description: Fetch collection of countries
    responses:
      200:
        body:
          application/json:
            type: !include countries.schema.json
```

related `countries.schema.json` schema file:

```json
{
  "title": "Countries",
  "type": "array",
  "items": {
    "$ref": "#/definitions/Country"
  },
  "definitions": {
    "Country": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 2,
          "maxLength": 2,
          "pattern": "[A-Z]+"
        },
        "name": {
          "type": "string"
        }
      },
      "additionalProperties": false,
      "required": [
        "id",
        "name"
      ]
    }
  }
}
```

will produce following output:

```ts
export type Countries = Country[];

export interface Country {
  id: string;
  name: string;
}
```

## limitations

Currently, only JSON Schema files are supported (RAML-defined types are not yet supported).

## todos

 * include request schemas as well as response schemas

#!/usr/bin/env node

const argv = require('yargs') // eslint-disable-line
  .alias('i', 'input')
  .nargs('i', 1)
  .describe('i', 'set input RAML contract file')
  .alias('o', 'output-dir')
  .nargs('o', 1)
  .describe('o', 'set output directory for TypeScript definition files')
  .demandOption(['i', 'o'])
  .help('h')
  .alias('h', 'help')
  // .option('verbose', {
  //   alias: 'v',
  //   default: false
  // })
  .argv

const json2tsOptions = {
  bannerComment: "// Auto-generated with `raml-to-typescript`/`json-schema-to-typescript`"
};

const generate = require('../src/index');

generate(argv.i, argv.o, json2tsOptions)
  .then(() => console.log('TypeScript Definition files generated from RAML Contract.'))
  .catch(e => console.error('TypeScript Definition generation failed:', e))

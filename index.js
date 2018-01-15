#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { compile } = require('json-schema-to-typescript');
const raml2obj = require('raml2obj');

const argv = require('yargs').argv;
const CONTRACT_FILE = argv.input;
const OUTPUT_DIR = argv.output;
const json2tsOptions = {};

const depthFirst = (node, nodeCallback, isRoot = true) => {
  if (!isRoot) {
    nodeCallback(node);
  }
  if (node.resources) {
    node.resources.forEach(res => depthFirst(res, nodeCallback, false));
  }
}

const depthFirstSequence = (tree) => {
  const nodeSeq = [];
  const appendNode = node => nodeSeq.push(node);
  depthFirst(tree, appendNode);
  return nodeSeq;
}

const stripWhiteSpace = str => str.replace(/\s+/g, '');

const getBodyType = body => typeof body.type === 'string' ? JSON.parse(body.type) : body.type;

const resourceReducer = (methodsSeq, resource) =>
  resource.methods ? methodsSeq.concat(resource.methods) : methodsSeq;

const methodReducer = (responsesSeq, method) => {
  let result = [...responsesSeq];
  if (method.responses) {
    result = [...result, ...method.responses];
  }
  return result;
}

const responseReducer = (typesSeq, response) =>
  response.body ? typesSeq.concat(response.body.map(getBodyType)) : typesSeq;

const resourceSeqToTypesSeq = resSeq => {
  return resSeq
    .reduce(resourceReducer, [])
    .reduce(methodReducer, [])
    .reduce(responseReducer, []);
}

const mkdirSync = function (dirPath) {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

const writeFileAsync = promisify(fs.writeFile);
const outputFilePath = f => path.join(OUTPUT_DIR, `${f}.d.ts`);

const typedefFileName = typeDef => {
  if (typeDef.title) return stripWhiteSpace(typeDef.title);
  if (typeDef.id) return stripWhiteSpace(typeDef.id);
  throw new Error(
    `JSON Schema requires "id" or "title" field to be defined. None were defined in:
${JSON.stringify(typeDef, null, 2)}`);
}

const generateTSD = typesSeq => {
  mkdirSync(OUTPUT_DIR);
  return typesSeq.map(typeDef => {
    compile(typeDef, undefined, json2tsOptions)
      .then(dts => writeFileAsync(outputFilePath(typedefFileName(typeDef)), dts))
  });
}

raml2obj.parse(CONTRACT_FILE)
  .then(depthFirstSequence)
  .then(resourceSeqToTypesSeq)
  .then(generateTSD)
  .then(() => console.log('TypeScript Definition files generated from RAML Contract.'))
  .catch(e => console.error('TypeScript Definition generation failed:', e))

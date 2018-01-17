const path = require('path');
const { compile } = require('json-schema-to-typescript');
const raml2obj = require('raml2obj');

const utils = require('./utils');
const io = require('./io');

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

const typedefFileName = typeDef => {
  if (typeDef.title) return utils.stripWhiteSpace(typeDef.title);
  if (typeDef.id) return utils.stripWhiteSpace(typeDef.id);
  throw new Error(
    `JSON Schema requires "title" or "id" field to be defined. None were defined in:
${JSON.stringify(typeDef, null, 2)}`);
}

const generateTSD = (typesSeq, outputDir, json2tsOptions) => {
  io.mkdirSync(outputDir);
  return typesSeq.map(typeDef => {
    compile(typeDef, undefined, json2tsOptions)
      .then(dts => {
          const filePath = path.join(outputDir, `${typedefFileName(typeDef)}.d.ts`);
          return io.writeFileAsync(filePath, dts);
      })
  });
}

const generateDefinitions = (contractFilePath, outputDir, json2tsOptions = {}) => {
    return raml2obj.parse(contractFilePath)
        .then(depthFirstSequence)
        .then(resourceSeqToTypesSeq)
        .then(data => generateTSD(data, outputDir, json2tsOptions))
}

module.exports = generateDefinitions;

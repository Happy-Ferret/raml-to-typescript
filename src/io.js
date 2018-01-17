const fs = require('fs');
const promisify = require("promisify-node");
// const { promisify } = require('util'); // since node.js v8

const writeFileAsync = promisify(fs.writeFile);

const mkdirSync = function (dirPath) {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

module.exports = {
  writeFileAsync,
  mkdirSync
};

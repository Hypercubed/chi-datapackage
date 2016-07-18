const readFile = require('fs').readFile;
const parse = require('json5').parse;

function readPackage (path, enc) {
  return new Promise((resolve, reject) => {
    readFile(path, enc, (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(Object.assign(parse(res), {path}));
    });
  });
}

module.exports = readPackage;

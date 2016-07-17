const readFile = require('fs').readFile;

function readPackage (path, enc) {
  return new Promise((resolve, reject) => {
    readFile(path, enc, (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(Object.assign(JSON.parse(res), {path}));
    });
  });
}

module.exports = readPackage;

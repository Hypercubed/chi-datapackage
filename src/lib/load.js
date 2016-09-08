const nodePath = require('path');
const readFile = require('fs').readFile;
const fetchUrl = require('isomorphic-fetch');
const debug = require('debug')('fetch');

module.exports.read = function read (path) {
  if (nodePath.sep === '\\') {
    path = nodePath.normalize(path).replace(/^\\/, '');
  }
  debug('reading', path);
  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
};

module.exports.fetch = function fetch (url) {
  debug('fetching', url);
  return fetchUrl(url)
    .then(response => {
      /* istanbul ignore next */
      if (response.status >= 400) {
        throw new Error('Bad response from server');
      }
      return response.text();
    });
};

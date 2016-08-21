require('isomorphic-fetch');

const path = require('path');
const readFile = require('fs').readFile;

const debug = require('debug')('fetch');

function fetchTextFromURL (url) {
  debug('fecthing', url);
  if (url.indexOf('file://') === 0) {
    url = url.replace('file://', '');
    if (path.sep === '\\') {
      url = path.normalize(url).replace(/^\\/, '');
    }
    return new Promise((resolve, reject) => {
      readFile(url, 'utf8', (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  }
  return fetch(url)
    .then(response => {
      /* istanbul ignore next */
      if (response.status >= 400) {
        throw new Error('Bad response from server');
      }
      return response.text();
    });
}

module.exports = fetchTextFromURL;

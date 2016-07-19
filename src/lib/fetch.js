require('isomorphic-fetch');

const readFile = require('fs').readFile;

function fetchTextFromURL (url) {
  if (url.indexOf('file://') === 0) {
    url = url.replace('file://', '');
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

// TODO: Browser

module.exports = fetchTextFromURL;

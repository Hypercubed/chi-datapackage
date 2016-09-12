/* eslint node/no-unsupported-features: 0 */
const fs = require('fs');
const path = require('path');

const nock = require('nock');

module.exports = function setupHttp () {
  return nock('http://raw.githubusercontent.com')
    .get(/datasets\/.*/)
    .reply(200, (uri, requestBody, cb) => {
      uri = uri
        .replace('datasets/', '')
        .replace('master/', '');
      fs.readFile(path.join(__dirname, uri), cb);
    });
};

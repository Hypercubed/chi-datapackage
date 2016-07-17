'use strict';

const Papa = require('babyparse');
const safeLoad = require('js-yaml').safeLoad;
const setLineEnding = require('crlf-helper').setLineEnding;

const dos2unix = content => setLineEnding(content, 'LF');

const jsonParse = require('./json');
const matrixParse = require('./matrix').matrixParse;

module.exports = {
  'text/tab-separated-values': resource => Papa.parse(resource.content, {header: true, delimiter: '\t', skipEmptyLines: true}),

  'text/csv': resource => Papa.parse(resource.content, {header: true, delimiter: ',', skipEmptyLines: true}),

  'text/plain': resource => ({data: dos2unix(resource.content)}),

  'text/yaml': resource => ({data: safeLoad(resource.content)}),

  'text/matrix': resource => matrixParse(resource.content),

  'application/json': resource => {
    const data = jsonParse(resource.content);
    let path = resource.path;
    if (data.url && data.url.indexOf('api.github.com') > -1) {  // move
      data.name = `${data.owner.login}/${data.id}`;
      path = `gists/${data.id}`;
    }
    return {data, path};
  }
};

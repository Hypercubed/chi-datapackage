// @flow

'use strict';

const parse = require('babyparse').parse;
const safeLoad = require('js-yaml').safeLoad;
const setLineEnding = require('crlf-helper').setLineEnding;

const jsonParse = require('./json');
const matrixParse = require('./matrix');

function dos2unix (content) {
  return setLineEnding(content, 'LF');
}

const defaultTranslatorsMap /* : TranslatorsMap */ = {
  'text/tab-separated-values': (resource /* : Resource */) => {
    const dialect = Object.assign({
      header: true,
      delimiter: '\t',
      skipEmptyLines: true
    }, resource.dialect);
    return parse(resource.content, dialect);
  },

  'text/csv': (resource /* : Resource */) => {
    const dialect = Object.assign({
      header: true,
      delimiter: ',',
      skipEmptyLines: true
    }, resource.dialect);
    return parse(resource.content, dialect);
  },

  'text/plain': (resource /* : Resource */) => ({data: dos2unix(resource.content)}),

  'text/yaml': (resource /* : Resource */) => ({data: safeLoad(resource.content)}),

  'text/matrix': (resource /* : Resource */) => matrixParse(resource.content, resource.dialect),

  'application/json': (resource /* : Resource */) => ({data: jsonParse(resource.content)})
};

module.exports = defaultTranslatorsMap;

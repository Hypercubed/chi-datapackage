'use strict';

const Papa = require('babyparse');
const safeLoad = require('js-yaml').safeLoad;
const setLineEnding = require('crlf-helper').setLineEnding;

const dos2unix = content => setLineEnding(content, 'LF');

const JSON5 = require('json5');
const matrixParse = require('./matrix');

module.exports = {
  'text/tab-separated-values': resource => {
    const dialect = Object.assign({
      header: true,
      delimiter: '\t',
      skipEmptyLines: true
    }, resource.dialect);
    return Papa.parse(resource.content, dialect);
  },

  'text/csv': resource => {
    const dialect = Object.assign({
      header: true,
      delimiter: ',',
      skipEmptyLines: true
    }, resource.dialect);
    return Papa.parse(resource.content, dialect);
  },

  'text/plain': resource => ({data: dos2unix(resource.content)}),

  'text/yaml': resource => ({data: safeLoad(resource.content)}),

  'text/matrix': resource => matrixParse(resource.content, resource.dialect),

  'application/json': resource => ({data: JSON.parse(resource.content)}),

  'application/json5': resource => ({data: JSON5.parse(resource.content)})
};

// @flow

'use strict';

const Papa = require('babyparse');
const safeLoad = require('js-yaml').safeLoad;
const setLineEnding = require('crlf-helper').setLineEnding;

const dos2unix = content => setLineEnding(content, 'LF');

const jsonParse = require('./json');
const matrixParse = require('./matrix');

/* ::
import type {Resource, DataPackage} from "../types/datapackage";
*/

module.exports = {
  'text/tab-separated-values': (resource /* : Resource */) => {
    const dialect = Object.assign({
      header: true,
      delimiter: '\t',
      skipEmptyLines: true
    }, resource.dialect);
    return Papa.parse(resource.content, dialect);
  },

  'text/csv': (resource /* : Resource */) => {
    const dialect = Object.assign({
      header: true,
      delimiter: ',',
      skipEmptyLines: true
    }, resource.dialect);
    return Papa.parse(resource.content, dialect);
  },

  'text/plain': (resource /* : Resource */) => ({data: dos2unix(resource.content)}),

  'text/yaml': (resource /* : Resource */) => ({data: safeLoad(resource.content)}),

  'text/matrix': (resource /* : Resource */) => matrixParse(resource.content, resource.dialect),

  'application/json': (resource /* : Resource */) => ({data: jsonParse(resource.content)})
};

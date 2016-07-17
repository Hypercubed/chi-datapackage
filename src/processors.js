'use strict';

const Papa = require('babyparse');
const {safeLoad} = require('js-yaml');
const {setLineEnding} = require('crlf-helper');

const dos2unix = content => setLineEnding(content, 'LF');

const jsonParse = require('./json');
const {processSchema} = require('./schema');
const {matrixParse} = require('./matrix');

const processors = {
  'text/tab-separated-values': {
    translate: ({content}) => Papa.parse(content, {header: true, delimiter: '\t', skipEmptyLines: true})
  },

  'text/csv': {
    translate: ({content}) => Papa.parse(content, {header: true, delimiter: ',', skipEmptyLines: true})
  },

  'text/plain': {  // TODO: check for front matter
    translate: ({content}) => ({data: dos2unix(content)})
  },

  'text/yaml': {
    translate: ({content}) => ({data: safeLoad(content)})
  },

  'text/matrix': {
    translate: ({content}) => matrixParse(content)
  },

  'application/json': {
    translate: ({content, path}) => {
      const data = jsonParse(content);
      if (data.url && data.url.indexOf('api.github.com') > -1) {  // move
        data.name = `${data.owner.login}/${data.id}`;
        path = `gists/${data.id}`;
      }
      return {data, path};
    }
  }
};

function processPackage (dataPackage) {
  // todo: process schemas?
  const resources = dataPackage.resources.map(processResource);
  return Object.assign({}, dataPackage, {resources});
}

function processResource (resource) {
  resource = Object.assign({}, resource);
  if (resource.content) {
    const processor = processors[resource.mediatype];
    if (processor && processor.translate) {
      Object.assign(resource, processor.translate(resource));
    }
  }
  if (resource.schema) {
    Object.assign(resource, processSchema(resource));
  }
  return resource;
}

module.exports = {
  processPackage,
  processResource
};

'use strict';

const Papa = require('babyparse');
const {safeLoad} = require('js-yaml');
const {setLineEnding} = require('crlf-helper');

const dos2unix = content => setLineEnding(content, 'LF');
const papaTranslate = (load, spec) => Papa.parse(load.content, spec);

const jsonParse = require('./json');
const {processSchema} = require('./schema');

const processors = {
  'text/tab-separated-values': {
    translate: load => papaTranslate(load, {header: true, delimiter: '\t', skipEmptyLines: true})
  },

  'text/csv': {
    translate: load => papaTranslate(load, {header: true, delimiter: ',', skipEmptyLines: true})
  },

  'text/plain': {  // TODO: check for front matter
    translate: load => ({data: dos2unix(load.content)})
  },

  'text/yaml': {
    translate: load => ({data: safeLoad(load.content)})
  },

  'application/json': {
    translate: load => {
      const data = jsonParse(load.content);
      let path = load.path;
      if (data.url && data.url.indexOf('api.github.com') > -1) {  // move
        data.name = `${data.owner.login}/${data.id}`;
        path = `gists/${data.id}`;
      }
      return {data, path};
    }
  }
};

function processByType (resource) {
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
  processors,
  processByType
};

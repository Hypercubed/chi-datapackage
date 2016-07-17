'use strict';

const urijs = require('urijs');
const deepExtend = require('deep-extend');

const MimeLookup = require('mime-lookup');
const mimeTypes = require('./mime.json');

class Normalizer {
  constructor (opts) {
    opts = opts || {};
    this.mime = new MimeLookup(opts.mimeDb || mimeTypes);
  }

  datapackage (datapackage) {
    const path = datapackage.path;
    const uri = urijs(path);
    const dir = uri.normalizePathname().directory();
    const base = `${datapackage.base || dir}/`;

    const normalized = deepExtend({
      path,
      base,
      name: dir,
      resources: [],
      homepage: base,
      description: ''
    }, datapackage);

    ['image', 'readme'].forEach(key => {
      if ({}.hasOwnProperty.call(normalized, key)) {
        normalized[key] = urijs(normalized[key], base).href();
      }
    });

    if (normalized.resources) {
      normalized.resources = normalized.resources.map(resource => this.resource(normalized, resource));
    }

    if (normalized.schemas) {
      const schemas = normalized.schemas;
      for (const key in schemas) {
        if ({}.hasOwnProperty.call(schemas, key)) {
          schemas[key].key = schemas[key].key || key;
        }
      }
    }

    this.index(normalized);

    return normalized;
  }

  resource (datapackage, resource) {
    if (typeof resource === 'string') {
      resource = {path: resource};
    }

    if (resource.path || resource.url) {
      const uri = urijs(resource.path || resource.url);

      resource.format = resource.format || uri.suffix();
      resource.name = resource.name || uri.filename();

      resource.url = resource.url || uri.absoluteTo(datapackage.base).href();
    }

    if (resource.format) {
      resource.mediatype = resource.mediatype || this.mime.lookup(resource.format);
    }

    if (resource.schema && typeof resource.schema === 'string') {
      resource.schema = datapackage.schemas[resource.schema]; // TODO: check for URLS, catch missing schemas
    }

    return resource;
  }

  index (datapackage) {
    datapackage.$resourcesByName = {};
    datapackage.resources.forEach(r => {
      if (r.name) {
        datapackage.$resourcesByName[r.name] = r;
      }
    });
    return datapackage;
  }
}

module.exports = Normalizer;

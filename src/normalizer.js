'use strict';

const urijs = require('urijs');
const deepExtend = require('deep-extend');

class Normalizer {
  constructor (opts) {
    opts = opts || {};
    this.mime = opts.mimeLookup;
  }

  datapackage (datapackage) {
    const path = datapackage.path || datapackage.url;
    const uri = urijs(path);
    const dir = uri.normalizePathname().directory();
    const base = path;

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

    if (normalized.schemas) {
      const schemas = normalized.schemas;
      for (const key in schemas) {
        if ({}.hasOwnProperty.call(schemas, key)) {
          schemas[key].key = schemas[key].key || key;
        }
      }
    }

    return normalized;
  }

  // TODO: 1.0.0-beta.15: only one of url, path, data present
  resources (datapackage) {
    if (datapackage.resources) {
      datapackage.resources = datapackage.resources.map(resource => this.resource(datapackage, resource));
    }
    Normalizer.index(datapackage);
    return datapackage;
  }

  resource (datapackage, resource) {
    if (typeof resource === 'string') {
      resource = {path: resource};
    }

    if (resource.path || resource.url) {
      const uri = urijs(resource.path || resource.url);

      resource.format = resource.format || uri.suffix();
      resource.name = resource.name || uri.filename();

      resource.url = resource.url || uri.absoluteTo(datapackage.url).href();
    }

    if (!resource.format && !resource.content && resource.data) {
      resource.format = 'json';
    }

    if (resource.format) {
      resource.mediatype = resource.mediatype || this.mime.lookup(resource.format);
    }

    if (resource.schema && typeof resource.schema === 'string') {
      resource.schema = datapackage.schemas[resource.schema]; // TODO: check for URLS, catch missing schemas
    }

    return resource;
  }
}

Normalizer.index = function index (datapackage) {
  datapackage.$resourcesByName = {};
  datapackage.resources.forEach(r => {
    if (r.name) {
      datapackage.$resourcesByName[r.name] = r;
    }
  });
  return datapackage;
};

module.exports = Normalizer;

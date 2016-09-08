'use strict';

const assert = require('assert');
const urijs = require('urijs');
const deepExtend = require('deep-extend');
const cuid = require('cuid');

class Normalizer {
  constructor (opts) {
    assert(opts && typeof opts.mimeLookup === 'object', 'opts.mimeLookup is required.');
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
      description: '',
      schemas: {}
    }, datapackage);

    ['image', 'readme'].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(normalized, key)) {
        normalized[key] = urijs(normalized[key], base).href();
      }
    });

    return normalized;
  }

  resource (datapackage, resource) {
    if (typeof resource === 'string') {
      resource = {path: resource};
    }

    resource = deepExtend({}, resource);

    if (resource.path || resource.url) {
      const uri = urijs(resource.path || resource.url);

      resource.format = resource.format || uri.suffix();
      resource.name = resource.name || uri.filename();

      resource.url = resource.url || uri.absoluteTo(datapackage.url).href();
    }

    resource.name = resource.name || cuid();

    if (!resource.format && !resource.content && resource.data) {
      resource.format = 'json';
    }

    if (resource.format) {
      resource.mediatype = resource.mediatype || this.mime.lookup(resource.format);
    }

    return resource;
  }
}

function getResourceIndex (datapackage) {
  const $resourcesByName = {};
  datapackage.resources.forEach(r => {
    if (r.name) {
      $resourcesByName[r.name] = r;
    }
  });
  return $resourcesByName;
}

Normalizer.index = getResourceIndex;

module.exports = Normalizer;

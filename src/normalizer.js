'use strict';

const assert = require('assert');
const urijs = require('urijs');
const cuid = require('cuid');
const debug = require('debug')('Normalizer');

const resolve = require('./lib/resolve');
const normalizeObject = require('./lib/utils').normalizeObject;

class Normalizer {
  constructor (opts) {
    assert(opts && typeof opts.mimeLookup === 'object', 'opts.mimeLookup is required.');
    this.mime = opts.mimeLookup;
  }

  datapackage (datapackage) {
    debug('Normalizing datapackage', datapackage);
    datapackage = normalizeObject(datapackage);

    const path = datapackage.path || datapackage.url; // TODO: move into resolve.datapackage
    const uri = urijs(path);
    const dir = uri.normalizePathname().directory();
    const base = path;

    const normalized = Object.assign({
      path,
      base,
      name: dir,
      homepage: base,
      description: '',
      schemas: {}
    }, datapackage, {
      resources: datapackage.resources ? datapackage.resources.slice() : []
    });

    const id = resolve.datapackage(normalized);
    Object.assign(normalized, id, {base: id.url});

    ['image', 'readme'].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(normalized, key)) {
        normalized[key] = urijs(normalized[key], base).href();
      }
    });

    return normalized;
  }

  resource (datapackage, resource) {
    resource = normalizeObject(resource);

    if (resource.path || resource.url) {  // TODO: move into resolve.resource
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

  static index (datapackage) {
    const $resourcesByName = {};
    datapackage.resources.forEach(r => {
      if (r.name) {
        $resourcesByName[r.name] = r;
      }
    });
    return $resourcesByName;
  }
}

module.exports = Normalizer;

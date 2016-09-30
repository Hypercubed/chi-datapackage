'use strict';

const assert = require('assert');
const debug = require('debug')('Loader');

const JSON5 = require('json5');
const resolve = require('./lib/resolve');
const normalizeObject = require('./lib/utils').normalizeObject;

class Loader {
  constructor (opts) {
    assert(opts && typeof opts.fetch === 'function', 'opts.fetch is required.');
    this.fetch = opts.fetch;
    this.read = opts.read;
  }

  load (pathOrUrl) {
    if (!process.browser && pathOrUrl.indexOf('file://') === 0) {
      assert(typeof this.read === 'function', 'loader.read is not allowed');
      return this.read(pathOrUrl.replace('file://', ''));
    }
    return this.fetch(pathOrUrl);
  }

  datapackage (datapackage) {
    debug('Loading datapackage', datapackage);
    datapackage = normalizeObject(datapackage);

    const id = resolve.datapackage(datapackage);
    const url = id.dataPackageJsonUrl;
    Object.assign(datapackage, id, {base: id.url});

    if (!url) {
      return Promise.resolve(datapackage);
    }

    return this.load(url)
      .then(JSON5.parse)
      .then(res => Object.assign(datapackage, res))
      .catch(err => {
        if (err.code === 'ENOENT') {
          throw new Error(`No DataPackage at path '${url}'`);
        }
        /* istanbul ignore next */
        throw err;
      });
  }

  resources (resources) {
    return Promise
      .all(resources.map(r => this.resource(r)));
  }

  resource (resource) {
    debug('Loading resource', resource);
    resource = normalizeObject(resource);

    const url = resource.url;
    if (!url) {
      return Promise.resolve(resource);
    }

    return this.load(url)
      .catch(err => {
        if (err.code === 'ENOENT') {
          throw new Error(`No DataPackage resource at path '${url}'`);
        }
        /* istanbul ignore next */
        throw err;
      })
      .then(res => {
        resource.content = res;
        return resource;
      });
  }
}

module.exports = Loader;

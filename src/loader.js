'use strict';

const path = require('path');
const assert = require('assert');
const debug = require('debug')('Loader');
const identifier = require('datapackage-identifier');

const JSON5 = require('json5');
// const url = require('url');

const absURLRegEx = /^([^\/]+:\/\/|\/)/;
// const forwardSlashPattern = /\//g;
const backSlashPattern = /\\/g;
// const protocolPattern = /^([a-z0-9.+-]+):\/\//i;

const resolvePath = (() => {
  /* istanbul ignore next , in browser*/
  if (typeof document !== 'undefined') {
    return function resolve (url) {
      const div = document.createElement('div');
      div.innerHTML = '<a></a>';
      div.firstChild.href = url; // Ensures that the href is properly escaped
      div.innerHTML = div.innerHTML; // Run the current innerHTML back through the parser
      return div.firstChild.href;
    };
  }

  return url => {
    url = path
      .resolve(url)  // ensures path is absolute
      .replace(backSlashPattern, '/');  // ensures path is POSIX, ready to be a url
    return (url[0] === '/') ? url : `/${url}`;
  };
})();

function isFilePath (url) {
  return (!process.browser && url.indexOf('file://') === 0);
}

class Loader {
  constructor (opts) {
    assert(opts && typeof opts.fetch === 'function', 'opts.fetch is required.');
    this.fetch = opts.fetch;
    this.read = opts.read;
  }

  load (pathOrUrl) {
    if (isFilePath(pathOrUrl)) {
      return this.read(pathOrUrl.replace('file://', ''));
    }
    return this.fetch(pathOrUrl);
  }

  datapackage (datapackage) {
    debug('Loading datapackage', datapackage);
    if (typeof datapackage === 'string') {
      datapackage = {path: datapackage};
    }
    const id = getIdentifier(datapackage);
    const url = id.dataPackageJsonUrl;
    id.base = id.url;

    if (!url) {
      return Promise.resolve(datapackage);
    }

    return this.load(url)
      .catch(err => {
        if (err.code === 'ENOENT') {
          throw new Error(`No DataPackage at path '${url}'`);
        }
        /* istanbul ignore next */
        throw err;
      })
      .then(JSON5.parse)
      .then(res => Object.assign(res, datapackage, id));
  }

  resources (resources) {
    return Promise
      .all(resources.map(r => this.resource(r)));
  }

  resource (resource) {
    resource = Object.assign({}, resource);
    debug('Loading resource', resource);

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

Loader.id = getIdentifier;

function getIdentifier (datapackage) {
  let url = datapackage.path || datapackage.url;
  url = url.replace(backSlashPattern, '/');
  if (!url.match(absURLRegEx)) {
    url = resolvePath(url);
  }
  if (url.indexOf('file://') === 0) {
    return {
      url,
      dataPackageJsonUrl: url
    };
  }
  return identifier.parse(url);
}

module.exports = Loader;

'use strict';

const assert = require('assert');
const debug = require('debug')('Loader');

const parse = require('json5').parse;
// const url = require('url');

const identifier = require('datapackage-identifier');

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
  const path = require('path');

  return url => {
    url = path
      .resolve(url)  // ensures path is absolute
      .replace(backSlashPattern, '/');  // ensures path is POSIX, ready to be a url
    return (url[0] === '/') ? url : `/${url}`;
  };
})();

class Loader {
  constructor (opts) {
    assert(opts && typeof opts.fetch === 'function', 'opts.fetch is required.');
    this.fetch = opts.fetch;
  }

  datapackage (datapackage) {
    debug('Loading datapackage', datapackage);
    if (typeof datapackage === 'string') {
      datapackage = {path: datapackage};
    }
    const id = getIdentifier(datapackage);
    const url = id.dataPackageJsonUrl;
    id.base = id.url;

    return this
      .fetch(url)
      .catch(err => {
        if (err.code === 'ENOENT') {
          throw new Error(`No DataPackage at path '${url}'`);
        }
        /* istanbul ignore next */
        throw err;
      })
      .then(parse)
      .then(res => Object.assign(res, datapackage, id));
  }

  resources (resources) {
    return Promise
      .all(resources.map(r => this.resource(r)));
  }

  resource (resource) {
    resource = Object.assign({}, resource);
    debug('Loading resource', resource);
    if (!resource.url) {
      return Promise.resolve(resource);
    }
    return this
      .fetch(resource.url)
      .catch(err => {
        if (err.code === 'ENOENT') {
          throw new Error(`No DataPackage resource at path '${resource.url}'`);
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
  url = url.match(absURLRegEx) ? url : resolvePath(url);
  return identifier.parse(url);
}

module.exports = Loader;

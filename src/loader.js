'use strict';

const debug = require('debug')('Loader');
const parse = require('json5').parse;

const identifier = require('datapackage-identifier');

const absURLRegEx = /^([^\/]+:\/\/|\/)/;

const resolvePath = (() => {
  if (typeof document !== 'undefined') {
    // in browser
    return function resolve (url) {
      const div = document.createElement('div');
      div.innerHTML = '<a></a>';
      div.firstChild.href = url; // Ensures that the href is properly escaped
      div.innerHTML = div.innerHTML; // Run the current innerHTML back through the parser
      return div.firstChild.href;
    };
  }
  return require('path').resolve;
})();

function normalizeDataPackageUrl (datapackage) {
  if (typeof datapackage === 'string') {
    datapackage = {url: datapackage};
  }
  if (!datapackage.dataPackageJsonUrl) {
    let url = datapackage.path || datapackage.url;
    url = url.match(absURLRegEx) ? url : resolvePath(url);
    datapackage = Object.assign(datapackage, identifier.parse(url));
  }
  return datapackage;
}

class Loader {
  constructor (opts) {
    this.fetch = opts.fetch;
  }

  datapackage (datapackage) {
    debug('Loading datapackage', datapackage);
    datapackage = normalizeDataPackageUrl(datapackage);
    const dataPackageJsonUrl = datapackage.dataPackageJsonUrl;
    return this
      .fetch(dataPackageJsonUrl)
      .catch(err => {
        if (err.code === 'ENOENT') {
          throw new Error(`No DataPackage at path '${dataPackageJsonUrl}'`);
        }
        /* istanbul ignore next */
        throw err;
      })
      .then(parse)
      .then(res => Object.assign(datapackage, res, datapackage));
  }

  resources (datapackage) {
    return Promise
      .all(datapackage.resources.map(r => this.resource(r)))
      .then(() => datapackage);
  }

  resource (resource) {
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

module.exports = Loader;

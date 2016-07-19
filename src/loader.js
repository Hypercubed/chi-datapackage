const path = require('path');
const debug = require('debug')('Loader');
const parse = require('json5').parse;

const identifier = require('datapackage-identifier');

function normalizeDataPackageUrl (datapackage) {
  if (typeof datapackage === 'string') {
    let id = datapackage;
    if (id[0] === '/' || (id.indexOf('http') === -1 && id[datapackage.length - 1] === '/')) {
      id = path.resolve(id);
    }
    datapackage = identifier.parse(id);
  } else if (!datapackage.dataPackageJsonUrl && datapackage.path) {
    let id = path.resolve(datapackage.path);
    id = identifier.parse(id);
    datapackage = Object.assign(datapackage, id);
  } else if (!datapackage.dataPackageJsonUrl && datapackage.url) {
    const id = identifier.parse(datapackage.url);
    datapackage = Object.assign(datapackage, id);
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

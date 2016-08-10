// @flow

'use strict';

/* ::
type fetch = (url: string) => Promise<string>;
*/

const debug = require('debug')('Loader');
const jsonParse = require('json5').parse;

const idParse = require('datapackage-identifier').parse;

const absURLRegEx = /^([^\/]+:\/\/|\/)/;

const resolvePath = (() => {
  if (typeof document !== 'undefined') {
    // in browser
    return function resolve (url) {
      const div = document.createElement('div');
      const link = document.createElement('a');
      div.appendChild(link);
      link.href = url; // Ensures that the href is properly escaped
      div.innerHTML = div.innerHTML; // Run the current innerHTML back through the parser
      return link.href;
    };
  }
  return require('path').resolve;
})();

function normalizeDataPackageUrl (datapackage /* : string | DataPackage */) /* : DataPackage */ {
  if (typeof datapackage === 'string') {
    datapackage = {url: datapackage};
  }
  if (!datapackage.dataPackageJsonUrl) {
    let url = datapackage.path || datapackage.url;
    if (url) {
      url = url.match(absURLRegEx) ? url : resolvePath(url);
      return Object.assign(datapackage, idParse(url));
    }
  }
  return datapackage;
}

class Loader {
  /* ::
  fetch: fetch;
  */

  constructor (opts /* : { fetch: fetch } */) {
    this.fetch = opts.fetch;
  }

  datapackage (datapackage /* : DataPackage */) /* : Promise<DataPackage> */ {
    debug('Loading datapackage', datapackage);
    datapackage = normalizeDataPackageUrl(datapackage);
    const dataPackageJsonUrl /* : string | typeof undefined */ = datapackage.dataPackageJsonUrl;
    return this
      .fetch(dataPackageJsonUrl)
      .catch((err /* : Object */) => {
        if (err.code === 'ENOENT') {
          throw new Error(`No DataPackage at path '${dataPackageJsonUrl}'`);
        }
        /* istanbul ignore next */
        throw err;
      })
      .then(jsonParse)
      .then((res /* : Object */) => Object.assign(datapackage, res, datapackage));
  }

  resources (datapackage /* : DataPackage */) /* : Promise<DataPackage> */ {
    if (!datapackage.resources) {
      return Promise.resolve(datapackage);
    }
    return Promise
      .all(datapackage.resources.map(r => this.resource(r)))
      .then(() => datapackage);
  }

  resource (resource /* : Resource */) /* : Promise<Resource> */ {
    debug('Loading resource', resource);
    const url = resource.url;
    if (!url) {
      return Promise.resolve(resource);
    }
    return this
      .fetch(url)
      .catch((err /* : Object */) => {
        if (err.code === 'ENOENT') {
          throw new Error(`No DataPackage resource at path '${url}'`);
        }
        /* istanbul ignore next */
        throw err;
      })
      .then((res /* : string */) => {
        resource.content = res;
        return resource;
      });
  }
}

module.exports = Loader;

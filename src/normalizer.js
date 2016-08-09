// @flow
'use strict';

const urijs = require('urijs');
const deepExtend = require('deep-extend');

/* ::
import type MimeLookup from 'mime-lookup';
import type {Resource, DataPackage} from "./types/datapackage";
*/

class Normalizer {
  /* ::
  static index: function
  mime: MimeLookup
  */

  constructor (opts /* : Object */) {
    opts = opts || {};
    this.mime = opts.mimeLookup;
  }

  datapackage (datapackage /* : DataPackage */) /* : DataPackage */ {
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

  resources (datapackage /* : DataPackage */) /* : DataPackage */ {
    if (datapackage.resources) {
      datapackage.resources = datapackage.resources.map(resource => this.resource(datapackage, resource));
    }
    Normalizer.index(datapackage);
    return datapackage;
  }

  resource (datapackage /* : DataPackage */, resource /* : string | Resource */) /* : Resource */ {
    if (typeof resource === 'string') {
      const r /* : Resource */ = {path: resource};
      resource = r;
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
      if (datapackage.schemas && Object.prototype.hasOwnProperty.call(datapackage.schemas, resource.schema)) {
        resource.schema = datapackage.schemas[resource.schema]; // TODO: check for URLS, catch missing schemas
      }
    }

    return resource;
  }
}

Normalizer.index = function index (datapackage /* : DataPackage */) /* : DataPackage */ {
  if (datapackage.resources) {
    datapackage.$resourcesByName = {};
    datapackage.resources.forEach(r => {
      if (datapackage.$resourcesByName && r.name) {
        datapackage.$resourcesByName[r.name] = r;
      }
    });
  }
  return datapackage;
};

module.exports = Normalizer;

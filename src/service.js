// @flow

'use strict';

const MimeLookup = require('mime-lookup');

const Normalizer = require('./normalizer');
const Processor = require('./processor');
const SchemaProcessor = require('./schema');
const Loader = require('./loader');

const mimeDb = require('./lib/mime');
const translators = require('./lib/translators');
const types = require('./lib/types');
const fetch = require('./lib/fetch');

class DataPackageService {
  /* ::
  normalize: Normalizer;
  processor: Processor;
  loader: Loader;
  */

  constructor () {
    const mimeLookup = new MimeLookup(mimeDb);
    const schemaProcessor = new SchemaProcessor({types});

    this.normalize = new Normalizer({mimeLookup});
    this.processor = new Processor({translators, schemaProcessor});
    this.loader = new Loader({fetch});
  }

  normalizePackage (p /* : DataPackage */) /* : DataPackage */ {
    return this.normalize.datapackage(p);
  }

  normalizeResource (p /* : DataPackage */, r /* : Resource */) /* : Resource */ {
    return this.normalize.resource(p, r);
  }

  normalizeResources (p /* : DataPackage */) /* : DataPackage */ {
    return this.normalize.resources(p);
  }

  loadPackage (p /* : DataPackage */) /* : Promise<DataPackage> */ {
    return this.loader.datapackage(p);
  }

  processResource (r /* : Resource */) /* : Resource */ {
    return this.processor.resource(r);
  }

  load (datapackage /* : DataPackage */)  /* : Promise<DataPackage> */ {
    return this.loader.datapackage(datapackage)
      .then(p => this.normalize.datapackage(p))
      .then(p => this.normalize.resources(p))
      .then(p => this.loader.resources(p))
      .then(p => this.processor.datapackage(p));
  }
}

module.exports = DataPackageService;

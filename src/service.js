'use strict';

const MimeLookup = require('mime-lookup');

const Normalizer = require('./normalizer');
const Processor = require('./processor.js');
const SchemaProcessor = require('./schema');
const Loader = require('./loader');

const mimeDb = require('./lib/mime.json');
const translators = require('./lib/translators');
const types = require('./lib/types');
const fetch = require('./lib/fetch');

class DataPackageService {
  constructor () {
    const mimeLookup = new MimeLookup(mimeDb);
    const schemaProcessor = new SchemaProcessor({types});

    this.normalize = new Normalizer({mimeLookup});
    this.processor = new Processor({translators, schemaProcessor});
    this.loader = new Loader({fetch});
  }

  normalizePackage (p) {
    return this.normalize.datapackage(p);
  }

  normalizeResource (p) {
    return this.normalize.resource(p);
  }

  normalizeResources (p) {
    return this.normalize.resources(p);
  }

  loadPackage (p) {
    return this.loader.datapackage(p);
  }

  processResource (r) {
    return this.processor.resource(r);
  }

  load (datapackage) {
    const self = this;

    return self.loader.datapackage(datapackage)
      .then(p => self.normalize.datapackage(p))
      .then(p => self.normalize.resources(p))
      .then(p => self.loader.resources(p))
      .then(p => self.processor.datapackage(p));
  }
}

module.exports = DataPackageService;

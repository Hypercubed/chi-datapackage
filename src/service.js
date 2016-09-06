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

    this.schemaProcessor = new SchemaProcessor({types});
    this.normalize = new Normalizer({mimeLookup});
    this.processor = new Processor({translators, schemaProcessor: this.schemaProcessor});
    this.loader = new Loader({fetch});
  }

  normalizePackage (p) {
    return Object.assign(p, this.normalize.datapackage(p));
  }

  normalizeResource (p, r) {
    return Object.assign(r, this.normalize.resource(p, r));
  }

  normalizeResources (p) {
    p.resources = (Array.isArray(p.resources)) ? p.resources.map(r => this.normalize.resource(p, r)) : [];
    p.$resourcesByName = Normalizer.index(p);
    return p;
  }

  normalizeSchemas (p) {
    p.resources.forEach(r => this.schemaProcessor.normalizeResource(p, r));

    for (const key in p.schemas) {
      if (Object.prototype.hasOwnProperty.call(p.schemas, key)) {
        p.schemas[key].key = p.schemas[key].key || key;
        p.schemas[key].fields = p.schemas[key].fields.map(f => this.schemaProcessor.normalizeField(f));
      }
    }

    return p;
  }

  loadPackage (p) {
    return this.loader.datapackage(p);
  }

  loadResources (p) {
    return this.loader.resources(p.resources)
      .then(r => {
        p.resources = r;
        return p;
      });
  }

  processResource (r) {
    try {
      return Object.assign(r, this.processor.resource(r));
    } catch (err) {
      return Object.assign(r, {$valid: false, $error: err});
    }
  }

  processPackage (p) {
    Object.assign(p, this.processor.datapackage(p));
    p.$resourcesByName = Normalizer.index(p);
    return p;
  }

  updateResource (p, r) {
    Object.assign(r, this.normalize.resource(p, r));
    p.$resourcesByName = Normalizer.index(p);
    return Object.assign(r, this.processor.resource(r));
  }

  addResource (p, r) {
    p.resources.push(r);
    Object.assign(r, this.normalize.resource(p, r));
    p.$resourcesByName = Normalizer.index(p);
    return Object.assign(r, this.processor.resource(r));
  }

  load (datapackage) {
    const self = this;

    return self.loader.datapackage(datapackage)
      .then(p => self.normalizePackage(p))
      .then(p => self.normalizeResources(p))
      .then(p => self.normalizeSchemas(p))
      .then(p => self.loadResources(p))
      .then(p => self.processPackage(p));
  }
}

module.exports = DataPackageService;

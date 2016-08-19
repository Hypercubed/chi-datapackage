'use strict';

const deepExtend = require('deep-extend');

class Processor {
  constructor (opts) {
    opts = opts || {};
    this.translators = deepExtend({}, opts.translators);
    this.schemaProcessor = opts.schemaProcessor;
  }

  datapackage (dataPackage) {
    dataPackage = Object.assign({}, dataPackage);
    dataPackage.resources = dataPackage.resources.map(resource => this.resource(resource));
    return dataPackage;
  }

  resource (resource) {
    const r = Object.assign({}, resource);
    if (r.content) {
      const translator = this.translators[r.mediatype];
      if (translator) {
        Object.assign(r, translator(r));
      }
    }
    if (r.schema) {
      return Object.assign(r, this.schemaProcessor.process(r));
    }
    return r;
  }
}

module.exports = Processor;

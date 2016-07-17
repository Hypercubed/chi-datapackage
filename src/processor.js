'use strict';

const deepExtend = require('deep-extend');

class Processor {
  constructor (opts) {
    opts = opts || {};
    this.translators = deepExtend({}, opts.translators);
    this.schemaProcessor = opts.schemaProcessor;
  }

  datapackage (dataPackage) {
    // todo: process schemas?
    const resources = dataPackage.resources.map(resource => this.resource(resource));
    return Object.assign({}, dataPackage, {resources});
  }

  resource (resource) {
    resource = Object.assign({}, resource);
    if (resource.content) {
      const translator = this.translators[resource.mediatype];
      if (translator) {
        Object.assign(resource, translator(resource));
      }
    }
    if (resource.schema) {
      Object.assign(resource, this.schemaProcessor.process(resource));
    }
    return resource;
  }
}

module.exports = Processor;

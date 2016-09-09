'use strict';

const assert = require('assert');
const deepExtend = require('deep-extend');

class Processor {
  constructor (opts) {
    assert(opts && typeof opts.translators === 'object', 'opts.translators is required.');
    assert(opts && typeof opts.schemaProcessor === 'object', 'opts.schemaProcessor is required.');
    this.translators = deepExtend({}, opts.translators);
    this.schemaProcessor = opts.schemaProcessor;
  }

  datapackage (dataPackage) {
    dataPackage = Object.assign({}, dataPackage);
    dataPackage.resources = dataPackage.resources.map(resource => this.resource(resource));
    return dataPackage;
  }

  resource (resource) {
    const mediatype = resource.mediatype;
    const result = Object.assign({}, resource, {
      $error: null,
      errors: []
    });

    if (resource.content && mediatype) {
      if (!Object.prototype.hasOwnProperty.call(this.translators, mediatype)) {
        throw new Error(`Unknown media type ${resource.mediatype}`);
      }
      const translator = this.translators[mediatype];
      Object.assign(result, translator(result));
    }
    if (resource.schema) {
      Object.assign(result, this.schemaProcessor.process(result));
    }
    return result;
  }
}

module.exports = Processor;

// @flow
'use strict';

const deepExtend = require('deep-extend');

/* ::
const SchemaProcessor = require('./schema');
import type {Resource, DataPackage} from "./types/datapackage";
*/

class Processor {
  /* ::
  translators: Object;
  schemaProcessor: SchemaProcessor;
  */

  constructor (opts /* : Object */) {
    opts = opts || {};
    this.translators = deepExtend({}, opts.translators);
    this.schemaProcessor = opts.schemaProcessor;
  }

  datapackage (dataPackage /* : DataPackage */) /* : DataPackage */ {
    // todo: process schemas?
    if (dataPackage.resources && dataPackage.resources.length > 0) {
      const resources = dataPackage.resources.map(resource => this.resource(resource));
      return Object.assign(dataPackage, {resources});
    }
    return dataPackage;
  }

  resource (resource /* : Resource */) /* : Resource */ {
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

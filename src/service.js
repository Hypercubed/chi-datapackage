// @flow

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

/* ::
import type {Resource, DataPackage} from "./types/datapackage";
*/

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

  normalizePackage (p /* : DataPackage */) {
    return this.normalize.datapackage(p);
  }

  normalizeResource (p /* : DataPackage */, r /* : Resource */) {
    return this.normalize.resource(p, r);
  }

  normalizeResources (p /* : DataPackage */) {
    return this.normalize.resources(p);
  }

  loadPackage (p /* : DataPackage */) {
    return this.loader.datapackage(p);
  }

  processResource (r /* : Resource */) {
    return this.processor.resource(r);
  }

  load (datapackage /* : DataPackage */)  /* : Promise<DataPackage> */ {
    const self = this;

    return self.loader.datapackage(datapackage)
      .then(p => self.normalize.datapackage(p))
      .then(p => self.normalize.resources(p))
      .then(p => self.loader.resources(p))
      .then(p => self.processor.datapackage(p));
  }
}

module.exports = DataPackageService;

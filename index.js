const MimeLookup = require('mime-lookup');

const Normalizer = require('./src/normalizer');
const Processor = require('./src/processor.js');
const SchemaProcessor = require('./src/schema');
const Loader = require('./src/loader');

const mimeDb = require('./src/lib/mime.json');
const translators = require('./src/lib/translators');
const types = require('./src/lib/types');
const fetch = require('./src/lib/fetch');

const mimeLookup = new MimeLookup(mimeDb);
const normalize = new Normalizer({mimeLookup});
const schemaProcessor = new SchemaProcessor({types});
const processor = new Processor({translators, schemaProcessor});
const loader = new Loader({fetch});

const normalizePackage = p => normalize.datapackage(p);
const normalizeResources = p => normalize.resources(p);
const loadPackage = p => loader.datapackage(p);

function load (datapackage) {
  return loader.datapackage(datapackage)
    .then(p => normalize.datapackage(p))
    .then(p => normalize.resources(p))
    .then(p => loader.resources(p))
    .then(p => processor.datapackage(p));
}

module.exports = {
  load,
  normalizePackage,
  normalizeResources,
  loadPackage
};

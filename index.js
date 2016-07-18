const MimeLookup = require('mime-lookup');

const Normalizer = require('./src/normalizer');
const Processor = require('./src/processor.js');
const SchemaProcessor = require('./src/schema');

const mimeDb = require('./src/mime.json');
const translators = require('./src/translators');
const types = require('./src/types');

const mimeLookup = new MimeLookup(mimeDb);
const normalize = new Normalizer({mimeLookup});
const schemaProcessor = new SchemaProcessor({types});
const processor = new Processor({translators, schemaProcessor});

module.exports = {
  Normalizer,
  Processor,
  normalizePackage: normalize.datapackage.bind(normalize),
  normalizeResource: normalize.resource.bind(normalize),
  processPackage: processor.datapackage.bind(processor),
  processResource: processor.resource.bind(processor)
};

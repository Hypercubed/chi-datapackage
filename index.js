const {Normalizer} = require('./src/normalizer');
const {processPackage, processResource} = require('./src/processors.js');
const mimeDb = require('./src/mime.json');

const normalize = new Normalizer({mimeDb});

module.exports = {
  Normalizer,
  normalize,
  normalizePackage: normalize.datapackage.bind(normalize),
  normalizeResource: normalize.resource.bind(normalize),
  processPackage,
  processResource
};

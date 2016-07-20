const Normalizer = require('./src/normalizer');
const DataPackageService = require('./src/service');

const dataPackageService = new DataPackageService();

module.exports = dataPackageService;
module.exports.Normalizer = Normalizer;

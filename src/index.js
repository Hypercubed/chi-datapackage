const store = require('./store');
const Normalizer = require('./normalizer');

const dataPackageService = store.dataPackageService;

dataPackageService.Normalizer = Normalizer;
dataPackageService.Resource = store.Resource;
dataPackageService.Package = store.Package;
dataPackageService.makeResource = store.makeResource;
dataPackageService.makePackage = store.makePackage;

module.exports = dataPackageService;

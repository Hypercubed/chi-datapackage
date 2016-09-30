'use strict';

const debug = require('debug')('store');
const keepAlive = require('mobx-utils').keepAlive;
const mobx = require('mobx');

const Normalizer = require('./normalizer');
const DataPackageService = require('./service');

const dataPackageService = new DataPackageService();

const extendObservable = mobx.extendObservable;
const isObservable = mobx.isObservable;
const asFlat = mobx.asFlat;
const action = mobx.action;
const toJS = mobx.toJS;
const asReference = mobx.asReference;
const reaction = mobx.reaction;

const schemaProcessor = dataPackageService.schemaProcessor;
const normalize = dataPackageService.normalize;
const processor = dataPackageService.processor;
const loader = dataPackageService.loader;

function makeNonEnumerable (object, propNames) {
  for (let i = 0; i < propNames.length; i++) {
    addHiddenProp(object, propNames[i], object[propNames[i]]);
  }
}

function addHiddenProp (object, propName, value) {
  Object.defineProperty(object, propName, {
    enumerable: false,
    writable: true,
    configurable: true,
    value
  });
}

const makeResources = (datapackage, resources) =>
  (resources || datapackage.resources).map(resource => makeResource(datapackage, resource));

class Resource {
  constructor (_datapackage_, _resource_) {
    _resource_ = normalize.resource(_datapackage_, _resource_);

    const store = extendObservable(this, _resource_, {
      content: _resource_.content || '',
      $error: null,
      errors: [],
      $valid: true,
      $processedCount: 0,
      data: asReference(''),
      update: action(data => {
        debug('update', data.name);
        data = isObservable(data) ? toJS(data) : data;
        Object.assign(data, {
          name: store.name
        }, data);
        data = normalize.resource(_datapackage_, data);
        schemaProcessor.normalizeResource(_datapackage_, data);
        return Object.assign(this, data);
        // return this.updateData(Object.assign(this, data));
      }),
      updateData: action(data => {
        debug('updateData', data.name);
        try {
          this.$processedCount++;
          data = processor.resource(data);
          if (data.errors && data.errors.length > 0) {
            data.$error = new Error(`Errors processing resource ${data.name}`);
          }
        } catch (err) {
          data.$error = err;
          data.errors = data.errors || [];
          data.errors.shift({
            code: 'Parsing',
            type: err.name,
            message: `Parsing error: ${err.message}`
          });
        }

        if (data.$error || data.errors.length > 0) {
          this.errors = data.errors;
          this.$error = data.$error;
          this.$error.message = this.name;
          this.$valid = false;
        } else {
          this.errors = [];
          this.$error = null;
          this.data = data.data;
          this.$lastValidContent = this.content;
        }
        return this;
      }),
      get core () {
        return {
          name: store.name,
          content: store.content,
          schema: store.schema,
          mediatype: store.mediatype,
          format: store.format,
          dialect: store.dialect,
          $error: null,
          errors: [],
          data: []
        };
      }
    });

    makeNonEnumerable(store, [
      'process',
      'processResults',
      'updateData',
      '$error',
      '$processedCount'
    ]);

    store.update(store);

    reaction(
      () => (store.core),
      data => {
        debug('update *reaction*', data.name);
        store.updateData(data);
      },
      true
    );
  }

  load () {  // TODO: test
    return loader.resource(this)
      .then(this.update);
  }

  dispose () {
    this.processDisposer();
  }
}

class Package {
  constructor (_datapackage_) {
    if (typeof _datapackage_ === 'string') {
      _datapackage_ = {path: _datapackage_};
    }

    _datapackage_ = normalize.datapackage(_datapackage_);

    delete _datapackage_.resources;
    delete _datapackage_.schemas;
    delete _datapackage_.$resourcesByName;

    const store = extendObservable(this, _datapackage_, {
      $isLoadingPackage: false,
      $isLoadingResources: false,
      resources: asFlat(makeResources(_datapackage_, [])),
      // schemas: asReference({}),
      get $resourcesByName () {
        return Normalizer.index(this);
      },
      get isLoading () {
        return this.$isLoadingPackage || this.$isLoadingResources;
      },
      load: action(() => {
        this.$isLoadingPackage = true;
        return loader.datapackage(this)
          .then(this.update);
      }),
      loadResources: action(() => {
        this.$isLoadingResources = true;
        return loader.resources(this.resources)
          .then(this.replaceResources);
      }),
      update: action(data => {
        data = isObservable(data) ? toJS(data) : data;
        Object.assign(this, data);
        this.normalize();
        this.$isLoadingPackage = false;
        return this.loadResources();
      }),
      replaceResources: action(arr => {
        this.$isLoadingResources = false;
        this.resources.replace(makeResources(this, arr));
        return this;
      }),
      normalize: action(() => {
        const p = normalize.datapackage(this);

        // normalize resources
        const resources = p.resources.map(resource => {
          resource = normalize.resource(p, resource);
          schemaProcessor.normalizeResource(p, resource);
          return resource;
        });

        // normalize schemas
        for (let key in p.schemas) { // eslint-disable-line prefer-const
          if (Object.prototype.hasOwnProperty.call(p.schemas, key)) {
            p.schemas[key].key = p.schemas[key].key || key;
            p.schemas[key].fields = p.schemas[key].fields
              .map(f => schemaProcessor.normalizeField(f));
          }
        }

        return Object.assign(this, p, {resources});
      }),
      addResource: action(resource => {
        this.resources.push(makeResource(this, resource));
      })
    });

    makeNonEnumerable(store, [
      'load',
      'loadResources',
      'update',
      'replaceResources',
      'normalize',
      'addResource'
    ]);

    this.stop$resourcesByName = keepAlive(store, '$resourcesByName');
  }

  updateResource (resource) {
    this.resources.find(p => resource.name === p.name).update(resource);
  }

  dispose () {
    this.stop$resourcesByName();
  }
}

function makeResource (datapackage, resource) {
  if (isObservable(resource)) {
    return resource;
  }
  return new Resource(datapackage, resource);
}

function makePackage (datapackage) {
  if (isObservable(datapackage)) {
    return datapackage;
  }
  return new Package(datapackage);
}

module.exports = {
  dataPackageService,
  Resource,
  Package,
  makeResource,
  makePackage,
  loadPackage: action(path => makePackage(path).load())
};

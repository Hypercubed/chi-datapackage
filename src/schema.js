'use strict';

const deepExtend = require('deep-extend');

// Note: some code based on https://github.com/frictionlessdata/datapackage-render-js/blob/master/datapackage.js
// MIT Open Knowledge Labs <labs@okfn.org>

// TODO: https://github.com/frictionlessdata/jsontableschema-js

function nullCheck (mv, fn) {
  return d => {
    if (mv.indexOf(d) !== -1) {
      return null;
    }
    return fn(d);
  };
}

function normalizeField (input) {
  const r = Object.assign({
    format: 'default',
    missingValues: input.type === 'string' ? undefined : [''],
    pattern: null
  }, input);
  r.missingValues = Array.isArray(r.missingValues) ? r.missingValues : [r.missingValues];
  if (r.format.indexOf(':') !== -1) {
    const s = r.format.split(':');
    r.format = s[0];
    r.pattern = s[1];
  }
  return r;
}

class Schema {
  constructor (opts) {
    opts = opts || {};
    deepExtend(this, opts);
  }

  generate (schema) {
    const castMap = {};
    schema.fields.forEach(field => {
      const fn = this.generateCastFn(field);
      if (fn) {
        castMap[field.name] = fn;
      }
    });
    return castMap;
  }

  generateCastFn (field) {
    field = normalizeField(field);
    if (!field.type || !Object.prototype.hasOwnProperty.call(this.types, field.type)) {
      return null;
    }
    const type = this.types[field.type];
    let map = type[field.format];
    if (field.pattern) {
      map = map(field.pattern);
    }
    if (field.missingValues) {
      return nullCheck(field.missingValues, map);
    }
    return map;
  }

  process (resource) {
    /* istanbul ignore if */
    if (!Array.isArray(resource.data)) {
      return {data: resource.data};
    }

    const castMap = resource.schema.$castMap || (resource.schema.$castMap = this.generate(resource.schema));

    return {data: resource.data.map(d => {
      const r = {};
      for (const key in d) { /* eslint guard-for-in: 0 */
        r[key] = (key in castMap) ? castMap[key](d[key]) : d[key];
      }
      return r;
    })};
  }
}

module.exports = Schema;

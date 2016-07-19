'use strict';

const deepExtend = require('deep-extend');

// Note: some code based on https://github.com/frictionlessdata/datapackage-render-js/blob/master/datapackage.js
// MIT Open Knowledge Labs <labs@okfn.org>

// TODO: https://github.com/frictionlessdata/jsontableschema-js

class Schema {
  constructor (opts) {
    opts = opts || {};
    deepExtend(this, opts);
  }

  generate (schema) {
    const castMap = {};
    schema.fields.forEach(field => {
      field.format = field.format || 'default';
      if (field.type in this.types) {
        const type = this.types[field.type];
        castMap[field.name] = type[field.format] || type.default;
      }
    });
    return castMap;
  }

  process (resource) {
    let data = resource.data;
    /* istanbul ignore if */
    if (!Array.isArray(data)) {
      return {data};
    }

    const castMap = resource.schema.$castMap || (resource.schema.$castMap = this.generate(resource.schema));

    data = data.map(d => {
      const r = {};
      for (const key in d) { /* eslint guard-for-in: 0 */
        r[key] = (key in castMap) ? castMap[key](d[key]) : d[key];
      }
      return r;
    });

    return {data};
  }
}

module.exports = Schema;

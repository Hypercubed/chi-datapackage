// @flow

'use strict';

const deepExtend = require('deep-extend');

// Note: some code based on https://github.com/frictionlessdata/datapackage-render-js/blob/master/datapackage.js
// MIT Open Knowledge Labs <labs@okfn.org>

// TODO: https://github.com/frictionlessdata/jsontableschema-js

class Schema {
  /* ::
  types: TypesMap
  */

  constructor (opts /* : { types: TypesMap } */) {
    opts = opts || {};
    deepExtend(this, opts);
  }

  generate (schema /* : SchemaType */) /* : CastMap */ {
    const castMap /* : CastMap */ = {};
    schema.fields.forEach(field => {
      const fn = this.generateCastFn(field);
      if (fn) {
        castMap[field.name] = fn;
      }
    });
    return castMap;
  }

  generateCastFn (field /* : FieldType */) /* : function | null */ {
    if (!field.type || !Object.prototype.hasOwnProperty.call(this.types, field.type)) {
      return null;
    }
    const type = this.types[field.type];
    let format = field.format || 'default';
    let pattern /* : string | null */ = null;
    if (format.indexOf(':') !== -1) {
      const s = format.split(':');
      format = s[0];
      pattern = s[1];
    }
    const map = type[format] || type.default;
    return pattern ? map(pattern) : map;
  }

  process (resource /* : Resource */) /* : Object */ {
    let data = resource.data;
    /* istanbul ignore if */
    if (!Array.isArray(data) || !resource.schema) {
      return {data};
    }

    const schema /* : SchemaType */ = resource.schema;
    const castMap /* : CastMap */ = schema.$castMap || (schema.$castMap = this.generate(schema));

    data = data.map((d /* : Object */) /* : Object */ => {
      const r /* : Object */ = {};
      for (const key in d) { /* eslint guard-for-in: 0 */
        r[key] = (key in castMap) ? castMap[key](d[key]) : d[key];
      }
      return r;
    });

    return {data};
  }
}

module.exports = Schema;

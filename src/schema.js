// @flow

'use strict';

const deepExtend = require('deep-extend');

// Note: some code based on https://github.com/frictionlessdata/datapackage-render-js/blob/master/datapackage.js
// MIT Open Knowledge Labs <labs@okfn.org>

// TODO: https://github.com/frictionlessdata/jsontableschema-js

/* ::
import type {Resource, DataPackage} from "./types/datapackage";
*/

class Schema {
  /* ::
  types: Object
  */

  constructor (opts /* : Object */) {
    opts = opts || {};
    deepExtend(this, opts);
  }

  generate (schema /* : Object */) /* : Object */ {
    const castMap = {};
    schema.fields.forEach(field => {
      const fn = this.generateCastFn(field);
      if (fn) {
        castMap[field.name] = fn;
      }
    });
    return castMap;
  }

  generateCastFn (field /* : Object */) /* : function | null */ {
    if (!field.type || !Object.prototype.hasOwnProperty.call(this.types, field.type)) {
      return null;
    }
    const type = this.types[field.type];
    let format = field.format || 'default';
    let pattern = null;
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

    const schema = resource.schema || (resource.schema = {});
    const castMap = resource.schema.$castMap || (schema.$castMap = this.generate(schema));

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

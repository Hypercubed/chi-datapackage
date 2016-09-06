'use strict';

const deepExtend = require('deep-extend');
const pointers = require('./lib/pointers');

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

class Schema {
  constructor (opts) {
    opts = opts || {};
    deepExtend(this, opts);
  }

  normalizeField (field) {
    const type = field.type || 'string';

    field = Object.assign({
      type,
      format: 'default',
      missingValues: type === 'string' ? undefined : [''],
      pattern: null,
      constraints: {}
    }, field);

    field.missingValues = Array.isArray(field.missingValues) ? field.missingValues : [field.missingValues];
    field.title = field.title || readableName(field.name);

    if (field.format.indexOf(':') !== -1) {
      const s = field.format.split(':');
      field.format = s[0];
      field.pattern = s[1];
    }

    field.$fn = field.$fn || this.generateCastFn(field);
    return field;
  }

  normalizeSchema (schema) {
    schema = Object.assign({
      fields: []
    }, schema);
    schema.fields = schema.fields.map(f => this.normalizeField(f));
    return schema;
  }

  normalizeResource (datapackage, resource) {
    const schemas = datapackage.schemas;
    const schema = resource.schema;
    if (schema) {
      if (typeof schema === 'string') {  // TODO: check for URLS, catch missing schemas
        resource.schema = pointers.isPointer(schema) ?
          pointers.get(datapackage, schema) :
          schemas[schema];
        if (typeof resource.schema === 'undefined') {
          throw new Error(`Missing or invalid schema: "${schema}"`);
        }
      } else {
        schemas[`@@${resource.name}:schema`] = schema;
      }
    }
  }

  generateCastFn (field) {
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
    const self = this;

    resource = Object.assign({}, resource);
    /* istanbul ignore if */
    if (!Array.isArray(resource.data) || !resource.schema || !resource.schema.fields || resource.schema.fields.length === 0) {
      return resource;
    }

    resource.errors = resource.errors || [];
    const fields = resource.schema.fields;

    resource.data = resource.data.map((d, i) => {
      d = Object.assign({}, d);
      fields.forEach(field => {
        const key = field.name;
        if (Object.prototype.hasOwnProperty.call(d, key)) {
          const $fn = field.$fn || (field.$fn = self.generateCastFn(field));
          try {
            d[key] = $fn(d[key]);
          } catch (err) {
            resource.errors.push({
              type: 'FieldMismatch',
              code: 'InvalidType',
              message: err.message,
              row: i
            });
          }
        } else if (field.constraints && field.constraints.required) {
          resource.errors.push({
            type: 'ConstraintsError',
            code: 'MissingField',
            message: `Missing field: the field "${key}" requires a value`,
            row: i
          });
        }
      });

      return d;
    });

    return resource;
  }
}

function readableName (columnName) {
  // adapted from readableColumnName: https://github.com/angular-ui/ui-grid/blob/master/src/js/core/services/ui-grid-util.js
  if (typeof columnName === 'undefined' || columnName === undefined || columnName === null) {
    return columnName;
  }

  if (typeof columnName !== 'string') {
    columnName = String(columnName);
  }

  columnName = columnName.split('.').pop();

  return columnName
    // Convert underscores to spaces
    .replace(/_+/g, ' ')
    // Replace a completely all-capsed word with a first-letter-capitalized version
    .replace(/^[A-Z]+$/, match => {
      return (match.charAt(0).toUpperCase() + match.slice(1)).toLowerCase();
    })
    // Capitalize the first letter of words
    .replace(/([\w\u00C0-\u017F]+)/g, match => {
      return match.charAt(0).toUpperCase() + match.slice(1);
    })
    // Put a space in between words that have partial capilizations (i.e. 'firstName' becomes 'First Name')
    // .replace(/([A-Z]|[A-Z]\w+)([A-Z])/g, "$1 $2");
    // .replace(/(\w+?|\w)([A-Z])/g, "$1 $2");
    .replace(/(\w+?(?=[A-Z]))/g, '$1 ');
}

module.exports = Schema;

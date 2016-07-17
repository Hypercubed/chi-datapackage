// Note: some code based on https://github.com/frictionlessdata/datapackage-render-js/blob/master/datapackage.js
// MIT Open Knowledge Labs <labs@okfn.org>

// TODO: https://github.com/frictionlessdata/jsontableschema-js

const jsonParse = require('./json');

const typeToCast = {
  string: {
    default: String
    /* uri:
    email:
    binary: */
  },
  integer: {
    default: parseInt
  },
  number: {
    default: parseFloat
    // currency: parseFloat
  },
  date: {
    any: d => new Date(d),
    default: d => new Date(d)
    // fmt:
  },
  time: {
    any: d => new Date(d),
    default: d => new Date(d)
    // fmt:
  },
  datetime: {
    any: d => new Date(d),
    default: d => new Date(d)
    // fmt:
  },
  boolean: {
    default: Boolean
  },
  object: {
    default: jsonParse
  },
  array: {
    default: jsonParse
  }
};

function generateCastMap (schema) {
  const castMap = {};

  schema.fields.forEach(field => {
    field.format = field.format || 'default';
    if (field.type in typeToCast) {
      const type = typeToCast[field.type];
      castMap[field.name] = type[field.format] || type.default;
    }
  });

  return castMap;
}

function processSchema ({data, schema}) {
  if (!Array.isArray(data)) {
    return data;
  }

  if (!schema.castMap) {
    // calculate and store cast map
    schema.castMap = generateCastMap(schema);
  }

  const castMap = schema.castMap;

  data = data.map(d => {
    const r = {};
    for (const key in d) {
      if (key in castMap) {
        r[key] = castMap[key](d[key]);
      } else {
        r[key] = d[key];
      }
    }
    return r;
  });

  return {data};
}

module.exports = {
  processSchema
};
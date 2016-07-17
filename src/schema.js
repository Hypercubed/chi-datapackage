// Note: some code based on https://github.com/frictionlessdata/datapackage-render-js/blob/master/datapackage.js
// MIT Open Knowledge Labs <labs@okfn.org>

// TODO: https://github.com/frictionlessdata/jsontableschema-js

const jsonParse = require('./json');

const typeToCast = {
  string: {
    default: String
    /* todo: format, uri, email, binary: */
  },
  integer: {
    default: parseInt
  },
  number: {
    default: parseFloat
    // todo: format, example currency
  },
  date: {
    any: d => new Date(d),
    default: d => new Date(d)
    // todo: format, example "yyyy"
  },
  boolean: {
    default: Boolean
  },
  object: {
    default: jsonParse
  }
};

typeToCast.array = typeToCast.object;
typeToCast.time = typeToCast.date;
typeToCast.datetime = typeToCast.date;

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
    return {data};
  }

  const castMap = schema.$castMap || (schema.$castMap = generateCastMap(schema));

  data = data.map(d => {
    const r = {};
    for (const key in d) { /* eslint guard-for-in: 0 */
      r[key] = (key in castMap) ? castMap[key](d[key]) : d[key];
    }
    return r;
  });

  return {data};
}

module.exports = {
  processSchema
};

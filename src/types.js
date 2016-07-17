
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

module.exports = typeToCast;

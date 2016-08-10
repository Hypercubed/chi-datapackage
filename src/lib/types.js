// @flow

const utcParse = require('d3-time-format').utcParse;
const parseIsoDuration = require('parse-iso-duration');

const jsonParse = require('./json');

const TRUE_VALUES = ['yes', 'y', 'true', 't', '1'];

const typeToCast /* : TypesMap */= {
  string: {
    default: String
    /* todo: format, uri, email, binary? */
  },
  integer: {
    default: parseInt
  },
  number: {
    default: parseFloat
    // todo: currency?
  },
  datetime: {
    default: utcParse('%Y-%m-%dT%H:%M:%SZ'),
    fmt: utcParse,
    any: (d /* : string | Date */) => new Date(d)
  },
  date: {
    default: utcParse('%Y-%m-%d'),
    fmt: utcParse,
    yyyy: utcParse('%Y'),
    any: (d /* : string | Date */) => new Date(d)
  },
  time: {
    default: utcParse('%H:%M:%S'),
    fmt: utcParse,
    any: (d /* : string | Date */) => new Date(d)
  },
  duration: {
    default: parseIsoDuration
  },
  boolean: {
    default: (d /* : string | boolean */) => d === true || TRUE_VALUES.indexOf(String(d).toLowerCase()) !== -1
  },
  object: {
    default: jsonParse
  },
  array: {
    default: jsonParse
  }
};

module.exports = typeToCast;

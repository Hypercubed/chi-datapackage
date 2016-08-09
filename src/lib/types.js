// @flow

const d3time = require('d3-time-format');
const parseIsoDuration = require('parse-iso-duration');

const jsonParse = require('./json');

const TRUE_VALUES = ['yes', 'y', 'true', 't', '1'];

const typeToCast = {
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
    default: d3time.utcParse('%Y-%m-%dT%H:%M:%SZ'),
    fmt: d3time.utcParse,
    any: (d /* : string | Date */) => new Date(d)
  },
  date: {
    default: d3time.utcParse('%Y-%m-%d'),
    fmt: d3time.utcParse,
    yyyy: d3time.utcParse('%Y'),
    any: (d /* : string | Date */) => new Date(d)
  },
  time: {
    default: d3time.utcParse('%H:%M:%S'),
    fmt: d3time.utcParse,
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

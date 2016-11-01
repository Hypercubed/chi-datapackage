const d3time = require('d3-time-format');
const parseIsoDuration = require('parse-iso-duration');

const parse = require('json5').parse;

const INVALID_TYPE = 'Invalid type';

function jsonParse (isArray) {
  return function (d) {
    const c = parse(d);
    if (Array.isArray(c) !== isArray) {
      throw new Error(`${INVALID_TYPE}: expected JSON Array`);
    }
    return c;
  };
}

function utcParse (fmt) {
  const fn = d3time.utcParse(fmt);
  return function (d) {
    const c = fn(d);
    if (Number.isNaN(c) || c === null) {
      throw new Error(`${INVALID_TYPE}: expected ${fmt} formmated date`);
    }
    return c;
  };
}

function dateParse (d) {
  const c = new Date(d);
  if (isNaN(c.getTime())) {
    throw new Error(`${INVALID_TYPE}: expected formmated date`);
  }
  return c;
}

const checkSpecialNumbers = fn => d => {
  if (d === 'INF' || d === Infinity) {
    return Infinity;
  }
  if (d === '-INF' || d === -Infinity) {
    return -Infinity;
  }
  if (d === 'NaN' || Number.isNaN(d)) {
    return NaN;
  }
  const c = fn(d);
  if (Number.isNaN(c)) {
    throw new Error(`${INVALID_TYPE}: expected numeric value`);
  }
  return c;
};

function castNumber (value) {
  if (typeof value === 'number') {
    return value;
  }
  return Number(value);
}

function castInt (value) {
  if (/^(-|\+)?([0-9]+|Infinity)$/.test(String(value))) {
    return castNumber(value);
  }
  throw new Error(`${INVALID_TYPE}: expected integer value`);
}

const TRUE_VALUES = ['yes', 'y', 'true', 't', '1'];
const FALSE_VALUES = ['no', 'n', 'false', 'f', '0'];

function castBoolean (value) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (TRUE_VALUES.indexOf(String(value).toLowerCase()) !== -1) {
    return true;
  }
  if (FALSE_VALUES.indexOf(String(value).toLowerCase()) !== -1) {
    return false;
  }
  throw new Error(`${INVALID_TYPE}: expected boolean value`);
}

const typeToCast = {
  string: {
    default: String
    /* todo: format, uri, email, binary? */
  },
  integer: {
    default: checkSpecialNumbers(castInt)
  },
  number: {
    default: checkSpecialNumbers(castNumber)
    // todo: currency?
  },
  datetime: {
    default: utcParse('%Y-%m-%dT%H:%M:%SZ'),
    fmt: utcParse,
    any: dateParse
  },
  date: {
    default: utcParse('%Y-%m-%d'),
    fmt: utcParse,
    yyyy: utcParse('%Y'),
    any: dateParse
  },
  time: {
    default: utcParse('%H:%M:%S'),
    fmt: utcParse,
    any: dateParse
  },
  duration: {
    default: parseIsoDuration
  },
  boolean: {
    default: castBoolean
  },
  object: {
    default: jsonParse(false),
    any: parse
  },
  array: {
    default: jsonParse(true),
    any: parse
  }
};

module.exports = typeToCast;

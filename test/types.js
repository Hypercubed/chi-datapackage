/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import types from '../src/lib/types';
import SchemaProcessor from '../src/schema';

const schemaProcessor = new SchemaProcessor({types});

const utc = (...args) => new Date(Date.UTC(...args));

function castMacro ({format, type}) {
  format = format || 'default';
  const fn = schemaProcessor.generateCastFn({format, type});

  macro.title = (providedTitle, input, expected) => `${type}.${format} ${input} --> ${fn(input)} === ${expected}`.trim();
  return macro;

  function macro (t, input, expected) {
    if (typeof expected === 'object') {
      return t.deepEqual(fn(input), expected);
    }
    t.is(fn(input), expected);
  }
}

const STRING = castMacro({type: 'string'});
const NUMBER = castMacro({type: 'number'});
const INTEGER = castMacro({type: 'integer'});
const DATE = castMacro({type: 'date'});
const DATE_ANY = castMacro({type: 'date', format: 'any'});
const DATE_FMT = castMacro({type: 'date', format: 'fmt:%Y'});
const DATETIME = castMacro({type: 'datetime'});
const DURATION = castMacro({type: 'duration'});
const TIME = castMacro({type: 'time'});
const BOOLEAN = castMacro({type: 'boolean'});
const OBJECT = castMacro({type: 'object'});

test(STRING, 1.9, '1.9');
test(STRING, true, 'true');
test(STRING, false, 'false');
test(STRING, new Date('2019-01-02'), new Date('2019-01-02').toString());

test(NUMBER, '1', 1);
test(NUMBER, '1.2', 1.2);
test(NUMBER, 1, 1);
test(NUMBER, 1.2, 1.2);

test(INTEGER, '1', 1);
test(INTEGER, '1.2', 1);
test(INTEGER, '1.9', 1);
test(INTEGER, 1, 1);
test(INTEGER, 1.2, 1);
test(INTEGER, 1.9, 1);

test(DATETIME, '1990-01-01T00:00:00Z', utc(1990, 0, 1, 0, 0, 0));
test(DATETIME, '2011-12-31T23:59:59Z', utc(2011, 11, 31, 23, 59, 59));

test(DATE, '1990-01-01', utc(1990, 0, 1));
test(DATE, '2011-12-31', utc(2011, 11, 31));

test(TIME, '09:00:00', utc(1900, 0, 1, 9, 0, 0));
test(TIME, '18:00:00', utc(1900, 0, 1, 18, 0, 0));

test(DATE_ANY, '2011/12/31 23:59:59Z', utc(2011, 11, 31, 23, 59, 59));
test(DATE_ANY, '2011', new Date('2011'));

test(DATE_FMT, '2011', utc(2011, 0, 1, 0, 0, 0));

test(DURATION, 'PT8S', 8 * 1000);
test(DURATION, 'PT10M', 10 * 60 * 1000);
test(DURATION, 'PT20H', 20 * 60 * 60 * 1000);
test(DURATION, 'PT6M4S', (6 * 60 * 1000) + 4000);

test(BOOLEAN, true, true);
test(BOOLEAN, false, false);
test(BOOLEAN, 'true', true);
test(BOOLEAN, 'false', false);
test(BOOLEAN, 't', true);
test(BOOLEAN, 'f', false);
test(BOOLEAN, '1', true);
test(BOOLEAN, '0', false);
test(BOOLEAN, 'yes', true);
test(BOOLEAN, 'no', false);
test(BOOLEAN, 'y', true);
test(BOOLEAN, 'n', false);

test(OBJECT, '{}', {});
test(OBJECT, '{"foo": "bar", "baz": true, "buzz": 10}', {foo: 'bar', baz: true, buzz: 10});
test(OBJECT, '{foo: "bar", baz: true, "buzz": 10}', {foo: 'bar', baz: true, buzz: 10});
test(OBJECT, '[]', []);
test(OBJECT, '[1,2,3]', [1, 2, 3]);

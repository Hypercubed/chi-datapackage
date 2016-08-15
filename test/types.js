/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import types from '../src/lib/types';
import SchemaProcessor from '../src/schema';

const schemaProcessor = new SchemaProcessor({types});

const utc = (...args) => new Date(Date.UTC(...args));

test('string', t => {
  const fn = schemaProcessor.generateCastFn({type: 'string'});
  t.is(fn(1.9), '1.9');
  t.is(fn(true), 'true');
  t.is(fn(false), 'false');
  t.is(fn(new Date('2019-01-02')), new Date('2019-01-02').toString());
});

test('number', t => {
  const fn = schemaProcessor.generateCastFn({type: 'number'});
  t.is(fn('1'), 1);
  t.is(fn('1.2'), 1.2);
  t.is(fn('1.2e3'), 1.2e3);
  t.is(fn(1), 1);
  t.is(fn(1.2), 1.2);
  t.true(Number.isNaN(fn('NaN')));
  t.is(fn('INF'), Infinity);
  t.is(fn('-INF'), -Infinity);

  t.throws(() => fn('unknown'));
});

test('integer', t => {
  const fn = schemaProcessor.generateCastFn({type: 'integer'});
  t.is(fn('1'), 1);
  t.is(fn(1), 1);
  t.true(Number.isNaN(fn('NaN')));
  t.is(fn('INF'), Infinity);
  t.is(fn('-INF'), -Infinity);

  t.throws(() => fn('1.1'));
  t.throws(() => fn('unknown'));
});

test('datetime', t => {
  const fn = schemaProcessor.generateCastFn({type: 'datetime'});
  t.deepEqual(fn('1990-01-01T00:00:00Z'), utc(1990, 0, 1, 0, 0, 0));
  t.deepEqual(fn('2011-12-31T23:59:59Z'), utc(2011, 11, 31, 23, 59, 59));

  t.throws(() => fn('unknown'));
});

test('date', t => {
  const fn = schemaProcessor.generateCastFn({type: 'date'});
  t.deepEqual(fn('1990-01-01'), utc(1990, 0, 1));
  t.deepEqual(fn('2011-12-31'), utc(2011, 11, 31));

  t.throws(() => fn('unknown'));
});

test('date, any', t => {
  const fn = schemaProcessor.generateCastFn({type: 'date', format: 'any'});
  t.deepEqual(fn('2011/12/31 23:59:59Z'), utc(2011, 11, 31, 23, 59, 59));
  t.deepEqual(fn('2011'), new Date('2011'));

  t.throws(() => fn('unknown'));
});

test('date, fmt', t => {
  const fn = schemaProcessor.generateCastFn({type: 'date', format: 'fmt:%Y'});
  t.deepEqual(fn('2011'), utc(2011, 0, 1, 0, 0, 0));

  t.throws(() => fn('unknown'));
});

test('time', t => {
  const fn = schemaProcessor.generateCastFn({type: 'time'});
  t.deepEqual(fn('09:00:00'), utc(1900, 0, 1, 9, 0, 0));
  t.deepEqual(fn('18:00:00'), utc(1900, 0, 1, 18, 0, 0));

  t.throws(() => fn('unknown'));
});

test('duration', t => {
  const fn = schemaProcessor.generateCastFn({type: 'duration'});
  t.is(fn('PT8S'), 8 * 1000);
  t.is(fn('PT10M'), 10 * 60 * 1000);
  t.is(fn('PT20H'), 20 * 60 * 60 * 1000);
  t.is(fn('PT6M4S'), (6 * 60 * 1000) + 4000);

  t.throws(() => fn('unknown'));
});

test('boolean', t => {
  const fn = schemaProcessor.generateCastFn({type: 'boolean'});
  t.is(fn(true), true);
  t.is(fn(false), false);
  t.is(fn('true'), true);
  t.is(fn('false'), false);
  t.is(fn('t'), true);
  t.is(fn('f'), false);
  t.is(fn('T'), true);
  t.is(fn('F'), false);
  t.is(fn('1'), true);
  t.is(fn('0'), false);
  t.is(fn('yes'), true);
  t.is(fn('no'), false);
  t.is(fn('y'), true);
  t.is(fn('n'), false);

  t.throws(() => fn('unknown'));
});

test('object', t => {
  const fn = schemaProcessor.generateCastFn({type: 'object'});
  t.deepEqual(fn('{}'), {});
  t.deepEqual(fn('{"foo": "bar", "baz": true, "buzz": 10}'), {foo: 'bar', baz: true, buzz: 10});
  t.deepEqual(fn('{foo: "bar", baz: true, "buzz": 10}'), {foo: 'bar', baz: true, buzz: 10});

  t.throws(() => fn('unknown'));
  t.throws(() => fn('{"foo": "bar"'));
  t.throws(() => fn('[1,2,3]'));
});

test('array', t => {
  const fn = schemaProcessor.generateCastFn({type: 'array'});
  t.deepEqual(fn('[]'), []);
  t.deepEqual(fn('[1,2,3]'), [1, 2, 3]);

  t.throws(() => fn('unknown'));
  t.throws(() => fn('[1,2,3'));
  t.throws(() => fn('{"foo": "bar"}'));
});

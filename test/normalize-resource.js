/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import dp from '../';

const json = [{A: '1', B: '2', C: '3'}, {A: '4', B: '5', C: '6'}];

test('normalize simple datapackage resources', async t => {
  const s = await dp.loadPackage('fixtures/loaded/');

  const p = dp.normalizeResources(dp.normalizePackage(s));

  t.is(p.resources[0].path, 'one.txt');
  t.is(p.resources[0].format, 'txt');
  t.is(p.resources[0].name, 'one.txt');
  t.regex(p.resources[0].url, /fixtures\/loaded\/one.txt$/);
  t.is(p.resources[0].mediatype, 'text/plain');

  t.is(p.resources[1].path, 'two.csv');
  t.is(p.resources[1].format, 'csv');
  t.is(p.resources[1].name, 'two.csv');
  t.regex(p.resources[1].url, /fixtures\/loaded\/two.csv$/);
  t.is(p.resources[1].mediatype, 'text/csv');
});

test('normalize datapackage resources', async t => {
  const s = await dp.loadPackage('fixtures/inline/');

  const p = dp.normalizeResources(dp.normalizePackage(s));

  t.is(p.resources[0].format, 'txt');
  t.is(p.resources[0].data, 'hello');
  t.is(p.resources[0].mediatype, 'text/plain');

  t.is(p.resources[1].format, 'json');
  t.deepEqual(p.resources[1].data, json);
  t.is(p.resources[1].mediatype, 'application/json');

  [5, 6, 7, 8, 9].forEach(i => {
    t.is(p.schemas['abc-schema'], p.resources[i].schema);
  });

  t.deepEqual(p.resources[5], {
    content: 'A,B,C\n1,2,3\n4,5,6',
    format: 'csv',
    mediatype: 'text/csv',
    schema: {
      key: 'abc-schema',
      fields: [
        {name: 'A', type: 'string'},
        {name: 'B', type: 'number'},
        {name: 'C', type: 'number'}
      ]
    }
  }, 'with schema');
});

test('normalize gdp datapackage resource', async t => {
  const s = await dp.loadPackage({path: 'fixtures/gdp/'});

  const p = dp.normalizePackage(s);
  const r = dp.normalizeResource(p, p.resources[0]);

  t.is(r.name, 'gdp');
  t.is(r.path, 'data/gdp.csv');
  t.is(r.format, 'csv');
  t.regex(r.url, /fixtures\/gdp\/data\/gdp.csv$/);
  t.is(r.mediatype, 'text/csv');
});

test('normalize gdp datapackage resources - from url', async t => {
  const s = await dp.loadPackage('http://github.com/datasets/gdp');

  const p = dp.normalizePackage(s);
  const r = dp.normalizeResource(p, p.resources[0]);

  t.is(r.name, 'gdp');
  t.is(r.path, 'data/gdp.csv');
  t.is(r.format, 'csv');
  t.is(r.url, 'http://raw.githubusercontent.com/datasets/gdp/master/data/gdp.csv');
  t.is(r.mediatype, 'text/csv');
});

/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import dp from '../';
import setupHttp from './fixtures/http-mock';

const json = [{A: '1', B: '2', C: '3'}, {A: '4', B: '5', C: '6'}];

test('normalize simple datapackage resources', async t => {
  const s = await dp.loadPackage('fixtures/loaded/');
  const p = dp.normalize.datapackage(s);
  const r = p.resources.map(r => dp.normalize.resource(p, r));

  t.not(p.resources[0], r[0], 'creates a new object');
  t.is(r[0].path, 'one.txt');
  t.is(r[0].format, 'txt');
  t.is(r[0].name, 'one.txt');
  t.regex(r[0].url, /fixtures\/loaded\/one.txt$/);
  t.is(r[0].mediatype, 'text/plain');

  t.not(p.resources[1], r[1], 'creates a new object');
  t.is(r[1].path, 'two.csv');
  t.is(r[1].format, 'csv');
  t.is(r[1].name, 'two.csv');
  t.regex(r[1].url, /fixtures\/loaded\/two.csv$/);
  t.is(r[1].mediatype, 'text/csv');
});

test('normalize datapackage resources', async t => {
  const s = await dp.loadPackage('fixtures/inline/');
  const p = dp.normalize.datapackage(s);
  const r = p.resources.map(r => dp.normalize.resource(p, r));

  t.not(p.resources[0], r[0], 'creates a new object');
  t.is(r[0].format, 'txt');
  t.is(r[0].data, 'hello');
  t.is(r[0].mediatype, 'text/plain');

  t.not(p.resources[1], r[1], 'creates a new object');
  t.is(r[1].format, 'csv');
  t.deepEqual(r[1].data, json);
  t.is(r[1].mediatype, 'text/csv');

  t.not(p.resources[2], r[2], 'creates a new object');
  t.is(r[2].format, 'tsv');
  t.is(r[2].mediatype, 'text/tab-separated-values');

  r.forEach((rr, i) => {
    t.not(p.resources[i], rr, 'creates a new object');
  });
});

['fixtures/gdp/', 'http://github.com/datasets/gdp', {url: 'http://github.com/datasets/gdp'}]
.forEach(s => {
  test(`normalize gdp datapackage resource - {$p}`, async t => {
    await setupHttp();

    s = await dp.loadPackage(s);
    const p = dp.normalize.datapackage(s);
    const r = dp.normalize.resource(p, p.resources[0]);

    t.not(p.resources[0], r, 'creates a new object');
    t.is(r.name, 'gdp');
    t.is(r.path, 'data/gdp.csv');
    t.is(r.format, 'csv');
    t.regex(r.url, /data\/gdp.csv$/);
    t.is(r.mediatype, 'text/csv');
  });
});

test('normalize works with only data', async t => {
  const s = {data: json};
  const r = dp.normalize.resource({}, s);

  t.not(s, r, 'creates a new object');
  t.deepEqual(r.data, json);
  t.is(r.format, 'json');
  t.is(r.mediatype, 'application/json');
  t.is(typeof r.name, 'string');
});

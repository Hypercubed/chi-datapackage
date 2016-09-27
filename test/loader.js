/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import dp from '../';
import setupHttp from './fixtures/http-mock';

const json = [{A: '1', B: '2', C: '3'}, {A: '4', B: '5', C: '6'}];

const tsv = 'A\tB\tC\n1\t2\t3\n4\t5\t6';
const csv = 'A,B,C\n1,2,3\n4,5,6';

test('loader, inline-content', async t => {
  const p = await dp.loader.datapackage('fixtures/inline/');

  t.deepEqual(p.resources[0].data, 'hello');
  t.deepEqual(p.resources[1].data, json);

  t.deepEqual(p.resources[2].content, tsv);
  t.deepEqual(p.resources[3].content, tsv);
  t.deepEqual(p.resources[4].content, csv);
});

test('loader, resources', async t => {
  const s = {url: 'fixtures/loaded/'};
  const p = await dp.loader.datapackage(s);
  const r = await dp.loader.resources(p.resources.map(r => dp.normalize.resource(p, r)));

  t.deepEqual(r[0].content, 'hello\n');
  t.deepEqual(r[1].content.trim(), csv);

  t.deepEqual(r[2].content.trim(), tsv);
  t.deepEqual(r[3].content.trim(), tsv);
});

test('loader, resources, overwrites current resources', async t => {
  const s = {url: 'fixtures/loaded/', resources: ['some', 'junk']};
  const p = await dp.loader.datapackage(s);
  const r = await dp.loader.resources(p.resources.map(r => dp.normalize.resource(p, r)));

  t.deepEqual(r[0].content, 'hello\n');
  t.deepEqual(r[1].content.trim(), csv);

  t.deepEqual(r[2].content.trim(), tsv);
  t.deepEqual(r[3].content.trim(), tsv);
});

['fixtures/gdp/', 'http://github.com/datasets/gdp', {url: 'http://github.com/datasets/gdp'}].forEach(s => {
  test(`loader, url, ${s}`, async t => {
    await setupHttp();

    const p = await dp.loader.datapackage(s);
    const r = await dp.loader.resources(p.resources.map(r => dp.normalize.resource(p, r)));

    t.not(p, s, 'creates a new object');
    t.is(typeof r[0].content, 'string');
    t.is(r[0].content.length, 394724);
  });
});

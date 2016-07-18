/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import {normalizePackage} from '../';
import loader from '../src/loader';

const json = [{A: '1', B: '2', C: '3'}, {A: '4', B: '5', C: '6'}];

test('normalize simple datapackage resources', async t => {
  const s = await loader('./fixtures/simple/datapackage.json');

  const p = normalizePackage(s);
  t.deepEqual(p.resources[0], {
    path: 'one.txt',
    format: 'txt',
    name: 'one.txt',
    url: 'fixtures/simple/one.txt',
    mediatype: 'text/plain'
  });
  t.deepEqual(p.resources[1], {
    path: 'two.tsv',
    format: 'tsv',
    name: 'two.tsv',
    url: 'fixtures/simple/two.tsv',
    mediatype: 'text/tab-separated-values'
  });
});

test('normalize datapackage resources', async t => {
  const s = await loader('./fixtures/content/datapackage.json');

  const p = normalizePackage(s);
  t.deepEqual(p.resources[0], {
    format: 'txt',
    data: 'hello',
    mediatype: 'text/plain'
  }, 'plain txt, inline data');

  t.deepEqual(p.resources[1], {
    data: json,
    format: 'json',
    mediatype: 'application/json'
  }, 'unspecified inline data');

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

test('normalize gdp datapackage', async t => {
  const s = await loader('./fixtures/gdp/datapackage.json');

  const p = normalizePackage(s);
  t.deepEqual(p.resources[0], {
    name: 'gdp',
    path: 'data/gdp.csv',
    schema: s.resources[0].schema,
    format: 'csv',
    url: 'fixtures/gdp/data/gdp.csv',
    mediatype: 'text/csv'
  });
});

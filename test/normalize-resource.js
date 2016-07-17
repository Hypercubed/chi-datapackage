import test from 'ava';

import {Normalizer} from '../';
import loader from '../src/loader';

const normalize = new Normalizer();

test('normalize simple datapackage', async t => {
  const s = await loader('./fixtures/simple/datapackage.json');

  const p = normalize.datapackage(s);
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

test('normalize inline datapackage', async t => {
  const s = await loader('./fixtures/inline/datapackage.json');

  const p = normalize.datapackage(s);
  t.deepEqual(p.resources[0], {
    format: 'txt',
    data: 'hello',
    mediatype: 'text/plain'
  });
  t.deepEqual(p.resources[1], {
    format: 'csv',
    data: [{A: '1', B: '2', C: '3'}, {A: '4', B: '5', C: '6'}],
    mediatype: 'text/csv'
  });
});

test('normalize schema in resource', async t => {
  const s = await loader('./fixtures/schema/datapackage.json');

  const p = normalize.datapackage(s);
  t.is(p.resources[0].schema, p.schemas['xyz-schema']);
  t.deepEqual(p.resources[0], {
    path: 'one.csv',
    format: 'csv',
    name: 'one.csv',
    url: 'fixtures/schema/one.csv',
    mediatype: 'text/csv',
    schema: {
      key: 'xyz-schema',
      fields: [{name: 'date', type: 'date'}]
    }
  });
});

test('normalize gdp datapackage', async t => {
  const s = await loader('./fixtures/gdp/datapackage.json');

  const p = normalize.datapackage(s);
  t.deepEqual(p.resources[0], {
    name: 'gdp',
    path: 'data/gdp.csv',
    schema: {
      fields: [
        {name: 'Country Name', type: 'string'},
        {
          name: 'Country Code',
          type: 'string',
          foreignkey: 'iso-3-geo-codes/id'
        },
        {name: 'Year', type: 'date', format: 'yyyy'},
        {
          name: 'Value',
          description: 'GDP in current USD',
          type: 'number'
        }
      ]
    },
    format: 'csv',
    url: 'fixtures/gdp/data/gdp.csv',
    mediatype: 'text/csv'
  });
});

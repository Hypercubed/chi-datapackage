import test from 'ava';

import {normalizePackage} from '../';
import loader from '../src/loader';

test('normalize simple datapackage', async t => {
  const s = await loader('./fixtures/simple/datapackage.json');

  const p = normalizePackage(s);
  t.deepEqual(p.$resourcesByName['one.txt'], {
    path: 'one.txt',
    format: 'txt',
    name: 'one.txt',
    url: 'fixtures/simple/one.txt',
    mediatype: 'text/plain'
  });
  t.deepEqual(p.$resourcesByName['two.tsv'], {
    path: 'two.tsv',
    format: 'tsv',
    name: 'two.tsv',
    url: 'fixtures/simple/two.tsv',
    mediatype: 'text/tab-separated-values'
  });
});

test('normalize gdp datapackage', async t => {
  const s = await loader('./fixtures/gdp/datapackage.json');

  const p = normalizePackage(s);
  t.deepEqual(p.$resourcesByName.gdp, {
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

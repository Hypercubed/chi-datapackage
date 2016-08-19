/* eslint node/no-unsupported-features: 0 */
import fs from 'fs';

import test from 'ava';
import nock from 'nock';

import dp from '../';

const json = [{A: '1', B: '2', C: '3'}, {A: '4', B: '5', C: '6'}];
const jsonProcessed = [{A: '1', B: 2, C: 3}, {A: '4', B: 5, C: 6}];

const matrix = {
  columns: ['B', 'C'],
  rows: ['1', '4'],
  table: [['2', '3'], ['5', '6']]
};

function readFilePromise (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (error, content) => {
      if (error) {
        reject(error);
      } else {
        resolve(content);
      }
    });
  });
}

async function setupHttp () {
  const gdp = await readFilePromise('./fixtures/gdp/datapackage.json');
  const csv = await readFilePromise('./fixtures/gdp/data/gdp.csv');

  nock('http://raw.githubusercontent.com')
    .get('/datasets/gdp/master/datapackage.json')
    .reply(200, gdp);

  nock('http://raw.githubusercontent.com')
    .get('/datasets/gdp/master/data/gdp.csv')
    .reply(200, csv);
}

['fixtures/inline/', {path: 'fixtures/loaded/'}].forEach(p => {
  test(`process content - from ${p}`, async t => {
    p = await dp.load('fixtures/inline/');

    t.deepEqual(p.resources[0].data, 'hello\n');
    t.deepEqual(p.resources[1].data, json);
    t.deepEqual(p.resources[2].data, json);

    t.deepEqual(p.resources[3].data, matrix);
    t.deepEqual(p.resources[4].data, matrix);

    [5, 6, 7, 8, 9, 10].forEach(i => {
      t.deepEqual(p.resources[i].data, jsonProcessed);
      if (i > 5) {
        t.is(p.schemas['abc-schema'], p.resources[i].schema, 'with schema');
      }
    });
  });
});

['fixtures/gdp/', 'http://github.com/datasets/gdp', {url: 'http://github.com/datasets/gdp'}].forEach(p => {
  test(`process gold-prices - from ${p}`, async t => {
    await setupHttp();

    p = await dp.load(p);

    t.is(p.resources[0].data.length, 10379);
    t.deepEqual(p.resources[0].data[0], {
      'Country Name': 'Arab World',
      'Country Code': 'ARB',
      'Year': new Date('1968'),
      'Value': 25659088715.414
    });
  });
});

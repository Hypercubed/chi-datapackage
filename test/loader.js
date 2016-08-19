/* eslint node/no-unsupported-features: 0 */
import fs from 'fs';

import test from 'ava';
import nock from 'nock';

import dp from '../';

const json = [{A: '1', B: '2', C: '3'}, {A: '4', B: '5', C: '6'}];

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

test('loader, inline-content', async t => {
  const p = await dp.loader.datapackage('fixtures/inline/');

  t.deepEqual(p.resources[0].data, 'hello');
  t.deepEqual(p.resources[1].data, json);

  t.deepEqual(p.resources[2].content, 'A\tB\tC\n1\t2\t3\n4\t5\t6');
  t.deepEqual(p.resources[3].content, 'A\tB\tC\n1\t2\t3\n4\t5\t6');
  t.deepEqual(p.resources[4].content, 'A,B,C\n1,2,3\n4,5,6');
});

test('loader, resources', async t => {
  const s = {url: 'fixtures/loaded/'};
  const p = await dp.loader.datapackage(s);
  const r = await dp.loader.resources(p.resources.map(r => dp.normalize.resource(p, r)));

  t.deepEqual(r[0].content, 'hello\n');
  t.deepEqual(r[1].content, 'A,B,C\n1,2,3\n4,5,6\n');

  t.deepEqual(r[2].content, 'A\tB\tC\n1\t2\t3\n4\t5\t6\n');
  t.deepEqual(r[3].content, 'A\tB\tC\n1\t2\t3\n4\t5\t6\n');
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

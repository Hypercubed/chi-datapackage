/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import {normalizePackage, processPackage} from '../';
import loader from '../src/loader';

const json = [{A: '1', B: '2', C: '3'}, {A: '4', B: '5', C: '6'}];
const matrix = {
  columns: ['B', 'C'],
  rows: ['1', '4'],
  table: [['2', '3'], ['5', '6']]
};

test('process inline-content', async t => {
  const s = await loader('./fixtures/content/datapackage.json');
  const p = processPackage(normalizePackage(s));

  t.deepEqual(p.resources[0].data, 'hello');
  t.deepEqual(p.resources[1].data, json);

  t.deepEqual(p.resources[2].data, matrix);
  t.deepEqual(p.resources[3].data, matrix);
});

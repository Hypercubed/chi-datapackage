/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import {normalizePackage, processPackage} from '../';
import loader from '../src/loader';

const json = [{A: '1', B: 2, C: 3}, {A: '4', B: 5, C: 6}];

test('process inline-content, with schemas', async t => {
  const s = await loader('./fixtures/content/datapackage.json');
  const p = processPackage(normalizePackage(s));

  [4, 5, 6, 7, 8, 9].forEach(i => {
    t.deepEqual(p.resources[i].data, json);
  });
});

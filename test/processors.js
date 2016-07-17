import test from 'ava';

import {normalizePackage, processPackage} from '../';
import loader from '../src/loader';

test('process inline-content datapackage', async t => {
  const s = await loader('./fixtures/inline-content/datapackage.json');
  const p = processPackage(normalizePackage(s));

  t.deepEqual(p.resources[0].data, 'hello');
  t.deepEqual(p.resources[1].data, [{A: '1', B: '2', C: '3'}, {A: '4', B: '5', C: '6'}]);
});

test('process inline-content-schema datapackage', async t => {
  const s = await loader('./fixtures/inline-content-schema/datapackage.json');
  const p = processPackage(normalizePackage(s));

  t.deepEqual(p.resources[0].data, 'hello');
  t.deepEqual(p.resources[1].data, [{A: '1', B: 2, C: 3}, {A: '4', B: 5, C: 6}]);
});

test('process inline-data datapackage', async t => {
  const s = await loader('./fixtures/inline/datapackage.json');
  const p = processPackage(normalizePackage(s));

  t.deepEqual(p.resources[0].data, 'hello');
  t.deepEqual(p.resources[1].data, [{A: '1', B: '2', C: '3'}, {A: '4', B: '5', C: '6'}]);
});

/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import dp from '../';

test('normalize simple datapackage', async t => {
  const s = await dp.loadPackage('fixtures/loaded/');
  const p = dp.normalizeResources(dp.normalize.datapackage(s));

  const n = dp.Normalizer.index(p);
  t.is(n['one.txt'], p.resources[0]);
  t.is(n['two.csv'], p.resources[1]);
});

test('normalize gdp datapackage', async t => {
  const s = await dp.loadPackage('fixtures/gdp/');
  const p = dp.normalizeResources(dp.normalize.datapackage(s));

  const n = dp.Normalizer.index(p);
  t.deepEqual(n.gdp, p.resources[0]);
});

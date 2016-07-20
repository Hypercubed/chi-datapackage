/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import dp from '../';

test('normalize simple datapackage', async t => {
  const s = await dp.loadPackage('fixtures/loaded/');

  const p = dp.normalizeResources(dp.normalizePackage(s));
  t.is(p.$resourcesByName['one.txt'], p.resources[0]);
  t.is(p.$resourcesByName['two.csv'], p.resources[1]);
});

test('normalize gdp datapackage', async t => {
  const s = await dp.loadPackage('fixtures/gdp/');

  const p = dp.normalizeResources(dp.normalizePackage(s));
  t.deepEqual(p.$resourcesByName.gdp, p.resources[0]);
});

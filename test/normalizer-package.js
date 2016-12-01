/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import dp from '../';
import setupHttp from './fixtures/http-mock';

test('normalize datapackage', async t => {
  const s = await dp.loadPackage('fixtures/bare/');
  const p = dp.normalize.datapackage(s);

  t.not(p, s, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.regex(p.path, /fixtures\/bare\/$/, 'adds path');
  t.regex(p.base, /fixtures\/bare\/$/, 'adds base');
  t.is(p.name, 'bare', 'adds name');  // MUST
  t.is(p.description, '', 'adds description');  // MAY
  t.deepEqual(p.resources, [], 'adds resources array'); // MAY
});

test('normalize simple datapackage', async t => {
  const s = await dp.loadPackage('fixtures/inline/');
  const p = dp.normalize.datapackage(s);

  t.not(p, s, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.regex(p.path, /fixtures\/inline\/$/, 'adds path');
  t.regex(p.base, /fixtures\/inline\/$/, 'adds base');
  t.regex(p.image, /fixtures\/inline\/image.png$/, 'normalizes image path');
  t.regex(p.readme, /fixtures\/inline\/readme.md$/, 'normalizes image path');
  t.is(p.description, '', 'adds description');  // MAY
  t.is(p.version, '1', 'retains version');
  p.resources.forEach(d => {
    t.is(typeof d, 'object');
  });
});

test('normalize dpm generated datapackage', async t => {
  const s = await dp.loadPackage('fixtures/dpm/');
  const p = dp.normalize.datapackage(s);

  t.not(p, s, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.regex(p.path, /fixtures\/dpm\/$/, 'adds path');
  t.regex(p.base, /fixtures\/dpm\/$/, 'adds base');
  t.is(p.version, '0.1.0', 'retains version');
});

test('normalize gdp datapackage', async t => {
  const s = await dp.loadPackage('fixtures/gdp/');
  const p = dp.normalize.datapackage(s);

  t.not(s, p, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.regex(p.path, /fixtures\/gdp\/$/, 'adds path');
  t.regex(p.base, /fixtures\/gdp\/$/, 'adds base');
  t.is(p.version, '2011', 'retains version');
});

test('normalize gdp datapackage - from url', async t => {
  await setupHttp();
  const s = await dp.loader.datapackage('http://github.com/datasets/gdp');
  const p = dp.normalize.datapackage(s);

  t.not(s, p, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.is(p.url, 'http://raw.githubusercontent.com/datasets/gdp/master/', 'adds path');
  t.is(p.base, 'http://raw.githubusercontent.com/datasets/gdp/master/', 'adds base');
  t.is(p.version, 'master', 'gets version from branch');
});

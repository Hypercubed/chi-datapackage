/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import {normalizePackage, normalizeResources, loadPackage} from '../';

test('normalize bare datapackage', async t => {
  const s = await loadPackage('fixtures/bare/');

  const p = normalizeResources(normalizePackage(s));
  t.not(p, s, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.regex(p.path, /fixtures\/bare\/$/, 'adds path');
  t.regex(p.base, /fixtures\/bare\/$/, 'adds base');
  t.is(p.name, 'bare', 'adds name');  // MUST
  t.is(p.description, '', 'adds description');  // MAY
  t.deepEqual(p.resources, [], 'adds resources array'); // MAY
});

test('normalize simple datapackage', async t => {
  const s = await loadPackage('fixtures/inline/');

  const p = normalizeResources(normalizePackage(s));
  t.not(p, s, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.regex(p.path, /fixtures\/inline\/$/, 'adds path');
  t.regex(p.base, /fixtures\/inline\/$/, 'adds base');
  t.regex(p.image, /fixtures\/inline\/image.png$/, 'normalizes image path');
  t.regex(p.readme, /fixtures\/inline\/readme.md$/, 'normalizes image path');
  t.is(p.description, '', 'adds description');  // MAY
  p.resources.forEach(d => {
    t.is(typeof d, 'object');
  });
});

test('normalize dpm generated datapackage', async t => {
  const s = await loadPackage('fixtures/dpm/');

  const p = normalizeResources(normalizePackage(s));
  t.not(p, s, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.regex(p.path, /fixtures\/dpm\/$/, 'adds path');
  t.regex(p.base, /fixtures\/dpm\/$/, 'adds base');
});

test('normalize gdp datapackage', async t => {
  const s = await loadPackage('fixtures/gdp/');

  const p = normalizeResources(normalizePackage(s));
  t.not(s, p, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.regex(p.path, /fixtures\/gdp\/$/, 'adds path');
  t.regex(p.base, /fixtures\/gdp\/$/, 'adds base');
});

test('normalize gdp datapackage - from url', async t => {
  const s = await loadPackage('http://github.com/datasets/gdp');

  const p = normalizeResources(normalizePackage(s));
  t.not(s, p, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.is(p.url, 'http://raw.githubusercontent.com/datasets/gdp/master/', 'adds path');
  t.is(p.base, 'http://raw.githubusercontent.com/datasets/gdp/master/', 'adds base');
});

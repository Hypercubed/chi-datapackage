import test from 'ava';

import {normalizePackage} from '../';
import loader from '../src/loader';

test('normalize bare datapackage', async t => {
  const s = await loader('./fixtures/bare/datapackage.json');

  const p = normalizePackage(s);
  t.not(p, s, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.is(p.path, './fixtures/bare/datapackage.json', 'adds path');
  t.is(p.base, 'fixtures/bare/', 'adds base');
  t.is(p.homepage, 'fixtures/bare/', 'adds homepage');  // MAY
  t.is(p.name, 'fixtures/bare', 'adds name');  // MUST
  t.is(p.description, '', 'adds description');  // MAY
  t.deepEqual(p.resources, [], 'adds resources array'); // MAY
});

test('normalize simple datapackage', async t => {
  const s = await loader('./fixtures/simple/datapackage.json');

  const p = normalizePackage(s);
  t.not(p, s, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.is(p.path, './fixtures/simple/datapackage.json', 'adds path');
  t.is(p.base, 'fixtures/simple/', 'adds base');
  t.is(p.homepage, 'fixtures/simple/', 'adds homepage');  // MAY
  t.is(p.image, 'fixtures/simple/image.png', 'normalizes image path');
  t.is(p.readme, 'fixtures/simple/readme.md', 'normalizes image path');
  t.is(p.description, '', 'adds description');  // MAY
  t.is(p.resources.length, 2, 'adds resources array');
  t.deepEqual(p.resources.map(d => typeof d), ['object', 'object'], 'converts resources to objects');
});

test('normalize dpm generated datapackage', async t => {
  const s = await loader('./fixtures/dpm/datapackage.json');

  const p = normalizePackage(s);
  t.not(p, s, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.is(p.path, './fixtures/dpm/datapackage.json', 'adds path');
  t.is(p.base, 'fixtures/dpm/', 'adds base');
});

test('normalize gdp datapackage', async t => {
  const s = await loader('./fixtures/gdp/datapackage.json');

  const p = normalizePackage(s);
  t.not(s, p, 'creates a new object');
  t.not(p.resources, s.resources, 'creates a new resources array');
  t.is(p.path, './fixtures/gdp/datapackage.json', 'adds path');
  t.is(p.base, 'fixtures/gdp/', 'adds base');
});

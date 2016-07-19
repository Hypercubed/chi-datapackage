/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import {load} from '../';

/* test('missing package', async t => {
  const p = await load('./fixtures/inline/datapackage.json');

}); */

test('missing package', async t => {
  t.throws(load('fixtures/never/found/'), /Error: No DataPackage at path/);
});

test('missing resource', async t => {
  t.throws(load('fixtures/errors/'), /Error: No DataPackage resource at path/);
});

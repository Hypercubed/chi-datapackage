/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import dp from '../';

/* test('missing package', async t => {
  const p = await load('./fixtures/inline/datapackage.json');

}); */

test('loader, fetch required', async t => {
  t.throws(() => {
    new dp.loader.constructor(); // eslint-disable-line no-new
  }, 'opts.fetch is required.');
});

test('normalizer, mimeLookup required', async t => {
  t.throws(() => {
    new dp.normalize.constructor(); // eslint-disable-line no-new
  }, 'opts.mimeLookup is required.');
});

test('processor, translators required', async t => {
  t.throws(() => {
    new dp.processor.constructor({}); // eslint-disable-line no-new
  }, 'opts.translators is required.');
});

test('processor, schemaProcessor required', async t => {
  t.throws(() => {
    new dp.processor.constructor({translators: {}}); // eslint-disable-line no-new
  }, 'opts.schemaProcessor is required.');
});

test('schemaProcessor, types required', async t => {
  t.throws(() => {
    new dp.schemaProcessor.constructor(); // eslint-disable-line no-new
  }, 'opts.types is required.');
});

test('missing package', async t => {
  t.throws(dp.load('fixtures/never/found/'), /Error: No DataPackage at path/);
});

test('missing resource', async t => {
  t.throws(dp.load('fixtures/errors/'), /Error: No DataPackage resource at path/);
});

import test from 'ava';
import {action, useStrict, observe} from 'mobx';
import {createViewModel} from 'mobx-utils';

import {makePackage} from '../src/store';

const json = [{A: '1', B: '2', C: '3'}, {A: '4', B: '5', C: '6'}];
const jsonProcessed = [{A: '1', B: 2, C: 3}, {A: '4', B: 5, C: 6}];
const jsonProcessedUpdate = [{A: '1', B: 2, C: 3}, {A: '7', B: 8, C: 9}];

const matrix = {
  columns: ['B', 'C'],
  rows: ['1', '4'],
  table: [['2', '3'], ['5', '6']]
};

const resourceNames = [
  'one.txt',
  'two.csv',
  'three.tsv',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven'
];

useStrict(true);

function isPlainObject (value) {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

test('create an empty data package', t => {
  const datapackage = makePackage('fixtures/loaded/');

  t.regex(datapackage.path, /fixtures\/loaded\/$/);
  t.is(datapackage.resources.length, 0);
  t.deepEqual(Object.keys(datapackage.$resourcesByName), []);
});

test('load a data package', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();
  const resources = datapackage.resources;

  t.is(resources.length, 11);

  t.deepEqual(resources[0].data, 'hello\n');
  t.is(typeof resources[0].data, 'string');
  t.is(resources[0].$processedCount, 1);

  [1, 2].forEach(i => {
    t.deepEqual(resources[i].data, json);
    t.true(Array.isArray(resources[i].data));
    t.is(resources[i].$processedCount, 1);
  });

  [3, 4].forEach(i => {
    t.deepEqual(resources[i].data, matrix);
    t.true(isPlainObject(resources[i].data));
    t.is(resources[i].$processedCount, 1);
  });

  [5, 6, 7, 8, 9, 10].forEach(i => {
    t.deepEqual(resources[i].data, jsonProcessed);
    t.true(Array.isArray(resources[i].data));
    t.is(resources[i].$processedCount, 1);
  });

  t.deepEqual(Object.keys(datapackage.$resourcesByName), resourceNames);
});

test('create a data package with inline data', async t => {
  const datapackage = await makePackage('fixtures/inline/').load();
  const resources = datapackage.resources;

  t.is(resources.length, 11);

  t.deepEqual(resources[0].data, 'hello\n');
  t.is(typeof resources[0].data, 'string');
  t.is(resources[0].$processedCount, 1);

  [1, 2].forEach(i => {
    t.deepEqual(resources[i].data, json);
    t.true(Array.isArray(resources[i].data));
    t.is(resources[i].$processedCount, 1);
  });

  [3, 4].forEach(i => {
    t.deepEqual(resources[i].data, matrix);
    t.true(isPlainObject(resources[i].data));
    t.is(resources[i].$processedCount, 1);
  });

  [5, 6, 7, 8, 9, 10].forEach(i => {
    t.deepEqual(resources[i].data, jsonProcessed);
    t.true(Array.isArray(resources[i].data));
    t.is(resources[i].$processedCount, 1);
  });

  t.is(Object.keys(datapackage.$resourcesByName).length, 11);
});

test('add a new resource', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();

  datapackage.addResource({
    name: 'new',
    format: 'csv',
    content: 'A,B,C\n1,2,3\n4,5,6'
  });

  t.is(datapackage.resources.length, 12);
  t.deepEqual(datapackage.resources[11].data, json);
  t.true(Array.isArray(datapackage.resources[11].data));
  t.is(datapackage.resources[11].$processedCount, 1);

  t.deepEqual(Object.keys(datapackage.$resourcesByName), resourceNames.concat(['new']));
});

test('add new resource with schema', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();

  datapackage.addResource({
    name: 'new',
    format: 'csv',
    schema: 'abc-schema',
    content: 'A,B,C\n1,2,3\n4,5,6'
  });

  t.is(datapackage.resources.length, 12);
  t.deepEqual(datapackage.resources[11].data, jsonProcessed);
  t.true(Array.isArray(datapackage.resources[11].data));
  t.is(datapackage.resources[11].$processedCount, 1);

  t.deepEqual(Object.keys(datapackage.$resourcesByName), resourceNames.concat(['new']));
});

test('update a resource', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();

  const resource = datapackage.resources[5];

  t.deepEqual(resource.data, jsonProcessed);

  datapackage.updateResource({
    name: resource.name,
    content: 'A,B,C\n1,2,3\n7,8,9'
  });

  t.deepEqual(datapackage.resources[5].data, jsonProcessedUpdate);
  t.true(Array.isArray(datapackage.resources[5].data));
  t.is(datapackage.resources[5].$processedCount, 2);

  t.deepEqual(Object.keys(datapackage.$resourcesByName), resourceNames);
});

test('update resource with schema', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();

  const resource = datapackage.resources[5];

  t.deepEqual(resource.data, jsonProcessed);

  datapackage.updateResource({
    name: resource.name,
    content: 'A,B,C\n1,2,3\n4,5,6',
    schema: 'abc-schema'
  });

  t.deepEqual(resource.data, jsonProcessed);
  t.true(Array.isArray(resource.data));
  t.is(resource.$processedCount, 2);

  t.deepEqual(Object.keys(datapackage.$resourcesByName), resourceNames);
});

test('update resource directly', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();

  const resource = datapackage.resources[5];

  t.deepEqual(resource.data, jsonProcessed);

  resource.update({
    content: 'A,B,C\n1,2,3\n7,8,9'
  });

  t.deepEqual(datapackage.resources[5].data, jsonProcessedUpdate);
  t.true(Array.isArray(datapackage.resources[5].data));
  t.is(datapackage.resources[5].$processedCount, 2);

  t.deepEqual(Object.keys(datapackage.$resourcesByName), resourceNames);
});

test('update resource content', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();
  const resource = datapackage.resources[5];

  action(() => {
    resource.content = 'A,B,C\n1,2,3\n7,8,9';
  })();

  t.deepEqual(resource.data, jsonProcessedUpdate);
  t.true(Array.isArray(resource.data));
  t.is(resource.$processedCount, 2);

  t.deepEqual(Object.keys(datapackage.$resourcesByName), resourceNames);
});

test('multple updates', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();
  const resource = datapackage.resources[5];

  action(() => {
    resource.content = 'A,B,C\n1,2,3\n7,8,9';
  })();

  t.deepEqual(resource.data, jsonProcessedUpdate);
  t.true(Array.isArray(resource.data));
  t.is(resource.$processedCount, 2);

  action(() => {
    resource.content = 'A,B,C\n1,2,3\n10,11,12';
  })();

  t.deepEqual(resource.data, [{A: '1', B: 2, C: 3}, {A: '10', B: 11, C: 12}]);
  t.true(Array.isArray(resource.data));
  t.is(resource.$processedCount, 3);

  t.deepEqual(Object.keys(datapackage.$resourcesByName), resourceNames);
});

test('only updates once per action', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();
  const resource = datapackage.resources[5];

  action(() => {
    resource.content = 'A,B,C\n1,2,3\n7,8,9';
    resource.content = 'A,B,C\n1,2,3\n10,11,12';
  })();

  t.deepEqual(resource.data, [{A: '1', B: 2, C: 3}, {A: '10', B: 11, C: 12}]);
  t.true(Array.isArray(resource.data));
  t.is(resource.$processedCount, 2);

  t.deepEqual(Object.keys(datapackage.$resourcesByName), resourceNames);
});

test('only updates if content has changed', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();
  const resource = datapackage.resources[5];

  action(() => {
    resource.content = 'A,B,C\n1,2,3\n4,5,6\n';
  })();

  t.deepEqual(resource.data, jsonProcessed);
  t.true(Array.isArray(resource.data));
  t.is(resource.$processedCount, 1);

  t.deepEqual(Object.keys(datapackage.$resourcesByName), resourceNames);
});

test('can use createViewModel', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();
  const resources = datapackage.resources;
  const viewModel = resources.map(createViewModel);

  action(() => {
    viewModel[5].content = 'A,B,C\n1,2,3\n7,8,9';
  })();

  t.deepEqual(resources[5].data, jsonProcessed);
  t.true(Array.isArray(resources[5].data));
  t.is(resources[5].$processedCount, 1);

  viewModel[5].submit();

  t.deepEqual(resources[5].data, jsonProcessedUpdate);
  t.true(Array.isArray(resources[5].data));
  t.is(resources[5].$processedCount, 2);
});

test('can use reset createViewModel', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();
  const resources = datapackage.resources;
  const viewModel = resources.map(createViewModel);

  action(() => {
    viewModel[5].content = 'A,B,C\n1,2,3\n7,8,9';
  })();

  t.deepEqual(resources[5].data, jsonProcessed);
  t.true(Array.isArray(resources[5].data));
  t.is(resources[5].$processedCount, 1);

  viewModel[5].reset();

  t.deepEqual(resources[5].data, jsonProcessed);
  t.true(Array.isArray(resources[5].data));
  t.is(resources[5].$processedCount, 1);
});

test('can observe isLoading', async t => {
  const datapackage = makePackage('fixtures/loaded/');

  let a = 0;
  observe(datapackage, 'isLoading', () => {
    a++;
  });

  t.is(a, 0);

  await datapackage.load();

  t.is(a, 2); // false => true -> false
});

test('observe errors', async t => {
  const datapackage = await makePackage('fixtures/loaded/').load();
  const resource = datapackage.resources[5];

  let a = 0;
  observe(resource, 'errors', () => {
    a++;
  });

  action(() => {
    resource.content = 'A,B,D\n1,2,3\n7,8,9';
  })();

  t.is(resource.errors.length, 2);
  t.is(a, 1);

  action(() => {
    resource.content = 'A,B,E\n1,2,3\n7,8,9';
  })();

  t.is(resource.errors.length, 2);
  t.is(a, 2);

  t.deepEqual(resource.data, jsonProcessed);
  t.true(Array.isArray(resource.data));
  t.is(resource.$processedCount, 3);

  t.deepEqual(Object.keys(datapackage.$resourcesByName), resourceNames);
});

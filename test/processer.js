/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import dp from '../';

const json = [{
  aString: '1',
  anInteger: 2,
  aDate: new Date('1/2/3')
}, {
  aString: '',
  anInteger: 5,
  aDate: new Date('1/2/6')
}, {
  aString: '7',
  anInteger: null,
  aDate: new Date('1/2/9')
}, {
  aString: '10',
  anInteger: 11,
  aDate: null
}];

const content = `
aString,anInteger,aDate
1,2,1-2-3
,5,1-2-6
7,Nan,1-2-9
10,11,-
`;

test('process resource with missing values', async t => {
  const r = {
    mediatype: 'text/csv',
    content,
    schema: {
      fields: [
        {name: 'aString', type: 'string'},
        {name: 'anInteger', type: 'integer', missingValues: ['Nan', '-']},
        {name: 'aDate', type: 'date', format: 'any', missingValues: '-'}
      ]
    }
  };

  r.schema = dp.schemaProcessor.normalizeSchema(r.schema);
  t.deepEqual(r.schema.fields.map(d => d.type), ['string', 'integer', 'date']);
  t.deepEqual(r.schema.fields.map(d => d.title), ['A String', 'An Integer', 'A Date']);
  t.deepEqual(r.schema.fields.map(d => d.format), ['default', 'default', 'any']);

  const pr = dp.processor.resource(r);

  t.not(pr, r, 'creates a new object');
  t.deepEqual(pr.data, json);
});

test('process resource with errors', async t => {
  const content = `
aString,anInteger,aDate
1,abc,1-2-3
4,5.5,1-2-6
7,8,def
10,11
`;

/*
[ { type: 'FieldMismatch',
    code: 'TooFewFields',
    message: 'Too few fields: expected 3 fields but parsed 2',
    row: 3 },
  { type: 'FieldMismatch',
    code: 'InvalidType',
    message: 'Invalid type: expected integer value',
    row: 0 },
  { type: 'FieldMismatch',
    code: 'InvalidType',
    message: 'Invalid type: expected integer value',
    row: 1 },
  { type: 'FieldMismatch',
    code: 'InvalidType',
    message: 'Invalid type: expected formmated date',
    row: 2 },
  { type: 'ConstraintsError',
    code: 'MissingField',
    message: 'Missing field: the field "d" requires a value',
    row: 3 } ]
*/

  const r = {
    mediatype: 'text/csv',
    content,
    schema: {
      fields: [
        {name: 'aString', constraints: {required: true}}, // normalizes to string
        {name: 'anInteger', type: 'integer', constraints: {required: true}},
        {name: 'aDate', type: 'date', format: 'any', missingValues: '-', constraints: {required: true}}
      ]
    }
  };

  r.schema = dp.schemaProcessor.normalizeSchema(r.schema);
  t.deepEqual(r.schema.fields.map(d => d.type), ['string', 'integer', 'date']);
  t.deepEqual(r.schema.fields.map(d => d.title), ['A String', 'An Integer', 'A Date']);
  t.deepEqual(r.schema.fields.map(d => d.format), ['default', 'default', 'any']);

  const pr = dp.processor.resource(r);

  t.is(pr.errors.length, 5);
  t.not(pr, r, 'creates a new object');
});

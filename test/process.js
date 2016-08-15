/* eslint node/no-unsupported-features: 0 */
import test from 'ava';

import dp from '../';

const json = [{
  s: '1',
  n: 2,
  d: new Date('1/2/3')
}, {
  s: '',
  n: 5,
  d: new Date('1/2/6')
}, {
  s: '7',
  n: null,
  d: new Date('1/2/9')
}, {
  s: '10',
  n: 11,
  d: null
}];

const content = `
s,n,d
1,2,1-2-3
,5,1-2-6
7,Nan,1-2-9
10,11,-
`;

test('process resource with missing values', async t => {
  const r = dp.processResource({
    mediatype: 'text/csv',
    content,
    schema: {
      fields: [
        {name: 's', type: 'string'},
        {name: 'n', type: 'number', missingValues: ['Nan', '-']},
        {name: 'd', type: 'date', format: 'any', missingValues: '-'}
      ]
    }
  });

  t.deepEqual(r.data, json);
});

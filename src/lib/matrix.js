// @flow

const parse = require('babyparse').parse;

/* ::
type Matrix = {
  columns: Array<string>,
  rows: Array<string>,
  table: Array<Array<any>>
}
*/

function matrixParse (content /* : string | void */, dialect /* : Object | void */) /* : Object */ {
  dialect = Object.assign({
    delimiter: '\t',
    fastMode: false,
    skipEmptyLines: true,
    comments: '#'
  }, dialect);
  const parsed = parse(content, dialect);
  parsed.data = convertToPlainMatrix(parsed.data);
  return parsed;
}

function convertToPlainMatrix (table /* : Array<Array<any>> */) /* : Matrix */ {
  table = table.slice();
  const columns /* : Array<string> */ = table.splice(0, 1)[0].slice(1);
  const rows /* : Array<string> */ = table.map((d /* : Array<string> */) => d.splice(0, 1)[0]);
  return {
    columns,
    rows,
    table
  };
}

module.exports = matrixParse;

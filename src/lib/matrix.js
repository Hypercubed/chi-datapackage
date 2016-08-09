// @flow

const Papa = require('babyparse');

function matrixParse (content /* : string | typeof undefined */, dialect /* : Object | typeof undefined */) /* : Object */ {
  dialect = Object.assign({
    delimiter: '\t',
    fastMode: false,
    skipEmptyLines: true,
    comments: '#'
  }, dialect);
  const parsed = Papa.parse(content, dialect);
  parsed.data = convertToPlainMatrix(parsed.data);
  return parsed;
}

function convertToPlainMatrix (table /* : Object */) /* : Object */ {
  table = table.slice();
  const columns = table.splice(0, 1)[0].slice(1);
  const rows = table.map(d => d.splice(0, 1)[0]);
  return {
    columns,
    rows,
    table
  };
}

module.exports = matrixParse;

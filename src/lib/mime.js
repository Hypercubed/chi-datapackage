// @flow

const mimeDb = {
  'text/tab-separated-values': {
    source: 'iana',
    compressible: true,
    extensions: ['tsv']
  },
  'text/csv': {
    source: 'iana',
    compressible: true,
    extensions: ['csv']
  },
  'text/plain': {
    source: 'iana',
    compressible: true,
    extensions: ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'ini']
  },
  'text/yaml': {
    extensions: ['yaml', 'yml']
  },
  'application/json': {
    source: 'iana',
    charset: 'UTF-8',
    compressible: true,
    extensions: ['json', 'json5', 'map']
  },
  'text/matrix': {
    source: 'custom',
    extensions: ['matrix', 'expression', 'osc']
  }
};

module.exports = mimeDb;

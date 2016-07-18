const parse = require('json5').parse;

module.exports = function fromJson (json) {
  if (typeof json === 'string' || json instanceof Buffer) {
    try {
      json = parse(json);
    } catch (err) {
      json = {};
    }
  }
  return json;
};

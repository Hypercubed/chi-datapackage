const parse = require('json5').parse;

module.exports = function fromJson (json) {
  if (typeof json === 'string' || /* istanbul ignore next */ json instanceof Buffer) {
    try {
      json = parse(json);
    } catch (err) {
      /* istanbul ignore next */
      json = {};
    }
  }
  return json;
};

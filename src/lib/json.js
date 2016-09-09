const JSON5 = require('json5');

module.exports.json5 = function (json) {
  if (typeof json === 'string' || /* istanbul ignore next */ json instanceof Buffer) {
    try {
      json = JSON5.parse(json);
    } catch (err) {
      /* istanbul ignore next */
      json = {};
    }
  }
  return json;
};

module.exports.json = function (json) {
  if (typeof json === 'string' || /* istanbul ignore next */ json instanceof Buffer) {
    try {
      json = JSON.parse(json);
    } catch (err) {
      /* istanbul ignore next */
      json = {};
    }
  }
  return json;
};

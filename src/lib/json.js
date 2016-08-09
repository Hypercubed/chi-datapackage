// @flow

const parse = require('json5').parse;

/* :: type INPUT = String | Buffer | Object | typeof undefined */
/* :: type OUTPUT = Object */

/**
 * Create JS object from JSON text
 * @param {String | Buffer | Object} json string or buffer containing JSON or json5 data
 * @return {Object} JS Object
 */
function fromJson (json /* : INPUT */) /* : OUTPUT */ {
  if (typeof json === 'string' || /* istanbul ignore next */ json instanceof Buffer) {
    try {
      return parse(json);
    } catch (err) {
      /* istanbul ignore next */
      return {};
    }
  }
  return json;
}

module.exports = fromJson;

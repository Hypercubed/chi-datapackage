// @flow

const parse = require('json5').parse;

/* ::
type JSON = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key:string]: JSON };
type JSONArray = Array<JSON>;

type ParseFunction = (content?: string) => JSONObject | JSONArray
*/

/**
 * Create JS object from JSON text
 * @param {String | Buffer | Object} json string or buffer containing JSON or json5 data
 * @return {Object} JS Object
 */
function fromJson (json /* : string | typeof undefined | Buffer | JSONObject | JSONArray */) /* : JSONObject | JSONArray */ {
  if (typeof json === 'undefined' || json === '') {
    return {};
  }
  if (typeof json === 'string' || /* istanbul ignore next */ json instanceof Buffer) {
    try {
      return parse(String(json));
    } catch (err) {
      /* istanbul ignore next */
      return {};
    }
  }
  return json;
}

module.exports = fromJson;

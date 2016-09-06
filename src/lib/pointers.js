const jsonpointer = require('jsonpointer');

const badPtrTokenRegex = /~(?:[^01]|$)/g;

module.exports.isPointer = function isPointer (ptr) {
  if (typeof ptr !== 'string') {
    return false;
  }

  const ch = ptr.charAt(0);

  if (ch !== '#' && ch !== '/') {
    return false;
  } else if (ch === '#' && ptr !== '#' && ptr.charAt(1) !== '/') {
    return false;
  } else if (ptr.match(badPtrTokenRegex)) {
    return false;
  }

  return true;
};

module.exports.get = function get (obj, ptr) {
  ptr = ptr.replace(/^#/, '');
  return jsonpointer.get(obj, ptr);
};

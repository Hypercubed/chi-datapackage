
module.exports.normalizeObject = function (obj) {
  if (typeof obj === 'string') {
    return {path: obj};
  } else if (typeof obj === 'undefined') {
    return {};
  }
  return Object.assign({}, obj);
};

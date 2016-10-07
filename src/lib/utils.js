function normalizeObject (obj) {
  if (typeof obj === 'string') {
    return {path: obj};
  } else if (typeof obj === 'undefined') {
    return {};
  }
  return Object.assign({}, obj);
}

function makeNonEnumerable (object, propNames) {
  for (var i = 0; i < propNames.length; i++) { // eslint-disable-line no-var
    addHiddenProp(object, propNames[i], object[propNames[i]]);
  }
}

function addHiddenProp (object, propName, value) {
  Object.defineProperty(object, propName, {
    enumerable: false,
    writable: true,
    configurable: true,
    value
  });
}

module.exports = {
  normalizeObject,
  makeNonEnumerable,
  addHiddenProp
};

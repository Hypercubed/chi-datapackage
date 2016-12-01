'use strict';

const nodePath = require('path');
// const urijs = require('urijs');
// const debug = require('debug')('resolve');
const identifier = require('datapackage-identifier');

const absURLRegEx = /^([^/]+:\/\/|\/)/;
const backSlashPattern = /\\/g;

const path = (() => {
  /* istanbul ignore next , in browser */
  if (typeof document !== 'undefined') {
    return function (url) {
      const div = document.createElement('div');
      div.innerHTML = '<a></a>';
      div.firstChild.href = url; // Ensures that the href is properly escaped

      // Run the current innerHTML back through the parser
      div.innerHTML = div.innerHTML; // eslint-disable-line no-self-assign
      return div.firstChild.href;
    };
  }

  return url => {
    url = nodePath
      .resolve(url)  // ensures path is absolute
      .replace(backSlashPattern, '/');  // ensures path is POSIX, ready to be a url
    return (url[0] === '/') ? url : `/${url}`;
  };
})();

function datapackage (datapackage) {
  let url = datapackage.path || datapackage.url;
  url = url.replace(backSlashPattern, '/');
  if (!url.match(absURLRegEx)) {
    url = path(url);
  }
  if (url.indexOf('file://') === 0) {
    return {
      url,
      dataPackageJsonUrl: url
    };
  }
  const id = identifier.parse(url);
  if (id.version === '') {
    delete id.version;
  }
  return id;
}

module.exports = {
  path,
  datapackage
};

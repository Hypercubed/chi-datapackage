# chi-datapackage

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

> Normalize datapackage and datapackage resources

## Install

```sh
npm i -D chi-datapackage
```

## Basic usage

```js
import {load} from 'chi-datapackage';

load('//datapackage/path/or/url').then(datapackage => {
  /* so something */
});
```

## Advanced usage

```js
const MimeLookup = require('mime-lookup');

const Normalizer = require('chi-datapackage/src/normalizer');
const Processor = require('chi-datapackage/src/processor');
const SchemaProcessor = require('chi-datapackage/src/schema');
const Loader = require('chi-datapackage/src/loader');

const mimeDb = require('chi-datapackage/src/lib/mime.json');         // or your custom mimeDb
const translators = require('chi-datapackage/src/lib/translators');  // or your custom translators
const types = require('chi-datapackage/src/lib/types');              // or your custom types
const fetch = require('chi-datapackage/src/lib/fetch');              // or your custom fetch promise

const mimeLookup = new MimeLookup(mimeDb);
const normalize = new Normalizer({mimeLookup});
const schemaProcessor = new SchemaProcessor({types});
const process = new Processor({translators, schemaProcessor});
const load = new Loader({fetch});

load
  .datapackage('//datapackage/path/or/url')
  .then(p => normalize.datapackage(p))
  .then(p => normalize.resources(p))
  .then(p => load.resources(p))
  .then(p => process.datapackage(p))
  .then(p => {
    /* so something */
  });
```

## License

Copyright (c) 2015-2016 RIKEN, Japan.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[npm-url]: https://npmjs.org/package/chi-datapackage
[npm-image]: https://img.shields.io/npm/v/chi-datapackage.svg?style=flat-square

[travis-url]: https://travis-ci.org/Hypercubed/chi-datapackage
[travis-image]: https://img.shields.io/travis/Hypercubed/chi-datapackage.svg?style=flat-square

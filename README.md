# chi-datapackage

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

> Normalize datapackage and datapackage resources

## Install

```sh
npm i -D chi-datapackage
```

## Usage

```js
import {readFileSync} from 'fs';
import {Normalizer} from 'chi-datapackage';

const normalize = new Normalizer();

const path = './some/file/path';
const content = readFileSync(filename, 'utf8');

const datapackage = normalize.datapackage({
  ...JSON.parse(content),
  path
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

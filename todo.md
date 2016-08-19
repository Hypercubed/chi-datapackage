# Todo list

_\( managed using [todo-md](https://github.com/Hypercubed/todo-md) \)_

- [x] Normalizer
  - [x] Assign name if none found
  - [x] Normalize schemas
  - [ ] Handle URL schemas
  - [x] Test datapackage loaded from url
  - [ ] only one of url, path, data present in resource
  - [ ] Consider [CSVDDF](http://specs.frictionlessdata.io/csv-dialect/)
- [x] Resource processors
  - [x] test each processor
- [x] Schema processor
  - [x] Test each cast
  - [x] Support type formats
  - [ ] More field constraints
  - [x] Test constraints
  - [ ] Validate schema (see https://github.com/frictionlessdata/jsontableschema-js/blob/master/src/validate.js)
- [x] Loader
  - [x] Test URL fetch
  - [x] Test github fetch
  - [ ] be strict about path vs. url

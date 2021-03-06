CHANGELOG
=========

## HEAD (Unreleased)
_(none)_

--------------------

## 5.0.5 (2016-12-01)
* Fix loaded datapackages lose version

## 5.0.4 (2016-11-01)
* Update dependencies

## 5.0.3 (2016-10-07)
* Fix block scope incompat with node v4

## 5.0.2 (2016-10-07)
* Fix errors when data is defined inline

## 5.0.1 (2016-09-30)
* Fix Block-scoped declarations (let, const, function, class) not yet supported outside strict mode

## 5.0.0 (2016-09-30)
* Added observable Data Package store using mobx

## 4.0.2 (2016-09-22)
_(none)_

## 4.0.1 (2016-09-13)
* Fix for environments that don't support for const in

## 4.0.0 (2016-09-12)
* read and fetch as separate options for Loader
* Add separate JSON and JSON5 types
* Improved error handling

## 3.1.0 (2016-09-06)
_(none)_

## 3.0.1 (2016-08-24)
* Ensure paths are always POSIX

## 3.0.0 (2016-08-19)
* Assign cuid to resources without name
* Record errors while processing data
* Add normalizeSchemas to DataPackageService
* Now normalize schemas after resources
* Generate missing readable title from field name

## 2.2.0 (2016-08-15)
* add support for missingValues
* Support NaN, INF, and -INF in number and integer types
* Types are now strict

## 2.1.1 (2016-08-09)
* Fixed bug in DataPackageService:normalizeResource

## 2.1.0 (2016-08-09)
* Added strict ISO 8601 UTC date and time types
* Added ISO 8601 duration type
* Added more truthy values to boolean type
* Added 'fmt' format to date and time types

## 2.0.0 (2016-07-20)
_(none)_

## 1.0.0 (2016-07-17)
_(none)_

type JSON = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key:string]: JSON };
type JSONArray = Array<JSON>;

declare module 'json5' {
  declare function parse(str?: string): JSONObject
}

declare module 'js-yaml' {
  declare function safeLoad(str?: string): Object
}

declare module 'crlf-helper' {
  declare function setLineEnding(str?: string, type: string): string
}

declare module 'babyparse' {
  declare function parse(str?: string, opts?: Object): Object
}

declare module 'd3-time-format' {
  declare function utcParse(str?: string): (str?: string) => Date
}

declare module 'parse-iso-duration' {
  declare module.exports: (str?: string) => number
}

declare module 'datapackage-identifier' {
  declare function parse(str?: string): Object
}

declare module 'deep-extend' {
  declare module.exports: (content: Object) => Object
}

type uri = {
  normalizePathname: function,
  href: () => string,
  suffix: () => string,
  filename: () => string,
  absoluteTo: (str?: string) => uri,
  normalizePathname: () => uri,
  directory: () => string
}

declare module 'urijs' {
  declare module.exports: (content: string) => uri
}

declare class MimeLookup {
  lookup: (str: string) => string;
}

declare module 'mime-lookup' {
  declare module.exports: Class<MimeLookup>
}

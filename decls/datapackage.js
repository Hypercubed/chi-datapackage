
declare type FieldType = {
  name: string,
  type: string,
  format?: string
}

declare type CastMap = {
  [key: string]: (any: any) => any
}

declare type TranslatorsMap = {
  [key: string]: function
}

declare type SchemaType = {
  fields: Array<FieldType>,
  $castMap?: CastMap,
  key?: string
};

declare type Resource = {
  path?: string,
  url?: string,
  format?: string,
  name?: string,
  mediatype?: string,
  schema?: SchemaType,
  data?: Object | Array<any> | string,
  content?: string,
  dialect?: Object
};

declare type DataPackage = {
  path?: string,
  url?: string,
  resources?: Array<Resource>,
  $resourcesByName?: {
    [key: string]: Resource
  },
  schemas?: {
    [key: string]: SchemaType
  },
  dataPackageJsonUrl?: string,
  image?: string,
  readme?: string
};

declare type TypesMap = {
  [key: string]: {
    [key: string]: (in: any) => any | (in: string) => (in: any) => any
  }
}

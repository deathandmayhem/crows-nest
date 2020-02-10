import { Mongo } from 'meteor/mongo';
import t from 'io-ts';
import { date, DateC } from 'io-ts-types/lib/date';
import AutoValueType from './AutoValueType';
import SchemaCodec, { NestedCodec, TopLevelProps, NestedProps } from './SchemaCodec';

interface JSONSchema {
  bsonType?: Mongo.BsonType & string;
  enum?: any[];
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  required?: string[];
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema | JSONSchema[];
}

// TypeScript won't treat these equality comparisons as type guards, so we have
// to make them one
function isInt(codec: t.Type<any>): codec is typeof t.Int {
  return codec === t.Int;
}

function isDate(codec: t.Type<any>): codec is DateC {
  return codec === date;
}

/* eslint-disable @typescript-eslint/no-use-before-define */

function nullToSchema(_codec: t.NullC): JSONSchema {
  return {
    bsonType: 'null',
  };
}

function booleanToSchema(_codec: t.BooleanC): JSONSchema {
  return {
    bsonType: 'bool',
  };
}

function intToSchema(_codec: typeof t.Int): JSONSchema {
  return {
    bsonType: 'int',
  };
}

function numberToSchema(_codec: t.NumberC): JSONSchema {
  return {
    bsonType: 'double',
  };
}

function stringToSchema(_codec: t.StringC): JSONSchema {
  return {
    bsonType: 'string',
  };
}

function dateToSchema(_codec: DateC): JSONSchema {
  return {
    bsonType: 'date',
  };
}

function literalToSchema(codec: t.LiteralC<string | number | boolean>): JSONSchema {
  let bsonType: Mongo.BsonType;
  if (typeof codec.value === 'string') {
    bsonType = 'string';
  } else if (typeof codec.value === 'number') {
    bsonType = 'double';
  } else {
    bsonType = 'bool';
  }
  return {
    bsonType,
    enum: [codec.value],
  };
}

function arrayToSchema<P extends NestedCodec>(codec: t.ArrayC<P>): JSONSchema {
  return {
    bsonType: 'array',
    items: nestedCodecToSchema(codec.type),
  };
}

function tupleToSchema<
  C extends SchemaCodec | NestedCodec,
  P extends [C, ...C[]]
>(codec: t.TupleC<P>): JSONSchema {
  return {
    bsonType: 'array',
    items: codec.types.map(nestedCodecToSchema),
  };
}

function nestedInterfaceToSchema<P extends NestedProps>(codec: t.TypeC<P>): JSONSchema {
  const properties: Record<string, JSONSchema> = {};
  Object.entries(codec.props).forEach(([name, childCodec]) => {
    properties[name] = nestedCodecToSchema(childCodec);
  });
  return {
    bsonType: 'object',
    required: Object.keys(codec.props),
    properties,
  };
}

function interfaceToSchema<P extends TopLevelProps>(codec: t.TypeC<P>): JSONSchema {
  const properties: Record<string, JSONSchema> = {};
  Object.entries(codec.props).forEach(([name, childCodec]) => {
    properties[name] = nestedCodecToSchema(childCodec);
  });
  return {
    bsonType: 'object',
    required: Object.keys(codec.props),
    properties,
  };
}

function nestedPartialToSchema<P extends NestedProps>(codec: t.PartialC<P>): JSONSchema {
  const properties: Record<string, JSONSchema> = {};
  Object.entries(codec.props).forEach(([name, c]) => {
    properties[name] = nestedCodecToSchema(c);
  });
  return {
    bsonType: 'object',
    properties,
  };
}

function partialToSchema<P extends TopLevelProps>(codec: t.PartialC<P>): JSONSchema {
  const properties: Record<string, JSONSchema> = {};
  Object.entries(codec.props).forEach(([name, c]) => {
    properties[name] = nestedCodecToSchema(c);
  });
  return {
    bsonType: 'object',
    properties,
  };
}

function nestedIntersectionToSchema<
  CS extends [NestedCodec, NestedCodec, ...NestedCodec[]]
>(
  codec: t.IntersectionC<CS>,
): JSONSchema {
  return {
    allOf: codec.types.map(nestedCodecToSchema),
  };
}

function intersectionToSchema<
  CS extends [SchemaCodec, SchemaCodec, ...SchemaCodec[]],
>(
  codec: t.IntersectionC<CS>,
): JSONSchema {
  return {
    allOf: codec.types.map(codecToSchema),
  };
}

function nestedUnionToSchema<
  CS extends [NestedCodec, NestedCodec, ...NestedCodec[]]
>(
  codec: t.UnionC<CS>,
): JSONSchema {
  return {
    anyOf: codec.types.map(nestedCodecToSchema),
  };
}

function nestedCodecToSchema(codec: NestedCodec | AutoValueType<any, any>): JSONSchema {
  // Most types have a _tag property, but these two don't
  if (isInt(codec)) {
    return intToSchema(codec);
  }
  if (isDate(codec)) {
    return dateToSchema(codec);
  }

  // eslint-disable-next-line no-underscore-dangle
  switch (codec._tag) {
    case 'AutoValueType':
      return nestedCodecToSchema(codec.underlying);
    case 'RefinementType':
      // For general refinement types, just unwrap them
      return nestedCodecToSchema(codec.type);
    case 'NullType':
      return nullToSchema(codec);
    case 'BooleanType':
      return booleanToSchema(codec);
    case 'NumberType':
      return numberToSchema(codec);
    case 'StringType':
      return stringToSchema(codec);
    case 'LiteralType':
      return literalToSchema(codec);
    case 'ArrayType':
      return arrayToSchema(codec);
    case 'TupleType':
      return tupleToSchema(codec);
    case 'InterfaceType':
      return nestedInterfaceToSchema(codec);
    case 'PartialType':
      return nestedPartialToSchema(codec);
    case 'IntersectionType':
      return nestedIntersectionToSchema(codec);
    case 'UnionType':
      return nestedUnionToSchema(codec);
  }
}

/**
 * Convert an io-ts codec to a
 * {@link https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/ | JSON}
 * schema compatible with MongoDB's
 * {@link https://docs.mongodb.com/manual/core/schema-validation/ | schema validation}
 * feature.
 *
 * The implementation is intentionally structured to take advantage of
 * exhaustiveness checking from TypeScript. Adding new types to the various
 * unions that make up {@link ./SchemaCodec#SchemaCodec} should cause this
 * to fail to compile.
 */
function codecToSchema(codec: SchemaCodec): JSONSchema {
  // eslint-disable-next-line no-underscore-dangle
  switch (codec._tag) {
    case 'InterfaceType':
      return interfaceToSchema(codec);
    case 'PartialType':
      return partialToSchema(codec);
    case 'IntersectionType':
      return intersectionToSchema(codec);
  }
}

/* eslint-enable @typescript-eslint/no-use-before-define */

export default codecToSchema;

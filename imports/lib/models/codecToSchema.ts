import { Mongo } from 'meteor/mongo';
import t from 'io-ts';
import { date } from 'io-ts-types/lib/date';

// ValidatableCodec is a codec that we can definitely walk if we need to. If we
// want to do more sophisticated types (e.g. refined types), we need to expand
// this and handle below
export type ValidatableCodec =
  // scalar types
  t.NullType |
  t.BooleanType |
  typeof t.Int |
  t.NumberType |
  t.StringType |
  typeof date |
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t.LiteralType<any> |
  // compound types
  t.ArrayType<ValidatableCodec> |
  t.InterfaceType<ValidatableProps> |
  t.PartialType<ValidatableProps> |
  t.IntersectionType<[ValidatableCodec, ValidatableCodec, ...ValidatableCodec[]]> |
  t.UnionType<ValidatableCodec[]>;
type ValidatableProps = {
  [key: string]: ValidatableCodec;
}

interface JSONSchema {
  bsonType?: Mongo.BsonType & string;
  enum?: any[];
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  required?: string[];
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
}

// TypeScript won't treat these equality comparisons as type guards, so we have
// to make them one
function isInt(codec: t.Type<any>): codec is typeof t.Int {
  return codec === t.Int;
}

function isDate(codec: t.Type<any>): codec is typeof date {
  return codec === date;
}

/* eslint-disable @typescript-eslint/no-use-before-define,@typescript-eslint/no-unused-vars */

function nullToSchema(_codec: t.NullType): JSONSchema {
  return {
    bsonType: 'null',
  };
}

function booleanToSchema(_codec: t.BooleanType): JSONSchema {
  return {
    bsonType: 'bool',
  };
}

function intToSchema(_codec: typeof t.Int): JSONSchema {
  return {
    bsonType: 'int',
  };
}

function numberToSchema(_codec: t.NumberType): JSONSchema {
  return {
    bsonType: 'double',
  };
}

function stringToSchema(_codec: t.StringType): JSONSchema {
  return {
    bsonType: 'string',
  };
}

function dateToSchema(_codec: typeof date): JSONSchema {
  return {
    bsonType: 'date',
  };
}

function literalToSchema(codec: t.LiteralType<string | number | boolean>): JSONSchema {
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

function arrayToSchema<P extends ValidatableCodec>(codec: t.ArrayType<P>): JSONSchema {
  return {
    bsonType: 'array',
    items: codecToSchema(codec.type),
  };
}

function interfaceToSchema<P extends ValidatableProps>(codec: t.InterfaceType<P>): JSONSchema {
  const properties: Record<string, JSONSchema> = {};
  Object.entries(codec.props).forEach(([name, childCodec]) => {
    properties[name] = codecToSchema(childCodec);
  });
  return {
    bsonType: 'object',
    required: Object.keys(codec.props),
    properties,
  };
}

function partialToSchema<P extends ValidatableProps>(codec: t.PartialType<P>): JSONSchema {
  const properties: Record<string, JSONSchema> = {};
  Object.entries(codec.props).forEach(([name, c]) => {
    properties[name] = codecToSchema(c);
  });
  return {
    bsonType: 'object',
    properties,
  };
}

function intersectionToSchema(
  codec: t.IntersectionType<[ValidatableCodec, ValidatableCodec, ...ValidatableCodec[]]>,
): JSONSchema {
  return {
    allOf: codec.types.map((c) => codecToSchema(c)),
  };
}

function unionToSchema(codec: t.UnionType<ValidatableCodec[]>): JSONSchema {
  return {
    anyOf: codec.types.map((c) => codecToSchema(c)),
  };
}

function unreachable(_codec: never): never {
  throw new Error('unreachable');
}

function codecToSchema(codec: ValidatableCodec): JSONSchema {
  if (codec instanceof t.NullType) {
    return nullToSchema(codec);
  }
  if (codec instanceof t.BooleanType) {
    return booleanToSchema(codec);
  }
  if (isInt(codec)) {
    return intToSchema(codec);
  }
  if (codec instanceof t.NumberType) {
    return numberToSchema(codec);
  }
  if (codec instanceof t.StringType) {
    return stringToSchema(codec);
  }
  if (codec instanceof t.LiteralType) {
    return literalToSchema(codec);
  }
  if (codec instanceof t.ArrayType) {
    return arrayToSchema(codec);
  }
  if (codec instanceof t.InterfaceType) {
    return interfaceToSchema(codec);
  }
  if (codec instanceof t.PartialType) {
    return partialToSchema(codec);
  }
  if (codec instanceof t.IntersectionType) {
    return intersectionToSchema(codec);
  }
  if (codec instanceof t.UnionType) {
    return unionToSchema(codec);
  }
  if (isDate(codec)) {
    return dateToSchema(codec);
  }
  unreachable(codec);
}

/* eslint-enable @typescript-eslint/no-use-before-define,@typescript-eslint/no-unused-vars */

export default codecToSchema;

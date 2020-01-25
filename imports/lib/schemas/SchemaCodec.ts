import t from 'io-ts';
import AutoValueType from './AutoValueType';
import ScalarCodec from './ScalarCodec';

/**
 * SchemaCodec is the core type that our schema logic is built around. It is the
 * set of codecs that we can represent in a MongoDB object, that we know how to
 * encode in a MongoDB schema, and that we know how to manipulate at runtime in
 * a structured way.
 *
 * SchemaCodec also supports declaring fields that should be automatically
 * populated using {@link ./AutoValueType#AutoValueType}. For implementation
 * simplicity, these fields are only allowed as top-level scalar values. (This
 * is also simpler to reason about: what would it mean to have an array of
 * objects where one value on those objects was an auto value? When would it get
 * populated?)
 *
 * @remarks
 *
 * At the top-level, SchemaCodec must represent a type encodable to BSON, which
 * means that it must represent a key-value object of some sort. We allow
 * recombinations of key-value types, but SchemaCodec itself can not be, e.g.,
 * an array or a raw scalar value.
 */
export type SchemaCodec =
  SchemaInterface<any> |
  SchemaPartial<any> |
  SchemaIntersection<any>;
export default SchemaCodec;

type SchemaInterface<P extends TopLevelProps> = t.TypeC<P>;
type SchemaPartial<P extends TopLevelProps> = t.PartialC<P>;
type SchemaIntersection<CS extends [SchemaCodec, SchemaCodec, ...SchemaCodec[]]> =
  t.IntersectionC<CS>;

export type TopLevelProps = {
  [key: string]: NestedCodec | AutoValueType<any, any>;
}

export type NestedCodec =
  ScalarCodec |
  NestedArray<any> |
  NestedTuple<any> |
  NestedInterface<any> |
  NestedPartial<any> |
  NestedIntersection<any> |
  NestedUnion<any>;

type NestedArray<C extends NestedCodec> = t.ArrayC<C>;
type NestedTuple<CS extends [NestedCodec, ...NestedCodec[]]> = t.TupleC<CS>;
type NestedInterface<P extends NestedProps> = t.TypeC<P>;
type NestedPartial<P extends NestedProps> = t.PartialC<P>;
type NestedIntersection<CS extends [NestedCodec, NestedCodec, ...NestedCodec[]]> =
  t.IntersectionC<CS>;
type NestedUnion<CS extends [NestedCodec, NestedCodec, ...NestedCodec[]]> =
  t.UnionC<CS>;

export type NestedProps = {
  [key: string]: NestedCodec;
}

/* eslint-disable no-use-before-define */
import t from 'io-ts';
import AutoValueType from './AutoValueType';
import SchemaCodec, { TopLevelProps } from './SchemaCodec';

type RecombinedCodecs = [SchemaCodec, SchemaCodec, ...SchemaCodec[]];

/**
 * Given a set of properties, return a type that is the union of keys whose
 * value is an `AutoValueType`, good for passing into `Pick` or `Omit`.
 */
type AutoValueProps<P extends TopLevelProps, Overridable extends true | false> = {
  [K in keyof P]-?: P[K] extends AutoValueType<any, Overridable> ? K : never;
}[keyof P];
type PickAutoValueProps<P extends TopLevelProps, Overridable extends true | false> =
  Pick<P, AutoValueProps<P, Overridable>>;
type OmitAutoValueProps<P extends TopLevelProps, Overridable extends true | false> =
  Omit<P, AutoValueProps<P, Overridable>>;

type SchemaTupleWithoutAutoValues<Codecs extends SchemaCodec[]> = {
  [K in keyof Codecs]: CodecWithoutAutoValues<Extract<Codecs[K], Codecs[number]>>;
};

type PartialWithoutAutoValues<Codec extends t.PartialC<any>> =
  t.PartialC<OmitAutoValueProps<Codec['props'], false>>;

/**
 * @remarks
 *
 * If an interface codec (i.e. t.type) contains autovalues, and any of those
 * autovalues are overridable, then those autovalues have to change from
 * required to optional. The only way to represent that with io-ts is with an
 * intersection of an interface and a partial.
 */
type InterfaceWithoutAutoValues<Codec extends t.TypeC<any>> =
  t.IntersectionC<[
    t.TypeC<OmitAutoValueProps<Codec['props'], any>>,
    t.PartialC<PickAutoValueProps<Codec['props'], true>>,
  ]>;

type IntersectionWithoutAutoValues<
  Codec extends t.IntersectionC<any>,
  CS extends RecombinedCodecs =
    Codec extends t.IntersectionC<infer InferredCS> ? InferredCS : never,
> =
  t.IntersectionC<SchemaTupleWithoutAutoValues<CS>>;

type CodecWithoutAutoValues<Codec extends SchemaCodec> =
  Codec extends t.TypeC<any> ? InterfaceWithoutAutoValues<Codec> :
  Codec extends t.PartialC<any> ? PartialWithoutAutoValues<Codec> :
  Codec extends t.IntersectionC<any> ? IntersectionWithoutAutoValues<Codec> :
  never;

type WithoutAutoValues<Codec extends SchemaCodec> = t.TypeOf<CodecWithoutAutoValues<Codec>>;
export default WithoutAutoValues;

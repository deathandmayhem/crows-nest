/* eslint-disable no-use-before-define */
import PrefixedString from './PrefixedString';
import Projection, { ExclusiveProjection, InclusiveProjection } from './Projection';
import StripStringPrefix from './StripStringPrefix';

type Cast<A, B> = A extends B ? A : never;

type ContainsNested<RootProjection, Prefix extends string> = {
    [K in keyof RootProjection]: K extends PrefixedString<any, Prefix> ? true : never;
}[keyof RootProjection];
type NestedProjectionWithoutPrefix<NestedProjection, RootProjection, Prefix extends string> = Cast<{
    [K in keyof RootProjection & string as StripStringPrefix<K, Prefix>]: RootProjection[K];
}, NestedProjection>;

type InclusiveNestedProjected<
    Schema,
    RootProjection extends Projection<Schema>,
    FieldName extends keyof Schema & string,
    ValueType = Schema[FieldName]
> =
    InclusiveProjected<
        ValueType,
        NestedProjectionWithoutPrefix<InclusiveProjection<ValueType>, RootProjection, FieldName>
    >;
type InclusiveProjectedField<
    Schema,
    FieldName extends keyof Schema & string,
    P extends InclusiveProjection<Schema>,
    ValueType = Schema[FieldName],
> =
    true extends ContainsNested<P, FieldName> ?
        (ValueType extends Array<infer Element> ?
            InclusiveNestedProjected<Schema, P, FieldName, Element>[] :
            InclusiveNestedProjected<Schema, P, FieldName, ValueType>) :
        ValueType;
/**
 * Given a schema `Schema` and an inclusive projection (i.e. only "1"s other
 * than `_id`) `P`, `InclusiveProjected<Schema, P>` is a schema containing only
 * the fields in `Schema` that are selected by the projection.
 *
 * @remarks
 *
 * We use TypeScript's "key remapping" feature for mapped types as a way of
 * filtering the keys that we want to include. If a given key is mapped "as
 * never", then it will be excluded from the resulting type.
 */
type InclusiveProjected<Schema, P extends InclusiveProjection<Schema>> = {
    [K in keyof Schema & string as
        K extends '_id' ? (P[K] extends 0 ? never : K) :
        K extends keyof P ? K :
        true extends ContainsNested<P, K> ? K : never
    ]:
        InclusiveProjectedField<Schema, K, P>;
};
type ExclusiveNestedProjected<
    Schema,
    RootProjection extends Projection<Schema>,
    FieldName extends keyof Schema & string,
    ValueType = Schema[FieldName]
> =
    ExclusiveProjected<
        ValueType,
        NestedProjectionWithoutPrefix<ExclusiveProjection<ValueType>, RootProjection, FieldName>
    >;
type ExclusiveProjectedField<
    Schema,
    FieldName extends keyof Schema & string,
    P extends ExclusiveProjection<Schema>,
    ValueType = Schema[FieldName],
> =
    true extends ContainsNested<P, FieldName> ?
        (ValueType extends Array<infer Element> ?
            ExclusiveNestedProjected<Schema, P, FieldName, Element>[] :
            ExclusiveNestedProjected<Schema, P, FieldName, ValueType>) :
        ValueType;
type ExclusiveProjected<Schema, P extends ExclusiveProjection<Schema>> = {
    [K in keyof Schema & string as K extends keyof P ? never : K]:
        ExclusiveProjectedField<Schema, K, P>;
};
type Projected<T, P extends Projection<T> | undefined> =
    P extends undefined ?
    T :
    P extends Record<string, never> ? /* empty projection is equivalent to no projection */
    T :
    P extends InclusiveProjection<T> ?
    InclusiveProjected<T, P> :
    P extends ExclusiveProjection<T> ?
    ExclusiveProjected<T, P> :
    never;
export default Projected;

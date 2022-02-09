import * as t from 'io-ts';
import PrefixedString from './PrefixedString';

/* eslint-disable no-use-before-define */
type Flatten<T> =
    T extends t.Brand<infer B> ?
    Flatten<B> :
    T extends any[] ?
    T[number] :
    T;
type DotSeparatedField<ValueType, FieldName extends string, Prefix extends string | undefined> = (
    PrefixedString<FieldName, Prefix> |
        (Flatten<ValueType> extends object ?
            DotSeparatedFields<Flatten<ValueType>, PrefixedString<FieldName, Prefix>> :
            never)
);
/**
 * Generate a type that is the union of all valid fields (including
 * dot-separated names of nested fields) for a given schema.
 *
 * @remarks
 *
 * This uses a mapped type effectively as a for loop to ensure that the value
 * for FieldName that we pass to {@link DotSeparatedField} is a concrete string,
 * rather than a union type.
 */
type DotSeparatedFields<Schema, Prefix extends string | undefined = undefined> = {
    [FieldName in keyof Schema & string]: DotSeparatedField<Schema[FieldName], FieldName, Prefix>;
}[keyof Schema & string];

// TODO: allow $, $elemMatch, $meta, and $slice operators, and figure out when
// they're usable for inclusive/exclusive -
// https://docs.mongodb.com/v4.2/reference/operator/projection/
export type InclusiveProjection<Schema> = {
    [FieldName in DotSeparatedFields<Schema>]?: FieldName extends '_id' ? 0 | 1 : 1;
};
export type ExclusiveProjection<Schema> = Partial<Record<DotSeparatedFields<Schema>, 0>>;

/**
 * Fields can either be selected inclusively or exclusively, i.e. values in a
 * `MongoFieldsSelector` must be either all 0 or all 1. When selected
 * inclusively, only the fields selected are returned. When selected
 * exclusively, all fields except those excluded are returned.
 *
 * However, `"_id"` is always included by default, even with an inclusive
 * selection. That is, it is allowed to be 0, even in a selector which is
 * otherwise all 1's.
 */
type Projection<Schema> = InclusiveProjection<Schema> | ExclusiveProjection<Schema>;
export default Projection;

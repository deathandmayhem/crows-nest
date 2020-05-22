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
export type MongoFieldsSelector<T> = InclusiveFieldsSelector<T> | ExclusiveFieldsSelector<T>;
type InclusiveFieldsSelector<T> = {
  [k in keyof T]?: k extends '_id' ? 0 | 1 : 1;
};
type ExclusiveFieldsSelector<T> = {
  [k in keyof T]?: 0;
};

/**
 * Given a type of a MongoDB schema `T` and a MongoDB-style field selection `U`,
 * `InclusiveProjectedFields<T, U>` is the union of keys that should be included
 * in the projection.
 *
 * @remarks
 *
 * The logic here is:
 * - Include the field if U[k] is 1
 * - Exclude the field if k is "_id" and U[k] is 0
 * - Include the field if k is "_id" and U[k] is 1 or unspecified
 * - Exclude the field otherwise
 *
 * Both this and {@link ExclusiveProjectedFields} work by generating an object
 * type whose values are either the literal string name of their key (for fields
 * that should be included) or `never` (for fields that should be excluded), and
 * then indexing into that by the set of keys. This returns a union of the
 * values of that object, and anything unioned with `never` is equivalent to
 * dropping `never`.
 *
 * For instance, the type:
 * ```ts
 * InclusiveFieldsSelector<{ _id: string, title: string, createdBy: string }, { title: 1 }>
 * ```
 *
 * computes the object:
 * ```ts
 * { _id: '_id', title: 'title', createdBy: never }
 * ```
 *
 * When indexed by `keyof T`, this returns `'_id' | 'title' | never`, or just
 * `'_id' | 'title'`.
 */
type InclusiveProjectedFields<T, U extends InclusiveFieldsSelector<T>> = {
  [k in keyof T]-?:
  U[k] extends 1 ? k :
  k extends '_id' ? (U[k] extends 0 ? never : k) : never;
}[keyof T];
type ExclusiveProjectedFields<T, U extends ExclusiveFieldsSelector<T>> = {
  [k in keyof T]-?: U[k] extends 0 ? never : k;
}[keyof T];

/**
 * Given a type of a MongoDB schema `T` and a MongoDB-style field selection
 * (i.e. a projection specification) `U`, `MongoProjection<T, U>` is a schema
 * containing only the fields selected by that projection.
 */
type MongoProjection<T, U extends MongoFieldsSelector<T> | undefined> =
  Record<string, never> extends U ? T :
  undefined extends U ? T :
  U extends ExclusiveFieldsSelector<T> ?
  Pick<T, ExclusiveProjectedFields<T, U>> :
  U extends InclusiveFieldsSelector<T> ?
  Pick<T, InclusiveProjectedFields<T, U>> :
  never;
export default MongoProjection;

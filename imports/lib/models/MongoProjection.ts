// Fields can either be inclusive or exclusive. Inclusive fields can only
// exclude _id (which is otherwise included by default)
type InclusiveFieldsSelector<T> = {
  [k in keyof T]?: k extends '_id' ? 0 | 1 : 1;
};
type ExclusiveFieldsSelector<T> = {
  [k in keyof T]?: 0;
};
export type MongoFieldsSelector<T> = InclusiveFieldsSelector<T> | ExclusiveFieldsSelector<T>;

type InclusiveProjectedFields<T, U extends InclusiveFieldsSelector<T>> = {
  [k in keyof T]-?:
  U[k] extends 1 ? k :
  k extends '_id' ? (U[k] extends 0 ? never : k) : never;
}[keyof T];
type ExclusiveProjectedFields<T, U extends ExclusiveFieldsSelector<T>> = {
  [k in keyof T]-?: U[k] extends 0 ? never : k;
}[keyof T];

type MongoProjection<T, U extends MongoFieldsSelector<T>> = {} extends U ? T :
  U extends ExclusiveFieldsSelector<T> ?
  Pick<T, ExclusiveProjectedFields<T, U>> :
  U extends InclusiveFieldsSelector<T> ?
  Pick<T, InclusiveProjectedFields<T, U>> :
  never;
export default MongoProjection;

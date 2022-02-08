type FieldsOfType<Props, T> = {
  [K in keyof Props]-?: Props[K] extends T ? K : never;
}[keyof Props];

type CurrentDateModifier<Props> =
  Partial<Record<FieldsOfType<Props, Date>, true | { $type: 'date' }>>;

type NumericModifier<Props> =
  Partial<Record<FieldsOfType<Props, number>, number>>;

type SetModifier<Props> =
  Partial<Props>;

/**
 * @remarks
 *
 * `Pick<Props, K> extends Required<Pick<Props, K>>` allows us to test if the
 * field is required in Props. Only allow unsetting the field if it is _not_
 * required.
 */
 type OptionalFields<Props> = {
  [K in keyof Props]-?: Pick<Props, K> extends Required<Pick<Props, K>> ? never : K;
}[keyof Props];
type UnsetModifier<Props> = Partial<Record<OptionalFields<Props>, any>>;

type ArrayElementModifier<Props> = {
  [K in keyof Props]?:
    Props[K] extends any[] ?
      Props[K][0] | { $each: Props[K] } :
      never;
};

type PullModifier<Props> = {
  [K in keyof Props]?: Props[K] extends any[] ? Props[K][0] : never;
};

type PullAllModifier<Props> = {
  [K in keyof Props]?: Props[K] extends any[] ? Props[K] : never;
};

type PopModifier<Props> = {
  [K in keyof Props]?: Props[K] extends any[] ? 1 | -1 : never;
};

/**
 * This captures a limited, type-safe subset of Mongo update operators. We are
 * intentionally limiting to make it easy to reason about interactions between
 * updates and the underlying schema.
 *
 * Notably, MongoModifier only allows modifications on top-level fields.
 */
type MongoModifier<T> = {
  $currentDate?: CurrentDateModifier<T>;
  $inc?: NumericModifier<T>;
  $min?: NumericModifier<T>;
  $max?: NumericModifier<T>;
  $mul?: NumericModifier<T>;
  $set?: SetModifier<T>;
  $unset?: UnsetModifier<T>;
  $addToSet?: ArrayElementModifier<T>;
  $push?: ArrayElementModifier<T>;
  $pull?: PullModifier<T>;
  $pullAll?: PullAllModifier<T>;
  $pop?: PopModifier<T>;
};
export default MongoModifier;

/**
 * Asserts that a value is not null or undefined, and returns it. Inspired by
 * {@link https://sorbet.org/docs/nilable-types#tmust-asserting-that-something-is-not-nil | T.must}
 * from Sorbet.
 */
export default function must<T>(arg: NonNullable<T> | null | undefined): NonNullable<T> {
  if (!arg) {
    throw new Error('passed null or undefined into must');
  }
  return arg;
}

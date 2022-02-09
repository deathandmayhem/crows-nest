import PrefixedString from './PrefixedString';

type StripStringPrefix<S, Prefix extends string> =
    S extends PrefixedString<infer Suffix, Prefix> ? Suffix : never;
export default StripStringPrefix;

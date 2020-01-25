import t from 'io-ts';
import { DateC } from 'io-ts-types/lib/date';

type ScalarCodec =
  t.NullC |
  t.BooleanC |
  t.NumberC |
  t.StringC |
  DateC |
  t.LiteralC<string | number | boolean> |
  // We support branded strings for _id and foreign key fields, and t.Int for
  // integers. Beyond that we currently don't support any other refinement
  // types, but we might add more in the future to capture things like regex or
  // length restrictions
  t.BrandC<t.StringC, any> |
  typeof t.Int;
export default ScalarCodec;

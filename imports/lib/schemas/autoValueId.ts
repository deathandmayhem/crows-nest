import { Random } from 'meteor/random';
import t from 'io-ts';
import AutoValueType from './AutoValueType';

export default function autoValueId<
  C extends t.BrandC<t.StringC, any>
>(
  prefix: string,
  underlying: C,
): AutoValueType<C, false> {
  return new AutoValueType(
    underlying.name,
    underlying,
    false,
    () => `${prefix}_${Random.id()}`,
  );
}

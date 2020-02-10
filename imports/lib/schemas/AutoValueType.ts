import t from 'io-ts';
import ScalarCodec from './ScalarCodec';

/**
 * A codec which wraps another codec, but auto-populates values for the
 * underlying codec, either on insert or on update. AutoValueType is integrated
 * with {@link ../models/ValidatedCollection#ValidatedCollection}, and is used
 * both to populate fields with autovalues configured and to prevent callers
 * from including those fields when inserting or updating records (unless those
 * fields are declared as overridable=true).
 *
 * Overridable is preserved as a type parameter (in addition to a property)
 * because we want to be able to inspect it at a type system level, for things
 * like allowing the field as optional if overridable=true.
 */
export default class AutoValueType<
  UnderlyingCodec extends t.Mixed & ScalarCodec,
  Overridable extends true | false
> extends t.Type<
  t.TypeOf<UnderlyingCodec>,
  t.OutputOf<UnderlyingCodec>,
  t.InputOf<UnderlyingCodec>
> {
  readonly _tag: 'AutoValueType';

  underlying: UnderlyingCodec;

  overridable: Overridable;

  onInsert?: () => t.OutputOf<UnderlyingCodec>;

  onUpdate?: () => t.OutputOf<UnderlyingCodec>;

  constructor(
    name: string,
    underlying: UnderlyingCodec,
    overridable: Overridable,
    onInsert?: () => t.OutputOf<UnderlyingCodec>,
    onUpdate?: () => t.OutputOf<UnderlyingCodec>,
  ) {
    super(name, underlying.is, underlying.validate, underlying.encode);
    // eslint-disable-next-line no-underscore-dangle
    this._tag = 'AutoValueType';
    this.underlying = underlying;
    this.overridable = overridable;
    this.onInsert = onInsert;
    this.onUpdate = onUpdate;
  }
}

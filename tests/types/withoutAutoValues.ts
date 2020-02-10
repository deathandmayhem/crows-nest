import t from 'io-ts';
import { expectType } from 'tsd';
import AutoValueType from '../../imports/lib/schemas/AutoValueType';
import WithoutAutoValues from '../../imports/lib/schemas/WithoutAutoValues';

const Codec = t.intersection([
  t.type({
    _id: t.string,
    deleted: new AutoValueType('Deleted', t.boolean, true, () => true),
  }),
  t.partial({
    updatedBy: new AutoValueType('UpdatedBy', t.string, false, undefined, () => 'userid'),
    optional: t.string,
  }),
]);
type CodecWithoutAutoValues = WithoutAutoValues<typeof Codec>;
declare const test: CodecWithoutAutoValues;
expectType<{ _id: string } & { deleted?: boolean } & { optional?: string }>(test);

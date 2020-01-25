import t from 'io-ts';
import { expectType, expectNotAssignable } from 'tsd';
import MongoModifier from '../../imports/lib/models/MongoModifier';
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

type CodecUpdateModifier = MongoModifier<WithoutAutoValues<typeof Codec>>;
const update: CodecUpdateModifier = {
  $set: { optional: 'hi' },
  $unset: { deleted: 1 },
};
expectType<CodecUpdateModifier>(update);
// Can't unset a non-optional type
expectNotAssignable<CodecUpdateModifier>({ $unset: { _id: 1 } });
// Can't set a non-overridable auto value
expectNotAssignable<CodecUpdateModifier>({ $set: { updatedBy: 'userid' } });

import { Meteor } from 'meteor/meteor';
import t from 'io-ts';
import { date } from 'io-ts-types/lib/date';
import must from '../must';
import AutoValueType from '../schemas/AutoValueType';

const BaseCodecOptional = t.partial({
  updatedAt: new AutoValueType('UpdatedAt', date, false, undefined, () => new Date()),
  updatedBy: new AutoValueType('UpdatedBy', t.string, false, undefined, () => must(Meteor.userId())),
});

export const BaseCodec = t.intersection([
  t.type({
    deleted: new AutoValueType('Deleted', t.boolean, true, () => false),
    createdAt: new AutoValueType('CreatedAt', date, false, () => new Date()),
    createdBy: new AutoValueType('CreatedBy', t.string, false, () => must(Meteor.userId())),
  }),
  BaseCodecOptional,
], 'Base');

export type BaseType = t.TypeOf<typeof BaseCodec>;

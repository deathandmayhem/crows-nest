import t from 'io-ts';
import { date } from 'io-ts-types/lib/date';

const BaseCodecOptional = t.partial({
  updatedAt: date,
  updatedBy: t.string,
});

export const BaseCodec = t.intersection([
  t.type({
    deleted: t.boolean,
    createdAt: date,
    createdBy: t.string,
  }),
  BaseCodecOptional,
], 'Base');

export type BaseType = t.TypeOf<typeof BaseCodec>;

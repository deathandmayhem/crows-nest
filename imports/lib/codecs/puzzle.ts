import t from 'io-ts';
import { BaseCodec } from './base';

interface PuzzleIdBrand {
  readonly PuzzleId: unique symbol;
}

export const PuzzleIdCodec = t.brand(
  t.string,
  (id): id is t.Branded<string, PuzzleIdBrand> => !!id,
  'PuzzleId',
);

export type PuzzleId = t.TypeOf<typeof PuzzleIdCodec>;

export const PuzzleCodec = t.intersection([
  BaseCodec,
  t.type({
    _id: PuzzleIdCodec,
    name: t.string,
  }),
], 'Puzzle');

export type PuzzleType = t.TypeOf<typeof PuzzleCodec>;

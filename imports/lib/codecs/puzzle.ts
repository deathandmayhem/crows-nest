import t from 'io-ts';
import { BaseCodec } from './base';

export const PuzzleCodec = t.intersection([
  BaseCodec,
  t.type({
    _id: t.string,
    name: t.string,
  }),
], 'Puzzle');

export type PuzzleType = t.TypeOf<typeof PuzzleCodec>;

import t from 'io-ts';
import autoValueId from '../schemas/autoValueId';
import brandedId from '../schemas/brandedId';
import { BaseCodec } from './base';

export const PuzzleIdCodec = brandedId('PuzzleId');
export type PuzzleId = t.TypeOf<typeof PuzzleIdCodec>;

export const PuzzleCodec = t.intersection([
  BaseCodec,
  t.type({
    _id: autoValueId('puz', PuzzleIdCodec),
    name: t.string,
  }),
], 'Puzzle');

export type PuzzleType = t.TypeOf<typeof PuzzleCodec>;

import { Promise } from 'meteor/promise';
import { PuzzleCodec } from '../codecs/puzzle';
import ValidatedCollection from './ValidatedCollection';

const Puzzle = new ValidatedCollection('crow_puzzles', PuzzleCodec);
Promise.await(Puzzle.updateSchema());
export default Puzzle;

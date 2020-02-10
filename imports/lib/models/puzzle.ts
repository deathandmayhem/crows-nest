import { PuzzleCodec } from '../codecs/puzzle';
import ValidatedCollection from './ValidatedCollection';

const Puzzle = new ValidatedCollection('crow_puzzles', PuzzleCodec);
Puzzle.updateSchema();
export default Puzzle;

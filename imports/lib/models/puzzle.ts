import { PuzzleType, PuzzleCodec } from '../codecs/puzzle';
import ValidatedCollection from './ValidatedCollection';

const Puzzle = new ValidatedCollection<PuzzleType>('crow_puzzles', PuzzleCodec);
// Puzzle.updateSchema();
export default Puzzle;

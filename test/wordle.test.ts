import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { matchGuess } from '../src/wordle';

// Recitation Part 1: follow along with your TA, filling in the todos below.
// Problem set Task 1: keep adding properties until `npm run mutants:wordle`
// kills every mutant. Read the spec in src/wordle/matchGuess.ts.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The result always has exactly five colors.
// (invariant, algebraic, metamorphic, differential, or conditional)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const RESTRCITED = 'ABCDEFGHIJKLMNOPQRSTUVW'
const RESTRCITED_COMPLIMENT = 'XYZ'

// Step 1: a generator for five-letter uppercase words.
const wordFrom = (letters:string) =>
  fc.array(fc.constantFrom(...letters), { minLength:5, maxLength:5}).map(cs => cs.join(''));

const word = wordFrom(ALPHABET)

const wordTail = fc.array(fc.constantFrom(...ALPHABET), { minLength: 4, maxLength: 4 });
const randLetter = fc.constantFrom(...ALPHABET);

const restrictedWord = wordFrom(RESTRCITED)
const randNonRestrictedChar = fc.constantFrom(...RESTRCITED_COMPLIMENT)

const smallAlphabetWord = wordFrom(RESTRCITED_COMPLIMENT)

describe('matchGuess', () => {
  //Property: Invariant. Length of the return list should be 5.
  it('returns exactly five colors', () => {
    fc.assert(
      fc.property(word, word, (secret, guess) => {
        expect(matchGuess(secret, guess)).toHaveLength(5);
      }),
    );
  });
  //Property: Invariant. Only G, Y, and B should be in result list
  it('it only uses the colors G, Y, B', () => {
    fc.assert(
      fc.property(word, word, (secret, guess) => {
        for (const c of matchGuess(secret, guess)) expect(['G', 'Y', 'B']).toContain(c);
      }),
    );
  });
  //Property: Differnetial. Guess the secret gives all greens
  it('guessing the secret gives all greens', () => {
    fc.assert(
      fc.property(word, w => {
        expect(matchGuess(w, w)).toEqual(['G', 'G', 'G', 'G', 'G']);
      }),
    );
  });
  //Property: Invariant. The output never never credits a letter more times than the secret contains it.
  it('never credits a letter more times than the secret contains it', () => {
    fc.assert(
      fc.property(smallAlphabetWord, smallAlphabetWord, (secret, guess) => {
        const result = matchGuess(secret, guess);
        for (const letter of new Set(guess)) {
          const credited = [...guess].filter((c, i) => c === letter && result[i] !== 'B').length;
          const inSecret = [...secret].filter(c => c === letter).length
          expect(credited).toBeLessThanOrEqual(inSecret);
        }
      }),
    );
    });
  //Property: Conditional. If a guess and a result starts with the same letter, than the first character of the result must be G
  it('If start with same letter, than result must start with green', () => {
    fc.assert(
      fc.property(randLetter, wordTail, wordTail, (start, secretTail, guessTail) => {
        const secret = start + secretTail.join('');
        const guess = start + guessTail.join('');
        const result = matchGuess(secret, guess);
        expect(result[0]).toBe('G');
      }),
    );
  });
  //Property: Metamorphic. A letter being injected from a set outside of the secret word set should not increase the number of greens in results.
  it('If guess gets a letter injected outside input set, then num of greens should not increase', () => {
    fc.assert(
      fc.property(restrictedWord, restrictedWord, randNonRestrictedChar, (secret, guess, independentChar) => {
        const result = matchGuess(secret, guess);
        const originalGuess = guess.split('');
        originalGuess[0] = independentChar;
        const newGuess = originalGuess.join('');
        const newResult = matchGuess(secret, newGuess);

        const oldGreens = result.filter(c => c === 'G').length
        const newGreens = newResult.filter(c => c === 'G').length
        expect(oldGreens).toBeGreaterThanOrEqual(newGreens)
      }),
    );
  });
  //Property: Metamorphic. Injecting a letter outside of the secret word set into the secret word and having this as a guess should decrease the number of greens.
  it('Guessing a slight variantion of the secret word returns yellows.', () => {
    fc.assert(
      fc.property(restrictedWord, randNonRestrictedChar, (word, independentChar) => {
        const originalGuess = word.split('');
        originalGuess[0] = independentChar;
        const newGuess = originalGuess.join('');

        const originalSecret = word.split('');
        originalSecret[1] = independentChar;
        const newSecret = originalSecret.join('');
        expect(matchGuess(newSecret, newGuess)).toContain('Y');
      }),
    );
  });
  });
  

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

// A first attempt at a generator. It has a problem: run the tests and read
// the counterexample.
const interval: fc.Arbitrary<Interval> = fc.tuple(fc.integer(), fc.integer()).map(([a, b]) =>
  (a <= b ? [a, b] : [b, a]) as Interval,
);
const intervalList = fc.array(interval);

const disjointIntervalList: fc.Arbitrary<Interval[]> =
  fc.uniqueArray(fc.integer())
    .map(values => {
      values.sort((a, b) => a - b);
      const intervals: Interval[] = [];
      for (let i = 0; i + 1 < values.length; i += 2) {
        intervals.push([values[i], values[i + 1]]);
      }
      return intervals;
    });

describe('mergeIntervals', () => {
  // Pattern: invariant. Checks to see if every input interval is contained within an output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const uncovered = xs.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });
  // Pattern: invariant. The length of the result should never increase.
  it('Ensure output length is less than or equal to input', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        expect(out.length).toBeLessThanOrEqual(xs.length);
      }),
    );
  });
  //Pattern: Metamorphic. Once a list is merged, then merging it agains does nothing.
  it('merging merged list should not change', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const merged = mergeIntervals(xs);
        expect(merged).toEqual(mergeIntervals(merged));
      }),
    );
  });
  //Pattern: Differntial. If we add a non-overlapping interval, then this exact interval should be in the result.
  it('adding extra interval should be in result if greater than max', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const max = (xs.length === 0) ? 0 : Math.max(...xs.map(([_, end]) => end));
        const newInterval:Interval = [max + 1, max + 10];
        expect(mergeIntervals([...xs, newInterval])).toContainEqual(newInterval);
      }),
    );
  });
  //Pattern: Conditional. If an interval list is disjoint, then nothing happens.
  it('already disjoint input should be returned unchanged', () => {
    fc.assert(
      fc.property(disjointIntervalList, xs => {
        expect(mergeIntervals(xs)).toEqual(xs);
      }),
    );
  });
  //Pattern:Algebraic. Adding one to the max interval should imply that the result has a new max. 
  it('touching neighbors should be merged', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        if (xs.length === 0) return;
        const max = Math.max(...xs.map(([_, end]) => end));
        const touchingMax:Interval = [max, max + 1];
        const res = mergeIntervals([...xs, touchingMax])
        expect(res).not.toContainEqual(touchingMax);
        expect(Math.max(...res.map(([_, end]) => end))).toBe(max+1);
      })
    )
  })
  //Property: Differntial. Adding disjoint list should result in a larger result set.  
  it('explicityly adding new merge set', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const max = (xs.length === 0) ? 0 : Math.max(...xs.map(([_, end]) => end));
        const newLow:Interval = [max+1, max+2];
        const newHigh:Interval = [max+2, max+3]
        const mergedNew = mergeIntervals([...xs, newLow, newHigh])
        expect(mergeIntervals(xs).length).toBeLessThan(mergedNew.length)
        expect(mergedNew).not.toContainEqual(newLow);
        expect(mergedNew).not.toContainEqual(newHigh);
        expect(mergedNew).toContainEqual([max+1, max+3]);
      })
    )
  })
});

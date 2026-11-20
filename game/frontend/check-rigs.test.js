import assert from 'node:assert/strict';
import test from 'node:test';
import { stanceStep } from './check-rigs.mjs';

const at = (x, y, z) => ({ x, y, z });

test('planted sole cancels forward board travel; sliding sole records it', () => {
  const start = [at(0, 0, 0)];
  assert.equal(stanceStep(start, [at(0, 0, .25)], .25, .02), 0);
  assert.equal(stanceStep(start, start, .25, .02), .25);
  assert.equal(stanceStep(start, [at(.10, 0, .25)], .25, .02), .10);
  assert.equal(stanceStep(start, [at(0, .12, .25)], .25, .02), null);
});

test('a heel-to-toe handoff measures a single physical contact point', () => {
  const before = [at(0, 0, 0), at(0, .01, 1)];
  const after = [at(0, .025, .25), at(0, 0, 1.25)];
  assert.equal(stanceStep(before, after, .25, .02), 0);
  assert.equal(stanceStep(before, [at(0, .04, .25), at(0, .03, 1.25)], .25, .02), null);
});

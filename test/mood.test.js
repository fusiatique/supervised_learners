import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hrlConfig } from './helpers.js';
import { MOODS, moodOf, pallor } from '../js/hrl/mood.js';

const config = hrlConfig();
const mood = (d, restingLevel = 50) => moodOf(d, restingLevel, config).id;

test('the mood follows d around its target', () => {
  assert.deepEqual([100, 80].map((d) => mood(d)), ['euphoric', 'euphoric']);
  assert.deepEqual([79.9, 60].map((d) => mood(d)), ['happy', 'happy']);
  assert.deepEqual([59.9, 50, 40].map((d) => mood(d)), ['neutral', 'neutral', 'neutral']);
  assert.deepEqual([39.9, 20, 0].map((d) => mood(d)), ['sad', 'sad', 'sad']);
});

test('low d is withdrawal when drug use has lowered the resting level', () => {
  assert.equal(mood(25, 10), 'withdrawal');
  assert.equal(mood(39.9, 40), 'withdrawal');
  assert.equal(mood(39.9, 40.1), 'sad');
  // A lowered resting level alone is not withdrawal while d is held up.
  assert.deepEqual([45, 65, 90].map((d) => mood(d, 0)), ['neutral', 'happy', 'euphoric']);
});

test('every mood is reachable and described', () => {
  const reached = new Set();
  for (let d = 0; d <= 100; d++) for (const resting of [50, 0]) reached.add(mood(d, resting));
  assert.deepEqual([...reached].sort(), MOODS.map((m) => m.id).sort());
  for (const m of MOODS) assert.ok(m.name && m.description);
});

test('skin pallor rises with harm and stays between 0 and 1', () => {
  assert.equal(pallor(0), 0);
  assert.equal(pallor(-5), 0);
  let previous = 0;
  for (let h = 1; h <= 100; h++) {
    assert.ok(pallor(h) > previous && pallor(h) < 1);
    previous = pallor(h);
  }
  assert.ok(pallor(5) > 0.2);
  assert.ok(pallor(100) > 0.99);
});

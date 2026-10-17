import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hrlConfig, getSourceType, SOURCE_TYPES } from '../js/hrl/config.js';
import { transition, dAfterAction, dAfterRecovery, nextHarm, nextDeficit, binIndex, numBins } from '../js/hrl/dynamics.js';

const config = hrlConfig();
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} is not ${expected}`);

test('d and h stay inside their ranges', () => {
  const drugB = getSourceType('drugB');
  let d = config.dInitial;
  let h = config.hInitial;
  for (let i = 0; i < 500; i++) {
    const next = transition(d, h, drugB, config);
    for (const value of [next.dAction, next.dNext]) assert.ok(value >= config.dMin && value <= config.dMax);
    assert.ok(next.hNext >= config.hMin && next.hNext <= config.hMax);
    d = next.dNext;
    h = next.hNext;
  }
  assert.equal(h, config.hMax);

  const drained = hrlConfig({ dBackgroundDrift: 50 });
  assert.equal(transition(3, 0, null, drained).dNext, drained.dMin);
});

test('a source raises d by its gain before passive recovery', () => {
  for (const source of SOURCE_TYPES) {
    const { dAction, dNext } = transition(50, 0, source, config);
    close(dAction, 50 + source.dopamineGain);
    close(dNext, dAction + config.kD * (config.dBase - dAction));
  }
  assert.equal(dAfterAction(95, 30, config), 100);
});

test('recovery moves d towards dBase from either side', () => {
  const below = dAfterRecovery(20, config);
  const above = dAfterRecovery(80, config);
  close(below, 21.2);
  close(above, 78.8);
  assert.equal(dAfterRecovery(config.dBase, config), config.dBase);
});

test('without interaction or drift, d never falls below dBase from dBase', () => {
  let d = config.dBase;
  for (let i = 0; i < 1000; i++) {
    d = transition(d, 0, null, config).dNext;
    assert.ok(d >= config.dBase);
  }
});

test('a positive background drift takes d below the target', () => {
  const drifting = hrlConfig({ dBackgroundDrift: 0.2 });
  let d = drifting.dInitial;
  for (let i = 0; i < 1000; i++) d = transition(d, 0, null, drifting).dNext;
  assert.ok(d < drifting.dTarget);
  // Settles where recovery balances the drift.
  close(d, drifting.dBase - drifting.dBackgroundDrift / drifting.kD);
});

test('harm rises with drug use, not with ordinary sources', () => {
  close(nextHarm(0, getSourceType('drugB').harmGain, config), 3);
  close(transition(50, 10, getSourceType('drugB'), config).hNext, 0.98 * 10 + 3);
  for (const id of ['food']) assert.equal(transition(50, 0, getSourceType(id), config).hNext, 0);
});

test('harm decays gradually when nothing is added', () => {
  let h = 40;
  for (let i = 0; i < 10; i++) {
    const next = transition(50, h, null, config).hNext;
    close(next, h * config.rhoH);
    assert.ok(next < h && next > 0);
    h = next;
  }
});

test('bins cover the range, with the maximum in the last bin', () => {
  const bin = (value) => binIndex(value, 0, 100, 10);
  assert.equal(numBins(0, 100, 10), 11);
  assert.deepEqual([0, 10, 50, 99.9, 100].map(bin), [0, 1, 5, 9, 10]);
  assert.deepEqual([9.999, 49.999, -5, 250].map(bin), [0, 4, 0, 10]);
  for (let value = 0; value <= 100; value += 0.1) {
    assert.ok(Number.isInteger(bin(value)) && bin(value) >= 0 && bin(value) < 11);
  }
});

test('without the drug-induced deficit nothing changes', () => {
  assert.equal(config.drugDeficit, false);
  for (const source of [null, ...SOURCE_TYPES]) {
    const { aNext, dNext, dAction } = transition(50, 0, source, config);
    assert.equal(aNext, 0);
    close(dNext, dAction + config.kD * (config.dBase - dAction));
  }
});

test('with it, drug use lowers the level d recovers towards', () => {
  const deficit = hrlConfig({ drugDeficit: true });
  for (const id of ['food']) assert.equal(transition(50, 0, getSourceType(id), deficit).aNext, 0);
  const { aNext, dAction, dNext } = transition(50, 0, getSourceType('drugB'), deficit, 10);
  close(aNext, deficit.rhoA * 10 + 4);
  close(dNext, dAction + deficit.kD * (deficit.dBase - aNext - dAction));

  // Left alone, d settles on the lowered resting level and the deficit heals,
  // much more slowly than d itself moves.
  let d = 50;
  let a = 40;
  for (let i = 0; i < 100; i++) ({ dNext: d, aNext: a } = transition(d, 0, null, deficit, a));
  assert.ok(Math.abs(d - (deficit.dBase - a)) < 1);
  assert.ok(a < 40 && a > 37);
  close(dAfterRecovery(10, deficit, 40), 10);

  // The deficit is bounded however much is taken.
  a = 0;
  for (let i = 0; i < 100; i++) a = nextDeficit(a, 4, deficit);
  assert.equal(a, deficit.aMax);
  assert.equal(nextDeficit(0, 0, deficit), 0);
});

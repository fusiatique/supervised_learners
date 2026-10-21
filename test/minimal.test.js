import test from 'node:test';
import assert from 'node:assert/strict';
import { config, drive, step, tippingPoint, naturalCeiling, NOTHING, NATURAL, DRUG } from '../js/model.js';
import { Agent, stateIndex, stateShape } from '../js/agent.js';
import { Life, DOSE_SPACING } from '../js/life.js';
import { runLife, isDependent } from '../js/experiments.js';

const p = config();
const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} != ${expected}`);

test('H relaxes towards B and gets the action gain', () => {
  close(step({ H: 50, B: 40 }, NOTHING, p).H, 49, 'nothing');
  close(step({ H: 50, B: 40 }, NATURAL, p).H, 51, 'natural');
  close(step({ H: 50, B: 40 }, DRUG, p).H, 74, 'drug');
});

test('a drug use lowers B, which otherwise heals towards B0', () => {
  close(step({ H: 50, B: 40 }, DRUG, p).B, 39, 'drug at a healthy baseline');
  close(step({ H: 50, B: 20 }, NOTHING, p).B, 20.02, 'healing');
  close(step({ H: 50, B: 0.5 }, DRUG, p).B, 0, 'clipped at bMin');
});

test('reward is drive reduction plus R0 - c for a chosen drug', () => {
  close(drive(50, p), 0, 'no drive at the setpoint');
  close(drive(20, p), 18, 'drive at 20');
  const r = step({ H: 50, B: 40 }, DRUG, p);
  close(r.reward, drive(50, p) - drive(74, p) + p.R0 - p.c, 'drug reward');
  // A forced dose moves the states like a drug use but earns no drug term.
  const forced = step({ H: 50, B: 40 }, NOTHING, p, { forced: true });
  close(forced.H, r.H, 'forced H');
  close(forced.B, r.B, 'forced B');
  close(forced.drugTerm, 0, 'forced drug term');
});

test('overshooting is aversive for a healthy agent, the drug is a relief in withdrawal', () => {
  assert.ok(step({ H: 50, B: 40 }, DRUG, p).reward < -5);
  const low = { H: 20, B: 0 };
  assert.ok(step(low, DRUG, p).reward > step(low, NATURAL, p).reward + 10);
});

test('the tipping point is where natural rewards stop reaching the setpoint', () => {
  close(tippingPoint(p), 30, 'tipping point');
  close(naturalCeiling(tippingPoint(p), p), p.S, 'ceiling at the tipping point');
  // Natural rewards every step settle H at the ceiling.
  let state = { H: 50, B: 20 };
  for (let i = 0; i < 500; i++) state = { ...step(state, NATURAL, { ...p, rho: 0 }), B: 20 };
  close(state.H, naturalCeiling(20, p), 'settled H');
});

test('states are binned by H and B, the top of each range in the last bin', () => {
  const { hBins, bBins } = stateShape(p);
  assert.equal(hBins, 10);
  assert.equal(bBins, 8);
  assert.equal(stateIndex({ H: 0, B: 0 }, p), 0);
  assert.equal(stateIndex({ H: 100, B: 40 }, p), hBins * bBins - 1);
});

test('the drug is not offered while unavailable', () => {
  const agent = new Agent(config({ drugAvailable: false, epsilonStart: 1, epsilonMin: 1 }));
  for (let i = 0; i < 200; i++) assert.notEqual(agent.act(0), DRUG);
});

test('forced doses are spaced and lower B', () => {
  const life = new Life({ drugAvailable: false }, 1);
  life.dose(3);
  const forcedAt = [];
  for (let t = 0; t < 20; t++) if (life.tick().forced) forcedAt.push(t);
  assert.deepEqual(forcedAt, [0, DOSE_SPACING, 2 * DOSE_SPACING]);
  assert.ok(life.state.B < p.B0 - 2.9);
});

test('runs are reproducible for a seed', () => {
  const a = runLife({ steps: 3000, seed: 7 });
  const b = runLife({ steps: 3000, seed: 7 });
  assert.deepEqual(a.windows, b.windows);
});

test('20 doses make an agent dependent, unless the drug cannot lower B', () => {
  const events = [{ at: 0, set: { drugAvailable: false } }, { at: 20000, set: { drugAvailable: true } }, { at: 30000, doses: 20 }];
  const dosed = runLife({ events, steps: 40000, seed: 3 });
  assert.ok(isDependent(dosed.windows), 'dosed agent dependent');
  assert.ok(dosed.state.B < tippingPoint(p));
  const control = runLife({ overrides: { delta: 0 }, events, steps: 40000, seed: 3 });
  assert.ok(!isDependent(control.windows), 'control not dependent');
});

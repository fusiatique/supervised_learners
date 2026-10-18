import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hrlConfig, modelConfigFor, getSourceType, SOURCE_TYPES } from './helpers.js';
import { transition } from '../js/hrl/dynamics.js';
import { phi, harmWeight, computeReward } from '../js/hrl/reward.js';

const config = hrlConfig();
const fixed = modelConfigFor('fixed');
const close = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} is not ${expected}`);

// Reward of using `source` (or just moving, for null) from d and h.
function rewardOf(d, h, source, cfg = config) {
  const { dAction, dNext, hNext } = transition(d, h, source, cfg);
  return computeReward({ d, dAction, dNext, hNext, source }, cfg);
}

test('each source pays its configured immediate reward', () => {
  for (const source of SOURCE_TYPES) assert.equal(rewardOf(50, 0, source).sourceReward, source.reward);
});

test('a move earns no source reward and no acute harm', () => {
  for (const h of [0, 40]) {
    const r = rewardOf(50, h, null);
    assert.equal(r.sourceReward, 0);
    assert.equal(r.acuteHarmCost, 0);
    assert.equal(r.stateBenefit, 0);
    close(r.reward, -r.accumulatedHarmCost - r.lowStateCost - config.stepCost);
  }
  assert.equal(rewardOf(50, 0, null).reward, -config.stepCost);
});

test('phi is zero at the target and continuous around it', () => {
  assert.equal(phi(config.dTarget, config), 0);
  for (const eps of [1e-3, 1e-6, 1e-9]) {
    close(phi(config.dTarget - eps, config), 0, 1e-2 * eps + 1e-12);
    close(phi(config.dTarget + eps, config), 0, eps);
  }
  close(phi(0, config), -config.phiA);
  close(phi(25, config), -2.5);
});

test('moving towards the target from below is a benefit', () => {
  for (const d of [0, 10, 20, 30, 40, 49]) assert.ok(phi(d + 1, config) - phi(d, config) > 0);
  assert.ok(rewardOf(20, 0, getSourceType('food')).stateBenefit > 0);
  // The same gain is worth more the further below the target it starts.
  assert.ok(rewardOf(10, 0, getSourceType('food')).stateBenefit > rewardOf(40, 0, getSourceType('food')).stateBenefit);
});

test('the benefit of raising d saturates above the target', () => {
  let previous = Infinity;
  for (let d = 50; d < 100; d += 5) {
    const gain = phi(d + 5, config) - phi(d, config);
    assert.ok(gain > 0 && gain < previous);
    previous = gain;
  }
  assert.ok(phi(100, config) < config.phiB);
});

test('harm weighs less at low d than at high d', () => {
  for (let d = 0; d < 100; d += 5) assert.ok(harmWeight(d, config) < harmWeight(d + 5, config));
  close(harmWeight(config.dTarget, config), (config.lambdaMin + config.lambdaMax) / 2);
  assert.ok(harmWeight(0, config) < 0.2);
  assert.ok(harmWeight(100, config) > 0.95);
});

test('the harm weight never reaches zero', () => {
  assert.ok(config.lambdaMin > 0);
  for (const d of [0, 1, 20]) assert.ok(harmWeight(d, config) > config.lambdaMin);
  // Also with an extremely steep curve, where the exponential would overflow.
  const steep = hrlConfig({ lambdaS: 1e-9 });
  assert.equal(harmWeight(0, steep), steep.lambdaMin);
  assert.equal(harmWeight(100, steep), steep.lambdaMax);
});

test('the fixed model uses the midpoint weight everywhere', () => {
  for (const d of [0, 20, 50, 80, 100]) close(harmWeight(d, fixed), 0.575);
  // It differs from the adaptive model in nothing else.
  const { harmWeightMode: a, ...restAdaptive } = modelConfigFor('adaptive');
  const { harmWeightMode: b, ...restFixed } = fixed;
  assert.deepEqual(restFixed, restAdaptive);
  assert.notEqual(a, b);
});

test('drugs carry their acute harm, scaled by the harm weight', () => {
  const drugB = getSourceType('drugB');
  const r = rewardOf(50, 0, drugB);
  close(r.acuteHarmCost, 0.575 * 5);
  close(r.accumulatedHarmCost, 0.575 * 0.1 * 3);
  close(r.reward, r.sourceReward + r.stateBenefit - r.acuteHarmCost - r.accumulatedHarmCost - r.lowStateCost - r.stepCost);
  // The weight comes from d before the action, so the same drug costs less
  // at low d in the adaptive model and the same at any d in the fixed one.
  assert.ok(rewardOf(20, 0, drugB).acuteHarmCost < rewardOf(80, 0, drugB).acuteHarmCost);
  assert.equal(rewardOf(20, 0, drugB, fixed).acuteHarmCost, rewardOf(80, 0, drugB, fixed).acuteHarmCost);
});

test('accumulated harm adds to the penalty, unless omega is zero', () => {
  assert.ok(rewardOf(50, 40, null).reward < rewardOf(50, 0, null).reward);
  close(rewardOf(50, 40, null).accumulatedHarmCost, 0.575 * 0.1 * 0.98 * 40);

  const noAccumulated = modelConfigFor('noAccumulated');
  assert.equal(noAccumulated.omega, 0);
  for (const source of [null, getSourceType('drugB')]) {
    const clean = rewardOf(50, 0, source, noAccumulated);
    const harmed = rewardOf(50, 90, source, noAccumulated);
    assert.equal(harmed.accumulatedHarmCost, 0);
    assert.equal(harmed.reward, clean.reward);
  }
  // The acute cost stays.
  assert.ok(rewardOf(50, 0, getSourceType('drugB'), noAccumulated).acuteHarmCost > 0);
});

test('rewards are finite across the whole state range', () => {
  for (const cfg of [config, fixed, modelConfigFor('noAccumulated')]) {
    for (const d of [0, 1e-12, 50, 100]) {
      for (const h of [0, 100]) {
        for (const source of [null, ...SOURCE_TYPES]) {
          for (const value of Object.values(rewardOf(d, h, source, cfg))) assert.ok(Number.isFinite(value));
        }
      }
    }
  }
});

test('invalid configurations are refused', () => {
  assert.throws(() => hrlConfig({ lambdaS: 0 }));
  assert.throws(() => hrlConfig({ dTarget: 0 }));
  assert.throws(() => hrlConfig({ harmWeightMode: 'sometimes' }));
});

test('every step spent below the target costs, more the further below', () => {
  // At or above the target there is no cost.
  for (const d of [50, 60, 90]) assert.equal(computeReward({ d, dAction: d, dNext: d, hNext: 0, source: null }, config).lowStateCost, 0);
  const at = (dNext) => computeReward({ d: dNext, dAction: dNext, dNext, hNext: 0, source: null }, config).lowStateCost;
  close(at(25), config.kappa * 2.5);
  assert.ok(at(10) > at(30) && at(30) > at(45) && at(45) > 0);
  // It is charged on where d ends up, so passive recovery and drift count.
  const r = rewardOf(20, 0, null);
  assert.equal(r.stateBenefit, 0);
  assert.ok(r.lowStateCost > 0);
  assert.equal(rewardOf(20, 0, null, { ...config, kappa: 0 }).lowStateCost, 0);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Simulation } from '../js/simulation.js';
import { hrlConfig, HRL_DEFAULTS } from '../js/hrl/config.js';
import { seededRandom } from '../js/hrl/rng.js';
import { BEHAVIOR_PRESETS, applyBehaviorPreset } from '../js/hrl/presets.js';

test('behavior presets reset prior learning, restore all settings and rebuild dependence dimensions', () => {
  const sim = new Simulation(hrlConfig(), seededRandom(1));
  sim.params.kD = 0.2;
  sim.params.alpha = 0.1;
  sim.step();
  applyBehaviorPreset(sim, 'addiction');
  assert.equal(sim.steps, 0);
  assert.equal(sim.params.kD, HRL_DEFAULTS.kD);
  assert.equal(sim.params.alpha, HRL_DEFAULTS.alpha);
  assert.equal(sim.modelId, 'adaptive');
  assert.equal(sim.params.drugDeficit, true);
  const dependentStates = sim.env.numStates;
  assert.ok(sim.agent.q.every((q) => q === 0));
  applyBehaviorPreset(sim, 'noAddiction');
  assert.equal(sim.params.drugDeficit, false);
  assert.equal(sim.env.numStates * 6, dependentStates);
  assert.equal(sim.params.omega, BEHAVIOR_PRESETS.noAddiction.overrides.omega);
});

test('presets learn contrasting source use without forced doses across three seeds', () => {
  for (const id of ['addiction', 'noAddiction']) {
    for (const seed of [1, 2, 3]) {
      const sim = new Simulation(hrlConfig(), seededRandom(seed));
      applyBehaviorPreset(sim, id);
      for (let i = 0; i < sim.env.maxEpisodeSteps * 150; i++) sim.step();
      const choices = sim.recentChoices(20);
      const drug = choices.get('drugB');
      const food = choices.get('food');
      assert.equal(sim.dosesGiven, 0);
      if (id === 'addiction') {
        assert.ok(drug > 5 * Math.max(1, food), `Drug-use scenario, seed ${seed}`);
        assert.ok(sim.env.restingLevel < 25);
      } else {
        assert.ok(food > 5 * Math.max(1, drug), `Food-focused scenario, seed ${seed}`);
        assert.equal(sim.env.restingLevel, 50);
      }
    }
  }
});

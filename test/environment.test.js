import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hrlConfig, getSourceType, SOURCE_TYPES, modelConfigFor, walk, PATHS, UP, DOWN, LEFT } from './helpers.js';
import { HrlEnvironment, INTERACT } from '../js/hrl/environment.js';
import { HrlQLearningAgent } from '../js/hrl/agent.js';
import { seededRandom } from '../js/hrl/rng.js';
import { train, evaluate, runEpisode, createRun } from '../js/hrl/experiment.js';

const config = hrlConfig();

test('every source is on its own open cell, six steps from the start', () => {
  const env = new HrlEnvironment(config);
  assert.equal(env.items.size, SOURCE_TYPES.length);
  assert.deepEqual([...env.items.values()].sort(), SOURCE_TYPES.map((s) => s.id).sort());
  const distance = env.distancesFrom(env.start);
  for (const [cell, id] of env.items) {
    assert.ok(!env.isWall(cell));
    assert.equal(distance[cell], 6, id);
    assert.equal(env.sourceAt(cell), getSourceType(id));
  }
  for (const [id, path] of Object.entries(PATHS)) {
    env.reset();
    walk(env, path);
    assert.equal(env.usableSource(), getSourceType(id));
  }
});

test('sources can be placed and removed while the agent is in the maze', () => {
  const env = new HrlEnvironment(config);
  walk(env, PATHS.food);
  env.removeItem(env.state);
  assert.ok(!env.validActions().includes(INTERACT));
  assert.ok(env.step(INTERACT).rejected);

  env.placeItem(env.state, 'drugB');
  assert.ok(env.validActions().includes(INTERACT));
  assert.equal(env.step(INTERACT).source.id, 'drugB');
  assert.equal(env.h, 3);
});

test('interacting is only valid on a usable source', () => {
  const env = new HrlEnvironment(config);
  assert.ok(!env.validActions().includes(INTERACT));
  for (const action of PATHS.food.slice(0, -1)) {
    env.step(action);
    assert.ok(!env.validActions().includes(INTERACT));
  }
  env.step(DOWN);
  assert.ok(env.validActions().includes(INTERACT));
});

test('standing on a source gives nothing until it is used', () => {
  const env = new HrlEnvironment(config);
  const arrival = walk(env, PATHS.drugB);
  assert.equal(arrival.sourceReward, 0);
  assert.equal(arrival.acuteHarmCost, 0);
  assert.equal(env.h, 0);
  assert.equal(env.d, 50);
  // Bumping into the wall at the end of the arm is still just a move.
  const bump = env.step(DOWN);
  assert.equal(bump.sourceReward, 0);
  assert.equal(bump.reward, -config.stepCost);

  const use = env.step(INTERACT);
  assert.equal(use.source.id, 'drugB');
  assert.equal(use.sourceReward, 5);
  assert.equal(use.dAction, 80);
  assert.equal(env.h, 3);
});

test('a source can be used once per visit and again after leaving', () => {
  const env = new HrlEnvironment(config);
  walk(env, PATHS.food);
  assert.equal(env.step(INTERACT).source.id, 'food');
  assert.ok(!env.validActions().includes(INTERACT));
  assert.equal(env.usableSource(), null);

  // Walking into a wall does not count as leaving.
  env.step(DOWN);
  assert.ok(!env.validActions().includes(INTERACT));

  env.step(UP);
  assert.ok(!env.validActions().includes(INTERACT));
  env.step(DOWN);
  assert.ok(env.validActions().includes(INTERACT));
  assert.equal(env.step(INTERACT).source.id, 'food');
});

test('a rejected interaction has no source effects', () => {
  const env = new HrlEnvironment(config);
  const offSource = env.step(INTERACT);
  assert.ok(offSource.rejected);
  assert.equal(offSource.source, null);
  assert.equal(offSource.reward, -config.stepCost);

  walk(env, PATHS.drugB);
  env.step(INTERACT);
  const dBefore = env.d;
  const hBefore = env.h;
  const again = env.step(INTERACT);
  assert.ok(again.rejected);
  assert.equal(again.sourceReward, 0);
  assert.equal(again.acuteHarmCost, 0);
  assert.equal(again.dAction, dBefore);
  assert.equal(env.h, hBefore * config.rhoH);
});

test('the Q-state encodes cell, both bins and source availability', () => {
  const env = new HrlEnvironment(config);
  assert.equal(env.numStates, 13 * 13 * 11 * 11 * 2);
  assert.equal(env.numActions, 5);
  assert.equal(env.qStateAt(env.start), env.qState());
  const seen = new Set();
  for (const cell of [0, env.start, env.numCells - 1]) {
    for (const dBin of [0, 5, 10]) {
      for (const hBin of [0, 10]) {
        for (const sourceUsed of [false, true]) {
          const q = env.encode(cell, dBin, hBin, sourceUsed);
          assert.ok(Number.isInteger(q) && q >= 0 && q < env.numStates);
          assert.deepEqual(env.decode(q), { cell, dBin, hBin, aBin: 0, sourceUsed });
          assert.equal(env.cellOf(q), cell);
          seen.add(q);
        }
      }
    }
  }
  assert.equal(seen.size, 36);

  // The extremes of d and h map to valid states.
  for (const [d, h] of [[0, 0], [100, 100], [99.9, 10], [50, 100]]) {
    const q = env.reset({ d, h });
    assert.ok(q >= 0 && q < env.numStates);
  }
  assert.deepEqual(env.decode(env.reset({ d: 100, h: 100 })), { cell: env.start, dBin: 10, hBin: 10, aBin: 0, sourceUsed: false });

  // Valid actions can be read off the Q-state alone.
  walk(env, PATHS.food);
  const before = env.qState();
  env.step(INTERACT);
  assert.ok(env.validActions(before).includes(INTERACT));
  assert.ok(!env.validActions(env.qState()).includes(INTERACT));
  assert.equal(env.decode(env.qState()).sourceUsed, true);
});

test('the agent only ever selects valid actions', () => {
  const { env, agent } = createRun(hrlConfig({ epsilonStart: 1, epsilonDecay: 1 }), 3);
  let state = env.reset();
  let interactions = 0;
  for (let i = 0; i < 20000; i++) {
    const action = agent.act(state);
    assert.ok(env.validActions(state).includes(action));
    const outcome = env.step(action);
    assert.ok(!outcome.rejected);
    if (outcome.source) interactions++;
    agent.learn(state, action, outcome.reward, outcome.state, outcome.done);
    state = outcome.state;
  }
  assert.ok(interactions > 0);
});

test('the Q-learning target only looks at valid next actions', () => {
  const env = new HrlEnvironment(config);
  const agent = new HrlQLearningAgent(env, config, seededRandom(1));
  const state = env.reset();
  env.step(LEFT);
  const next = env.qState();

  // An invalid INTERACT with a huge value must not leak into the update...
  agent.q[next * env.numActions + INTERACT] = 1000;
  agent.learn(state, LEFT, 1, next, false);
  assert.equal(agent.q[state * env.numActions + LEFT], config.alpha * 1);
  assert.deepEqual(agent.bestActions(next), [UP, 1, DOWN, LEFT]);

  // ...while a valid one counts.
  walk(env, PATHS.food.slice(1, -1));
  const beforeSource = env.qState();
  env.step(DOWN);
  const onSource = env.qState();
  agent.q[onSource * env.numActions + INTERACT] = 10;
  agent.learn(beforeSource, DOWN, 0, onSource, false);
  assert.equal(agent.q[beforeSource * env.numActions + DOWN], config.alpha * config.gamma * 10);
  assert.equal(agent.bestAction(onSource), INTERACT);
});

test('a short training run of every model is sound and repeatable', () => {
  for (const modelId of ['fixed', 'adaptive', 'noAccumulated']) {
    const modelConfig = modelConfigFor(modelId, { dBackgroundDrift: 0.2, dInitial: 20 });
    const { env, agent, training } = train(modelConfig, { seed: 7, episodes: 40 });
    assert.equal(training.length, 40);
    assert.ok(agent.q.every(Number.isFinite));
    assert.ok(agent.q.some((value) => value !== 0));
    for (const episode of training) {
      assert.equal(episode.length, env.maxEpisodeSteps);
      assert.equal(episode.rejectedInteractions, 0);
      assert.ok(Number.isFinite(episode.totalReward));
      assert.ok(Math.abs(episode.moveShare + episode.ordinaryShare + episode.drugShare - 1) < 1e-12);
      assert.ok(episode.minD >= 0 && episode.finalH <= 100);
      const { sourceReward, stateBenefit, acuteHarmCost, accumulatedHarmCost, lowStateCost, stepCost } = episode.components;
      const fromParts = sourceReward + stateBenefit - acuteHarmCost - accumulatedHarmCost - lowStateCost - stepCost;
      assert.ok(Math.abs(fromParts - episode.totalReward) < 1e-6);
      if (modelId === 'noAccumulated') assert.equal(accumulatedHarmCost, 0);
    }

    const again = train(modelConfig, { seed: 7, episodes: 40 });
    assert.deepEqual(again.agent.q, agent.q);
    const other = train(modelConfig, { seed: 8, episodes: 40 });
    assert.notDeepEqual(other.agent.q, agent.q);

    // Evaluation is greedy and leaves the Q-table alone.
    const before = Float64Array.from(agent.q);
    const { episodes, trace } = evaluate(env, agent, { episodes: 2 });
    assert.deepEqual(agent.q, before);
    assert.equal(agent.episodes, 40);
    assert.equal(trace.length, env.maxEpisodeSteps);
    assert.equal(trace[0].d, 20);
    assert.equal(episodes[0].rejectedInteractions, 0);
  }
});

test('an episode can start from a chosen internal state', () => {
  const { env, agent } = createRun(config, 1);
  const metrics = runEpisode(env, agent, { learn: false, start: { d: 30, h: 12 } });
  assert.equal(metrics.minD, 30);
  assert.ok(metrics.stepsByBand.low > 0);
});

test('the drug-induced deficit is part of the state only when switched on', () => {
  const off = new HrlEnvironment(config);
  walk(off, PATHS.drugB);
  off.step(INTERACT);
  off.administer(getSourceType('drugB'));
  assert.equal(off.a, 0);
  assert.equal(off.restingLevel, 50);
  assert.equal(off.reset({ a: 30 }), off.qState());
  assert.equal(off.a, 0);

  const env = new HrlEnvironment(hrlConfig({ drugDeficit: true }));
  assert.equal(env.numStates, 13 * 13 * 11 * 11 * 6 * 2);
  const clean = env.qState();
  walk(env, PATHS.drugB);
  assert.equal(env.step(INTERACT).aNext, 4);
  env.administer(getSourceType('drugB'));
  assert.equal(env.a, 8);
  assert.equal(env.restingLevel, 42);

  // Every bin of the deficit gives its own, valid state.
  const seen = new Set();
  for (const a of [0, 9.9, 10, 25, 49.9, 50]) {
    const q = env.reset({ a });
    assert.ok(q >= 0 && q < env.numStates);
    assert.equal(env.decode(q).aBin, Math.min(5, Math.floor(a / 10)));
    assert.equal(env.cellOf(q), env.start);
    seen.add(q);
  }
  assert.equal(seen.size, 5);
  assert.equal(env.reset(), clean);
});

test('a used source stays unavailable for the refractory period', () => {
  const env = new HrlEnvironment(hrlConfig({ refractorySteps: 6 }));
  walk(env, PATHS.food);
  assert.equal(env.step(INTERACT).source.id, 'food');

  // Leaving and coming straight back is not enough any more...
  walk(env, [UP, DOWN]);
  assert.ok(env.isRefractory(env.state));
  assert.ok(!env.validActions().includes(INTERACT));
  assert.equal(env.decode(env.qState()).sourceUsed, true);
  assert.ok(env.step(INTERACT).rejected);

  // ...but once six steps have passed since the use, it is.
  walk(env, [UP, DOWN]);
  assert.ok(env.isRefractory(env.state));
  env.step(UP);
  env.step(DOWN);
  assert.ok(!env.isRefractory(env.state));
  assert.ok(env.validActions().includes(INTERACT));
  assert.equal(env.step(INTERACT).source.id, 'food');

  // Other sources are unaffected, and a new episode clears it.
  assert.ok(!env.isRefractory([...env.items.keys()].find((cell) => cell !== env.state)));
  env.reset();
  walk(env, PATHS.food);
  assert.ok(env.validActions().includes(INTERACT));
});

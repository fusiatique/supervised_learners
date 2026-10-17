import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Simulation } from '../js/simulation.js';
import { hrlConfig, getSourceType } from '../js/hrl/config.js';
import { INTERACT } from '../js/hrl/environment.js';

test('chosen consumption survives subsequent steps and reset clears the cue', () => {
  const sim = new Simulation(hrlConfig());
  const actions = [3, 3, 3, 3, 2, 2, INTERACT, 0];
  sim.agent.act = () => actions.shift();
  for (let i = 0; i < 7; i++) sim.step();
  const event = sim.lastConsumption;
  assert.equal(event.source.id, 'food');
  assert.equal(event.cell, sim.env.state);
  assert.equal(event.step, 7);
  sim.step();
  assert.equal(sim.lastOutcome.source, null);
  assert.equal(sim.lastConsumption, event);
  sim.resetLearning();
  assert.equal(sim.lastConsumption, null);
});

test('administered dose triggers a cue without adding a learned reward or agent choice', () => {
  const sim = new Simulation(hrlConfig());
  const q = Float64Array.from(sim.agent.q);
  const drug = getSourceType('drugB');
  sim.administer(drug);
  const first = sim.lastConsumption;
  assert.equal(first.source, drug);
  assert.equal(first.cell, sim.env.state);
  assert.equal(sim.steps, 0);
  assert.equal(sim.episodeSteps, 0);
  assert.equal(sim.recentChoices().get('drugB'), 0);
  assert.equal(sim.lastOutcome, null);
  assert.deepEqual(sim.agent.q, q);
  sim.administer(drug);
  assert.notEqual(sim.lastConsumption, first, 'Repeated doses at the same simulation step still produce events');
});

test('canvas cue animates, survives rapid repeat events, expires and clears on reset', async () => {
  const originalWindow = globalThis.window;
  const originalComputedStyle = globalThis.getComputedStyle;
  const originalDocument = globalThis.document;
  globalThis.window = { devicePixelRatio: 1, matchMedia: () => ({ matches: false, addEventListener() {} }) };
  globalThis.document = { documentElement: {} };
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => '#123456' });
  try {
    const { MazeView } = await import('../js/ui/mazeView.js');
    const calls = [];
    const ctx = new Proxy({}, {
      get: (_, name) => name === 'measureText' ? (text) => ({ width: text.length * 8 })
        : (...args) => calls.push([name, ...args]),
      set: () => true,
    });
    const view = new MazeView({ clientWidth: 600, clientHeight: 300, getContext: () => ctx });
    view.faceView.drawFace = () => {};
    const sim = new Simulation(hrlConfig());
    const consume = () => {
      sim.lastConsumption = { source: getSourceType('drugB'), cell: sim.env.state, step: sim.steps };
    };
    consume();
    view.draw(sim, {}, 100);
    assert.ok(calls.some(([name, text]) => name === 'strokeText' && text === 'Took Drug B!'));
    const initialRadius = calls.filter(([name]) => name === 'arc').at(-1)[3];
    calls.length = 0;
    consume();
    view.draw(sim, {}, 800);
    const laterRadius = calls.filter(([name]) => name === 'arc').at(-1)[3];
    assert.ok(laterRadius > initialRadius, 'Repeated use must not restart expansion every frame');
    assert.equal(view.consumedAt, 100);
    calls.length = 0;
    view.draw(sim, {}, 1600);
    assert.ok(!calls.some(([name]) => name === 'strokeText'), 'Expired cue stops drawing');
    consume();
    view.draw(sim, {}, 1700);
    assert.equal(view.consumedAt, 1700, 'Later consumption starts another burst');
    calls.length = 0;
    sim.resetLearning();
    view.draw(sim, {}, 1800);
    assert.ok(!calls.some(([name]) => name === 'strokeText'), 'Reset must remove the cue');
  } finally {
    globalThis.window = originalWindow;
    globalThis.getComputedStyle = originalComputedStyle;
    globalThis.document = originalDocument;
  }
});

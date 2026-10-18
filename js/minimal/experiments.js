import { DRUG, NATURAL } from './model.js';
import { Life } from './life.js';

// Experiments on the minimal model. Each agent lives one continuing life that
// follows a protocol: at given steps, parameters change (the drug becomes
// available or is withdrawn, its harm cost rises) or forced doses are given.

// An agent counts as dependent when it chooses the drug on at least this share
// of steps in the last window. Clean agents only take it while exploring (~1%).
export const DEPENDENT_SHARE = 0.05;
export const WINDOW = 1000;

// Drug-free childhood, after which the drug is available.
export const DRUG_FROM = 20000;
const childhood = [{ at: 0, set: { drugAvailable: false } }, { at: DRUG_FROM, set: { drugAvailable: true } }];

// Runs one life. `events` are { at, set } (parameter changes) or { at, doses }
// (forced doses). Returns per-window records, the internal states just before
// each event step, and the trained agent.
export function runLife({ overrides = {}, events = [], steps, seed = 1 }) {
  const life = new Life(overrides, seed);
  const windows = [];
  const stateAt = {};
  let counts = { drug: 0, natural: 0, H: 0, B: 0 };

  for (let t = 0; t < steps; t++) {
    for (const event of events) {
      if (event.at !== t) continue;
      stateAt[t] ??= { ...life.state };
      if (event.set) Object.assign(life.p, event.set);
      if (event.doses) life.dose(event.doses);
    }
    const { action } = life.tick();
    const { state } = life;

    counts.drug += action === DRUG;
    counts.natural += action === NATURAL;
    counts.H += state.H;
    counts.B += state.B;
    if ((t + 1) % WINDOW === 0) {
      windows.push({
        step: t + 1,
        drugShare: counts.drug / WINDOW,
        naturalShare: counts.natural / WINDOW,
        meanH: counts.H / WINDOW,
        meanB: counts.B / WINDOW,
      });
      counts = { drug: 0, natural: 0, H: 0, B: 0 };
    }
  }
  return { windows, stateAt, agent: life.agent, p: life.p, state: life.state };
}

export const isDependent = (windows) => windows[windows.length - 1].drugShare >= DEPENDENT_SHARE;

const seedsOf = (n) => Array.from({ length: n }, (_, i) => i + 1);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

// Mean over seeds of each window's measures.
function averageWindows(lives) {
  return lives[0].windows.map((w, i) => {
    const row = { step: w.step };
    for (const key of ['drugShare', 'naturalShare', 'meanH', 'meanB']) row[key] = mean(lives.map((l) => l.windows[i][key]));
    return row;
  });
}

// 1. Acquisition: the drug arrives after a drug-free childhood and nothing else
// happens. Some agents tip into dependence through their own exploration.
export function acquisition({ seeds = 20, steps = 100000, overrides = {} } = {}) {
  const lives = seedsOf(seeds).map((seed) => ({ seed, ...runLife({ overrides, events: childhood, steps, seed }) }));
  return {
    lives,
    perSeed: lives.map((l) => ({ seed: l.seed, dependent: isDependent(l.windows), finalB: l.state.B })),
  };
}

// 2. Forced doses: after the drug has been available for a while, give a
// number of doses the agent did not choose. Run with delta = 0 as a control:
// then doses cannot lower B and should never cause dependence.
export function doses({ seeds = 20, counts = [0, 5, 10, 15, 20, 30], overrides = {} } = {}) {
  const doseAt = 40000;
  const steps = 80000;
  return counts.map((n) => {
    const lives = seedsOf(seeds).map((seed) => runLife({ overrides, events: [...childhood, { at: doseAt, doses: n }], steps, seed }));
    return { doses: n, dependent: lives.filter((l) => isDependent(l.windows)).length, seeds, mean: averageWindows(lives) };
  });
}

// 3. Compulsion: two groups, one given 20 doses and one not, then the drug's
// harm cost is raised. Dependent agents keep using at costs clean agents refuse.
export function compulsion({ seeds = 20, costs = [1, 3, 6, 10, 15, 20], overrides = {} } = {}) {
  const doseAt = 40000;
  const costAt = 50000;
  const steps = 70000;
  const groups = [{ id: 'clean', doses: 0 }, { id: 'dosed', doses: 20 }];
  return costs.map((c) => {
    const row = { c };
    for (const group of groups) {
      const lives = seedsOf(seeds).map((seed) => runLife({
        overrides,
        events: [...childhood, { at: doseAt, doses: group.doses }, { at: costAt, set: { c } }],
        steps,
        seed,
      }));
      row[`${group.id}DrugShare`] = mean(lives.map((l) => l.windows[l.windows.length - 1].drugShare));
      row[`${group.id}Dependent`] = lives.filter((l) => isDependent(l.windows)).length;
    }
    return row;
  });
}

// 4. Relapse: make agents dependent with 20 doses, withdraw the drug for a
// period of abstinence, then make it available again. Whether they relapse
// depends on how far B has healed by then, not on what they learned before.
export function relapse({ seeds = 20, abstinence = [0, 250, 500, 1000, 2000, 5000], overrides = {} } = {}) {
  const doseAt = 40000;
  const withdrawAt = 50000;
  const after = 20000;
  return abstinence.map((length) => {
    const returnAt = withdrawAt + length;
    const lives = seedsOf(seeds).map((seed) => runLife({
      overrides,
      events: [
        ...childhood,
        { at: doseAt, doses: 20 },
        { at: withdrawAt, set: { drugAvailable: false } },
        { at: returnAt, set: { drugAvailable: true } },
      ],
      steps: returnAt + after,
      seed,
    }));
    const bAtReturn = mean(lives.map((l) => l.stateAt[returnAt].B));
    return { abstinence: length, dependent: lives.filter((l) => isDependent(l.windows)).length, seeds, bAtReturn };
  });
}

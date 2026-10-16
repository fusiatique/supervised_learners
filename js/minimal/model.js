// The minimal homeostatic model of dependence. Two internal states:
//
//   H  the internal level the agent cares about (0 to 100)
//   B  the baseline H relaxes towards when the agent does nothing
//
// The agent wants H at the setpoint S. Each step it picks one action:
//
//   H' = H + gain + k * (B - H)                   relax towards the baseline
//   B' = B - delta * [drug] + rho * (B0 - B)      drug lowers B, which heals slowly
//   D(H) = (S - H)^2 / S                          drive: distance from the setpoint
//   r  = D(H) - D(H') + (R0 - c) * [drug]         drive reduction, drug pleasure, harm
//
// If the agent took the natural reward every step, H would settle at
// B + naturalGain / k. Once B falls below S - naturalGain / k (30 with the
// defaults), natural rewards can no longer reach the setpoint and only the
// drug can. All values are illustrative simulation units.

export const ACTIONS = [
  { id: 'nothing', name: 'Nothing' },
  { id: 'natural', name: 'Natural reward' },
  { id: 'drug', name: 'Drug' },
];
export const NOTHING = 0;
export const NATURAL = 1;
export const DRUG = 2;

export const DEFAULTS = {
  // Internal level H.
  S: 50, // setpoint
  hMin: 0,
  hMax: 100,
  hInitial: 50,
  k: 0.1, // fraction of the way H relaxes to B each step

  // Baseline B.
  B0: 40, // healthy baseline
  bMin: 0,
  bInitial: 40,
  delta: 1, // how far one drug use lowers B
  rho: 0.001, // fraction of the way B heals back to B0 each step

  // Actions.
  naturalGain: 2,
  drugGain: 25,
  R0: 2, // the drug's direct pleasure
  c: 1, // the drug's harm cost
  drugAvailable: true,

  // Q-learning over binned (H, B).
  hBinWidth: 10,
  bBinWidth: 5,
  alpha: 0.1,
  gamma: 0.9,
  epsilonStart: 0.3,
  epsilonMin: 0.02,
  epsilonDecay: 0.999, // per step
};

export function config(overrides = {}) {
  return { ...DEFAULTS, ...overrides };
}

export function clip(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function drive(H, p) {
  return (p.S - H) ** 2 / p.S;
}

// The highest level natural rewards alone can hold H at, for a baseline B.
export function naturalCeiling(B, p) {
  return B + p.naturalGain / p.k;
}

// The baseline below which natural rewards can no longer reach the setpoint.
export function tippingPoint(p) {
  return p.S - p.naturalGain / p.k;
}

// One step of the internal states and its reward. `forced` gives a drug dose
// on top of the chosen action: it changes H and B but earns no reward.
export function step({ H, B }, action, p, { forced = false } = {}) {
  const drug = action === DRUG || forced;
  const gain = (action === NATURAL ? p.naturalGain : 0) + (drug ? p.drugGain : 0);
  const nextH = clip(H + gain + p.k * (B - H), p.hMin, p.hMax);
  const nextB = clip(B - (drug ? p.delta : 0) + p.rho * (p.B0 - B), p.bMin, p.B0);
  const driveReduction = drive(H, p) - drive(nextH, p);
  const drugTerm = action === DRUG ? p.R0 - p.c : 0;
  return { H: nextH, B: nextB, reward: driveReduction + drugTerm, driveReduction, drugTerm };
}

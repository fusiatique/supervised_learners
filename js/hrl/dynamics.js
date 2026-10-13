// Internal-state dynamics. Pure functions of the current values and the
// config; rewards are computed separately in reward.js.

export function clip(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// d immediately after a source's effect, before passive recovery.
export function dAfterAction(d, dopamineGain, config) {
  return clip(d + dopamineGain, config.dMin, config.dMax);
}

// Passive recovery towards the resting level, minus the optional background
// drift. The resting level is dBase lowered by the drug-induced deficit `a`.
export function dAfterRecovery(dAction, config, a = 0) {
  const { kD, dBase, dBackgroundDrift, dMin, dMax } = config;
  return clip(dAction + kD * (dBase - a - dAction) - dBackgroundDrift, dMin, dMax);
}

// What a use of `source` adds to the drug-induced deficit.
export function deficitGain(source, config) {
  return config.drugDeficit && source ? source.deficitGain : 0;
}

// The deficit heals by rhoA each step and deepens with each drug use.
export function nextDeficit(a, gain, config) {
  return clip(config.rhoA * a + gain, 0, config.aMax);
}

// Accumulated harm decays by rhoH each step and grows by the action's gain.
export function nextHarm(h, harmGain, config) {
  return clip(config.rhoH * h + harmGain, config.hMin, config.hMax);
}

// One time step of the internal states. `source` is the source that was
// used, or null for a step without an interaction. d recovers towards the
// resting level as it is after this step's change to the deficit.
export function transition(d, h, source, config, a = 0) {
  const dAction = dAfterAction(d, source ? source.dopamineGain : 0, config);
  const aNext = nextDeficit(a, deficitGain(source, config), config);
  return {
    dAction,
    dNext: dAfterRecovery(dAction, config, aNext),
    hNext: nextHarm(h, source ? source.harmGain : 0, config),
    aNext,
  };
}

export function numBins(min, max, width) {
  return Math.floor((max - min) / width) + 1;
}

// Bin of `value` for the Q-table: [min, min + width) is bin 0 and so on, with
// `max` itself in the last bin.
export function binIndex(value, min, max, width) {
  const bin = Math.floor((clip(value, min, max) - min) / width);
  return clip(bin, 0, numBins(min, max, width) - 1);
}

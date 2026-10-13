// Reward function of the homeostatic model:
//
//   r = R0 + beta * (phi(dAction) - phi(d)) - lambda(d) * (acuteHarm + omega * hNext) - stepCost
//
// It only reads the states; updating them is dynamics.js's job.

// State utility of d: a quadratic penalty below the target and a saturating
// bonus above it. Zero and continuous at the target.
export function phi(d, config) {
  const { dTarget, phiA, phiB, phiC } = config;
  if (d < dTarget) return -phiA * ((dTarget - d) / dTarget) ** 2;
  return phiB * (1 - Math.exp(-phiC * (d - dTarget)));
}

// Weight given to harm. In the adaptive model it is a logistic function of d,
// low when d is far below the target and high above it (the model's central
// assumption); in the fixed model it is the midpoint of that range.
export function harmWeight(d, config) {
  const { lambdaMin, lambdaMax, lambdaS, dTarget, harmWeightMode } = config;
  if (harmWeightMode === 'fixed') return (lambdaMin + lambdaMax) / 2;
  // The exponent is bounded so a tiny lambdaS cannot overflow.
  const exponent = Math.min(700, Math.max(-700, -(d - dTarget) / lambdaS));
  return lambdaMin + (lambdaMax - lambdaMin) / (1 + Math.exp(exponent));
}

// Reward of one step, with its components. `d` is the state before the
// action, `dAction` the state right after the source's effect (before passive
// recovery, so recovery itself earns nothing) and `hNext` the updated harm.
// `source` is null unless a source was actually used.
export function computeReward({ d, dAction, hNext, source }, config) {
  const sourceReward = source ? source.reward : 0;
  const stateBenefit = config.beta * (phi(dAction, config) - phi(d, config));
  const lambda = harmWeight(d, config);
  const acuteHarmCost = lambda * (source ? source.acuteHarm : 0);
  const accumulatedHarmCost = lambda * config.omega * hNext;
  const stepCost = config.stepCost;
  return {
    reward: sourceReward + stateBenefit - acuteHarmCost - accumulatedHarmCost - stepCost,
    sourceReward,
    stateBenefit,
    harmWeight: lambda,
    acuteHarmCost,
    accumulatedHarmCost,
    stepCost,
  };
}

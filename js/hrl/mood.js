// How the agent's internal states are shown as a face on the page. This is a
// reading aid layered on top of the model: nothing here feeds back into the
// dynamics, the reward or what the agent learns.

export const MOODS = [
  { id: 'euphoric', name: 'Euphoric', description: 'd is far above its target.' },
  { id: 'happy', name: 'Happy', description: 'd is comfortably above its target.' },
  { id: 'neutral', name: 'Neutral', description: 'd is close to its target.' },
  { id: 'sad', name: 'Sad', description: 'd is well below its target.' },
  { id: 'withdrawal', name: 'In withdrawal', description: 'd is well below its target because drug use has lowered the level it rests at.' },
];

// d within this distance of the target counts as neutral.
export const NEUTRAL_HALF_WIDTH = 10;
// d this far above the target counts as euphoric.
export const EUPHORIC_ABOVE = 30;
// A resting level lowered by at least this much turns sad into withdrawal.
export const WITHDRAWAL_DEFICIT = 10;

// The mood for a level of d and the level d currently rests at.
export function moodOf(d, restingLevel, config) {
  const { dTarget, dBase } = config;
  let id = 'neutral';
  if (d >= dTarget + EUPHORIC_ABOVE) id = 'euphoric';
  else if (d >= dTarget + NEUTRAL_HALF_WIDTH) id = 'happy';
  else if (d < dTarget - NEUTRAL_HALF_WIDTH) id = dBase - restingLevel >= WITHDRAWAL_DEFICIT ? 'withdrawal' : 'sad';
  return MOODS.find((mood) => mood.id === id);
}

// How grey and pale accumulated harm h makes the skin, from 0 (healthy) to 1.
// It rises quickly at first so that the harm of a few drug uses already shows.
export function pallor(h) {
  return 1 - Math.exp(-Math.max(0, h) / 20);
}

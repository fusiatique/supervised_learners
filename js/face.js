import { DEPENDENT_SHARE } from './experiments.js';

// The agent's face, shared by the Environment panel (canvas) and the tutorial
// (SVG). Three readings of the agent's state each drive their own features, so
// they can be told apart:
//
//   mood     H against the setpoint      mouth and colour
//   fatigue  B against its healthy B0    heavy eyelids, eye bags, greyer skin
//   craving  recent share of drug use    eyes glancing at the drug, a sweat drop

// 1 with H at the setpoint, 0 when H is MOOD_RANGE / 2 away, -1 when it is
// MOOD_RANGE or more away, either way.
const MOOD_RANGE = 20;
export const moodOf = (H, p) => 1 - 2 * Math.min(1, Math.abs(H - p.S) / MOOD_RANGE);

// 0 with B at its healthy level B0, 1 when B is FATIGUE_RANGE or more below it
// (halfway at the tipping point with the defaults).
const FATIGUE_RANGE = 20;
export const fatigueOf = (B, p) => Math.min(1, Math.max(0, (p.B0 - B) / FATIGUE_RANGE));

// 0 for an agent that never takes the drug, 1 once its share of drug choices
// reaches the share that counts as dependent.
export const cravingOf = (drugShare) => Math.min(1, drugShare / DEPENDENT_SHARE);

const rgbOf = (hex) => [0, 1, 2].map((i) => parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16));
const blend = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// Face colour: red when distressed (mood -1), yellow when neutral, green when
// content (1), drained towards grey as fatigue rises. `colors` holds the
// --face-happy, --face-neutral, --face-sad and --face-worn values.
export function faceColor({ mood, fatigue = 0 }, colors) {
  const base = blend(rgbOf(colors.neutral), rgbOf(mood < 0 ? colors.sad : colors.happy), Math.abs(mood));
  return `rgb(${blend(base, rgbOf(colors.worn), 0.6 * fatigue).map(Math.round).join(', ')})`;
}

// The bio videos' character's face (animation/bio/remotion/src/components.tsx
// HumanCharacter), in units of its head radius of 37: short upright eyes, a
// mouth (half width, height, curve control) that blends from 'satisfied'
// (mood 1) through 'neutral' (0) to 'disappointed' (-1), and the disappointed
// brows, faded in as the mood falls.
export const FACE_UNIT = 37;
const MOUTHS = { satisfied: [13, 11, 26], neutral: [10, 13, 20], disappointed: [10, 18, 10] };

// SVG path data for the face's features around 0, 0 for a head of radius r.
// `glance` (-1 to 1) turns the eyes left or right. Each feature after the eyes
// and mouth comes with the opacity to draw it at; 0 means leave it out.
export function faceParts({ mood, fatigue = 0, craving = 0, glance = 0 }, r) {
  const k = r / FACE_UNIT;
  const n = (v) => +(v * k).toFixed(2);
  const [a, b, t] = mood >= 0 ? [MOUTHS.neutral, MOUTHS.satisfied, mood] : [MOUTHS.neutral, MOUTHS.disappointed, -mood];
  const [half, y, control] = a.map((v, i) => v + (b[i] - v) * t);
  const eyeX = [-12, 12].map((x) => x + 4 * glance * craving);
  // The lids slide down over the eyes as fatigue rises.
  const lidY = -8 + 3 * fatigue;
  const eyes = eyeX.map((x) => `M ${n(x)} ${n(lidY + 1.5)} V ${n(-2)}`).join(' ');
  return {
    features: `${eyes} M ${n(-half)} ${n(y)} Q 0 ${n(control)} ${n(half)} ${n(y)}`,
    brows: { d: `M ${n(-19)} ${n(-12)} L ${n(-7)} ${n(-15)} M ${n(7)} ${n(-15)} L ${n(19)} ${n(-12)}`, opacity: Math.max(0, -mood) },
    lids: { d: eyeX.map((x) => `M ${n(x - 6)} ${n(lidY)} H ${n(x + 6)}`).join(' '), opacity: fatigue },
    bags: { d: eyeX.map((x) => `M ${n(x - 5)} ${n(4)} Q ${n(x)} ${n(7)} ${n(x + 5)} ${n(4)}`).join(' '), opacity: Math.max(0, fatigue - 0.5) },
    sweat: { d: `M ${n(27)} ${n(-34)} Q ${n(20)} ${n(-20)} ${n(27)} ${n(-17)} Q ${n(34)} ${n(-20)} ${n(27)} ${n(-34)} Z`, opacity: craving },
  };
}

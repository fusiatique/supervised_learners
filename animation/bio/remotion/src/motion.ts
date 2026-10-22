import {Easing, interpolate, spring} from 'remotion';

export const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const ease = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
export const fade = (frame: number, start: number, end: number, out?: number) =>
  progress(frame, start, end) * (out === undefined ? 1 : 1 - progress(frame, out, out + 30));
export const pop = (frame: number, start: number) => spring({frame: Math.max(0, frame - start), fps: 30, config: {damping: 16, stiffness: 110}}) * (frame < start ? 0 : 1);
export const draw = (amount: number) => ({pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - Math.min(1, Math.max(0, amount))});
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const curvePoint = (t: number, points: number[][]) => {
  const u = 1 - t;
  return [0, 1].map(axis => u ** 3 * points[0][axis] + 3 * u * u * t * points[1][axis] + 3 * u * t * t * points[2][axis] + t ** 3 * points[3][axis]);
};

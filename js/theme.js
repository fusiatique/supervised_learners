// Canvas drawing cannot use CSS variables directly, so resolve them here.
// Values are cached and dropped when the OS colour scheme changes.
const cache = new Map();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => cache.clear());

export function cssVar(name) {
  if (!cache.has(name)) {
    cache.set(name, getComputedStyle(document.documentElement).getPropertyValue(name).trim());
  }
  return cache.get(name);
}

export const CANVAS_FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

// Match the canvas backing store to its CSS size and the device pixel ratio.
// Returns a context scaled so drawing can use CSS pixels, plus that size.
export function prepareCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

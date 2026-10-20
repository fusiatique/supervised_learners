/* ==========================================================
   Scene controller
   - → / Space / click: reveal next beat, then advance scene
   - ← : previous scene (all beats shown)
   - Chapter nav + URL hash (#scene-id) for deep linking
   Scene-specific animations can hook in via `sceneHooks`.
   ========================================================== */

const scenes = Array.from(document.querySelectorAll('.scene'));
const progressBar = document.getElementById('progressBar');
const counter = document.getElementById('counter');
const chapterNav = document.getElementById('chapterNav');

let current = 0;

/* Per-scene animation hooks, keyed by scene id. Scene scripts (js/scenes/*.js)
   register themselves on window.sceneHooks before this file runs.
   Each may define:
     enter(sceneEl, beatsShown)  – beatsShown is 0 on a fresh entry, or all beats when arriving backwards
     beat(sceneEl, index)        – beat `index` was just revealed
     leave(sceneEl)                                                        */
const sceneHooks = (window.sceneHooks = window.sceneHooks || {});

const beatsOf = (scene) => Array.from(scene.querySelectorAll('.beat'));

function showBeats(scene, count) {
  beatsOf(scene).forEach((b, i) => b.classList.toggle('is-shown', i < count));
}

function goTo(index, { revealAll = false } = {}) {
  index = Math.max(0, Math.min(scenes.length - 1, index));
  const prev = scenes[current];
  const next = scenes[index];

  sceneHooks[prev.id]?.leave?.(prev);

  scenes.forEach((s, i) => {
    s.classList.toggle('is-active', i === index);
    s.classList.toggle('is-past', i < index);
  });

  next.dataset.beat = revealAll ? beatsOf(next).length : 0;
  showBeats(next, Number(next.dataset.beat));

  current = index;
  sceneHooks[next.id]?.enter?.(next, Number(next.dataset.beat));
  updateHud();
  history.replaceState(null, '', `#${next.id}`);
}

function next() {
  const scene = scenes[current];
  const beats = beatsOf(scene);
  const shown = Number(scene.dataset.beat || 0);
  if (shown < beats.length) {
    scene.dataset.beat = shown + 1;
    beats[shown].classList.add('is-shown');
    sceneHooks[scene.id]?.beat?.(scene, shown);
  } else if (current < scenes.length - 1) {
    goTo(current + 1);
  }
}

function prev() {
  if (current > 0) goTo(current - 1, { revealAll: true });
}

/* ---------- HUD ---------- */
function buildChapterNav() {
  const seen = new Set();
  scenes.forEach((s, i) => {
    const ch = s.dataset.chapter;
    if (seen.has(ch)) return;
    seen.add(ch);
    const btn = document.createElement('button');
    btn.textContent = ch === '0' ? s.dataset.label : `${ch} · ${s.dataset.label}`;
    btn.dataset.chapter = ch;
    btn.addEventListener('click', () => goTo(i));
    chapterNav.appendChild(btn);
  });
}

function updateHud() {
  progressBar.style.width = `${(current / (scenes.length - 1)) * 100}%`;
  counter.textContent = `${current + 1} / ${scenes.length}`;
  const ch = scenes[current].dataset.chapter;
  chapterNav.querySelectorAll('button').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.chapter === ch)
  );
}

/* ---------- Input ---------- */
document.addEventListener('keydown', (e) => {
  if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); next(); }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
  if (e.key === 'Home') goTo(0);
  if (e.key === 'End') goTo(scenes.length - 1, { revealAll: true });
});
document.getElementById('nextBtn').addEventListener('click', next);
document.getElementById('prevBtn').addEventListener('click', prev);
document.getElementById('deck').addEventListener('click', (e) => {
  if (!e.target.closest('a, button, summary, details')) next();
});

/* ---------- Init ---------- */
buildChapterNav();
const startId = location.hash.slice(1);
const startIndex = Math.max(0, scenes.findIndex((s) => s.id === startId));
goTo(startIndex, { revealAll: startIndex > 0 });

window.addEventListener('load', () => {
  window.renderMathInElement?.(document.body, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\(', right: '\\)', display: false },
    ],
  });
});

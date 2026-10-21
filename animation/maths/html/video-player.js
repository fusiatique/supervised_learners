// Plays a rendered Manim video with the same postMessage protocol as the bio Remotion players:
// replies `${prefix}:ready` to the presentation and obeys `${prefix}:play` / `${prefix}:pause`.
const video = document.querySelector('video[data-prefix]');
const prefix = video.dataset.prefix;

window.addEventListener('message', (e) => {
  if (e.source !== window.parent || e.origin !== window.location.origin) return;
  if (e.data?.type === `${prefix}:play`) video.play();
  if (e.data?.type === `${prefix}:pause`) video.pause();
});
window.parent.postMessage({type: `${prefix}:ready`}, window.location.origin);

// Phone map camera: pinch to zoom, drag to move, double-tap to zoom in, + / - and
// "Whole map" buttons, and a glide to the suggested step after each step.
// It works on the SVG viewBox, so the map stays sharp at every zoom.
// On wider screens it does nothing and the map keeps its fixed view.

const MAP_W = 1000, MAP_H = 620;
const H_MIN = 200;          // most zoomed in: 200 map units tall
const H_FOLLOW = 540;       // the zoom used when following a step: the step and its neighbours

let svg = null, cam = null, anim = 0, onLog = () => {};
const pts = new Map();
let gesture = null, dragged = false, lastTap = 0, logTimer = 0, pendingLog = null;

// Phones in portrait (narrow) and in landscape (short screen with touch).
export const isPhone = () => window.innerWidth <= 720 || (window.innerHeight <= 500 && !!window.matchMedia?.('(pointer: coarse)').matches);

function aspect() { return svg.clientWidth / Math.max(1, svg.clientHeight); }
function hWhole() { return Math.max(MAP_H, MAP_W / aspect()); }

function clamp(c) {
  const h = Math.min(Math.max(c.h, H_MIN), hWhole());
  const w = h * aspect();
  const cx = w >= MAP_W ? MAP_W / 2 : Math.min(Math.max(c.cx, w / 2), MAP_W - w / 2);
  const cy = h >= MAP_H ? MAP_H / 2 : Math.min(Math.max(c.cy, h / 2), MAP_H - h / 2);
  return { cx, cy, h };
}

function apply() {
  if (!svg) return;
  if (!isPhone()) { svg.setAttribute('viewBox', `0 0 ${MAP_W} ${MAP_H}`); return; }
  cam = clamp(cam);
  const w = cam.h * aspect();
  svg.setAttribute('viewBox', `${cam.cx - w / 2} ${cam.cy - cam.h / 2} ${w} ${cam.h}`);
}

function glide(to, ms = 450) {
  cancelAnimationFrame(anim);
  const from = { ...cam }, target = clamp(to), t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    cam = { cx: from.cx + (target.cx - from.cx) * e, cy: from.cy + (target.cy - from.cy) * e, h: from.h + (target.h - from.h) * e };
    apply();
    if (k < 1) anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}

// at most one log entry every 2 s for continuous gestures
function logSoon(type, data) {
  pendingLog = { type, data };
  if (logTimer) return;
  logTimer = setTimeout(() => { if (pendingLog) onLog(pendingLog.type, { ...pendingLog.data, h: Math.round(cam.h) }); pendingLog = null; logTimer = 0; }, 2000);
}

function local(e) { const r = svg.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
function toMap(p) { const w = cam.h * aspect(); return { x: cam.cx - w / 2 + p.x / svg.clientWidth * w, y: cam.cy - cam.h / 2 + p.y / svg.clientHeight * cam.h }; }

// zoom so that the map point under screen point p stays under it
function zoomAround(p, h) {
  const anchor = toMap(p);
  const nh = Math.min(Math.max(h, H_MIN), hWhole()), w = nh * aspect();
  cam = { h: nh, cx: anchor.x - (p.x / svg.clientWidth - 0.5) * w, cy: anchor.y - (p.y / svg.clientHeight - 0.5) * nh };
  apply();
}

function down(e) {
  if (!isPhone()) return;
  cancelAnimationFrame(anim);
  pts.set(e.pointerId, local(e));
  if (pts.size === 1) { gesture = { kind: 'pan', start: local(e), cam: { ...cam } }; dragged = false; }
  if (pts.size === 2) {
    const [a, b] = [...pts.values()];
    gesture = { kind: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, h0: cam.h };
    dragged = true;
  }
}
function move(e) {
  if (!gesture || !pts.has(e.pointerId)) return;
  pts.set(e.pointerId, local(e));
  if (gesture.kind === 'pan' && pts.size === 1) {
    const p = local(e), dx = p.x - gesture.start.x, dy = p.y - gesture.start.y;
    if (Math.hypot(dx, dy) > 8) dragged = true;
    if (!dragged) return;
    const k = cam.h / svg.clientHeight;
    cam = { ...gesture.cam, cx: gesture.cam.cx - dx * k, cy: gesture.cam.cy - dy * k };
    apply(); logSoon('map_pan', {});
  } else if (gesture.kind === 'pinch' && pts.size === 2) {
    const [a, b] = [...pts.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    zoomAround({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, gesture.h0 * gesture.d0 / d);
    logSoon('map_zoom', { how: 'pinch' });
  }
}
function up(e) {
  if (!pts.has(e.pointerId)) return;
  const p = local(e);
  pts.delete(e.pointerId);
  if (pts.size === 1) { const [q] = [...pts.values()]; gesture = { kind: 'pan', start: q, cam: { ...cam } }; return; }
  if (pts.size === 0) {
    // double-tap on empty map: zoom in there
    const now = performance.now();
    if (!dragged && !e.target.closest?.('.node')) {
      if (now - lastTap < 320) { zoomAround(p, cam.h * 0.6); onLog('map_zoom', { how: 'doubletap', h: Math.round(cam.h) }); lastTap = 0; }
      else lastTap = now;
    }
    gesture = null;
  }
}

function buttons(host) {
  const box = document.createElement('div');
  box.className = 'mapctl';
  box.innerHTML = `<div class="ctlgrp"><button class="ctl" data-z="in" aria-label="Zoom in" title="Zoom in">+</button>
    <button class="ctl" data-z="out" aria-label="Zoom out" title="Zoom out">−</button></div>
    <button class="ctl" data-z="whole" aria-label="Show the whole map" title="Whole map"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
  host.appendChild(box);
  box.querySelector('[data-z="in"]').onclick = () => { glide({ ...cam, h: cam.h * 0.65 }, 250); onLog('map_zoom', { how: 'button_in' }); };
  box.querySelector('[data-z="out"]').onclick = () => { glide({ ...cam, h: cam.h / 0.65 }, 250); onLog('map_zoom', { how: 'button_out' }); };
  box.querySelector('[data-z="whole"]').onclick = () => { glide({ cx: MAP_W / 2, cy: MAP_H / 2, h: hWhole() }); onLog('map_whole', {}); };
}

export function initCamera(el, host, log) {
  svg = el; onLog = log || onLog;
  cam = { cx: MAP_W / 2, cy: MAP_H / 2, h: H_FOLLOW };
  svg.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  // a drag must not open the place it started on
  svg.addEventListener('click', e => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
  window.addEventListener('resize', () => apply());
  if (window.ResizeObserver) new ResizeObserver(() => apply()).observe(svg);
  buttons(host);
  apply();
}

// Glide to a map point at a readable zoom (used after each step and in the trip view).
export function follow(x, y, h = H_FOLLOW) {
  if (!svg || !isPhone()) return;
  // keep a closer zoom if the participant chose one, otherwise come in to the readable zoom
  // in landscape the screen is wide: also cap the visible width at about 640 map units
  glide({ cx: x, cy: y, h: Math.min(cam.h, h, 640 / aspect()) });
}

export function whole() { if (svg && isPhone()) glide({ cx: MAP_W / 2, cy: MAP_H / 2, h: hWhole() }); }

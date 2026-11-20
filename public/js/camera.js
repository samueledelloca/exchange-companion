// Phone map camera: pinch to zoom, drag to move, double-tap to zoom in, and a
// glide to the suggested step after each step (no on-screen buttons: standard gestures).
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
// Furthest zoom-out on phones: the map covers the screen (no empty bands).
// Portrait shows the full height, landscape the full width.
function hWhole() { return Math.min(MAP_H, MAP_W / aspect()); }

// Share of the map hidden by an open panel: the bottom sheet (portrait phones)
// or the side column (landscape). Places are centred in what stays visible.
function occlusion() {
  const o = { l: 0, r: 0, t: 0, b: 0 };
  if (!svg) return o;
  const r = svg.getBoundingClientRect();
  if (!r.width || !r.height) return o;
  const cap = v => Math.min(Math.max(v, 0), 0.9);
  // the floating top bar sits over the map on phones
  const bar = document.querySelector('.topbar');
  if (bar) { const b = bar.getBoundingClientRect(); if (b.bottom > r.top && b.top <= r.top + 4) o.t = cap((b.bottom - r.top) / r.height); }
  const p = document.querySelector('#panel');
  if (!p || p.hidden) return o;
  const q = p.getBoundingClientRect();
  // bottom sheet: (almost) full width; checked by width because the panel slides in sideways
  if (q.top > r.top + 40 && q.width > r.width * 0.8) o.b = cap((r.bottom - q.top) / r.height);
  else if (q.left > r.left + 40) o.r = cap((r.right - q.left) / r.width);
  return o;
}

function clamp(c) {
  const h = Math.min(Math.max(c.h, H_MIN), hWhole());
  const w = h * aspect(), o = occlusion();
  const oL = o.l * w, oR = o.r * w, oT = o.t * h, oB = o.b * h;
  const visW = w - oL - oR, visH = h - oT - oB;
  // the map may slide under the panel, but never leave the visible part empty
  const cx = visW >= MAP_W ? MAP_W / 2 + w / 2 - oL - visW / 2 : Math.min(Math.max(c.cx, w / 2 - oL), MAP_W - w / 2 + oR);
  const cy = visH >= MAP_H ? MAP_H / 2 + h / 2 - oT - visH / 2 : Math.min(Math.max(c.cy, h / 2 - oT), MAP_H - h / 2 + oB);
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
  apply();
}

// Glide to a map point at a readable zoom (used after each step and in the trip view).
export function follow(x, y, h = H_FOLLOW) {
  if (!svg || !isPhone()) return;
  // keep a closer zoom if the participant chose one, otherwise come in to the readable zoom
  // in landscape the screen is wide: also cap the visible width at about 640 map units
  const nh = Math.min(cam.h, h, 640 / aspect()), w = nh * aspect(), o = occlusion();
  // put the place in the middle of the part of the map that is not under a panel
  const fx = o.l + (1 - o.l - o.r) / 2, fy = o.t + (1 - o.t - o.b) / 2;
  glide({ cx: x - (fx - 0.5) * w, cy: y - (fy - 0.5) * nh, h: nh });
}

// After a panel closes: slide back inside the map if the view hung under the panel.
export function settle() { if (svg && isPhone()) glide({ ...cam }, 300); }

export function whole() { if (svg && isPhone()) glide({ cx: MAP_W / 2, cy: MAP_H / 2, h: hWhole() }); }

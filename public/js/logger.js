// Anonymous event log. No names, no free identifiers: a random session id,
// timestamps, the variant, and what the participant did.
import { CONFIG } from './config.js';

let t0 = performance.now();
// After a resume, keep event times growing from where the previous page stopped.
export function continueClock(lastT) { t0 = performance.now() - lastT - 1000; }

// Coarse device profile for interpreting results (no full user-agent string,
// nothing precise enough to fingerprint a device).
export function viewport() {
  return { w: window.innerWidth, h: window.innerHeight, orientation: window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait' };
}
function deviceProfile() {
  const ua = navigator.userAgent;
  const touch = (navigator.maxTouchPoints || 0) > 0;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches || false;
  const ipadOS = /Macintosh/.test(ua) && touch;          // iPads report themselves as Macs
  const os = /iPhone|iPod/.test(ua) ? 'iOS' : /iPad/.test(ua) || ipadOS ? 'iPadOS' : /Android/.test(ua) ? 'Android'
    : /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /Linux|CrOS/.test(ua) ? 'Linux' : 'other';
  const browser = /SamsungBrowser/.test(ua) ? 'Samsung' : /EdgA?\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome'
    : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'other';
  const shortSide = Math.min(screen.width, screen.height);
  const cls = (os === 'iPadOS' || (os === 'Android' && !/Mobile/.test(ua))) ? 'tablet'
    : (coarse && shortSide < 600) || /Mobi|iPhone/.test(ua) ? 'phone' : 'desktop';
  return { class: cls, os, browser, touch, pointer: coarse ? 'coarse' : 'fine',
    dpr: Math.round((window.devicePixelRatio || 1) * 10) / 10, start: viewport() };
}

// Short participant code, shown to the participant so they can ask to withdraw.
// No 0/O/1/I to avoid misreading.
function shortCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(6)) : Array.from({ length: 6 }, () => Math.random() * 256);
  return 'EC-' + Array.from(r, x => A[x % A.length]).join('');
}
export const session = {
  id: (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)),
  code: shortCode(),
  round: CONFIG.STUDY_ROUND,
  version: CONFIG.VERSION,
  startedAt: new Date().toISOString(),
  userAgent: navigator.userAgent.includes('Mobi') ? 'mobile' : 'desktop',
  screen: `${window.innerWidth}x${window.innerHeight}`,
  device: deviceProfile(),
  variant: {},
  events: [],
  answers: null,
  sent: false,
};

export function log(type, data = {}) {
  session.events.push({ t: Math.round(performance.now() - t0), type, ...data });
  try { sessionStorage.setItem('ec-log', JSON.stringify(session)); } catch (e) { /* storage may be blocked */ }
}

export async function send(reason) {
  log('send', { reason });
  const body = JSON.stringify(session);
  if (!CONFIG.LOG_ENDPOINT) return false;
  try {
    if (reason === 'unload' && navigator.sendBeacon) {
      return navigator.sendBeacon(CONFIG.LOG_ENDPOINT, new Blob([body], { type: 'application/json' }));
    }
    const res = await fetch(CONFIG.LOG_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    session.sent = res.ok;
    return res.ok;
  } catch (e) { return false; }
}

export function download() {
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `exchange-companion-${session.id.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

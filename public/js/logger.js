// Anonymous event log. No names, no free identifiers: a random session id,
// timestamps, the variant, and what the participant did.
import { CONFIG } from './config.js';

const t0 = performance.now();
export const session = {
  id: (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)),
  round: CONFIG.STUDY_ROUND,
  startedAt: new Date().toISOString(),
  userAgent: navigator.userAgent.includes('Mobi') ? 'mobile' : 'desktop',
  screen: `${window.innerWidth}x${window.innerHeight}`,
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

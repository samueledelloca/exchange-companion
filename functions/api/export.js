// Cloudflare Pages Function: download the study data, protected by a key.
//
//   /api/export?key=KEY                     sessions.csv (one row per participant)
//   /api/export?key=KEY&file=events         events.csv (one row per event)
//   /api/export?key=KEY&file=jsonl          last snapshot per session, as JSON lines
//   &round=class-2026-11-26                 only one study round (any file)
//
// KEY is the Pages secret EXPORT_KEY (wrangler pages secret put EXPORT_KEY). Without it the
// endpoint does not exist. The CSV columns are the same as scripts/to_csv.py (keep them in sync).

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key') || (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.EXPORT_KEY || !(await same(key, env.EXPORT_KEY))) return new Response('Not found', { status: 404 });
  const round = url.searchParams.get('round');
  const file = url.searchParams.get('file') || 'sessions';
  const where = round ? 'WHERE round = ?1' : '';
  const stmt = env.DB.prepare(`SELECT payload FROM snapshots WHERE id IN (SELECT MAX(id) FROM snapshots ${where} GROUP BY session_id) ORDER BY id`);
  const { results } = await (round ? stmt.bind(round) : stmt).all();
  const recs = results.map(r => JSON.parse(r.payload));
  const tag = (round || 'all') + '-' + new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
  if (file === 'jsonl') {
    return new Response(recs.map(r => JSON.stringify(r)).join('\n') + '\n', {
      headers: { ...headers, 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Content-Disposition': `attachment; filename="sessions-${tag}.jsonl"` },
    });
  }
  const body = file === 'events' ? eventsCsv(recs) : sessionsCsv(recs);
  return new Response(body, {
    headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${file === 'events' ? 'events' : 'sessions'}-${tag}.csv"` },
  });
}

async function same(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([a, b].map(s => crypto.subtle.digest('SHA-256', enc.encode(String(s)))));
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let d = 0; for (let i = 0; i < u.length; i++) d |= u[i] ^ v[i];
  return d === 0;
}

// ---- CSV, written to match scripts/to_csv.py cell by cell -------------------------------

const TAILORED = ['map_where', 'next_step', 'buddy_pleasant', 'buddy_annoy', 'costs_clear', 'trips_useful'];
const ABOUT = ['screen', 'age', 'region', 'occupation', 'field'];
const CORE = ['type', 't', 'step', 'scene', 'choice'];

const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
const get = (o, k, d = '') => (has(o, k) ? o[k] : d);
const first = (ev, kind) => ev.find(e => e.type === kind) || {};
const count = (ev, kind) => ev.filter(e => e.type === kind).length;
const mean = xs => xs.reduce((s, x) => s + x, 0) / xs.length;
const r3 = x => Math.round(x * 1000) / 1000;
// tenths of a second, half up (same integer rule as to_csv.py)
const round1 = ms => (Math.floor((ms + 50) / 100) / 10).toFixed(1);

// Python's json.dumps style (", " and ": "), so the JSON columns match the Python export.
function pyJson(v, ascii) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') {
    let s = JSON.stringify(v);
    if (ascii) s = s.replace(/[\u007f-￿]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
    return s;
  }
  if (typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(x => pyJson(x, ascii)).join(', ') + ']';
  return '{' + Object.entries(v).map(([k, x]) => pyJson(k, ascii) + ': ' + pyJson(x, ascii)).join(', ') + '}';
}

function cell(v) {
  if (v === null || v === undefined) return '';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'object') return pyJson(v, false);
  const s = String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
const csv = rows => '﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n';

function ueq(a) {
  const vals = [...Array(8)].map((_, i) => { const v = get(a, `ueq${i}`, null); return v === null || v === '' ? null : parseInt(v, 10) - 4; });
  const prag = vals.slice(0, 4).filter(v => v !== null), hed = vals.slice(4).filter(v => v !== null);
  return [vals, prag.length === 4 ? r3(mean(prag)) : '', hed.length === 4 ? r3(mean(hed)) : ''];
}

function sorted(recs) {
  return [...recs].sort((x, y) => { const a = get(x, 'startedAt'), b = get(y, 'startedAt'); return a < b ? -1 : a > b ? 1 : 0; });
}

export function sessionsCsv(recs) {
  const rows = sorted(recs).map(r => {
    const ev = r.events || [], a = r.answers || {}, v = r.variant || {}, dev = r.device || {};
    const prof = first(ev, 'profile'), end = first(ev, 'end'), tut = first(ev, 'tutorial');
    let probs = end.problems && end.problems.length ? end.problems
      : ev.filter(e => e.type === 'problem').map(e => ({ id: e.id ?? null, cause: get(e, 'cause', 'choice') }));
    probs = probs.map(p => (p && typeof p === 'object' ? p : { id: p, cause: '' }));
    const [items, prag, hed] = ueq(a);
    const row = {
      id: r.id ?? null, code: get(r, 'code'), round: get(r, 'round'), version: get(r, 'version'),
      started_at: get(r, 'startedAt'), last_saved: get(r, '_server_time'),
      device: get(dev, 'class', get(r, 'userAgent')), screen_size: get(r, 'screen'),
      os: get(dev, 'os'), browser: get(dev, 'browser'), touch: get(dev, 'touch'), dpr: get(dev, 'dpr'),
      orientation_start: get(dev.start || {}, 'orientation'),
      viewport_end: end.viewport ? `${end.viewport.w}x${end.viewport.h}` : '',
      orientation_changes: count(ev, 'viewport'),
      buddy: get(v, 'buddy'), tips: get(v, 'tips'), seed: get(v, 'seed'),
      status_style: pyJson(get(v, 'statusStyle', {}), true),
      persona: get(prof, 'preset'), origin: get(prof, 'origin'), visa_needed: get(prof, 'visa'), stay: get(prof, 'stay'), abroad_before: get(prof, 'abroad'),
      tutorial_skipped: get(tut, 'skipped'), tutorial_s: has(tut, 'ms') ? round1(tut.ms) : '',
      reached_end: Object.keys(end).length > 0, ended_early: get(end, 'early'), questionnaire_sent: Object.keys(a).length > 0,
      steps_done: get(end, 'done'), steps_total: get(end, 'total'), sim_day: get(end, 'day'),
      total_chf: get(end, 'totalCHF'), surprise_chf: get(end, 'surpriseCHF'),
      problems: probs.length, problem_types: new Set(probs.map(p => p.id)).size,
      problems_choice: probs.filter(p => p.cause === 'choice').length,
      problems_random: probs.filter(p => p.cause === 'random').length,
      problems_forced: probs.filter(p => p.cause === 'forced').length,
      problem_ids: probs.map(p => p.id).join(' '),
      why_answers: count(ev, 'why'),
      next_step_q: ev.filter(e => e.type === 'next_step_q').map(e => `${e.step ?? 'None'}:${e.style ?? 'None'}:${e.answer ?? 'None'}`).join(' '),
      tips_opened: count(ev, 'tips_open'), trips_viewed: count(ev, 'trip_view'), memes_shown: count(ev, 'meme_shown'), resumed: count(ev, 'resume'),
      events: ev.length, duration_s: ev.length ? Math.round(ev[ev.length - 1].t / 1000) : '',
      share_trip: get(a, 'shareTrip'),
    };
    for (const k of ABOUT) row[k] = get(a, k);
    items.forEach((val, i) => { row[`ueq${i + 1}`] = val === null ? '' : val; });
    row.ueq_pragmatic = prag; row.ueq_hedonic = hed;
    for (const k of TAILORED) row[k] = get(a, k);
    row.open_change = get(a, 'open_change'); row.open_like = get(a, 'open_like');
    return row;
  });
  const cols = rows.length ? Object.keys(rows[0]) : ['id'];
  return csv([cols, ...rows.map(r => cols.map(c => r[c]))]);
}

export function eventsCsv(recs) {
  const out = [['session_id', 'code', 'round', 't_ms', 'type', 'step', 'scene', 'choice', 'details']];
  for (const r of sorted(recs)) {
    for (const e of r.events || []) {
      const rest = Object.fromEntries(Object.entries(e).filter(([k]) => !CORE.includes(k)));
      out.push([r.id ?? null, get(r, 'code'), get(r, 'round'), e.t ?? null, e.type ?? null, get(e, 'step'), get(e, 'scene'), get(e, 'choice'),
        Object.keys(rest).length ? pyJson(rest, false) : '']);
    }
  }
  return csv(out);
}

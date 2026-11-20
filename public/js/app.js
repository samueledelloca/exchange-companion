// Exchange Companion: game engine, screens, buddy, logging hooks.
import { BUDDY, AREAS, PLACES, HOMES, STEPS, TIPS, TRIPS, PRESETS, MEMES, WHY_CHIPS, UEQS, TAILORED } from './content.js';
import { CONFIG } from './config.js';
import { session, log, send, download, continueClock, viewport } from './logger.js';
import { baseMap, drawMap, drawAvatar, drawTrail, statusText } from './map.js';
import { initCamera, follow, settle, deskReveal, isPhone } from './camera.js';
import { playArrival } from './arrival.js';

const $ = (sel, root = document) => root.querySelector(sel);
const app = $('#app');
const params = new URLSearchParams(location.search);
const DEBUG = params.has('debug');

// ---------- randomness (seeded, so a session can be replayed) ----------
// A game in progress is kept in this tab (sessionStorage), so an accidental
// reload can continue the same session instead of starting over.
const SAVE_KEY = 'ec-game';
let saved = null;
try { saved = JSON.parse(sessionStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { saved = null; }
const seed = saved?.seed || Number(params.get('seed')) || Math.floor(Math.random() * 2 ** 31);
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rawRng = mulberry32(seed);
let rngCalls = 0;
const rng = () => { rngCalls++; return rawRng(); };
const pick = arr => arr[Math.floor(rng() * arr.length)];

// ---------- variants ----------
for (const [k, opts] of Object.entries(CONFIG.VARIANTS)) {
  session.variant[k] = opts.includes(params.get(k)) ? params.get(k) : pick(opts);
}
session.variant.seed = seed;
const playful = () => session.variant.buddy === 'playful';

// ---------- state ----------
const s = {
  consent: false, profile: null, steps: {}, flags: {}, day: -35, costs: [], problems: [],
  counters: {}, waits: {}, statusStyle: {}, next: null, place: 'laptop', why: 0, finished: false, shareTrip: false,
};
const byId = id => STEPS.find(x => x.id === id);
const visible = st => !st.when || st.when(s);
const satisfied = id => { const st = byId(id); return !st || !visible(st) || s.steps[id]?.status === 'done'; };

function refresh() {
  // your mailbox is wherever you live
  const h = HOMES[s.flags.housing];
  if (h) Object.assign(PLACES.home2, { x: h.x, y: h.y, label: h.home2 });
  for (const st of STEPS) {
    const cur = s.steps[st.id] || (s.steps[st.id] = { status: 'locked' });
    if (cur.status === 'locked' || cur.status === 'open') cur.status = st.requires.every(satisfied) ? 'open' : 'locked';
  }
  const order = ['action', 'later', 'open'];
  s.next = null;
  for (const want of order) {
    const hit = STEPS.find(st => visible(st) && s.steps[st.id].status === want && (st.mandatory || st.final));
    if (hit) { s.next = hit.id; break; }
  }
}

// ---------- scene context ----------
const ctx = {
  s, rng,
  set: (k, v) => { s.flags[k] = v; },
  flags: k => s.flags[k],
  cost: (chf, why, kind = 'surprise') => { if (chf > 0) { s.costs.push({ chf, why, kind, day: s.day }); log('cost', { chf, why, kind }); } },
  spend: (chf, why) => ctx.cost(chf, why, 'planned'),
  days: n => { s.day += n; },
  problem: (id, cause = 'choice') => { s.problems.push({ id, cause }); log('problem', { id, cause }); },
  count: k => { s.counters[k] = (s.counters[k] || 0) + 1; },
  openTrips: () => setTimeout(openTrips, 400),
  statusScene: ({ rich, bare, actions = [] }) => ({ statusScene: true, rich, bare, actions }),
  log: (type, data) => log(type, data),
  left: () => STEPS.filter(st => visible(st) && !st.final && s.steps[st.id]?.status !== 'done'),
};

// ---------- screens ----------
function screen(html, cls = '') { app.className = `screen ${cls}`; app.innerHTML = html; window.scrollTo(0, 0); const h = app.querySelector('h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }

function buddySvg(size = 120, glasses = playful()) {
  return `<svg class="buddy-svg" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
    <path d="M22 44 L30 10 L52 32 Z" fill="#8C96A8"/><path d="M98 44 L90 10 L68 32 Z" fill="#8C96A8"/>
    <path d="M28 40 L32 20 L45 33 Z" fill="#F2B8B5"/><path d="M92 40 L88 20 L75 33 Z" fill="#F2B8B5"/>
    <ellipse cx="60" cy="66" rx="44" ry="40" fill="#A6AFBF"/>
    <ellipse cx="60" cy="80" rx="24" ry="18" fill="#E8ECF2"/>
    ${glasses
      ? '<g><rect x="26" y="52" width="28" height="15" rx="4" fill="#172031"/><rect x="66" y="52" width="28" height="15" rx="4" fill="#172031"/><rect x="52" y="56" width="16" height="4" fill="#172031"/><rect x="30" y="55" width="7" height="3" fill="#fff" opacity=".6"/><rect x="70" y="55" width="7" height="3" fill="#fff" opacity=".6"/></g>'
      : '<g fill="#172031"><ellipse cx="42" cy="60" rx="6" ry="7"/><ellipse cx="78" cy="60" rx="6" ry="7"/><circle cx="44" cy="58" r="2" fill="#fff"/><circle cx="80" cy="58" r="2" fill="#fff"/></g>'}
    <path d="M55 74 L65 74 L60 80 Z" fill="#E58A8A"/>
    <path d="M60 80 q-6 8 -13 4 M60 80 q6 8 13 4" stroke="#172031" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <g stroke="#6E788A" stroke-width="2" stroke-linecap="round"><path d="M20 72 H38"/><path d="M22 80 L38 77"/><path d="M100 72 H82"/><path d="M98 80 L82 77"/></g>
  </svg>`;
}

function intro() {
  screen(`
    <main class="intro card-screen">
      <div class="buddy-hero">${buddySvg(150)}</div>
      <h1>Ciao! I'm ${BUDDY.name}, your exchange companion.</h1>
      <p class="lead">This is a role-play. In the next 5 to 10 minutes you <b>play the part of an exchange student</b> coming to USI, in Lugano: you pick a character, then do their paperwork, find them a room, pick their courses and settle in. I come along.</p>
      <p>Everything is simulated and simplified, but the problems along the way are ones real exchange students run into.</p>
      ${isPhone() && innerHeight > innerWidth ? '<p class="muted small">📱↻ On a phone the map is wider if you turn it sideways.</p>' : ''}
      <button class="btn primary" id="go">Sounds good, what's next?</button>
    </main>`, 'center');
  $('#go').onclick = consent;
}

function consent() {
  screen(`
    <main class="consent card-screen">
      <div class="buddy-row">${buddySvg(72)}<p class="bubble">Before I pack your bags, a short and slightly boring ethics bit. I promise it's the only boring part.</p></div>
      <h1>What we record</h1>
      <ul class="plain">
        <li>What you click, the choices you make and how long each step takes.</li>
        <li>Now and then, why you chose something (always optional).</li>
        <li>Your answers to a short questionnaire at the end, with a few optional questions about you in broad categories (age range, region, field).</li>
        <li>No name, no email, nothing that identifies you.</li>
        <li>You can stop at any moment, just close the page. You can also ask us to delete your data later.</li>
      </ul>
      <details>
        <summary>Read the boring details</summary>
        <p>This prototype is part of a student project in the UX Design course at USI (Università della Svizzera italiana). We use the data only to evaluate and improve the design, and report it only in aggregate form in our course reports. We do not store your IP address in the results. The data is kept until the course ends and then deleted. Participation is voluntary and you must be 18 or older.</p>
        <p><b>Your participant code is ${session.code}.</b> You will see it again at the end and under "My steps". If you change your mind, even after finishing, email <a href="mailto:${CONFIG.CONTACT_EMAIL}?subject=Exchange%20Companion%20withdrawal%20${session.code}">${CONFIG.CONTACT_EMAIL}</a> with this code and we will delete your data. Questions go to the same address (${CONFIG.CONTACT}).</p>
      </details>
      <div class="actions">
        <button class="btn primary" id="yes">I accept, let's go</button>
        <button class="btn ghost" id="no">No thanks</button>
      </div>
    </main>`, 'center');
  $('#yes').onclick = () => { s.consent = true; log('consent', { accepted: true, variant: session.variant }); profile(); };
  $('#no').onclick = () => screen(`<main class="card-screen"><div class="buddy-hero">${buddySvg(110)}</div><h1>No problem.</h1><p>Nothing was recorded. You can close this page.</p></main>`, 'center');
}

function profile() {
  screen(`
    <main class="profile card-screen wide">
      <h1>Who will you play?</h1>
      <p class="lead">For the next few minutes you play an exchange student. Make one like you, or play one of ours: their situation changes the path, so decide as you think they would.</p>
      <section class="own-card">
        <button class="own-toggle" id="ownToggle" type="button" aria-expanded="false" aria-controls="ownForm">
          <span class="own-icon" aria-hidden="true"><svg viewBox="0 0 48 48" width="44" height="44"><circle cx="20" cy="16" r="8" fill="#2552B0"/><path d="M5 40c1.5-8.5 7.6-13 15-13s10 2.4 12.2 6" fill="#2552B0"/><g transform="translate(30 25) rotate(45)"><rect x="-3" y="-11" width="6" height="18" rx="1.5" fill="#F2B705" stroke="#172031" stroke-width="1.5"/><path d="M-3 7 L0 12 L3 7 Z" fill="#172031"/></g></svg></span>
          <span class="own-text"><b>Create your own student</b><span>Choose where you come from, how long you stay and whether you have lived abroad. The closest to your own situation.</span></span>
          <span class="own-chev" aria-hidden="true">›</span>
        </button>
        <form id="ownForm" hidden>
          <fieldset><legend>Where are you from?</legend>
            <label><input type="radio" name="origin" value="eu" checked> EU or EFTA country</label>
            <label><input type="radio" name="origin" value="noneu"> Outside the EU and EFTA, I need a visa</label>
            <label><input type="radio" name="origin" value="noneu-novisa"> Outside the EU and EFTA, no visa needed (for example Singapore, Japan, Australia, UK)</label></fieldset>
          <fieldset><legend>How long do you stay?</legend>
            <label><input type="radio" name="stay" value="semester" checked> One semester</label>
            <label><input type="radio" name="stay" value="year"> A full year</label></fieldset>
          <fieldset><legend>Have you lived abroad before?</legend>
            <label><input type="radio" name="abroad" value="no" checked> No, first time</label>
            <label><input type="radio" name="abroad" value="yes"> Yes</label></fieldset>
          <button class="btn primary" type="submit">Start with this student</button>
        </form>
      </section>
      <p class="or-line"><span>or play one of our students</span></p>
      <div class="presets">
        ${PRESETS.map(p => `<button class="preset" data-id="${p.id}"><span class="flag">${p.flag}</span><b>${p.name}</b><span>${p.blurb}</span></button>`).join('')}
      </div>
    </main>`, 'center');
  app.querySelectorAll('.preset').forEach(b => b.onclick = () => {
    const p = PRESETS.find(x => x.id === b.dataset.id);
    startGame({ preset: p.id, name: p.name, flag: p.flag, origin: p.origin, stay: p.stay, abroad: p.abroad });
  });
  $('#ownToggle').onclick = () => {
    const f = $('#ownForm'), open = f.hidden;
    f.hidden = !open; $('#ownToggle').setAttribute('aria-expanded', String(open));
    if (open) { log('custom_open'); f.querySelector('input').focus(); }
  };
  $('#ownForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const o = f.get('origin'), origin = o === 'eu' ? 'eu' : 'noneu';
    startGame({ preset: 'custom', name: 'You', flag: origin === 'eu' ? '🇪🇺' : '🌏', origin, visa: o === 'noneu', stay: f.get('stay'), abroad: f.get('abroad') === 'yes' });
  };
}

function startGame(p) {
  s.profile = p;
  if (p.visa === undefined) p.visa = p.origin === 'noneu';
  log('profile', { preset: p.preset, origin: p.origin, visa: p.visa, stay: p.stay, abroad: p.abroad });
  refresh();
  // Within-run variant: status style balanced across the waiting procedures.
  const waitIds = STEPS.filter(st => st.waitSteps && visible(st)).map(st => st.id);
  let style = rng() < 0.5 ? 'rich' : 'bare';
  for (const id of waitIds) { s.statusStyle[id] = style; style = style === 'rich' ? 'bare' : 'rich'; }
  session.variant.statusStyle = { ...s.statusStyle };
  log('variant', { ...session.variant });
  mapScreen();
  tutorial();
}

// ---------- the map screen ----------
function weekLabel() {
  const w = Math.floor(s.day / 7);
  if (s.day < 0) { const n = Math.ceil(-s.day / 7); return `${n} week${n > 1 ? 's' : ''} before semester`; }
  return `Semester week ${w + 1}`;
}
const extra = () => s.costs.filter(c => c.kind === 'surprise').reduce((a, c) => a + c.chf, 0);
const total = () => s.costs.reduce((a, c) => a + c.chf, 0);
const chf = n => `${n.toLocaleString('de-CH')} CHF`;

function mapScreen() {
  screen(`
    <header class="topbar">
      <div class="brand">${buddySvg(30)}<span>Exchange Companion</span></div>
      <div class="hud">
        <button class="chip role" id="btn-role" title="Who you are playing: tap for details">${s.profile.flag} <span class="rl">You play </span><b>${s.profile.preset === 'custom' ? 'your student' : s.profile.name}</b></button>
        <span class="chip clock" title="Simulated time" aria-live="polite">📅 <span id="week"></span></span>
        <button class="chip costs" id="btn-costs" title="Your budget: open the breakdown">💸 <span id="cost"></span></button>
        <span class="stamps" id="stamps" aria-label="Area stamps"></span>
      </div>
      <nav class="tools">
        <button class="btn small legend-btn" id="btn-legend" aria-label="What the map symbols mean" title="What the map symbols mean">?</button>
        <button class="btn small" id="btn-steps">My steps</button>
        <button class="btn small" id="btn-trips">Others' trips</button>
        <button class="btn small ghost" id="btn-end">End</button>
      </nav>
    </header>
    <main class="mapwrap">
      <h1 class="sr-only">Your exchange map</h1>
      <svg id="map" viewBox="0 0 1000 620" role="group" aria-label="Map of your exchange">${baseMap()}</svg>
      <div class="legend" aria-hidden="true"><span><i class="ln next"></i>suggested next</span><span><i class="ln"></i>also open now</span><span><i class="ln done"></i>walked</span><span><i class="b done">✓</i>done</span><span><i class="b waiting">⏳</i>waiting</span><span><i class="b action">!</i>action needed</span><span><i class="b locked">🔒</i>locked</span></div>
      <div class="trip-banner" id="tripBanner" hidden></div>
    </main>
    <aside class="panel" id="panel" aria-live="polite" hidden></aside>
    <div class="buddy-dock" id="dock">
      <button class="buddy-btn" id="buddyBtn" aria-label="${BUDDY.name}, your companion">${buddySvg(64)}</button>
      <div class="bubble dock-bubble" id="bubble" hidden></div>
    </div>
    <div class="modal" id="modal" hidden></div>
    ${DEBUG ? `<div class="debug">buddy=${session.variant.buddy} tips=${session.variant.tips} status=${JSON.stringify(s.statusStyle)} seed=${seed}</div>` : ''}
  `, 'game');
  $('#btn-steps').onclick = openList;
  $('#btn-legend').onclick = openLegend;
  $('#btn-role').onclick = openRole;
  $('#btn-trips').onclick = openTrips;
  $('#btn-end').onclick = confirmEnd;
  $('#btn-costs').onclick = openCosts;
  $('#buddyBtn').onclick = () => { log('buddy_click'); hint(true); };
  lastFocus = null;
  initCamera($('#map'), $('.mapwrap'), (type, data) => log(type, data));
  redraw();
}

function saveGame() {
  try { sessionStorage.setItem(SAVE_KEY, JSON.stringify({ seed, rngCalls, s })); } catch (e) { /* storage may be blocked */ }
}

function redraw() {
  refresh();
  saveGame();
  const svg = $('#map');
  drawMap(svg, STEPS, s, visible, openStep);
  // the moment everything before departure is done: travelling becomes possible
  const ready = s.steps.arrive?.status === 'open';
  if (wasLocked === false && ready) {
    log('ready_to_travel', { day: s.day });
    setTimeout(() => say(`🧳 <b>Everything before departure is done.</b> Time to travel: Lugano is waiting, start at the station.`, 9000), 700);
  }
  wasLocked = !ready && s.steps.arrive?.status !== 'done' ? false : true;
  drawAvatar(svg, s.place, s.profile.flag);
  focusMap();
  $('#week').textContent = weekLabel();
  if (shownDay !== null && s.day > shownDay) tickClock(s.day - shownDay);
  shownDay = s.day;
  $('#cost').innerHTML = `<b>${chf(total())}</b><span class="lbl"> spent</span>${extra() ? ` <span class="surp">incl. ${chf(extra())} surprises</span>` : ''}`;
  if (shownCost !== null && total() > shownCost) tickChip('.costs', `+${chf(total() - shownCost)}`);
  shownCost = total();
  $('#stamps').innerHTML = Object.entries(AREAS).map(([k, a]) => {
    const got = areaDone(k);
    const fresh = got && !shownStamps.has(k);
    if (got) shownStamps.add(k);
    return `<span class="stamp ${got ? 'got' : ''} ${fresh ? 'fresh' : ''}" style="--area:${a.color}" title="${a.label}${got ? ': complete' : ''}">${a.stamp}</span>`;
  }).join('');
}

// Make the passing of simulated time visible: the calendar chip flashes and
// shows how much time went by.
let shownDay = null;
let wasLocked = null;
let shownCost = null;
const shownStamps = new Set();
const fmtDays = n => n >= 7 ? `${Math.round(n / 7)} week${Math.round(n / 7) > 1 ? 's' : ''}` : `${n} day${n > 1 ? 's' : ''}`;
function tickClock(n) { tickChip('.clock', `+${fmtDays(n)}`); }
function tickChip(sel, label) {
  const chip = $(sel); if (!chip) return;
  chip.classList.remove('tick'); void chip.offsetWidth; chip.classList.add('tick');
  chip.querySelector('.dayfloat')?.remove();
  const f = document.createElement('span');
  f.className = 'dayfloat'; f.textContent = label;
  chip.appendChild(f);
  setTimeout(() => f.remove(), 1800);
}

// On narrow screens the map scrolls sideways: keep the next step in view.
// Phones: glide to the suggested step whenever the suggestion or your position changes.
let lastFocus = null;
function focusMap(force = false) {
  if (!isPhone() || $('#map')?.classList.contains('viewing-trip')) return;
  const key = `${s.next}|${s.place}`;
  if (!force && key === lastFocus) return;
  lastFocus = key;
  const target = PLACES[(s.next && byId(s.next).place) || s.place];
  follow(target.x, target.y);
}

function areaDone(area) {
  const list = STEPS.filter(st => st.area === area && visible(st) && st.mandatory);
  return list.length > 0 && list.every(st => s.steps[st.id].status === 'done');
}

// ---------- buddy ----------
let bubbleTimer;
function say(html, ms = 7000) {
  const b = $('#bubble'); if (!b) return;
  b.innerHTML = `${html}<button class="x" aria-label="Close">×</button>`;
  b.hidden = false;
  b.querySelector('.x').onclick = () => { b.hidden = true; log('buddy_dismiss'); };
  clearTimeout(bubbleTimer);
  if (ms) bubbleTimer = setTimeout(() => { b.hidden = true; }, ms);
}
function hint(manual = false) {
  refresh();
  const st = s.next && byId(s.next);
  if (!st) return;
  const status = s.steps[st.id].status;
  const why = status === 'action' ? 'Something arrived for you.' : status === 'later' ? 'You postponed this one.' : '';
  say(`${why} I suggest: <b>${st.title}</b>${st.title.includes(PLACES[st.place].label) ? '' : ` at ${PLACES[st.place].label}`}. <button class="btn-link" data-go="${st.id}">Take me there</button>`, manual ? 9000 : 6000);
  const go = $('#bubble [data-go]'); if (go) go.onclick = () => { $('#bubble').hidden = true; openStep(st.id); };
}

// ---------- tutorial ----------
function tutorial() {
  const first = s.next;
  const steps = [
    { sel: '.chip.role', text: s.profile.preset === 'custom'
        ? 'You are now playing the student you made. Decide as you think they would. You can always see who you play up here.'
        : `You are <b>${s.profile.name}</b> now: ${(PRESETS.find(p => p.id === s.profile.preset)?.blurb || '').replace(/^./, c => c.toLowerCase())} Decide as you think ${s.profile.name} would. You can always see who you play up here.` },
    { sel: '#map', text: `This is your exchange, as a map. Home is on the left: everything before departure. Lugano, on the right, opens once that is done and you can travel. Your trip ends on Monte Brè, the mountain by the lake, once you are settled in.${isPhone() ? ' Pinch to zoom and drag to move around, like any map.' : ''}${isPhone() && innerHeight > innerWidth ? ' Tip: turn your phone sideways for a wider map.' : ''}` },
    { sel: `[data-step="${first}"]`, text: 'The place marked <b>Suggested</b> is what I would do next. Places with a soft halo and a light blue path are open too: do them in any order you like. Locked places open when the steps before them are done, just like in real life: no address, no registration.' },
    { id: 'legend', sel: isPhone() ? '#btn-legend' : '.legend', text: `${isPhone() ? 'What the map shows (tap <b>?</b> any time to see it again):' : 'The legend down here explains the map:'}
        <span class="tlegend"><span><i class="ln next"></i>suggested next</span><span><i class="ln"></i>also open now</span><span><i class="ln done"></i>walked</span>
        <span><i class="b done">✓</i>done</span><span><i class="b waiting">⏳</i>waiting</span><span><i class="b action">!</i>action needed</span><span><i class="b locked">🔒</i>locked</span></span>` },
    { sel: '.hud', text: 'Keep an eye up here. The calendar moves on with every step. Your budget counts what the exchange costs you, and mistakes add surprises. Each finished area earns you a stamp.' },
    { sel: '#btn-steps', text: 'Prefer a list to a map? All your steps are here too.' },
    { sel: '#btn-trips', text: 'Curious how others did it? Peek at the trips of past students.' },
    { sel: '#btn-end', text: 'You can stop whenever you like. Ready? Your first step is glowing.' },
  ];
  // students who lived abroad skip the badge card (they get the rest)
  if (s.profile.abroad && !isPhone()) steps.splice(steps.findIndex(x => x.id === 'legend'), 1);
  let i = 0;
  const tStart = performance.now();
  const ov = document.createElement('div');
  ov.className = 'tour'; document.body.appendChild(ov);
  // Put the card next to the element it talks about, with an arrow pointing to it.
  const place = target => {
    const card = ov.querySelector('.tour-card');
    // visualViewport excludes the browser toolbars (iOS Safari and Chrome).
    const vw = innerWidth, vh = window.visualViewport?.height || innerHeight, cw = card.offsetWidth, ch = card.offsetHeight;
    const bottomCentre = () => { card.style.left = `${(vw - cw) / 2}px`; card.style.top = `${Math.max(12, vh - ch - 16)}px`; };
    // On phones the bottom belongs to the browser toolbar: put the card under the top bar.
    if (vw <= 720) { card.style.left = `${(vw - cw) / 2}px`; card.style.top = `${($('.topbar')?.getBoundingClientRect().bottom || 0) + 10}px`; return; }
    if (!target) return bottomCentre();
    const r = target.getBoundingClientRect();
    if (r.height > vh * 0.5) return bottomCentre();
    let top;
    if (r.bottom + 16 + ch < vh - 12) { top = r.bottom + 16; card.classList.add('below'); }
    else if (r.top - 16 - ch > 12) { top = r.top - 16 - ch; card.classList.add('above'); }
    else return bottomCentre();
    const left = Math.min(Math.max(16, r.left + r.width / 2 - cw / 2), vw - cw - 16);
    card.style.setProperty('--ax', `${Math.min(Math.max(24, r.left + r.width / 2 - left), cw - 24)}px`);
    card.style.left = `${left}px`; card.style.top = `${top}px`;
  };
  const show = () => {
    document.querySelectorAll('.spot').forEach(n => n.classList.remove('spot'));
    const st = steps[i];
    const target = $(st.sel);
    if (target) target.classList.add('spot');
    ov.innerHTML = `<div class="tour-card" role="dialog" aria-label="Tutorial">
      <div class="buddy-row">${buddySvg(56)}<p>${st.text}</p></div>
      <div class="actions"><span class="muted">${i + 1} / ${steps.length}</span>
      <button class="btn ghost small" id="tSkip">Skip tour</button>
      <button class="btn primary small" id="tNext">${i === steps.length - 1 ? 'Let\'s go' : 'Next'}</button></div></div>`;
    place(target);
    $('#tNext', ov).onclick = () => { i++; if (i >= steps.length) end(false); else show(); };
    $('#tSkip', ov).onclick = () => end(true);
    $('#tNext', ov).focus();
  };
  const end = skipped => {
    document.querySelectorAll('.spot').forEach(n => n.classList.remove('spot'));
    ov.remove();
    log('tutorial', { skipped, atStep: i, ms: Math.round(performance.now() - tStart) });
    hint();
  };
  show();
}

// ---------- step panel ----------
let current = null; // { id, scene }
let dayAtOpen = null;
let costsAtOpen = null;
function openStep(id) {
  const st = byId(id); const status = s.steps[id].status;
  closeModal();
  const bub = $('#bubble'); if (bub) bub.hidden = true;
  if ($('#map')?.classList.contains('viewing-trip')) { drawTrail($('#map'), null); $('#tripBanner').hidden = true; tripButton(null); }
  log('open_step', { step: id, status });
  if (status !== 'done' && status !== 'locked' && current?.id !== id) { dayAtOpen = s.day; costsAtOpen = s.costs.length; }
  const panel = $('#panel'); panel.hidden = false;
  panel.style.setProperty('--area', AREAS[st.area].color);
  // phones: show the place in the part of the map the panel leaves visible
  setTimeout(() => (isPhone() ? follow : deskReveal)(PLACES[st.place].x, PLACES[st.place].y), 60);
  if (status === 'locked') {
    const miss = st.requires.filter(r => !satisfied(r)).map(r => byId(r).title);
    panelHtml(st, `<p>This path is still closed. First:</p><ul class="plain">${miss.map(m => `<li>${m}</li>`).join('')}</ul>`, [], 'locked');
    return;
  }
  if (status === 'done') {
    panelHtml(st, `<p>You already did this one. ✓</p>${tipsHtml(id)}`, [], 'done');
    return;
  }
  const scene = status === 'waiting' ? 'waiting' : status === 'action' ? 'ready' : status === 'later' ? 'later' : 'start';
  renderScene(id, scene);
}

function panelHtml(st, body, choices, status, extraCls = '') {
  const panel = $('#panel');
  panel.className = `panel ${extraCls}`;
  panel.innerHTML = `
    <div class="panel-head">
      <span class="area-chip">${AREAS[st.area].stamp} ${AREAS[st.area].label}</span>
      <button class="x" id="pClose" aria-label="Close panel">×</button>
    </div>
    <h2>${st.title}</h2>
    <p class="status-line"><span>${PLACES[st.place].icon} ${PLACES[st.place].label}</span>${status ? `<span class="st pill ${status}">${statusText(status)}</span>` : ''}</p>
    <div class="panel-body">${body}</div>
    <div class="choices">${choices.join('')}</div>`;
  $('#pClose').onclick = closePanel;
  const cc = panel.querySelector('[data-action="counter-card"]');
  if (cc) cc.onclick = counterCard;
  const firstBtn = panel.querySelector('.choices button, .choices input');
  (firstBtn || $('#pClose')).focus({ preventScroll: true });
}
function closePanel() { const p = $('#panel'); if (p) { p.hidden = true; } current = null; redraw(); settle(); if (playful() || !s.profile.abroad) hint(); }

function tipsHtml(key) {
  const list = TIPS[key]; if (!list) return '';
  const named = session.variant.tips === 'named';
  return `<details class="tips" data-tips="${key}"><summary>💬 Tips from past students (${list.length})</summary>
    ${list.map(t => `<blockquote>"${t.text}"<cite>${named ? `${t.who}, exchange student, ${t.when}` : 'A past exchange student'}</cite></blockquote>`).join('')}
    <p class="muted small">Example tips written for this prototype.</p></details>`;
}

function renderScene(id, sceneId) {
  const st = byId(id);
  // the journey: right after choosing how to travel, the arrival scene plays and
  // Lugano opens; only then does the panel ask what you do first
  if (id === 'arrive' && sceneId === 'arrived' && !s.flags.arrivalShown) {
    s.flags.arrivalShown = true; s.holdFog = true; saveGame();
    return playArrival(s.flags.travelMode, s.flags.travelVia).then(() => {
      s.holdFog = false; log('lugano_unlocked', { mode: s.flags.travelMode, day: s.day });
      redraw(); renderScene(id, sceneId);
    });
  }
  let sc = st.scenes[sceneId](ctx);
  if (sc.redirect) { sceneId = sc.redirect; sc = st.scenes[sceneId](ctx); }
  current = { id, scene: sceneId };
  const status = s.steps[id].status;
  if (sc.statusScene) return renderStatus(st, sc);
  const body = `${sc.mood === 'oops' ? '<div class="mood oops">😬 Problem</div>' : ''}<p>${sc.text}</p>${sc.tips ? tipsHtml(sc.tips) : ''}`;
  if (sc.multi) {
    const prev = sc.keep ? (s.flags[sc.keep] || []) : [];
    const items = sc.multi.map(m => `<label class="opt ${m.disabled ? 'disabled' : ''}"><input type="checkbox" value="${m.id}" ${m.disabled ? 'disabled' : ''} ${prev.includes(m.id) && !m.disabled ? 'checked' : ''}><span>${m.label}${m.hint ? `<small>${m.hint}</small>` : ''}</span></label>`);
    const tt = sc.timetable ? '<button class="btn-link" id="tt">Show my timetable</button><div id="ttBox" hidden></div>' : '';
    panelHtml(st, body, [`<fieldset class="multi"><legend class="sr-only">Options</legend>${items.join('')}</fieldset>${tt}<p class="err" id="err" role="alert"></p><button class="btn primary" id="submit">Confirm</button>`], status);
    if (sc.timetable) $('#tt').onclick = () => toggleTimetable(sc.multi);
    $('#submit').onclick = () => {
      const sel = [...document.querySelectorAll('#panel .multi input:checked')].map(i => i.value);
      log('multi', { step: id, scene: sceneId, selected: sel });
      const res = sc.submit(ctx, sel);
      if (res && res.error) { $('#err').textContent = res.error; return; }
      handle(id, res);
    };
    // track tip opening
    trackTips(id);
    return;
  }
  panelHtml(st, body, sc.choices.map(c => `<button class="btn choice" data-c="${c.id}">${c.label}</button>`), status, sc.mood === 'oops' ? 'oops' : '');
  trackTips(id);
  document.querySelectorAll('#panel [data-c]').forEach(b => b.onclick = () => {
    const c = sc.choices.find(x => x.id === b.dataset.c);
    log('choice', { step: id, scene: sceneId, choice: c.id });
    const res = c.go(ctx);
    if (sc.why && s.why < CONFIG.WHY_MAX && rng() < CONFIG.WHY_PROB) askWhy(st, c, () => handle(id, res));
    else handle(id, res);
  });
}

function trackTips(id) {
  document.querySelectorAll('#panel details.tips').forEach(d => d.addEventListener('toggle', () => { if (d.open) log('tips_open', { step: id, variant: session.variant.tips }); }));
}

function toggleTimetable(multi) {
  const box = $('#ttBox');
  const sel = [...document.querySelectorAll('#panel .multi input:checked')].map(i => i.value);
  const chosen = multi.filter(m => sel.includes(m.id));
  const slots = {};
  chosen.forEach(m => { const k = m.hint.split(',')[0]; (slots[k] = slots[k] || []).push(m.label); });
  box.hidden = false;
  box.innerHTML = chosen.length ? `<ul class="plain tt">${Object.entries(slots).map(([k, v]) => `<li class="${v.length > 1 ? 'clash' : ''}"><b>${k}</b>: ${v.join(' + ')}${v.length > 1 ? ' ⚠️ clash' : ''}</li>`).join('')}</ul>` : '<p class="muted">Tick some courses first.</p>';
  log('timetable_check', { selected: sel });
}

function renderStatus(st, sc) {
  const style = s.statusStyle[st.id] || 'rich';
  const text = style === 'rich' ? sc.rich : sc.bare;
  log('status_view', { step: st.id, style });
  const tips = tipsHtml(st.id);
  panelHtml(st, `<div class="statusbox ${style}">⏳ ${text}</div>${tips}
    <div class="microq studyq" id="microq"><p class="studytag">📋 Study question, outside the game</p><p>Do you know what to do next here?</p>
      <button class="chipbtn" data-q="yes">Yes</button><button class="chipbtn" data-q="unsure">Not sure</button><button class="chipbtn" data-q="no">No</button></div>
    <div id="reply"></div>`,
    [...sc.actions.map(a => `<button class="btn choice" data-a="${a.id}">${a.label}</button>`), '<button class="btn ghost" id="backMap">Back to the map</button>'], 'waiting');
  trackTips(st.id);
  wireMicroq(st.id, style, 'status');
  document.querySelectorAll('#panel [data-a]').forEach(b => b.onclick = () => {
    const a = sc.actions.find(x => x.id === b.dataset.a);
    log('waiting_action', { step: st.id, action: a.id, style });
    s.day += 1;
    $('#reply').innerHTML = `<p class="reply">${a.reply}</p>`;
    b.disabled = true;
    redraw();
  });
  $('#backMap').onclick = closePanel;
}

// "Do you know what to do next?" The answer is logged first (that is the measure),
// then a "no" or "not sure" gets a concrete hint instead of a bare thank-you.
function wireMicroq(stepId, style, where) {
  document.querySelectorAll('#microq [data-q]').forEach(b => b.onclick = () => {
    const box = $('#microq'), answer = b.dataset.q;
    log('next_step_q', { step: stepId, style, answer, where });
    refresh();
    const nx = s.next && s.next !== stepId ? byId(s.next) : null;
    box.innerHTML = answer === 'yes'
      ? '<p class="muted">Great. Carry on with your other steps.</p>'
      : `<p class="reply">💡 Nothing to do here for now: this one is in someone else's hands and they will answer on their own, usually within a few weeks. Carry on with other steps${nx ? `, for example <b>${nx.title}</b>` : ''}. I will tell you as soon as news arrives.</p>`;
    if (answer !== 'yes') log('next_step_hint', { step: stepId, style, where });
  });
}

function askWhy(st, choice, cont) {
  s.why++;
  const panel = $('#panel');
  const box = document.createElement('div');
  box.className = 'why studyq';
  box.innerHTML = `<p class="studytag">📋 Study question, outside the game (optional)</p><p>Why did you choose "${choice.label.toLowerCase()}"? There is no right answer. It helps us understand how people decide.</p>
    <div class="chips">${WHY_CHIPS.map((w, i) => `<button class="chipbtn" data-w="${i}">${w}</button>`).join('')}</div>
    <div class="why-own"><label for="whyTxt" class="sr-only">Your own words</label><input id="whyTxt" placeholder="Or in your own words (optional)" maxlength="200"><button class="btn small" id="whyOk">Send</button></div>
    <button class="btn-link" id="whySkip">Skip</button>`;
  panel.querySelector('.choices').replaceWith(box);
  const done = answer => { log('why', { step: st.id, choice: choice.id, answer }); cont(); };
  box.querySelectorAll('[data-w]').forEach(b => b.onclick = () => done(WHY_CHIPS[b.dataset.w]));
  // Send only with some text: empty answers go through Skip
  const ok = $('#whyOk'), txt = $('#whyTxt');
  ok.disabled = true;
  txt.oninput = () => { ok.disabled = !txt.value.trim(); };
  txt.onkeydown = e => { if (e.key === 'Enter' && txt.value.trim()) done(txt.value.trim()); };
  ok.onclick = () => { if (txt.value.trim()) done(txt.value.trim()); };
  $('#whySkip').onclick = () => done(null);
  box.querySelector('.chipbtn').focus();
}

function handle(id, res) {
  if (res === 'close') return closePanel();
  if (typeof res === 'string') return renderScene(id, res);
  if (res && res.end) return finishStep(id, res);
}

function finishStep(id, res) {
  const st = byId(id);
  const status = res.end === 'done' ? 'done' : res.end === 'wait' ? 'waiting' : 'later';
  const before = Object.keys(AREAS).filter(areaDone);
  s.steps[id].status = status;
  s.place = st.place;
  if (status === 'wait' || status === 'waiting') s.waits[id] = st.waitSteps;
  log('outcome', { step: id, end: res.end, mood: res.mood, day: s.day, totalCHF: total(), surpriseCHF: extra() });
  // simulated time: other procedures move on while you act
  const arrivals = [];
  for (const [w, n] of Object.entries(s.waits)) {
    if (w === id) continue;
    s.waits[w] = n - 1;
    if (s.waits[w] <= 0) { delete s.waits[w]; s.steps[w].status = 'action'; arrivals.push(w); s.day += 7; log('mail_arrived', { step: w }); }
  }
  refresh();
  const after = Object.keys(AREAS).filter(areaDone);
  const newStamps = after.filter(a => !before.includes(a));
  newStamps.forEach(a => log('stamp', { area: a }));
  if (st.final) { redraw(); return endScreen(false); }
  // arriving: a short scene for the way you travelled, then Lugano opens

  const passed = dayAtOpen === null ? 0 : s.day - dayAtOpen;
  dayAtOpen = null;
  const paid = s.costs.slice(costsAtOpen ?? s.costs.length);
  costsAtOpen = null;
  // outcome panel
  // When a step starts waiting, show its status message right away (rich or bare,
  // the within-run variant) with the one-tap question, so every run is exposed to it.
  let waitBox = '';
  if (status === 'waiting' && st.scenes.waiting) {
    const sc = st.scenes.waiting(ctx), style = s.statusStyle[id] || 'rich';
    log('status_view', { step: id, style, where: 'outcome' });
    waitBox = `<div class="statusbox ${style}">⏳ ${style === 'rich' ? sc.rich : sc.bare}</div>
      <div class="microq studyq" id="microq" data-step="${id}" data-style="${style}"><p class="studytag">📋 Study question, outside the game</p><p>Do you know what to do next here?</p>
      <button class="chipbtn" data-q="yes">Yes</button><button class="chipbtn" data-q="unsure">Not sure</button><button class="chipbtn" data-q="no">No</button></div>`;
  }
  // an outcome can bring its own meme (res.meme) or none (res.meme === false)
  const memePair = res.meme === false ? null : (res.meme || MEMES[id]);
  const meme = playful() && res.mood === 'win' && memePair && status === 'done';
  const support = res.mood === 'oops'
    ? (playful() ? `Ouch. ${res.note} Happens to a lot of students, we'll sort it.` : res.note)
    : res.note;
  const body = `
    <div class="mood ${res.mood}">${res.mood === 'win' ? '✅ ' : res.mood === 'oops' ? '😬 ' : '⏳ '}${support}</div>
    ${meme ? memeHtml(memePair) : ''}
    ${newStamps.map(a => `<div class="newstamp" style="--area:${AREAS[a].color}">${AREAS[a].stamp} <b>${AREAS[a].label}</b> stamp collected!</div>`).join('')}
    ${arrivals.map(a => `<div class="mail">📬 News about <b>${byId(a).title}</b>. Check it on the map.</div>`).join('')}
    ${waitBox}
    ${paid.length ? `<div class="paid"><b>💸 This step cost you</b><ul>${paid.map(c => `<li class="${c.kind}"><span>${c.why}${c.kind === 'surprise' ? ' <em>surprise</em>' : ''}</span><b>${chf(c.chf)}</b></li>`).join('')}</ul></div>` : ''}
    ${passed > 0 ? `<div class="timepass">🗓️ ${fmtDays(passed)} went by. It is now <b>${weekLabel()}</b>.</div>` : ''}`;
  const nx = s.next && s.next !== id ? byId(s.next) : null;
  panelHtml(st, body, [
    nx ? `<button class="btn primary" id="goNext">Suggested next: ${nx.title}</button>` : '',
    '<button class="btn ghost" id="backMap">Back to the map</button>'], status, 'outcome');
  if (nx) $('#goNext').onclick = () => { log('go_next', { from: id, to: nx.id }); openStep(nx.id); redraw(); };
  $('#backMap').onclick = closePanel;
  if (waitBox) wireMicroq(id, s.statusStyle[id] || 'rich', 'outcome');
  if (meme) log('meme_shown', { step: id });
  redraw();
  if (newStamps.length) celebrate(newStamps);
}

// A full-screen stamp moment when an area is completed.
function celebrate(areas) {
  const colours = ['#2552B0', '#1F9584', '#D46A43', '#C9921A', '#4E9A4E', '#F2B705'];
  const bits = Array.from({ length: 28 }, (_, i) => {
    const ang = (i / 28) * Math.PI * 2, dist = 140 + (i % 4) * 40;
    return `<i style="--c:${colours[i % colours.length]};--dx:${Math.round(Math.cos(ang) * dist)}px;--dy:${Math.round(Math.sin(ang) * dist)}px;--r:${(i * 47) % 360}deg;animation-delay:${(i % 5) * 30}ms"></i>`;
  }).join('');
  const ov = document.createElement('div');
  ov.className = 'celebrate';
  ov.innerHTML = `<div class="cele-card" role="status">
    <div class="confetti" aria-hidden="true">${bits}</div>
    <div class="cele-stamps">${areas.map(a => `<div class="cele-stamp" style="--area:${AREAS[a].color}">${AREAS[a].stamp}</div>`).join('')}</div>
    <p class="cele-kicker">Stamp collected</p>
    <p class="cele-title">${areas.map(a => AREAS[a].label).join(' + ')}</p>
    <p class="muted">${Object.keys(AREAS).filter(areaDone).length} of 5 areas complete</p>
    <button class="btn primary small" id="celeOk">${playful() ? 'Nice!' : 'Continue'}</button></div>`;
  document.body.appendChild(ov);
  const close = () => { ov.remove(); $('#goNext, #backMap')?.focus(); };
  $('#celeOk', ov).onclick = close;
  ov.onclick = e => { if (e.target === ov) close(); };
  $('#celeOk', ov).focus();
  setTimeout(() => ov.isConnected && close(), 4000);
}

function memeHtml([top, bottom]) {
  return `<figure class="meme" aria-label="${top} ${bottom}">
    <div class="meme-top">${top}</div>${buddySvg(110, true)}<div class="meme-bottom">${bottom}</div></figure>`;
}

// ---------- modals ----------
function modal(html, label) {
  const m = $('#modal');
  m.hidden = false;
  m.innerHTML = `<div class="modal-card" role="dialog" aria-label="${label}"><button class="x" id="mClose" aria-label="Close">×</button>${html}</div>`;
  $('#mClose').onclick = closeModal;
  m.onclick = e => { if (e.target === m) closeModal(); };
  $('#mClose').focus();
}
function closeModal() { const m = $('#modal'); if (m && !m.hidden) { m.hidden = true; m.innerHTML = ''; } }

function openList() {
  log('list_open');
  refresh();
  const groups = Object.entries(AREAS).map(([k, a]) => {
    const list = STEPS.filter(st => st.area === k && visible(st));
    return `<section><h3 style="--area:${a.color}">${a.stamp} ${a.label}</h3><ul class="steplist">
      ${list.map(st => { const stt = s.steps[st.id].status; return `<li><button class="steprow ${stt}" data-open="${st.id}"><span>${st.title}</span><span class="st ${stt}">${statusText(stt)}</span></button></li>`; }).join('')}
    </ul></section>`;
  }).join('');
  const nx = s.next ? byId(s.next) : null;
  modal(`<h2>My steps</h2>${nx ? `<p class="next">Suggested next: <button class="btn-link" data-open="${nx.id}">${nx.title}</button></p>` : ''}${groups}
    <p class="muted small code-line">Your participant code: <b>${session.code}</b>. To withdraw your data, email it to ${CONFIG.CONTACT_EMAIL}.</p>`, 'My steps');
  document.querySelectorAll('#modal [data-open]').forEach(b => b.onclick = () => { log('list_pick', { step: b.dataset.open }); closeModal(); openStep(b.dataset.open); });
}

function openTrips() {
  log('trips_open');
  modal(`<h2>Others' trips</h2><p class="muted">Past students who chose to share their trip. Pick one to see it on the map.</p>
    <div class="trips">${TRIPS.map((t, i) => `<button class="trip" data-t="${i}"><b>${session.variant.tips === 'named' ? t.who : 'A past student'}</b><span class="muted">${t.profile}</span><span>${t.story}</span></button>`).join('')}</div>
    <p class="muted small">Example trips written for this prototype.</p>`, 'Others\' trips');
  document.querySelectorAll('#modal [data-t]').forEach(b => b.onclick = () => viewTrip(TRIPS[b.dataset.t]));
}

// Another student's trip: numbered trail on the faded map, timeline in the panel.
function viewTrip(t) {
  log('trip_view', { trip: t.who });
  closeModal();
  const named = session.variant.tips === 'named';
  const who = named ? t.who : 'A past student';
  const steps = t.steps.filter(([id]) => byId(id));
  drawTrail($('#map'), steps.map(([id]) => byId(id).place), who);
  const ban = $('#tripBanner');
  ban.hidden = false;
  ban.innerHTML = `<span>👀 <b>You are looking at ${named ? `${t.who}'s` : 'a past student\'s'} trip, not yours.</b> Your own map is faded meanwhile.</span><button class="btn small" id="hideTrip">Back to my map</button>`;
  const panel = $('#panel'); panel.hidden = false; panel.className = 'panel trip-panel';
  panel.style.setProperty('--area', '#172031');
  panel.innerHTML = `<div class="panel-head"><span class="area-chip">👀 ${named ? t.who : 'A past student'}, ${t.profile}</span><button class="x" id="pClose" aria-label="Close">×</button></div>
    <h2>${named ? `${t.who}'s` : 'Their'} trip</h2><p class="muted">${t.story}</p>
    <p class="muted small tl-hint">Tap a step to see it on the map.</p>
    <ol class="timeline">${steps.map(([id, mood, note], i) => { const st = byId(id); return `<li class="${mood}" data-i="${i}" tabindex="0"><span class="tl-place">${PLACES[st.place].icon} ${PLACES[st.place].label}</span><b>${st.title}</b><span>${note}</span></li>`; }).join('')}</ol>
    <div class="choices"><button class="btn primary" id="backMine">Back to my map</button></div>`;
  const back = () => { drawTrail($('#map'), null); ban.hidden = true; panel.hidden = true; tripButton(null); zoomMap(null); log('trip_hide'); redraw(); };
  $('#hideTrip').onclick = back; $('#backMine').onclick = back; $('#pClose').onclick = back;
  tripButton(back);
  // Tap a step: highlight its stop on the trail and bring it into view (phones scroll the map).
  const show = i => {
    const st = byId(steps[i][0]);
    document.querySelectorAll('#trail .cur').forEach(n => n.classList.remove('cur'));
    document.querySelectorAll(`#trail [data-i="${i}"]`).forEach(n => n.classList.add('cur'));
    panel.querySelectorAll('.timeline li').forEach(li => li.classList.toggle('cur', li.dataset.i === String(i)));
    if (isPhone()) zoomMap(PLACES[st.place].x, PLACES[st.place].y);
    log('trip_step', { trip: t.who, i });
  };
  panel.querySelectorAll('.timeline li').forEach(li => {
    li.onclick = () => show(Number(li.dataset.i));
    li.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(Number(li.dataset.i)); } };
  });
  setTimeout(() => show(0), 50);
  $('#backMine').focus({ preventScroll: true });
}

// While a trip is shown, the "Others' trips" button becomes the way back.
function tripButton(back) {
  const b = $('#btn-trips'); if (!b) return;
  if (back) { b.textContent = '← My map'; b.classList.add('active'); b.onclick = () => { log('trip_back_button'); back(); }; }
  else { b.textContent = "Others' trips"; b.classList.remove('active'); b.onclick = openTrips; }
}

// Trip view on phones: follow the selected stop closely; null goes back to your own map.
function zoomMap(x, y) {
  if (x === null) { lastFocus = null; return setTimeout(() => focusMap(true), 0); }
  follow(x, y, 320);
}

// The character card: who you play, their situation, and what it means for the path.
function openRole() {
  log('role_open');
  const p = s.profile, preset = PRESETS.find(x => x.id === p.preset);
  const eu = p.origin === 'eu', name = p.preset === 'custom' ? 'Your student' : p.name;
  const housing = { usihome: 'a room at USI Home', lease: 'a one-year lease in Molino Nuovo', sublet: 'a sublet in Viganello' }[s.flags.housing];
  const means = [
    eu ? 'From the EU or EFTA: no visa needed.' : p.visa ? 'From outside the EU and EFTA: needs a Swiss visa before travelling.' : 'From outside the EU and EFTA, but no visa needed: still applies for the residence permit.',
    eu ? 'Can ask for an exemption from Swiss health insurance, with the European card.' : 'Needs a Swiss student health insurance.',
    p.stay === 'semester' ? 'Stays one semester: one-year leases are a problem.' : 'Stays a full year: a one-year lease fits.',
    p.abroad ? 'Has lived abroad before: knows some of the drill.' : 'First time living abroad.',
  ];
  modal(`<div class="rolecard"><span class="role-flag">${p.flag}</span><div><h2>${name}</h2>
      <p class="muted">${preset ? preset.blurb : 'The student you made for this exchange.'}</p></div></div>
    <h3>Their situation</h3><ul class="plain">${means.map(m => `<li>${m}</li>`).join('')}</ul>
    <h3>So far</h3><ul class="plain">
      <li>${housing ? `Housing: ${housing}.` : 'Housing: not sorted yet.'}</li>
      <li>${s.flags.courses ? 'Study plan: sent.' : 'Study plan: not done yet.'}</li>
      <li>Budget so far: ${chf(total())}${extra() ? `, of which ${chf(extra())} surprises` : ''}.</li></ul>
    <p class="muted small">Decide as you think ${p.preset === 'custom' ? 'your student' : p.name} would.</p>`, 'Your character');
}

function openLegend() {
  log('legend_open');
  modal(`<h2>What the map shows</h2>
    <ul class="legendlist">
      <li><i class="ln next"></i><span><b>Gold path</b>: the step I suggest next</span></li>
      <li><i class="ln"></i><span><b>Blue path</b>: also open now, in any order</span></li>
      <li><i class="ln done"></i><span><b>Green path</b>: steps you have done</span></li>
      <li><i class="ln lock"></i><span><b>Faint dotted path</b>: locked until the steps before it are done</span></li>
      <li><i class="b done">✓</i><span>Done</span></li>
      <li><i class="b waiting">⏳</i><span>Waiting for someone else (office, university): nothing to do for now</span></li>
      <li><i class="b action">!</i><span>Action needed: news arrived, or you postponed it</span></li>
      <li><i class="b locked">🔒</i><span>Locked</span></li>
    </ul>`, 'Map legend');
}

function openCosts() {
  log('costs_open');
  const row = c => `<li><span>${c.why}</span><b>${chf(c.chf)}</b></li>`;
  const planned = s.costs.filter(c => c.kind === 'planned'), surprise = s.costs.filter(c => c.kind === 'surprise');
  const months = s.profile.stay === 'year' ? 10 : 5;
  const rent = s.flags.housing === 'sublet' ? 700 : s.flags.housing ? 650 : null;
  modal(`<h2>Your budget</h2>
    <div class="budget-top"><div><b>${chf(total())}</b><span>spent so far</span></div><div class="${extra() ? 'bad' : ''}"><b>${chf(extra())}</b><span>surprises</span></div></div>
    <h3>Planned</h3>${planned.length ? `<ul class="costlist">${planned.map(row).join('')}</ul>` : '<p class="muted">Nothing yet.</p>'}
    <h3>Surprises</h3>${surprise.length ? `<ul class="costlist bad">${surprise.map(row).join('')}</ul>` : '<p class="muted">None so far. Nice.</p>'}
    ${rent ? `<p class="next">Still ahead: about <b>${chf(rent * (months - 1))}</b> of rent for the other ${months - 1} months, plus food (around 400 CHF a month).</p>` : ''}
    <p class="muted small">Rough estimates for this simulation.</p>`, 'Budget');
}

function counterCard() {
  s.flags.usedCounterCard = true;
  log('counter_card');
  modal(`<h2>Counter card</h2><p class="muted">Show this at the counter.</p>
    <div class="ccard"><p lang="it"><b>Buongiorno, sono uno studente di scambio all'USI. Vorrei notificare il mio arrivo.</b></p><p>Good morning, I am an exchange student at USI. I would like to register my arrival.</p>
    <p lang="it"><b>Sono in subaffitto: ho il contratto e la lettera del proprietario.</b></p><p>I am subletting: I have the contract and the owner's letter.</p></div>`, 'Counter card');
}

function confirmEnd() {
  log('end_click');
  modal(`<h2>End your trip here?</h2><p>You will go to a short questionnaire (about 2 minutes). Your progress so far counts.</p>
    <div class="actions"><button class="btn primary" id="endYes">Yes, end here</button><button class="btn ghost" id="endNo">Keep playing</button></div>`, 'End');
  $('#endYes').onclick = () => { closeModal(); endScreen(true); };
  $('#endNo').onclick = closeModal;
}

// ---------- end and questionnaire ----------
function endScreen(early) {
  s.finished = true;
  const vis = STEPS.filter(visible);
  const done = vis.filter(st => s.steps[st.id].status === 'done').length;
  session.device && (session.device.end = viewport());
  log('end', { early, viewport: viewport(), done, total: vis.length, day: s.day, totalCHF: total(), surpriseCHF: extra(), costs: s.costs, problems: s.problems, forcedProblems: s.problems.filter(p => p.cause === 'forced').length, counterVisits: s.counters.counterVisits || 0 });
  document.querySelector('.tour')?.remove();
  screen(`
    <main class="card-screen wide endscr">
      <div class="buddy-hero">${buddySvg(110)}</div>
      <h1>${early ? 'Trip paused.' : 'Benvenuto a Lugano! You are settled.'}</h1>
      <div class="stats">
        <div><b>${done}/${vis.length}</b><span>steps done</span></div>
        <div><b>${Math.max(0, Math.round((s.day + 35) / 7))}</b><span>weeks of exchange life</span></div>
        <div><b>${chf(total())}</b><span>spent, of which ${chf(extra())} surprises</span></div>
        <div><b>${s.problems.length}</b><span>problems met</span></div>
      </div>
      <div class="stamps big">${Object.entries(AREAS).map(([k, a]) => `<span class="stamp ${areaDone(k) ? 'got' : ''}" style="--area:${a.color}" title="${a.label}">${a.stamp}</span>`).join('')}</div>
      <label class="share"><input type="checkbox" id="share"> Share my trip with future exchange students (in this prototype nothing is published)</label>
      <button class="btn primary" id="toQ">Answer a few quick questions</button>
    </main>`, 'center');
  $('#toQ').onclick = () => { s.shareTrip = $('#share').checked; log('share_trip', { optIn: s.shareTrip }); questionnaire(); };
}

function questionnaire() {
  const tailored = TAILORED.filter(q => !q.onlyPlayful || playful());
  screen(`
    <main class="card-screen wide quest">
      <h1>Almost done: how was it?</h1>
      <div class="buddy-row">${buddySvg(64)}<p class="bubble">You can stop being ${s.profile.preset === 'custom' ? 'an exchange student' : s.profile.name} now. From here on, please answer <b>as yourself</b>, about the app you just tried.</p></div>
      <form id="qForm">
        <fieldset><legend>In real life, are you or have you been an exchange student?</legend>
          <label><input type="radio" name="screen" value="exchange-now" required> Yes, I am one now</label>
          <label><input type="radio" name="screen" value="exchange-past"> Yes, in the past</label>
          <label><input type="radio" name="screen" value="student"> No, but I am or was a student</label>
          <label><input type="radio" name="screen" value="other"> No</label></fieldset>
        <fieldset class="about"><legend>About you (optional)</legend>
          <label>Age range <select name="age"><option value="">Choose</option>${['18–24', '25–34', '35–44', '45–54', '55–64', '65 or older', 'Prefer not to say'].map(v => `<option>${v}</option>`).join('')}</select></label>
          <label>Where did you mostly grow up? <select name="region"><option value="">Choose</option>${['Switzerland', 'Italy', 'Germany or Austria', 'France', 'Spain or Portugal', 'Belgium, Netherlands, Luxembourg', 'UK or Ireland', 'Other Western or Southern Europe', 'Nordic countries', 'Eastern Europe', 'Latin America', 'North America', 'Asia', 'Middle East or North Africa', 'Sub-Saharan Africa', 'Oceania', 'Prefer not to say'].map(v => `<option>${v}</option>`).join('')}</select></label>
          <label>What do you do? <select name="occupation"><option value="">Choose</option>${['Student', 'Working', 'Studying and working', 'Other', 'Prefer not to say'].map(v => `<option>${v}</option>`).join('')}</select></label>
          <label>Field of study or work <select name="field"><option value="">Choose</option>${['Informatics, engineering', 'Economics, business, finance', 'Communication, media', 'Design, architecture, arts', 'Humanities, social sciences, education', 'Natural sciences, health, medicine', 'Law, political science', 'Other', 'Prefer not to say'].map(v => `<option>${v}</option>`).join('')}</select></label>
        </fieldset>
        <fieldset class="ueq"><legend>The app was... (pick a point between each pair)</legend>
          ${UEQS.map(([l, r], i) => `<div class="sd" role="radiogroup" aria-label="${l} to ${r}"><span>${l}</span><div class="pts">${[1, 2, 3, 4, 5, 6, 7].map(v => `<label><input type="radio" name="ueq${i}" value="${v}" required><span class="sr-only">${v}</span></label>`).join('')}</div><span>${r}</span></div>`).join('')}
        </fieldset>
        <fieldset class="likert"><legend>How much do you agree?</legend>
          ${tailored.map(q => `<div class="lk"><p>${q.text}</p><div class="pts5">${['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'].map((t, v) => `<label><input type="radio" name="${q.id}" value="${v + 1}" required><span>${t}</span></label>`).join('')}</div></div>`).join('')}
        </fieldset>
        <label class="open">What confused you, or what would you change? (optional)<textarea name="open_change" maxlength="600" rows="3"></textarea></label>
        <label class="open">What did you like most? (optional)<textarea name="open_like" maxlength="600" rows="2"></textarea></label>
        <p class="err" id="qErr" role="alert"></p>
        <button class="btn primary" type="submit">Send my answers</button>
      </form>
    </main>`, 'center');
  $('#qForm').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    session.answers = Object.fromEntries(f.entries());
    session.answers.shareTrip = s.shareTrip;
    log('questionnaire', {});
    const ok = await send('complete');
    thanks(ok);
  };
}

function thanks(sent) {
  try { sessionStorage.removeItem(SAVE_KEY); sessionStorage.removeItem('ec-log'); } catch (e) { /* ignore */ }
  const line = playful()
    ? 'That\'s a wrap! Bags unpacked, paperwork done. I\'m off to an aperitivo by the lake. Ciao, and grazie for travelling with me!'
    : 'Thank you for travelling with me. Your answers will help us make the companion better. Buon soggiorno!';
  screen(`<main class="card-screen center-text thanks"><div class="buddy-hero">${buddySvg(130)}</div>
    <h1>Grazie mille!</h1>
    <p class="bubble big">${line}</p>
    <p class="muted">${sent ? 'Your answers are saved. You can close this page now.' : 'You can close this page now.'}</p>
    <p class="codebox">Your participant code: <b>${session.code}</b><br><span class="muted small">Changed your mind? Email this code to <a href="mailto:${CONFIG.CONTACT_EMAIL}?subject=Exchange%20Companion%20withdrawal%20${session.code}">${CONFIG.CONTACT_EMAIL}</a> and we will delete your data.</span></p>
    ${sent ? '' : `<details class="fallback"><summary>The answers could not be sent online</summary>
      <p>If someone from our team is with you, they may ask you to save this file.</p>
      <button class="btn ghost small" id="dl">Save the session file</button></details>`}</main>`, 'center');
  if (!sent) $('#dl').onclick = download;
}

// orientation changes and big resizes during the game, for interpretation
let lastVp = viewport(), vpTimer;
window.addEventListener('resize', () => {
  clearTimeout(vpTimer);
  vpTimer = setTimeout(() => {
    const v = viewport();
    if (s.consent && (v.orientation !== lastVp.orientation || Math.abs(v.w - lastVp.w) > 100)) { log('viewport', v); lastVp = v; }
  }, 600);
});

// partial logs when the participant closes the page mid-way
let lastBeacon = 0;
const beacon = () => { if (s.consent && !session.sent && performance.now() - lastBeacon > 2000) { lastBeacon = performance.now(); send('unload'); } };
window.addEventListener('pagehide', beacon);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') beacon(); });

// Desktop and Android browsers ask before leaving or reloading mid-game
// (iOS ignores this, hence the resume screen below).
window.addEventListener('beforeunload', e => {
  if (s.consent && s.profile && !session.sent) { e.preventDefault(); e.returnValue = ''; }
});

function resumeScreen(prev, log0) {
  screen(`<main class="card-screen center-text"><div class="buddy-hero">${buddySvg(110)}</div>
    <h1>Welcome back!</h1>
    <p class="lead">The page was reloaded, but your exchange is still here${prev.s.profile?.name && prev.s.profile.preset !== 'custom' ? ` (you are ${prev.s.profile.name})` : ''}.</p>
    <div class="actions center"><button class="btn primary" id="resume">Continue where I left off</button><button class="btn ghost" id="restart">Start over</button></div></main>`, 'center');
  $('#resume').onclick = () => {
    Object.assign(s, prev.s);
    s.holdFog = false;
    if (log0) { Object.assign(session, log0, { sent: false }); continueClock(log0.events.at(-1)?.t || 0); }
    // replay the dice so the rest of the run stays the same as before the reload
    while (rngCalls < prev.rngCalls) rng();
    Object.keys(AREAS).filter(areaDone).forEach(a => shownStamps.add(a));
    log('resume', { finished: s.finished });
    if (s.finished) return questionnaire();
    mapScreen(); hint();
  };
  $('#restart').onclick = () => {
    try { sessionStorage.removeItem(SAVE_KEY); sessionStorage.removeItem('ec-log'); } catch (e) { /* ignore */ }
    location.replace(location.pathname + location.search);
  };
}

let savedLog = null;
try { savedLog = JSON.parse(sessionStorage.getItem('ec-log') || 'null'); } catch (e) { savedLog = null; }
// Demo shortcut for the team: ?demo=arrival&mode=train|flight|car jumps straight
// to the arrival scene (everything before departure already done). Nothing is
// recorded: no consent, so nothing is ever sent.
function demoArrival(mode) {
  try { sessionStorage.removeItem(SAVE_KEY); sessionStorage.removeItem('ec-log'); } catch (e) { /* ignore */ }
  session.round = 'demo';
  const p = PRESETS.find(x => x.id === 'jonas');
  s.profile = { preset: p.id, name: p.name, flag: p.flag, origin: p.origin, visa: false, stay: p.stay, abroad: p.abroad };
  for (const id of ['accounts', 'usihome', 'roomhunt', 'courses']) s.steps[id] = { status: 'done' };
  s.steps.recognition = { status: 'waiting' }; s.waits.recognition = 2;
  Object.assign(s.flags, { savedCreds: true, housing: 'sublet', ownerLetter: true, courses: ['daf', 'ie', 'dm'], travelMode: mode, travelVia: params.get('via') === 'zurich' ? 'zurich' : 'milan',
    travelNote: { train: 'Six hours of mountains and tunnels, right on time.', flight: 'Cheap flight, bus on time. Lucky you.', car: 'Your family carries the boxes and leaves you a full fridge.' }[mode] });
  s.day = -16; s.place = 'roomsearch';
  s.costs.push({ chf: 1400, why: 'Sublet: deposit and first month', kind: 'planned', day: -20 });
  refresh();
  mapScreen();
  openStep('arrive');
  renderScene('arrive', 'arrived');   // plays the arrival scene first
}

const demo = params.get('demo');
if (demo === 'arrival') demoArrival(['train', 'flight', 'car'].includes(params.get('mode')) ? params.get('mode') : 'train');
else if (saved?.s?.consent && saved.s.profile && !(savedLog && savedLog.sent)) resumeScreen(saved, savedLog);
else intro();

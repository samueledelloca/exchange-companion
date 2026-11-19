// The illustrated map: Lugano on the right, your home on the left.
import { PLACES, AREAS } from './content.js';

const NS = 'http://www.w3.org/2000/svg';

// Stylised but faithful to the Gulf of Lugano, north up: the city on the north
// shore of the bay, the station on the hill above it, San Salvatore on the
// Paradiso peninsula to the south-west, Monte Brè above Castagnola to the east,
// Campione d'Italia on the far shore and the lake running east to Gandria.
export function baseMap() {
  return `
  <defs>
    <linearGradient id="lakeG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#93C6E4"/><stop offset="1" stop-color="#5D9CC8"/>
    </linearGradient>
    <linearGradient id="landG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#DCE8D0"/><stop offset="1" stop-color="#EDF2E4"/>
    </linearGradient>
    <linearGradient id="mtG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9DB98F"/><stop offset="1" stop-color="#C4D6B6"/>
    </linearGradient>
    <pattern id="rail" width="14" height="8" patternUnits="userSpaceOnUse">
      <rect width="14" height="8" fill="none"/><rect x="5" y="0" width="3" height="8" fill="#8A8F98"/>
    </pattern>
  </defs>
  <rect x="0" y="0" width="1000" height="620" fill="#EEF2F6"/>
  <!-- land around the gulf -->
  <path d="M228 18 H992 V602 H228 Z" fill="url(#landG)"/>
  <!-- hills to the north (Monte Boglia ridge, Comano) -->
  <path d="M228 110 C300 70 340 92 400 64 C460 38 520 80 590 52 C650 30 700 70 760 46 C820 24 880 60 992 40 V18 H228 Z" fill="#C9D9BC" opacity=".9"/>
  <!-- the lake: the bay of Lugano opens south, the lake runs east to Gandria -->
  <path class="lake" d="M404 602 C410 560 424 520 452 488 C476 460 506 440 546 432 C580 426 606 432 626 426
    C660 418 700 432 744 446 C800 464 860 478 920 478 C952 478 976 474 992 470 V560
    C960 560 920 556 880 560 C830 566 790 576 752 602 Z" fill="url(#lakeG)"/>
  <!-- far shore: Campione d'Italia and the Sighignola slopes -->
  <path d="M752 602 C790 576 830 566 880 560 C920 556 960 560 992 560 V602 Z" fill="#CFDDC2"/>
  <text x="880" y="590" class="maplabel soft" text-anchor="middle">Campione d'Italia</text>
  <g stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round">
    <path d="M520 520 q12 -6 24 0 t24 0"/><path d="M640 500 q12 -6 24 0 t24 0"/><path d="M800 520 q12 -6 24 0 t24 0"/><path d="M470 570 q12 -6 24 0 t24 0"/>
  </g>
  <text x="640" y="560" class="maplabel lakelabel" text-anchor="middle">Lago di Lugano</text>
  <!-- river Cassarate -->
  <path d="M640 120 C632 200 650 260 628 330 C618 370 630 400 626 426" stroke="#8EC3E3" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- San Salvatore, on the Paradiso peninsula -->
  <path d="M262 600 C290 560 318 500 340 452 C346 440 354 440 360 452 C380 500 396 556 410 600 Z" fill="url(#mtG)"/>
  <path d="M333 466 L340 452 C346 440 354 440 360 452 L366 466 L356 462 L350 470 L343 462 Z" fill="#fff" opacity=".8"/>
  <text x="336" y="592" class="maplabel soft" text-anchor="middle">San Salvatore</text>
  <text x="440" y="512" class="maplabel soft" text-anchor="middle">Paradiso</text>
  <!-- Monte Brè, above Castagnola, falling into the lake -->
  <path d="M800 452 C830 380 870 300 904 268 C914 258 922 258 932 268 C960 300 980 340 992 360 V470 C960 476 920 478 880 474 C850 470 824 462 800 452 Z" fill="url(#mtG)"/>
  <text x="900" y="458" class="maplabel soft" text-anchor="middle">Castagnola</text>
  <!-- old town and quarters -->
  <g fill="#D3DBCB">
    <rect x="452" y="300" width="22" height="16" rx="3"/><rect x="540" y="292" width="20" height="16" rx="3"/><rect x="470" y="404" width="26" height="16" rx="3"/>
    <rect x="560" y="360" width="22" height="16" rx="3"/><rect x="700" y="214" width="22" height="16" rx="3"/><rect x="720" y="330" width="24" height="18" rx="3"/>
    <rect x="600" y="248" width="20" height="16" rx="3"/><rect x="350" y="410" width="22" height="16" rx="3"/><rect x="420" y="440" width="20" height="14" rx="3"/>
  </g>
  <!-- palm trees on the lakefront (Riva, Parco Ciani) -->
  <g class="palm"><path d="M540 436 v-24" stroke="#7A6A4F" stroke-width="3"/><path d="M540 412 q-14 -4 -20 6 M540 412 q14 -4 20 6 M540 412 q-6 -12 -16 -12 M540 412 q6 -12 16 -12" stroke="#4E9A4E" stroke-width="3" fill="none" stroke-linecap="round"/></g>
  <g class="palm"><path d="M676 432 v-22" stroke="#7A6A4F" stroke-width="3"/><path d="M676 410 q-12 -4 -18 6 M676 410 q12 -4 18 6 M676 410 q-6 -10 -14 -10 M676 410 q6 -10 14 -10" stroke="#4E9A4E" stroke-width="3" fill="none" stroke-linecap="round"/></g>
  <!-- home region -->
  <rect x="18" y="40" width="190" height="540" rx="22" fill="#E3E9F4" stroke="#B9C6DE" stroke-width="2" stroke-dasharray="6 6"/>
  <text x="113" y="76" class="maplabel region" text-anchor="middle">Home</text>
  <text x="113" y="560" class="maplabel soft" text-anchor="middle">before departure</text>
  <text x="560" y="100" class="maplabel region" text-anchor="middle">Lugano</text>
  <!-- railway from the north (Gotthard) into Lugano station -->
  <path d="M208 150 C290 150 330 200 392 226" stroke="url(#rail)" stroke-width="8" fill="none"/>
  <path d="M208 150 C290 150 330 200 392 226" stroke="#8A8F98" stroke-width="2" fill="none" transform="translate(0,-4)"/>
  <path d="M208 150 C290 150 330 200 392 226" stroke="#8A8F98" stroke-width="2" fill="none" transform="translate(0,4)"/>
  <g id="edges"></g>
  <g id="trail"></g>
  <g id="nodes"></g>
  <g id="avatar"></g>`;
}

function el(tag, attrs = {}, text) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text !== undefined) n.textContent = text;
  return n;
}

const BADGE = { done: '✓', waiting: '⏳', action: '!', later: '!', locked: '🔒' };

export function drawMap(svg, steps, state, visible, onOpen) {
  const edges = svg.querySelector('#edges');
  const nodes = svg.querySelector('#nodes');
  edges.innerHTML = ''; nodes.innerHTML = '';
  const vis = steps.filter(visible);
  // Paths follow dependencies: a path lights up when it can be walked.
  for (const st of vis) {
    for (const r of st.requires) {
      const from = steps.find(x => x.id === r);
      if (!from || !visible(from)) continue;
      const a = PLACES[from.place], b = PLACES[st.place];
      const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.12, my = (a.y + b.y) / 2 - (b.x - a.x) * 0.12;
      const fromDone = state.steps[r]?.status === 'done';
      const cls = state.steps[st.id]?.status === 'done' ? 'edge done' : fromDone ? 'edge open' : 'edge locked';
      edges.appendChild(el('path', { d: `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`, class: cls }));
    }
  }
  for (const st of vis) {
    const p = PLACES[st.place];
    const status = state.steps[st.id]?.status || 'locked';
    const area = AREAS[st.area];
    const g = el('g', {
      class: `node ${status}${state.next === st.id ? ' next' : ''}`, transform: `translate(${p.x} ${p.y})`,
      tabindex: status === 'locked' ? '-1' : '0', role: 'button', 'data-step': st.id,
      'aria-label': `${st.title}, ${area.label}, ${statusText(status)}`,
    });
    g.style.setProperty('--area', area.color);
    g.appendChild(el('circle', { r: 34, class: 'halo' }));
    g.appendChild(el('circle', { r: 26, class: 'disc' }));
    g.appendChild(el('text', { class: 'icon', 'text-anchor': 'middle', y: 8 }, p.icon));
    if (BADGE[status]) {
      const b = el('g', { class: `badge ${status}`, transform: 'translate(20 -20)' });
      b.appendChild(el('circle', { r: 10 }));
      b.appendChild(el('text', { 'text-anchor': 'middle', y: 4 }, BADGE[status]));
      g.appendChild(b);
    }
    const label = el('text', { class: 'nlabel', 'text-anchor': 'middle', y: 46 }, p.label);
    g.appendChild(label);
    g.addEventListener('click', () => onOpen(st.id));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(st.id); } });
    nodes.appendChild(g);
  }
}

export function drawAvatar(svg, placeId, flag) {
  const g = svg.querySelector('#avatar');
  const p = PLACES[placeId];
  g.innerHTML = '';
  const a = el('g', { class: 'me', transform: `translate(${p.x - 30} ${p.y - 34})` });
  a.appendChild(el('path', { d: 'M0 0 c-12 0 -18 9 -18 17 c0 12 18 27 18 27 s18 -15 18 -27 c0 -8 -6 -17 -18 -17z', class: 'pin' }));
  a.appendChild(el('text', { 'text-anchor': 'middle', y: 23, class: 'pinflag' }, flag));
  g.appendChild(a);
}

export function drawTrail(svg, path, who) {
  const g = svg.querySelector('#trail');
  g.innerHTML = '';
  svg.classList.toggle('viewing-trip', !!path);
  if (!path) return;
  const pts = path.map(id => PLACES[id]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x + (i % 2 ? 6 : -6)} ${p.y + (i % 2 ? 6 : -6)}`).join(' ');
  g.appendChild(el('path', { d, class: 'trail' }));
  pts.forEach((p, i) => {
    g.appendChild(el('circle', { cx: p.x + (i % 2 ? 6 : -6), cy: p.y + (i % 2 ? 6 : -6), r: 11, class: 'trailstop' }));
    g.appendChild(el('text', { x: p.x + (i % 2 ? 6 : -6), y: p.y + (i % 2 ? 10 : -2), 'text-anchor': 'middle', class: 'trailnum' }, i + 1));
  });
  if (who) {
    const end = pts[pts.length - 1];
    const tag = el('g', { class: 'trailtag', transform: `translate(${end.x} ${end.y - 62})` });
    tag.appendChild(el('rect', { x: -60, y: -16, width: 120, height: 30, rx: 15 }));
    tag.appendChild(el('text', { 'text-anchor': 'middle', y: 5 }, `${who}'s trip`));
    g.appendChild(tag);
  }
}

export function statusText(s) {
  return { done: 'done', waiting: 'waiting', action: 'action needed', later: 'postponed', open: 'available', locked: 'locked' }[s] || s;
}

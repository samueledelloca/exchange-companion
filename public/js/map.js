// The illustrated map: Lugano on the right, your home on the left.
import { PLACES, AREAS } from './content.js';
import { GEO } from './geo.js';

const NS = 'http://www.w3.org/2000/svg';

// Lugano drawn from OpenStreetMap data (geo.js): the real lake shore, woods,
// built-up areas, parks, railway and main roads, north up, about 170 px per km.
// The steps sit near their real places, nudged apart where the centre is dense.
export function baseMap() {
  return `
  <defs>
    <radialGradient id="hill"><stop offset="0" stop-color="#9FBB8C" stop-opacity=".75"/><stop offset="1" stop-color="#9FBB8C" stop-opacity="0"/></radialGradient>
    <clipPath id="frame"><rect x="230" y="18" width="762" height="584" rx="18"/></clipPath>
    <pattern id="rail" width="14" height="8" patternUnits="userSpaceOnUse">
      <rect width="14" height="8" fill="none"/><rect x="5" y="0" width="3" height="8" fill="#8A8F98"/>
    </pattern>
  </defs>
  <rect x="0" y="0" width="1000" height="620" fill="#EEF2F6"/>
  <g clip-path="url(#frame)">
    <rect x="230" y="18" width="762" height="584" fill="#EDF1E4"/>
    <!-- relief: San Salvatore, Monte Brè and the Boglia slopes -->
    <ellipse cx="432" cy="540" rx="120" ry="90" fill="url(#hill)"/>
    <ellipse cx="945" cy="140" rx="150" ry="110" fill="url(#hill)"/>
    <ellipse cx="990" cy="40" rx="140" ry="70" fill="url(#hill)"/>
    <path d="${GEO.wood}" fill="#CFE0BF"/>
    <path d="${GEO.town}" fill="#E4E1D8"/>
    <path d="${GEO.park}" fill="#C4DDB0"/>
    <path d="${GEO.lake}" fill="#8EC1E1" fill-rule="evenodd" stroke="#6FA8CF" stroke-width="1.5"/>
    <path d="${GEO.river}" fill="none" stroke="#8EC1E1" stroke-width="3" stroke-linecap="round"/>
    <path d="${GEO.roads}" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
    <path d="${GEO.rail}" fill="none" stroke="#7D838D" stroke-width="2" stroke-dasharray="6 3"/>
    <g class="peak"><path d="M422 547 l7 -12 l7 12 z"/></g>
    <text x="440" y="572" class="maplabel soft" text-anchor="middle">Monte San Salvatore</text>
    <text x="388" y="505" class="maplabel soft" text-anchor="middle">Paradiso</text>
    <text x="830" y="282" class="maplabel soft" text-anchor="middle">Castagnola</text>
    <text x="660" y="440" class="maplabel lakelabel" text-anchor="middle">Lago di Lugano</text>
    <text x="986" y="596" class="osm" text-anchor="end">© OpenStreetMap contributors</text>
  </g>
  <rect x="230" y="18" width="762" height="584" rx="18" fill="none" stroke="#C9D3DF" stroke-width="1.5"/>
  <!-- home region -->
  <rect x="18" y="40" width="190" height="540" rx="22" fill="#E3E9F4" stroke="#B9C6DE" stroke-width="2" stroke-dasharray="6 6"/>
  <text x="113" y="76" class="maplabel region" text-anchor="middle">Home</text>
  <text x="113" y="560" class="maplabel soft" text-anchor="middle">before departure</text>
  <!-- the journey from home -->
  <path d="M208 150 C290 150 330 190 392 200" stroke="#7D838D" stroke-width="2.5" stroke-dasharray="2 6" fill="none" stroke-linecap="round"/>
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
      const toStatus = state.steps[st.id]?.status;
      // walked (done), suggested next by the companion, available, or locked
      // A path is open only when its destination can really be done now.
      const reachable = fromDone && ['open', 'action', 'later'].includes(toStatus);
      const cls = toStatus === 'done' ? 'edge done'
        : reachable && state.next === st.id ? 'edge next'
        : reachable ? 'edge avail' : 'edge locked';
      const d = `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
      if (cls === 'edge next') edges.appendChild(el('path', { d, class: 'edge casing' }));
      edges.appendChild(el('path', { d, class: cls }));
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
    if (state.next === st.id) {
      const flag = el('g', { class: 'nextflag', transform: 'translate(0 -44)' });
      flag.appendChild(el('rect', { x: -40, y: -12, width: 80, height: 22, rx: 11 }));
      flag.appendChild(el('text', { 'text-anchor': 'middle', y: 4 }, 'Suggested'));
      g.appendChild(flag);
    }
    g.addEventListener('click', () => onOpen(st.id));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(st.id); } });
    nodes.appendChild(g);
  }
  // keep the suggested place (and its flag) above its neighbours
  const nx = nodes.querySelector('.node.next'); if (nx) nodes.appendChild(nx);
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
  // Repeated visits to the same place fan out so every number stays readable.
  const seen = {};
  const pts = path.map(id => {
    const k = seen[id] = (seen[id] || 0) + 1, p = PLACES[id];
    const ang = -Math.PI / 4 + (k - 1) * 1.1;
    return { x: p.x + Math.cos(ang) * 20, y: p.y + Math.sin(ang) * 20 };
  });
  g.appendChild(el('path', { d: pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' '), class: 'trail' }));
  pts.forEach((p, i) => {
    g.appendChild(el('circle', { cx: p.x, cy: p.y, r: 11, class: 'trailstop' }));
    g.appendChild(el('text', { x: p.x, y: p.y + 4, 'text-anchor': 'middle', class: 'trailnum' }, i + 1));
  });
  if (who) {
    const end = PLACES[path[path.length - 1]];
    const tag = el('g', { class: 'trailtag', transform: `translate(${Math.min(end.x, 900)} ${Math.max(end.y - 66, 34)})` });
    tag.appendChild(el('rect', { x: -60, y: -16, width: 120, height: 30, rx: 15 }));
    tag.appendChild(el('text', { 'text-anchor': 'middle', y: 5 }, `${who}'s trip`));
    g.appendChild(tag);
  }
}

export function statusText(s) {
  return { done: 'done', waiting: 'waiting', action: 'action needed', later: 'postponed', open: 'available', locked: 'locked' }[s] || s;
}

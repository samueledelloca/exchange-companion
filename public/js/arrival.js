// Arrival scenes: a short full-screen transition between "before departure" and
// Lugano, depending on how the student travels. About 4.5 s, skippable; with
// reduced motion the last frame is shown briefly instead.
import { GEO } from './geo.js';

const SCENES = {
  train: {
    caption: ['Through the Gotthard Base Tunnel, 57 km under the Alps…', 'Benvenuti in Ticino!'],
    svg: () => `
      <defs>
        ${skyDefs()}
        <radialGradient id="arGlow"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#FFF6D6"/><stop offset="1" stop-color="#FFF6D6" stop-opacity="0"/></radialGradient>
        <radialGradient id="arWall" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#030406"/><stop offset=".35" stop-color="#0B0E13"/><stop offset="1" stop-color="#232933"/></radialGradient>
        <radialGradient id="arLamp"><stop offset="0" stop-color="#FFE7A3"/><stop offset=".4" stop-color="#FFC857" stop-opacity=".8"/><stop offset="1" stop-color="#FFC857" stop-opacity="0"/></radialGradient>
      </defs>
      <g class="ar-land">${landscape()}</g>
      <g class="ar-tunnel">
        <rect x="-500" y="-500" width="2000" height="1600" fill="url(#arWall)"/>
        <g class="streaks" stroke="#fff" stroke-opacity=".09" stroke-width="2" stroke-linecap="round">
          ${Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return `<line x1="${500 + Math.cos(a) * 60}" y1="${300 + Math.sin(a) * 50}" x2="${500 + Math.cos(a) * 900}" y2="${300 + Math.sin(a) * 700}" style="animation-delay:${(i % 4) * 0.12}s"/>`; }).join('')}
        </g>
        <path d="M494 300 L300 720 M506 300 L700 720" stroke="#59606C" stroke-width="5"/>
        ${[0, 1, 2, 3, 4, 5, 6].map(i => `<g class="seg" style="animation-delay:${(i * 0.26).toFixed(2)}s">
          <path d="M335 560 L335 330 A165 175 0 0 1 665 330 L665 560" fill="none" stroke="#353C48" stroke-width="12"/>
          <line x1="350" y1="560" x2="650" y2="560" stroke="#4A515E" stroke-width="9"/>
          <circle cx="352" cy="352" r="18" fill="url(#arLamp)"/><circle cx="648" cy="352" r="18" fill="url(#arLamp)"/></g>`).join('')}
        <circle class="portal" cx="500" cy="300" r="34" fill="url(#arGlow)"/>
      </g>`,
  },
  flight: {
    caption: ['Descending over the lakes…', 'Benvenuti in Ticino!'],
    svg: () => `
      <defs><linearGradient id="arSky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FA9DA"/><stop offset="1" stop-color="#CFE5F5"/></linearGradient></defs>
      <rect x="-500" y="-500" width="2000" height="1600" fill="#EDF1E4"/>
      <g class="ar-ground">
        <g transform="translate(-150 -10)">
          <path d="${GEO.wood}" fill="#CFE0BF"/><path d="${GEO.town}" fill="#E4E1D8"/>
          <path d="${GEO.lake}" fill="#8EC1E1" fill-rule="evenodd" stroke="#6FA8CF" stroke-width="2"/>
          <path d="${GEO.roads}" fill="none" stroke="#fff" stroke-width="2"/>
        </g>
      </g>
      <g class="ar-clouds">
        <rect x="-500" y="-500" width="2000" height="1600" fill="url(#arSky2)" class="ar-skyfill"/>
        <g class="cl cl-l">${cloud(120, 160, 1.6)}${cloud(260, 420, 1.3)}${cloud(40, 330, 1.1)}</g>
        <g class="cl cl-r">${cloud(700, 140, 1.4)}${cloud(820, 380, 1.7)}${cloud(560, 470, 1.2)}</g>
        <g class="plane"><path d="M0 0 l60 8 l18 -16 l8 2 l-8 20 l40 5 l14 -10 l6 1 l-6 13 l6 13 l-6 1 l-14 -10 l-40 5 l8 20 l-8 2 l-18 -16 l-60 8 z" fill="#fff" opacity=".9"/></g>
      </g>`,
  },
  car: {
    caption: ['Down the Tremola, the old road over the Gotthard Pass…', 'Benvenuti in Ticino!'],
    svg: () => `
      <defs><linearGradient id="arSky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CCBEB"/><stop offset="1" stop-color="#EEF6FA"/></linearGradient>
        ${skyDefs()}</defs>
      <g class="ar-pan">
        <rect x="-500" y="-500" width="2000" height="2600" fill="url(#arSky3)"/>
        <path d="M-200 520 L120 120 L260 260 L420 40 L620 300 L760 140 L1200 560 V1500 H-200 Z" fill="#9DB48F"/>
        <path d="M300 60 L420 40 L470 110 L400 95 Z M720 170 L760 140 L800 180 Z" fill="#fff" opacity=".9"/>
        <path d="M-200 600 L200 380 L560 560 L900 420 L1200 640 V1500 H-200 Z" fill="#88A57C"/>
        <path class="road" d="M420 330 C620 340 640 380 440 395 C250 410 260 450 470 460 C690 470 700 510 480 525 C270 540 280 585 500 595 C700 605 700 650 520 665 C380 680 420 760 500 800"
          fill="none" stroke="#8B8F96" stroke-width="10" stroke-linecap="round"/>
        <path d="M420 330 C620 340 640 380 440 395 C250 410 260 450 470 460 C690 470 700 510 480 525 C270 540 280 585 500 595 C700 605 700 650 520 665 C380 680 420 760 500 800"
          fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="10 10"/>
        <g class="car"><rect x="-13" y="-8" width="26" height="16" rx="5" fill="#C2410C"/><rect x="-1" y="-6" width="9" height="12" rx="3" fill="#FFE1D0"/>
          <animateMotion dur="2.8s" begin="0.2s" fill="freeze" rotate="auto" path="M420 330 C620 340 640 380 440 395 C250 410 260 450 470 460 C690 470 700 510 480 525 C270 540 280 585 500 595 C700 605 700 650 520 665 C380 680 420 760 500 800"/></g>
        <g transform="translate(0 820)">${landscape()}</g>
      </g>`,
  },
};

function cloud(x, y, k) {
  return `<g transform="translate(${x} ${y}) scale(${k})" fill="#fff" opacity=".96"><ellipse cx="0" cy="0" rx="90" ry="38"/><ellipse cx="-55" cy="12" rx="55" ry="28"/><ellipse cx="60" cy="10" rx="60" ry="30"/><ellipse cx="10" cy="-26" rx="50" ry="30"/></g>`;
}

function skyDefs() {
  return `<linearGradient id="arSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FB0E3"/><stop offset=".75" stop-color="#CFE6F4"/><stop offset="1" stop-color="#F6EEDC"/></linearGradient>
    <linearGradient id="arLake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E9FCF"/><stop offset="1" stop-color="#8DC3E6"/></linearGradient>
    <radialGradient id="arSun"><stop offset="0" stop-color="#FFF8DC"/><stop offset=".5" stop-color="#FFE9A8" stop-opacity=".7"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>`;
}

// the view that opens up when you reach Ticino: the lake, San Salvatore's cone,
// Monte Brè, a lakeside village with red roofs and a bell tower, palms
function landscape() {
  const houses = [[300, 22, 18], [328, 18, 22], [352, 26, 16], [384, 20, 20], [520, 24, 18], [552, 18, 24], [580, 26, 17], [612, 20, 21], [640, 22, 16]]
    .map(([x, w, h]) => `<rect x="${x}" y="${428 - h}" width="${w}" height="${h}" fill="#F1E6D2"/><path d="M${x - 2} ${428 - h} L${x + w / 2} ${428 - h - 9} L${x + w + 2} ${428 - h} Z" fill="#C2553A"/><rect x="${x + w / 2 - 2}" y="${428 - h / 2}" width="4" height="5" fill="#7A8794"/>`).join('');
  const palm = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M0 0 q3 -40 -2 -78" stroke="#7A6A4F" stroke-width="7" fill="none"/><path d="M-2 -78 q-36 -10 -54 14 M-2 -78 q36 -12 54 12 M-2 -78 q-16 -32 -44 -32 M-2 -78 q16 -32 44 -30 M-2 -78 q-2 -30 6 -44" stroke="#3F8A45" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
  return `
    <rect x="-500" y="-80" width="2000" height="760" fill="url(#arSky)"/>
    <circle cx="790" cy="120" r="90" fill="url(#arSun)"/>
    ${cloud(180, 90, .45)}${cloud(600, 60, .35)}
    <path d="M-200 330 L40 220 L160 260 L300 170 L420 240 L560 150 L700 230 L860 160 L1200 300 V460 H-200 Z" fill="#B9CCD9"/>
    <path d="M290 175 L300 170 L314 178 Z M550 156 L560 150 L574 160 Z M850 166 L860 160 L873 168 Z" fill="#fff"/>
    <path d="M-200 400 L60 330 L180 360 L320 300 L460 350 L600 290 L760 330 L960 270 L1200 330 V480 H-200 Z" fill="#9DB591"/>
    <path d="M110 430 L235 225 L250 222 L370 430 Z" fill="#86A57A"/>
    <path d="M760 430 C800 330 880 280 960 290 C1040 300 1120 360 1200 380 V440 Z" fill="#8FAE82"/>
    <path d="M-200 422 C100 414 400 432 1200 418 V470 H-200 Z" fill="#8FAE82"/>
    ${houses}
    <rect x="466" y="372" width="14" height="56" fill="#E8DCC4"/><path d="M462 372 L473 344 L484 372 Z" fill="#9A4A33"/><circle cx="473" cy="388" r="3" fill="#7A8794"/>
    <path d="M-200 432 C100 426 500 440 1200 428 V800 H-200 Z" fill="url(#arLake)"/>
    <path d="M150 436 L240 560 L330 436 Z" fill="#86A57A" opacity=".18"/>
    <g class="shimmer" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M120 480 q16 -7 32 0 t32 0"/><path d="M420 500 q16 -7 32 0 t32 0"/><path d="M700 470 q16 -7 32 0 t32 0"/><path d="M260 560 q16 -7 32 0 t32 0"/><path d="M620 580 q16 -7 32 0 t32 0"/>
    </g>
    <rect x="-200" y="560" width="1400" height="60" fill="#D9CDB4"/><rect x="-200" y="556" width="1400" height="6" fill="#B8AC93"/>
    ${palm(880, 580, 1.15)}${palm(960, 590, .9)}${palm(90, 585, 1)}`;
}

export function playArrival(mode = 'train') {
  return new Promise(resolve => {
    const sc = SCENES[mode] || SCENES.train;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ov = document.createElement('div');
    ov.className = `arrival ar-${mode}${reduced ? ' still' : ''}`;
    ov.setAttribute('role', 'status');
    ov.innerHTML = `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${sc.svg()}</svg>
      <p class="ar-cap"><span class="c1">${sc.caption[0]}</span><span class="c2">${sc.caption[1]}</span></p>
      <button class="btn small ghost ar-skip">Skip</button>`;
    document.body.appendChild(ov);
    let done = false;
    const end = () => {
      if (done) return; done = true;
      ov.classList.add('out');
      setTimeout(() => { ov.remove(); resolve(); }, 600);
    };
    ov.querySelector('.ar-skip').onclick = end;
    ov.querySelector('.ar-skip').focus({ preventScroll: true });
    setTimeout(end, reduced ? 1800 : 4800);
  });
}

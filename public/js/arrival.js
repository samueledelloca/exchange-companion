// Arrival scenes: a short full-screen transition between "before departure" and
// Lugano, depending on how the student travels. About 4.5 s, skippable; with
// reduced motion the last frame is shown briefly instead.
import { GEO } from './geo.js';

const SCENES = {
  train: {
    caption: ['Through the Gotthard Base Tunnel, 57 km under the Alps…', 'Benvenuti in Ticino!'],
    svg: () => `
      <defs>
        <linearGradient id="arSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FC4EA"/><stop offset="1" stop-color="#E9F3F9"/></linearGradient>
        <radialGradient id="arGlow"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#FFF6D6"/><stop offset="1" stop-color="#FFF6D6" stop-opacity="0"/></radialGradient>
      </defs>
      <g class="ar-land">${landscape()}</g>
      <g class="ar-tunnel">
        <rect x="-500" y="-500" width="2000" height="1600" fill="#0E1116"/>
        ${[0, 1, 2, 3, 4, 5].map(i => `<g class="ring" style="animation-delay:${i * 0.33}s"><ellipse cx="500" cy="300" rx="260" ry="210" fill="none" stroke="#3A4150" stroke-width="14"/><circle cx="270" cy="230" r="5" fill="#FFD36A"/><circle cx="730" cy="230" r="5" fill="#FFD36A"/></g>`).join('')}
        <circle class="portal" cx="500" cy="300" r="40" fill="url(#arGlow)"/>
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
        <linearGradient id="arSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FC4EA"/><stop offset="1" stop-color="#E9F3F9"/></linearGradient></defs>
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

// the view that opens up when you reach Ticino: mountains, the lake, a palm
function landscape() {
  return `
    <rect x="-500" y="-80" width="2000" height="760" fill="url(#arSky)"/>
    <path d="M-200 360 L120 150 L260 250 L430 110 L600 260 L780 140 L1200 380 V700 H-200 Z" fill="#A8BF9C"/>
    <path d="M400 135 L430 110 L462 138 L438 132 Z M752 160 L780 140 L812 162 Z" fill="#fff" opacity=".9"/>
    <path d="M-200 420 L200 300 L520 400 L860 290 L1200 430 V700 H-200 Z" fill="#8FAE82"/>
    <path d="M-200 470 C200 430 500 500 1200 455 V800 H-200 Z" fill="#7DB4DA"/>
    <g stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"><path d="M200 520 q16 -8 32 0 t32 0"/><path d="M640 560 q16 -8 32 0 t32 0"/></g>
    <g transform="translate(860 470)"><path d="M0 0 v-70" stroke="#7A6A4F" stroke-width="6"/><path d="M0 -70 q-34 -10 -50 14 M0 -70 q34 -10 50 14 M0 -70 q-14 -30 -40 -30 M0 -70 q14 -30 40 -30" stroke="#4E9A4E" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
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

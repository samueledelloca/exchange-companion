// Arrival scenes: a short full-screen transition between "before departure" and
// Lugano, depending on how the student travels. About 4.5 s, skippable; with
// reduced motion the last frame is shown briefly instead.
import { GEO } from './geo.js';

const SCENES = {
  train: {
    duration: 4800,
    caption: () => ['Through the Gotthard Base Tunnel, 57 km under the Alps…', 'Benvenuti in Ticino!'],
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
    duration: 6000,
    caption: via => ['Over the Alps, the lakes below…', via === 'zurich' ? 'Landed in Zurich, then the train south through the Gotthard… Benvenuti in Ticino!' : 'Landed in Milan. An hour on the bus, and… Benvenuti in Ticino!'],
    svg: () => `
      <defs>
        ${skyDefs()}
        <linearGradient id="arCabin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9CED6"/><stop offset=".5" stop-color="#E7E9ED"/><stop offset="1" stop-color="#C3C9D1"/></linearGradient>
        <linearGradient id="arHigh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E7CC0"/><stop offset=".55" stop-color="#A9CDEB"/><stop offset="1" stop-color="#E6EEF2"/></linearGradient>
        <linearGradient id="arWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2F4F7"/><stop offset="1" stop-color="#AEB6C2"/></linearGradient>
        <clipPath id="arWin"><rect x="335" y="95" width="330" height="410" rx="150"/></clipPath>
      </defs>
      <g class="ar-land">${landscape()}</g>
      <g class="ar-cabin">
        <rect x="-500" y="-500" width="2000" height="1600" fill="url(#arCabin)"/>
        <path d="M-500 60 H1500 M-500 545 H1500" stroke="#B5BCC6" stroke-width="3"/>
        <rect x="310" y="70" width="380" height="460" rx="170" fill="#F4F5F7" stroke="#B8BFC9" stroke-width="3"/>
        <rect x="325" y="85" width="350" height="430" rx="158" fill="#D9DEE5"/>
        <g clip-path="url(#arWin)">
          <g class="ar-out">
            <rect x="200" y="60" width="600" height="500" fill="url(#arHigh)"/>
            <path d="M200 255 L240 238 L262 246 L290 226 L318 240 L350 222 L380 236 L410 218 L440 232 L470 214 L505 230 L540 216 L575 234 L610 220 L650 238 L690 224 L730 240 L800 232 V300 H200 Z" fill="#E8EEF3"/>
            <path d="M200 300 L250 262 L300 284 L360 252 L420 280 L480 248 L540 276 L600 250 L660 278 L720 256 L800 280 V560 H200 Z" fill="#8FA88A"/>
            <path d="M250 262 L268 270 L282 266 Z M360 252 L380 262 L392 258 Z M480 248 L498 258 L510 255 Z M600 250 L620 260 L632 256 Z M720 256 L738 264 L750 261 Z" fill="#fff"/>
            <path d="M200 340 L280 300 L360 330 L450 296 L540 334 L640 300 L800 340 V560 H200 Z" fill="#7C9A74"/>
            <path d="M200 420 L300 392 L420 430 L560 398 L680 436 L800 410 V560 H200 Z" fill="#6E8E66" opacity=".45"/>
            <path d="M378 520 C384 450 394 392 410 340 C418 322 434 326 430 348 C420 404 414 460 412 520 Z" fill="#5E9FD0" stroke="#EAF4FB" stroke-width="1.5"/>
            <path d="M470 470 C486 430 506 396 530 376 C544 364 560 368 556 384 C548 406 566 420 594 418 C624 416 640 428 628 440 C612 452 586 448 566 452 C544 458 534 480 528 500 C522 516 500 516 498 500 C496 488 482 488 470 470 Z" fill="#5E9FD0" stroke="#EAF4FB" stroke-width="1.5"/>
            <path d="M610 520 C620 470 640 430 662 400 C670 390 684 394 680 408 C668 440 652 480 646 520 Z" fill="#5E9FD0" stroke="#EAF4FB" stroke-width="1.5"/>
            <g class="ar-wisps" fill="#fff" opacity=".8">${cloud(330, 300, .45)}${cloud(700, 330, .5)}${cloud(860, 450, .45)}</g>
          </g>
          <path class="ar-wingp" d="M340 560 L450 500 L585 482 L596 488 L470 520 L372 575 Z" fill="url(#arWing)"/>
          <circle cx="590" cy="485" r="3.5" fill="#E04848"/>
        </g>
        <rect x="325" y="85" width="350" height="70" fill="#EEF0F3" class="ar-shade" clip-path="url(#arWin)"/>
        <rect x="325" y="153" width="350" height="4" fill="#D3D8DF" clip-path="url(#arWin)"/>
        <rect x="325" y="85" width="350" height="430" rx="158" fill="none" stroke="#C6CCD5" stroke-width="10"/>
        <rect x="-500" y="470" width="300" height="200" rx="40" fill="#5B6578" opacity=".25"/>
      </g>`,
  },
  car: {
    duration: 6000,
    caption: () => ['Down the Tremola, the old cobbled road of the Gotthard Pass…', 'Benvenuti in Ticino!'],
    svg: () => {
      // hairpins in perspective: narrow and far at the top, wide and close at the bottom
      const ys = [150, 178, 214, 262, 324, 404, 506], amp = k => 36 + k * 62;
      let d = '', segs = '';
      for (let k = 0; k < ys.length - 1; k++) {
        const side = k % 2 ? -1 : 1, a = amp(k), a2 = amp(k + 1), y = ys[k], y2 = ys[k + 1], r = (y2 - y) * 0.75;
        const x0 = 500 - side * a, x1 = 500 + side * a, xn = 500 + side * a2;
        const run = `M${x0} ${y} L${x1} ${y + 4}`, turn = `C${x1 + side * r} ${y + 4} ${xn + side * r} ${y2} ${xn} ${y2}`;
        d += (k ? ` L${x1} ${y + 4} ` : `M${x0} ${y} L${x1} ${y + 4} `) + turn;
        const w = 3 + k * 3.2;
        segs += `<path d="${run} ${turn}" fill="none" stroke="#7C7466" stroke-width="${w + 4}" stroke-linecap="round" transform="translate(0 ${1 + k})"/>
          <path d="${run} ${turn}" fill="none" stroke="#A2978A" stroke-width="${w}" stroke-linecap="round"/>
          <path d="${run} ${turn}" fill="none" stroke="#C2B8AA" stroke-width="${Math.max(1, w * 0.45)}" stroke-dasharray="${1 + k * 0.6} ${2 + k}" stroke-linecap="round"/>`;
      }
      // conifers along the slopes, smaller towards the pass
      const trees = [[150, 300], [230, 250], [820, 270], [905, 330], [120, 420], [940, 450], [330, 560], [700, 560], [860, 600], [60, 330], [610, 205], [380, 215]]
        .map(([x, y]) => { const k = 0.35 + (y - 190) / 420; return `<path d="M${x} ${y - 34 * k} L${x - 13 * k} ${y} L${x + 13 * k} ${y} Z" fill="#4F7A4A"/><rect x="${x - 2 * k}" y="${y}" width="${4 * k}" height="${6 * k}" fill="#6B5A44"/>`; }).join('');
      return `
      <defs>${skyDefs()}<linearGradient id="arPass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8DBBE3"/><stop offset="1" stop-color="#E4EEF4"/></linearGradient></defs>
      <g class="ar-pass">
        <rect x="-500" y="-500" width="2000" height="1600" fill="url(#arPass)"/>
        <path d="M-200 260 L60 70 L210 170 L330 40 L470 150 L600 30 L740 140 L880 60 L1200 250 V700 H-200 Z" fill="#A9B7BF"/>
        <path d="M300 70 L330 40 L362 74 L344 70 L330 82 L316 70 Z M572 58 L600 30 L630 62 L612 58 L600 70 L588 58 Z M852 86 L880 60 L908 88 L892 84 L880 94 Z M40 86 L60 70 L84 90 Z" fill="#fff"/>
        <path d="M-200 220 C100 190 300 140 500 135 C700 140 900 190 1200 220 V700 H-200 Z" fill="#9FB38F"/>
        <ellipse cx="420" cy="140" rx="34" ry="6" fill="#7FB0D6"/>
        <g transform="translate(560 120)"><rect x="0" y="0" width="34" height="18" fill="#C9C2B4"/><path d="M-3 0 L17 -10 L37 0 Z" fill="#6B6159"/><rect x="6" y="6" width="5" height="5" fill="#5B6578"/><rect x="22" y="6" width="5" height="5" fill="#5B6578"/></g>
        <path d="M-200 700 L-200 260 C0 300 160 420 250 700 Z" fill="#7F9A70"/>
        <path d="M1200 700 L1200 260 C1000 300 840 420 750 700 Z" fill="#7F9A70"/>
        ${trees}
        ${segs}
        <g transform="translate(225 452)"><rect x="-3" y="0" width="6" height="70" fill="#5B6578"/><rect x="-62" y="-36" width="124" height="40" rx="5" fill="#2F6E3B"/><text x="0" y="-11" text-anchor="middle" font-size="17" font-weight="800" fill="#fff" font-family="Plus Jakarta Sans, sans-serif">Airolo, Ticino</text></g>
        <g class="car">
          <g transform="rotate(0)"><rect x="-13" y="-7" width="26" height="14" rx="5" fill="#C2410C"/><rect x="2" y="-5.5" width="6" height="11" rx="2" fill="#2E3A4A"/><rect x="-9" y="-5.5" width="5" height="11" rx="2" fill="#2E3A4A"/><rect x="-4" y="-5" width="6" height="10" rx="1.5" fill="#E2622A"/></g>
          <animateMotion dur="3.6s" begin="0.2s" fill="freeze" rotate="auto" path="${d}"/>
          <animateTransform attributeName="transform" type="scale" values="0.45;1.9" dur="3.6s" begin="0.2s" fill="freeze" additive="sum"/></g>
      </g>
      <g class="ar-land">${landscape()}</g>`;
    },
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

export function playArrival(mode = 'train', via = 'milan') {
  return new Promise(resolve => {
    const sc = SCENES[mode] || SCENES.train;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ov = document.createElement('div');
    ov.className = `arrival ar-${mode}${reduced ? ' still' : ''}`;
    ov.setAttribute('role', 'status');
    ov.innerHTML = `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${sc.svg()}</svg>
      <p class="ar-cap"><span class="c1">${sc.caption(via)[0]}</span><span class="c2">${sc.caption(via)[1]}</span></p>
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
    setTimeout(end, reduced ? 1800 : sc.duration);
  });
}

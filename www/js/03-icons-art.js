

/* =========================================================================
   LUMIDRA — icônes SVG (aucune dépendance externe, style "lucide")
   viewBox 0 0 24 24, stroke-based, remplace lucide-react
   ========================================================================= */

function polarPoint(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function starPath(cx, cy, rOuter, rInner, points) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const [x, y] = polarPoint(cx, cy, r, (360 / (points * 2)) * i);
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
  }
  return d + 'Z';
}

function sunRays(cx, cy, rInner, rOuter, count) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const [x1, y1] = polarPoint(cx, cy, rInner, (360 / count) * i);
    const [x2, y2] = polarPoint(cx, cy, rOuter, (360 / count) * i);
    out += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`;
  }
  return out;
}

function gearTeeth(cx, cy, rInner, rOuter, count, toothWidthDeg) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const mid = (360 / count) * i;
    const a1 = mid - toothWidthDeg / 2, a2 = mid + toothWidthDeg / 2;
    const [ix1, iy1] = polarPoint(cx, cy, rInner, a1);
    const [ox1, oy1] = polarPoint(cx, cy, rOuter, a1);
    const [ox2, oy2] = polarPoint(cx, cy, rOuter, a2);
    const [ix2, iy2] = polarPoint(cx, cy, rInner, a2);
    out += `<path d="M${ix1.toFixed(2)},${iy1.toFixed(2)} L${ox1.toFixed(2)},${oy1.toFixed(2)} L${ox2.toFixed(2)},${oy2.toFixed(2)} L${ix2.toFixed(2)},${iy2.toFixed(2)}"/>`;
  }
  return out;
}

const ICON_INNER = {
  home: '<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-4v-6H8v6H4a1 1 0 0 1-1-1Z"/>',
  'book-open': '<path d="M2 5c2-1 5-1 7 0v13c-2-1-5-1-7 0z"/><path d="M22 5c-2-1-5-1-7 0v13c2-1 5-1 7 0z"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v15l-6 2-6-2-6 2z"/><path d="M9 4v15"/><path d="M15 6v15"/>',
  'shopping-bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  settings: `<circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="7.5"/>${gearTeeth(12, 12, 7.5, 10.2, 8, 18)}`,
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  sparkles: `<path d="${starPath(12, 12, 9, 2.4, 4)}"/><path d="${starPath(19, 6, 3, 1, 4)}"/>`,
  lock: '<rect x="3.5" y="11" width="17" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3.4.9-4.5 2.3C10.9 3.9 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 2.6-6.3L3 8"/><path d="M3 3v5h5"/>',
  shield: '<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"/>',
  star: `<path d="${starPath(12, 12, 9.5, 3.9, 5)}"/>`,
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5v5.7l3.8 2.2"/>',
  flame: '<path transform="translate(12,12.5) scale(1.55) translate(0,-1)" d="M0,-10 C6,-4 6,4 0,10 C-6,4 -6,-4 0,-10 Z"/>',
  droplet: '<path transform="translate(12,12) rotate(180) scale(1.55)" d="M0,-10 C6,-4 6,4 0,10 C-6,4 -6,-4 0,-10 Z"/>',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  wind: '<path d="M2 8 Q10 4 18 8"/><path d="M2 12.5 Q14 8.5 22 12.5"/><path d="M2 17 Q8 21 14 17"/>',
  sun: `<circle cx="12" cy="12" r="4.2"/>${sunRays(12, 12, 6.6, 9.6, 8)}`,
  leaf: '<path transform="translate(12,12) rotate(-20) scale(1.55)" d="M0,-10 C6,-4 6,4 0,10 C-6,4 -6,-4 0,-10 Z"/><line transform="translate(12,12) rotate(-20) scale(1.55)" x1="0" y1="-7" x2="0" y2="7"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 19h16"/>',
  upload: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M4 19h16"/>',
  flask: '<path d="M9 2v6.5L4 18a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3L15 8.5V2"/><path d="M7 16h10"/><path d="M8.5 2h7"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
};

/**
 * icon(name, opts) → chaîne SVG. opts: {size, color, strokeWidth, className}
 */
function icon(name, opts) {
  opts = opts || {};
  const size = opts.size || 18;
  const color = opts.color || 'currentColor';
  const sw = opts.strokeWidth || 2;
  const cls = opts.className ? ` class="${opts.className}"` : '';
  const inner = ICON_INNER[name] || '';
  return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}


/* =========================================================================
   LUMIDRA — art procédural des dragons et des œufs (SVG, sans dépendance)
   V2 : ailes proéminentes façon chauve-souris (toujours visibles dès le
   stade juvénile), épines dorsales, museau et canine — plus proche de
   l'archétype visuel du dragon tout en restant doux et non-menaçant.
   ========================================================================= */

let __svgUidCounter = 0;
function nextSvgUid() { return 'u' + (__svgUidCounter++); }

function teardropPath(cx, cy, scale, rotation) {
  return `<path transform="translate(${cx},${cy}) rotate(${rotation}) scale(${scale})" d="M0,-10 C6,-4 6,4 0,10 C-6,4 -6,-4 0,-10 Z"`;
}

function elementAccentsSVG(element, variant, tailX, tailY, headX, headY) {
  const c = ELEMENTS[element];
  const tailScale = [0.8, 1.0, 1.15, 1.3, 1.4][variant];
  const headScale = [0, 0, 0.7, 0.9, 1.0][variant];
  let out = '';

  if (element === 'feu') {
    out += `${teardropPath(tailX, tailY, tailScale, 0)} fill="${c.base}" stroke="${c.deep}" stroke-width="${1.1 * tailScale}"/>`;
    if (headScale) out += `${teardropPath(headX, headY, headScale, 0)} fill="${c.light}" stroke="${c.base}" stroke-width="${1.1 * headScale}"/>`;
  } else if (element === 'eau') {
    out += `${teardropPath(tailX, tailY, tailScale, 180)} fill="${c.base}" opacity="0.9" stroke="${c.deep}" stroke-width="${1.1 * tailScale}"/>`;
    if (headScale) out += `${teardropPath(headX, headY, headScale, 180)} fill="${c.light}" opacity="0.9" stroke="${c.base}" stroke-width="${1.1 * headScale}"/>`;
  } else if (element === 'terre') {
    out += `<path transform="translate(${tailX},${tailY}) scale(${tailScale})" d="M-8,6 L-4,-7 L6,-8 L9,4 L2,9 Z" fill="${c.deep}"/>`;
    if (headScale) out += `<path transform="translate(${headX},${headY}) scale(${headScale})" d="M-8,6 L-4,-7 L6,-8 L9,4 L2,9 Z" fill="${c.base}"/>`;
  } else if (element === 'air') {
    const cloud = (cx, cy, s) => `<g transform="translate(${cx},${cy}) scale(${s})" opacity="0.85"><circle cx="-6" cy="2" r="5" fill="${c.light}"/><circle cx="0" cy="-3" r="6" fill="${c.light}"/><circle cx="6" cy="2" r="5" fill="${c.light}"/></g>`;
    out += cloud(tailX, tailY, tailScale);
    out += cloud((tailX + headX) / 2, (tailY + headY) / 2 + 10, tailScale * 0.7);
    if (headScale) out += cloud(headX, headY, headScale);
  } else if (element === 'lumiere') {
    const star = (cx, cy, s, fill) => `<path transform="translate(${cx},${cy}) scale(${s})" d="M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5 Z" fill="${fill}"/>`;
    out += star(tailX, tailY, tailScale, c.base);
    out += star(headX - 14, headY - 6, Math.max(0.6, headScale), c.base);
    out += star(headX + 16, headY + 4, Math.max(0.5, headScale * 0.8), c.light);
  } else { // nature
    const leaf = (cx, cy, s, rot) => `<g transform="translate(${cx},${cy}) rotate(${rot}) scale(${s})"><path d="M0,-10 C6,-4 6,4 0,10 C-6,4 -6,-4 0,-10 Z" fill="${c.base}"/><line x1="0" y1="-7" x2="0" y2="7" stroke="${c.deep}" stroke-width="1.1" stroke-linecap="round"/></g>`;
    out += leaf(tailX, tailY, tailScale, -20);
    if (headScale) {
      out += leaf(headX, headY, headScale, 15);
      if (variant >= 3) {
        let petals = '';
        for (let i = 0; i < 5; i++) {
          const a = (i * 72 - 90) * Math.PI / 180;
          petals += `<circle cx="${(Math.cos(a) * 6).toFixed(2)}" cy="${(Math.sin(a) * 6).toFixed(2)}" r="4" fill="${c.light}"/>`;
        }
        out += `<g transform="translate(${headX + 18},${headY - 4}) scale(0.9)">${petals}<circle cx="0" cy="0" r="3" fill="${c.deep}"/></g>`;
      }
    }
  }
  return out;
}

function hornsSVG(variant, fill) {
  const s = `stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"`;
  if (variant === 0) return `<path d="M100,34 L94,52 L106,52 Z" fill="${fill}" ${s}/>`;
  if (variant === 1) return `<path d="M82,42 L76,58 L88,58 Z" fill="${fill}" ${s}/><path d="M118,42 L124,58 L112,58 Z" fill="${fill}" ${s}/>`;
  if (variant === 2) return `<path d="M85,46 Q78,28 90,24 Q85,38 88,48 Z" fill="${fill}" ${s}/><path d="M115,46 Q122,28 110,24 Q115,38 112,48 Z" fill="${fill}" ${s}/>`;
  return `<path d="M85,44 Q75,22 90,18 Q84,36 87,47 Z" fill="${fill}" ${s}/><path d="M115,44 Q125,22 110,18 Q116,36 113,47 Z" fill="${fill}" ${s}/>
    <path d="M70,58 L62,50 L68,64 Z" fill="${fill}" opacity="0.85" ${s}/><path d="M130,58 L138,50 L132,64 Z" fill="${fill}" opacity="0.85" ${s}/>`;
}

const WING_MEMBRANE_D = 'M0,0 L14,-34 Q28,-28 30,-14 L52,-6 Q54,12 39,20 Q19,25 0,6 Z';
const WING_STRUTS = [
  { x: 14, y: -34 },
  { x: 30, y: -14 },
  { x: 52, y: -6 },
];

/* =========================================================================
   ACCESSOIRES COSMÉTIQUES — purement visuels, aucun effet de jeu. S'équipent
   par dragon (chapeau + collier), achetables une fois pour toutes en écailles
   ou distribués via la Voie du Gardien.
   ========================================================================= */
const ACCESSORIES = [
  { id: 'couronne-or', slot: 'hat', nameFr: 'Couronne Dorée', nameEn: 'Golden Crown', cost: 90 },
  { id: 'chapeau-paille', slot: 'hat', nameFr: 'Chapeau de Paille', nameEn: 'Straw Hat', cost: 60 },
  { id: 'bonnet-hiver', slot: 'hat', nameFr: 'Bonnet Douillet', nameEn: 'Cosy Bobble Hat', cost: 60 },
  { id: 'diademe-astral', slot: 'hat', nameFr: 'Diadème Astral', nameEn: 'Star Diadem', cost: 110 },
  { id: 'echarpe-rayee', slot: 'collar', nameFr: 'Écharpe Rayée', nameEn: 'Striped Scarf', cost: 55 },
  { id: 'collier-perles', slot: 'collar', nameFr: 'Collier de Perles', nameEn: 'Pearl Necklace', cost: 85 },
  { id: 'noeud-papillon', slot: 'collar', nameFr: 'Nœud Papillon', nameEn: 'Bow Tie', cost: 50 },
  { id: 'collier-floral', slot: 'collar', nameFr: 'Collier Floral', nameEn: 'Flower Garland', cost: 70 },
  { id: 'grelot-doux', slot: 'charm', nameFr: 'Grelot Doux', nameEn: 'Soft Bell', cost: 45 },
  { id: 'ruban-queue', slot: 'charm', nameFr: 'Ruban de Queue', nameEn: 'Tail Ribbon', cost: 45 },
  { id: 'gemme-lune', slot: 'charm', nameFr: 'Gemme de Lune', nameEn: 'Moon Gem', cost: 95 },
  { id: 'etoile-filante', slot: 'charm', nameFr: 'Breloque Étoile', nameEn: 'Shooting Star Charm', cost: 80 },
];
const ACCESSORIES_BY_ID = new Map(ACCESSORIES.map(a => [a.id, a]));
function accessoryById(id) { return ACCESSORIES_BY_ID.get(id); }

// Fragments SVG des accessoires. Les "hat" se placent DANS le groupe de la tête (ils suivent
// donc automatiquement sa mise à l'échelle par stade) ; les "collar" se placent au niveau du cou,
// hors du groupe tête, dans l'espace du corps.
function accessorySVGFragment(accId) {
  const s = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
  switch (accId) {
    case 'couronne-or': return `
      <path d="M76,40 L82,20 L91,32 L100,16 L109,32 L118,20 L124,40 Z" fill="#F4C548" ${s}/>
      <circle cx="91" cy="30" r="2.6" fill="#E0553F"/><circle cx="100" cy="24" r="2.8" fill="#4E8FD9"/><circle cx="109" cy="30" r="2.6" fill="#4FAE6B"/>`;
    case 'chapeau-paille': return `
      <ellipse cx="100" cy="40" rx="36" ry="7" fill="#E3C27E" ${s}/>
      <path d="M78,38 Q100,4 122,38 Q100,26 78,38 Z" fill="#EDD39A" ${s}/>
      <rect x="83" y="30" width="34" height="6" rx="3" fill="#B5502C" opacity="0.85"/>`;
    case 'bonnet-hiver': return `
      <path d="M74,42 Q76,10 100,10 Q124,10 126,42 Z" fill="#C7503A" ${s}/>
      <rect x="72" y="38" width="56" height="8" rx="4" fill="#F4EDE0" ${s}/>
      <circle cx="100" cy="10" r="7" fill="#F4EDE0" ${s}/>`;
    case 'diademe-astral': return `
      <path d="M74,44 Q100,26 126,44" fill="none" stroke="#8FA6D9" stroke-width="4" stroke-linecap="round"/>
      <path d="M100,20 l2.6,6.4 6.8,0.6 -5.2,4.6 1.6,6.8 -5.8,-3.6 -5.8,3.6 1.6,-6.8 -5.2,-4.6 6.8,-0.6 Z" fill="#F4EDE0" ${s}/>
      <circle cx="80" cy="38" r="2.4" fill="#8FA6D9"/><circle cx="120" cy="38" r="2.4" fill="#8FA6D9"/>`;
    case 'echarpe-rayee': return `
      <path d="M74,100 Q100,116 126,100 L126,110 Q100,126 74,110 Z" fill="#E0553F" ${s}/>
      <path d="M80,100 L80,110 M92,102 L92,113 M108,102 L108,113 M120,100 L120,110" stroke="#F4EDE0" stroke-width="4"/>
      <path d="M78,108 L72,128 L82,124 Z" fill="#E0553F" ${s}/>`;
    case 'collier-perles': return `
      <path d="M72,98 Q100,120 128,98" fill="none" stroke="none"/>
      ${[72, 84, 96, 100, 104, 116, 128].map((x, i) => `<circle cx="${x}" cy="${98 + Math.sin((i / 6) * Math.PI) * 20}" r="4.2" fill="#F4EDE0" ${s}/>`).join('')}`;
    case 'noeud-papillon': return `
      <path d="M86,104 L98,98 L98,112 Z" fill="#4E8FD9" ${s}/>
      <path d="M114,104 L102,98 L102,112 Z" fill="#4E8FD9" ${s}/>
      <rect x="97" y="100" width="6" height="8" rx="2" fill="#2F5A96" ${s}/>`;
    case 'collier-floral': return `
      ${[78, 90, 100, 110, 122].map((x, i) => {
        const y = 96 + Math.sin((i / 4) * Math.PI) * 16;
        return `<g transform="translate(${x},${y})">
          <circle r="3" cy="-4" fill="#F2A6C4"/><circle r="3" cx="4" cy="2" fill="#F2A6C4"/><circle r="3" cx="-4" cy="2" fill="#F2A6C4"/>
          <circle r="2" fill="#F4C548"/>
        </g>`;
      }).join('')}`;
    case 'grelot-doux': return `
      <g transform="translate(166,146)">
        <path d="M-2,-14 Q0,-18 2,-14 L2,-8 L-2,-8 Z" fill="#B7AF9E" ${s}/>
        <circle r="8" fill="#F4C548" ${s}/>
        <path d="M-8,1 Q0,7 8,1" stroke="${INK}" stroke-width="1.6" fill="none"/>
        <circle cy="4" r="1.6" fill="${INK}"/>
      </g>`;
    case 'ruban-queue': return `
      <g transform="translate(166,146) rotate(18)">
        <path d="M-2,0 L-14,-8 L-12,0 L-14,8 Z" fill="#E0553F" ${s}/>
        <path d="M2,0 L14,-8 L12,0 L14,8 Z" fill="#E0553F" ${s}/>
        <circle r="3" fill="#B5502C" ${s}/>
      </g>`;
    case 'gemme-lune': return `
      <g transform="translate(166,146)">
        <path d="M6,-10 A11,11 0 1 0 6,10 A8.5,8.5 0 1 1 6,-10 Z" fill="#8FA6D9" ${s}/>
        <circle cx="-2" cy="-4" r="1.4" fill="#F4EDE0"/>
      </g>`;
    case 'etoile-filante': return `
      <g transform="translate(166,146)">
        <path d="M0,-9 l2.4,5.8 6.2,0.6 -4.8,4 1.4,6.2 -5.2,-3.2 -5.2,3.2 1.4,-6.2 -4.8,-4 6.2,-0.6 Z" fill="#F4C548" ${s}/>
        <path d="M-14,10 L-4,4" stroke="#F4C548" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      </g>`;
    default: return '';
  }
}

function wingSVG(mirror, scale, fill, stroke) {
  const scaleX = mirror ? -scale : scale;
  let struts = '';
  WING_STRUTS.forEach(p => { struts += `<line x1="0" y1="0" x2="${p.x}" y2="${p.y}" stroke="${stroke}" stroke-width="1" opacity="0.55"/>`; });
  return `<g transform="scale(${scaleX},${scale})">
    <path d="${WING_MEMBRANE_D}" fill="${fill}" opacity="0.92" stroke="${INK}" stroke-width="3"/>
    ${struts}
  </g>`;
}

function backSpikesSVG(count, fill) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    pts.push({ x: 100 - 8 * (1 - t) - 2, y: 92 + t * 46, s: 1 - t * 0.35 });
  }
  return pts.map(p => `<path transform="translate(${p.x},${p.y}) scale(${p.s})" d="M-6,4 L0,-9 L6,4 Z" fill="${fill}"/>`).join('');
}

function dragonSVG(opts) {
  const element = opts.element, variant = opts.variant, stage = opts.stage || 'adulte', size = opts.size || 100;
  const hatId = opts.hatId || null;
  const collarId = opts.collarId || null;
  const charmId = opts.charmId || null;
  const c = ELEMENTS[element];
  const idStr = nextSvgUid();
  const gradId = `grad-${element}-${idStr}`;

  const overallScale = stage === 'bebe' ? 0.72 : stage === 'juvenile' ? 0.87 : 1.0;
  const headBoost = stage === 'bebe' ? 1.22 : stage === 'juvenile' ? 1.06 : 1.0;
  const wingsOn = stage !== 'bebe';
  const wingScale = (stage === 'juvenile' ? 0.85 : 1.0) * (0.86 + variant * 0.05);
  const hornScale = (stage === 'bebe' ? 0.7 : stage === 'juvenile' ? 0.9 : 1.0) * (1 + variant * 0.12);
  const showGlow = (variant === 3 && stage === 'adulte') || variant >= 4;
  const spikeCount = stage === 'bebe' ? 0 : 3;
  const tailTip = { x: 178, y: 150 };
  const headAccent = { x: 122, y: 46 };

  const wings = wingsOn ? `
    <g transform="translate(96,114) rotate(-14)"><g class="dragon-wing-flap">${wingSVG(false, wingScale, c.light, c.base)}</g></g>
    <g transform="translate(104,114) rotate(14)"><g class="dragon-wing-flap">${wingSVG(true, wingScale, c.light, c.base)}</g></g>` : '';

  const spikes = spikeCount > 0 ? backSpikesSVG(spikeCount, c.deep) : '';
  const legendarySparkles = variant === 4 ? `
    <circle cx="46" cy="60" r="3" fill="#FFFFFF" opacity="0.9" class="anim-pulse" style="animation-delay:0s"/>
    <circle cx="152" cy="50" r="2.4" fill="#FFFFFF" opacity="0.85" class="anim-pulse" style="animation-delay:.6s"/>
    <circle cx="140" cy="150" r="2.6" fill="#FFFFFF" opacity="0.85" class="anim-pulse" style="animation-delay:1.1s"/>` : variant === 5 ? `
    <circle cx="40" cy="55" r="3.2" fill="#FFFFFF" opacity="0.95" class="anim-pulse" style="animation-delay:0s"/>
    <circle cx="160" cy="46" r="2.6" fill="#FFF6DC" opacity="0.9" class="anim-pulse" style="animation-delay:.4s"/>
    <circle cx="150" cy="155" r="2.8" fill="#FFFFFF" opacity="0.9" class="anim-pulse" style="animation-delay:.8s"/>
    <circle cx="34" cy="140" r="2.4" fill="#FFF6DC" opacity="0.85" class="anim-pulse" style="animation-delay:1.2s"/>
    <circle cx="100" cy="24" r="2.2" fill="#FFFFFF" opacity="0.85" class="anim-pulse" style="animation-delay:1.6s"/>` : '';

  return `<svg class="dragon-anim-idle" style="animation-delay:${(Math.random() * 2.4).toFixed(2)}s" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="Dragon ${c.name}${variant === 4 ? ' légendaire' : variant === 5 ? ' mythique' : ''}">
    <defs>
      <radialGradient id="${gradId}" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="${c.light}"/>
        <stop offset="100%" stop-color="${c.base}"/>
      </radialGradient>
    </defs>
    <g transform="translate(100,172) scale(${overallScale}) translate(-100,-172)">
      ${showGlow ? `<circle cx="100" cy="110" r="78" fill="${variant === 4 ? 'var(--gold)' : c.light}" opacity="0.22" class="${variant === 4 ? 'dragon-anim-legendary-halo' : ''}"/>` : ''}
      <ellipse cx="82" cy="168" rx="12" ry="7" fill="${c.deep}" opacity="0.9"/>
      <ellipse cx="118" cy="168" rx="12" ry="7" fill="${c.deep}" opacity="0.9"/>
      <g class="dragon-tail-swish"><path d="M126,150 C155,148 172,130 178,150 C182,168 165,178 148,172 C138,168 130,160 126,150 Z" fill="url(#${gradId})" stroke="${INK}" stroke-width="3"/>${charmId ? accessorySVGFragment(charmId) : ''}</g>
      ${wings}
      <ellipse cx="100" cy="124" rx="50" ry="42" fill="url(#${gradId})" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="100" cy="138" rx="30" ry="22" fill="${c.light}" opacity="0.55"/>
      ${spikes}
      ${legendarySparkles}
      ${elementAccentsSVG(element, variant, tailTip.x, tailTip.y, headAccent.x, headAccent.y)}
      <g transform="translate(100,72) scale(${headBoost}) translate(-100,-72)">
        <ellipse cx="100" cy="76" rx="22" ry="14" fill="url(#${gradId})" stroke="${INK}" stroke-width="3"/>
        <circle cx="100" cy="72" r="33" fill="url(#${gradId})" stroke="${INK}" stroke-width="3.5"/>
        <g transform="translate(100,72) scale(${hornScale}) translate(-100,-72)">${hornsSVG(variant, c.deep)}</g>
        ${hatId ? accessorySVGFragment(hatId) : ''}
        <ellipse cx="76" cy="80" rx="8" ry="6" fill="#FF9E8A" opacity="0.5"/>
        <ellipse cx="124" cy="80" rx="8" ry="6" fill="#FF9E8A" opacity="0.5"/>
        <g class="dragon-eye-blink">
          <ellipse cx="86" cy="68" rx="11" ry="12.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2.2"/>
          <ellipse cx="114" cy="68" rx="11" ry="12.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2.2"/>
          <circle cx="88" cy="71" r="6.5" fill="${INK}"/>
          <circle cx="116" cy="71" r="6.5" fill="${INK}"/>
          <circle cx="91" cy="66.5" r="2.2" fill="#FFFFFF"/>
          <circle cx="119" cy="66.5" r="2.2" fill="#FFFFFF"/>
        </g>
        <circle cx="93" cy="83" r="1.3" fill="${c.deep}" opacity="0.6"/>
        <circle cx="107" cy="83" r="1.3" fill="${c.deep}" opacity="0.6"/>
        <path d="M91,89 Q100,94 109,89" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <path d="M92,89 L91,94 L95,90 Z" fill="#FFFFFF"/>
      </g>
      ${collarId ? accessorySVGFragment(collarId) : ''}
    </g>
  </svg>`;
}

function eggSVG(opts) {
  const element = opts.element, size = opts.size || 100, cracks = opts.cracks || 0;
  const c = ELEMENTS[element];
  const idStr = nextSvgUid();
  const gradId = `egg-${element}-${idStr}`;
  const spots = [[40, 55], [78, 48], [45, 100], [80, 105], [60, 125]];
  const spotsSvg = spots.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${3 + (i % 2)}" fill="${c.deep}" opacity="0.25"/>`).join('');
  const crack1 = cracks >= 1 ? `<path d="M60,50 L52,70 L62,78 L50,100" stroke="${c.deep}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` : '';
  const crack2 = cracks >= 2 ? `<path d="M70,45 L78,65 L68,75 L80,95" stroke="${c.deep}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` : '';

  return `<svg viewBox="0 0 120 155" width="${size}" height="${size * 155 / 120}" role="img" aria-label="Œuf ${c.name}">
    <defs>
      <radialGradient id="${gradId}" cx="35%" cy="25%" r="80%">
        <stop offset="0%" stop-color="${c.light}"/>
        <stop offset="100%" stop-color="${c.base}"/>
      </radialGradient>
    </defs>
    <path d="M60,8 C92,8 107,55 107,92 C107,128 86,147 60,147 C34,147 13,128 13,92 C13,55 28,8 60,8 Z" fill="url(#${gradId})"/>
    ${spotsSvg}
    <ellipse cx="42" cy="35" rx="12" ry="18" fill="#FFFFFF" opacity="0.35"/>
    ${crack1}${crack2}
  </svg>`;
}


/* =========================================================================
   LUMIDRA — icônes de décoration (boutique et sanctuaire)
   Même langage graphique que les dragons/l'œuf : dégradés + formes simples.
   Remplace les emoji utilisés précédemment pour chaque décoration.
   ========================================================================= */

function decorIconSVG(decorId, size) {
  size = size || 30;
  const gradId = 'decor-' + decorId + '-' + nextSvgUid();
  let defs = '', body = '';

  if (decorId === 'lanterne') {
    const c = ELEMENTS.lumiere;
    defs = `<radialGradient id="${gradId}" cx="35%" cy="25%" r="80%"><stop offset="0%" stop-color="${c.light}"/><stop offset="100%" stop-color="${c.base}"/></radialGradient>`;
    body = `<rect x="13" y="2" width="6" height="3" rx="1.2" fill="${c.deep}"/>
      <path d="M8,8 C8,4.5 24,4.5 24,8 L24,23 C24,26.5 8,26.5 8,23 Z" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="1.1"/>
      <line x1="12.3" y1="7" x2="12.3" y2="24" stroke="${c.deep}" stroke-width="0.9" opacity="0.4"/>
      <line x1="16" y1="6.6" x2="16" y2="24.4" stroke="${c.deep}" stroke-width="0.9" opacity="0.4"/>
      <line x1="19.7" y1="7" x2="19.7" y2="24" stroke="${c.deep}" stroke-width="0.9" opacity="0.4"/>
      <rect x="13" y="26.5" width="6" height="3" rx="1.2" fill="${c.deep}"/>
      <line x1="16" y1="29.5" x2="16" y2="31.4" stroke="${c.deep}" stroke-width="1.3" stroke-linecap="round"/>`;
  } else if (decorId === 'bassin') {
    const eau = ELEMENTS.eau, nat = ELEMENTS.nature;
    defs = `<radialGradient id="${gradId}" cx="35%" cy="20%" r="85%"><stop offset="0%" stop-color="${eau.light}"/><stop offset="100%" stop-color="${eau.base}"/></radialGradient>`;
    body = `<ellipse cx="16" cy="21" rx="13.5" ry="6.5" fill="url(#${gradId})" stroke="${eau.deep}" stroke-width="1"/>
      <ellipse cx="10.5" cy="17.3" rx="5.2" ry="3" fill="${nat.base}" stroke="${nat.deep}" stroke-width="0.8"/>
      <ellipse cx="20.3" cy="19.3" rx="4.2" ry="2.4" fill="${nat.light}" stroke="${nat.deep}" stroke-width="0.8"/>
      <circle cx="20.3" cy="17.1" r="1.9" fill="#F3B8D0"/>
      <circle cx="20.3" cy="17.1" r="0.8" fill="var(--gold)"/>`;
  } else if (decorId === 'cristal') {
    const c = ELEMENTS.air;
    defs = `<linearGradient id="${gradId}" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="${c.light}"/><stop offset="100%" stop-color="${c.base}"/></linearGradient>`;
    body = `<path d="M16,3 L25,13 L20,29 L12,29 L7,13 Z" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="1.1"/>
      <path d="M16,3 L16,29 M7,13 L25,13 M16,3 L12,29 M16,3 L20,29" stroke="#FFFFFF" stroke-width="0.7" opacity="0.5"/>
      <path d="${starPath(24, 6, 2.6, 1, 4)}" fill="${c.light}"/>
      <path d="${starPath(6, 21, 2, 0.8, 4)}" fill="${c.light}"/>`;
  } else if (decorId === 'banc') {
    const c = ELEMENTS.terre;
    defs = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${c.light}"/><stop offset="100%" stop-color="${c.base}"/></linearGradient>`;
    body = `<rect x="4" y="13" width="24" height="4.5" rx="1.6" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="1"/>
      <rect x="7" y="17.5" width="3.6" height="9" rx="1.2" fill="${c.deep}"/>
      <rect x="21.4" y="17.5" width="3.6" height="9" rx="1.2" fill="${c.deep}"/>
      <rect x="6" y="14" width="20" height="1.6" rx="0.8" fill="${c.light}" opacity="0.7"/>`;
  } else if (decorId === 'arche') {
    const c = ELEMENTS.nature;
    defs = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${c.base}"/><stop offset="100%" stop-color="${c.deep}"/></linearGradient>`;
    body = `<path d="M7,29 L7,15 C7,7.5 25,7.5 25,15 L25,29" fill="none" stroke="url(#${gradId})" stroke-width="4" stroke-linecap="round"/>
      <circle cx="8.5" cy="11" r="2.1" fill="#F3B8D0"/><circle cx="8.5" cy="11" r="0.8" fill="var(--gold)"/>
      <circle cx="16" cy="6.5" r="2.1" fill="#F3B8D0"/><circle cx="16" cy="6.5" r="0.8" fill="var(--gold)"/>
      <circle cx="23.5" cy="11" r="2.1" fill="#F3B8D0"/><circle cx="23.5" cy="11" r="0.8" fill="var(--gold)"/>`;
  } else if (decorId === 'carillon') {
    const c = ELEMENTS.air;
    defs = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${c.light}"/><stop offset="100%" stop-color="${c.base}"/></linearGradient>`;
    body = `<ellipse cx="16" cy="5" rx="7.5" ry="2.1" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="1"/>
      <line x1="10.5" y1="6.5" x2="10.5" y2="15.5" stroke="${c.deep}" stroke-width="1"/>
      <line x1="16" y1="6.5" x2="16" y2="21" stroke="${c.deep}" stroke-width="1"/>
      <line x1="21.5" y1="6.5" x2="21.5" y2="17.5" stroke="${c.deep}" stroke-width="1"/>
      <rect x="8.9" y="15.5" width="3.2" height="7.5" rx="1.5" fill="${c.light}" stroke="${c.deep}" stroke-width="0.7"/>
      <rect x="14.4" y="21" width="3.2" height="7.5" rx="1.5" fill="${c.base}" stroke="${c.deep}" stroke-width="0.7"/>
      <rect x="19.9" y="17.5" width="3.2" height="7.5" rx="1.5" fill="${c.light}" stroke="${c.deep}" stroke-width="0.7"/>
      <path d="M3,9 Q6.5,7 5.5,11.5" stroke="${c.deep}" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round"/>`;
  } else if (decorId === 'autel') {
    const c = ELEMENTS.lumiere;
    defs = `<radialGradient id="${gradId}" cx="35%" cy="20%" r="85%"><stop offset="0%" stop-color="${c.light}"/><stop offset="100%" stop-color="${c.base}"/></radialGradient>`;
    body = `<rect x="6" y="21" width="20" height="6" rx="1.2" fill="${c.deep}"/>
      <rect x="9" y="15" width="14" height="6.5" rx="1" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="1"/>
      <path d="${starPath(16, 9, 3.4, 1.4, 4)}" fill="var(--gold)"/>
      <circle cx="16" cy="9" r="1" fill="#FFFFFF"/>`;
  } else if (decorId === 'statue-ancien') {
    const c = ELEMENTS.terre;
    defs = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${c.light}"/><stop offset="100%" stop-color="${c.deep}"/></linearGradient>`;
    body = `<rect x="8" y="25" width="16" height="4" rx="1" fill="${c.deep}"/>
      <path d="M12,25 C11,16 11,10 16,6 C21,10 21,16 20,25 Z" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="1"/>
      <circle cx="13.4" cy="12.5" r="1.4" fill="${INK}" opacity="0.6"/>
      <circle cx="18.6" cy="12.5" r="1.4" fill="${INK}" opacity="0.6"/>
      <path d="M13,17 Q16,19.5 19,17" stroke="${c.deep}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
  } else if (decorId === 'flamme-eternelle') {
    const c = ELEMENTS.feu;
    defs = `<radialGradient id="${gradId}" cx="40%" cy="20%" r="85%"><stop offset="0%" stop-color="${c.light}"/><stop offset="100%" stop-color="${c.deep}"/></radialGradient>`;
    body = `<ellipse cx="16" cy="27" rx="8" ry="2.6" fill="${c.deep}" opacity="0.5"/>
      <path d="M16,4 C22,11 21,16 17,17.5 C19,14 17,12 16,10 C15,12.5 12,15 13,19 C9,17 9,10 16,4 Z" fill="url(#${gradId})"/>
      <path d="M16,12 C18,15.5 17.3,18 15.6,18.8 C16.5,16.5 15.5,15 14.8,14 C14.4,15.6 13,17 13.6,19.2" fill="${c.light}" opacity="0.85"/>`;
  } else if (decorId === 'voile-solaire') {
    const c = ELEMENTS.lumiere;
    defs = `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c.light}"/><stop offset="100%" stop-color="${c.base}"/></linearGradient>`;
    body = `<line x1="4" y1="6" x2="28" y2="6" stroke="${c.deep}" stroke-width="1.4"/>
      <path d="M6,6 Q7,20 4,26 Q9,23 12,26 Q13,15 10,6 Z" fill="url(#${gradId})" opacity="0.9"/>
      <path d="M14,6 Q15,20 12,27 Q17,23 20,27 Q21,15 18,6 Z" fill="url(#${gradId})" opacity="0.75"/>
      <path d="M22,6 Q23,18 20,25 Q25,22 27,25 Q28,14 26,6 Z" fill="url(#${gradId})" opacity="0.6"/>`;
  } else if (decorId === 'citrouille-doree') {
    defs = `<radialGradient id="${gradId}" cx="35%" cy="25%" r="85%"><stop offset="0%" stop-color="var(--gold)"/><stop offset="100%" stop-color="#B87A1E"/></radialGradient>`;
    body = `<rect x="15" y="3" width="2" height="5" rx="1" fill="#6B7A3A"/>
      <ellipse cx="16" cy="18" rx="12" ry="10" fill="url(#${gradId})"/>
      <path d="M9,10 Q9,26 9,26" stroke="#B87A1E" stroke-width="1" opacity="0.5" fill="none"/>
      <path d="M16,8 Q16,28 16,28" stroke="#B87A1E" stroke-width="1" opacity="0.5" fill="none"/>
      <path d="M23,10 Q23,26 23,26" stroke="#B87A1E" stroke-width="1" opacity="0.5" fill="none"/>`;
  } else if (decorId === 'guirlande-etoilee') {
    body = `<path d="M2,10 Q16,22 30,10" stroke="#8FA3C8" stroke-width="1.2" fill="none"/>
      <path d="${starPath(8, 14, 3, 1.2, 4)}" fill="var(--gold)"/>
      <path d="${starPath(16, 19, 3.6, 1.4, 4)}" fill="var(--gold)"/>
      <path d="${starPath(24, 14, 3, 1.2, 4)}" fill="var(--gold)"/>`;
  } else {
    // Repli générique : les nombreux objets ajoutés depuis partagent un petit jeu de silhouettes
    // teintées par élément, plutôt qu'une illustration sur mesure pour chacun.
    const entry = DECOR.find(dd => dd.id === decorId);
    const built = genericDecorSVG((entry && entry.shape) || 'orb', (entry && entry.element) || 'lumiere', gradId);
    defs = built.defs;
    body = built.body;
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
}

function genericDecorSVG(shape, elKey, gradId) {
  const c = ELEMENTS[elKey] || ELEMENTS.lumiere;
  const defs = `<radialGradient id="${gradId}" cx="35%" cy="25%" r="80%"><stop offset="0%" stop-color="${c.light}"/><stop offset="100%" stop-color="${c.base}"/></radialGradient>`;
  let body;
  switch (shape) {
    case 'gem':
      body = `<path d="M16,4 L26,13 L20,28 L12,28 L6,13 Z" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="1.1"/>
        <path d="M16,4 L16,28 M6,13 L26,13" stroke="#FFFFFF" stroke-width="0.6" opacity="0.45"/>`;
      break;
    case 'plant':
      body = `<path d="M16,29 L16,14" stroke="${c.deep}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M16,17 C9,15 7,7 9,4 C13,6 17,12 16,17 Z" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="0.9"/>
        <path d="M16,20 C23,18 25,10 23,7 C19,9 15,15 16,20 Z" fill="${c.light}" stroke="${c.deep}" stroke-width="0.9" opacity="0.9"/>`;
      break;
    case 'banner':
      body = `<line x1="4" y1="6" x2="28" y2="6" stroke="${c.deep}" stroke-width="1.3"/>
        <path d="M7,6 L11,27 L16,22 L21,27 L25,6" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="0.9"/>`;
      break;
    case 'statue':
      body = `<rect x="9" y="25" width="14" height="4" rx="1" fill="${c.deep}"/>
        <path d="M12,25 C11,17 12,10 16,7 C20,10 21,17 20,25 Z" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="1"/>
        <circle cx="16" cy="10.5" r="2.4" fill="${c.light}"/>`;
      break;
    case 'container':
      body = `<path d="M9,13 L23,13 L21,27 C21,28.5 11,28.5 11,27 Z" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="1"/>
        <ellipse cx="16" cy="13" rx="7" ry="2.2" fill="${c.light}" stroke="${c.deep}" stroke-width="0.9"/>`;
      break;
    case 'flame':
      body = `<path d="M16,4 C22,11 21,16 17,17.5 C19,14 17,12 16,10 C15,12.5 12,15 13,19 C9,17 9,10 16,4 Z" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="0.6"/>`;
      break;
    case 'charm':
      body = `<circle cx="16" cy="15" r="10.5" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="1"/>
        <path d="${starPath(16, 15, 4.6, 1.8, 4)}" fill="#FFFFFF" opacity="0.8"/>`;
      break;
    case 'orb':
    default:
      body = `<circle cx="16" cy="16" r="11" fill="url(#${gradId})" stroke="${c.deep}" stroke-width="1"/>
        <circle cx="12.5" cy="12" r="2.6" fill="#FFFFFF" opacity="0.55"/>`;
      break;
  }
  return { defs, body };
}



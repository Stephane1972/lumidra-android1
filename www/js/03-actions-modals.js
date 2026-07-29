/* =========================================================================
   MODALES
   ========================================================================= */

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ));
}

let modalIsOpen = false;
let modalReturnFocusEl = null;

function renderModals() {
  const root = document.getElementById('modal-root');
  let html = '';

  if (ui.hatchFlow) html += hatchModalHtml(ui.hatchFlow);
  else if (ui.detailDragonId) {
    const dragon = state.dragons.find(d => d.id === ui.detailDragonId);
    if (dragon) html += dragonDetailModalHtml(dragon);
  } else if (ui.detailSpecies) html += speciesDetailModalHtml(ui.detailSpecies);
  else if (ui.lockChallenge) html += lockChallengeModalHtml(ui.lockChallenge);
  else if (ui.confirmResetOpen) html += confirmResetModalHtml();
  else if (ui.confirmImportOpen) html += confirmImportModalHtml();
  else if (ui.tutorialStep !== null) html += tutorialModalHtml();

  // Piège de focus clavier : mémorise l'élément déclencheur à l'ouverture,
  // le restaure à la fermeture, pour ne jamais laisser le focus s'échapper
  // vers le contenu masqué derrière la modale.
  const opening = !!html && !modalIsOpen;
  if (opening) modalReturnFocusEl = document.activeElement;

  root.innerHTML = html;

  if (html) {
    modalIsOpen = true;
    const sheet = root.querySelector('.modal-sheet');
    if (sheet && !sheet.contains(document.activeElement)) {
      const focusables = getFocusableElements(sheet);
      (focusables[0] || sheet).focus({ preventScroll: true });
    }
  } else if (modalIsOpen) {
    modalIsOpen = false;
    if (modalReturnFocusEl && document.body.contains(modalReturnFocusEl) && typeof modalReturnFocusEl.focus === 'function') {
      modalReturnFocusEl.focus({ preventScroll: true });
    }
    modalReturnFocusEl = null;
  }

  if (ui.lockChallenge) {
    wireHoldGate(() => {
      const target = ui.lockChallenge.onSuccessScreen;
      ui.lockChallenge = null;
      ui.screen = target;
      renderAll();
    });
  }
}

function hatchModalHtml(flow) {
  const revealed = flow.revealedDragon;
  const species = revealed ? speciesById(revealed.speciesId) : speciesById(flow.egg.speciesId);
  const c = ELEMENTS[species.element];

  const body = !revealed ? `
    <div style="position:relative;z-index:1" class="${flow.taps > 0 ? 'anim-shake' : ''}">${eggSVG({ element: species.element, size: 170, cracks: flow.taps })}</div>
    <p class="font-body font-extrabold fs-13 mt-3" style="position:relative;z-index:1;color:var(--ink-soft)">${flow.taps === 0 ? 'Un œuf mystérieux…' : flow.taps < 3 ? 'Ça bouge…' : 'Ça y est !'}</p>
    <button data-action="hatch-tap" class="btn-primary full mt-4" style="position:relative;z-index:1;margin-top:16px;">✨ Appuie pour faire éclore (${flow.taps}/3)</button>
  ` : `
    <div class="relative anim-pop" style="position:relative;z-index:1">${dragonSVG({ element: species.element, variant: species.variant, stage: 'bebe', size: 170 })}</div>
    ${species.variant === 4 ? `<div class="font-display font-extrabold fs-11" style="position:relative;z-index:1;color:var(--gold-deep);letter-spacing:.05em">✨ DRAGON LÉGENDAIRE ✨</div>` : ''}
    <h2 class="font-display font-extrabold text-xl mt-2" style="position:relative;z-index:1;color:var(--ink)">${escapeHtml(species.name.toUpperCase())}</h2>
    <div class="flex items-center gap-2 mt-1" style="position:relative;z-index:1">${elementChipHtml(species.element)}${rarityStarsHtml(species.variant)}</div>
    <p class="font-body fs-13 text-center mt-3 leading-relaxed rounded-2xl px-4 py-3" style="position:relative;z-index:1;color:var(--ink);background:var(--sky)">${escapeHtml(species.lore)}</p>
    <button data-action="hatch-finish" class="btn-primary full mt-4" style="position:relative;z-index:1;margin-top:16px;">Accueillir ${escapeHtml(species.name)} ✨</button>
    ${state.eggInbox.length > 0 ? `<button data-action="hatch-finish-and-continue" class="w-full font-body font-bold fs-11 mt-2\\.5 py-2" style="position:relative;z-index:1;margin-top:10px;color:var(--gold-deep)">Faire éclore le suivant (${state.eggInbox.length} restant${state.eggInbox.length > 1 ? 's' : ''})</button>` : ''}
  `;

  return `<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Éclosion"><div class="modal-sheet hatch-sheet safe-bottom-sheet" tabindex="-1">
    <div class="hatch-glow" style="background:radial-gradient(circle, ${revealed && species.variant === 4 ? 'var(--gold)' : c.light}66, transparent 70%)"></div>
    ${body}
  </div></div>`;
}

function dragonDetailModalHtml(dragon) {
  const species = speciesById(dragon.speciesId);
  const busy = !!busyDragonIds()[dragon.id];
  const cooldownLeft = dragon.lastCareAt ? CARE_COOLDOWN_MS - (now - dragon.lastCareAt) : 0;
  const canCare = cooldownLeft <= 0 && !busy;
  const nextStageAt = dragon.stage === 'bebe' ? 5 : dragon.stage === 'juvenile' ? 12 : null;
  const progressPct = nextStageAt ? Math.min(100, (dragon.careCount / nextStageAt) * 100) : 100;
  const cooldownLabel = cooldownLeft >= 60000 ? `Encore ${Math.ceil(cooldownLeft / 60000)} min` : `Encore ${Math.ceil(cooldownLeft / 1000)}s`;

  return `<div class="modal-overlay" data-backdrop-close="close-dragon-detail" role="dialog" aria-modal="true" aria-label="${escapeHtml(dragonDisplayName(dragon, species))}"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    <button data-action="close-dragon-detail" aria-label="Fermer" class="absolute w-8 h-8 rounded-full flex items-center justify-center" style="top:12px;right:12px;background:#F1ECE2">${icon('x', { size: 16, color: 'var(--ink-soft)' })}</button>
    <button data-action="toggle-favorite" data-dragon-id="${dragon.id}" aria-pressed="${!!dragon.favorite}" aria-label="${dragon.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}" class="absolute w-8 h-8 rounded-full flex items-center justify-center" style="top:12px;left:12px;background:#F1ECE2">${icon('heart', { size: 16, color: dragon.favorite ? '#D9634A' : 'var(--ink-soft)' })}</button>
    ${dragonSVG({ element: species.element, variant: species.variant, stage: dragon.stage, size: 140 })}
    <div class="flex items-center gap-2 mt-2 w-full justify-center">
      <input id="dragon-rename-input" data-dragon-id="${dragon.id}" value="${escapeHtml(dragonDisplayName(dragon, species))}" maxlength="16" aria-label="Renommer ce dragon"
        class="font-display font-extrabold text-lg text-center rounded-xl px-2 py-1" style="color:var(--ink);background:var(--sky);max-width:180px"/>
      <button data-action="rename-dragon" data-dragon-id="${dragon.id}" aria-label="Valider le nom" class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style="background:var(--gold)">${icon('check', { size: 15, color: 'var(--ink)' })}</button>
    </div>
    <div class="flex items-center gap-2 mt-1">${elementChipHtml(species.element)}${rarityStarsHtml(species.variant)}</div>
    ${dragonStatsRowHtml(dragon, species)}
    <p class="font-body fs-13 text-center mt-3 leading-relaxed" style="color:var(--ink)">${escapeHtml(species.lore)}</p>
    ${state.mode === 'stratege' ? `<div class="w-full mt-3 flex justify-center gap-4 font-body font-bold fs-11" style="color:var(--ink-soft)"><span>Tempérament : ${dragon.temperament}</span></div>` : ''}
    <div class="w-full mt-4">
      <div class="flex justify-between font-body font-bold fs-11 mb-1" style="color:var(--ink-soft)">
        <span>Stade : ${STAGE_LABEL[dragon.stage]}</span>${nextStageAt ? `<span>${dragon.careCount}/${nextStageAt} soins</span>` : ''}
      </div>
      <div class="w-full h-2 rounded-full overflow-hidden" style="background:#EEE6D8">
        <div class="h-full rounded-full" style="width:${progressPct}%;background:var(--gold)"></div>
      </div>
    </div>
    <button data-action="care-dragon" data-dragon-id="${dragon.id}" ${canCare ? '' : 'disabled'} class="btn-primary full mt-4 flex items-center justify-center gap-2" style="margin-top:16px;">
      ${icon('heart', { size: 16, color: canCare ? 'var(--ink)' : 'currentColor' })}
      ${busy ? 'En expédition' : canCare ? 'Câliner' : cooldownLabel}
    </button>
    <button data-action="share-dragon-card" data-dragon-id="${dragon.id}" class="w-full font-body font-bold fs-11 mt-2\\.5 py-2 flex items-center justify-center gap-1\\.5" style="margin-top:10px;color:var(--gold-deep)">
      ${icon('download', { size: 13, color: 'var(--gold-deep)' })} Télécharger sa carte
    </button>
    ${releaseButtonHtml(dragon, species, busy)}
  </div></div>`;
}

/* =========================================================================
   LUMIDRA — carte de dragon partageable (image SVG téléchargeable)
   ========================================================================= */

function wrapTextLines(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  words.forEach(w => {
    if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; }
    else { cur = (cur + ' ' + w).trim(); }
  });
  if (cur) lines.push(cur.trim());
  return lines;
}

function buildDragonCardSVG(dragon, species) {
  const c = ELEMENTS[species.element];
  const dragonMarkup = dragonSVG({ element: species.element, variant: species.variant, stage: dragon.stage, size: 260 });
  const name = escapeHtml(dragonDisplayName(dragon, species));
  const subtitle = `${ELEMENTS[species.element].name} · ${RARITY_LABEL[species.variant]}`;
  const loreLines = wrapTextLines(species.lore, 42);
  const loreTspans = loreLines.map((line, i) => `<tspan x="320" dy="${i === 0 ? 0 : 24}">${escapeHtml(line)}</tspan>`).join('');
  const starsRow = Array.from({ length: 3 }).map((_, i) =>
    i < RARITY_STARS[species.variant]
      ? `<path transform="translate(${290 + i * 30},520) scale(1.1)" d="${starPath(0, 0, 9, 3.6, 5)}" fill="#E0AA3E"/>`
      : `<path transform="translate(${290 + i * 30},520) scale(1.1)" d="${starPath(0, 0, 9, 3.6, 5)}" fill="#E6DFD3"/>`
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="900" viewBox="0 0 640 900">
    <defs>
      <linearGradient id="cardbg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${c.light}"/>
        <stop offset="100%" stop-color="${c.base}"/>
      </linearGradient>
    </defs>
    <rect width="640" height="900" rx="0" fill="url(#cardbg)"/>
    <rect x="20" y="20" width="600" height="860" rx="28" fill="#FFFBF2" opacity="0.94" stroke="#fff" stroke-width="3"/>
    <g transform="translate(190,70)">${dragonMarkup}</g>
    <text x="320" y="470" text-anchor="middle" font-family="Georgia, serif" font-size="36" font-weight="700" fill="${INK}">${name}</text>
    <g>${starsRow}</g>
    <text x="320" y="555" text-anchor="middle" font-family="Verdana, sans-serif" font-size="17" font-weight="700" fill="${c.deep}">${escapeHtml(subtitle)}</text>
    <text x="320" y="605" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="17" fill="${INK}">${loreTspans}</text>
    <text x="320" y="850" text-anchor="middle" font-family="Verdana, sans-serif" font-size="15" font-weight="700" fill="${c.deep}" opacity="0.75">🐉 Lumidra</text>
  </svg>`;
}

function svgStringToPngDataUrl(svgStr, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

async function exportDragonCard(dragonId) {
  const dragon = state.dragons.find(d => d.id === dragonId);
  if (!dragon) return;
  const species = speciesById(dragon.speciesId);
  const displayName = dragonDisplayName(dragon, species);
  const slug = displayName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dragon';
  try {
    const svgStr = buildDragonCardSVG(dragon, species);
    // PNG plutôt que SVG : la plupart des messageries (WhatsApp, Instagram...) affichent mal
    // un .svg en pièce jointe "photo", alors qu'un PNG s'affiche partout sans surprise.
    const pngDataUrl = await svgStringToPngDataUrl(svgStr, 640, 900);

    const isNative = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
      && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem && window.Capacitor.Plugins.Share;

    if (isNative) {
      // Dans l'app native, un lien de téléchargement classique ne marche pas (pas de gestionnaire
      // de téléchargements dans la WebView) — même correctif que pour l'export de sauvegarde :
      // un vrai fichier via Filesystem, puis le partage natif pour choisir où l'envoyer.
      const base64 = pngDataUrl.split(',')[1];
      const { Filesystem } = window.Capacitor.Plugins;
      const written = await Filesystem.writeFile({ path: `lumidra-${slug}.png`, data: base64, directory: 'CACHE' });
      await window.Capacitor.Plugins.Share.share({
        title: 'Mon dragon Lumidra',
        text: `Regarde mon dragon ${displayName} !`,
        url: written.uri,
        dialogTitle: 'Partager ta carte de dragon',
      });
    } else {
      // Navigateur / PWA classique : le téléchargement direct fonctionne normalement.
      const a = document.createElement('a');
      a.href = pngDataUrl;
      a.download = `lumidra-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Carte du dragon téléchargée !');
    }
    haptic(20);
  } catch (e) {
    showToast('Impossible de générer la carte');
  }
}

const RELEASE_REFUND = [15, 15, 30, 60, 150];

function dragonStatsRowHtml(dragon, species) {
  const homeZone = { elements: [species.element] };
  const { vigueur, eclat } = computeDragonStats(dragon, homeZone);
  const bar = (label, value, color) => `<div class="flex-1">
    <div class="flex items-center justify-between font-body font-bold" style="font-size:9.5px;color:var(--ink-soft)"><span>${label}</span><span>${value}</span></div>
    <div class="w-full rounded-full overflow-hidden mt-0\\.5" style="background:#EEE6D8;height:4px;"><div class="h-full rounded-full" style="width:${Math.min(100, value)}%;background:${color}"></div></div>
  </div>`;
  return `<div class="flex gap-3 w-full mt-3" style="max-width:220px">${bar('Vigueur', vigueur, '#B5502C')}${bar('Éclat', eclat, 'var(--gold)')}</div>`;
}

function releaseButtonHtml(dragon, species, busy) {
  if (species.variant === 4) {
    return `<p class="font-body fs-10 text-center mt-3" style="color:var(--ink-soft)">Les dragons légendaires ne peuvent pas être relâchés.</p>`;
  }
  const refund = RELEASE_REFUND[species.variant];
  if (ui.releaseConfirmId === dragon.id) {
    return `<div class="w-full mt-3 rounded-2xl p-3" style="background:#FBEAE4">
      <p class="font-body fs-11 text-center mb-2" style="color:#B5502C">Relâcher ${escapeHtml(dragonDisplayName(dragon, species))} définitivement ? (+${refund} écailles)</p>
      <div class="flex gap-2">
        <button data-action="cancel-release-dragon" class="flex-1 font-display font-bold fs-11 py-2 rounded-xl" style="background:#F1ECE2;color:var(--ink-soft)">Annuler</button>
        <button data-action="confirm-release-dragon" data-dragon-id="${dragon.id}" class="flex-1 font-display font-bold fs-11 py-2 rounded-xl text-white" style="background:#B5502C">Confirmer</button>
      </div>
    </div>`;
  }
  return `<button data-action="request-release-dragon" data-dragon-id="${dragon.id}" ${busy ? 'disabled' : ''} class="w-full font-body font-bold fs-11 mt-3 py-2" style="color:${busy ? '#D8CFC0' : 'var(--ink-soft)'}">Relâcher dans la nature (+${refund} écailles)</button>`;
}

function speciesDetailModalHtml(entry) {
  const { species, discovered } = entry;
  return `<div class="modal-overlay" data-backdrop-close="close-species-detail" role="dialog" aria-modal="true" aria-label="${discovered ? escapeHtml(species.name) : 'Dragon non découvert'}"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    <button data-action="close-species-detail" aria-label="Fermer" class="absolute w-8 h-8 rounded-full flex items-center justify-center" style="top:12px;right:12px;background:#F1ECE2">${icon('x', { size: 16, color: 'var(--ink-soft)' })}</button>
    <div style="filter:${discovered ? 'none' : 'grayscale(1) brightness(0.4)'}">${dragonSVG({ element: species.element, variant: species.variant, stage: 'adulte', size: 140 })}</div>
    <h2 class="font-display font-extrabold text-xl mt-2" style="color:var(--ink)">${discovered ? escapeHtml(species.name) : '???'}</h2>
    <div class="flex items-center gap-2 mt-1">${elementChipHtml(species.element)}${discovered ? rarityStarsHtml(species.variant) : ''}</div>
    <p class="font-body fs-13 text-center mt-3 leading-relaxed" style="color:var(--ink)">${discovered ? escapeHtml(species.lore) : "Découvre ce dragon en expédition pour révéler sa fiche."}</p>
  </div></div>`;
}

const HOLD_GATE_DURATION_MS = 3500;
const HOLD_GATE_CIRCUMFERENCE = 213.6; // 2 * PI * 34

function lockChallengeModalHtml(challenge) {
  return `<div class="modal-overlay" data-backdrop-close="close-lock-challenge" role="dialog" aria-modal="true" aria-label="Verrouillage parental"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    ${icon('shield', { size: 28, color: 'var(--gold-deep)' })}
    <h3 class="font-display font-bold text-base mt-2 text-center" style="color:var(--ink)">Zone réservée à un adulte</h3>
    <p id="hold-gate-instructions" class="font-body fs-13 text-center mt-2" style="color:var(--ink-soft)">Maintiens le bouton appuyé quelques secondes pour continuer.</p>
    <button id="hold-gate-btn" aria-label="Maintenir appuyé pour déverrouiller" class="hold-gate mt-4" style="margin-top:16px;">
      <svg class="hold-gate-ring" viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
        <circle cx="40" cy="40" r="34" fill="none" stroke="#EEE6D8" stroke-width="7"/>
        <circle id="hold-gate-progress" cx="40" cy="40" r="34" fill="none" stroke="var(--gold)" stroke-width="7" stroke-linecap="round"
          stroke-dasharray="${HOLD_GATE_CIRCUMFERENCE}" stroke-dashoffset="${HOLD_GATE_CIRCUMFERENCE}" transform="rotate(-90 40 40)"/>
      </svg>
      <span id="hold-gate-icon" class="hold-gate-icon">${icon('lock', { size: 22, color: 'var(--gold-deep)' })}</span>
    </button>
  </div></div>`;
}

function confirmResetModalHtml() {
  return `<div class="modal-overlay" data-backdrop-close="cancel-reset" role="dialog" aria-modal="true" aria-label="Confirmation"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    <h3 class="font-display font-bold text-base text-center" style="color:var(--ink)">Réinitialiser ta progression ?</h3>
    <p class="font-body fs-13 text-center mt-2" style="color:var(--ink-soft)">Tous tes dragons et ta progression seront définitivement perdus.</p>
    <div class="flex gap-2 w-full mt-4" style="margin-top:16px;">
      <button data-action="cancel-reset" class="btn-ghost flex-1">Annuler</button>
      <button data-action="confirm-reset" class="flex-1 font-display font-bold text-xs py-3 rounded-2xl text-white" style="background:#B5502C">Confirmer</button>
    </div>
  </div></div>`;
}

const TUTORIAL_SLIDES = [
  { emoji: '🏡', title: 'Ton Sanctuaire', text: "C'est ici que vivent tes dragons. Câline-les régulièrement pour les aider à grandir, et garde un œil sur tes objectifs du jour tout en haut." },
  { emoji: '🗺️', title: 'La Carte', text: "Avance de zone en zone à mesure que tu montes de niveau, et lance des expéditions pour ramener des écailles et de nouveaux œufs." },
  { emoji: '📖', title: 'Le Dragondex', text: 'Ta collection complète : espèces découvertes, succès à débloquer, et une recherche pour retrouver un dragon précis.' },
  { emoji: '🧪', title: 'Boutique & Labo', text: 'La Boutique te permet de décorer ton sanctuaire. En mode Stratège, le Laboratoire te permet aussi de croiser deux dragons adultes.' },
];

function tutorialModalHtml() {
  const i = ui.tutorialStep;
  const slide = TUTORIAL_SLIDES[i];
  const isLast = i === TUTORIAL_SLIDES.length - 1;
  const dots = TUTORIAL_SLIDES.map((_, idx) => `<span class="rounded-full" style="width:${idx === i ? 16 : 6}px;height:6px;background:${idx === i ? 'var(--gold)' : '#E6DFD3'};transition:width .15s ease"></span>`).join('');
  return `<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Découverte de Lumidra"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    <div style="font-size:48px" aria-hidden="true">${slide.emoji}</div>
    <h2 class="font-display font-extrabold text-lg mt-2" style="color:var(--ink)">${escapeHtml(slide.title)}</h2>
    <p class="font-body fs-13 text-center mt-2 leading-relaxed" style="color:var(--ink-soft)">${escapeHtml(slide.text)}</p>
    <div class="flex items-center gap-1\\.5 mt-4" style="gap:6px">${dots}</div>
    <div class="flex gap-2 w-full mt-4" style="margin-top:16px">
      ${!isLast ? `<button data-action="tutorial-skip" class="btn-ghost flex-1">Passer</button>` : ''}
      <button data-action="tutorial-next" class="flex-1 font-display font-bold text-xs py-3 rounded-2xl" style="background:var(--gold);color:var(--ink)">${isLast ? "C'est parti !" : 'Suivant'}</button>
    </div>
  </div></div>`;
}

function confirmImportModalHtml() {
  const s = ui.pendingImport || {};
  const dragonCount = Array.isArray(s.dragons) ? s.dragons.length : 0;
  const discoveredCount = Array.isArray(s.discovered) ? s.discovered.length : 0;
  const name = s.gardienName ? escapeHtml(s.gardienName) : 'Gardien';
  return `<div class="modal-overlay" data-backdrop-close="cancel-import" role="dialog" aria-modal="true" aria-label="Confirmation d'import"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    <h3 class="font-display font-bold text-base text-center" style="color:var(--ink)">Importer cette sauvegarde ?</h3>
    <p class="font-body fs-13 text-center mt-2" style="color:var(--ink-soft)">Gardien : <strong>${name}</strong> — ${dragonCount} dragon${dragonCount > 1 ? 's' : ''}, ${discoveredCount} espèce${discoveredCount > 1 ? 's' : ''} découverte${discoveredCount > 1 ? 's' : ''}.</p>
    <p class="font-body fs-11 text-center mt-1" style="color:var(--ink-soft)">Ta progression actuelle sur cet appareil sera remplacée par celle du fichier importé.</p>
    <div class="flex gap-2 w-full mt-4" style="margin-top:16px;">
      <button data-action="cancel-import" class="btn-ghost flex-1">Annuler</button>
      <button data-action="confirm-import" class="flex-1 font-display font-bold text-xs py-3 rounded-2xl text-white" style="background:var(--gold);color:var(--ink)">Importer</button>
    </div>
  </div></div>`;
}

function renderToast() {
  const root = document.getElementById('toast-root');
  if (!ui.toast) { root.innerHTML = ''; return; }
  root.innerHTML = `<div class="absolute left-4 right-4 z-50 anim-fadeup" style="bottom:92px">
    <div class="font-display font-bold text-xs text-center py-2\\.5 rounded-2xl shadow-lg text-white" style="padding:10px 0;background:var(--ink)">${escapeHtml(ui.toast)}</div>
  </div>`;
}

function showToast(text) {
  ui.toast = text;
  renderToast();
  clearTimeout(toastTimer);
  // durée proportionnelle à la longueur du message : un enfant a besoin de plus de temps pour lire une phrase complète
  const duration = Math.min(6000, Math.max(3200, 900 + text.length * 55));
  toastTimer = setTimeout(() => { ui.toast = null; renderToast(); }, duration);
}

let holdGateRAF = null;
let holdGateStartAt = null;
let holdGateSucceeded = false;

function wireHoldGate(onSuccess) {
  const btn = document.getElementById('hold-gate-btn');
  const ring = document.getElementById('hold-gate-progress');
  const iconSlot = document.getElementById('hold-gate-icon');
  const instructions = document.getElementById('hold-gate-instructions');
  if (!btn || !ring) return;
  holdGateSucceeded = false;

  function paint(pct) {
    ring.setAttribute('stroke-dashoffset', String(HOLD_GATE_CIRCUMFERENCE * (1 - pct)));
  }
  function tick() {
    if (holdGateStartAt === null) return;
    const elapsed = Date.now() - holdGateStartAt;
    const pct = Math.min(1, elapsed / HOLD_GATE_DURATION_MS);
    paint(pct);
    if (pct >= 1) {
      holdGateStartAt = null;
      succeed();
      return;
    }
    holdGateRAF = requestAnimationFrame(tick);
  }
  function succeed() {
    // Séquence de réussite visible avant de changer d'écran : plus rien ne se passe "en silence".
    holdGateSucceeded = true;
    btn.classList.remove('hold-gate--pressed');
    btn.classList.add('hold-gate--success');
    ring.setAttribute('stroke', '#6FA05C');
    if (iconSlot) {
      iconSlot.innerHTML = icon('check', { size: 24, color: '#436B37', className: 'hold-gate-icon--success' });
    }
    if (instructions) instructions.textContent = 'Déverrouillé !';
    haptic([20, 30, 50]);
    setTimeout(onSuccess, 550);
  }
  function start(e) {
    if (holdGateSucceeded) return;
    e.preventDefault();
    btn.classList.add('hold-gate--pressed');
    holdGateStartAt = Date.now();
    tick();
  }
  function cancel() {
    if (holdGateSucceeded) return; // ne pas effacer l'anneau juste après une réussite
    holdGateStartAt = null;
    if (holdGateRAF) cancelAnimationFrame(holdGateRAF);
    btn.classList.remove('hold-gate--pressed');
    paint(0);
  }

  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', cancel);
  btn.addEventListener('pointerleave', cancel);
  btn.addEventListener('pointercancel', cancel);
}

/* =========================================================================
   ORCHESTRATION DU RENDU
   ========================================================================= */

function renderAll() {
  if (!state.onboarded) {
    document.getElementById('onboarding-root').style.display = '';
    document.getElementById('main-shell').style.display = 'none';
    renderOnboarding();
  } else {
    ensureDailyQuests();
    ensureWeeklyChallenge();
    document.getElementById('onboarding-root').style.display = 'none';
    document.getElementById('main-shell').style.display = 'flex';
    renderTopBar();
    renderScreenByName(ui.screen);
    renderNavBar();
  }
  renderModals();
  renderToast();
}

function renderScreenByName(name) {
  if (name === 'sanctuaire') renderScreenSanctuaire();
  else if (name === 'dragondex') renderScreenDragondex();
  else if (name === 'carte') renderScreenCarte();
  else if (name === 'boutique') renderScreenBoutique();
  else if (name === 'reglages') renderScreenReglages();
  else if (name === 'labo') renderScreenLabo();
}

/* =========================================================================
   ACTIONS (mutations d'état)
   ========================================================================= */

function requestScreen(target) {
  if (target === 'reglages' && state.parentalLock) {
    ui.lockChallenge = { onSuccessScreen: 'reglages' };
    renderModals();
  } else {
    ui.screen = target;
    renderAll();
  }
}

function completeOnboarding() {
  const nameInput = document.getElementById('onboarding-name-input');
  const name = nameInput ? nameInput.value.trim() : '';
  const mode = ui.onboarding.mode;
  const commons0 = SPECIES.filter(s => s.variant === 0);
  const starter = commons0[randInt(0, commons0.length - 1)];
  const egg = { id: uid('egg'), speciesId: starter.id, obtainedAt: Date.now() };

  state.onboarded = true;
  state.gardienName = name || 'Gardien';
  state.mode = mode;
  state.eggInbox = [egg];
  checkLoginStreak();
  saveStateDebounced();

  ui.hatchFlow = { egg, taps: 0, revealedDragon: null };
  renderAll();
}

function careAllDragons() {
  const busy = busyDragonIds();
  let caredCount = 0;
  let grownCount = 0;
  state.dragons.forEach(d => {
    if (busy[d.id]) return;
    if (d.lastCareAt && (Date.now() - d.lastCareAt) < CARE_COOLDOWN_MS) return;
    const careCount = d.careCount + 1;
    const newStage = computeStage(careCount);
    if (newStage !== d.stage) grownCount += 1;
    d.careCount = careCount;
    d.lastCareAt = Date.now();
    d.stage = newStage;
    caredCount += 1;
  });
  if (caredCount === 0) { showToast('Aucun dragon disponible pour un câlin pour le moment'); return; }
  addXp(caredCount);
  bumpQuestProgress('soin', caredCount);
  saveStateDebounced();
  playCareSound();
  haptic(30);
  showToast(grownCount > 0
    ? `${caredCount} dragon${caredCount > 1 ? 's' : ''} câliné${caredCount > 1 ? 's' : ''}, dont ${grownCount} qui grandi${grownCount > 1 ? 'ssent' : 't'} ! ✨`
    : `${caredCount} dragon${caredCount > 1 ? 's' : ''} câliné${caredCount > 1 ? 's' : ''} !`);
  renderTopBar();
  if (ui.screen === 'sanctuaire') renderScreenSanctuaire();
}

function careDragon(dragonId) {
  const d = state.dragons.find(dd => dd.id === dragonId);
  if (!d) return;
  if (d.lastCareAt && (Date.now() - d.lastCareAt) < CARE_COOLDOWN_MS) return;
  const careCount = d.careCount + 1;
  const newStage = computeStage(careCount);
  const grew = newStage !== d.stage;
  d.careCount = careCount;
  d.lastCareAt = Date.now();
  d.stage = newStage;
  addXp(1);
  bumpQuestProgress('soin', 1);
  saveStateDebounced();
  if (grew) { showToast(`${speciesById(d.speciesId).name} a grandi ! ✨`); playHatchSound(); }
  else { playCareSound(); }
  renderTopBar();
  if (ui.screen === 'sanctuaire') renderScreenSanctuaire();
  renderModals();
}

function createDragon(speciesId) {
  return {
    id: uid('drg'), speciesId, stage: 'bebe', careCount: 0, lastCareAt: 0,
    temperament: TEMPERAMENTS[randInt(0, 3)], bornAt: Date.now(),
    customName: null, favorite: false,
  };
}

function resolveHatch() {
  const flow = ui.hatchFlow;
  const egg = flow.egg;
  const species = speciesById(egg.speciesId);
  const newDragon = createDragon(egg.speciesId);
  const newlyDiscovered = !state.discovered.includes(egg.speciesId);
  state.eggInbox = state.eggInbox.filter(e => e.id !== egg.id);
  state.dragons.push(newDragon);
  if (newlyDiscovered) state.discovered.push(egg.speciesId);
  addXp(10);
  state.statsEggsHatched = (state.statsEggsHatched || 0) + 1;
  bumpQuestProgress('eclosion', 1);
  haptic(newlyDiscovered ? [30, 40, 60] : 40);
  playHatchSound();

  const justCompleted = newlyDiscovered && state.discovered.length === SPECIES.length && !state.collectionCompleteShown;
  if (justCompleted) {
    state.collectionCompleteShown = true;
    showToast('Dragondex complet ! Tu es un Maître Gardien ✨🏆');
    haptic([40, 60, 40, 60, 80]);
  }

  saveStateDebounced();
  ui.hatchFlow = { egg, taps: flow.taps, revealedDragon: newDragon };
  renderModals();
}

/* =========================================================================
   NOTIFICATIONS NATIVES (Capacitor uniquement — no-op silencieux ailleurs)
   ========================================================================= */
function hasNativeNotifications() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
    && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications);
}
function notifIdForExpedition(expId) {
  let h = 0;
  for (let i = 0; i < expId.length; i++) h = (h * 31 + expId.charCodeAt(i)) >>> 0;
  return h % 2147483647;
}
async function scheduleExpeditionNotification(exp) {
  if (!hasNativeNotifications()) return;
  try {
    const { LocalNotifications } = window.Capacitor.Plugins;
    const current = await LocalNotifications.checkPermissions();
    if (current.display !== 'granted') {
      const requested = await LocalNotifications.requestPermissions();
      if (requested.display !== 'granted') return;
    }
    await LocalNotifications.schedule({
      notifications: [{
        id: notifIdForExpedition(exp.id),
        title: 'Lumidra',
        body: 'Ton expédition est terminée — un trésor t\u2019attend au sanctuaire ! 🐉',
        schedule: { at: new Date(exp.endAt) },
      }],
    });
  } catch (e) {}
}
async function cancelExpeditionNotification(expId) {
  if (!hasNativeNotifications()) return;
  try {
    await window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id: notifIdForExpedition(expId) }] });
  } catch (e) {}
}

function startExpedition(zoneId, typeId, dragonIds) {
  const type = EXPEDITION_TYPES.find(t => t.id === typeId);
  const newExp = { id: uid('exp'), zoneId, typeId, dragonIds, startAt: Date.now(), endAt: Date.now() + type.seconds * 1000 };
  state.expeditions.push(newExp);
  scheduleExpeditionNotification(newExp);
  bumpQuestProgress('expedition', 1);
  saveStateDebounced();
  showToast('Expédition lancée !');
  ui.carte = { view: 'zones', zoneId: null, typeId: null, teamIds: [] };
  if (ui.screen === 'carte') renderScreenCarte();
}

/* =========================================================================
   LUMIDRA — laboratoire d'élevage
   ========================================================================= */

// Coût et cooldown recalibrés (audit économie) : les quêtes/défis/série de connexion
// injectent aujourd'hui bien plus d'écailles qu'au moment du réglage initial (80/2h).
const BREED_COST = 120;
const BREED_COOLDOWN_MS = 3 * 60 * 60 * 1000;

function pickBreedingSpecies(speciesA, speciesB) {
  const sameElement = speciesA.element === speciesB.element;
  // Mythique : seulement en unissant deux dragons DÉJÀ légendaires (le vrai sommet de l'élevage).
  if (speciesA.variant === 4 && speciesB.variant === 4) {
    const mythicPool = SPECIES.filter(s => s.variant === 5 && (s.element === speciesA.element || s.element === speciesB.element));
    if (mythicPool.length && Math.random() < 0.15) {
      return mythicPool[randInt(0, mythicPool.length - 1)];
    }
  }
  const legendaryPool = SPECIES.filter(s => s.variant === 4 && (s.element === speciesA.element || s.element === speciesB.element));
  if (legendaryPool.length && Math.random() < 0.04) {
    return legendaryPool[randInt(0, legendaryPool.length - 1)];
  }
  const pool = SPECIES.filter(s => s.variant < 4 && (s.element === speciesA.element || s.element === speciesB.element));
  const weighted = [];
  pool.forEach(s => {
    const w = s.variant <= 1 ? 4 : s.variant === 2 ? 3 : 2;
    for (let i = 0; i < w; i++) weighted.push(s);
  });
  return weighted[randInt(0, weighted.length - 1)] || (sameElement ? speciesA : speciesA);
}

function breedDragons() {
  const { parentAId, parentBId } = ui.labo;
  if (!parentAId || !parentBId || parentAId === parentBId) return;
  if (Date.now() < (state.laboCooldownUntil || 0)) return;
  if (state.ecailles < BREED_COST) { showToast("Pas assez d'écailles"); return; }
  const busy = busyDragonIds();
  const a = state.dragons.find(d => d.id === parentAId);
  const b = state.dragons.find(d => d.id === parentBId);
  if (!a || !b || a.stage !== 'adulte' || b.stage !== 'adulte' || busy[a.id] || busy[b.id]) return;
  const resultSpecies = pickBreedingSpecies(speciesById(a.speciesId), speciesById(b.speciesId));
  state.ecailles -= BREED_COST;
  state.laboCooldownUntil = Date.now() + BREED_COOLDOWN_MS;
  state.statsBredCount = (state.statsBredCount || 0) + 1;
  state.eggInbox.push({ id: uid('egg'), speciesId: resultSpecies.id, obtainedAt: Date.now() });
  ui.labo = { parentAId: null, parentBId: null, picking: null };
  saveStateDebounced();
  haptic([20, 40, 20]);
  showToast('Un œuf est apparu au Laboratoire !');
  renderTopBar();
  renderScreenLabo();
}

// Jusqu'ici la fiche d'équipe (harmonie de tempérament, vigueur/éclat moyens) n'était
// qu'un aperçu décoratif au moment de lancer l'expédition. Elle influence désormais
// vraiment la récolte : diversité de tempérament + éclat moyen de l'équipe.
function computeTeamBonus(dragonIds, zone) {
  if (!dragonIds || dragonIds.length === 0) return { eggChanceBonus: 0, ecaillesBonus: 0 };
  const team = dragonIds.map(id => state.dragons.find(d => d.id === id)).filter(Boolean);
  if (team.length === 0) return { eggChanceBonus: 0, ecaillesBonus: 0 };
  const temperamentSet = {};
  team.forEach(d => { temperamentSet[d.temperament] = true; });
  const harmonyBonus = Object.keys(temperamentSet).length >= 2 ? 0.08 : 0;
  let totalEclat = 0;
  team.forEach(d => { totalEclat += computeDragonStats(d, zone).eclat; });
  const avgEclat = totalEclat / team.length;
  const statBonus = Math.min(0.15, avgEclat / 500);
  return { eggChanceBonus: harmonyBonus + statBonus, ecaillesBonus: Math.round(avgEclat * 0.4) };
}

function claimExpedition(expId) {
  const exp = state.expeditions.find(e => e.id === expId);
  if (!exp || exp.endAt > Date.now()) return;
  const type = EXPEDITION_TYPES.find(t => t.id === exp.typeId);
  const zone = ZONES.find(z => z.id === exp.zoneId);
  const teamBonus = computeTeamBonus(exp.dragonIds, zone);
  let ecaillesGain = randInt(type.ecaillesMin, type.ecaillesMax) + teamBonus.ecaillesBonus;
  let gotEgg = null;
  let gotLegendary = false;
  let gotMythic = false;
  if (Math.random() < Math.min(0.95, type.eggChance + teamBonus.eggChanceBonus)) {
    const picked = weightedSpeciesFromZone(zone, type.legendaryChance || 0, type.mythicChance || 0);
    if (picked.variant === 4) gotLegendary = true;
    if (picked.variant === 5) gotMythic = true;
    if (!state.discovered.includes(picked.id)) gotEgg = { id: uid('egg'), speciesId: picked.id, obtainedAt: Date.now() };
    else ecaillesGain += 40;
  }
  state.ecailles += ecaillesGain;
  addXp(5);
  state.statsExpeditionsCompleted = (state.statsExpeditionsCompleted || 0) + 1;
  if (gotEgg) state.eggInbox.push(gotEgg);
  state.expeditions = state.expeditions.filter(e => e.id !== expId);
  bumpQuestProgress('collecte', ecaillesGain);
  state.expeditionLog = state.expeditionLog || [];
  state.expeditionLog.unshift({ zoneName: zone.name, typeName: type.name, ecailles: ecaillesGain, gotEgg: !!gotEgg, legendary: gotLegendary, mythic: gotMythic, at: Date.now() });
  if (state.expeditionLog.length > 15) state.expeditionLog.length = 15;
  saveStateDebounced();
  haptic(gotEgg ? [25, 50, 50] : 30);
  playCoinSound();
  showToast(gotMythic ? `Un œuf mythique... c'est presque impossible ! ✨🌟` : gotLegendary ? `Un œuf légendaire scintille dans ta besace ! ✨` : gotEgg ? `+${ecaillesGain} écailles et un nouvel œuf !` : `+${ecaillesGain} écailles`);
  renderTopBar();
  if (ui.screen === 'carte') renderScreenCarte();
}

function buyDecor(decorId) {
  const decor = DECOR.find(d => d.id === decorId);
  if (!decor || state.decorOwned.includes(decorId) || state.ecailles < decor.cost) return;
  if (decor.seasonal) {
    const ev = getActiveEvent();
    if (!ev || ev.id !== decor.seasonal) { showToast("Cette décoration n'est pas disponible en ce moment"); return; }
  }
  state.ecailles -= decor.cost;
  state.decorOwned.push(decorId);
  saveStateDebounced();
  showToast(`${decor.name} ajouté !`);
  renderTopBar();
  renderScreenBoutique();
}

function toggleEquipDecor(decorId) {
  const equipped = state.decorEquipped.includes(decorId);
  if (!equipped && state.decorEquipped.length >= 3) { showToast('Maximum 3 décorations affichées'); return; }
  state.decorEquipped = equipped ? state.decorEquipped.filter(id => id !== decorId) : [...state.decorEquipped, decorId];
  saveStateDebounced();
  renderScreenBoutique();
}

function doReset() {
  state.expeditions.forEach(exp => cancelExpeditionNotification(exp.id));
  state = freshDefaultState();
  document.body.classList.remove('gentle-fx');
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  ui.screen = 'sanctuaire';
  ui.confirmResetOpen = false;
  ui.carte = { view: 'zones', zoneId: null, typeId: null, teamIds: [] };
  renderAll();
}


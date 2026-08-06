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

  if (ui.expeditionResult) html += expeditionResultModalHtml(ui.expeditionResult);
  else if (ui.hatchFlow) html += hatchModalHtml(ui.hatchFlow);
  else if (ui.detailDragonId) {
    const dragon = state.dragons.find(d => d.id === ui.detailDragonId);
    if (dragon) html += dragonDetailModalHtml(dragon);
  } else if (ui.detailSpecies) html += speciesDetailModalHtml(ui.detailSpecies);
  else if (ui.lockChallenge) html += lockChallengeModalHtml(ui.lockChallenge);
  else if (ui.confirmResetOpen) html += confirmResetModalHtml();
  else if (ui.confirmImportOpen) html += confirmImportModalHtml();
  else if (ui.guardianPathOpen) html += guardianPathModalHtml();
  else if (ui.rivalModalOpen) html += rivalModalHtml();
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
    <p class="font-body font-extrabold fs-13 mt-3" style="position:relative;z-index:1;color:var(--ink-soft)">${flow.taps === 0 ? t('modal.hatchMysterious') : flow.taps < 3 ? t('modal.hatchMoving') : t('modal.hatchReady')}</p>
    <div class="hatch-timing-track" style="position:relative;z-index:1;margin-top:10px">
      <div class="hatch-timing-zone"></div>
      <div class="hatch-timing-dot" style="animation-delay:-${(Date.now() - flow.startedAt) % 2400}ms"></div>
    </div>
    <p class="font-body font-bold fs-10 mt-1" style="position:relative;z-index:1;min-height:14px;color:var(--gold-deep)">${flow.lastTapBonus ? t('modal.hatchTimingBonus') : t('modal.hatchTimingHint')}</p>
    <button data-action="hatch-tap" class="btn-primary full mt-3" style="position:relative;z-index:1;margin-top:10px;">${t('modal.hatchTapButton', { n: flow.taps })}</button>
  ` : `
    <div class="relative anim-pop" style="position:relative;z-index:1">${species.variant >= 4 ? sparkBurstHtml(species.variant) : ''}${dragonSVG({ element: species.element, variant: species.variant, stage: 'bebe', size: 170 })}</div>
    ${species.variant === 4 ? `<div class="font-display font-extrabold fs-11" style="position:relative;z-index:1;color:var(--gold-deep);letter-spacing:.05em">${t('modal.legendaryBadge')}</div>` : ''}
    ${flow.perfectHatch ? `<div class="font-display font-extrabold fs-11" style="position:relative;z-index:1;color:var(--gold-deep);letter-spacing:.05em">${t('modal.perfectHatchBadge')}</div>` : ''}
    <h2 class="font-display font-extrabold text-xl mt-2" style="position:relative;z-index:1;color:var(--ink)">${escapeHtml(species.name.toUpperCase())}</h2>
    <div class="flex items-center gap-2 mt-1" style="position:relative;z-index:1">${elementChipHtml(species.element)}${rarityStarsHtml(species.variant)}</div>
    <p class="font-body fs-13 text-center mt-3 leading-relaxed rounded-2xl px-4 py-3" style="position:relative;z-index:1;color:var(--ink);background:var(--sky)">${escapeHtml(species.lore)}</p>
    <button data-action="hatch-finish" class="btn-primary full mt-4" style="position:relative;z-index:1;margin-top:16px;">${t('modal.welcome', { name: escapeHtml(species.name) })}</button>
    ${state.eggInbox.length > 0 ? `<button data-action="hatch-finish-and-continue" class="w-full font-body font-bold fs-11 mt-2\\.5 py-2" style="position:relative;z-index:1;margin-top:10px;color:var(--gold-deep)">${t('modal.hatchNext', { n: state.eggInbox.length, s: state.eggInbox.length > 1 ? 's' : '' })}</button>` : ''}
  `;

  return `<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="${t('modal.hatchAria')}"><div class="modal-sheet hatch-sheet safe-bottom-sheet" tabindex="-1">
    <div class="hatch-glow" style="background:radial-gradient(circle, ${revealed && species.variant === 4 ? 'var(--gold)' : c.light}66, transparent 70%)"></div>
    ${body}
  </div></div>`;
}

function traitBlockHtml(dragon) {
  const key = traitKey(dragon);
  const tier = bondTier(dragon);
  const mag = traitMagnitude(dragon);
  const pct = Math.round(mag * 100);
  const descArgs = key === 'loyal' ? { n: mag, s: mag > 1 ? 's' : '' } : { n: pct };
  const nextThreshold = bondNextThreshold(dragon);
  const bondLine = tier >= 3
    ? t('bond.maxed')
    : t('bond.progress', { cur: dragon.careCount || 0, total: nextThreshold });
  const bondPct = tier >= 3 ? 100 : Math.min(100, Math.round(((dragon.careCount || 0) / nextThreshold) * 100));
  return `<div class="w-full mt-3 rounded-2xl px-3 py-2\\.5" style="padding:10px 12px;background:var(--sky)">
    <div class="font-body font-bold fs-11 text-center" style="color:var(--ink)">${t('modal.temperamentLabel', { t: dragon.temperament })} · ${t('bond.tier' + tier)}</div>
    <div class="font-body fs-10 text-center mt-1" style="color:var(--ink-soft)">${t('trait.desc.' + key, descArgs)}</div>
    <div class="w-full h-1\\.5 rounded-full overflow-hidden mt-2" style="height:6px;margin-top:8px;background:#E4DCC9">
      <div class="h-full rounded-full" style="width:${bondPct}%;background:var(--gold)"></div>
    </div>
    <div class="font-body fs-9 text-center mt-1" style="color:var(--ink-soft)">${bondLine}</div>
  </div>`;
}

function dragonDetailModalHtml(dragon) {
  const species = speciesById(dragon.speciesId);
  const busy = !!busyDragonIds()[dragon.id];
  const cooldownLeft = dragon.lastCareAt ? effectiveCareCooldown(dragon) - (now - dragon.lastCareAt) : 0;
  const canCare = cooldownLeft <= 0 && !busy;
  const nextStageAt = dragon.stage === 'bebe' ? 5 : dragon.stage === 'juvenile' ? 12 : null;
  const progressPct = nextStageAt ? Math.min(100, (dragon.careCount / nextStageAt) * 100) : 100;
  const cooldownLabel = cooldownLeft >= 60000 ? t('modal.cooldownMin', { n: Math.ceil(cooldownLeft / 60000) }) : t('modal.cooldownSec', { n: Math.ceil(cooldownLeft / 1000) });

  return `<div class="modal-overlay" data-backdrop-close="close-dragon-detail" role="dialog" aria-modal="true" aria-label="${escapeHtml(dragonDisplayName(dragon, species))}"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    <button data-action="close-dragon-detail" aria-label="${t('modal.closeAria')}" class="absolute w-8 h-8 rounded-full flex items-center justify-center" style="top:12px;right:12px;background:#F1ECE2">${icon('x', { size: 16, color: 'var(--ink-soft)' })}</button>
    <button data-action="toggle-favorite" data-dragon-id="${dragon.id}" aria-pressed="${!!dragon.favorite}" aria-label="${dragon.favorite ? t('modal.removeFavorite') : t('modal.addFavorite')}" class="absolute w-8 h-8 rounded-full flex items-center justify-center" style="top:12px;left:12px;background:#F1ECE2">${icon('heart', { size: 16, color: dragon.favorite ? '#D9634A' : 'var(--ink-soft)' })}</button>
    <div class="${rarityCardClass(species.variant)}" style="border-radius:24px">${dragonSVG({ element: species.element, variant: species.variant, stage: dragon.stage, size: 140 })}</div>
    <div class="flex items-center gap-2 mt-2 w-full justify-center">
      <input id="dragon-rename-input" data-dragon-id="${dragon.id}" value="${escapeHtml(dragonDisplayName(dragon, species))}" maxlength="16" aria-label="${t('modal.renameAria')}"
        class="font-display font-extrabold text-lg text-center rounded-xl px-2 py-1" style="color:var(--ink);background:var(--sky);max-width:180px"/>
      <button data-action="rename-dragon" data-dragon-id="${dragon.id}" aria-label="${t('modal.confirmNameAria')}" class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style="background:var(--gold)">${icon('check', { size: 15, color: 'var(--ink)' })}</button>
    </div>
    <div class="flex items-center gap-2 mt-1">${elementChipHtml(species.element)}${rarityStarsHtml(species.variant)}</div>
    ${dragonStatsRowHtml(dragon, species)}
    <p class="font-body fs-13 text-center mt-3 leading-relaxed" style="color:var(--ink)">${escapeHtml(species.lore)}</p>
    ${traitBlockHtml(dragon)}
    <div class="w-full mt-4">
      <div class="flex justify-between font-body font-bold fs-11 mb-1" style="color:var(--ink-soft)">
        <span>${t('modal.stageLabel', { s: STAGE_LABEL[dragon.stage] })}</span>${nextStageAt ? `<span>${t('modal.careCount', { n: dragon.careCount, total: nextStageAt })}</span>` : ''}
      </div>
      <div class="w-full h-2 rounded-full overflow-hidden" style="background:#EEE6D8">
        <div class="h-full rounded-full" style="width:${progressPct}%;background:var(--gold)"></div>
      </div>
    </div>
    <button data-action="care-dragon" data-dragon-id="${dragon.id}" ${canCare ? '' : 'disabled'} class="btn-primary full mt-4 flex items-center justify-center gap-2" style="margin-top:16px;">
      ${icon('heart', { size: 16, color: canCare ? 'var(--ink)' : 'currentColor' })}
      ${busy ? t('modal.inExpedition') : canCare ? t('modal.pet') : cooldownLabel}
    </button>
    <button data-action="share-dragon-card" data-dragon-id="${dragon.id}" class="w-full font-body font-bold fs-11 mt-2\\.5 py-2 flex items-center justify-center gap-1\\.5" style="margin-top:10px;color:var(--gold-deep)">
      ${icon('download', { size: 13, color: 'var(--gold-deep)' })} ${t('modal.downloadCard')}
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
      showToast(t('toast.cardDownloaded'));
    }
    haptic(20);
  } catch (e) {
    showToast(t('toast.cardError'));
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
  return `<div class="flex gap-3 w-full mt-3" style="max-width:220px">${bar(t('carte.statVigueur'), vigueur, '#B5502C')}${bar(t('carte.statEclat'), eclat, 'var(--gold)')}</div>`;
}

function releaseButtonHtml(dragon, species, busy) {
  if (species.variant === 4) {
    return `<p class="font-body fs-10 text-center mt-3" style="color:var(--ink-soft)">${t('modal.legendaryNoRelease')}</p>`;
  }
  const refund = RELEASE_REFUND[species.variant];
  if (ui.releaseConfirmId === dragon.id) {
    return `<div class="w-full mt-3 rounded-2xl p-3" style="background:#FBEAE4">
      <p class="font-body fs-11 text-center mb-2" style="color:#B5502C">${t('modal.confirmReleaseText', { name: escapeHtml(dragonDisplayName(dragon, species)), n: refund })}</p>
      <div class="flex gap-2">
        <button data-action="cancel-release-dragon" class="flex-1 font-display font-bold fs-11 py-2 rounded-xl" style="background:#F1ECE2;color:var(--ink-soft)">${t('modal.cancel')}</button>
        <button data-action="confirm-release-dragon" data-dragon-id="${dragon.id}" class="flex-1 font-display font-bold fs-11 py-2 rounded-xl text-white" style="background:#B5502C">${t('modal.confirm')}</button>
      </div>
    </div>`;
  }
  return `<button data-action="request-release-dragon" data-dragon-id="${dragon.id}" ${busy ? 'disabled' : ''} class="w-full font-body font-bold fs-11 mt-3 py-2" style="color:${busy ? '#D8CFC0' : 'var(--ink-soft)'}">${t('modal.releaseButton', { n: refund })}</button>`;
}

function speciesDetailModalHtml(entry) {
  const { species, discovered } = entry;
  return `<div class="modal-overlay" data-backdrop-close="close-species-detail" role="dialog" aria-modal="true" aria-label="${discovered ? escapeHtml(species.name) : t('modal.speciesUnknownAria')}"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    <button data-action="close-species-detail" aria-label="${t('modal.closeAria')}" class="absolute w-8 h-8 rounded-full flex items-center justify-center" style="top:12px;right:12px;background:#F1ECE2">${icon('x', { size: 16, color: 'var(--ink-soft)' })}</button>
    <div style="filter:${discovered ? 'none' : 'grayscale(1) brightness(0.4)'}">${dragonSVG({ element: species.element, variant: species.variant, stage: 'adulte', size: 140 })}</div>
    <h2 class="font-display font-extrabold text-xl mt-2" style="color:var(--ink)">${discovered ? escapeHtml(species.name) : '???'}</h2>
    <div class="flex items-center gap-2 mt-1">${elementChipHtml(species.element)}${discovered ? rarityStarsHtml(species.variant) : ''}</div>
    <p class="font-body fs-13 text-center mt-3 leading-relaxed" style="color:var(--ink)">${discovered ? escapeHtml(species.lore) : t('modal.discoverToReveal')}</p>
  </div></div>`;
}

const HOLD_GATE_DURATION_MS = 3500;
const HOLD_GATE_CIRCUMFERENCE = 213.6; // 2 * PI * 34

function expeditionResultModalHtml(result) {
  const rewardIcon = result.gotEgg ? '🥚' : coinIconHtml();
  return `<div class="modal-overlay" data-backdrop-close="expedition-cash-in" role="dialog" aria-modal="true" aria-label="${t('modal.expeditionResultAria')}"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    <div class="anim-pop" style="font-size:40px;line-height:1;">${rewardIcon}</div>
    <h3 class="font-display font-bold text-lg mt-2 text-center" style="color:var(--ink)">${t('modal.expeditionResultTitle', { n: result.ecaillesGain })}</h3>
    ${result.gotEgg ? `<p class="font-body fs-13 text-center mt-1" style="color:var(--ink-soft)">${t('modal.expeditionResultEgg')}</p>` : ''}
    <button data-action="expedition-double" class="btn-primary full mt-4" style="margin-top:16px;">${t('modal.doubleOrNothing')}</button>
    <p class="font-body fs-10 text-center mt-2" style="color:var(--ink-soft)">${t('modal.doubleOrNothingOdds')}</p>
    <button data-action="expedition-cash-in" class="w-full font-display font-bold text-xs py-3 rounded-2xl mt-2" style="margin-top:8px;background:var(--sky);color:var(--ink-soft)">${t('modal.cashIn')}</button>
  </div></div>`;
}

function lockChallengeModalHtml(challenge) {
  return `<div class="modal-overlay" data-backdrop-close="close-lock-challenge" role="dialog" aria-modal="true" aria-label="${t('modal.parentalLockAria')}"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    ${icon('shield', { size: 28, color: 'var(--gold-deep)' })}
    <h3 class="font-display font-bold text-base mt-2 text-center" style="color:var(--ink)">${t('modal.adultZoneTitle')}</h3>
    <p id="hold-gate-instructions" class="font-body fs-13 text-center mt-2" style="color:var(--ink-soft)">${t('modal.holdInstructions')}</p>
    <button id="hold-gate-btn" aria-label="${t('modal.holdAria')}" class="hold-gate mt-4" style="margin-top:16px;">
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
  return `<div class="modal-overlay" data-backdrop-close="cancel-reset" role="dialog" aria-modal="true" aria-label="${t('modal.resetConfirmAria')}"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    <h3 class="font-display font-bold text-base text-center" style="color:var(--ink)">${t('modal.resetTitle')}</h3>
    <p class="font-body fs-13 text-center mt-2" style="color:var(--ink-soft)">${t('modal.resetText')}</p>
    <div class="flex gap-2 w-full mt-4" style="margin-top:16px;">
      <button data-action="cancel-reset" class="btn-ghost flex-1">${t('modal.cancel')}</button>
      <button data-action="confirm-reset" class="flex-1 font-display font-bold text-xs py-3 rounded-2xl text-white" style="background:#B5502C">${t('modal.confirm')}</button>
    </div>
  </div></div>`;
}

function guardianPathTierRowHtml(pt) {
  const claimed = state.passClaimedTiers.includes(pt.tier);
  const unlocked = state.passPoints >= pt.threshold;
  const rewardLabel = pt.reward.type === 'ecailles'
    ? `${coinIconHtml()} +${pt.reward.amount}`
    : `${decorIconSVG(pt.reward.id, 26)}`;
  const rewardText = pt.reward.type === 'decor' ? t('pass.rewardDecorLabel') : '';
  let action;
  if (claimed) {
    action = `<span class="font-body font-bold fs-10 shrink-0" style="color:var(--ink-soft)">${icon('check', { size: 13, color: 'var(--ink-soft)' })} ${t('pass.claimed')}</span>`;
  } else if (unlocked) {
    action = `<button data-action="claim-pass-tier" data-tier="${pt.tier}" class="font-display font-bold fs-10 rounded-xl shrink-0" style="padding:6px 10px;background:var(--gold);color:var(--ink)">${t('pass.claim')}</button>`;
  } else {
    action = `<span class="font-body font-bold fs-10 shrink-0" style="color:var(--ink-soft)">${t('pass.locked', { cur: Math.min(state.passPoints, pt.threshold), total: pt.threshold })}</span>`;
  }
  return `<div class="flex items-center gap-2\\.5" style="gap:10px;padding:8px 0;border-bottom:1px solid #EEE6D8;opacity:${claimed ? 0.65 : 1}">
    <div class="flex items-center justify-center shrink-0" style="width:30px;height:30px">${rewardLabel}</div>
    <div class="flex-1">
      <div class="font-body font-bold fs-12" style="color:var(--ink)">${t('pass.tierLabel', { n: pt.tier })}</div>
      ${rewardText ? `<div class="font-body fs-10" style="color:var(--ink-soft)">${rewardText}</div>` : ''}
    </div>
    ${action}
  </div>`;
}

function guardianPathModalHtml() {
  const rows = PASS_TIERS.map(guardianPathTierRowHtml).join('');
  return `<div class="modal-overlay" data-backdrop-close="close-guardian-path" role="dialog" aria-modal="true" aria-label="${t('pass.title')}"><div class="modal-sheet safe-bottom-sheet" style="align-items:stretch;text-align:left" tabindex="-1">
    <button data-action="close-guardian-path" aria-label="${t('pass.closeAria')}" class="absolute w-8 h-8 rounded-full flex items-center justify-center" style="top:12px;right:12px;background:#F1ECE2">${icon('x', { size: 16, color: 'var(--ink-soft)' })}</button>
    <div class="flex items-center gap-2 mb-1" style="margin-bottom:4px">
      <span style="font-size:22px" aria-hidden="true">🏵️</span>
      <h3 class="font-display font-bold text-sm" style="color:var(--ink)">${t('pass.title')}</h3>
    </div>
    <p class="font-body fs-11 mb-3" style="margin-bottom:12px;color:var(--ink-soft)">${t('pass.subtitle')}</p>
    <div class="w-full">${rows}</div>
  </div></div>`;
}

function rivalStatRowHtml(label, mineVal, theirVal) {
  const max = Math.max(mineVal, theirVal, 1);
  const bar = (val, color) => `<div class="w-full rounded-full overflow-hidden" style="background:#EEE6D8;height:6px;"><div class="h-full rounded-full" style="width:${Math.max(4, (val / max) * 100)}%;background:${color}"></div></div>`;
  return `<div class="mb-2\\.5" style="margin-bottom:10px">
    <div class="font-body font-bold fs-11 mb-1" style="color:var(--ink)">${label}</div>
    <div class="flex items-center gap-2">
      <span class="font-display font-extrabold fs-11 shrink-0" style="width:24px;color:var(--gold-deep)">${mineVal}</span>
      ${bar(mineVal, 'var(--gold)')}
    </div>
    <div class="flex items-center gap-2 mt-1">
      <span class="font-display font-extrabold fs-11 shrink-0" style="width:24px;color:var(--ink-soft)">${theirVal}</span>
      ${bar(theirVal, '#B7AF9E')}
    </div>
  </div>`;
}

function rivalComparisonBlockHtml(rival) {
  const mine = guardianProfileStats();
  return `<div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
    <div class="flex items-center justify-between mb-2\\.5" style="margin-bottom:10px">
      <div class="flex items-center gap-2">
        <span class="font-display font-bold fs-12" style="color:var(--gold-deep)">${escapeHtml(mine.name)}</span>
        <span class="font-body fs-10" style="color:var(--ink-soft)">${t('rival.you')}</span>
      </div>
      <span class="font-body fs-11" style="color:var(--ink-soft)">${escapeHtml(rival.name)}</span>
    </div>
    ${rivalStatRowHtml(t('rival.statLevel'), mine.level, rival.level)}
    ${rivalStatRowHtml(t('rival.statDiscovered'), mine.discovered, rival.discovered)}
    ${rivalStatRowHtml(t('rival.statLegendary'), mine.legendary, rival.legendary)}
    ${rivalStatRowHtml(t('rival.statMythic'), mine.mythic, rival.mythic)}
    ${rivalStatRowHtml(t('rival.statPassTier'), mine.passTier, rival.passTier)}
    ${rivalStatRowHtml(t('rival.statStreak'), mine.streak, rival.streak)}
    <button data-action="remove-rival-comparison" data-rival-id="${rival.id}" class="font-body font-bold fs-10 mt-1" style="color:var(--ink-soft);text-decoration:underline">${t('rival.remove')}</button>
  </div>`;
}

function rivalModalHtml() {
  const mine = guardianProfileStats();
  const code = encodeGuardianCode(mine) || '';
  const history = (state.rivalComparisons || []);
  return `<div class="modal-overlay" data-backdrop-close="close-rival-modal" role="dialog" aria-modal="true" aria-label="${t('rival.title')}"><div class="modal-sheet safe-bottom-sheet" style="align-items:stretch;text-align:left" tabindex="-1">
    <button data-action="close-rival-modal" aria-label="${t('pass.closeAria')}" class="absolute w-8 h-8 rounded-full flex items-center justify-center" style="top:12px;right:12px;background:#F1ECE2">${icon('x', { size: 16, color: 'var(--ink-soft)' })}</button>
    <div class="flex items-center gap-2 mb-1" style="margin-bottom:4px">
      <span style="font-size:22px" aria-hidden="true">🤝</span>
      <h3 class="font-display font-bold text-sm" style="color:var(--ink)">${t('rival.title')}</h3>
    </div>
    <p class="font-body fs-11 mb-3" style="margin-bottom:12px;color:var(--ink-soft)">${t('rival.subtitle')}</p>

    <div class="rounded-2xl p-3 mb-3" style="background:var(--sky)">
      <div class="font-body font-bold fs-11 mb-1\\.5" style="margin-bottom:6px;color:var(--ink)">${t('rival.myProfile')}</div>
      <div class="font-mono fs-10 rounded-xl px-2\\.5 py-2 mb-2" style="padding:8px 10px;margin-bottom:8px;background:#fff;color:var(--ink-soft);word-break:break-all;user-select:all">${escapeHtml(code)}</div>
      <button data-action="copy-rival-code" data-code="${escapeHtml(code)}" class="w-full font-display font-bold fs-11 py-2 rounded-xl" style="background:var(--gold);color:var(--ink)">${icon('download', { size: 13 })} ${t('rival.copyCode')}</button>
    </div>

    <div class="rounded-2xl p-3 mb-3" style="background:var(--parchment)">
      <label for="rival-code-input" class="font-body font-bold fs-11 mb-1\\.5" style="display:block;margin-bottom:6px;color:var(--ink)">${t('rival.pasteLabel')}</label>
      <input id="rival-code-input" type="text" placeholder="${t('rival.pastePlaceholder')}" class="w-full rounded-xl px-3 py-2 font-mono fs-10 mb-2" style="padding:8px 10px;margin-bottom:8px;border:1px solid #DDD3C0;background:#fff;color:var(--ink)"/>
      <button data-action="compare-rival-code" class="w-full font-display font-bold fs-11 py-2 rounded-xl" style="background:var(--gold-deep-btn);color:#fff">${t('rival.compareButton')}</button>
    </div>

    ${history.length > 0 ? `<div class="font-body font-bold fs-12 mb-2" style="color:var(--ink)">${t('rival.history')}</div>${history.map(rivalComparisonBlockHtml).join('')}` : ''}
  </div></div>`;
}

function tutorialSlides() {
  return [
    { emoji: '🏡', title: t('tutorial.slide1Title'), text: t('tutorial.slide1Text') },
    { emoji: '🗺️', title: t('tutorial.slide2Title'), text: t('tutorial.slide2Text') },
    { emoji: '📖', title: t('tutorial.slide3Title'), text: t('tutorial.slide3Text') },
    { emoji: '🧪', title: t('tutorial.slide4Title'), text: t('tutorial.slide4Text') },
  ];
}

function tutorialModalHtml() {
  const i = ui.tutorialStep;
  const slides = tutorialSlides();
  const slide = slides[i];
  const isLast = i === slides.length - 1;
  const dots = slides.map((_, idx) => `<span class="rounded-full" style="width:${idx === i ? 16 : 6}px;height:6px;background:${idx === i ? 'var(--gold)' : '#E6DFD3'};transition:width .15s ease"></span>`).join('');
  return `<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="${t('tutorial.discoverAria')}"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    <div style="font-size:48px" aria-hidden="true">${slide.emoji}</div>
    <h2 class="font-display font-extrabold text-lg mt-2" style="color:var(--ink)">${escapeHtml(slide.title)}</h2>
    <p class="font-body fs-13 text-center mt-2 leading-relaxed" style="color:var(--ink-soft)">${escapeHtml(slide.text)}</p>
    <div class="flex items-center gap-1\\.5 mt-4" style="gap:6px">${dots}</div>
    <div class="flex gap-2 w-full mt-4" style="margin-top:16px">
      ${!isLast ? `<button data-action="tutorial-skip" class="btn-ghost flex-1">${t('tutorial.skip')}</button>` : ''}
      <button data-action="tutorial-next" class="flex-1 font-display font-bold text-xs py-3 rounded-2xl" style="background:var(--gold);color:var(--ink)">${isLast ? t('tutorial.start') : t('tutorial.next')}</button>
    </div>
  </div></div>`;
}

function confirmImportModalHtml() {
  const s = ui.pendingImport || {};
  const dragonCount = Array.isArray(s.dragons) ? s.dragons.length : 0;
  const discoveredCount = Array.isArray(s.discovered) ? s.discovered.length : 0;
  const name = s.gardienName ? escapeHtml(s.gardienName) : t('topbar.roleGardien');
  return `<div class="modal-overlay" data-backdrop-close="cancel-import" role="dialog" aria-modal="true" aria-label="${t('importModal.aria')}"><div class="modal-sheet safe-bottom-sheet" tabindex="-1">
    <h3 class="font-display font-bold text-base text-center" style="color:var(--ink)">${t('importModal.title')}</h3>
    <p class="font-body fs-13 text-center mt-2" style="color:var(--ink-soft)">${t('importModal.summary', { name: `<strong>${name}</strong>`, n1: dragonCount, s1: dragonCount > 1 ? 's' : '', n2: discoveredCount, s2: discoveredCount > 1 ? 's' : '' })}</p>
    <p class="font-body fs-11 text-center mt-1" style="color:var(--ink-soft)">${t('importModal.deviceWarning')}</p>
    <div class="flex gap-2 w-full mt-4" style="margin-top:16px;">
      <button data-action="cancel-import" class="btn-ghost flex-1">${t('modal.cancel')}</button>
      <button data-action="confirm-import" class="flex-1 font-display font-bold text-xs py-3 rounded-2xl text-white" style="background:var(--gold);color:var(--ink)">${t('importModal.import')}</button>
    </div>
  </div></div>`;
}

function renderToast() {
  const root = document.getElementById('toast-root');
  if (!ui.toast) { root.innerHTML = ''; return; }
  const big = ui.toastVariant === 'milestone';
  root.innerHTML = `<div class="absolute left-4 right-4 z-50 anim-fadeup" style="bottom:92px">
    <div class="font-display font-bold ${big ? 'text-sm' : 'text-xs'} text-center py-2\\.5 rounded-2xl shadow-lg" style="padding:${big ? '14px 12px' : '10px 0'};background:${big ? 'linear-gradient(135deg,var(--gold),var(--gold-deep-btn))' : 'var(--ink)'};color:${big ? 'var(--ink)' : '#fff'}">${escapeHtml(ui.toast)}</div>
  </div>`;
}

function showToast(text, variant) {
  ui.toast = text;
  ui.toastVariant = variant || null;
  renderToast();
  clearTimeout(toastTimer);
  // durée proportionnelle à la longueur du message : un enfant a besoin de plus de temps pour lire une phrase complète
  const duration = Math.min(6000, Math.max(3200, 900 + text.length * 55));
  toastTimer = setTimeout(() => { ui.toast = null; ui.toastVariant = null; renderToast(); }, duration);
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
    if (instructions) instructions.textContent = t('modal.unlocked');
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
  const root = document.getElementById('screen-root');
  if (root) {
    root.classList.remove('screen-transition-in');
    void root.offsetWidth; // force le reflow pour rejouer l'animation à chaque changement d'écran
    root.classList.add('screen-transition-in');
  }
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

  ui.hatchFlow = { egg, taps: 0, revealedDragon: null, startedAt: Date.now(), bonusHits: 0, lastTapBonus: false };
  renderAll();
}

// Série de soin quotidien par dragon : le premier câlin du jour (calendaire) compte pour la série ;
// à partir de 3 jours d'affilée, le dragon gagne un petit bonus d'XP au soin (constance récompensée).
function bumpCareStreak(d) {
  const today = todayDateStr();
  if (d.lastCareDateStr === today) return false;
  if (d.lastCareDateStr) {
    const prev = new Date(d.lastCareDateStr + 'T00:00:00Z');
    const cur = new Date(today + 'T00:00:00Z');
    const diffDays = Math.round((cur - prev) / 86400000);
    d.careStreakDays = diffDays === 1 ? (d.careStreakDays || 0) + 1 : 1;
  } else {
    d.careStreakDays = 1;
  }
  d.lastCareDateStr = today;
  return d.careStreakDays >= 3;
}

function careAllDragons() {
  const busy = busyDragonIds();
  let caredCount = 0;
  let grownCount = 0;
  let streakBonusXp = 0;
  let loyalBonusXp = 0;
  state.dragons.forEach(d => {
    if (busy[d.id]) return;
    if (d.lastCareAt && (Date.now() - d.lastCareAt) < effectiveCareCooldown(d)) return;
    const careCount = d.careCount + 1;
    const newStage = computeStage(careCount);
    if (newStage !== d.stage) grownCount += 1;
    d.careCount = careCount;
    d.lastCareAt = Date.now();
    d.stage = newStage;
    if (bumpCareStreak(d)) streakBonusXp += 1;
    if (isLoyalDragon(d)) loyalBonusXp += traitMagnitude(d);
    caredCount += 1;
  });
  if (caredCount === 0) { showToast(t('toast.noDragonForCare')); return; }
  addXp(caredCount + streakBonusXp + loyalBonusXp);
  bumpQuestProgress('soin', caredCount);
  saveStateDebounced();
  playCareSound();
  haptic(30);
  showToast(grownCount > 0
    ? t('toast.caredGrew', { n: caredCount, s: caredCount > 1 ? 's' : '', g: grownCount, s2: grownCount > 1 ? 'ssent' : 't' })
    : t('toast.caredPlain', { n: caredCount, s: caredCount > 1 ? 's' : '' }));
  renderTopBar();
  if (ui.screen === 'sanctuaire') renderScreenSanctuaire();
}

function careDragon(dragonId) {
  const d = state.dragons.find(dd => dd.id === dragonId);
  if (!d) return;
  if (d.lastCareAt && (Date.now() - d.lastCareAt) < effectiveCareCooldown(d)) return;
  const careCount = d.careCount + 1;
  const newStage = computeStage(careCount);
  const grew = newStage !== d.stage;
  d.careCount = careCount;
  d.lastCareAt = Date.now();
  d.stage = newStage;
  const streakBonus = bumpCareStreak(d);
  // Loyal : points d'affection supplémentaires à chaque câlin, davantage si le lien est fort.
  addXp((streakBonus ? 2 : 1) + (isLoyalDragon(d) ? traitMagnitude(d) : 0));
  bumpQuestProgress('soin', 1);
  saveStateDebounced();
  if (grew) { showToast(t('toast.grew', { name: speciesById(d.speciesId).name })); playHatchSound(); }
  else { playCareSound(); }
  renderTopBar();
  if (ui.screen === 'sanctuaire') renderScreenSanctuaire();
  renderModals();
}

function hatchTimingPos(startedAt) {
  const period = 1200;
  const elapsed = (Date.now() - startedAt) % (period * 2);
  return elapsed <= period ? elapsed / period : (period * 2 - elapsed) / period;
}
function hatchTimingIsBonus(startedAt) {
  const pos = hatchTimingPos(startedAt);
  return pos >= 0.55 && pos <= 0.82;
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
  const perfectHatch = (flow.bonusHits || 0) >= 2;
  if (perfectHatch) {
    newDragon.careCount = 1;
    state.ecailles += 15;
  }
  state.eggInbox = state.eggInbox.filter(e => e.id !== egg.id);
  state.dragons.push(newDragon);
  if (newlyDiscovered) state.discovered.push(egg.speciesId);
  addXp(10);
  state.statsEggsHatched = (state.statsEggsHatched || 0) + 1;
  bumpQuestProgress('eclosion', 1);
  haptic(newlyDiscovered ? [30, 40, 60] : 40);
  playHatchSound();
  if (perfectHatch) setTimeout(() => showToast(t('toast.perfectHatch'), 'milestone'), 300);

  const justCompleted = newlyDiscovered && state.discovered.length === SPECIES.length && !state.collectionCompleteShown;
  if (justCompleted) {
    state.collectionCompleteShown = true;
    showToast(t('toast.dragondexComplete'), 'milestone');
    haptic([40, 60, 40, 60, 80]);
  } else if (newlyDiscovered && COLLECTION_MILESTONES.includes(state.discovered.length) && !state.collectionMilestonesShown.includes(state.discovered.length)) {
    // Petit palier de collection intermédiaire (avant les 100%), pour garder un cap régulier à atteindre.
    state.collectionMilestonesShown.push(state.discovered.length);
    const milestoneBonus = state.discovered.length * 3;
    state.ecailles += milestoneBonus;
    setTimeout(() => showToast(t('toast.collectionMilestone', { n: state.discovered.length, bonus: milestoneBonus }), 'milestone'), 700);
  }

  saveStateDebounced();
  ui.hatchFlow = { egg, taps: flow.taps, revealedDragon: newDragon, perfectHatch };
  renderModals();
}

/* =========================================================================
   NOTIFICATIONS NATIVES (Capacitor uniquement — no-op silencieux ailleurs)
   ========================================================================= */
function hasNativeNotifications() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
    && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications);
}
function notifIdFor(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % 2147483647;
}
function notifIdForExpedition(expId) {
  return notifIdFor('exp:' + expId);
}
const STREAK_NOTIF_ID = notifIdFor('streak-reminder');
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
        body: t('notif.body'),
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

// Rappel doux de série de connexion : reprogrammé à chaque ouverture pour le lendemain 20h,
// avec le compte de jours à jour. Un seul rappel actif à la fois (même id), donc pas de spam
// si le joueur ne revient pas — et il disparaît de lui-même si la série tombe à 0.
async function scheduleStreakReminder() {
  if (!hasNativeNotifications()) return;
  try {
    const { LocalNotifications } = window.Capacitor.Plugins;
    if ((state.loginStreak || 0) < 2) {
      await LocalNotifications.cancel({ notifications: [{ id: STREAK_NOTIF_ID }] });
      return;
    }
    const current = await LocalNotifications.checkPermissions();
    if (current.display !== 'granted') {
      const requested = await LocalNotifications.requestPermissions();
      if (requested.display !== 'granted') return;
    }
    const target = new Date();
    target.setDate(target.getDate() + 1);
    target.setHours(20, 0, 0, 0);
    await LocalNotifications.schedule({
      notifications: [{
        id: STREAK_NOTIF_ID,
        title: 'Lumidra',
        body: t('notif.streakBody', { n: state.loginStreak }),
        schedule: { at: target },
      }],
    });
  } catch (e) {}
}

function startExpedition(zoneId, typeId, dragonIds) {
  const type = EXPEDITION_TYPES.find(t => t.id === typeId);
  const newExp = { id: uid('exp'), zoneId, typeId, dragonIds, startAt: Date.now(), endAt: Date.now() + type.seconds * 1000 };
  state.expeditions.push(newExp);
  scheduleExpeditionNotification(newExp);
  bumpQuestProgress('expedition', 1);
  saveStateDebounced();
  showToast(t('toast.expeditionLaunched'));
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
// Pitié (pity) : évite les séries de malchance trop longues côté élevage, sans changer
// la moyenne long terme de façon perceptible — un classique des systèmes de gacha "honnêtes".
const LABO_PITY_LEGENDARY_THRESHOLD = 12;
const LABO_PITY_MYTHIC_THRESHOLD = 8;

function pickBreedingSpecies(speciesA, speciesB) {
  const sameElement = speciesA.element === speciesB.element;
  const bothLegendary = speciesA.variant === 4 && speciesB.variant === 4;

  // Mythique : seulement en unissant deux dragons DÉJÀ légendaires (le vrai sommet de l'élevage).
  if (bothLegendary) {
    const mythicPool = SPECIES.filter(s => s.variant === 5 && (s.element === speciesA.element || s.element === speciesB.element));
    const pityReady = (state.laboPityMythic || 0) >= LABO_PITY_MYTHIC_THRESHOLD;
    if (mythicPool.length && (pityReady || Math.random() < 0.15)) {
      state.laboPityMythic = 0;
      state.laboPityLegendary = 0;
      return mythicPool[randInt(0, mythicPool.length - 1)];
    }
    state.laboPityMythic = (state.laboPityMythic || 0) + 1;
  }
  const legendaryPool = SPECIES.filter(s => s.variant === 4 && (s.element === speciesA.element || s.element === speciesB.element));
  const legendaryPityReady = (state.laboPityLegendary || 0) >= LABO_PITY_LEGENDARY_THRESHOLD;
  if (legendaryPool.length && (legendaryPityReady || Math.random() < 0.04)) {
    state.laboPityLegendary = 0;
    return legendaryPool[randInt(0, legendaryPool.length - 1)];
  }
  state.laboPityLegendary = (state.laboPityLegendary || 0) + 1;
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
  if (state.ecailles < BREED_COST) { showToast(t('toast.notEnoughScales')); return; }
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
  showToast(t('toast.eggAppeared'));
  renderTopBar();
  renderScreenLabo();
}

// Jusqu'ici la fiche d'équipe (harmonie de tempérament, vigueur/éclat moyens) n'était
// qu'un aperçu décoratif au moment de lancer l'expédition. Elle influence désormais
// vraiment la récolte : diversité de tempérament + diversité élémentaire + éclat moyen de l'équipe.
function computeTeamBonus(dragonIds, zone) {
  if (!dragonIds || dragonIds.length === 0) return { eggChanceBonus: 0, ecaillesBonus: 0, boldLegendaryMult: 1 };
  const team = dragonIds.map(id => state.dragons.find(d => d.id === id)).filter(Boolean);
  if (team.length === 0) return { eggChanceBonus: 0, ecaillesBonus: 0, boldLegendaryMult: 1 };
  const temperamentSet = {};
  team.forEach(d => { temperamentSet[d.temperament] = true; });
  const harmonyBonus = Object.keys(temperamentSet).length >= 2 ? 0.08 : 0;
  const elementSet = {};
  team.forEach(d => { elementSet[speciesById(d.speciesId).element] = true; });
  const elementalBonus = Object.keys(elementSet).length >= 3 ? 0.1 : Object.keys(elementSet).length === 2 ? 0.05 : 0;
  // "Expédition parfaite" : toute l'équipe est d'un élément propre à la zone visitée.
  const perfectMatch = team.every(d => zone.elements.includes(speciesById(d.speciesId).element));
  const perfectMatchBonus = perfectMatch ? 0.12 : 0;
  let totalEclat = 0;
  let totalVigueur = 0;
  team.forEach(d => { const st = computeDragonStats(d, zone); totalEclat += st.eclat; totalVigueur += st.vigueur; });
  const avgEclat = totalEclat / team.length;
  const avgVigueur = totalVigueur / team.length;
  const statBonus = Math.min(0.15, avgEclat / 500);
  // Audacieux : chaque dragon Audacieux de l'équipe augmente les chances de rareté selon son propre lien.
  const boldLegendaryMult = 1 + team.filter(isBoldDragon).reduce((sum, d) => sum + traitMagnitude(d), 0);
  return {
    eggChanceBonus: harmonyBonus + elementalBonus + perfectMatchBonus + statBonus,
    ecaillesBonus: Math.round(avgEclat * (perfectMatch ? 0.55 : 0.4) + avgVigueur * 0.15),
    perfectMatch,
    boldLegendaryMult,
  };
}

// Accélérer une expédition en cours contre des écailles : un puits de dépense simple,
// et un vrai choix (patienter gratuitement vs. dépenser pour récupérer son équipe plus tôt).
function speedUpCost(remainingMs) {
  return Math.max(15, Math.round(remainingMs / 1000 / 20));
}

function speedUpExpedition(expId) {
  const exp = state.expeditions.find(e => e.id === expId);
  if (!exp) return;
  const remaining = exp.endAt - Date.now();
  if (remaining <= 0) return;
  const cost = speedUpCost(remaining);
  if (state.ecailles < cost) { showToast(t('toast.notEnoughScales')); return; }
  state.ecailles -= cost;
  exp.endAt = Date.now();
  saveStateDebounced();
  showToast(t('toast.expeditionSpedUp'));
  haptic(20);
  renderTopBar();
  if (ui.screen === 'carte') renderScreenCarte();
}

function claimExpedition(expId) {
  const exp = state.expeditions.find(e => e.id === expId);
  if (!exp || exp.endAt > Date.now()) return;
  const type = EXPEDITION_TYPES.find(t => t.id === exp.typeId);
  const zone = ZONES.find(z => z.id === exp.zoneId);
  const teamBonus = computeTeamBonus(exp.dragonIds, zone);
  const activeEvent = getActiveEvent();
  const eventBoost = !!(activeEvent && zone.elements.includes(activeEvent.boostElement));
  let ecaillesGain = randInt(type.ecaillesMin, type.ecaillesMax) + teamBonus.ecaillesBonus;
  let gotEgg = null;
  let gotLegendary = false;
  let gotMythic = false;
  const effEggChance = type.eggChance + teamBonus.eggChanceBonus + (eventBoost ? 0.05 : 0);
  if (Math.random() < Math.min(0.97, effEggChance)) {
    const effLegendaryChance = (type.legendaryChance || 0) * (eventBoost ? 1.5 : 1) * (teamBonus.boldLegendaryMult || 1);
    const effMythicChance = (type.mythicChance || 0) * (eventBoost ? 1.3 : 1) * (teamBonus.boldLegendaryMult || 1);
    const picked = weightedSpeciesFromZone(zone, effLegendaryChance, effMythicChance);
    if (picked.variant === 4) gotLegendary = true;
    if (picked.variant === 5) gotMythic = true;
    if (!state.discovered.includes(picked.id)) gotEgg = { id: uid('egg'), speciesId: picked.id, obtainedAt: Date.now() };
    else ecaillesGain += 40;
  }
  addXp(5);
  state.statsExpeditionsCompleted = (state.statsExpeditionsCompleted || 0) + 1;
  if (gotEgg) state.eggInbox.push(gotEgg);
  state.expeditions = state.expeditions.filter(e => e.id !== expId);
  // Le gain d'écailles est crédité tout de suite (jamais de récompense "en attente" qui pourrait
  // se perdre si l'appli se ferme) ; seul un doublement BONUS optionnel est ensuite proposé.
  state.ecailles += ecaillesGain;
  bumpQuestProgress('collecte', ecaillesGain);
  state.expeditionLog = state.expeditionLog || [];
  const logEntry = { zoneName: zone.name, typeName: type.name, ecailles: ecaillesGain, gotEgg: !!gotEgg, legendary: gotLegendary, mythic: gotMythic, at: Date.now() };
  state.expeditionLog.unshift(logEntry);
  if (state.expeditionLog.length > 15) state.expeditionLog.length = 15;
  saveStateDebounced();
  haptic(gotEgg ? [25, 50, 50] : 30);
  playCoinSound();
  showToast(gotMythic ? t('toast.mythicEgg') : gotLegendary ? t('toast.legendaryEgg') : gotEgg ? t('toast.gainEggScales', { n: ecaillesGain }) : t('toast.gainScales', { n: ecaillesGain }));
  renderTopBar();
  if (ui.screen === 'carte') renderScreenCarte();
  // Offre optionnelle de doubler ce gain (bonus, sans rien risquer de ce qui est déjà acquis) ;
  // réservé aux expéditions d'équipe (rares, plusieurs heures) pour que ça reste un moment fort,
  // pas une interruption répétitive sur les courtes reconnaissances de 3 minutes.
  if (ecaillesGain > 0 && type.team) {
    ui.expeditionResult = { ecaillesGain, gotEgg: !!gotEgg, logEntry };
    renderModals();
  }
}

// Résout le doublement optionnel après une expédition (voir claimExpedition / expeditionResultModalHtml).
// Le gain de base est déjà crédité — ignorer/fermer cette modale ne coûte ni ne change rien.
function resolveExpeditionGain(doubleDown) {
  const r = ui.expeditionResult;
  if (!r) return;
  if (doubleDown) {
    const won = Math.random() < 0.5;
    const delta = won ? r.ecaillesGain : -r.ecaillesGain;
    state.ecailles = Math.max(0, state.ecailles + delta);
    if (r.logEntry) r.logEntry.ecailles = won ? r.ecaillesGain * 2 : 0;
    saveStateDebounced();
    playCoinSound();
    showToast(won ? t('toast.doubleWon', { n: r.ecaillesGain * 2 }) : t('toast.doubleLost'));
    renderTopBar();
  }
  ui.expeditionResult = null;
  renderModals();
}

function buyDecor(decorId) {
  const decor = DECOR.find(d => d.id === decorId);
  if (!decor || state.decorOwned.includes(decorId) || state.ecailles < decor.cost) return;
  if (decor.seasonal) {
    const ev = getActiveEvent();
    if (!ev || ev.id !== decor.seasonal) { showToast(t('toast.decorUnavailable')); return; }
  }
  state.ecailles -= decor.cost;
  state.decorOwned.push(decorId);
  saveStateDebounced();
  showToast(t('toast.decorAdded', { name: decor.name }));
  renderTopBar();
  renderScreenBoutique();
}

function toggleEquipDecor(decorId) {
  const equipped = state.decorEquipped.includes(decorId);
  if (!equipped && state.decorEquipped.length >= 3) { showToast(t('toast.maxDecor')); return; }
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


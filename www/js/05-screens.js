/* =========================================================================
   ÉCRAN — ONBOARDING
   ========================================================================= */

function renderOnboarding() {
  const d = ui.onboarding;
  const root = document.getElementById('onboarding-root');
  root.innerHTML = `
  <div class="absolute inset-0 flex flex-col items-center justify-center px-6 text-center safe-top safe-bottom" style="background:linear-gradient(180deg,#FFF6E0,var(--sky) 60%)">
    <div style="position:relative;width:220px;height:150px;display:flex;align-items:center;justify-content:center;margin-bottom:4px">
      ${[
        { el: 'feu', top: '2%', left: '6%', size: 34, delay: '0s' },
        { el: 'eau', top: '4%', left: '78%', size: 30, delay: '.5s' },
        { el: 'nature', top: '58%', left: '0%', size: 32, delay: '1s' },
        { el: 'air', top: '62%', left: '82%', size: 30, delay: '1.6s' },
        { el: 'terre', top: '78%', left: '30%', size: 26, delay: '.8s' },
        { el: 'lumiere', top: '80%', left: '62%', size: 26, delay: '1.3s' },
      ].map(p => `<div class="dragon-anim-idle" style="position:absolute;top:${p.top};left:${p.left};opacity:.38;animation-delay:${p.delay};pointer-events:none" aria-hidden="true">${dragonSVG({ element: p.el, variant: 0, stage: 'bebe', size: p.size })}</div>`).join('')}
      <div class="anim-pulse onboarding-egg-wrap" style="position:relative;z-index:1">${eggSVG({ element: 'lumiere', size: 84, cracks: 0 })}</div>
    </div>
    <h1 class="font-display font-extrabold text-3xl" style="color:var(--ink)">Lumidra</h1>
    <p class="font-body font-bold text-sm mt-1 mb-6" style="color:var(--ink-soft)">${t('onboarding.tagline')}</p>

    <input id="onboarding-name-input" data-bind="onboarding-name" value="${escapeHtml(d.name)}" placeholder="${t('onboarding.namePlaceholder')}" maxlength="16"
      aria-label="${t('onboarding.namePlaceholder')}" autocomplete="given-name"
      class="w-full font-body font-bold rounded-2xl px-4 py-3 text-center mb-4" style="background:var(--parchment);color:var(--ink)"/>

    <div class="w-full flex gap-3 mb-6">
      <button data-action="select-mode" data-mode="eclosion" aria-pressed="${d.mode === 'eclosion'}" class="flex-1 rounded-2xl p-3\\.5 flex flex-col items-center" style="padding:14px;background:${d.mode === 'eclosion' ? 'var(--gold)' : 'var(--parchment)'};outline:${d.mode === 'eclosion' ? '2px solid var(--gold-deep)' : 'none'}">
        <span class="font-display font-extrabold text-base" style="color:var(--ink)">${t('onboarding.modeEclosion')}</span>
        <span class="font-display font-bold fs-10 px-2 py-0.5 rounded-full mt-1" style="background:${d.mode === 'eclosion' ? 'rgba(58,46,42,.16)' : 'var(--sky)'};color:var(--ink)">10+</span>
        <span class="font-body font-semibold fs-10 mt-1\\.5 text-center" style="margin-top:6px;color:${d.mode === 'eclosion' ? 'var(--ink)' : 'var(--ink-soft)'}">${t('onboarding.modeEclosionDesc')}</span>
      </button>
      <button data-action="select-mode" data-mode="stratege" aria-pressed="${d.mode === 'stratege'}" class="flex-1 rounded-2xl p-3\\.5 flex flex-col items-center" style="padding:14px;background:${d.mode === 'stratege' ? 'var(--gold)' : 'var(--parchment)'};outline:${d.mode === 'stratege' ? '2px solid var(--gold-deep)' : 'none'}">
        <span class="font-display font-extrabold text-base" style="color:var(--ink)">${t('onboarding.modeStratege')}</span>
        <span class="font-display font-bold fs-10 px-2 py-0.5 rounded-full mt-1" style="background:${d.mode === 'stratege' ? 'rgba(58,46,42,.16)' : 'var(--sky)'};color:var(--ink)">14+</span>
        <span class="font-body font-semibold fs-10 mt-1\\.5 text-center" style="margin-top:6px;color:${d.mode === 'stratege' ? 'var(--ink)' : 'var(--ink-soft)'}">${t('onboarding.modeStrategeDesc')}</span>
      </button>
    </div>

    <button data-action="complete-onboarding" class="btn-primary full">${t('onboarding.start')}</button>
    <p class="font-body fs-10 mt-4" style="color:var(--ink-soft)">${t('onboarding.hint')}</p>
  </div>`;
}

/* =========================================================================
   BARRE SUPÉRIEURE ET NAVIGATION
   ========================================================================= */

function renderTopBar() {
  const root = document.getElementById('topbar-root');
  const complete = state.discovered.length === SPECIES.length;
  const coinGained = typeof ui._prevEcailles === 'number' && state.ecailles > ui._prevEcailles;
  ui._prevEcailles = state.ecailles;
  root.innerHTML = `
  <div class="flex items-center justify-between px-4 pt-4 pb-2 safe-top">
    <div class="flex items-center gap-2\\.5" style="gap:10px">
      <div class="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm" style="background:linear-gradient(135deg,var(--gold),var(--gold-deep-btn));color:var(--ink)">
        ${escapeHtml(state.gardienName.slice(0, 1).toUpperCase())}
      </div>
      <div>
        <div class="font-display font-bold text-sm leading-tight flex items-center gap-1\\.5" style="color:var(--ink)">${escapeHtml(state.gardienName)}${currentTitleName() ? `<span class="font-body font-bold" style="font-size:9px;padding:2px 6px;border-radius:9999px;background:var(--sky);color:var(--ink-soft)">${escapeHtml(currentTitleName())}</span>` : ''}</div>
        <div class="font-body font-bold fs-11" style="color:var(--ink-soft)">
          ${t('topbar.level', { n: computeLevel(state.xp) })} · ${state.mode === 'eclosion' ? t('topbar.roleGardien') : t('onboarding.modeStratege')}${complete ? ` ${icon('star', { size: 11, color: 'var(--gold-deep)' })}` : ''}
        </div>
        <div class="rounded-full overflow-hidden mt-0\\.5" role="progressbar" aria-label="${t('topbar.progressAria')}" aria-valuenow="${xpIntoLevel(state.xp)}" aria-valuemin="0" aria-valuemax="60" style="width:84px;height:4px;background:#E6DFD3;margin-top:2px">
          <div class="h-full rounded-full" style="width:${Math.round((xpIntoLevel(state.xp) / 60) * 100)}%;background:var(--gold)"></div>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1\\.5 rounded-full px-3 py-1\\.5 font-display font-bold text-sm shadow-sm${coinGained ? ' coin-gain-pulse' : ''}" style="gap:6px;background:var(--parchment);color:var(--ink)">
        ${coinIconHtml()} ${state.ecailles}
      </div>
      <button data-action="open-settings" aria-label="${t('topbar.settingsAria')}" class="w-9 h-9 rounded-full flex items-center justify-center" style="background:var(--parchment)">
        ${icon('settings', { size: 17, color: 'var(--ink-soft)' })}
      </button>
    </div>
  </div>`;
}

// Compte les récompenses prêtes à réclamer par écran, pour les badges de nav
// (répond au constat d'audit : les objectifs repliés par défaut manquaient de visibilité).
function claimableRewardsByScreen() {
  const questsReady = state.dailyQuests ? state.dailyQuests.quests.filter(q => q.progress >= q.target && !q.claimed).length : 0;
  const weeklyReady = state.weeklyChallenge && state.weeklyChallenge.progress >= state.weeklyChallenge.target && !state.weeklyChallenge.claimed ? 1 : 0;
  const achievementsReady = ACHIEVEMENTS.filter(a => !state.achievementsClaimed.includes(a.id) && a.progress(state) >= a.target).length;
  return { sanctuaire: questsReady + weeklyReady, dragondex: achievementsReady };
}

function navBadgeHtml(count) {
  if (!count) return '';
  return `<span aria-hidden="true" class="font-display font-bold" style="position:absolute;top:-2px;right:2px;min-width:15px;height:15px;padding:0 3px;border-radius:9999px;background:#D9634A;color:#fff;font-size:9px;line-height:15px;text-align:center;border:2px solid var(--parchment)">${count > 9 ? '9+' : count}</span>`;
}

function renderNavBar() {
  const root = document.getElementById('navbar-root');
  const items = [
    { id: 'sanctuaire', label: t('nav.sanctuaire'), ic: 'home' },
    { id: 'dragondex', label: t('nav.dragondex'), ic: 'book-open' },
    { id: 'carte', label: t('nav.carte'), ic: 'map' },
    { id: 'boutique', label: t('nav.boutique'), ic: 'shopping-bag' },
  ];
  if (state.mode === 'stratege') items.push({ id: 'labo', label: t('nav.labo'), ic: 'flask' });
  const rewards = claimableRewardsByScreen();
  root.innerHTML = `
  <div class="flex justify-around items-center px-2 pt-2 safe-bottom" style="background:var(--parchment);border-top:1px solid #EEE6D8">
    ${items.map(it => {
      const active = ui.screen === it.id;
      return `<button data-action="nav" data-screen="${it.id}" aria-current="${active ? 'page' : 'false'}" class="flex flex-col items-center gap-1 font-display font-bold fs-10 px-2 relative" style="color:${active ? 'var(--gold-deep)' : 'var(--ink-soft)'}">
        <span style="position:relative;display:inline-flex">${icon(it.ic, { size: 21, strokeWidth: active ? 2.4 : 2 })}${navBadgeHtml(rewards[it.id])}</span>${it.label}
      </button>`;
    }).join('')}
  </div>`;
}

/* =========================================================================
   ÉCRAN — SANCTUAIRE
   ========================================================================= */

function dailyQuestsCardHtml() {
  if (!state.dailyQuests) return '';
  const rows = state.dailyQuests.quests.map(q => {
    const ready = q.progress >= q.target && !q.claimed;
    const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
    const rightSide = q.claimed
      ? `<span style="display:inline-flex">${icon('check', { size: 14, color: 'var(--ink-soft)' })}</span>`
      : ready
        ? `<button data-action="claim-quest" data-quest-id="${q.id}" class="font-display font-bold fs-10 rounded-xl flex items-center gap-1 shrink-0" style="padding:6px 10px;background:var(--gold);color:var(--ink)">${coinIconHtml()} +${q.reward}</button>`
        : `<span class="font-body font-bold fs-10 shrink-0" style="color:var(--ink-soft)">${q.progress}/${q.target}</span>`;
    return `<div class="flex items-center gap-2\\.5" style="gap:10px;padding:6px 0">
      <div class="flex-1">
        <div class="font-body font-bold fs-12" style="color:${q.claimed ? 'var(--ink-soft)' : 'var(--ink)'}">${escapeHtml(q.desc)}</div>
        <div class="w-full rounded-full overflow-hidden mt-1" role="progressbar" aria-valuenow="${q.progress}" aria-valuemin="0" aria-valuemax="${q.target}" aria-label="${escapeHtml(q.desc)}" style="background:#EEE6D8;height:5px;">
          <div class="h-full rounded-full" style="width:${pct}%;background:${q.claimed ? '#C9BFA9' : 'var(--gold)'}"></div>
        </div>
      </div>
      ${rightSide}
    </div>`;
  }).join('');
  const nextMilestone = nextStreakMilestone();
  return `<div class="rounded-2xl p-3\\.5 mb-3" style="padding:14px;background:var(--parchment)">
    <div class="flex items-center justify-between mb-1">
      <div class="font-display font-bold fs-13" style="color:var(--ink)">${t('objectives.dailyTitle')}</div>
      ${state.loginStreak > 1 ? `<span class="font-body font-bold fs-11 flex items-center gap-1 anim-pulse" style="color:var(--gold-deep)">${t('objectives.dayStreak', { n: state.loginStreak, s: state.loginStreak > 1 ? 's' : '' })}</span>` : ''}
    </div>
    ${state.loginStreak > 1 && nextMilestone ? `<div class="font-body fs-10 mb-1\\.5" style="color:var(--ink-soft)">${t('objectives.nextMilestone', { n: nextMilestone - state.loginStreak })}</div>` : ''}
    ${rows}
  </div>`;
}

function weeklyChallengeCardHtml() {
  const w = state.weeklyChallenge;
  if (!w) return '';
  const ready = w.progress >= w.target && !w.claimed;
  const pct = Math.min(100, Math.round((w.progress / w.target) * 100));
  const rightSide = w.claimed
    ? `<span style="display:inline-flex">${icon('check', { size: 14, color: 'var(--ink-soft)' })}</span>`
    : ready
      ? `<button data-action="claim-weekly-challenge" class="font-display font-bold fs-10 rounded-xl flex items-center gap-1 shrink-0" style="padding:6px 10px;background:var(--gold);color:var(--ink)">${coinIconHtml()} +${w.reward}</button>`
      : `<span class="font-body font-bold fs-10 shrink-0" style="color:var(--ink-soft)">${w.progress}/${w.target}</span>`;
  return `<div class="rounded-2xl p-3\\.5 mb-3 flex items-center gap-3" style="padding:14px;background:linear-gradient(135deg,#EDE7F6,#E3DAF0)">
    <span style="font-size:22px" aria-hidden="true">🗓️</span>
    <div class="flex-1">
      <div class="font-display font-bold fs-12" style="color:var(--ink)">${t('objectives.weeklyTitle')}</div>
      <div class="font-body font-bold fs-11 mb-1" style="color:${w.claimed ? 'var(--ink-soft)' : 'var(--ink)'}">${escapeHtml(w.desc)}</div>
      <div class="w-full rounded-full overflow-hidden" role="progressbar" aria-valuenow="${w.progress}" aria-valuemin="0" aria-valuemax="${w.target}" aria-label="${escapeHtml(w.desc)}" style="background:rgba(255,255,255,.6);height:5px;">
        <div class="h-full rounded-full" style="width:${pct}%;background:#8A6FBF"></div>
      </div>
    </div>
    ${rightSide}
  </div>`;
}

/* =========================================================================
   LUMIDRA — événements saisonniers
   ========================================================================= */

const EVENTS = [
  { id: 'printemps', nameFr: 'Éveil du Printemps', nameEn: 'Spring Awakening', emoji: '🌸', startMonth: 2, startDay: 7, endMonth: 6, endDay: 14, decorId: 'bouquet-cerisier', boostElement: 'nature', taglineFr: 'Décorations exclusives + dragons Nature plus chanceux !', taglineEn: 'Exclusive decorations + luckier Nature dragons!' },
  { id: 'ete', nameFr: "Festival d'Été", nameEn: 'Summer Festival', emoji: '☀️', startMonth: 6, startDay: 15, endMonth: 8, endDay: 31, decorId: 'voile-solaire', boostElement: 'feu', taglineFr: 'Décorations exclusives + dragons Feu plus chanceux !', taglineEn: 'Exclusive decorations + luckier Fire dragons!' },
  { id: 'automne', nameFr: "Récolte d'Automne", nameEn: 'Autumn Harvest', emoji: '🍂', startMonth: 9, startDay: 15, endMonth: 10, endDay: 31, decorId: 'citrouille-doree', boostElement: 'terre', taglineFr: 'Décorations exclusives + dragons Terre plus chanceux !', taglineEn: 'Exclusive decorations + luckier Earth dragons!' },
  { id: 'hiver', nameFr: "Veillée d'Hiver", nameEn: 'Winter Vigil', emoji: '❄️', startMonth: 12, startDay: 1, endMonth: 1, endDay: 6, decorId: 'guirlande-etoilee', boostElement: 'eau', taglineFr: 'Décorations exclusives + dragons Eau plus chanceux !', taglineEn: 'Exclusive decorations + luckier Water dragons!' },
];
function eventDisplay(ev) {
  return { name: state.language === 'en' ? ev.nameEn : ev.nameFr, tagline: state.language === 'en' ? ev.taglineEn : ev.taglineFr };
}

function getActiveEvent() {
  const now = new Date();
  const m = now.getMonth() + 1, d = now.getDate();
  const inRange = (ev) => {
    const after = (mm, dd) => mm > ev.startMonth || (mm === ev.startMonth && dd >= ev.startDay);
    const before = (mm, dd) => mm < ev.endMonth || (mm === ev.endMonth && dd <= ev.endDay);
    if (ev.startMonth <= ev.endMonth) return after(m, d) && before(m, d);
    return after(m, d) || before(m, d); // fenêtre à cheval sur le nouvel an
  };
  return EVENTS.find(inRange) || null;
}

function seasonalEventBannerHtml() {
  const ev = getActiveEvent();
  if (!ev) return '';
  const disp = eventDisplay(ev);
  return `<div class="rounded-2xl p-3\\.5 mb-3 flex items-center gap-3" style="padding:14px;background:linear-gradient(135deg,#FDEDD3,#FBDCC0)">
    <div style="font-size:26px" aria-hidden="true">${ev.emoji}</div>
    <div class="flex-1">
      <div class="font-display font-bold fs-12" style="color:var(--ink)">${escapeHtml(disp.name)}</div>
      <div class="font-body fs-11" style="color:var(--ink-soft)">${escapeHtml(disp.tagline)}</div>
    </div>
  </div>`;
}

function dragonHabitatCardHtml(dragon, busy) {
  const species = speciesById(dragon.speciesId);
  const happyDots = Math.min(4, 1 + Math.floor(dragon.careCount / 3));
  let dots = '';
  for (let i = 0; i < 4; i++) dots += `<span class="w-1\\.5 h-1\\.5 rounded-full" style="width:6px;height:6px;background:${i < happyDots ? 'var(--gold)' : '#E6DFD3'}"></span>`;
  const careStreak = dragon.careStreakDays || 0;
  return `<button data-action="open-dragon" data-dragon-id="${dragon.id}" class="rounded-2xl p-2\\.5 flex flex-col items-center relative shadow-sm ${dragonCardClass(dragon)}" style="padding:10px;background:var(--parchment);opacity:${busy ? 0.6 : 1}">
    ${busy ? `<span class="absolute font-display font-bold fs-8 px-1\\.5 py-0\\.5 rounded-full text-white" style="top:6px;right:6px;padding:2px 6px;background:var(--ink-soft)">${t('sanctuaire.busyExpedition')}</span>` : ''}
    ${dragon.favorite ? `<span class="absolute" style="top:6px;left:6px" aria-hidden="true">${icon('heart', { size: 13, color: '#D9634A' })}</span>` : ''}
    ${bondTier(dragon) === 3 ? `<span class="absolute" style="bottom:6px;left:6px;font-size:11px" aria-hidden="true">💞</span>` : ''}
    ${careStreak >= 3 && !busy ? `<span class="absolute font-body font-bold" style="bottom:6px;right:6px;font-size:9px;color:var(--gold-deep)" aria-hidden="true">🔥${careStreak}</span>` : ''}
    ${dragonSVG({ element: species.element, variant: species.variant, stage: dragon.stage, size: 68, hatId: dragon.hatId, collarId: dragon.collarId, charmId: dragon.charmId })}
    <div class="font-display font-bold text-xs mt-1" style="color:var(--ink)">${escapeHtml(dragonDisplayName(dragon, species))}</div>
    <div class="flex gap-1 mt-1">${dots}</div>
  </button>`;
}

function sortedDragonsForDisplay() {
  let list = state.dragons.slice();
  const search = (ui.sanctuaireSearch || '').trim();
  if (search) {
    const q = normalizeSearch(search);
    list = list.filter(d => normalizeSearch(dragonDisplayName(d, speciesById(d.speciesId))).includes(q));
  }
  const sort = ui.sanctuaireSort || 'recent';
  if (sort === 'favoris') {
    list.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) || b.bornAt - a.bornAt);
  } else if (sort === 'alpha') {
    list.sort((a, b) => dragonDisplayName(a, speciesById(a.speciesId)).localeCompare(dragonDisplayName(b, speciesById(b.speciesId)), 'fr'));
  } else if (sort === 'rarete') {
    list.sort((a, b) => speciesById(b.speciesId).variant - speciesById(a.speciesId).variant || b.bornAt - a.bornAt);
  } else {
    list.sort((a, b) => b.bornAt - a.bornAt);
  }
  return list;
}

function sanctuaireSortChipsHtml() {
  const options = [
    { id: 'recent', label: t('sanctuaire.sortRecent') },
    { id: 'favoris', label: t('sanctuaire.sortFavorites') },
    { id: 'alpha', label: t('sanctuaire.sortAlpha') },
    { id: 'rarete', label: t('sanctuaire.sortRarity') },
  ];
  const cur = ui.sanctuaireSort || 'recent';
  return `<div class="flex gap-1\\.5 mb-2\\.5 overflow-x-auto" style="gap:6px;margin-bottom:10px">${options.map(o => `
    <button data-action="set-sanctuaire-sort" data-sort="${o.id}" aria-pressed="${cur === o.id}" class="shrink-0 font-body font-bold fs-11 rounded-full" style="padding:5px 12px;background:${cur === o.id ? 'var(--gold)' : 'rgba(255,255,255,.6)'};color:var(--ink)">${o.label}</button>`).join('')}</div>`;
}

function guardianPathNextTier() {
  return PASS_TIERS.find(pt => !state.passClaimedTiers.includes(pt.tier)) || null;
}

function guardianPathBannerHtml() {
  const readyToClaim = passTiersUnlockedCount() - state.passClaimedTiers.length;
  const nextTier = guardianPathNextTier();
  if (!nextTier) {
    return `<button data-action="open-guardian-path" class="w-full flex items-center gap-3 rounded-2xl px-4 py-3 mb-3 text-left" style="padding:12px 16px;background:linear-gradient(135deg,#FFF3DC,#FCE3B8)">
      <div style="font-size:26px" aria-hidden="true">🏵️</div>
      <div class="flex-1">
        <div class="font-display font-bold fs-12" style="color:var(--gold-deep)">${t('pass.bannerTitle')}</div>
        <div class="font-body font-semibold fs-11" style="color:var(--ink-soft)">${t('pass.bannerProgress', { n: PASS_TIERS.length, total: PASS_TIERS.length })}</div>
      </div>
    </button>`;
  }
  const prevThreshold = nextTier.tier > 1 ? PASS_TIERS[nextTier.tier - 2].threshold : 0;
  const pct = Math.max(0, Math.min(100, ((state.passPoints - prevThreshold) / (nextTier.threshold - prevThreshold)) * 100));
  return `<button data-action="open-guardian-path" class="w-full rounded-2xl mb-3 text-left" style="padding:12px 16px;background:var(--parchment)">
    <div class="flex items-center gap-2 mb-1\\.5" style="margin-bottom:6px">
      <span style="font-size:18px" aria-hidden="true">🏵️</span>
      <span class="flex-1 font-display font-bold fs-12" style="color:var(--ink)">${t('pass.bannerTitle')}</span>
      ${readyToClaim > 0 ? `<span class="font-display font-bold fs-10 rounded-full" style="padding:3px 8px;background:var(--gold);color:var(--ink)">${t('objectives.toClaim', { n: readyToClaim })}</span>` : `<span class="font-body font-bold fs-10" style="color:var(--ink-soft)">${t('pass.bannerProgress', { n: nextTier.tier - 1, total: PASS_TIERS.length })}</span>`}
    </div>
    <div class="w-full h-2 rounded-full overflow-hidden" style="background:#EEE6D8">
      <div class="h-full rounded-full" style="width:${pct}%;background:var(--gold)"></div>
    </div>
  </button>`;
}

function objectivesSummaryHtml() {
  const questsReady = state.dailyQuests ? state.dailyQuests.quests.filter(q => q.progress >= q.target && !q.claimed).length : 0;
  const weeklyReady = state.weeklyChallenge && state.weeklyChallenge.progress >= state.weeklyChallenge.target && !state.weeklyChallenge.claimed ? 1 : 0;
  const passReady = passTiersUnlockedCount() - state.passClaimedTiers.length;
  const readyCount = questsReady + weeklyReady + passReady;
  const activeEvent = getActiveEvent();

  if (ui.objectivesBannerCollapsed) {
    const bits = [];
    const dailyUnclaimed = state.dailyQuests ? state.dailyQuests.quests.filter(q => !q.claimed).length : 0;
    if (dailyUnclaimed) bits.push(t('objectives.dailyCount', { n: dailyUnclaimed, s: dailyUnclaimed > 1 ? 's' : '' }));
    if (state.weeklyChallenge && !state.weeklyChallenge.claimed) bits.push(t('objectives.weeklyCount'));
    if (passReady > 0) bits.push(t('pass.bannerTitle'));
    const summary = bits.length ? bits.join(' · ') : t('objectives.allDone');
    return `<button data-action="toggle-objectives-banner" aria-expanded="false" class="w-full flex items-center gap-2\\.5 rounded-2xl mb-3" style="gap:10px;padding:10px 14px;background:var(--parchment)">
      <span style="font-size:18px" aria-hidden="true">${activeEvent ? activeEvent.emoji : '🎯'}</span>
      <span class="flex-1 text-left font-body font-bold fs-12" style="color:var(--ink)">${summary}</span>
      ${readyCount > 0 ? `<span class="font-display font-bold fs-10 rounded-full" style="padding:3px 8px;background:var(--gold);color:var(--ink)">${t('objectives.toClaim', { n: readyCount })}</span>` : ''}
      ${icon('chevron-down', { size: 14, color: 'var(--ink-soft)' })}
    </button>`;
  }

  return `<div class="mb-1">
    <button data-action="toggle-objectives-banner" aria-expanded="true" class="w-full flex items-center gap-2 mb-2" style="color:var(--gold-deep)">
      <span class="font-display font-bold fs-12 flex-1 text-left">${t('objectives.title')}</span>
      <span style="display:inline-flex;transform:rotate(180deg)">${icon('chevron-down', { size: 14, color: 'var(--ink-soft)' })}</span>
    </button>
    ${dailyQuestsCardHtml()}
    ${weeklyChallengeCardHtml()}
    ${guardianPathBannerHtml()}
    ${seasonalEventBannerHtml()}
  </div>`;
}

// Étagère de décorations : les pièces équipées (jusqu'à 3) sont posées visuellement dans la
// scène du sanctuaire : 3 emplacements fixes et nommés (state.decorEquipped, toujours de
// longueur 3, valeurs nullable) — on choisit précisément ce qui va où, plutôt qu'un simple
// ordre d'équipement. Toucher un emplacement ouvre un petit sélecteur ; aucun chevauchement
// avec les cartes de dragons (donc rien ne bloque un tap).
function decorShelfHtml(slots) {
  const items = slots.map((id, i) => {
    const d = id ? DECOR.find(x => x.id === id) : null;
    const lift = [0, -4, 2][i % 3];
    if (!d) {
      return `<button data-action="open-decor-slot-picker" data-slot-index="${i}" class="flex flex-col items-center justify-center rounded-xl" style="width:40px;height:40px;border:2px dashed rgba(255,255,255,.9)">
        <span class="font-body font-bold" style="font-size:16px;color:rgba(255,255,255,.9)">+</span>
      </button>`;
    }
    return `<button data-action="open-decor-slot-picker" data-slot-index="${i}" class="flex flex-col items-center" style="transform:translateY(${lift}px)">${decorIconSVG(d.id, 40)}</button>`;
  }).join('');
  return `<div class="rounded-2xl mb-2\\.5" style="margin-bottom:10px;padding:8px 14px 0;background:rgba(255,255,255,.32)">
    <div class="flex items-end justify-center gap-5" style="padding-bottom:2px">${items}</div>
    <div style="height:4px;border-radius:2px;background:rgba(255,255,255,.75)"></div>
  </div>`;
}

function renderScreenSanctuaire() {
  const busy = busyDragonIds();
  normalizeDecorSlots();
  let html = `<div class="flex-1 overflow-y-auto px-4 pb-4">`;

  html += objectivesSummaryHtml();

  if (state.eggInbox.length > 0) {
    html += `<button data-action="start-hatch-from-inbox" class="w-full flex items-center gap-3 rounded-2xl px-4 py-3 mb-3 text-left" style="background:linear-gradient(135deg,#FFF3DC,#FCE3B8)">
      <div class="text-3xl" style="font-size:30px">🥚</div>
      <div class="flex-1">
        <div class="font-display font-bold text-sm" style="color:var(--gold-deep)">${t('sanctuaire.eggsReady', { n: state.eggInbox.length, s: state.eggInbox.length > 1 ? 's' : '' })}</div>
        <div class="font-body font-semibold fs-11" style="color:var(--ink-soft)">${t('sanctuaire.fromExpedition')}</div>
      </div>
      <div class="font-display font-bold text-xs px-3 py-2 rounded-xl" style="background:var(--gold);color:var(--ink)">${t('sanctuaire.open')}</div>
    </button>`;
  }

  html += `<div class="rounded-3xl p-4" style="background:linear-gradient(180deg,#E7F0FA,#DCEBF6)">
    <div class="flex items-center justify-between mb-2\\.5" style="margin-bottom:10px">
      <h3 class="font-display font-semibold fs-13" style="color:var(--ink-soft)">${t('sanctuaire.title')}</h3>
      <button data-action="open-boutique-collection" class="font-body font-bold fs-10" style="color:var(--gold-deep)">${t('sanctuaire.decorateLink')}</button>
    </div>
    ${decorShelfHtml(state.decorEquipped)}`;

  if (state.dragons.length === 0) {
    html += emptyNoteHtml(t('sanctuaire.empty'));
  } else {
    if (state.dragons.length > 1) {
      html += `<button data-action="care-all-dragons" class="w-full flex items-center justify-center gap-2 font-display font-bold fs-13 rounded-xl mb-2\\.5" style="padding:11px;margin-bottom:10px;background:linear-gradient(135deg,#FFD3C4,#FFAF9A);color:#8A3B22;box-shadow:0 3px 10px rgba(217,99,74,0.28)">${icon('heart', { size: 17, color: '#D9634A' })} ${t('sanctuaire.careAll')}</button>`;
    }
    if (state.dragons.length > 5) {
      html += `<input id="sanctuaire-search-input" data-bind="sanctuaire-search" value="${escapeHtml(ui.sanctuaireSearch || '')}" placeholder="${t('sanctuaire.searchPlaceholder')}" aria-label="${t('sanctuaire.searchAria')}"
        class="w-full font-body font-semibold fs-12 rounded-xl px-3 py-2\\.5 mb-2\\.5" style="padding:10px 12px;margin-bottom:10px;background:rgba(255,255,255,.6);color:var(--ink)"/>`;
    }
    html += sanctuaireSortChipsHtml();
    html += sortedDragonsForDisplay().length === 0
      ? emptyNoteHtml(t('sanctuaire.noSearchResults'))
      : `<div class="grid grid-cols-2 gap-3">${sortedDragonsForDisplay().map(d => dragonHabitatCardHtml(d, !!busy[d.id])).join('')}</div>`;
  }
  html += `</div>`;

  html += `<div class="rounded-2xl mt-3 p-3\\.5 flex items-center gap-3" style="margin-top:12px;padding:14px;background:#F1ECE2">
    <span class="flex items-center justify-center shrink-0 rounded-full" style="width:38px;height:38px;background:rgba(201,122,31,.14)">${icon('sparkles', { size: 18, color: 'var(--gold-deep)' })}</span>
    <div class="flex-1">
      <div class="font-display font-bold fs-11" style="color:var(--ink)">${t('tip.title')}</div>
      <div class="font-body font-semibold fs-11" style="color:var(--ink-soft)">${t('tip.' + dailyTipIndex())}</div>
    </div>
  </div>`;

  html += `</div>`;

  document.getElementById('screen-root').innerHTML = html;
}

/* =========================================================================
   ÉCRAN — DRAGONDEX
   ========================================================================= */

function achievementsCardHtml() {
  const unclaimedReady = ACHIEVEMENTS.filter(a => !state.achievementsClaimed.includes(a.id) && a.progress(state) >= a.target).length;
  if (state.achievementsBannerCollapsed) {
    return `<button data-action="toggle-achievements-banner" aria-expanded="false" class="mb-3 rounded-2xl w-full flex items-center gap-2" style="padding:8px 12px;background:#F1ECE2">
      <span style="display:inline-flex">${icon('sparkles', { size: 16, color: 'var(--gold-deep)' })}</span>
      <span class="flex-1 text-left font-display font-bold fs-11" style="color:var(--ink)">${unclaimedReady ? t('achievements.titleWithClaim', { n: unclaimedReady }) : t('achievements.title')}</span>
      <span style="display:inline-flex">${icon('chevron-down', { size: 14, color: 'var(--ink-soft)' })}</span>
    </button>`;
  }
  const rows = ACHIEVEMENTS.map(a => {
    const claimed = state.achievementsClaimed.includes(a.id);
    const prog = a.progress(state);
    const ready = !claimed && prog >= a.target;
    const pct = Math.min(100, Math.round((prog / a.target) * 100));
    return `<div style="padding:9px 0;border-bottom:1px solid #EEE6D8">
      <div class="flex items-center gap-2\\.5" style="gap:10px">
        <span class="flex items-center justify-center shrink-0" style="width:30px;height:30px;border-radius:10px;background:${claimed ? '#E6DFD1' : 'rgba(201,122,31,.12)'}">${icon(achievementIcon(a.id), { size: 15, color: claimed ? 'var(--ink-soft)' : 'var(--gold-deep)' })}</span>
        <div class="flex-1">
          <div class="font-body font-bold fs-12" style="color:${claimed ? 'var(--ink-soft)' : 'var(--ink)'}">${escapeHtml(a.name)}</div>
          <div class="font-body fs-10" style="color:var(--ink-soft)">${escapeHtml(a.desc)}</div>
        </div>
        ${claimed
          ? `<span style="display:inline-flex">${icon('check', { size: 14, color: 'var(--ink-soft)' })}</span>`
          : ready
            ? `<button data-action="claim-achievement" data-achievement-id="${a.id}" class="font-display font-bold fs-10 rounded-xl flex items-center gap-1 shrink-0" style="padding:6px 10px;background:var(--gold);color:var(--ink)">${coinIconHtml()} +${a.reward}</button>`
            : `<span class="font-body font-bold fs-10 shrink-0" style="color:var(--ink-soft)">${prog}/${a.target}</span>`
        }
      </div>
      ${claimed ? '' : `<div class="rounded-full" style="height:5px;margin-top:7px;margin-left:40px;background:#EEE6D8;overflow:hidden"><div style="height:100%;width:${pct}%;background:${ready ? 'var(--gold)' : 'var(--gold-deep)'};border-radius:9999px"></div></div>`}
    </div>`;
  }).join('');
  return `<div class="mb-3 rounded-2xl p-3\\.5" style="padding:14px;background:#F1ECE2">
    <button data-action="toggle-achievements-banner" aria-expanded="true" class="w-full flex items-center gap-2 mb-1" style="margin-bottom:4px;">
      <span style="display:inline-flex">${icon('sparkles', { size: 16, color: 'var(--gold-deep)' })}</span>
      <span class="flex-1 text-left font-display font-bold fs-12" style="color:var(--ink)">${unclaimedReady ? t('achievements.titleWithClaim', { n: unclaimedReady }) : t('achievements.title')}</span>
      <span style="display:inline-flex;transform:rotate(180deg)">${icon('chevron-down', { size: 14, color: 'var(--ink-soft)' })}</span>
    </button>
    ${rows}
  </div>`;
}

function normalizeSearch(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function renderScreenDragondex() {
  const filter = ui.dragondexFilter;
  const rarityFilter = ui.dragondexRarityFilter || 'tous';
  let filtered = filter === 'tous' ? SPECIES : SPECIES.filter(s => s.element === filter);
  if (rarityFilter !== 'tous') filtered = filtered.filter(s => s.variant === Number(rarityFilter));
  const search = (ui.dragondexSearch || '').trim();
  if (search) {
    const q = normalizeSearch(search);
    filtered = filtered.filter(s => state.discovered.includes(s.id) && normalizeSearch(s.name).includes(q));
  }

  let chips = `<button data-action="dragondex-filter" data-element="tous" class="font-display font-bold fs-11 px-2\\.5 py-1\\.5 rounded-full whitespace-nowrap shrink-0" style="padding:6px 10px;background:var(--parchment);color:${filter === 'tous' ? 'var(--ink)' : 'var(--ink-soft)'};border:2px solid ${filter === 'tous' ? 'var(--gold-deep-btn)' : 'transparent'}">${t('dragondex.filterAll')}</button>`;
  Object.entries(ELEMENTS).forEach(([key, el]) => {
    const active = filter === key;
    chips += `<button data-action="dragondex-filter" data-element="${key}" class="flex items-center gap-1 font-display font-bold fs-11 px-2\\.5 py-1\\.5 rounded-full whitespace-nowrap shrink-0" style="padding:6px 10px;background:var(--parchment);color:${active ? 'var(--ink)' : 'var(--ink-soft)'};border:2px solid ${active ? el.deep : 'transparent'}">${icon(el.icon, { size: 12, color: active ? el.deep : 'currentColor' })} ${el.name}</button>`;
  });

  const rarityOptions = [{ v: 'tous', label: t('dragondex.rarityAll') }, { v: '0', label: t('dragondex.rarityCommon') }, { v: '2', label: t('dragondex.rarityRare') }, { v: '3', label: t('dragondex.rarityEpic') }, { v: '4', label: t('dragondex.rarityLegendary') }, { v: '5', label: t('dragondex.rarityMythic') }];
  let rarityChips = rarityOptions.map(o => {
    const active = rarityFilter === o.v;
    return `<button data-action="dragondex-rarity-filter" data-rarity="${o.v}" class="font-display font-bold fs-11 px-2\\.5 py-1\\.5 rounded-full whitespace-nowrap shrink-0" style="padding:6px 10px;background:${active ? 'var(--gold)' : 'var(--parchment)'};color:var(--ink)">${o.label}</button>`;
  }).join('');

  let cards = filtered.map(s => {
    const discovered = state.discovered.includes(s.id);
    return `<button data-action="open-species" data-species-id="${s.id}" class="rounded-2xl p-2 flex flex-col items-center ${discovered ? rarityCardClass(s.variant) : ''}" style="background:var(--parchment)">
      <div style="filter:${discovered ? 'none' : 'grayscale(1) brightness(0.4)'};opacity:${discovered ? 1 : 0.55}">
        ${dragonSVG({ element: s.element, variant: s.variant, stage: 'adulte', size: 58 })}
      </div>
      <div class="font-display font-bold fs-10 mt-1 text-center" style="color:${discovered ? 'var(--ink)' : 'var(--ink-soft)'}">${discovered ? escapeHtml(s.name) : '???'}</div>
      ${!discovered ? icon('lock', { size: 10, color: 'var(--ink-soft)' }) : ''}
    </button>`;
  }).join('');

  let completeBanner = '';
  if (state.discovered.length === SPECIES.length) {
    if (state.collectionBannerCollapsed) {
      completeBanner = `<button data-action="toggle-collection-banner" aria-expanded="false" class="mb-3 rounded-2xl w-full flex items-center gap-2" style="padding:8px 12px;background:linear-gradient(135deg,#FFF3DC,#FCE3B8)">
        <span style="font-size:18px;line-height:1;">🏆</span>
        <span class="flex-1 text-left font-display font-bold fs-11" style="color:var(--gold-deep)">${t('dragondex.collectionComplete')}</span>
        <span style="display:inline-flex">${icon('chevron-down', { size: 14, color: 'var(--gold-deep)' })}</span>
      </button>`;
    } else {
      completeBanner = `<div class="mb-3 rounded-2xl p-3\\.5 flex items-center gap-3 trophy-banner" style="padding:14px;background:linear-gradient(135deg,#FFF3DC,#FCE3B8)">
        <div style="font-size:26px;line-height:1;">🏆</div>
        <div class="flex-1">
          <div class="font-display font-bold text-sm" style="color:var(--gold-deep)">${t('dragondex.masterGuardian')}</div>
          <div class="font-body font-semibold fs-11" style="color:var(--ink-soft)">${t('dragondex.collectionCompleteDesc', { n: SPECIES.length })}</div>
        </div>
        <button data-action="toggle-collection-banner" aria-expanded="true" aria-label="${t('dragondex.collapseBannerAria')}" class="shrink-0 rounded-full flex items-center justify-center" style="width:28px;height:28px;background:rgba(255,255,255,.55)">
          <span style="display:inline-flex;transform:rotate(180deg)">${icon('chevron-down', { size: 14, color: 'var(--gold-deep)' })}</span>
        </button>
      </div>`;
    }
  }

  let legendaryBanner = `<div class="mt-4 rounded-2xl p-3\\.5 flex items-center gap-3" style="padding:14px;background:#F1ECE2">
    ${icon('sparkles', { size: 20, color: 'var(--gold-deep)' })}
    <div class="font-body font-semibold fs-11" style="color:var(--ink-soft)">${t('dragondex.legendaryBannerText')}</div>
  </div>`;

  document.getElementById('screen-root').innerHTML = `
  <div class="flex-1 overflow-y-auto px-4 pb-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-display font-bold text-sm" style="color:var(--ink)">${t('nav.dragondex')}</h3>
      <span class="font-body font-bold text-xs" style="color:var(--ink-soft)">${t('dragondex.discoveredCount', { n: state.discovered.length, total: SPECIES.length })}</span>
    </div>
    ${completeBanner}
    ${achievementsCardHtml()}
    <div class="relative mb-3">
      <input id="dragondex-search-input" data-bind="dragondex-search" value="${escapeHtml(ui.dragondexSearch || '')}" placeholder="${t('dragondex.searchPlaceholder')}" aria-label="${t('dragondex.searchAria')}"
        class="w-full font-body font-semibold fs-12 rounded-xl px-3 py-2\.5" style="padding:10px 12px;background:var(--parchment);color:var(--ink)"/>
    </div>
    <div class="flex gap-2 mb-2 overflow-x-auto pb-1">${chips}</div>
    <div class="flex gap-2 mb-3 overflow-x-auto pb-1">${rarityChips}</div>
    ${filtered.length === 0 ? emptyNoteHtml(t('dragondex.noResults')) : `<div class="grid grid-cols-3 gap-2\\.5" style="gap:10px">${cards}</div>`}
    ${legendaryBanner}
  </div>`;
}

/* =========================================================================
   ÉCRAN — CARTE / EXPÉDITIONS
   ========================================================================= */

const ZONE_MOTIF = { plaine: 'flame', golfe: 'droplet', foret: 'leaf', archipel: 'wind', cime: 'sun', voile: 'sparkles' };

function zoneThemeElement(zone) {
  const overrides = { cime: 'lumiere', voile: 'air' };
  return ELEMENTS[overrides[zone.id] || zone.elements[0]];
}

function zonesPathMapHtml() {
  const level = computeLevel(state.xp);
  const n = ZONES.length;
  const xs = [76, 244, 76, 244, 160, 160]; // alternance gauche/droite façon "parcours"
  const ySpacing = 132;
  const yStart = 56;
  const points = ZONES.map((z, i) => ({ zone: z, x: xs[i % xs.length], y: yStart + i * ySpacing, unlocked: level >= z.unlockLevel, theme: zoneThemeElement(z) }));
  const firstLockedIndex = points.findIndex(p => !p.unlocked);
  const totalHeight = yStart + (n - 1) * ySpacing + 70;

  let pathD = '';
  points.forEach((p, i) => {
    if (i === 0) { pathD += `M ${p.x},${p.y}`; }
    else {
      const prev = points[i - 1];
      const midY = (prev.y + p.y) / 2;
      pathD += ` C ${prev.x},${midY} ${p.x},${midY} ${p.x},${p.y}`;
    }
  });

  // Bande d'ambiance : la couleur de fond glisse doucement d'un élément de zone au suivant en
  // descendant le parcours, façon traversée de biomes (plaine chaude -> golfe embrumé -> ...).
  const bgStops = points.map(p => `${p.theme.light}59 ${((p.y / totalHeight) * 100).toFixed(1)}%`).join(', ');

  // Petites touches de brume/texture entre les nœuds pour éviter un tracé trop nu — positions
  // déterministes (dérivées de l'index) pour rester stables d'un rendu à l'autre.
  const mistHtml = points.slice(0, -1).map((p, i) => {
    const next = points[i + 1];
    const mx = (p.x + next.x) / 2 + (i % 2 === 0 ? -34 : 34);
    const my = (p.y + next.y) / 2;
    return `<div style="position:absolute;left:${(mx / 320) * 100}%;top:${my}px;width:30px;height:30px;border-radius:9999px;background:${p.theme.light};opacity:0.3;filter:blur(3px);transform:translate(-50%,-50%)" aria-hidden="true"></div>`;
  }).join('');

  const nodesHtml = points.map((p, i) => {
    const { zone, unlocked, theme } = p;
    const isNext = i === (firstLockedIndex === -1 ? -1 : firstLockedIndex);
    const activeEvent = getActiveEvent();
    const boosted = unlocked && activeEvent && zone.elements.includes(activeEvent.boostElement);
    const chips = zone.elements.map(el => {
      const c = ELEMENTS[el];
      return icon(c.icon, { size: 13, color: unlocked ? c.deep : '#B7AF9E' });
    }).join('');
    return `<div style="position:absolute;left:${(p.x / 320) * 100}%;top:${p.y}px;transform:translate(-50%,-50%);width:96px;text-align:center;">
      <div style="position:absolute;left:50%;top:50%;width:100px;height:100px;transform:translate(-50%,-50%);border-radius:9999px;background:${unlocked ? theme.base : '#C9C0AE'};opacity:0.28;filter:blur(6px)" aria-hidden="true"></div>
      <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0.24;pointer-events:none" aria-hidden="true">${icon(ZONE_MOTIF[zone.id] || 'star', { size: 150, color: theme.deep })}</div>
      ${isNext ? `<div class="anim-float" style="position:absolute;left:50%;top:-34px;transform:translateX(-50%);white-space:nowrap" aria-hidden="true">
        <span class="font-display font-bold" style="display:inline-block;font-size:9px;padding:3px 9px;border-radius:9999px;background:var(--gold-deep);color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.18)">${t('carte.nextStop')}</span>
      </div>` : ''}
      ${boosted ? `<div style="position:absolute;left:calc(50% + 22px);top:-8px;font-size:15px" aria-hidden="true" title="${t('carte.eventBoostHint')}">${activeEvent.emoji}</div>` : ''}
      <button data-action="carte-open-zone" data-zone-id="${zone.id}" data-locked="${unlocked ? '0' : '1'}" aria-label="${escapeHtml(zone.name)}${unlocked ? '' : t('dragondex.lockedSuffix')}"
        class="rounded-full flex items-center justify-center relative ${unlocked ? 'dragon-anim-idle' : ''}"
        style="width:72px;height:72px;margin:0 auto;background:${unlocked ? 'linear-gradient(135deg,var(--gold),var(--gold-deep-btn))' : '#D8CFC0'};box-shadow:0 4px 0 ${unlocked ? 'var(--gold-deep)' : '#B7AF9E'};border:3px solid #fff;animation-delay:${(i * 0.35).toFixed(2)}s">
        ${unlocked ? `<span style="display:flex;gap:1px">${chips}</span>` : icon('lock', { size: 18, color: '#8C8371' })}
      </button>
      <div class="font-display font-bold" style="font-size:10px;margin-top:6px;color:${unlocked ? 'var(--ink)' : 'var(--ink-soft)'};line-height:1.2">${escapeHtml(zone.name)}</div>
      ${!unlocked ? `<div class="font-body font-bold" style="font-size:9px;color:var(--ink-soft)">${t('carte.zoneLevel', { n: zone.unlockLevel })}</div>` : ''}
    </div>`;
  }).join('');

  const gradientStops = points.map((p, i) => `<stop offset="${(i / (n - 1) * 100).toFixed(0)}%" stop-color="${p.theme.base}"/>`).join('');

  return `<div style="position:relative;width:100%;height:${totalHeight}px;border-radius:20px;overflow:hidden;background:linear-gradient(180deg, ${bgStops})">
    <div class="carte-cloud" style="top:8%;left:-10%;width:120px;height:40px;animation-duration:38s" aria-hidden="true"></div>
    <div class="carte-cloud" style="top:38%;left:-16%;width:90px;height:30px;animation-duration:52s;animation-delay:-14s" aria-hidden="true"></div>
    <div class="carte-cloud" style="top:68%;left:-12%;width:100px;height:34px;animation-duration:44s;animation-delay:-28s" aria-hidden="true"></div>
    ${mistHtml}
    <svg viewBox="0 0 320 ${totalHeight}" style="position:absolute;top:0;left:0;width:100%;height:100%" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="carte-trail-grad" x1="0" y1="0" x2="0" y2="1">${gradientStops}</linearGradient></defs>
      <path d="${pathD}" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="8" stroke-linecap="round" stroke-dasharray="3 15"/>
      <path d="${pathD}" fill="none" stroke="url(#carte-trail-grad)" stroke-width="7" stroke-linecap="round" stroke-dasharray="3 15" opacity="0.9"
        style="clip-path:inset(0 0 ${Math.max(0, 100 - ((firstLockedIndex === -1 ? n - 1 : firstLockedIndex) / (n - 1)) * 100)}% 0)"/>
      <path d="${pathD}" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 34" class="carte-trail-shimmer"
        style="clip-path:inset(0 0 ${Math.max(0, 100 - ((firstLockedIndex === -1 ? n - 1 : firstLockedIndex) / (n - 1)) * 100)}% 0)"/>
    </svg>
    ${nodesHtml}
  </div>`;
}

const TYPE_ICON = { reco: 'clock', collecte: 'shopping-bag', explo: 'map', majeure: 'shield', 'quete-legendaire': 'star', 'quete-mythique': 'sparkles', 'quete-eternelle': 'mountain' };

function typesPathHtml(types, zone) {
  const stepColors = ['#8FBF7F', '#E0AA3E', '#E8734A', '#B5502C', '#8A6FBF'];
  const theme = zone ? zoneThemeElement(zone) : null;
  return `<div class="flex flex-col">${types.map((et, i) => {
    const color = stepColors[i % stepColors.length];
    const isLast = i === types.length - 1;
    return `<div style="display:flex;gap:10px;align-items:stretch">
      <div style="display:flex;flex-direction:column;align-items:center;width:30px;flex-shrink:0">
        <div class="font-display font-bold shrink-0" style="width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:${color};color:#fff;font-size:12px">${i + 1}</div>
        ${!isLast ? `<div style="flex:1;width:3px;min-height:18px;background:#E6DFD3;margin:2px 0"></div>` : ''}
      </div>
      <button data-action="carte-choose-type" data-type-id="${et.id}" class="rounded-2xl p-3\\.5 flex items-center gap-3 text-left flex-1" style="padding:14px;margin-bottom:14px;background:var(--parchment)">
        <span class="flex items-center justify-center shrink-0 rounded-full" style="width:36px;height:36px;background:${theme ? theme.light + '66' : '#F1ECE2'}">${icon(TYPE_ICON[et.id] || 'map', { size: 17, color: theme ? theme.deep : 'var(--gold-deep)' })}</span>
        <div class="flex-1">
          <div class="font-display font-bold fs-13" style="color:var(--ink)">${et.name}</div>
          <div class="font-body font-semibold fs-11" style="color:var(--ink-soft)">~${fmtCountdown(et.seconds * 1000)} · ${et.ecaillesMin}-${et.ecaillesMax} ${t('carte.scalesUnit')}${et.team ? t('carte.teamSuffix') : ''}</div>
          ${et.tagline ? `<div class="font-body fs-10 mt-1" style="color:var(--gold-deep)">${escapeHtml(et.tagline)}</div>` : ''}
        </div>
        ${icon('chevron-right', { size: 16, color: 'var(--ink-soft)' })}
      </button>
    </div>`;
  }).join('')}</div>`;
}

function activeExpeditionCardHtml(exp) {
  const zone = ZONES.find(z => z.id === exp.zoneId);
  const remaining = exp.endAt - now;
  const ready = remaining <= 0;
  const speedCost = ready ? 0 : speedUpCost(remaining);
  const team = exp.dragonIds.map(id => state.dragons.find(d => d.id === id)).filter(Boolean);

  let progressHtml = '';
  if (!ready) {
    const total = exp.endAt - exp.startAt;
    const elapsed = Math.min(total, Math.max(0, now - exp.startAt));
    const pct = total > 0 ? (elapsed / total) * 100 : 100;
    const teamBonus = computeTeamBonus(exp.dragonIds, zone);
    const activeEvent = getActiveEvent();
    const eventBoost = !!(activeEvent && zone.elements.includes(activeEvent.boostElement));
    const type = EXPEDITION_TYPES.find(t => t.id === exp.typeId);
    const eggChancePct = Math.round(Math.min(0.97, type.eggChance + teamBonus.eggChanceBonus + (eventBoost ? 0.05 : 0)) * 100);
    const walkers = team.slice(0, 3);
    const offsets = [0, -6, -11]; // les suivants traînent légèrement derrière le meneur
    const walkersHtml = walkers.map((d, i) => {
      const s = speciesById(d.speciesId);
      const wPct = Math.max(0, pct + offsets[i]);
      const size = i === 0 ? 26 : 20;
      return `<div class="dragon-anim-idle" style="position:absolute;top:50%;left:${wPct.toFixed(1)}%;transform:translate(-50%,-50%);transition:left 1s linear;z-index:${walkers.length - i};opacity:${i === 0 ? 1 : 0.85};filter:drop-shadow(0 1px 2px rgba(0,0,0,.25));animation-delay:${(i * 0.25).toFixed(2)}s">
        ${dragonSVG({ element: s.element, variant: s.variant, stage: d.stage, size })}
      </div>`;
    }).join('');
    progressHtml = `<div style="margin-top:10px">
      <div style="position:relative;height:22px;background:#EEE6D8;border-radius:9999px;overflow:visible">
        <div style="position:absolute;top:0;left:0;height:100%;width:${pct.toFixed(1)}%;background:linear-gradient(90deg,${zoneThemeElement(zone).light},${zoneThemeElement(zone).base});border-radius:9999px;transition:width 1s linear"></div>
        ${walkersHtml || `<div class="dragon-anim-idle" style="position:absolute;top:50%;left:${pct.toFixed(1)}%;transform:translate(-50%,-50%);transition:left 1s linear;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25))">🐾</div>`}
      </div>
      <div class="flex items-center gap-1 mt-1\\.5" style="margin-top:6px;color:var(--ink-soft)">
        ${icon('sparkles', { size: 11, color: 'var(--gold-deep)' })}
        <span class="font-body font-bold fs-10">${t('carte.eggChanceHint', { n: eggChancePct })}</span>
      </div>
    </div>`;
  }

  return `<div class="rounded-2xl p-3" style="background:${ready ? 'linear-gradient(135deg,#FFF3DC,#FCE3B8)' : 'var(--parchment)'}">
    <div class="flex items-center gap-3">
      <div class="flex-1">
        <div class="font-display font-bold text-xs" style="color:var(--ink)">${escapeHtml(zone.name)}</div>
        <div class="font-body font-bold fs-11" style="color:${ready ? 'var(--gold-deep)' : 'var(--ink-soft)'}">${ready ? t('carte.expeditionDone') : t('carte.returnIn', { time: fmtCountdown(remaining) })}</div>
      </div>
      ${ready
        ? `<button data-action="carte-claim" data-exp-id="${exp.id}" class="font-display font-bold text-xs px-3\\.5 py-2 rounded-xl" style="padding:8px 14px;background:var(--gold);color:var(--ink)">${t('carte.claim')}</button>`
        : `<button data-action="carte-speed-up" data-exp-id="${exp.id}" class="font-display font-bold fs-10 px-2\\.5 py-1\\.5 rounded-xl flex items-center gap-1 shrink-0" style="padding:6px 10px;background:#F1ECE2;color:var(--ink-soft)">⚡ ${speedCost}</button>`}
    </div>
    ${progressHtml}
  </div>`;
}

function scoutPanelHtml() {
  const c = ui.carte;
  const done = c.scoutTaps >= SCOUT_MAX_TAPS;
  const dotDelay = c.scoutStartedAt ? -((Date.now() - c.scoutStartedAt) % 2400) : 0;
  return `<div class="rounded-2xl p-3\\.5" style="padding:14px;background:#F1ECE2">
    <div class="flex items-center justify-between mb-1\\.5" style="margin-bottom:6px">
      <span class="font-display font-bold fs-12" style="color:var(--ink)">${icon('map', { size: 14, color: 'var(--gold-deep)' })} ${t('carte.scoutTitle')}</span>
      ${c.scoutBonusPct > 0 ? `<span class="font-display font-bold fs-11" style="color:var(--gold-deep)">+${c.scoutBonusPct}%</span>` : ''}
    </div>
    ${done
      ? `<p class="font-body font-semibold fs-11" style="color:var(--ink-soft)">${c.scoutBonusPct > 0 ? t('carte.scoutDoneBonus', { n: c.scoutBonusPct }) : t('carte.scoutDoneNone')}</p>`
      : `<div class="hatch-timing-track" style="margin:0 auto">
          <div class="hatch-timing-zone"></div>
          <div class="hatch-timing-dot" style="animation-delay:${dotDelay}ms"></div>
        </div>
        <button data-action="carte-scout-tap" class="font-display font-bold fs-11 rounded-xl w-full mt-2" style="margin-top:8px;padding:8px;background:var(--gold);color:var(--ink)">${t('carte.scoutTap', { n: c.scoutTaps, max: SCOUT_MAX_TAPS })}</button>`}
  </div>`;
}

function teamPickerHtml(zone, availableDragons) {
  const teamIds = ui.carte.teamIds;
  const team = availableDragons.filter(d => teamIds.includes(d.id));
  const temperamentSet = {};
  team.forEach(d => { temperamentSet[d.temperament] = true; });
  const distinct = Object.keys(temperamentSet).length;
  const harmonyBonus = distinct >= 2 ? 20 : 0;
  const elementSet = {};
  team.forEach(d => { elementSet[speciesById(d.speciesId).element] = true; });
  const distinctElements = Object.keys(elementSet).length;
  const elementalBonus = distinctElements >= 3 ? 20 : distinctElements === 2 ? 10 : 0;
  const perfectMatch = team.length > 0 && team.every(d => zone.elements.includes(speciesById(d.speciesId).element));

  let totalVig = 0, totalEclat = 0;
  team.forEach(d => { const st = computeDragonStats(d, zone); totalVig += st.vigueur; totalEclat += st.eclat; });
  const avgVig = team.length ? Math.min(100, Math.round(totalVig / team.length)) : 0;
  const avgEclat = team.length ? Math.min(100, Math.round(totalEclat / team.length + harmonyBonus * 0.3 + (perfectMatch ? 15 : 0))) : 0;
  const harmonie = team.length ? Math.min(100, 30 + harmonyBonus + elementalBonus + (perfectMatch ? 15 : 0) + team.length * 10) : 0;

  let grid;
  if (availableDragons.length === 0) {
    grid = emptyNoteHtml(t('carte.noTeamDragons'));
  } else {
    grid = `<div class="team-picker-grid grid grid-cols-4 gap-2 mb-3" style="max-height:216px;overflow-y:auto;-webkit-overflow-scrolling:touch;">${availableDragons.map(d => {
      const s = speciesById(d.speciesId);
      const picked = teamIds.includes(d.id);
      return `<button data-action="carte-toggle-team-member" data-dragon-id="${d.id}" class="rounded-xl p-1\\.5 flex flex-col items-center relative" style="padding:6px;background:${picked ? '#FFF3DC' : 'var(--parchment)'};outline:${picked ? '2px solid var(--gold)' : 'none'}">
        ${picked ? `<span style="position:absolute;top:4px;right:4px">${icon('check', { size: 11, color: 'var(--gold-deep)' })}</span>` : ''}
        ${dragonSVG({ element: s.element, variant: s.variant, stage: d.stage, size: 44 })}
      </button>`;
    }).join('')}</div>`;
  }

  // Bande d'équipe sélectionnée, TOUJOURS visible au-dessus de la grille (qui elle défile de façon
  // indépendante) : plus le nombre de dragons disponibles grandit, plus il devient pénible de
  // remonter tout en haut pour voir/retirer qui est déjà choisi — cette bande règle ça.
  const selectedStrip = team.length > 0
    ? `<div class="flex items-center gap-1\\.5 mb-2\\.5 flex-wrap" style="gap:6px;margin-bottom:10px;">${team.map(d => {
        const s = speciesById(d.speciesId);
        return `<button data-action="carte-toggle-team-member" data-dragon-id="${d.id}" class="rounded-lg relative" style="background:#FFF3DC;outline:2px solid var(--gold);padding:2px;">
          ${dragonSVG({ element: s.element, variant: s.variant, stage: d.stage, size: 30 })}
          <span class="flex items-center justify-center" style="position:absolute;top:-4px;right:-4px;background:var(--ink-soft);border-radius:9999px;width:14px;height:14px;">${icon('x', { size: 9, color: '#fff' })}</span>
        </button>`;
      }).join('')}</div>`
    : '';

  return `<div>
    ${selectedStrip}
    ${grid}
    <div class="font-display font-bold text-xs mb-1\\.5" style="margin-bottom:6px;color:var(--ink-soft)">${t('carte.team', { n: teamIds.length })}</div>
    ${statBarHtml(t('carte.statVigueur'), avgVig)}
    ${statBarHtml(t('carte.statEclat'), avgEclat)}
    ${statBarHtml(t('carte.statHarmonie'), harmonie)}
    ${harmonyBonus > 0 ? `<div class="font-body font-semibold fs-11 mt-1" style="color:var(--gold-deep)">${t('carte.harmonyBonus')}</div>` : ''}
    ${elementalBonus > 0 ? `<div class="font-body font-semibold fs-11 mt-0\\.5" style="color:var(--gold-deep)">${t('carte.elementalBonus')}</div>` : ''}
    ${perfectMatch ? `<div class="font-body font-semibold fs-11 mt-0\\.5" style="color:var(--gold-deep)">${t('carte.perfectMatchBonus')}</div>` : ''}
    ${team.filter(isBoldDragon).length > 0 ? `<div class="font-body font-semibold fs-11 mt-0\\.5" style="color:var(--gold-deep)">${t('carte.boldBonus', { n: Math.round(team.filter(isBoldDragon).reduce((sum, d) => sum + traitMagnitude(d), 0) * 100) })}</div>` : ''}
    <button data-action="carte-confirm-team" ${teamIds.length < 2 ? 'disabled' : ''} class="btn-primary full mt-3" style="margin-top:12px;">${t('carte.launchExpedition')}</button>
  </div>`;
}

function renderScreenCarteRaw() {
  const busy = busyDragonIds();
  const availableDragons = state.dragons.filter(d => !busy[d.id]);
  const c = ui.carte;
  let html = `<div class="flex-1 overflow-y-auto px-4 pb-4">`;

  if (state.expeditions.length > 0) {
    html += `<div id="active-expeditions-block" class="mb-3 flex flex-col gap-2">${state.expeditions.map(activeExpeditionCardHtml).join('')}</div>`;
  }

  if (c.view === 'zones') {
    html += `<h3 class="font-display font-bold text-sm mb-1" style="color:var(--ink)">${t('carte.pathTitle')}</h3>
      <p class="font-body font-semibold fs-11 mb-2" style="color:var(--ink-soft)">${t('carte.pathSubtitle')}</p>
      ${zonesPathMapHtml()}`;
  } else if (c.view === 'types') {
    const zone = ZONES.find(z => z.id === c.zoneId);
    const loreHtml = zone.lore ? `<p class="font-body fs-11 italic mb-3" style="color:var(--ink-soft)">${escapeHtml(zone.lore)}</p>` : '';
    html += flowPanelHtml(zone.name, loreHtml + typesPathHtml(EXPEDITION_TYPES.filter(et => (!et.team || state.mode === 'stratege') && (!et.requiresAllLegendary || allLegendariesDiscovered()) && (!et.requiresMythic || hasAnyMythic())), zone));
  } else if (c.view === 'pick1') {
    const zone = ZONES.find(z => z.id === c.zoneId);
    let inner;
    if (availableDragons.length === 0) {
      inner = emptyNoteHtml(state.dragons.length === 0 ? t('carte.noDragonAtAll') : t('carte.noDragonAvailable'));
    } else {
      inner = `<div class="grid grid-cols-4 gap-2">${availableDragons.map(d => {
        const s = speciesById(d.speciesId);
        return `<button data-action="carte-pick-single" data-dragon-id="${d.id}" class="rounded-xl p-1\\.5 flex flex-col items-center" style="padding:6px;background:var(--parchment)">${dragonSVG({ element: s.element, variant: s.variant, stage: d.stage, size: 48 })}</button>`;
      }).join('')}</div>`;
    }
    html += flowPanelHtml(t('carte.chooseDragon'), scoutPanelHtml() + inner);
  } else if (c.view === 'team') {
    const zone = ZONES.find(z => z.id === c.zoneId);
    html += flowPanelHtml(t('carte.buildTeam'), scoutPanelHtml() + teamPickerHtml(zone, availableDragons));
  }

  html += `</div>`;
  document.getElementById('screen-root').innerHTML = html;
}

// Toute mise à jour de l'écran carte (choix d'un dragon, minuteur, repérage...) passe par ce
// point unique qui préserve le défilement — sans ça, chaque re-rendu (y compris juste taper sur
// un dragon pour composer une équipe) ramenait l'écran tout en haut, rendant la sélection instable.
// Rafraîchit uniquement les cartes d'expédition en cours (comptes à rebours, sentier animé) —
// sans reconstruire le reste de l'écran (parcours illustré, sélecteurs de dragons), qui ne dépend
// pas de l'horloge. Avec plusieurs expéditions actives, refaire tout l'écran chaque seconde
// devenait lourd et cassait la fluidité du défilement.
function tickActiveExpeditions() {
  const el = document.getElementById('active-expeditions-block');
  if (!el || state.expeditions.length === 0) return;
  el.innerHTML = state.expeditions.map(activeExpeditionCardHtml).join('');
}

function renderScreenCarte(opts) {
  const resetScroll = opts && opts.resetScroll;
  const prevScrollable = document.querySelector('#screen-root .overflow-y-auto');
  const prevScrollTop = prevScrollable ? prevScrollable.scrollTop : 0;
  renderScreenCarteRaw();
  const newScrollable = document.querySelector('#screen-root .overflow-y-auto');
  if (newScrollable) newScrollable.scrollTop = resetScroll ? 0 : prevScrollTop;
}
function flowPanelHtml(title, innerHtml) {
  return `<div>
    <button data-action="carte-back" class="flex items-center gap-1 font-display font-bold text-xs mb-2\\.5" style="margin-bottom:10px;color:var(--gold-deep)">${icon('chevron-left', { size: 15 })} ${t('carte.back')}</button>
    <h3 class="font-display font-bold text-sm mb-2\\.5" style="margin-bottom:10px;color:var(--ink)">${escapeHtml(title)}</h3>
    <div class="flex flex-col gap-2\\.5" style="gap:10px">${innerHtml}</div>
  </div>`;
}

/* =========================================================================
   ÉCRAN — BOUTIQUE
   ========================================================================= */

function decorCardHtml(d) {
  const owned = state.decorOwned.includes(d.id);
  const equipped = state.decorEquipped.includes(d.id);
  const activeEvent = getActiveEvent();
  const seasonLocked = d.seasonal && !owned && !(activeEvent && activeEvent.id === d.seasonal);
  const canAfford = state.ecailles >= d.cost && !seasonLocked;
  const action = !owned
    ? `<button data-action="buy-decor" data-decor-id="${d.id}" ${canAfford ? '' : 'disabled'} class="mt-2 font-display font-bold fs-11 px-3 py-1\\.5 rounded-xl w-full flex items-center justify-center gap-1" style="padding:6px 12px;background:${canAfford ? 'var(--gold)' : '#D8CFC0'};color:var(--ink)">${coinIconHtml()} ${d.cost}</button>`
    : `<button data-action="toggle-equip-decor" data-decor-id="${d.id}" class="mt-2 font-display font-bold fs-11 px-3 py-1\\.5 rounded-xl w-full" style="padding:6px 12px;background:${equipped ? 'var(--gold-deep-btn)' : '#F1ECE2'};color:${equipped ? 'var(--ink)' : 'var(--ink-soft)'}">${equipped ? t('boutique.equipped') : t('boutique.equip')}</button>`;
  const elc = ELEMENTS[d.element] || ELEMENTS.lumiere;
  return `<div class="rounded-2xl p-3 flex flex-col items-center relative" style="background:var(--parchment)">
    ${d.seasonal ? `<span class="absolute font-display font-bold" style="top:6px;right:6px;font-size:14px" aria-hidden="true">${EVENTS.find(e => e.id === d.seasonal)?.emoji || ''}</span>` : ''}
    <div class="mb-1 flex items-center justify-center rounded-full" style="height:48px;width:48px;background:${elc.light}55">${decorIconSVG(d.id, 32)}</div>
    <div class="font-display font-bold text-xs text-center" style="color:var(--ink)">${d.name}</div>
    ${action}
  </div>`;
}

function decorSectionHtml(title, items) {
  if (items.length === 0) return '';
  return `<div class="mb-3\\.5" style="margin-bottom:14px">
    <div class="font-display font-bold fs-11 mb-1\\.5" style="margin-bottom:6px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:0.02em">${escapeHtml(title)}</div>
    <div class="grid grid-cols-2 gap-2\\.5" style="gap:10px">${items.map(decorCardHtml).join('')}</div>
  </div>`;
}

function accessoryPreviewViewBox(slot) {
  if (slot === 'charm') return '142 122 52 52';
  if (slot === 'collar') return '66 74 68 60';
  return '60 4 80 50';
}

function accessoryCardHtml(acc, owned) {
  const vb = accessoryPreviewViewBox(acc.slot);
  const preview = `<svg viewBox="${vb}" width="52" height="34">${accessorySVGFragment(acc.id)}</svg>`;
  return `<div class="rounded-2xl p-2\\.5 flex flex-col items-center" style="padding:10px;background:var(--parchment)">
    <div class="flex items-center justify-center" style="width:52px;height:34px">${preview}</div>
    <div class="font-body font-bold fs-10 text-center mt-1\\.5" style="margin-top:6px;color:var(--ink)">${escapeHtml(acc.name)}</div>
    ${owned
      ? `<span class="font-body font-bold fs-9 mt-1" style="color:var(--ink-soft)">${t('accessory.owned')}</span>`
      : `<button data-action="buy-accessory" data-accessory-id="${acc.id}" class="flex items-center gap-1 font-display font-bold fs-10 mt-1\\.5 px-2\\.5 py-1 rounded-full" style="margin-top:6px;padding:4px 10px;background:${state.ecailles >= acc.cost ? 'var(--gold)' : '#E4DCC9'};color:var(--ink)">${coinIconHtml()} ${acc.cost}</button>`}
  </div>`;
}

function accessorySectionHtml(titleKey, items, ownedIds) {
  if (items.length === 0) return '';
  return `<div class="mb-3">
    <div class="font-body font-bold fs-11 mb-1\\.5" style="margin-bottom:6px;color:var(--ink-soft)">${t(titleKey)}</div>
    <div class="grid grid-cols-3 gap-2">${items.map(a => accessoryCardHtml(a, ownedIds.includes(a.id))).join('')}</div>
  </div>`;
}

function renderScreenBoutique() {
  const activeEvent = getActiveEvent();
  const tab = ui.boutiqueTab || 'shop';
  const ELEMENT_ORDER = ['lumiere', 'feu', 'eau', 'terre', 'air', 'nature'];

  let body;
  if (tab === 'accessories') {
    const owned = state.accessoriesOwned || [];
    body = accessorySectionHtml('accessory.slotHat', ACCESSORIES.filter(a => a.slot === 'hat'), owned)
      + accessorySectionHtml('accessory.slotCollar', ACCESSORIES.filter(a => a.slot === 'collar'), owned)
      + accessorySectionHtml('accessory.slotCharm', ACCESSORIES.filter(a => a.slot === 'charm'), owned);
  } else if (tab === 'collection') {
    const owned = DECOR.filter(d => state.decorOwned.includes(d.id));
    if (owned.length === 0) {
      body = emptyNoteHtml(t('boutique.collectionEmpty'));
    } else {
      const seasonalOwned = owned.filter(d => d.seasonal);
      const permanentOwned = owned.filter(d => !d.seasonal);
      body = seasonalOwned.length
        ? decorSectionHtml(t('boutique.sectionSeasonal'), seasonalOwned) + decorSectionHtml(t('boutique.sectionPermanent'), permanentOwned)
        : decorSectionHtml(t('boutique.sectionPermanent'), permanentOwned);
    }
  } else {
    const shoppable = DECOR.filter(d => !d.passOnly && !state.decorOwned.includes(d.id) && (!d.seasonal || (activeEvent && activeEvent.id === d.seasonal)));
    if (shoppable.length === 0) {
      body = emptyNoteHtml(t('boutique.shopEmpty'));
    } else {
      const seasonal = shoppable.filter(d => d.seasonal);
      const bySection = ELEMENT_ORDER.map(el => decorSectionHtml(ELEMENTS[el].name, shoppable.filter(d => !d.seasonal && d.element === el))).join('');
      body = (seasonal.length ? decorSectionHtml(t('boutique.sectionSeasonal'), seasonal) : '') + bySection;
    }
  }

  const ownedCount = state.decorOwned.length;
  const totalCount = DECOR.length;

  document.getElementById('screen-root').innerHTML = `
  <div class="flex-1 overflow-y-auto px-4 pb-4">
    <h3 class="font-display font-bold text-sm mb-1" style="color:var(--ink)">${t('boutique.title')}</h3>
    <p class="font-body font-semibold fs-11 mb-3" style="color:var(--ink-soft)">${t('boutique.subtitle')}</p>
    ${seasonalEventBannerHtml()}
    <div class="flex rounded-2xl p-1 mb-3" style="background:#F1ECE2">
      <button data-action="boutique-set-tab" data-tab="shop" class="flex-1 font-display font-bold fs-12 py-2 rounded-xl" style="padding:8px 0;background:${tab === 'shop' ? 'var(--parchment)' : 'transparent'};color:var(--ink)">${t('boutique.tabShop')}</button>
      <button data-action="boutique-set-tab" data-tab="collection" class="flex-1 font-display font-bold fs-12 py-2 rounded-xl" style="padding:8px 0;background:${tab === 'collection' ? 'var(--parchment)' : 'transparent'};color:var(--ink)">${t('boutique.tabCollection', { n: ownedCount, total: totalCount })}</button>
      <button data-action="boutique-set-tab" data-tab="accessories" class="flex-1 font-display font-bold fs-12 py-2 rounded-xl" style="padding:8px 0;background:${tab === 'accessories' ? 'var(--parchment)' : 'transparent'};color:var(--ink)">${t('boutique.tabAccessories', { n: (state.accessoriesOwned || []).length, total: ACCESSORIES.length })}</button>
    </div>
    ${body}
  </div>`;
}

/* =========================================================================
   ÉCRAN — LABORATOIRE
   ========================================================================= */

function renderScreenLabo() {
  const busy = busyDragonIds();
  const eligible = state.dragons.filter(d => d.stage === 'adulte' && !busy[d.id]);
  const { parentAId, parentBId, picking } = ui.labo;
  const a = parentAId ? state.dragons.find(d => d.id === parentAId) : null;
  const b = parentBId ? state.dragons.find(d => d.id === parentBId) : null;

  const slotHtml = (dragon, slot) => {
    if (!dragon) {
      return `<button data-action="labo-open-picker" data-slot="${slot}" class="rounded-2xl flex flex-col items-center justify-center gap-1" style="height:120px;border:2px dashed #D8CFC0;background:rgba(255,255,255,.4)">
        ${icon('plus', { size: 22, color: 'var(--ink-soft)' })}
        <span class="font-body font-bold fs-11" style="color:var(--ink-soft)">${t('labo.choose')}</span>
      </button>`;
    }
    const species = speciesById(dragon.speciesId);
    return `<button data-action="labo-open-picker" data-slot="${slot}" class="rounded-2xl flex flex-col items-center p-2" style="height:120px;background:var(--parchment)">
      ${dragonSVG({ element: species.element, variant: species.variant, stage: 'adulte', size: 72 })}
      <div class="font-display font-bold fs-11 mt-1" style="color:var(--ink)">${escapeHtml(dragonDisplayName(dragon, species))}</div>
    </button>`;
  };

  const cooldownLeft = Math.max(0, (state.laboCooldownUntil || 0) - Date.now());
  const onCooldown = cooldownLeft > 0;
  const canBreed = a && b && a.id !== b.id && !onCooldown && state.ecailles >= BREED_COST;

  // Indicateur de "pitié" : encourage à continuer l'élevage même après une série de résultats communs.
  let pityHtml = '';
  if (a && b && a.id !== b.id) {
    const bothLegendary = speciesById(a.speciesId).variant === 4 && speciesById(b.speciesId).variant === 4;
    if (bothLegendary) {
      const left = Math.max(0, LABO_PITY_MYTHIC_THRESHOLD - (state.laboPityMythic || 0));
      pityHtml = `<div class="font-body font-semibold fs-11 mb-2\\.5 text-center" style="color:var(--gold-deep)">${left <= 0 ? t('labo.pityMythicReady') : t('labo.pityMythic', { n: left })}</div>`;
    } else {
      const left = Math.max(0, LABO_PITY_LEGENDARY_THRESHOLD - (state.laboPityLegendary || 0));
      pityHtml = `<div class="font-body font-semibold fs-11 mb-2\\.5 text-center" style="color:var(--ink-soft)">${left <= 0 ? t('labo.pityLegendaryReady') : t('labo.pityLegendary', { n: left })}</div>`;
    }
  }

  let pickerHtml = '';
  if (picking) {
    const already = picking === 'a' ? parentBId : parentAId;
    const options = eligible.filter(d => d.id !== already);
    pickerHtml = `<div class="rounded-2xl p-3 mb-3" style="background:var(--parchment)">
      <div class="flex items-center justify-between mb-2">
        <div class="font-display font-bold fs-12" style="color:var(--ink)">${t('labo.choosePicker')}</div>
        <button data-action="labo-close-picker" aria-label="${t('labo.closeAria')}" class="w-7 h-7 rounded-full flex items-center justify-center" style="background:#F1ECE2">${icon('x', { size: 14, color: 'var(--ink-soft)' })}</button>
      </div>
      ${options.length === 0 ? emptyNoteHtml(t('labo.noOtherAdult')) : `
      <div class="grid grid-cols-3 gap-2">${options.map(d => {
        const species = speciesById(d.speciesId);
        return `<button data-action="labo-select-parent" data-slot="${picking}" data-dragon-id="${d.id}" class="rounded-xl flex flex-col items-center p-1\\.5" style="background:var(--sky)">
          ${dragonSVG({ element: species.element, variant: species.variant, stage: 'adulte', size: 50 })}
          <div class="font-body font-bold" style="font-size:9px;color:var(--ink)">${escapeHtml(dragonDisplayName(d, species))}</div>
        </button>`;
      }).join('')}</div>`}
    </div>`;
  }

  document.getElementById('screen-root').innerHTML = `
  <div class="flex-1 overflow-y-auto px-4 pb-4">
    <h3 class="font-display font-bold text-sm mb-1" style="color:var(--ink)">${t('labo.title')}</h3>
    <p class="font-body font-semibold fs-11 mb-3" style="color:var(--ink-soft)">${t('labo.subtitle')}</p>
    ${eligible.length < 2 && !(a && b) ? emptyNoteHtml(t('labo.needTwo')) : ''}
    ${pickerHtml}
    <div class="grid grid-cols-2 gap-3 mb-3">${slotHtml(a, 'a')}${slotHtml(b, 'b')}</div>
    ${pityHtml}
    <button data-action="breed-dragons" ${canBreed ? '' : 'disabled'} class="w-full font-display font-bold text-sm py-3 rounded-2xl flex items-center justify-center gap-2" style="background:${canBreed ? 'var(--gold)' : '#D8CFC0'};color:var(--ink)">
      ${onCooldown ? t('labo.availableIn', { time: fmtCountdown(cooldownLeft) }) : `${coinIconHtml()} ${t('labo.breed', { cost: BREED_COST })}`}
    </button>

    <div class="rounded-3xl mt-5 p-5 flex flex-col items-center text-center" style="margin-top:20px;background:linear-gradient(180deg,#F1ECE2,#E9E2D2)">
      <div class="rounded-full flex items-center justify-center mb-3" style="width:64px;height:64px;background:rgba(201,122,31,.14)">${icon('flask', { size: 30, color: 'var(--gold-deep)' })}</div>
      <div class="font-display font-bold fs-13 mb-1\\.5" style="margin-bottom:6px;color:var(--ink)">${t('labo.tipTitle')}</div>
      <p class="font-body font-semibold fs-11" style="color:var(--ink-soft);max-width:280px">${t('labo.tipBody')}</p>
    </div>
  </div>`;
}

/* =========================================================================
   ÉCRAN — RÉGLAGES
   ========================================================================= */

function renderScreenReglages() {
  ui.reglagesName = state.gardienName;
  document.getElementById('screen-root').innerHTML = `
  <div class="flex-1 overflow-y-auto px-4 pb-4">
    <h3 class="font-display font-bold text-sm mb-3" style="color:var(--ink)">${t('settings.title')}</h3>

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <label class="font-body font-bold fs-11 block mb-1\\.5" style="margin-bottom:6px;color:var(--ink-soft)">${t('settings.guardianName')}</label>
      <div class="flex gap-2">
        <input id="reglages-name-input" data-bind="reglages-name" value="${escapeHtml(state.gardienName)}" maxlength="16" aria-label="${t('settings.guardianName')}" autocomplete="given-name" class="flex-1 font-body font-bold rounded-xl px-3 py-2" style="background:var(--sky);color:var(--ink)"/>
        <button data-action="save-name" class="font-display font-bold text-xs px-3 rounded-xl" style="background:var(--gold);color:var(--ink)">${t('common.ok')}</button>
      </div>
    </div>

    ${titlePickerCardHtml()}

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-11 mb-2" style="color:var(--ink-soft)">${t('settings.language')}</div>
      <div class="flex gap-2">
        <button data-action="change-language" data-lang="fr" aria-pressed="${state.language === 'fr'}" class="flex-1 rounded-xl py-2\\.5 font-display font-bold text-sm" style="padding:10px 0;background:${state.language === 'fr' ? 'var(--gold)' : 'var(--sky)'};color:var(--ink)">Français</button>
        <button data-action="change-language" data-lang="en" aria-pressed="${state.language === 'en'}" class="flex-1 rounded-xl py-2\\.5 font-display font-bold text-sm" style="padding:10px 0;background:${state.language === 'en' ? 'var(--gold)' : 'var(--sky)'};color:var(--ink)">English</button>
      </div>
    </div>

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-11 mb-2" style="color:var(--ink-soft)">${t('settings.gameMode')}</div>
      <div class="flex gap-2">
        <button data-action="change-mode" data-mode="eclosion" aria-pressed="${state.mode === 'eclosion'}" class="flex-1 rounded-xl py-2\\.5 flex flex-col items-center" style="padding:10px 0;background:${state.mode === 'eclosion' ? 'var(--gold)' : 'var(--sky)'}">
          <span class="font-display font-bold text-sm" style="color:var(--ink)">${t('settings.modeHatching')}</span>
          <span class="font-display font-bold fs-10" style="color:${state.mode === 'eclosion' ? 'var(--ink)' : 'var(--ink-soft)'}">10+</span>
        </button>
        <button data-action="change-mode" data-mode="stratege" aria-pressed="${state.mode === 'stratege'}" class="flex-1 rounded-xl py-2\\.5 flex flex-col items-center" style="padding:10px 0;background:${state.mode === 'stratege' ? 'var(--gold)' : 'var(--sky)'}">
          <span class="font-display font-bold text-sm" style="color:var(--ink)">${t('settings.modeStrategist')}</span>
          <span class="font-display font-bold fs-10" style="color:${state.mode === 'stratege' ? 'var(--ink)' : 'var(--ink-soft)'}">14+</span>
        </button>
      </div>
      <p class="font-body fs-11 mt-2 leading-relaxed" style="color:var(--ink-soft)">${t('settings.modeHint')}</p>
    </div>

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-13 mb-1" style="color:var(--ink)">${t('settings.preferences')}</div>
      ${preferenceRowHtml('toggle-parental-lock', state.parentalLock, t('settings.parentalLock'), t('settings.parentalLockHint'))}
      ${preferenceRowHtml('toggle-reduce-vibrations', state.reduceVibrations, t('settings.reduceVibrations'), t('settings.reduceVibrationsHint'))}
      ${preferenceRowHtml('toggle-sound', state.soundEnabled, t('settings.sound'), t('settings.soundHint'))}
      ${preferenceRowHtml('toggle-gentle-animations', state.gentleAnimations, t('settings.gentleAnimations'), t('settings.gentleAnimationsHint'), true)}
    </div>

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-13 mb-1" style="color:var(--ink)">${t('settings.saveTitle')}</div>
      <p class="font-body fs-11 leading-relaxed mb-3" style="color:var(--ink-soft)">${t('settings.saveHint')}</p>
      <div class="flex gap-2">
        <button data-action="export-save" class="flex-1 flex items-center justify-center gap-1.5 font-display font-bold text-xs py-2.5 rounded-xl" style="padding:10px 0;background:var(--sky);color:var(--ink)">${icon('download', { size: 14 })} ${t('settings.export')}</button>
        <button data-action="import-save-trigger" class="flex-1 flex items-center justify-center gap-1.5 font-display font-bold text-xs py-2.5 rounded-xl" style="padding:10px 0;background:var(--sky);color:var(--ink)">${icon('upload', { size: 14 })} ${t('settings.import')}</button>
      </div>
      <input type="file" id="import-save-input" accept="application/json,.json" style="display:none" aria-hidden="true"/>
    </div>

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-13 mb-1" style="color:var(--ink)">${t('rival.settingsButton')}</div>
      <p class="font-body fs-11 leading-relaxed mb-3" style="color:var(--ink-soft)">${t('rival.settingsHint')}</p>
      <button data-action="open-rival-modal" class="w-full flex items-center justify-center gap-1.5 font-display font-bold text-xs py-2.5 rounded-xl" style="padding:10px 0;background:var(--sky);color:var(--ink)">🤝 ${t('rival.settingsButton')}</button>
    </div>

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-13 mb-2" style="color:var(--ink)">${t('settings.statsTitle')}</div>
      ${statRowHtml(t('settings.statDragons'), state.dragons.length)}
      ${statRowHtml(t('settings.statEggs'), state.statsEggsHatched || 0)}
      ${statRowHtml(t('settings.statExpeditions'), state.statsExpeditionsCompleted || 0)}
      ${statRowHtml(t('settings.statBreeding'), state.statsBredCount || 0)}
      ${statRowHtml(t('settings.statStreak'), t('settings.statStreakValue', { n: state.longestStreak || 0, s: (state.longestStreak || 0) > 1 ? (state.language === 'en' ? 's' : 's') : '' }))}
      ${statRowHtml(t('settings.statFavElement'), favoriteElementLabel(), true)}
    </div>

    ${expeditionLogCardHtml()}

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-13 mb-1" style="color:var(--ink)">${t('settings.aboutTitle')}</div>
      <p class="font-body fs-11 leading-relaxed" style="color:var(--ink-soft)">${t('settings.aboutText')}</p>
    </div>

    <button data-action="request-reset" class="w-full flex items-center justify-center gap-2 font-display font-bold text-xs py-3 rounded-2xl" style="background:#FBEAE4;color:#B5502C">${icon('rotate-ccw', { size: 14 })} ${t('settings.resetButton')}</button>
  </div>`;
}


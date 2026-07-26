/* =========================================================================
   ÉCRAN — ONBOARDING
   ========================================================================= */

function renderOnboarding() {
  const d = ui.onboarding;
  const root = document.getElementById('onboarding-root');
  root.innerHTML = `
  <div class="absolute inset-0 flex flex-col items-center justify-center px-6 text-center safe-top safe-bottom" style="background:linear-gradient(180deg,#FFF6E0,var(--sky) 60%)">
    <div class="anim-pulse mb-2">${eggSVG({ element: 'lumiere', size: 84, cracks: 0 })}</div>
    <h1 class="font-display font-extrabold text-3xl" style="color:var(--ink)">Lumidra</h1>
    <p class="font-body font-bold text-sm mt-1 mb-6" style="color:var(--ink-soft)">Fais éclore ta légende.</p>

    <input id="onboarding-name-input" data-bind="onboarding-name" value="${escapeHtml(d.name)}" placeholder="Ton prénom de Gardien" maxlength="16"
      aria-label="Ton prénom de Gardien" autocomplete="given-name"
      class="w-full font-body font-bold rounded-2xl px-4 py-3 text-center mb-4" style="background:var(--parchment);color:var(--ink)"/>

    <div class="w-full flex gap-3 mb-6">
      <button data-action="select-mode" data-mode="eclosion" aria-pressed="${d.mode === 'eclosion'}" class="flex-1 rounded-2xl p-3\\.5 flex flex-col items-center" style="padding:14px;background:${d.mode === 'eclosion' ? 'var(--gold)' : 'var(--parchment)'};outline:${d.mode === 'eclosion' ? '2px solid var(--gold-deep)' : 'none'}">
        <span class="font-display font-extrabold text-base" style="color:var(--ink)">Éclosion</span>
        <span class="font-display font-bold fs-10 px-2 py-0.5 rounded-full mt-1" style="background:${d.mode === 'eclosion' ? 'rgba(58,46,42,.16)' : 'var(--sky)'};color:var(--ink)">10+</span>
        <span class="font-body font-semibold fs-10 mt-1\\.5 text-center" style="margin-top:6px;color:${d.mode === 'eclosion' ? 'var(--ink)' : 'var(--ink-soft)'}">Simple, doux, rassurant</span>
      </button>
      <button data-action="select-mode" data-mode="stratege" aria-pressed="${d.mode === 'stratege'}" class="flex-1 rounded-2xl p-3\\.5 flex flex-col items-center" style="padding:14px;background:${d.mode === 'stratege' ? 'var(--gold)' : 'var(--parchment)'};outline:${d.mode === 'stratege' ? '2px solid var(--gold-deep)' : 'none'}">
        <span class="font-display font-extrabold text-base" style="color:var(--ink)">Stratège</span>
        <span class="font-display font-bold fs-10 px-2 py-0.5 rounded-full mt-1" style="background:${d.mode === 'stratege' ? 'rgba(58,46,42,.16)' : 'var(--sky)'};color:var(--ink)">14+</span>
        <span class="font-body font-semibold fs-10 mt-1\\.5 text-center" style="margin-top:6px;color:${d.mode === 'stratege' ? 'var(--ink)' : 'var(--ink-soft)'}">Équipes, statistiques</span>
      </button>
    </div>

    <button data-action="complete-onboarding" class="btn-primary full">✨ Commencer l'aventure</button>
    <p class="font-body fs-10 mt-4" style="color:var(--ink-soft)">Tu pourras changer de mode plus tard dans les réglages.</p>
  </div>`;
}

/* =========================================================================
   BARRE SUPÉRIEURE ET NAVIGATION
   ========================================================================= */

function renderTopBar() {
  const root = document.getElementById('topbar-root');
  const complete = state.discovered.length === SPECIES.length;
  root.innerHTML = `
  <div class="flex items-center justify-between px-4 pt-4 pb-2 safe-top">
    <div class="flex items-center gap-2\\.5" style="gap:10px">
      <div class="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm" style="background:linear-gradient(135deg,var(--gold),var(--gold-deep-btn));color:var(--ink)">
        ${escapeHtml(state.gardienName.slice(0, 1).toUpperCase())}
      </div>
      <div>
        <div class="font-display font-bold text-sm leading-tight flex items-center gap-1\\.5" style="color:var(--ink)">${escapeHtml(state.gardienName)}${currentTitleName() ? `<span class="font-body font-bold" style="font-size:9px;padding:2px 6px;border-radius:9999px;background:var(--sky);color:var(--ink-soft)">${escapeHtml(currentTitleName())}</span>` : ''}</div>
        <div class="font-body font-bold fs-11" style="color:var(--ink-soft)">
          Niveau ${computeLevel(state.xp)} · ${state.mode === 'eclosion' ? 'Gardien' : 'Stratège'}${complete ? ` ${icon('star', { size: 11, color: 'var(--gold-deep)' })}` : ''}
        </div>
        <div class="rounded-full overflow-hidden mt-0\\.5" role="progressbar" aria-label="Progression vers le niveau suivant" aria-valuenow="${xpIntoLevel(state.xp)}" aria-valuemin="0" aria-valuemax="60" style="width:84px;height:4px;background:#E6DFD3;margin-top:2px">
          <div class="h-full rounded-full" style="width:${Math.round((xpIntoLevel(state.xp) / 60) * 100)}%;background:var(--gold)"></div>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1\\.5 rounded-full px-3 py-1\\.5 font-display font-bold text-sm shadow-sm" style="gap:6px;background:var(--parchment);color:var(--ink)">
        ${coinIconHtml()} ${state.ecailles}
      </div>
      <button data-action="open-settings" aria-label="Réglages" class="w-9 h-9 rounded-full flex items-center justify-center" style="background:var(--parchment)">
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
    { id: 'sanctuaire', label: 'Sanctuaire', ic: 'home' },
    { id: 'dragondex', label: 'Dragondex', ic: 'book-open' },
    { id: 'carte', label: 'Carte', ic: 'map' },
    { id: 'boutique', label: 'Boutique', ic: 'shopping-bag' },
  ];
  if (state.mode === 'stratege') items.push({ id: 'labo', label: 'Labo', ic: 'flask' });
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
  return `<div class="rounded-2xl p-3\\.5 mb-3" style="padding:14px;background:var(--parchment)">
    <div class="flex items-center justify-between mb-1">
      <div class="font-display font-bold fs-13" style="color:var(--ink)">Objectifs du jour</div>
      ${state.loginStreak > 1 ? `<span class="font-body font-bold fs-11 flex items-center gap-1" style="color:var(--gold-deep)">🔥 ${state.loginStreak} jours</span>` : ''}
    </div>
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
      <div class="font-display font-bold fs-12" style="color:var(--ink)">Défi de la semaine</div>
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
  { id: 'ete', name: "Festival d'Été", emoji: '☀️', startMonth: 6, startDay: 15, endMonth: 8, endDay: 31, decorId: 'voile-solaire', tagline: 'Décoration exclusive en boutique : Voile Solaire !' },
  { id: 'automne', name: "Récolte d'Automne", emoji: '🍂', startMonth: 9, startDay: 15, endMonth: 10, endDay: 31, decorId: 'citrouille-doree', tagline: 'Décoration exclusive en boutique : Citrouille Dorée !' },
  { id: 'hiver', name: "Veillée d'Hiver", emoji: '❄️', startMonth: 12, startDay: 1, endMonth: 1, endDay: 6, decorId: 'guirlande-etoilee', tagline: 'Décoration exclusive en boutique : Guirlande Étoilée !' },
];

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
  return `<div class="rounded-2xl p-3\\.5 mb-3 flex items-center gap-3" style="padding:14px;background:linear-gradient(135deg,#FDEDD3,#FBDCC0)">
    <div style="font-size:26px" aria-hidden="true">${ev.emoji}</div>
    <div class="flex-1">
      <div class="font-display font-bold fs-12" style="color:var(--ink)">${escapeHtml(ev.name)}</div>
      <div class="font-body fs-11" style="color:var(--ink-soft)">${escapeHtml(ev.tagline)}</div>
    </div>
  </div>`;
}

function dragonHabitatCardHtml(dragon, busy) {
  const species = speciesById(dragon.speciesId);
  const happyDots = Math.min(4, 1 + Math.floor(dragon.careCount / 3));
  let dots = '';
  for (let i = 0; i < 4; i++) dots += `<span class="w-1\\.5 h-1\\.5 rounded-full" style="width:6px;height:6px;background:${i < happyDots ? 'var(--gold)' : '#E6DFD3'}"></span>`;
  return `<button data-action="open-dragon" data-dragon-id="${dragon.id}" class="rounded-2xl p-2\\.5 flex flex-col items-center relative shadow-sm" style="padding:10px;background:var(--parchment);opacity:${busy ? 0.6 : 1}">
    ${busy ? `<span class="absolute font-display font-bold fs-8 px-1\\.5 py-0\\.5 rounded-full text-white" style="top:6px;right:6px;padding:2px 6px;background:var(--ink-soft)">en expédition</span>` : ''}
    ${dragon.favorite ? `<span class="absolute" style="top:6px;left:6px" aria-hidden="true">${icon('heart', { size: 13, color: '#D9634A' })}</span>` : ''}
    ${dragonSVG({ element: species.element, variant: species.variant, stage: dragon.stage, size: 68 })}
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
    { id: 'recent', label: 'Récents' },
    { id: 'favoris', label: 'Favoris' },
    { id: 'alpha', label: 'A-Z' },
    { id: 'rarete', label: 'Rareté' },
  ];
  const cur = ui.sanctuaireSort || 'recent';
  return `<div class="flex gap-1\\.5 mb-2\\.5 overflow-x-auto" style="gap:6px;margin-bottom:10px">${options.map(o => `
    <button data-action="set-sanctuaire-sort" data-sort="${o.id}" aria-pressed="${cur === o.id}" class="shrink-0 font-body font-bold fs-11 rounded-full" style="padding:5px 12px;background:${cur === o.id ? 'var(--gold)' : 'rgba(255,255,255,.6)'};color:var(--ink)">${o.label}</button>`).join('')}</div>`;
}

function objectivesSummaryHtml() {
  const questsReady = state.dailyQuests ? state.dailyQuests.quests.filter(q => q.progress >= q.target && !q.claimed).length : 0;
  const weeklyReady = state.weeklyChallenge && state.weeklyChallenge.progress >= state.weeklyChallenge.target && !state.weeklyChallenge.claimed ? 1 : 0;
  const readyCount = questsReady + weeklyReady;
  const activeEvent = getActiveEvent();

  if (ui.objectivesBannerCollapsed) {
    const bits = [];
    if (state.dailyQuests) bits.push(`${state.dailyQuests.quests.filter(q => !q.claimed).length} objectif${state.dailyQuests.quests.filter(q => !q.claimed).length > 1 ? 's' : ''} du jour`);
    if (state.weeklyChallenge && !state.weeklyChallenge.claimed) bits.push('1 défi de la semaine');
    const summary = bits.length ? bits.join(' · ') : 'Tout est à jour';
    return `<button data-action="toggle-objectives-banner" aria-expanded="false" class="w-full flex items-center gap-2\\.5 rounded-2xl mb-3" style="gap:10px;padding:10px 14px;background:var(--parchment)">
      <span style="font-size:18px" aria-hidden="true">${activeEvent ? activeEvent.emoji : '🎯'}</span>
      <span class="flex-1 text-left font-body font-bold fs-12" style="color:var(--ink)">${summary}</span>
      ${readyCount > 0 ? `<span class="font-display font-bold fs-10 rounded-full" style="padding:3px 8px;background:var(--gold);color:var(--ink)">${readyCount} à réclamer</span>` : ''}
      ${icon('chevron-down', { size: 14, color: 'var(--ink-soft)' })}
    </button>`;
  }

  return `<div class="mb-1">
    <button data-action="toggle-objectives-banner" aria-expanded="true" class="w-full flex items-center gap-2 mb-2" style="color:var(--gold-deep)">
      <span class="font-display font-bold fs-12 flex-1 text-left">Objectifs</span>
      <span style="display:inline-flex;transform:rotate(180deg)">${icon('chevron-down', { size: 14, color: 'var(--ink-soft)' })}</span>
    </button>
    ${dailyQuestsCardHtml()}
    ${weeklyChallengeCardHtml()}
    ${seasonalEventBannerHtml()}
  </div>`;
}

function renderScreenSanctuaire() {
  const busy = busyDragonIds();
  const equippedDecor = DECOR.filter(d => state.decorEquipped.includes(d.id));
  let html = `<div class="flex-1 overflow-y-auto px-4 pb-4">`;

  html += objectivesSummaryHtml();

  if (state.eggInbox.length > 0) {
    html += `<button data-action="start-hatch-from-inbox" class="w-full flex items-center gap-3 rounded-2xl px-4 py-3 mb-3 text-left" style="background:linear-gradient(135deg,#FFF3DC,#FCE3B8)">
      <div class="text-3xl" style="font-size:30px">🥚</div>
      <div class="flex-1">
        <div class="font-display font-bold text-sm" style="color:var(--gold-deep)">${state.eggInbox.length} œuf${state.eggInbox.length > 1 ? 's' : ''} prêt${state.eggInbox.length > 1 ? 's' : ''} à éclore</div>
        <div class="font-body font-semibold fs-11" style="color:var(--ink-soft)">Rapporté d'expédition</div>
      </div>
      <div class="font-display font-bold text-xs px-3 py-2 rounded-xl" style="background:var(--gold);color:var(--ink)">Ouvrir</div>
    </button>`;
  }

  html += `<div class="rounded-3xl p-4" style="background:linear-gradient(180deg,#E7F0FA,#DCEBF6)">
    <div class="flex items-center justify-between mb-2\\.5" style="margin-bottom:10px">
      <h3 class="font-display font-semibold fs-13" style="color:var(--ink-soft)">Ton sanctuaire</h3>
      ${equippedDecor.length ? `<div class="flex gap-1">${equippedDecor.map(d => decorIconSVG(d.id, 18)).join('')}</div>` : ''}
    </div>`;

  if (state.dragons.length === 0) {
    html += emptyNoteHtml("Ton sanctuaire est vide pour l'instant. Fais éclore ton premier œuf !");
  } else {
    if (state.dragons.length > 1) {
      html += `<button data-action="care-all-dragons" class="w-full flex items-center justify-center gap-1\\.5 font-body font-bold fs-11 rounded-xl mb-2\\.5" style="padding:8px;margin-bottom:10px;background:rgba(255,255,255,.55);color:var(--ink)">${icon('heart', { size: 13, color: '#D9634A' })} Soigner tous les dragons disponibles</button>`;
    }
    if (state.dragons.length > 5) {
      html += `<input id="sanctuaire-search-input" data-bind="sanctuaire-search" value="${escapeHtml(ui.sanctuaireSearch || '')}" placeholder="Chercher un de tes dragons…" aria-label="Chercher un dragon"
        class="w-full font-body font-semibold fs-12 rounded-xl px-3 py-2\\.5 mb-2\\.5" style="padding:10px 12px;margin-bottom:10px;background:rgba(255,255,255,.6);color:var(--ink)"/>`;
    }
    html += sanctuaireSortChipsHtml();
    html += sortedDragonsForDisplay().length === 0
      ? emptyNoteHtml('Aucun dragon ne correspond à cette recherche.')
      : `<div class="grid grid-cols-2 gap-3">${sortedDragonsForDisplay().map(d => dragonHabitatCardHtml(d, !!busy[d.id])).join('')}</div>`;
  }
  html += `</div></div>`;

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
      <span class="flex-1 text-left font-display font-bold fs-11" style="color:var(--ink)">Succès${unclaimedReady ? ` · ${unclaimedReady} à réclamer` : ''}</span>
      <span style="display:inline-flex">${icon('chevron-down', { size: 14, color: 'var(--ink-soft)' })}</span>
    </button>`;
  }
  const rows = ACHIEVEMENTS.map(a => {
    const claimed = state.achievementsClaimed.includes(a.id);
    const prog = a.progress(state);
    const ready = !claimed && prog >= a.target;
    return `<div class="flex items-center gap-2\\.5" style="gap:10px;padding:7px 0;border-bottom:1px solid #EEE6D8">
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
    </div>`;
  }).join('');
  return `<div class="mb-3 rounded-2xl p-3\\.5" style="padding:14px;background:#F1ECE2">
    <button data-action="toggle-achievements-banner" aria-expanded="true" class="w-full flex items-center gap-2 mb-1" style="margin-bottom:4px;">
      <span style="display:inline-flex">${icon('sparkles', { size: 16, color: 'var(--gold-deep)' })}</span>
      <span class="flex-1 text-left font-display font-bold fs-12" style="color:var(--ink)">Succès${unclaimedReady ? ` · ${unclaimedReady} à réclamer` : ''}</span>
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

  let chips = `<button data-action="dragondex-filter" data-element="tous" class="font-display font-bold fs-11 px-2\\.5 py-1\\.5 rounded-full whitespace-nowrap shrink-0" style="padding:6px 10px;background:var(--parchment);color:${filter === 'tous' ? 'var(--ink)' : 'var(--ink-soft)'};border:2px solid ${filter === 'tous' ? 'var(--gold-deep-btn)' : 'transparent'}">Tous</button>`;
  Object.entries(ELEMENTS).forEach(([key, el]) => {
    const active = filter === key;
    chips += `<button data-action="dragondex-filter" data-element="${key}" class="flex items-center gap-1 font-display font-bold fs-11 px-2\\.5 py-1\\.5 rounded-full whitespace-nowrap shrink-0" style="padding:6px 10px;background:var(--parchment);color:${active ? 'var(--ink)' : 'var(--ink-soft)'};border:2px solid ${active ? el.deep : 'transparent'}">${icon(el.icon, { size: 12, color: active ? el.deep : 'currentColor' })} ${el.name}</button>`;
  });

  const rarityOptions = [{ v: 'tous', label: 'Toutes raretés' }, { v: '0', label: 'Commun' }, { v: '2', label: 'Rare' }, { v: '3', label: 'Épique' }, { v: '4', label: 'Légendaire' }, { v: '5', label: 'Mythique' }];
  let rarityChips = rarityOptions.map(o => {
    const active = rarityFilter === o.v;
    return `<button data-action="dragondex-rarity-filter" data-rarity="${o.v}" class="font-display font-bold fs-11 px-2\\.5 py-1\\.5 rounded-full whitespace-nowrap shrink-0" style="padding:6px 10px;background:${active ? 'var(--gold)' : 'var(--parchment)'};color:var(--ink)">${o.label}</button>`;
  }).join('');

  let cards = filtered.map(s => {
    const discovered = state.discovered.includes(s.id);
    return `<button data-action="open-species" data-species-id="${s.id}" class="rounded-2xl p-2 flex flex-col items-center" style="background:var(--parchment)">
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
        <span class="flex-1 text-left font-display font-bold fs-11" style="color:var(--gold-deep)">Collection complète</span>
        <span style="display:inline-flex">${icon('chevron-down', { size: 14, color: 'var(--gold-deep)' })}</span>
      </button>`;
    } else {
      completeBanner = `<div class="mb-3 rounded-2xl p-3\\.5 flex items-center gap-3" style="padding:14px;background:linear-gradient(135deg,#FFF3DC,#FCE3B8)">
        <div style="font-size:26px;line-height:1;">🏆</div>
        <div class="flex-1">
          <div class="font-display font-bold text-sm" style="color:var(--gold-deep)">Maître Gardien</div>
          <div class="font-body font-semibold fs-11" style="color:var(--ink-soft)">Les ${SPECIES.length} espèces sont découvertes. Collection complète !</div>
        </div>
        <button data-action="toggle-collection-banner" aria-expanded="true" aria-label="Réduire la bannière" class="shrink-0 rounded-full flex items-center justify-center" style="width:28px;height:28px;background:rgba(255,255,255,.55)">
          <span style="display:inline-flex;transform:rotate(180deg)">${icon('chevron-down', { size: 14, color: 'var(--gold-deep)' })}</span>
        </button>
      </div>`;
    }
  }

  let legendaryBanner = `<div class="mt-4 rounded-2xl p-3\\.5 flex items-center gap-3" style="padding:14px;background:#F1ECE2">
    ${icon('sparkles', { size: 20, color: 'var(--gold-deep)' })}
    <div class="font-body font-semibold fs-11" style="color:var(--ink-soft)">Dragons Légendaires : une chance rare de les croiser lors des expéditions, surtout à la Cime des Anciens Dragons et lors des quêtes légendaires. Dragons Mythiques : unis deux légendaires au Laboratoire, tente la quête mythique une fois les six légendaires réunis, ou pousse jusqu'au Voile Éternel avec un premier mythique en poche.</div>
  </div>`;

  document.getElementById('screen-root').innerHTML = `
  <div class="flex-1 overflow-y-auto px-4 pb-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-display font-bold text-sm" style="color:var(--ink)">Dragondex</h3>
      <span class="font-body font-bold text-xs" style="color:var(--ink-soft)">${state.discovered.length}/${SPECIES.length} découverts</span>
    </div>
    ${completeBanner}
    ${achievementsCardHtml()}
    <div class="relative mb-3">
      <input id="dragondex-search-input" data-bind="dragondex-search" value="${escapeHtml(ui.dragondexSearch || '')}" placeholder="Chercher un dragon découvert…" aria-label="Chercher un dragon"
        class="w-full font-body font-semibold fs-12 rounded-xl px-3 py-2\.5" style="padding:10px 12px;background:var(--parchment);color:var(--ink)"/>
    </div>
    <div class="flex gap-2 mb-2 overflow-x-auto pb-1">${chips}</div>
    <div class="flex gap-2 mb-3 overflow-x-auto pb-1">${rarityChips}</div>
    ${filtered.length === 0 ? emptyNoteHtml('Aucun dragon découvert ne correspond à cette recherche.') : `<div class="grid grid-cols-3 gap-2\\.5" style="gap:10px">${cards}</div>`}
    ${legendaryBanner}
  </div>`;
}

/* =========================================================================
   ÉCRAN — CARTE / EXPÉDITIONS
   ========================================================================= */

function zonesPathMapHtml() {
  const level = computeLevel(state.xp);
  const n = ZONES.length;
  const xs = [76, 244, 76, 244, 160, 160]; // alternance gauche/droite façon "parcours"
  const ySpacing = 132;
  const yStart = 56;
  const points = ZONES.map((z, i) => ({ zone: z, x: xs[i % xs.length], y: yStart + i * ySpacing, unlocked: level >= z.unlockLevel }));
  const firstLockedIndex = points.findIndex(p => !p.unlocked);

  let pathD = '';
  points.forEach((p, i) => {
    if (i === 0) { pathD += `M ${p.x},${p.y}`; }
    else {
      const prev = points[i - 1];
      const midY = (prev.y + p.y) / 2;
      pathD += ` C ${prev.x},${midY} ${p.x},${midY} ${p.x},${p.y}`;
    }
  });
  const totalHeight = yStart + (n - 1) * ySpacing + 70;

  const nodesHtml = points.map((p, i) => {
    const { zone, unlocked } = p;
    const isNext = i === (firstLockedIndex === -1 ? -1 : firstLockedIndex);
    const chips = zone.elements.map(el => {
      const c = ELEMENTS[el];
      return icon(c.icon, { size: 13, color: unlocked ? c.deep : '#B7AF9E' });
    }).join('');
    return `<div style="position:absolute;left:${(p.x / 320) * 100}%;top:${p.y}px;transform:translate(-50%,-50%);width:96px;text-align:center;">
      ${isNext ? `<div style="position:absolute;left:50%;top:-30px;transform:translateX(-50%);font-size:22px" aria-hidden="true" class="anim-float">📍</div>` : ''}
      <button data-action="carte-open-zone" data-zone-id="${zone.id}" data-locked="${unlocked ? '0' : '1'}" aria-label="${escapeHtml(zone.name)}${unlocked ? '' : ' (verrouillé)'}"
        class="rounded-full flex items-center justify-center relative ${unlocked ? 'dragon-anim-idle' : ''}"
        style="width:66px;height:66px;margin:0 auto;background:${unlocked ? 'linear-gradient(135deg,var(--gold),var(--gold-deep-btn))' : '#D8CFC0'};box-shadow:0 4px 0 ${unlocked ? 'var(--gold-deep)' : '#B7AF9E'};border:3px solid #fff;animation-delay:${(i * 0.35).toFixed(2)}s">
        ${unlocked ? `<span style="display:flex;gap:1px">${chips}</span>` : icon('lock', { size: 18, color: '#8C8371' })}
      </button>
      <div class="font-display font-bold" style="font-size:10px;margin-top:6px;color:${unlocked ? 'var(--ink)' : 'var(--ink-soft)'};line-height:1.2">${escapeHtml(zone.name)}</div>
      ${!unlocked ? `<div class="font-body font-bold" style="font-size:9px;color:var(--ink-soft)">Niveau ${zone.unlockLevel}</div>` : ''}
    </div>`;
  }).join('');

  return `<div style="position:relative;width:100%;height:${totalHeight}px;">
    <svg viewBox="0 0 320 ${totalHeight}" style="position:absolute;top:0;left:0;width:100%;height:100%" preserveAspectRatio="none" aria-hidden="true">
      <path d="${pathD}" fill="none" stroke="#D8CFC0" stroke-width="7" stroke-linecap="round" stroke-dasharray="3 15"/>
      <path d="${pathD}" fill="none" stroke="var(--gold)" stroke-width="7" stroke-linecap="round" stroke-dasharray="3 15" opacity="0.85"
        style="clip-path:inset(0 0 ${Math.max(0, 100 - ((firstLockedIndex === -1 ? n - 1 : firstLockedIndex) / (n - 1)) * 100)}% 0)"/>
    </svg>
    ${nodesHtml}
  </div>`;
}

function typesPathHtml(types) {
  const stepColors = ['#8FBF7F', '#E0AA3E', '#E8734A', '#B5502C', '#8A6FBF'];
  return `<div class="flex flex-col">${types.map((t, i) => {
    const color = stepColors[i % stepColors.length];
    const isLast = i === types.length - 1;
    return `<div style="display:flex;gap:10px;align-items:stretch">
      <div style="display:flex;flex-direction:column;align-items:center;width:30px;flex-shrink:0">
        <div class="font-display font-bold shrink-0" style="width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:${color};color:#fff;font-size:12px">${i + 1}</div>
        ${!isLast ? `<div style="flex:1;width:3px;min-height:18px;background:#E6DFD3;margin:2px 0"></div>` : ''}
      </div>
      <button data-action="carte-choose-type" data-type-id="${t.id}" class="rounded-2xl p-3\\.5 flex items-center gap-3 text-left flex-1" style="padding:14px;margin-bottom:14px;background:var(--parchment)">
        <div class="flex-1">
          <div class="font-display font-bold fs-13" style="color:var(--ink)">${t.name}</div>
          <div class="font-body font-semibold fs-11" style="color:var(--ink-soft)">~${fmtCountdown(t.seconds * 1000)} · ${t.ecaillesMin}-${t.ecaillesMax} écailles${t.team ? ' · équipe' : ''}</div>
          ${t.tagline ? `<div class="font-body fs-10 mt-1" style="color:var(--gold-deep)">${escapeHtml(t.tagline)}</div>` : ''}
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
  return `<div class="rounded-2xl p-3 flex items-center gap-3" style="background:${ready ? 'linear-gradient(135deg,#FFF3DC,#FCE3B8)' : 'var(--parchment)'}">
    <div class="flex-1">
      <div class="font-display font-bold text-xs" style="color:var(--ink)">${escapeHtml(zone.name)}</div>
      <div class="font-body font-bold fs-11" style="color:${ready ? 'var(--gold-deep)' : 'var(--ink-soft)'}">${ready ? 'Expédition terminée !' : `Retour dans ${fmtCountdown(remaining)}`}</div>
    </div>
    ${ready ? `<button data-action="carte-claim" data-exp-id="${exp.id}" class="font-display font-bold text-xs px-3\\.5 py-2 rounded-xl" style="padding:8px 14px;background:var(--gold);color:var(--ink)">Récupérer</button>` : icon('clock', { size: 18, color: 'var(--ink-soft)' })}
  </div>`;
}

function teamPickerHtml(zone, availableDragons) {
  const teamIds = ui.carte.teamIds;
  const team = availableDragons.filter(d => teamIds.includes(d.id));
  const temperamentSet = {};
  team.forEach(d => { temperamentSet[d.temperament] = true; });
  const distinct = Object.keys(temperamentSet).length;
  const harmonyBonus = distinct >= 2 ? 20 : 0;

  let totalVig = 0, totalEclat = 0;
  team.forEach(d => { const st = computeDragonStats(d, zone); totalVig += st.vigueur; totalEclat += st.eclat; });
  const avgVig = team.length ? Math.min(100, Math.round(totalVig / team.length)) : 0;
  const avgEclat = team.length ? Math.min(100, Math.round(totalEclat / team.length + harmonyBonus * 0.3)) : 0;
  const harmonie = team.length ? Math.min(100, 30 + harmonyBonus + team.length * 10) : 0;

  let grid;
  if (availableDragons.length === 0) {
    grid = emptyNoteHtml('Aucun dragon disponible pour une équipe.');
  } else {
    grid = `<div class="grid grid-cols-4 gap-2 mb-3">${availableDragons.map(d => {
      const s = speciesById(d.speciesId);
      const picked = teamIds.includes(d.id);
      return `<button data-action="carte-toggle-team-member" data-dragon-id="${d.id}" class="rounded-xl p-1\\.5 flex flex-col items-center relative" style="padding:6px;background:${picked ? '#FFF3DC' : 'var(--parchment)'};outline:${picked ? '2px solid var(--gold)' : 'none'}">
        ${picked ? `<span style="position:absolute;top:4px;right:4px">${icon('check', { size: 11, color: 'var(--gold-deep)' })}</span>` : ''}
        ${dragonSVG({ element: s.element, variant: s.variant, stage: d.stage, size: 44 })}
      </button>`;
    }).join('')}</div>`;
  }

  return `<div>
    ${grid}
    <div class="font-display font-bold text-xs mb-1\\.5" style="margin-bottom:6px;color:var(--ink-soft)">Équipe (${teamIds.length}/3)</div>
    ${statBarHtml('Vigueur', avgVig)}
    ${statBarHtml('Éclat', avgEclat)}
    ${statBarHtml('Harmonie', harmonie)}
    ${harmonyBonus > 0 ? `<div class="font-body font-semibold fs-11 mt-1" style="color:var(--gold-deep)">💡 Tempéraments variés : bonus d'harmonie actif</div>` : ''}
    <button data-action="carte-confirm-team" ${teamIds.length < 2 ? 'disabled' : ''} class="btn-primary full mt-3" style="margin-top:12px;">Lancer l'expédition</button>
  </div>`;
}

function renderScreenCarte() {
  const busy = busyDragonIds();
  const availableDragons = state.dragons.filter(d => !busy[d.id]);
  const c = ui.carte;
  let html = `<div class="flex-1 overflow-y-auto px-4 pb-4">`;

  if (state.expeditions.length > 0) {
    html += `<div class="mb-3 flex flex-col gap-2">${state.expeditions.map(activeExpeditionCardHtml).join('')}</div>`;
  }

  if (c.view === 'zones') {
    html += `<h3 class="font-display font-bold text-sm mb-1" style="color:var(--ink)">Parcours d'expédition</h3>
      <p class="font-body font-semibold fs-11 mb-2" style="color:var(--ink-soft)">Avance de zone en zone à mesure que ton niveau grandit.</p>
      ${zonesPathMapHtml()}`;
  } else if (c.view === 'types') {
    const zone = ZONES.find(z => z.id === c.zoneId);
    const loreHtml = zone.lore ? `<p class="font-body fs-11 italic mb-3" style="color:var(--ink-soft)">${escapeHtml(zone.lore)}</p>` : '';
    html += flowPanelHtml(zone.name, loreHtml + typesPathHtml(EXPEDITION_TYPES.filter(t => (!t.team || state.mode === 'stratege') && (!t.requiresAllLegendary || allLegendariesDiscovered()) && (!t.requiresMythic || hasAnyMythic()))));
  } else if (c.view === 'pick1') {
    const zone = ZONES.find(z => z.id === c.zoneId);
    let inner;
    if (availableDragons.length === 0) {
      inner = emptyNoteHtml(state.dragons.length === 0 ? "Fais d'abord éclore un dragon dans ton sanctuaire." : 'Tous tes dragons sont déjà en expédition.');
    } else {
      inner = `<div class="grid grid-cols-4 gap-2">${availableDragons.map(d => {
        const s = speciesById(d.speciesId);
        return `<button data-action="carte-pick-single" data-dragon-id="${d.id}" class="rounded-xl p-1\\.5 flex flex-col items-center" style="padding:6px;background:var(--parchment)">${dragonSVG({ element: s.element, variant: s.variant, stage: d.stage, size: 48 })}</button>`;
      }).join('')}</div>`;
    }
    html += flowPanelHtml('Choisis un dragon', inner);
  } else if (c.view === 'team') {
    const zone = ZONES.find(z => z.id === c.zoneId);
    html += flowPanelHtml('Compose ton équipe', teamPickerHtml(zone, availableDragons));
  }

  html += `</div>`;
  document.getElementById('screen-root').innerHTML = html;
}

function flowPanelHtml(title, innerHtml) {
  return `<div>
    <button data-action="carte-back" class="flex items-center gap-1 font-display font-bold text-xs mb-2\\.5" style="margin-bottom:10px;color:var(--gold-deep)">${icon('chevron-left', { size: 15 })} Retour</button>
    <h3 class="font-display font-bold text-sm mb-2\\.5" style="margin-bottom:10px;color:var(--ink)">${escapeHtml(title)}</h3>
    <div class="flex flex-col gap-2\\.5" style="gap:10px">${innerHtml}</div>
  </div>`;
}

/* =========================================================================
   ÉCRAN — BOUTIQUE
   ========================================================================= */

function renderScreenBoutique() {
  const activeEvent = getActiveEvent();
  const visibleDecor = DECOR.filter(d => !d.seasonal || state.decorOwned.includes(d.id) || (activeEvent && activeEvent.id === d.seasonal));
  const cards = visibleDecor.map(d => {
    const owned = state.decorOwned.includes(d.id);
    const equipped = state.decorEquipped.includes(d.id);
    const seasonLocked = d.seasonal && !owned && !(activeEvent && activeEvent.id === d.seasonal);
    const canAfford = state.ecailles >= d.cost && !seasonLocked;
    const action = !owned
      ? `<button data-action="buy-decor" data-decor-id="${d.id}" ${canAfford ? '' : 'disabled'} class="mt-2 font-display font-bold fs-11 px-3 py-1\\.5 rounded-xl w-full flex items-center justify-center gap-1" style="padding:6px 12px;background:${canAfford ? 'var(--gold)' : '#D8CFC0'};color:var(--ink)">${coinIconHtml()} ${d.cost}</button>`
      : `<button data-action="toggle-equip-decor" data-decor-id="${d.id}" class="mt-2 font-display font-bold fs-11 px-3 py-1\\.5 rounded-xl w-full" style="padding:6px 12px;background:${equipped ? 'var(--gold-deep-btn)' : '#F1ECE2'};color:${equipped ? 'var(--ink)' : 'var(--ink-soft)'}">${equipped ? 'Équipé ✓' : 'Équiper'}</button>`;
    return `<div class="rounded-2xl p-3 flex flex-col items-center relative" style="background:var(--parchment)">
      ${d.seasonal ? `<span class="absolute font-display font-bold" style="top:6px;right:6px;font-size:14px" aria-hidden="true">${EVENTS.find(e => e.id === d.seasonal)?.emoji || ''}</span>` : ''}
      <div class="mb-1 flex items-center justify-center" style="height:34px">${decorIconSVG(d.id, 34)}</div>
      <div class="font-display font-bold text-xs text-center" style="color:var(--ink)">${d.name}</div>
      ${action}
    </div>`;
  }).join('');

  document.getElementById('screen-root').innerHTML = `
  <div class="flex-1 overflow-y-auto px-4 pb-4">
    <h3 class="font-display font-bold text-sm mb-1" style="color:var(--ink)">Décorations</h3>
    <p class="font-body font-semibold fs-11 mb-3" style="color:var(--ink-soft)">Personnalise ton sanctuaire avec des écailles gagnées en jouant — jamais d'argent réel ici.</p>
    ${seasonalEventBannerHtml()}
    <div class="grid grid-cols-2 gap-2\\.5" style="gap:10px">${cards}</div>
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
        <span class="font-body font-bold fs-11" style="color:var(--ink-soft)">Choisir</span>
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

  let pickerHtml = '';
  if (picking) {
    const already = picking === 'a' ? parentBId : parentAId;
    const options = eligible.filter(d => d.id !== already);
    pickerHtml = `<div class="rounded-2xl p-3 mb-3" style="background:var(--parchment)">
      <div class="flex items-center justify-between mb-2">
        <div class="font-display font-bold fs-12" style="color:var(--ink)">Choisir un parent</div>
        <button data-action="labo-close-picker" aria-label="Fermer" class="w-7 h-7 rounded-full flex items-center justify-center" style="background:#F1ECE2">${icon('x', { size: 14, color: 'var(--ink-soft)' })}</button>
      </div>
      ${options.length === 0 ? emptyNoteHtml('Aucun autre dragon adulte disponible.') : `
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
    <h3 class="font-display font-bold text-sm mb-1" style="color:var(--ink)">Laboratoire</h3>
    <p class="font-body font-semibold fs-11 mb-3" style="color:var(--ink-soft)">Associe deux dragons adultes pour obtenir un œuf inattendu — parfois même légendaire. Unis deux légendaires, et le mythique n'est plus tout à fait hors de portée.</p>
    ${eligible.length < 2 && !(a && b) ? emptyNoteHtml('Il te faut au moins 2 dragons adultes, non occupés, pour tenter un élevage.') : ''}
    ${pickerHtml}
    <div class="grid grid-cols-2 gap-3 mb-3">${slotHtml(a, 'a')}${slotHtml(b, 'b')}</div>
    <button data-action="breed-dragons" ${canBreed ? '' : 'disabled'} class="w-full font-display font-bold text-sm py-3 rounded-2xl flex items-center justify-center gap-2" style="background:${canBreed ? 'var(--gold)' : '#D8CFC0'};color:var(--ink)">
      ${onCooldown ? `Disponible dans ${fmtCountdown(cooldownLeft)}` : `${coinIconHtml()} Élever (${BREED_COST})`}
    </button>
  </div>`;
}

/* =========================================================================
   ÉCRAN — RÉGLAGES
   ========================================================================= */

function renderScreenReglages() {
  ui.reglagesName = state.gardienName;
  document.getElementById('screen-root').innerHTML = `
  <div class="flex-1 overflow-y-auto px-4 pb-4">
    <h3 class="font-display font-bold text-sm mb-3" style="color:var(--ink)">Réglages</h3>

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <label class="font-body font-bold fs-11 block mb-1\\.5" style="margin-bottom:6px;color:var(--ink-soft)">Nom du Gardien</label>
      <div class="flex gap-2">
        <input id="reglages-name-input" data-bind="reglages-name" value="${escapeHtml(state.gardienName)}" maxlength="16" aria-label="Nom du Gardien" autocomplete="given-name" class="flex-1 font-body font-bold rounded-xl px-3 py-2" style="background:var(--sky);color:var(--ink)"/>
        <button data-action="save-name" class="font-display font-bold text-xs px-3 rounded-xl" style="background:var(--gold);color:var(--ink)">OK</button>
      </div>
    </div>

    ${titlePickerCardHtml()}

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-11 mb-2" style="color:var(--ink-soft)">Mode de jeu</div>
      <div class="flex gap-2">
        <button data-action="change-mode" data-mode="eclosion" aria-pressed="${state.mode === 'eclosion'}" class="flex-1 rounded-xl py-2\\.5 flex flex-col items-center" style="padding:10px 0;background:${state.mode === 'eclosion' ? 'var(--gold)' : 'var(--sky)'}">
          <span class="font-display font-bold text-sm" style="color:var(--ink)">Éclosion</span>
          <span class="font-display font-bold fs-10" style="color:${state.mode === 'eclosion' ? 'var(--ink)' : 'var(--ink-soft)'}">10+</span>
        </button>
        <button data-action="change-mode" data-mode="stratege" aria-pressed="${state.mode === 'stratege'}" class="flex-1 rounded-xl py-2\\.5 flex flex-col items-center" style="padding:10px 0;background:${state.mode === 'stratege' ? 'var(--gold)' : 'var(--sky)'}">
          <span class="font-display font-bold text-sm" style="color:var(--ink)">Stratège</span>
          <span class="font-display font-bold fs-10" style="color:${state.mode === 'stratege' ? 'var(--ink)' : 'var(--ink-soft)'}">14+</span>
        </button>
      </div>
      <p class="font-body fs-11 mt-2 leading-relaxed" style="color:var(--ink-soft)">Ta collection est commune aux deux modes. Stratège ajoute les équipes d'expédition et le tempérament des dragons.</p>
    </div>

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-13 mb-1" style="color:var(--ink)">Préférences</div>
      ${preferenceRowHtml('toggle-parental-lock', state.parentalLock, 'Verrouillage parental', "Protège l'accès aux réglages par une question simple.")}
      ${preferenceRowHtml('toggle-reduce-vibrations', state.reduceVibrations, 'Réduire les vibrations', 'Désactive le retour haptique (éclosion, déverrouillage, récompenses).')}
      ${preferenceRowHtml('toggle-sound', state.soundEnabled, 'Sons', "Petites mélodies pour l'éclosion, les soins et les récompenses.")}
      ${preferenceRowHtml('toggle-gentle-animations', state.gentleAnimations, 'Animations douces', "Réduit l'intensité des rebonds des dragons, sans les désactiver complètement.", true)}
    </div>

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-13 mb-1" style="color:var(--ink)">Sauvegarde</div>
      <p class="font-body fs-11 leading-relaxed mb-3" style="color:var(--ink-soft)">Exporte un fichier pour garder ta progression avant une mise à jour, ou importe-le pour la restaurer.</p>
      <div class="flex gap-2">
        <button data-action="export-save" class="flex-1 flex items-center justify-center gap-1.5 font-display font-bold text-xs py-2.5 rounded-xl" style="padding:10px 0;background:var(--sky);color:var(--ink)">${icon('download', { size: 14 })} Exporter</button>
        <button data-action="import-save-trigger" class="flex-1 flex items-center justify-center gap-1.5 font-display font-bold text-xs py-2.5 rounded-xl" style="padding:10px 0;background:var(--sky);color:var(--ink)">${icon('upload', { size: 14 })} Importer</button>
      </div>
      <input type="file" id="import-save-input" accept="application/json,.json" style="display:none" aria-hidden="true"/>
    </div>

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-13 mb-2" style="color:var(--ink)">Statistiques</div>
      ${statRowHtml('Dragons actuels', state.dragons.length)}
      ${statRowHtml('Œufs éclos au total', state.statsEggsHatched || 0)}
      ${statRowHtml('Expéditions terminées', state.statsExpeditionsCompleted || 0)}
      ${statRowHtml('Élevages réussis', state.statsBredCount || 0)}
      ${statRowHtml('Meilleure série de connexion', `${state.longestStreak || 0} jour${(state.longestStreak || 0) > 1 ? 's' : ''}`)}
      ${statRowHtml('Élément favori', favoriteElementLabel(), true)}
    </div>

    ${expeditionLogCardHtml()}

    <div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
      <div class="font-body font-bold fs-13 mb-1" style="color:var(--ink)">À propos</div>
      <p class="font-body fs-11 leading-relaxed" style="color:var(--ink-soft)">Lumidra ne contient aucune publicité, aucune messagerie libre entre joueurs, et se joue sans connexion (hors polices). Version HTML autonome.</p>
    </div>

    <button data-action="request-reset" class="w-full flex items-center justify-center gap-2 font-display font-bold text-xs py-3 rounded-2xl" style="background:#FBEAE4;color:#B5502C">${icon('rotate-ccw', { size: 14 })} Réinitialiser ma progression</button>
  </div>`;
}


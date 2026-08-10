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
  else if (name === 'carte') renderScreenCarte({ resetScroll: true });
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

const SCOUT_MAX_TAPS = 3;
const SCOUT_BONUS_PER_TAP = 5;
function scoutTap() {
  if (ui.carte.scoutTaps >= SCOUT_MAX_TAPS) return;
  if (!ui.carte.scoutStartedAt) return;
  if (hatchTimingIsBonus(ui.carte.scoutStartedAt)) {
    ui.carte.scoutBonusPct = Math.min(SCOUT_MAX_TAPS * SCOUT_BONUS_PER_TAP, ui.carte.scoutBonusPct + SCOUT_BONUS_PER_TAP);
    haptic(20);
  } else {
    haptic(10);
  }
  ui.carte.scoutTaps += 1;
  renderScreenCarte();
}

function createDragon(speciesId) {
  return {
    id: uid('drg'), speciesId, stage: 'bebe', careCount: 0, lastCareAt: 0,
    temperament: TEMPERAMENTS[randInt(0, 3)], bornAt: Date.now(),
    customName: null, favorite: false, hatId: null, collarId: null, charmId: null,
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
  const scoutBonusPct = ui.carte.scoutBonusPct || 0;
  const newExp = { id: uid('exp'), zoneId, typeId, dragonIds, startAt: Date.now(), endAt: Date.now() + type.seconds * 1000, scoutBonusPct };
  state.expeditions.push(newExp);
  scheduleExpeditionNotification(newExp);
  bumpQuestProgress('expedition', 1);
  saveStateDebounced();
  showToast(scoutBonusPct > 0 ? t('toast.expeditionLaunchedScouted', { n: scoutBonusPct }) : t('toast.expeditionLaunched'));
  ui.carte = { view: 'zones', zoneId: null, typeId: null, teamIds: [], scoutTaps: 0, scoutBonusPct: 0 };
  if (ui.screen === 'carte') renderScreenCarte({ resetScroll: true });
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
  if (exp.scoutBonusPct) ecaillesGain = Math.round(ecaillesGain * (1 + exp.scoutBonusPct / 100));
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

function buyAccessory(accId) {
  const acc = accessoryById(accId);
  if (!acc || state.accessoriesOwned.includes(accId) || state.ecailles < acc.cost) return;
  state.ecailles -= acc.cost;
  state.accessoriesOwned.push(accId);
  saveStateDebounced();
  showToast(t('toast.accessoryBought', { name: acc.name }));
  haptic(25);
  renderTopBar();
  renderScreenBoutique();
}

// Équipe/déséquipe un accessoire sur UN dragon précis (jamais partagé entre dragons).
// Passer accId=null déséquipe l'emplacement.
function equipAccessory(dragonId, slot, accId) {
  const d = state.dragons.find(dd => dd.id === dragonId);
  if (!d) return;
  if (accId && !state.accessoriesOwned.includes(accId)) return;
  if (slot === 'hat') d.hatId = accId || null;
  else if (slot === 'collar') d.collarId = accId || null;
  else if (slot === 'charm') d.charmId = accId || null;
  saveStateDebounced();
  haptic(15);
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
  normalizeDecorSlots();
  const idx = state.decorEquipped.indexOf(decorId);
  if (idx !== -1) {
    state.decorEquipped[idx] = null;
    saveStateDebounced();
    renderScreenBoutique();
    return;
  }
  const freeIdx = state.decorEquipped.indexOf(null);
  if (freeIdx === -1) { showToast(t('toast.maxDecor')); return; }
  state.decorEquipped[freeIdx] = decorId;
  saveStateDebounced();
  renderScreenBoutique();
}

// Assigne (ou retire, si decorId est null) une pièce à un emplacement précis de l'étagère du
// sanctuaire. Une même pièce ne peut occuper qu'un seul emplacement à la fois.
function setDecorSlot(index, decorId) {
  normalizeDecorSlots();
  if (decorId && !state.decorOwned.includes(decorId)) return;
  if (decorId) {
    const dupIdx = state.decorEquipped.indexOf(decorId);
    if (dupIdx !== -1 && dupIdx !== index) state.decorEquipped[dupIdx] = null;
  }
  state.decorEquipped[index] = decorId || null;
  saveStateDebounced();
  haptic(15);
  ui.decorSlotPickerIndex = null;
  renderModals();
  if (ui.screen === 'sanctuaire') renderScreenSanctuaire();
}

function doReset() {
  state.expeditions.forEach(exp => cancelExpeditionNotification(exp.id));
  state = freshDefaultState();
  document.body.classList.remove('gentle-fx');
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { warnSaveFailureOnce(); }
  ui.screen = 'sanctuaire';
  ui.confirmResetOpen = false;
  ui.carte = { view: 'zones', zoneId: null, typeId: null, teamIds: [], scoutTaps: 0, scoutBonusPct: 0 };
  renderAll();
}


/* =========================================================================
   LUMIDRA — application (état, rendu, événements) — aucune dépendance
   ========================================================================= */

/* =========================================================================
   LUMIDRA — sons (synthétisés, aucun fichier externe requis)
   ========================================================================= */

let audioCtx = null;
function getAudioCtx() {
  if (!state.soundEnabled) return null;
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  if (audioCtx.state === 'suspended') { try { audioCtx.resume(); } catch (e) {} }
  return audioCtx;
}

function playTone(freq, duration, opts) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  opts = opts || {};
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    const vol = opts.volume != null ? opts.volume : 0.1;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  } catch (e) { /* audio indisponible : silencieux */ }
}

function playCareSound() { playTone(520, 0.12, { type: 'sine', volume: 0.09 }); }
function playCoinSound() {
  playTone(880, 0.09, { type: 'triangle', volume: 0.08 });
  setTimeout(() => playTone(1180, 0.1, { type: 'triangle', volume: 0.07 }), 70);
}
function playHatchSound() {
  [660, 880, 1180, 1480].forEach((f, i) => setTimeout(() => playTone(f, 0.16, { type: 'sine', volume: 0.1 }), i * 90));
}
function playAchievementSound() {
  [520, 660, 880].forEach((f, i) => setTimeout(() => playTone(f, 0.18, { type: 'triangle', volume: 0.09 }), i * 100));
}

/* =========================================================================
   LUMIDRA — objectifs quotidiens & succès
   ========================================================================= */

const QUEST_POOL = [
  { type: 'soin', descFr: 'Soigne 3 dragons', descEn: 'Care for 3 dragons', target: 3, reward: 25 },
  { type: 'expedition', descFr: 'Lance 1 expédition', descEn: 'Launch 1 expedition', target: 1, reward: 20 },
  { type: 'eclosion', descFr: 'Fais éclore 1 œuf', descEn: 'Hatch 1 egg', target: 1, reward: 30 },
  { type: 'collecte', descFr: 'Gagne 60 écailles en expédition', descEn: 'Earn 60 scales from expeditions', target: 60, reward: 20 },
];

const WEEKLY_POOL = [
  { type: 'expedition', descFr: 'Termine 8 expéditions cette semaine', descEn: 'Complete 8 expeditions this week', target: 8, reward: 100 },
  { type: 'soin', descFr: 'Soigne 15 dragons cette semaine', descEn: 'Care for 15 dragons this week', target: 15, reward: 90 },
  { type: 'eclosion', descFr: 'Fais éclore 5 œufs cette semaine', descEn: 'Hatch 5 eggs this week', target: 5, reward: 110 },
  { type: 'collecte', descFr: 'Gagne 400 écailles en expédition cette semaine', descEn: 'Earn 400 scales from expeditions this week', target: 400, reward: 80 },
];

const ACHIEVEMENTS = [
  { id: 'premier-envol', nameFr: 'Premier Envol', nameEn: 'First Flight', descFr: 'Fais éclore ton premier dragon.', descEn: 'Hatch your first dragon.', reward: 20, target: 1, progress: (s) => Math.min(1, s.dragons.length) },
  { id: 'petite-tribu', nameFr: 'Petite Tribu', nameEn: 'Small Tribe', descFr: 'Élève 5 dragons.', descEn: 'Raise 5 dragons.', reward: 40, target: 5, progress: (s) => Math.min(5, s.dragons.length) },
  { id: 'grande-tribu', nameFr: 'Grande Tribu', nameEn: 'Large Tribe', descFr: 'Élève 10 dragons.', descEn: 'Raise 10 dragons.', reward: 80, target: 10, progress: (s) => Math.min(10, s.dragons.length) },
  { id: 'collectionneur', nameFr: 'Collectionneur', nameEn: 'Collector', descFr: 'Découvre 10 espèces.', descEn: 'Discover 10 species.', reward: 60, target: 10, progress: (s) => Math.min(10, s.discovered.length) },
  { id: 'maitre-gardien', nameFr: 'Maître Gardien', nameEn: 'Master Guardian', descFr: 'Découvre toutes les espèces.', descEn: 'Discover every species.', reward: 200, target: SPECIES.length, progress: (s) => Math.min(SPECIES.length, s.discovered.length) },
  { id: 'explorateur', nameFr: 'Explorateur', nameEn: 'Explorer', descFr: 'Termine 5 expéditions.', descEn: 'Complete 5 expeditions.', reward: 50, target: 5, progress: (s) => Math.min(5, s.statsExpeditionsCompleted || 0) },
  { id: 'grand-explorateur', nameFr: 'Grand Explorateur', nameEn: 'Great Explorer', descFr: 'Termine 20 expéditions.', descEn: 'Complete 20 expeditions.', reward: 120, target: 20, progress: (s) => Math.min(20, s.statsExpeditionsCompleted || 0) },
  { id: 'legende-vivante', nameFr: 'Légende Vivante', nameEn: 'Living Legend', descFr: 'Élève un dragon légendaire.', descEn: 'Raise a legendary dragon.', reward: 150, target: 1, progress: (s) => (s.dragons.some(d => speciesById(d.speciesId).variant === 4) ? 1 : 0) },
  { id: 'decorateur', nameFr: 'Décorateur', nameEn: 'Decorator', descFr: 'Possède 3 décorations.', descEn: 'Own 3 decorations.', reward: 30, target: 3, progress: (s) => Math.min(3, s.decorOwned.length) },
  { id: 'genetique', nameFr: 'Éleveur', nameEn: 'Breeder', descFr: 'Réussis 3 élevages au Laboratoire.', descEn: 'Succeed at 3 breedings in the Laboratory.', reward: 60, target: 3, progress: (s) => Math.min(3, s.statsBredCount || 0) },
  { id: 'grand-eleveur', nameFr: 'Grand Éleveur', nameEn: 'Great Breeder', descFr: 'Réussis 10 élevages au Laboratoire.', descEn: 'Succeed at 10 breedings in the Laboratory.', reward: 150, target: 10, progress: (s) => Math.min(10, s.statsBredCount || 0) },
  { id: 'legendes-completes', nameFr: 'Cercle des Légendes', nameEn: 'Circle of Legends', descFr: 'Découvre les 6 dragons légendaires.', descEn: 'Discover all 6 legendary dragons.', reward: 250, target: 6, progress: (s) => Math.min(6, s.discovered.filter(id => speciesById(id).variant === 4).length) },
  { id: 'au-dela-des-legendes', nameFr: 'Au-delà des Légendes', nameEn: 'Beyond Legends', descFr: 'Élève un dragon mythique.', descEn: 'Raise a mythic dragon.', reward: 300, target: 1, progress: (s) => (s.dragons.some(d => speciesById(d.speciesId).variant === 5) ? 1 : 0) },
  { id: 'immense-tribu', nameFr: 'Immense Tribu', nameEn: 'Immense Tribe', descFr: 'Élève 20 dragons.', descEn: 'Raise 20 dragons.', reward: 150, target: 20, progress: (s) => Math.min(20, s.dragons.length) },
  { id: 'marathon-explorateur', nameFr: 'Explorateur Infatigable', nameEn: 'Tireless Explorer', descFr: 'Termine 50 expéditions.', descEn: 'Complete 50 expeditions.', reward: 200, target: 50, progress: (s) => Math.min(50, s.statsExpeditionsCompleted || 0) },
  { id: 'pantheon-mythique', nameFr: 'Panthéon Mythique', nameEn: 'Mythic Pantheon', descFr: 'Élève les 6 dragons mythiques.', descEn: 'Raise all 6 mythic dragons.', reward: 500, target: 6, progress: (s) => Math.min(6, s.discovered.filter(id => speciesById(id).variant === 5).length) },
];

// Titres cosmétiques débloqués par certains succès, affichables sous le nom du Gardien.
const TITLES = [
  { id: 'petite-tribu', nameFr: 'Éleveur', nameEn: 'Breeder' },
  { id: 'grand-explorateur', nameFr: 'Grand Explorateur', nameEn: 'Great Explorer' },
  { id: 'collectionneur', nameFr: 'Collectionneur', nameEn: 'Collector' },
  { id: 'legende-vivante', nameFr: 'Ami des Légendes', nameEn: 'Friend of Legends' },
  { id: 'maitre-gardien', nameFr: 'Maître Gardien Suprême', nameEn: 'Supreme Master Guardian' },
  { id: 'legendes-completes', nameFr: 'Cercle des Légendes', nameEn: 'Circle of Legends' },
  { id: 'au-dela-des-legendes', nameFr: 'Élu des Mythes', nameEn: 'Chosen of Myths' },
  { id: 'grand-eleveur', nameFr: 'Maître Éleveur', nameEn: 'Master Breeder' },
  { id: 'pantheon-mythique', nameFr: 'Gardien du Voile Éternel', nameEn: 'Guardian of the Eternal Veil' },
];

function unlockedTitles() {
  return TITLES.filter(t => state.achievementsClaimed.includes(t.id));
}

function currentTitleName() {
  if (!state.selectedTitle) return null;
  const t = TITLES.find(tt => tt.id === state.selectedTitle);
  return t && state.achievementsClaimed.includes(t.id) ? t.name : null;
}

function todayDateStr() { return new Date().toISOString().slice(0, 10); }
function weekKeyStr() { return `w${Math.floor(Date.now() / 86400000 / 7)}`; }

function ensureDailyQuests() {
  if (state.dailyQuests && state.dailyQuests.date === todayDateStr()) return;
  const pool = QUEST_POOL.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
  }
  const picked = pool.slice(0, 3).map(q => ({ id: q.type, type: q.type, desc: (state.language === 'en' ? q.descEn : q.descFr), target: q.target, reward: q.reward, progress: 0, claimed: false }));
  state.dailyQuests = { date: todayDateStr(), quests: picked };
  saveStateDebounced();
}

function ensureWeeklyChallenge() {
  const wk = weekKeyStr();
  if (state.weeklyChallenge && state.weeklyChallenge.weekKey === wk) return;
  const pick = WEEKLY_POOL[randInt(0, WEEKLY_POOL.length - 1)];
  state.weeklyChallenge = { weekKey: wk, type: pick.type, desc: (state.language === 'en' ? pick.descEn : pick.descFr), target: pick.target, reward: pick.reward, progress: 0, claimed: false };
  saveStateDebounced();
}

function claimWeeklyChallenge() {
  const w = state.weeklyChallenge;
  if (!w || w.claimed || w.progress < w.target) return;
  w.claimed = true;
  state.ecailles += w.reward;
  addPassPoints(35);
  saveStateDebounced();
  showToast(t('toast.weeklyChallengeDone', { n: w.reward }), 'milestone');
  haptic([30, 40, 60]);
  playAchievementSound();
  renderTopBar();
  if (ui.screen === 'sanctuaire') renderScreenSanctuaire();
}

// Bonus de connexion quotidienne : compte les jours consécutifs et récompense en écailles.
// Retourne { streak, bonus, milestone, milestoneBonus } le jour où un nouveau bonus est accordé, sinon null.
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 150, 200, 365];
function checkLoginStreak() {
  const today = todayDateStr();
  if (state.lastLoginDate === today) return null;
  if (state.lastLoginDate) {
    const prevDate = new Date(state.lastLoginDate + 'T00:00:00Z');
    const todayDate = new Date(today + 'T00:00:00Z');
    const diffDays = Math.round((todayDate - prevDate) / 86400000);
    state.loginStreak = diffDays === 1 ? (state.loginStreak || 0) + 1 : 1;
  } else {
    state.loginStreak = 1;
  }
  state.longestStreak = Math.max(state.longestStreak || 0, state.loginStreak);
  const bonus = 10 + Math.min(state.loginStreak, 10) * 2;
  const milestone = STREAK_MILESTONES.includes(state.loginStreak);
  const milestoneBonus = milestone ? state.loginStreak * 5 : 0;
  state.ecailles += bonus + milestoneBonus;
  addPassPoints(5 + (milestone ? 20 : 0));
  state.lastLoginDate = today;
  saveStateDebounced();
  return { streak: state.loginStreak, bonus, milestone, milestoneBonus };
}

// Prochain palier de série non encore atteint (pour l'affichage "encore N jours").
function nextStreakMilestone() {
  return STREAK_MILESTONES.find(m => m > (state.loginStreak || 0)) || null;
}

function bumpQuestProgress(type, amount) {
  let changed = false;
  if (state.dailyQuests) {
    const q = state.dailyQuests.quests.find(qq => qq.type === type && !qq.claimed);
    if (q) { q.progress = Math.min(q.target, q.progress + amount); changed = true; }
  }
  if (state.weeklyChallenge && state.weeklyChallenge.type === type && !state.weeklyChallenge.claimed) {
    state.weeklyChallenge.progress = Math.min(state.weeklyChallenge.target, state.weeklyChallenge.progress + amount);
    changed = true;
  }
  if (changed) saveStateDebounced();
}

function claimDailyQuest(questId) {
  if (!state.dailyQuests) return;
  const q = state.dailyQuests.quests.find(qq => qq.id === questId);
  if (!q || q.claimed || q.progress < q.target) return;
  q.claimed = true;
  state.ecailles += q.reward;
  addPassPoints(8);
  showToast(t('toast.questReward', { n: q.reward }));
  haptic(30);
  playCoinSound();
  // Bonus "combo" quand les 3 quêtes du jour sont réclamées (une seule fois par jour).
  const allClaimed = state.dailyQuests.quests.every(qq => qq.claimed);
  if (allClaimed && !state.dailyQuests.comboClaimed) {
    state.dailyQuests.comboClaimed = true;
    const comboBonus = Math.round(state.dailyQuests.quests.reduce((sum, qq) => sum + qq.reward, 0) * 0.5);
    state.ecailles += comboBonus;
    setTimeout(() => showToast(t('toast.dailyComboBonus', { n: comboBonus }), 'milestone'), 900);
  }
  saveStateDebounced();
  renderTopBar();
  if (ui.screen === 'sanctuaire') renderScreenSanctuaire();
}

function claimAchievement(id) {
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach || state.achievementsClaimed.includes(id)) return;
  if (ach.progress(state) < ach.target) return;
  state.achievementsClaimed.push(id);
  state.ecailles += ach.reward;
  addPassPoints(15);
  saveStateDebounced();
  showToast(t('toast.achievementUnlocked', { name: ach.name, n: ach.reward }), 'milestone');
  haptic([30, 40, 60]);
  playAchievementSound();
  renderTopBar();
  if (ui.screen === 'dragondex') renderScreenDragondex();
}

/* ---- état persistant + état d'interface transitoire ---- */
let state = freshDefaultState();
let saveWasCorrupted = false; // signalé une fois au joueur au démarrage si la sauvegarde était illisible, jamais persisté
let saveFailureWarned = false; // signalé une seule fois par session si l'écriture de sauvegarde échoue (quota plein, mode privé...)
let now = Date.now();

const ui = {
  screen: 'sanctuaire',          // sanctuaire | dragondex | carte | boutique | reglages | labo
  hatchFlow: null,               // { egg, taps, revealedDragon }
  detailDragonId: null,
  releaseConfirmId: null,
  detailSpecies: null,           // { species, discovered }
  lockChallenge: null,           // { a, b, answer, onSuccessScreen }
  confirmResetOpen: false,
  pendingImport: null,           // état en attente de confirmation d'import
  confirmImportOpen: false,
  toast: null,
  dragondexFilter: 'tous',
  dragondexSearch: '',
  dragondexRarityFilter: 'tous',
  onboarding: { name: '', mode: 'eclosion' },
  reglagesName: '',
  carte: { view: 'zones', zoneId: null, typeId: null, teamIds: [] },
  sanctuaireSort: 'recent',
  sanctuaireSearch: '',
  objectivesBannerCollapsed: true,
  expeditionLogCollapsed: true,
  tutorialStep: null,
  labo: { parentAId: null, parentBId: null, picking: null },
  guardianPathOpen: false,
  rivalModalOpen: false,
  decorSlotPickerIndex: null,
};

let toastTimer = null;
let saveTimer = null;

function haptic(pattern) {
  if (state.reduceVibrations) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* API absente ou refusée : silencieux, ne casse rien */ }
}

/* ---- persistance (localStorage) ---- */
function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = Object.assign(freshDefaultState(), parsed);
    }
  } catch (e) {
    // Sauvegarde illisible (fichier corrompu) : on repart proprement plutôt que de planter,
    // mais le joueur doit être prévenu — perdre sa partie sans un mot serait pire que l'erreur elle-même.
    saveWasCorrupted = true;
  }
}
function saveStateDebounced() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      // Stockage indisponible (quota plein, navigation privée...) : la partie continue en mémoire,
      // mais le joueur risque de perdre sa progression à la fermeture — un seul avertissement par
      // session suffit à le prévenir sans matraquer un toast à chaque action.
      warnSaveFailureOnce();
    }
  }, 300);
}
function warnSaveFailureOnce() {
  if (saveFailureWarned) return;
  saveFailureWarned = true;
  if (typeof showToast === 'function') showToast(t('toast.saveFailed'));
}

/* ---- export / import de la sauvegarde (fichier .json) ----
   Permet de conserver sa progression d'une mise à jour du fichier HTML à l'autre :
   on exporte un fichier .json depuis l'ancienne version, on l'importe dans la nouvelle. */

const SAVE_FILE_FORMAT_VERSION = 1;

function buildSaveFileContents() {
  return JSON.stringify({
    app: 'lumidra',
    formatVersion: SAVE_FILE_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  }, null, 2);
}

async function exportSave() {
  const contents = buildSaveFileContents();
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `lumidra-sauvegarde-${dateStr}.json`;

  // Dans l'app native (Capacitor), un lien de téléchargement classique ne marche pas :
  // la WebView n'a pas de gestionnaire de téléchargements comme un vrai navigateur.
  // On écrit un vrai fichier via Filesystem, puis on ouvre le partage natif pour que
  // le joueur choisisse où l'enregistrer (Drive, Fichiers, e-mail...) — un endroit qu'il
  // pourra retrouver, contrairement à un téléchargement silencieux qui disparaissait.
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()
      && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem && window.Capacitor.Plugins.Share) {
    try {
      const { Filesystem } = window.Capacitor.Plugins;
      const written = await Filesystem.writeFile({ path: fileName, data: contents, directory: 'CACHE', encoding: 'utf8' });
      await window.Capacitor.Plugins.Share.share({
        title: 'Sauvegarde Lumidra',
        text: 'Ta sauvegarde Lumidra',
        url: written.uri,
        dialogTitle: 'Enregistrer ou partager ta sauvegarde',
      });
      showToast(t('toast.exportChooseDestination'));
    } catch (e) {
      showToast(t('toast.exportFailed'));
    }
    return;
  }

  // Navigateur / PWA web classique : le téléchargement direct fonctionne normalement.
  try {
    const blob = new Blob([contents], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(t('toast.exportSuccess'));
  } catch (e) {
    showToast(t('toast.exportFailed'));
  }
}

// Vérifie grossièrement qu'un objet importé ressemble bien à un état Lumidra valide,
// pour éviter d'écraser la progression actuelle avec un fichier invalide ou corrompu.
function looksLikeValidState(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (!Array.isArray(obj.dragons)) return false;
  if (!Array.isArray(obj.discovered)) return false;
  if (typeof obj.xp !== 'number') return false;
  if (typeof obj.ecailles !== 'number') return false;
  return true;
}

function handleImportedFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      // Le fichier peut être soit une enveloppe { app, formatVersion, state }, soit un état brut.
      const candidate = (parsed && typeof parsed === 'object' && parsed.state) ? parsed.state : parsed;
      if (!looksLikeValidState(candidate)) {
        showToast(t('toast.importInvalid'));
        return;
      }
      ui.pendingImport = candidate;
      ui.confirmImportOpen = true;
      renderModals();
    } catch (e) {
      showToast(t('toast.importUnreadable'));
    }
  };
  reader.onerror = () => showToast(t('toast.importReadError'));
  reader.readAsText(file);
}

function applyPendingImport() {
  if (!ui.pendingImport) return;
  // Object.assign avec DEFAULT_STATE en base : si la nouvelle version du jeu a ajouté
  // des champs qui n'existaient pas dans l'ancienne sauvegarde, ils gardent leur valeur par défaut.
  state = Object.assign(freshDefaultState(), ui.pendingImport);
  document.body.classList.toggle('gentle-fx', !!state.gentleAnimations);
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { warnSaveFailureOnce(); }
  ui.pendingImport = null;
  ui.confirmImportOpen = false;
  ui.screen = 'sanctuaire';
  ui.carte = { view: 'zones', zoneId: null, typeId: null, teamIds: [] };
  renderAll();
  showToast(t('toast.importSuccess'));
}

/* ---- petites briques HTML réutilisées ---- */

function coinIconHtml() {
  return `<svg width="15" height="15" viewBox="0 0 15 15"><defs><radialGradient id="coingrad" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#F5D888"/><stop offset="100%" stop-color="#EDA23C"/></radialGradient></defs><circle cx="7.5" cy="7.5" r="7" fill="url(#coingrad)" stroke="#C97A1F" stroke-width="0.6"/></svg>`;
}

function elementChipHtml(elKey) {
  const c = ELEMENTS[elKey];
  return `<span class="inline-flex items-center gap-1 font-body font-bold fs-11 px-2 py-0.5 rounded-full" style="background:${c.light}77;color:${c.deep}">${icon(c.icon, { size: 11 })} ${c.name}</span>`;
}

// Classe CSS d'aura à poser sur une carte dragon selon sa rareté (voir style.css .dragon-card / .dragon-aura-N).
function rarityCardClass(variant) {
  return variant >= 2 ? `dragon-card dragon-aura-${variant}` : 'dragon-card';
}

// Petit halo chaleureux et discret, indépendant de la rareté : marque les dragons au lien
// le plus profond (palier 3), qu'ils soient communs ou légendaires — récompense de fidélité,
// pas de puissance.
function dragonCardClass(dragon) {
  const species = speciesById(dragon.speciesId);
  const base = rarityCardClass(species.variant);
  return bondTier(dragon) === 3 ? base + ' dragon-bond-max' : base;
}

// Génère un burst de particules (spans absolus) pour une révélation d'œuf légendaire/mythique.
// À placer dans un conteneur position:relative (voir hatchModalHtml).
function sparkBurstHtml(variant) {
  const mythic = variant === 5;
  const count = mythic ? 16 : 10;
  const palette = mythic ? ['#FF6FA5', '#6FA8E0', '#7CE0A0', '#F5D76E'] : ['var(--gold)'];
  let out = '';
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.35 - 0.175);
    const dist = 65 + Math.random() * 55;
    const sx = Math.round(Math.cos(angle) * dist);
    const sy = Math.round(Math.sin(angle) * dist);
    const delay = Math.round(Math.random() * 160);
    const color = palette[i % palette.length];
    out += `<span class="spark-burst" style="--sx:${sx}px;--sy:${sy}px;animation-delay:${delay}ms;background:${color};box-shadow:0 0 8px 2px ${color}"></span>`;
  }
  return out;
}

function rarityStarsHtml(variant) {
  const n = RARITY_STARS[variant];
  let stars = '';
  for (let i = 0; i < 3; i++) {
    stars += icon('star', { size: 11, color: i < n ? 'var(--gold)' : '#D8CFC0' });
  }
  const mythicMark = variant === 5 ? ' <span style="color:var(--gold-deep)">✦</span>' : '';
  return `<span class="inline-flex items-center gap-0.5">${stars}${mythicMark}<span class="font-body font-bold fs-11 ml-0.5" style="color:${variant === 5 ? 'var(--gold-deep)' : 'var(--ink-soft)'}">${RARITY_LABEL[variant]}</span></span>`;
}

function emptyNoteHtml(text) {
  return `<div class="text-center py-8 font-body font-semibold text-sm" style="color:var(--ink-soft)">${escapeHtml(text)}</div>`;
}

function statBarHtml(label, value) {
  const displayValue = Math.min(100, value);
  const qual = value >= 70 ? 'Excellent' : value >= 40 ? 'Suffisant' : 'Faible';
  return `<div class="mb-1.5">
    <div class="flex justify-between font-body font-bold fs-11" style="color:var(--ink-soft)"><span>${label}</span><span>${qual}</span></div>
    <div class="w-full h-1\\.5 rounded-full overflow-hidden" style="background:#EEE6D8;height:6px;">
      <div class="h-full rounded-full" style="width:${displayValue}%;background:var(--gold)"></div>
    </div>
  </div>`;
}

function titlePickerCardHtml() {
  const unlocked = unlockedTitles();
  if (unlocked.length === 0) return '';
  const chips = [{ id: null, name: 'Aucun' }, ...unlocked].map(t => {
    const active = state.selectedTitle === t.id;
    return `<button data-action="select-title" data-title-id="${t.id || ''}" aria-pressed="${active}" class="font-body font-bold fs-11 rounded-full shrink-0" style="padding:6px 12px;background:${active ? 'var(--gold)' : 'var(--sky)'};color:var(--ink)">${escapeHtml(t.name)}</button>`;
  }).join('');
  return `<div class="rounded-2xl p-4 mb-3" style="background:var(--parchment)">
    <div class="font-body font-bold fs-11 mb-2" style="color:var(--ink-soft)">Titre</div>
    <div class="flex gap-2 overflow-x-auto pb-1">${chips}</div>
  </div>`;
}

function toggleHtml(action, checked) {
  return `<button data-action="${action}" class="w-11 h-6 rounded-full relative shrink-0" style="background:${checked ? 'var(--gold)' : '#D8CFC0'}">
    <span class="rounded-full bg-white" style="position:absolute;top:2px;width:20px;height:20px;left:${checked ? '22px' : '2px'};transition:left .15s ease;"></span>
  </button>`;
}

function preferenceRowHtml(action, checked, title, desc, last) {
  return `<div class="flex items-center justify-between gap-3" style="padding:11px 0;${last ? '' : 'border-bottom:1px solid #EEE6D8'}">
    <div>
      <div class="font-body font-bold fs-12" style="color:var(--ink)">${title}</div>
      <div class="font-body fs-10" style="color:var(--ink-soft)">${desc}</div>
    </div>
    ${toggleHtml(action, checked)}
  </div>`;
}

function statRowHtml(label, value, last) {
  return `<div class="flex items-center justify-between" style="padding:5px 0;${last ? '' : 'border-bottom:1px solid #EEE6D8'}">
    <span class="font-body fs-12" style="color:var(--ink-soft)">${escapeHtml(label)}</span>
    <span class="font-display font-bold fs-12" style="color:var(--ink)">${escapeHtml(String(value))}</span>
  </div>`;
}

function favoriteElementLabel() {
  if (state.dragons.length === 0) return '—';
  const counts = {};
  state.dragons.forEach(d => {
    const el = speciesById(d.speciesId).element;
    counts[el] = (counts[el] || 0) + 1;
  });
  let best = null, bestCount = 0;
  Object.keys(counts).forEach(el => { if (counts[el] > bestCount) { best = el; bestCount = counts[el]; } });
  return best ? ELEMENTS[best].name : '—';
}

function expeditionLogCardHtml() {
  const log = state.expeditionLog || [];
  if (log.length === 0) return '';
  if (ui.expeditionLogCollapsed) {
    return `<button data-action="toggle-expedition-log" aria-expanded="false" class="mb-3 rounded-2xl w-full flex items-center gap-2" style="padding:12px 16px;background:var(--parchment)">
      <span class="flex-1 text-left font-body font-bold fs-13" style="color:var(--ink)">Journal des expéditions</span>
      ${icon('chevron-down', { size: 14, color: 'var(--ink-soft)' })}
    </button>`;
  }
  const rows = log.map(e => {
    const label = e.legendary ? '✨ Œuf légendaire !' : e.gotEgg ? 'Nouvel œuf' : 'Écailles seulement';
    const when = new Date(e.at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `<div class="flex items-center justify-between" style="padding:7px 0;border-bottom:1px solid #EEE6D8">
      <div>
        <div class="font-body font-bold fs-11" style="color:var(--ink)">${escapeHtml(e.zoneName)} · ${escapeHtml(e.typeName)}</div>
        <div class="font-body fs-10" style="color:var(--ink-soft)">${when} · ${label}</div>
      </div>
      <span class="font-display font-bold fs-11" style="color:var(--gold-deep)">+${e.ecailles}</span>
    </div>`;
  }).join('');
  return `<div class="mb-3 rounded-2xl p-4" style="background:var(--parchment)">
    <button data-action="toggle-expedition-log" aria-expanded="true" class="w-full flex items-center gap-2 mb-1" style="margin-bottom:6px">
      <span class="flex-1 text-left font-body font-bold fs-13" style="color:var(--ink)">Journal des expéditions</span>
      <span style="display:inline-flex;transform:rotate(180deg)">${icon('chevron-down', { size: 14, color: 'var(--ink-soft)' })}</span>
    </button>
    ${rows}
  </div>`;
}

/* ---- calculs dérivés ---- */

function busyDragonIds() {
  const busy = {};
  state.expeditions.forEach(e => e.dragonIds.forEach(id => { busy[id] = true; }));
  return busy;
}


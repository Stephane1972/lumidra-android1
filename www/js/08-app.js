/* =========================================================================
   MINUTEUR (comptes à rebours d'expédition et de soin)
   ========================================================================= */

setInterval(() => {
  now = Date.now();
  if (state.onboarded && ui.screen === 'carte') tickActiveExpeditions();
  if (ui.detailDragonId) {
    const prevSheet = document.querySelector('.modal-sheet');
    const prevSheetScrollTop = prevSheet ? prevSheet.scrollTop : 0;
    renderModals();
    const newSheet = document.querySelector('.modal-sheet');
    if (newSheet) newSheet.scrollTop = prevSheetScrollTop;
  }
}, 1000);

/* =========================================================================
   DÉLÉGATION D'ÉVÉNEMENTS
   ========================================================================= */

function dispatchAction(action, dataset, evt, el) {
  const dragonId = dataset.dragonId;
  const speciesId = dataset.speciesId;
  const zoneId = dataset.zoneId;
  const typeId = dataset.typeId;
  const decorId = dataset.decorId;
  const mode = dataset.mode;
  const lang = dataset.lang;
  const elementKey = dataset.element;
  const screenName = dataset.screen;
  const expId = dataset.expId;
  const tab = dataset.tab;

  switch (action) {
    case 'select-mode':
      ui.onboarding.mode = mode;
      renderOnboarding();
      break;
    case 'complete-onboarding':
      completeOnboarding();
      break;
    case 'open-settings':
      requestScreen('reglages');
      break;
    case 'nav':
      requestScreen(screenName);
      break;
    case 'open-boutique-collection':
      ui.boutiqueTab = 'collection';
      requestScreen('boutique');
      break;
    case 'open-decor-slot-picker':
      ui.decorSlotPickerIndex = Number(dataset.slotIndex);
      renderModals();
      break;
    case 'close-decor-slot-picker':
      ui.decorSlotPickerIndex = null;
      renderModals();
      break;
    case 'pick-decor-slot':
      setDecorSlot(Number(dataset.slotIndex), dataset.decorId || null);
      break;
    case 'open-dragon':
      ui.detailDragonId = dragonId;
      renderModals();
      break;
    case 'close-dragon-detail':
      ui.detailDragonId = null;
      ui.releaseConfirmId = null;
      renderModals();
      break;
    case 'set-sanctuaire-sort':
      ui.sanctuaireSort = dataset.sort;
      renderScreenSanctuaire();
      break;
    case 'labo-open-picker':
      ui.labo.picking = dataset.slot;
      renderScreenLabo();
      { const closeBtn = document.querySelector('[data-action="labo-close-picker"]'); if (closeBtn) closeBtn.focus(); }
      break;
    case 'labo-close-picker':
      ui.labo.picking = null;
      renderScreenLabo();
      break;
    case 'labo-select-parent':
      if (dataset.slot === 'a') ui.labo.parentAId = dataset.dragonId;
      else ui.labo.parentBId = dataset.dragonId;
      ui.labo.picking = null;
      renderScreenLabo();
      break;
    case 'breed-dragons':
      breedDragons();
      break;
    case 'care-all-dragons':
      careAllDragons();
      break;
    case 'care-dragon':
      careDragon(dragonId);
      break;
    case 'rename-dragon': {
      const input = document.getElementById('dragon-rename-input');
      const val = input ? input.value.trim() : '';
      const d = state.dragons.find(dd => dd.id === dragonId);
      if (d) {
        d.customName = val || null;
        saveStateDebounced();
        showToast(t('toast.nameUpdated'));
        renderModals();
        if (ui.screen === 'sanctuaire') renderScreenSanctuaire();
      }
      break;
    }
    case 'toggle-favorite': {
      const d = state.dragons.find(dd => dd.id === dragonId);
      if (d) {
        d.favorite = !d.favorite;
        saveStateDebounced();
        haptic(20);
        renderModals();
        if (ui.screen === 'sanctuaire') renderScreenSanctuaire();
      }
      break;
    }
    case 'share-dragon-card':
      exportDragonCard(dragonId);
      break;
    case 'request-release-dragon':
      ui.releaseConfirmId = dragonId;
      renderModals();
      break;
    case 'cancel-release-dragon':
      ui.releaseConfirmId = null;
      renderModals();
      break;
    case 'confirm-release-dragon': {
      const d = state.dragons.find(dd => dd.id === dragonId);
      if (d && !busyDragonIds()[d.id]) {
        const species = speciesById(d.speciesId);
        const refund = RELEASE_REFUND[species.variant];
        state.dragons = state.dragons.filter(dd => dd.id !== dragonId);
        state.ecailles += refund;
        ui.releaseConfirmId = null;
        ui.detailDragonId = null;
        saveStateDebounced();
        showToast(t('toast.dragonReleased', { name: dragonDisplayName(d, species), n: refund }));
        renderTopBar();
        renderModals();
        if (ui.screen === 'sanctuaire') renderScreenSanctuaire();
      }
      break;
    }
    case 'start-hatch-from-inbox':
      if (state.eggInbox.length > 0) { ui.hatchFlow = { egg: state.eggInbox[0], taps: 0, revealedDragon: null, startedAt: Date.now(), bonusHits: 0, lastTapBonus: false }; renderModals(); }
      break;
    case 'hatch-tap': {
      const bonus = hatchTimingIsBonus(ui.hatchFlow.startedAt);
      ui.hatchFlow.lastTapBonus = bonus;
      if (bonus) ui.hatchFlow.bonusHits = (ui.hatchFlow.bonusHits || 0) + 1;
      ui.hatchFlow.taps = Math.min(3, ui.hatchFlow.taps + 1);
      if (ui.hatchFlow.taps >= 3 && !ui.hatchFlow.revealedDragon) resolveHatch();
      else { haptic(bonus ? [15, 20, 15] : 20); renderModals(); }
      break;
    }
    case 'hatch-finish':
      ui.hatchFlow = null;
      renderAll();
      if (!state.tutorialSeen) {
        state.tutorialSeen = true;
        saveStateDebounced();
        ui.tutorialStep = 0;
        setTimeout(() => renderModals(), 350);
      }
      break;
    case 'hatch-finish-and-continue':
      if (state.eggInbox.length > 0) {
        ui.hatchFlow = { egg: state.eggInbox[0], taps: 0, revealedDragon: null, startedAt: Date.now(), bonusHits: 0, lastTapBonus: false };
        renderAll();
      } else {
        ui.hatchFlow = null;
        renderAll();
      }
      break;
    case 'tutorial-next':
      if (ui.tutorialStep < tutorialSlides().length - 1) { ui.tutorialStep += 1; renderModals(); }
      else { ui.tutorialStep = null; renderModals(); }
      break;
    case 'tutorial-skip':
      ui.tutorialStep = null;
      renderModals();
      break;
    case 'open-species': {
      const sp = speciesById(speciesId);
      ui.detailSpecies = { species: sp, discovered: state.discovered.includes(speciesId) };
      renderModals();
      break;
    }
    case 'close-species-detail':
      ui.detailSpecies = null;
      renderModals();
      break;
    case 'dragondex-filter':
      ui.dragondexFilter = elementKey;
      renderScreenDragondex();
      break;
    case 'dragondex-rarity-filter':
      ui.dragondexRarityFilter = dataset.rarity;
      renderScreenDragondex();
      break;
    case 'carte-open-zone': {
      const zone = ZONES.find(z => z.id === zoneId);
      if (computeLevel(state.xp) < zone.unlockLevel) {
        showToast(t('toast.zoneLevelRequired', { n: zone.unlockLevel }));
        if (el) { el.classList.remove('anim-shake'); void el.offsetWidth; el.classList.add('anim-shake'); }
        break;
      }
      ui.carte = { view: 'types', zoneId: zoneId, typeId: null, teamIds: [], scoutTaps: 0, scoutBonusPct: 0 };
      renderScreenCarte({ resetScroll: true });
      break;
    }
    case 'carte-back': {
      if (ui.carte.view === 'types') ui.carte = { view: 'zones', zoneId: null, typeId: null, teamIds: [], scoutTaps: 0, scoutBonusPct: 0 };
      else ui.carte.view = 'types';
      renderScreenCarte({ resetScroll: true });
      break;
    }
    case 'carte-choose-type': {
      const type = EXPEDITION_TYPES.find(t => t.id === typeId);
      ui.carte.typeId = typeId;
      ui.carte.teamIds = [];
      ui.carte.scoutTaps = 0;
      ui.carte.scoutBonusPct = 0;
      ui.carte.scoutStartedAt = Date.now();
      ui.carte.view = type.team ? 'team' : 'pick1';
      renderScreenCarte({ resetScroll: true });
      break;
    }
    case 'carte-pick-single':
      startExpedition(ui.carte.zoneId, ui.carte.typeId, [dragonId]);
      break;
    case 'carte-scout-tap':
      scoutTap();
      break;
    case 'carte-toggle-team-member': {
      const ids = ui.carte.teamIds;
      if (ids.includes(dragonId)) ui.carte.teamIds = ids.filter(x => x !== dragonId);
      else if (ids.length < 3) ui.carte.teamIds = [...ids, dragonId];
      renderScreenCarte();
      break;
    }
    case 'carte-confirm-team':
      if (ui.carte.teamIds.length >= 2) startExpedition(ui.carte.zoneId, ui.carte.typeId, ui.carte.teamIds);
      break;
    case 'carte-claim':
      claimExpedition(expId);
      break;
    case 'carte-speed-up':
      speedUpExpedition(expId);
      break;
    case 'expedition-cash-in':
      resolveExpeditionGain(false);
      break;
    case 'expedition-double':
      resolveExpeditionGain(true);
      break;
    case 'boutique-set-tab':
      ui.boutiqueTab = tab;
      renderScreenBoutique();
      break;
    case 'buy-decor':
      buyDecor(decorId);
      break;
    case 'buy-accessory':
      buyAccessory(dataset.accessoryId);
      break;
    case 'equip-accessory':
      equipAccessory(dataset.dragonId, dataset.slot, dataset.accessoryId || null);
      break;
    case 'toggle-equip-decor':
      toggleEquipDecor(decorId);
      break;
    case 'select-title':
      state.selectedTitle = dataset.titleId || null;
      saveStateDebounced();
      renderTopBar();
      renderScreenReglages();
      break;
    case 'toggle-parental-lock':
      state.parentalLock = !state.parentalLock;
      saveStateDebounced();
      renderScreenReglages();
      break;
    case 'toggle-reduce-vibrations':
      state.reduceVibrations = !state.reduceVibrations;
      saveStateDebounced();
      renderScreenReglages();
      break;
    case 'toggle-sound':
      state.soundEnabled = !state.soundEnabled;
      saveStateDebounced();
      if (state.soundEnabled) playCoinSound();
      renderScreenReglages();
      break;
    case 'toggle-gentle-animations':
      state.gentleAnimations = !state.gentleAnimations;
      document.body.classList.toggle('gentle-fx', state.gentleAnimations);
      saveStateDebounced();
      renderScreenReglages();
      break;
    case 'toggle-collection-banner':
      state.collectionBannerCollapsed = !state.collectionBannerCollapsed;
      saveStateDebounced();
      renderScreenDragondex();
      break;
    case 'toggle-achievements-banner':
      state.achievementsBannerCollapsed = !state.achievementsBannerCollapsed;
      saveStateDebounced();
      renderScreenDragondex();
      break;
    case 'toggle-objectives-banner':
      ui.objectivesBannerCollapsed = !ui.objectivesBannerCollapsed;
      renderScreenSanctuaire();
      break;
    case 'toggle-expedition-log':
      ui.expeditionLogCollapsed = !ui.expeditionLogCollapsed;
      renderScreenReglages();
      break;
    case 'claim-quest':
      claimDailyQuest(dataset.questId);
      break;
    case 'claim-weekly-challenge':
      claimWeeklyChallenge();
      break;
    case 'claim-achievement':
      claimAchievement(dataset.achievementId);
      break;
    case 'open-guardian-path':
      ui.guardianPathOpen = true;
      renderModals();
      break;
    case 'close-guardian-path':
      ui.guardianPathOpen = false;
      renderModals();
      break;
    case 'claim-pass-tier':
      claimPassTier(Number(dataset.tier));
      break;
    case 'open-rival-modal':
      ui.rivalModalOpen = true;
      renderModals();
      break;
    case 'close-rival-modal':
      ui.rivalModalOpen = false;
      renderModals();
      break;
    case 'copy-rival-code': {
      const code = dataset.code || '';
      const done = () => showToast(t('rival.codeCopied'));
      const fail = () => showToast(t('rival.codeCopyFailed'));
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done).catch(fail);
      } else {
        fail();
      }
      haptic(15);
      break;
    }
    case 'compare-rival-code': {
      const input = document.getElementById('rival-code-input');
      const raw = input ? input.value : '';
      const decoded = decodeGuardianCode(raw);
      if (!decoded) {
        showToast(t('rival.invalidCode'));
        break;
      }
      addRivalComparison(decoded);
      haptic(20);
      renderModals();
      break;
    }
    case 'remove-rival-comparison':
      removeRivalComparison(dataset.rivalId);
      renderModals();
      break;
    case 'change-mode':
      state.mode = mode;
      if (mode === 'eclosion' && ui.screen === 'labo') ui.screen = 'sanctuaire';
      saveStateDebounced();
      renderTopBar();
      renderScreenReglages();
      break;
    case 'change-language':
      state.language = lang;
      applyLanguage(lang);
      saveStateDebounced();
      renderAll();
      break;
    case 'save-name': {
      const input = document.getElementById('reglages-name-input');
      const val = input ? input.value.trim() : '';
      if (val) state.gardienName = val;
      saveStateDebounced();
      renderTopBar();
      showToast(t('toast.nameUpdated'));
      break;
    }
    case 'request-reset':
      ui.confirmResetOpen = true;
      renderModals();
      break;
    case 'cancel-reset':
      ui.confirmResetOpen = false;
      renderModals();
      break;
    case 'confirm-reset':
      doReset();
      break;
    case 'export-save':
      exportSave();
      break;
    case 'import-save-trigger': {
      const input = document.getElementById('import-save-input');
      if (input) input.click();
      break;
    }
    case 'cancel-import':
      ui.pendingImport = null;
      ui.confirmImportOpen = false;
      renderModals();
      break;
    case 'confirm-import':
      applyPendingImport();
      break;
    case 'close-lock-challenge':
      ui.lockChallenge = null;
      renderModals();
      break;
  }
}

// Filet de sécurité générique contre la perte de focus clavier après un ré-affichage
// complet d'écran (voir audit : le Labo avait été corrigé au cas par cas, ceci couvre
// tous les boutons data-action sans avoir à retoucher chaque point de rendu).
const FOCUS_DATA_KEYS = ['dragonId', 'zoneId', 'typeId', 'decorId', 'slot', 'sort', 'questId', 'achievementId', 'element', 'mode', 'screen'];
function describeFocusTarget(el) {
  if (!el || !el.dataset || !el.dataset.action) return null;
  let sel = `[data-action="${el.dataset.action}"]`;
  FOCUS_DATA_KEYS.forEach(key => {
    if (el.dataset[key] !== undefined) {
      const attr = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
      sel += `[data-${attr}="${CSS.escape(el.dataset[key])}"]`;
    }
  });
  return sel;
}

function initEvents() {
  const app = document.getElementById('lumidra-app');

  app.addEventListener('click', (e) => {
    // 1) Clic direct sur le fond (backdrop) d'une modale → fermeture.
    //    On vérifie que la cible EST l'overlay lui-même (pas un descendant),
    //    sinon un clic sur du texte à l'intérieur de la feuille fermerait la modale par erreur.
    if (e.target.classList && e.target.classList.contains('modal-overlay')) {
      const closeAction = e.target.dataset.backdropClose;
      if (closeAction) dispatchAction(closeAction, e.target.dataset, e, e.target);
      return;
    }
    // 2) Recherche normale d'un élément actionnable
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const focusSelector = describeFocusTarget(el);
    dispatchAction(el.dataset.action, el.dataset, e, el);
    // Si l'action a fait perdre le focus (ré-affichage d'écran), on tente de le
    // restaurer sur l'équivalent du bouton cliqué dans le nouveau DOM plutôt que
    // de le laisser retomber sur <body>. Si l'élément a disparu (ex. quête réclamée
    // qui change d'état), on ne force rien : dégradation silencieuse, pas de régression.
    if (focusSelector && document.activeElement === document.body) {
      const fresh = document.querySelector(focusSelector);
      if (fresh) fresh.focus({ preventScroll: true });
    }
  });

  // saisie texte : mise à jour silencieuse (pas de re-rendu, on garde le focus)
  app.addEventListener('input', (e) => {
    const bind = e.target.dataset ? e.target.dataset.bind : null;
    if (bind === 'onboarding-name') ui.onboarding.name = e.target.value;
    if (bind === 'dragondex-search') {
      ui.dragondexSearch = e.target.value;
      const caret = e.target.selectionStart;
      renderScreenDragondex();
      const fresh = document.getElementById('dragondex-search-input');
      if (fresh) { fresh.focus(); try { fresh.setSelectionRange(caret, caret); } catch (err) {} }
    }
    if (bind === 'sanctuaire-search') {
      ui.sanctuaireSearch = e.target.value;
      const caret = e.target.selectionStart;
      renderScreenSanctuaire();
      const fresh = document.getElementById('sanctuaire-search-input');
      if (fresh) { fresh.focus(); try { fresh.setSelectionRange(caret, caret); } catch (err) {} }
    }
  });

  // sélection d'un fichier de sauvegarde à importer
  app.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'import-save-input') {
      const file = e.target.files && e.target.files[0];
      handleImportedFile(file);
      e.target.value = ''; // permet de réimporter le même fichier une seconde fois si besoin
    }
  });

  app.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const bind = e.target.dataset ? e.target.dataset.bind : null;
      if (bind === 'reglages-name') document.querySelector('[data-action="save-name"]').click();
      if (e.target.id === 'onboarding-name-input') document.querySelector('[data-action="complete-onboarding"]').click();
      if (e.target.id === 'dragon-rename-input') document.querySelector('[data-action="rename-dragon"]').click();
    }

    // ---- Échap sur des panneaux non-modaux (audit accessibilité) ----
    if (e.key === 'Escape' && !modalIsOpen) {
      if (ui.screen === 'labo' && ui.labo.picking) {
        const slot = ui.labo.picking;
        ui.labo.picking = null;
        renderScreenLabo();
        const btn = document.querySelector(`[data-action="labo-open-picker"][data-slot="${slot}"]`);
        if (btn) btn.focus();
        return;
      }
      if (e.target.id === 'dragondex-search-input' && ui.dragondexSearch) {
        ui.dragondexSearch = '';
        renderScreenDragondex();
        const fresh = document.getElementById('dragondex-search-input');
        if (fresh) fresh.focus();
        return;
      }
      if (e.target.id === 'sanctuaire-search-input' && ui.sanctuaireSearch) {
        ui.sanctuaireSearch = '';
        renderScreenSanctuaire();
        const fresh = document.getElementById('sanctuaire-search-input');
        if (fresh) fresh.focus();
        return;
      }
    }

    // ---- piège de focus clavier dans les modales ----
    if (modalIsOpen && (e.key === 'Tab' || e.key === 'Escape')) {
      const sheet = document.querySelector('#modal-root .modal-sheet');
      if (!sheet) return;

      if (e.key === 'Escape') {
        const overlay = document.querySelector('#modal-root .modal-overlay');
        const closeAction = overlay ? overlay.dataset.backdropClose : null;
        if (closeAction) dispatchAction(closeAction, overlay.dataset, e, overlay);
        return;
      }

      const focusables = getFocusableElements(sheet);
      if (focusables.length === 0) { e.preventDefault(); sheet.focus(); return; }
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });
}

/* =========================================================================
   DÉMARRAGE
   ========================================================================= */

function bootLumidra() {
  loadState();
  applyLanguage(state.language);
  state.expeditions.forEach(exp => { if (exp.endAt > Date.now()) scheduleExpeditionNotification(exp); });
  document.body.classList.toggle('gentle-fx', !!state.gentleAnimations);
  initEvents();
  renderAll();
  if (saveWasCorrupted) {
    setTimeout(() => showToast(t('toast.corruptedSave')), 500);
  } else if (state.onboarded) {
    const streakResult = checkLoginStreak();
    if (streakResult) {
      renderTopBar();
      if (streakResult.milestone) {
        setTimeout(() => showToast(t('toast.streakMilestone', { n: streakResult.streak, bonus: streakResult.bonus + streakResult.milestoneBonus }), 'milestone'), 500);
      } else {
        setTimeout(() => showToast(t('toast.streakBonus', { n: streakResult.streak, s: streakResult.streak > 1 ? 's' : '', bonus: streakResult.bonus })), 500);
      }
    }
    scheduleStreakReminder();
  }
}

/* ---- Filet de sécurité global : si une erreur inattendue survient n'importe où dans le jeu,
   on affiche un écran de récupération plutôt que de laisser l'app figée sur un écran vide sans
   explication. Volontairement indépendant du reste du code (DOM brut, pas de dépendance à
   showToast/renderAll) : si CE qui casse fait partie du moteur de rendu lui-même, ce filet doit
   quand même s'afficher. ---- */
let crashOverlayShown = false;
function showCrashOverlay(detail) {
  if (crashOverlayShown) return; // n'affiche qu'une fois, pour ne pas empiler les écrans si plusieurs erreurs tombent d'affilée
  crashOverlayShown = true;
  const div = document.createElement('div');
  div.setAttribute('style', 'position:fixed;inset:0;z-index:9999;background:rgba(58,46,42,0.92);display:flex;align-items:center;justify-content:center;padding:24px;font-family:sans-serif;');
  // Indépendant de t()/state : si l'état lui-même est corrompu, ce filet doit
  // quand même pouvoir choisir une langue d'affichage sans lever d'erreur.
  let isEnglish = false;
  try { isEnglish = typeof state !== 'undefined' && state && state.language === 'en'; } catch (e) {}
  const crashTitle = isEnglish ? 'Oops, something went wrong' : 'Oups, un souci est survenu';
  const crashMessage = isEnglish ? 'Your save is safe. Just reload the app to continue.' : "Ta sauvegarde est en sécurité. Recharge simplement l'application pour continuer.";
  const crashReload = isEnglish ? 'Reload' : 'Recharger';
  div.innerHTML = `
    <div style="background:#FFFCF6;border-radius:20px;padding:28px 22px;max-width:340px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.3);">
      <div style="font-size:40px;margin-bottom:8px;">🥚💥</div>
      <div style="font-weight:800;font-size:17px;color:#3A2E2A;margin-bottom:8px;">${crashTitle}</div>
      <div style="font-size:13px;color:#6B5D55;margin-bottom:18px;line-height:1.5;">${crashMessage}</div>
      <button id="crash-reload-btn" style="background:#EDA23C;color:#3A2E2A;font-weight:800;border:none;border-radius:14px;padding:12px 28px;font-size:14px;">${crashReload}</button>
    </div>`;
  document.body.appendChild(div);
  document.getElementById('crash-reload-btn').addEventListener('click', () => location.reload());
}
window.addEventListener('error', (e) => showCrashOverlay(e.error ? e.error.message : e.message));
window.addEventListener('unhandledrejection', (e) => showCrashOverlay(e.reason ? String(e.reason) : 'promesse rejetée'));

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootLumidra);
} else {
  bootLumidra();
}


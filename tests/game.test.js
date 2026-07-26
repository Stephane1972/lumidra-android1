// Suite de non-régression pour Lumidra.
// Exécutée automatiquement en CI (voir .github/workflows/build-apk.yml) AVANT la construction
// Android : si un changement casse la logique du jeu, la construction s'arrête ici plutôt que
// de produire un APK qui compile mais ne fonctionne plus.
//
// Lancer localement : npm test

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlPath = path.join(__dirname, '..', 'www', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
function ev(win, expr) { return win.eval(expr); }

class FakeStorage {
  constructor() { this.store = {}; }
  getItem(k) { return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
}

let failures = 0;
function check(label, cond) {
  console.log((cond ? 'PASS' : 'FAIL') + ' — ' + label);
  if (!cond) failures++;
}

(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'file://' + htmlPath });
  const { window } = dom;
  window.CSS = { escape: (s) => String(s) };
  window.navigator.vibrate = () => {};
  Object.defineProperty(window, 'localStorage', { value: new FakeStorage() });
  await new Promise((r) => setTimeout(r, 250));

  const errors = [];
  window.addEventListener('error', (e) => errors.push(e.error ? e.error.stack : e.message));
  const doc = window.document;

  function clickAction(action, extra) {
    const els = Array.from(doc.querySelectorAll(`[data-action="${action}"]`));
    const el = extra ? els.find((e) => Object.entries(extra).every(([k, v]) => e.dataset[k] === v)) : els[0];
    if (!el) throw new Error(`Action introuvable: ${action} ${JSON.stringify(extra || {})}`);
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  }
  function resetCarteView() {
    ev(window, `ui.carte = { view: 'zones', zoneId: null, typeId: null, teamIds: [] }`);
  }

  console.log('--- démarrage / onboarding ---');
  doc.getElementById('onboarding-name-input').value = 'Test';
  clickAction('select-mode', { mode: 'stratege' });
  clickAction('complete-onboarding');
  check('onboarded en mode stratège', ev(window, 'state.onboarded === true && state.mode === "stratege"'));

  for (let i = 0; i < 10 && doc.querySelector('[data-action="hatch-tap"]'); i++) clickAction('hatch-tap');
  clickAction('hatch-finish');
  check('dragon de départ éclos', ev(window, 'state.dragons.length') === 1);

  console.log('--- soin ---');
  const starterId = ev(window, 'state.dragons[0].id');
  clickAction('nav', { screen: 'sanctuaire' });
  clickAction('open-dragon', { dragonId: starterId });
  clickAction('care-dragon', { dragonId: starterId });
  check('soin enregistré (careCount > 0)', ev(window, 'state.dragons[0].careCount') > 0);
  clickAction('close-dragon-detail');

  console.log('--- expédition solo ---');
  resetCarteView();
  clickAction('nav', { screen: 'carte' });
  clickAction('carte-open-zone', { zoneId: 'plaine' });
  clickAction('carte-choose-type', { typeId: 'reco' });
  const soloBtn = doc.querySelector('[data-action="carte-pick-single"]');
  if (soloBtn) soloBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('expédition solo lancée', ev(window, 'state.expeditions.length') === 1);
  ev(window, 'state.expeditions[0].endAt = Date.now() - 1000; now = Date.now();');
  window.renderScreenCarte();
  clickAction('carte-claim');
  check('expédition réclamée', ev(window, 'state.expeditions.length') === 0);
  check('statsExpeditionsCompleted incrémenté', ev(window, 'state.statsExpeditionsCompleted') >= 1);

  console.log('--- 36 espèces × 3 stades : aucune ne plante le rendu SVG ---');
  let svgCrash = null;
  ev(window, `
    SPECIES.forEach(s => {
      ['bebe','juvenile','adulte'].forEach(stage => {
        dragonSVG({ element: s.element, variant: s.variant, stage, size: 80 });
      });
    });
  `);
  check('dragonSVG rendu pour toutes les espèces/stades sans exception', true); // une exception aurait fait planter eval() ci-dessus

  console.log('--- élevage : deux légendaires peuvent produire un mythique ---');
  ev(window, `
    state.ecailles += 5000;
    state.dragons.push({ id:'drg_leg1', speciesId:'ignarok', stage:'adulte', careCount:20, lastCareAt:Date.now(), temperament:'Calme', bornAt:Date.now() });
    state.dragons.push({ id:'drg_leg2', speciesId:'aurelios', stage:'adulte', careCount:20, lastCareAt:Date.now(), temperament:'Loyal', bornAt:Date.now() });
  `);
  let mythicBred = false;
  for (let i = 0; i < 200 && !mythicBred; i++) {
    if (ev(window, `pickBreedingSpecies(speciesById('ignarok'), speciesById('aurelios')).variant`) === 5) mythicBred = true;
  }
  check('élevage légendaire+légendaire peut produire un mythique (200 essais)', mythicBred);

  console.log('--- hauts faits : toutes les fonctions progress() s\'évaluent sans erreur ---');
  let achErr = null;
  try { ev(window, `ACHIEVEMENTS.map(a => a.progress(state))`); } catch (e) { achErr = e.message; }
  check('tous les ACHIEVEMENTS.progress(state) réussissent', achErr === null);

  console.log('--- Dragondex : rendu complet, filtre de rareté mythique ---');
  clickAction('nav', { screen: 'dragondex' });
  check('36 cartes affichées dans le Dragondex', doc.querySelectorAll('[data-action="open-species"]').length === 36);
  clickAction('dragondex-rarity-filter', { rarity: '5' });
  check('filtre "Mythique" montre exactement 6 cartes', doc.querySelectorAll('[data-action="open-species"]').length === 6);

  console.log('--- réinitialisation ---');
  clickAction('nav', { screen: 'sanctuaire' });
  clickAction('open-settings');
  clickAction('request-reset');
  clickAction('confirm-reset');
  check('reset vide les dragons', ev(window, 'state.dragons.length') === 0);
  check('reset vide les découvertes', ev(window, 'state.discovered.length') === 0);
  check('reset remet onboarded à false', ev(window, 'state.onboarded') === false);

  console.log('\n=== RÉSUMÉ ===');
  console.log(failures === 0 ? 'TOUT PASSE' : `${failures} ÉCHEC(S)`);
  console.log('Erreurs JS runtime:', errors.length ? errors : 'AUCUNE');
  window.close();
  process.exit(failures > 0 || errors.length > 0 ? 1 : 0);
})().catch((e) => {
  console.error('ÉCHEC FATAL:', e);
  process.exit(1);
});

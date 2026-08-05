/* =========================================================================
   LUMIDRA — données et logique pure (aucune dépendance, portage fidèle)
   ========================================================================= */

const ELEMENTS = {
  feu:     { nameFr: 'Feu',     nameEn: 'Fire',   base: '#E8734A', light: '#F7B98C', deep: '#B54F2C', icon: 'flame' },
  eau:     { nameFr: 'Eau',     nameEn: 'Water',  base: '#4A9BB0', light: '#9CD6E3', deep: '#2D6B7D', icon: 'droplet' },
  terre:   { nameFr: 'Terre',   nameEn: 'Earth',  base: '#B08552', light: '#D9BC8C', deep: '#7A5A34', icon: 'mountain' },
  air:     { nameFr: 'Air',     nameEn: 'Air',    base: '#9B8FC9', light: '#CFC6EA', deep: '#6B5F99', icon: 'wind' },
  lumiere: { nameFr: 'Lumière', nameEn: 'Light',  base: '#E0AA3E', light: '#F5D888', deep: '#A8781E', icon: 'sun' },
  nature:  { nameFr: 'Nature',  nameEn: 'Nature', base: '#6FA05C', light: '#A8CD8F', deep: '#436B37', icon: 'leaf' },
};

const INK = '#3A2E2A';
const RARITY_LABEL_FR = ['Commun', 'Commun', 'Rare', 'Épique', 'Légendaire', 'Mythique'];
const RARITY_LABEL_EN = ['Common', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
let RARITY_LABEL = RARITY_LABEL_FR;
const RARITY_STARS = [1, 1, 2, 3, 3, 3];
const STAGE_LABEL_FR = { bebe: 'Bébé', juvenile: 'Juvénile', adulte: 'Adulte' };
const STAGE_LABEL_EN = { bebe: 'Baby', juvenile: 'Juvenile', adulte: 'Adult' };
let STAGE_LABEL = STAGE_LABEL_FR;
const TEMPERAMENTS_FR = ['Calme', 'Joueur', 'Audacieux', 'Loyal'];
const TEMPERAMENTS_EN = ['Calm', 'Playful', 'Bold', 'Loyal'];
let TEMPERAMENTS = TEMPERAMENTS_FR;
const CARE_COOLDOWN_MS = 90000; // 1 min 30 — un vrai temps de pause, plus une boucle instantanée
const SAVE_KEY = 'lumidra-save-v1';

const SPECIES = [
  { id:'braisor', nameFr:'Braisor', nameEn:'Braisor', element:'feu', variant:0, loreFr:"Petit dragon trapu qui traîne une fumée joueuse derrière lui.", loreEn:"A stocky little dragon that trails a playful wisp of smoke behind it." },
  { id:'cendrelle', nameFr:'Cendrelle', nameEn:'Cendrelle', element:'feu', variant:1, loreFr:"Ailes fines couvertes de cendres dorées, toujours en mouvement.", loreEn:"Thin wings dusted with golden ash, forever on the move." },
  { id:'pyrhelios', nameFr:'Pyrhélios', nameEn:'Pyrhelios', element:'feu', variant:2, loreFr:"Sa crête flamboyante réagit à son humeur.", loreEn:"Its blazing crest flares up and down with its mood." },
  { id:'magmaroth', nameFr:'Magmaroth', nameEn:'Magmaroth', element:'feu', variant:3, loreFr:"Carapace de roche volcanique craquelée, chaleur rassurante.", loreEn:"A shell of cracked volcanic rock, radiating a comforting warmth." },
  { id:'goutelin', nameFr:'Goutelin', nameEn:'Droplin', element:'eau', variant:0, loreFr:"Translucide, il rebondit comme une bulle.", loreEn:"Translucent, it bounces about like a soap bubble." },
  { id:'nageoline', nameFr:'Nageoline', nameEn:'Finnelle', element:'eau', variant:1, loreFr:"Ses nageoires en éventail changent de teinte avec la météo.", loreEn:"Its fan-shaped fins shift colour with the weather." },
  { id:'brumael', nameFr:'Brumael', nameEn:'Mistael', element:'eau', variant:2, loreFr:"Enveloppé d'une brume permanente, curieux et discret.", loreEn:"Wrapped in a permanent mist, curious yet shy." },
  { id:'abyssia', nameFr:'Abyssia', nameEn:'Abyssia', element:'eau', variant:3, loreFr:"Serpentin bioluminescent, plus actif la nuit.", loreEn:"A bioluminescent ribbon, most active after dark." },
  { id:'argilon', nameFr:'Argilon', nameEn:'Clayon', element:'terre', variant:0, loreFr:"Peau craquelée façon argile séchée au soleil.", loreEn:"Skin cracked like sun-baked clay." },
  { id:'mousselin', nameFr:'Mousselin', nameEn:'Mossling', element:'terre', variant:1, loreFr:"Recouvert de mousse vivante, doux au toucher.", loreEn:"Covered in living moss, soft to the touch." },
  { id:'racinelle', nameFr:'Racinelle', nameEn:'Rootelle', element:'terre', variant:2, loreFr:"Sa queue en racines se couvre de fleurs au printemps.", loreEn:"Its root-like tail blooms with flowers every spring." },
  { id:'gravalor', nameFr:'Gravalor', nameEn:'Gravalor', element:'terre', variant:3, loreFr:"Écailles de granit, ses pas résonnent légèrement.", loreEn:"Granite scales — its footsteps echo faintly." },
  { id:'brisalys', nameFr:'Brisalys', nameEn:'Brisalys', element:'air', variant:0, loreFr:"Ailes en feuille, il plane plus qu'il ne vole.", loreEn:"Leaf-shaped wings — it glides more than it flies." },
  { id:'voltine', nameFr:"Vol'tine", nameEn:"Voltine", element:'air', variant:1, loreFr:"Vive et joueuse, elle adore les loopings.", loreEn:"Quick and playful, she loves a good loop-the-loop." },
  { id:'cirrusca', nameFr:'Cirrusca', nameEn:'Cirrusca', element:'air', variant:2, loreFr:"Son corps semble fait de nuages compressés.", loreEn:"Its body seems woven from compressed clouds." },
  { id:'plumzephyr', nameFr:'Plumzéphyr', nameEn:'Plumzephyr', element:'air', variant:3, loreFr:"Ailes immenses qui chantent avec le vent.", loreEn:"Enormous wings that sing with the wind." },
  { id:'lumeo', nameFr:'Lumeo', nameEn:'Lumeo', element:'lumiere', variant:0, loreFr:"Sa lueur douce sert de veilleuse vivante.", loreEn:"Its gentle glow works as a living night light." },
  { id:'clarinelle', nameFr:'Clarinelle', nameEn:'Clarinelle', element:'lumiere', variant:1, loreFr:"Écailles iridescentes qui projettent de petits arcs-en-ciel.", loreEn:"Iridescent scales that cast tiny rainbows." },
  { id:'auralia', nameFr:'Auralia', nameEn:'Auralia', element:'lumiere', variant:2, loreFr:"Un halo doré permanent l'entoure.", loreEn:"A permanent golden halo surrounds it." },
  { id:'solarys', nameFr:'Solarys', nameEn:'Solarys', element:'lumiere', variant:3, loreFr:"Son motif rayonne à midi, gardien du jour selon la légende.", loreEn:"Its pattern glows brightest at noon — legend calls it the keeper of the day." },
  { id:'feuillon', nameFr:'Feuillon', nameEn:'Leaflet', element:'nature', variant:0, loreFr:"Écailles façon jeunes pousses, il grandit avec le printemps.", loreEn:"Scales like fresh shoots — it grows along with spring." },
  { id:'bourgette', nameFr:'Bourgette', nameEn:'Buddette', element:'nature', variant:1, loreFr:"De petites fleurs éclosent sur son dos.", loreEn:"Tiny flowers bloom along its back." },
  { id:'lianor', nameFr:'Lianor', nameEn:'Vinor', element:'nature', variant:2, loreFr:"Sa queue en liane fleurie ne cesse jamais de pousser.", loreEn:"Its flowering vine tail never stops growing." },
  { id:'sylvandre', nameFr:'Sylvandre', nameEn:'Sylvandre', element:'nature', variant:3, loreFr:"Allure de vieux chêne vivant, mémoire de la forêt.", loreEn:"Looks like a living old oak — a memory of the forest itself." },
  // Légendaires — extrêmement rares, aperçus surtout lors des quêtes légendaires et à la Cime des Anciens Dragons.
  { id:'ignarok', nameFr:'Ignarok', nameEn:'Ignarok', element:'feu', variant:4, loreFr:"Dragon de braise ancestrale, on dit qu'il dort au cœur des volcans depuis des siècles.", loreEn:"An ancestral ember dragon, said to have slept inside volcanoes for centuries." },
  { id:'leviatriss', nameFr:'Léviatriss', nameEn:'Leviatriss', element:'eau', variant:4, loreFr:"Créature abyssale légendaire, ses écailles scintillent comme des étoiles sous l'eau.", loreEn:"A legendary deep-sea creature whose scales glimmer like underwater stars." },
  { id:'terragorn', nameFr:'Terragorn', nameEn:'Terragorn', element:'terre', variant:4, loreFr:"Géant de pierre vivante, chaque pas fait naître une nouvelle montagne, dit la légende.", loreEn:"A giant of living stone — legend says a new mountain rises with every step it takes." },
  { id:'zephyrion', nameFr:'Zéphyrion', nameEn:'Zephyrion', element:'air', variant:4, loreFr:"Maître des tempêtes, invisible sauf quand il choisit de se montrer.", loreEn:"Master of storms, invisible unless it chooses to be seen." },
  { id:'aurelios', nameFr:'Aurélios', nameEn:'Aurelios', element:'lumiere', variant:4, loreFr:"Dragon solaire mythique, son envol dessinerait l'aube selon les anciens récits.", loreEn:"A mythical sun dragon — old tales say its flight paints the dawn itself." },
  { id:'sylvamater', nameFr:'Sylvamater', nameEn:'Sylvamater', element:'nature', variant:4, loreFr:"Esprit ancien de la forêt, on ne le voit qu'une fois par génération de gardiens.", loreEn:"An ancient forest spirit, glimpsed only once per generation of Guardians." },
  // Mythiques — au-delà même des légendaires. On ne les obtient qu'en unissant deux dragons
  // légendaires au Laboratoire, ou tout en haut de la Cime, une fois tous les légendaires rencontrés.
  { id:'ignisia', nameFr:'Ignisia', nameEn:'Ignisia', element:'feu', variant:5, loreFr:"On dit qu'elle porte en elle la toute première étincelle, avant même le premier volcan.", loreEn:"Said to carry the very first spark, from before the first volcano ever formed." },
  { id:'thalassor', nameFr:'Thalassor', nameEn:'Thalassor', element:'eau', variant:5, loreFr:"Nul n'a vu le fond de l'océan qu'il habite — seuls ses reflets remontent parfois à la surface.", loreEn:"No one has seen the bottom of the ocean it calls home — only its glimmer ever reaches the surface." },
  { id:'terrastrum', nameFr:'Terrastrum', nameEn:'Terrastrum', element:'terre', variant:5, loreFr:"Ses écailles renferment, dit-on, un fragment de chaque montagne jamais formée.", loreEn:"Its scales are said to hold a fragment of every mountain that has ever formed." },
  { id:'ouranis', nameFr:'Ouranis', nameEn:'Ouranis', element:'air', variant:5, loreFr:"Il ne se pose jamais — certains gardiens jurent qu'il porte le ciel lui-même sur son dos.", loreEn:"It never lands — some Guardians swear it carries the sky itself on its back." },
  { id:'luminae', nameFr:'Luminae', nameEn:'Luminae', element:'lumiere', variant:5, loreFr:"Sa lumière ne projette aucune ombre — un mystère que même les plus vieux récits n'expliquent pas.", loreEn:"Its light casts no shadow — a mystery even the oldest tales cannot explain." },
  { id:'gaiane', nameFr:'Gaïane', nameEn:'Gaiane', element:'nature', variant:5, loreFr:"On raconte qu'elle a vu pousser le premier arbre, et qu'elle veille sur tous ceux qui ont suivi.", loreEn:"Said to have watched the very first tree grow, and to have watched over every one since." },
];

const ZONES = [
  { id:'plaine', nameFr:'Plaine des Premières Écailles', nameEn:'Plain of First Scales', elements:['feu','terre'], unlockLevel:1, loreFr:"Là où les tout premiers gardiens ont appris à marcher aux côtés des dragons. Le sol y garde encore une chaleur tranquille.", loreEn:"Where the very first Guardians learned to walk alongside dragons. The ground still holds a quiet warmth." },
  { id:'golfe', nameFr:'Golfe de Brume', nameEn:'Gulf of Mist', elements:['eau','air'], unlockLevel:3, loreFr:"Une côte toujours voilée d'un brouillard léger, où les dragons d'eau et d'air se croisent au lever du jour.", loreEn:"A coastline forever veiled in a light fog, where water and air dragons cross paths at daybreak." },
  { id:'foret', nameFr:'Forêt de Sylvandre', nameEn:'Sylvandre Forest', elements:['nature','terre'], unlockLevel:5, loreFr:"Une forêt si ancienne que certains arbres seraient eux-mêmes d'anciens dragons endormis.", loreEn:"A forest so ancient that some of its trees are said to be sleeping dragons themselves." },
  { id:'archipel', nameFr:'Archipel des Vents', nameEn:'Archipelago of Winds', elements:['air','lumiere'], unlockLevel:8, loreFr:"Des îlots suspendus par les courants, où la lumière du matin attire les dragons les plus rapides.", loreEn:"Islets held aloft by the currents, where the morning light draws in the swiftest dragons." },
  { id:'cime', nameFr:'Cime des Anciens Dragons', nameEn:'Peak of the Ancient Dragons', elements:['feu','eau','terre','air','lumiere','nature'], unlockLevel:12, loreFr:"Le sommet que tous les éléments se partagent. On raconte que chaque dragon légendaire y revient au moins une fois.", loreEn:"The summit shared by every element. Legend says every legendary dragon returns here at least once." },
  { id:'voile', nameFr:'Le Voile Éternel', nameEn:'The Eternal Veil', elements:['feu','eau','terre','air','lumiere','nature'], unlockLevel:18, loreFr:"Au-delà même de la Cime, un dernier voile sépare le sanctuaire du monde des mythes. Seuls les gardiens les plus dévoués l'ont franchi.", loreEn:"Beyond even the Peak, one last veil separates the sanctuary from the realm of myths. Only the most devoted Guardians have crossed it." },
];

const EXPEDITION_TYPES = [
  { id:'reco', nameFr:'Reconnaissance', nameEn:'Scouting', seconds:180, ecaillesMin:30, ecaillesMax:50, eggChance:0.30, legendaryChance:0, team:false, taglineFr:'Pour une petite pause', taglineEn:'A quick little break' },
  { id:'collecte', nameFr:'Collecte', nameEn:'Gathering', seconds:480, ecaillesMin:60, ecaillesMax:100, eggChance:0.45, legendaryChance:0.01, team:false, taglineFr:"Le temps d'un goûter", taglineEn:'About as long as a snack break' },
  { id:'explo', nameFr:'Exploration', nameEn:'Exploration', seconds:7200, ecaillesMin:100, ecaillesMax:160, eggChance:0.60, legendaryChance:0.04, team:false, taglineFr:"Idéal pour l'après-midi", taglineEn:'Perfect for an afternoon' },
  { id:'majeure', nameFr:'Expédition majeure', nameEn:'Major expedition', seconds:14400, ecaillesMin:150, ecaillesMax:240, eggChance:0.70, legendaryChance:0.08, team:true, taglineFr:'À lancer avant de partir', taglineEn:'Launch it before you head out' },
  { id:'quete-legendaire', nameFr:'Quête légendaire', nameEn:'Legendary quest', seconds:21600, ecaillesMin:220, ecaillesMax:340, eggChance:0.85, legendaryChance:0.35, team:true, taglineFr:'Une nuit entière sur la piste d\'un dragon légendaire', taglineEn:'A whole night tracking a legendary dragon' },
  { id:'quete-mythique', nameFr:'Quête mythique', nameEn:'Mythic quest', seconds:32400, ecaillesMin:320, ecaillesMax:480, eggChance:0.9, legendaryChance:0, mythicChance:0.16, team:true, requiresAllLegendary:true, taglineFr:'Réservée à ceux qui ont déjà rencontré tous les légendaires', taglineEn:'Reserved for those who have already met every legendary' },
  { id:'quete-eternelle', nameFr:'Quête éternelle', nameEn:'Eternal quest', seconds:43200, ecaillesMin:400, ecaillesMax:600, eggChance:0.95, legendaryChance:0, mythicChance:0.25, team:true, requiresMythic:true, taglineFr:'Réservée aux gardiens qui ont déjà croisé un dragon mythique', taglineEn:'Reserved for Guardians who have already met a mythic dragon' },
];

const DECOR = [
  { id:'lanterne', nameFr:'Lanterne de Papier', nameEn:'Paper Lantern', cost:150 },
  { id:'bassin', nameFr:'Bassin de Nénuphars', nameEn:'Lily Pond', cost:220 },
  { id:'cristal', nameFr:'Cristal Lumineux', nameEn:'Glowing Crystal', cost:300 },
  { id:'banc', nameFr:'Banc de Pierre', nameEn:'Stone Bench', cost:180 },
  { id:'arche', nameFr:'Arche Fleurie', nameEn:'Flowered Arch', cost:260 },
  { id:'carillon', nameFr:'Carillon de Vent', nameEn:'Wind Chime', cost:340 },
  { id:'autel', nameFr:'Autel Ancien', nameEn:'Ancient Altar', cost:420 },
  { id:'statue-ancien', nameFr:'Statue de Gardien', nameEn:'Guardian Statue', cost:480 },
  { id:'flamme-eternelle', nameFr:'Flamme Éternelle', nameEn:'Eternal Flame', cost:520 },
  { id:'voile-solaire', nameFr:'Voile Solaire', nameEn:'Solar Sail', cost:260, seasonal:'ete' },
  { id:'citrouille-doree', nameFr:'Citrouille Dorée', nameEn:'Golden Pumpkin', cost:260, seasonal:'automne' },
  { id:'guirlande-etoilee', nameFr:'Guirlande Étoilée', nameEn:'Starry Garland', cost:260, seasonal:'hiver' },
  { id:'autel-astral', nameFr:'Autel Astral', nameEn:'Astral Altar', cost:650 },
  { id:'flamme-primordiale', nameFr:'Flamme Primordiale', nameEn:'Primordial Flame', cost:720 },
];

// Paliers intermédiaires de la collection (avant les 100%), pour donner un cap régulier à viser.
const COLLECTION_MILESTONES = [6, 12, 18, 24, 30];

const DEFAULT_STATE = {
  onboarded: false,
  mode: 'eclosion',
  gardienName: 'Gardien',
  xp: 0,
  ecailles: 80,
  dragons: [],
  eggInbox: [],
  discovered: [],
  expeditions: [],
  decorOwned: [],
  decorEquipped: [],
  parentalLock: false,
  reduceVibrations: false,
  collectionCompleteShown: false,
  collectionMilestonesShown: [],
  collectionBannerCollapsed: false,
  dailyQuests: null,
  weeklyChallenge: null,
  achievementsClaimed: [],
  achievementsBannerCollapsed: false,
  statsExpeditionsCompleted: 0,
  laboCooldownUntil: 0,
  statsBredCount: 0,
  laboPityLegendary: 0,
  laboPityMythic: 0,
  soundEnabled: true,
  gentleAnimations: false,
  lastLoginDate: null,
  loginStreak: 0,
  longestStreak: 0,
  statsEggsHatched: 0,
  tutorialSeen: false,
  selectedTitle: null,
  expeditionLog: [],
  // Détection simple à la première ouverture : français par défaut sauf si l'appareil est
  // clairement réglé sur une autre langue. Modifiable ensuite dans les réglages.
  language: (typeof navigator !== 'undefined' && navigator.language && navigator.language.slice(0, 2).toLowerCase() === 'fr') ? 'fr' : 'en',
};

// Retourne une copie de DEFAULT_STATE avec des tableaux/objets neufs à chaque appel.
// (Object.assign({}, DEFAULT_STATE) seul ne copie que la RÉFÉRENCE des tableaux : sans
// cette fonction, state.dragons.push(...) mutait aussi DEFAULT_STATE.dragons, ce qui
// pouvait corrompre le Reset et l'import d'une sauvegarde dans la même session.)
function freshDefaultState() {
  return Object.assign({}, DEFAULT_STATE, {
    dragons: [], eggInbox: [], discovered: [], expeditions: [],
    decorOwned: [], decorEquipped: [], achievementsClaimed: [], dailyQuests: null, weeklyChallenge: null, expeditionLog: [],
  });
}

/* ---- utilitaires purs ---- */

function uid(prefix) { return prefix + '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
// Traductions du texte d'interface (boutons, titres, messages) — rempli au fil des écrans.
// Utilisation : t('cle') ou t('cle', {nom: 'valeur'}) pour insérer une valeur dans le texte.
const T = {
  fr: {
    'common.ok': 'OK',
    'settings.title': 'Réglages',
    'settings.guardianName': 'Nom du Gardien',
    'settings.language': 'Langue',
    'settings.gameMode': 'Mode de jeu',
    'settings.modeHatching': 'Éclosion',
    'settings.modeStrategist': 'Stratège',
    'settings.modeHint': "Ta collection est commune aux deux modes. Stratège ajoute les équipes d'expédition et le tempérament des dragons.",
    'settings.preferences': 'Préférences',
    'settings.parentalLock': 'Verrouillage parental',
    'settings.parentalLockHint': "Protège l'accès aux réglages par une question simple.",
    'settings.reduceVibrations': 'Réduire les vibrations',
    'settings.reduceVibrationsHint': 'Désactive le retour haptique (éclosion, déverrouillage, récompenses).',
    'settings.sound': 'Sons',
    'settings.soundHint': "Petites mélodies pour l'éclosion, les soins et les récompenses.",
    'settings.gentleAnimations': 'Animations douces',
    'settings.gentleAnimationsHint': "Réduit l'intensité des rebonds des dragons, sans les désactiver complètement.",
    'settings.saveTitle': 'Sauvegarde',
    'settings.saveHint': 'Exporte un fichier pour garder ta progression avant une mise à jour, ou importe-le pour la restaurer.',
    'settings.export': 'Exporter',
    'settings.import': 'Importer',
    'settings.statsTitle': 'Statistiques',
    'settings.statDragons': 'Dragons actuels',
    'settings.statEggs': 'Œufs éclos au total',
    'settings.statExpeditions': 'Expéditions terminées',
    'settings.statBreeding': 'Élevages réussis',
    'settings.statStreak': 'Meilleure série de connexion',
    'settings.statStreakValue': '{n} jour{s}',
    'settings.statFavElement': 'Élément favori',
    'settings.aboutTitle': 'À propos',
    'settings.aboutText': 'Lumidra ne contient aucune publicité, aucune messagerie libre entre joueurs, et se joue sans connexion (hors polices). Version HTML autonome.',
    'settings.resetButton': 'Réinitialiser ma progression',
    'onboarding.tagline': 'Fais éclore ta légende.',
    'onboarding.namePlaceholder': 'Ton prénom de Gardien',
    'onboarding.modeEclosion': 'Éclosion',
    'onboarding.modeEclosionDesc': 'Simple, doux, rassurant',
    'onboarding.modeStratege': 'Stratège',
    'onboarding.modeStrategeDesc': 'Équipes, statistiques',
    'onboarding.start': "✨ Commencer l'aventure",
    'onboarding.hint': 'Tu pourras changer de mode plus tard dans les réglages.',
    'topbar.settingsAria': 'Réglages',
    'topbar.progressAria': 'Progression vers le niveau suivant',
    'topbar.level': 'Niveau {n}',
    'topbar.roleGardien': 'Gardien',
    'nav.sanctuaire': 'Sanctuaire',
    'nav.dragondex': 'Dragondex',
    'nav.carte': 'Carte',
    'nav.boutique': 'Boutique',
    'nav.labo': 'Labo',
    'sanctuaire.eggsReady': '{n} œuf{s} prêt{s} à éclore',
    'sanctuaire.fromExpedition': "Rapporté d'expédition",
    'sanctuaire.open': 'Ouvrir',
    'sanctuaire.title': 'Ton sanctuaire',
    'sanctuaire.empty': "Ton sanctuaire est vide pour l'instant. Fais éclore ton premier œuf !",
    'sanctuaire.careAll': 'Soigner tous les dragons disponibles',
    'sanctuaire.searchPlaceholder': 'Chercher un de tes dragons…',
    'sanctuaire.searchAria': 'Chercher un dragon',
    'sanctuaire.noSearchResults': 'Aucun dragon ne correspond à cette recherche.',
    'sanctuaire.busyExpedition': 'en expédition',
    'sanctuaire.sortRecent': 'Récents',
    'sanctuaire.sortFavorites': 'Favoris',
    'sanctuaire.sortAlpha': 'A-Z',
    'sanctuaire.sortRarity': 'Rareté',
    'objectives.title': 'Objectifs',
    'objectives.dailyTitle': 'Objectifs du jour',
    'objectives.weeklyTitle': 'Défi de la semaine',
    'objectives.allDone': 'Tout est à jour',
    'objectives.toClaim': '{n} à réclamer',
    'objectives.dayStreak': '🔥 {n} jour{s}',
    'objectives.nextMilestone': 'Encore {n} jour(s) avant le prochain bonus de série',
    'objectives.dailyCount': '{n} objectif{s} du jour',
    'objectives.weeklyCount': '1 défi de la semaine',
    'achievements.title': 'Succès',
    'achievements.titleWithClaim': 'Succès · {n} à réclamer',
    'dragondex.discoveredCount': '{n}/{total} découverts',
    'dragondex.filterAll': 'Tous',
    'dragondex.rarityAll': 'Toutes raretés',
    'dragondex.rarityCommon': 'Commun',
    'dragondex.rarityRare': 'Rare',
    'dragondex.rarityEpic': 'Épique',
    'dragondex.rarityLegendary': 'Légendaire',
    'dragondex.rarityMythic': 'Mythique',
    'dragondex.searchPlaceholder': 'Chercher un dragon découvert…',
    'dragondex.searchAria': 'Chercher un dragon',
    'dragondex.noResults': 'Aucun dragon découvert ne correspond à cette recherche.',
    'dragondex.collectionComplete': 'Collection complète',
    'dragondex.collapseBannerAria': 'Réduire la bannière',
    'dragondex.masterGuardian': 'Maître Gardien',
    'dragondex.collectionCompleteDesc': 'Les {n} espèces sont découvertes. Collection complète !',
    'dragondex.legendaryBannerText': "Dragons Légendaires : une chance rare de les croiser lors des expéditions, surtout à la Cime des Anciens Dragons et lors des quêtes légendaires. Dragons Mythiques : unis deux légendaires au Laboratoire, tente la quête mythique une fois les six légendaires réunis, ou pousse jusqu'au Voile Éternel avec un premier mythique en poche.",
    'dragondex.lockedSuffix': ' (verrouillé)',
    'carte.pathTitle': "Parcours d'expédition",
    'carte.pathSubtitle': 'Avance de zone en zone à mesure que ton niveau grandit.',
    'carte.zoneLevel': 'Niveau {n}',
    'carte.back': 'Retour',
    'carte.chooseDragon': 'Choisis un dragon',
    'carte.buildTeam': 'Compose ton équipe',
    'carte.noDragonAtAll': "Fais d'abord éclore un dragon dans ton sanctuaire.",
    'carte.noDragonAvailable': 'Tous tes dragons sont déjà en expédition.',
    'carte.noTeamDragons': 'Aucun dragon disponible pour une équipe.',
    'carte.team': 'Équipe ({n}/3)',
    'carte.statVigueur': 'Vigueur',
    'carte.statEclat': 'Éclat',
    'carte.statHarmonie': 'Harmonie',
    'carte.harmonyBonus': "💡 Tempéraments variés : bonus d'harmonie actif",
    'carte.elementalBonus': "🌈 Éléments variés : bonus de récolte actif",
    'carte.perfectMatchBonus': "🎯 Équipe parfaitement accordée à la zone : bonus maximal !",
    'carte.launchExpedition': "Lancer l'expédition",
    'carte.expeditionDone': 'Expédition terminée !',
    'carte.returnIn': 'Retour dans {time}',
    'carte.claim': 'Récupérer',
    'carte.teamSuffix': ' · équipe',
    'carte.scalesUnit': 'écailles',
    'boutique.title': 'Décorations',
    'boutique.subtitle': "Personnalise ton sanctuaire avec des écailles gagnées en jouant — jamais d'argent réel ici.",
    'boutique.equipped': 'Équipé ✓',
    'boutique.equip': 'Équiper',
    'labo.title': 'Laboratoire',
    'labo.subtitle': "Associe deux dragons adultes pour obtenir un œuf inattendu — parfois même légendaire. Unis deux légendaires, et le mythique n'est plus tout à fait hors de portée.",
    'labo.needTwo': 'Il te faut au moins 2 dragons adultes, non occupés, pour tenter un élevage.',
    'labo.choose': 'Choisir',
    'labo.choosePicker': 'Choisir un parent',
    'labo.closeAria': 'Fermer',
    'labo.noOtherAdult': 'Aucun autre dragon adulte disponible.',
    'labo.availableIn': 'Disponible dans {time}',
    'labo.breed': 'Élever ({cost})',
    'labo.pityLegendary': "Encore {n} essai(s) sans légendaire avant qu'un ne soit garanti",
    'labo.pityLegendaryReady': "✨ Prochain élevage : légendaire garanti !",
    'labo.pityMythic': "Encore {n} essai(s) sans mythique avant qu'un ne soit garanti",
    'labo.pityMythicReady': '✨ Prochain élevage : mythique garanti !',
    'modal.hatchAria': 'Éclosion',
    'modal.hatchMysterious': 'Un œuf mystérieux…',
    'modal.hatchMoving': 'Ça bouge…',
    'modal.hatchReady': 'Ça y est !',
    'modal.hatchTapButton': '✨ Appuie pour faire éclore ({n}/3)',
    'modal.legendaryBadge': '✨ DRAGON LÉGENDAIRE ✨',
    'modal.welcome': 'Accueillir {name} ✨',
    'modal.hatchNext': 'Faire éclore le suivant ({n} restant{s})',
    'modal.closeAria': 'Fermer',
    'modal.removeFavorite': 'Retirer des favoris',
    'modal.addFavorite': 'Ajouter aux favoris',
    'modal.renameAria': 'Renommer ce dragon',
    'modal.confirmNameAria': 'Valider le nom',
    'modal.temperamentLabel': 'Tempérament : {t}',
    'modal.stageLabel': 'Stade : {s}',
    'modal.careCount': '{n}/{total} soins',
    'modal.inExpedition': 'En expédition',
    'modal.pet': 'Câliner',
    'modal.cooldownMin': 'Encore {n} min',
    'modal.cooldownSec': 'Encore {n}s',
    'modal.downloadCard': 'Télécharger sa carte',
    'modal.legendaryNoRelease': 'Les dragons légendaires ne peuvent pas être relâchés.',
    'modal.confirmReleaseText': 'Relâcher {name} définitivement ? (+{n} écailles)',
    'modal.cancel': 'Annuler',
    'modal.confirm': 'Confirmer',
    'modal.releaseButton': 'Relâcher dans la nature (+{n} écailles)',
    'modal.speciesUnknownAria': 'Dragon non découvert',
    'modal.discoverToReveal': 'Découvre ce dragon en expédition pour révéler sa fiche.',
    'modal.parentalLockAria': 'Verrouillage parental',
    'modal.adultZoneTitle': 'Zone réservée à un adulte',
    'modal.holdInstructions': 'Maintiens le bouton appuyé quelques secondes pour continuer.',
    'modal.holdAria': 'Maintenir appuyé pour déverrouiller',
    'modal.unlocked': 'Déverrouillé !',
    'modal.resetConfirmAria': 'Confirmation',
    'modal.resetTitle': 'Réinitialiser ta progression ?',
    'modal.resetText': 'Tous tes dragons et ta progression seront définitivement perdus.',
    'tutorial.discoverAria': 'Découverte de Lumidra',
    'tutorial.skip': 'Passer',
    'tutorial.next': 'Suivant',
    'tutorial.start': "C'est parti !",
    'tutorial.slide1Title': 'Ton Sanctuaire',
    'tutorial.slide1Text': "C'est ici que vivent tes dragons. Câline-les régulièrement pour les aider à grandir, et garde un œil sur tes objectifs du jour tout en haut.",
    'tutorial.slide2Title': 'La Carte',
    'tutorial.slide2Text': 'Avance de zone en zone à mesure que tu montes de niveau, et lance des expéditions pour ramener des écailles et de nouveaux œufs.',
    'tutorial.slide3Title': 'Le Dragondex',
    'tutorial.slide3Text': 'Ta collection complète : espèces découvertes, succès à débloquer, et une recherche pour retrouver un dragon précis.',
    'tutorial.slide4Title': 'Boutique & Labo',
    'tutorial.slide4Text': 'La Boutique te permet de décorer ton sanctuaire. En mode Stratège, le Laboratoire te permet aussi de croiser deux dragons adultes.',
    'importModal.aria': "Confirmation d'import",
    'importModal.title': 'Importer cette sauvegarde ?',
    'importModal.summary': 'Gardien : {name} — {n1} dragon{s1}, {n2} espèce{s2} découverte{s2}.',
    'importModal.deviceWarning': 'Ta progression actuelle sur cet appareil sera remplacée par celle du fichier importé.',
    'importModal.import': 'Importer',
    'toast.noDragonForCare': 'Aucun dragon disponible pour un câlin pour le moment',
    'toast.caredGrew': '{n} dragon{s} câliné{s}, dont {g} qui grandi{s2} ! ✨',
    'toast.caredPlain': '{n} dragon{s} câliné{s} !',
    'toast.grew': '{name} a grandi ! ✨',
    'toast.dragondexComplete': 'Dragondex complet ! Tu es un Maître Gardien ✨🏆',
    'notif.body': "Ton expédition est terminée — un trésor t'attend au sanctuaire ! 🐉",
    'toast.expeditionLaunched': 'Expédition lancée !',
    'toast.expeditionSpedUp': "⚡ Expédition accélérée : l'équipe est déjà de retour !",
    'toast.notEnoughScales': "Pas assez d'écailles",
    'toast.eggAppeared': 'Un œuf est apparu au Laboratoire !',
    'toast.mythicEgg': "Un œuf mythique... c'est presque impossible ! ✨🌟",
    'toast.legendaryEgg': 'Un œuf légendaire scintille dans ta besace ! ✨',
    'toast.gainEggScales': '+{n} écailles et un nouvel œuf !',
    'toast.gainScales': '+{n} écailles',
    'toast.decorUnavailable': "Cette décoration n'est pas disponible en ce moment",
    'toast.decorAdded': '{name} ajouté !',
    'toast.maxDecor': 'Maximum 3 décorations affichées',
    'toast.nameUpdated': 'Nom mis à jour',
    'toast.cardDownloaded': 'Carte du dragon téléchargée !',
    'toast.cardError': 'Impossible de générer la carte',
    'toast.dragonReleased': '{name} relâché (+{n} écailles)',
    'toast.zoneLevelRequired': 'Niveau {n} requis pour débloquer cette zone',
    'toast.corruptedSave': 'Ta sauvegarde précédente était illisible — on repart à zéro, désolé 💛',
    'toast.streakBonus': '🔥 Série de {n} jour{s} ! +{bonus} écailles',
    'toast.streakMilestone': "🔥✨ Palier de {n} jours d'affilée ! +{bonus} écailles bonus",
    'toast.dailyComboBonus': '⭐ Les 3 quêtes du jour, terminées ! +{n} écailles bonus',
    'toast.collectionMilestone': '📖✨ {n} espèces découvertes ! +{bonus} écailles bonus',
    'toast.levelUp': '🎉 Niveau {n} atteint !',
    'toast.weeklyChallengeDone': 'Défi hebdomadaire réussi ! +{n} écailles',
    'toast.questReward': '+{n} écailles !',
    'toast.achievementUnlocked': 'Succès débloqué : {name} (+{n} écailles)',
    'toast.exportChooseDestination': 'Choisis où enregistrer ta sauvegarde',
    'toast.exportFailed': "Impossible d'exporter la sauvegarde",
    'toast.exportSuccess': 'Sauvegarde exportée !',
    'toast.importInvalid': 'Fichier de sauvegarde invalide',
    'toast.importUnreadable': 'Fichier de sauvegarde illisible',
    'toast.importReadError': 'Impossible de lire le fichier',
    'toast.importSuccess': 'Sauvegarde importée !',
    'crash.title': 'Oups, un souci est survenu',
    'crash.message': "Ta sauvegarde est en sécurité. Recharge simplement l'application pour continuer.",
    'crash.reload': 'Recharger',
  },
  en: {
    'common.ok': 'OK',
    'settings.title': 'Settings',
    'settings.guardianName': 'Guardian name',
    'settings.language': 'Language',
    'settings.gameMode': 'Game mode',
    'settings.modeHatching': 'Hatching',
    'settings.modeStrategist': 'Strategist',
    'settings.modeHint': 'Your collection is shared across both modes. Strategist adds expedition teams and dragon temperaments.',
    'settings.preferences': 'Preferences',
    'settings.parentalLock': 'Parental lock',
    'settings.parentalLockHint': 'Protects access to settings with a simple question.',
    'settings.reduceVibrations': 'Reduce vibrations',
    'settings.reduceVibrationsHint': 'Turns off haptic feedback (hatching, unlocks, rewards).',
    'settings.sound': 'Sound',
    'settings.soundHint': 'Small tunes for hatching, care, and rewards.',
    'settings.gentleAnimations': 'Gentle animations',
    'settings.gentleAnimationsHint': "Reduces the dragons' bounce intensity, without disabling it completely.",
    'settings.saveTitle': 'Save data',
    'settings.saveHint': 'Export a file to keep your progress before an update, or import it to restore it.',
    'settings.export': 'Export',
    'settings.import': 'Import',
    'settings.statsTitle': 'Statistics',
    'settings.statDragons': 'Current dragons',
    'settings.statEggs': 'Total eggs hatched',
    'settings.statExpeditions': 'Expeditions completed',
    'settings.statBreeding': 'Successful breedings',
    'settings.statStreak': 'Best login streak',
    'settings.statStreakValue': '{n} day{s}',
    'settings.statFavElement': 'Favourite element',
    'settings.aboutTitle': 'About',
    'settings.aboutText': 'Lumidra has no ads, no free messaging between players, and works with no connection (fonts aside). Standalone HTML version.',
    'settings.resetButton': 'Reset my progress',
    'onboarding.tagline': 'Hatch your legend.',
    'onboarding.namePlaceholder': 'Your Guardian name',
    'onboarding.modeEclosion': 'Hatching',
    'onboarding.modeEclosionDesc': 'Simple, gentle, reassuring',
    'onboarding.modeStratege': 'Strategist',
    'onboarding.modeStrategeDesc': 'Teams, statistics',
    'onboarding.start': '✨ Start the adventure',
    'onboarding.hint': 'You can change modes later in settings.',
    'topbar.settingsAria': 'Settings',
    'topbar.progressAria': 'Progress toward next level',
    'topbar.level': 'Level {n}',
    'topbar.roleGardien': 'Guardian',
    'nav.sanctuaire': 'Sanctuary',
    'nav.dragondex': 'Dragondex',
    'nav.carte': 'Map',
    'nav.boutique': 'Shop',
    'nav.labo': 'Lab',
    'sanctuaire.eggsReady': '{n} egg{s} ready to hatch',
    'sanctuaire.fromExpedition': 'Brought back from an expedition',
    'sanctuaire.open': 'Open',
    'sanctuaire.title': 'Your sanctuary',
    'sanctuaire.empty': 'Your sanctuary is empty for now. Hatch your first egg!',
    'sanctuaire.careAll': 'Care for all available dragons',
    'sanctuaire.searchPlaceholder': 'Search one of your dragons…',
    'sanctuaire.searchAria': 'Search a dragon',
    'sanctuaire.noSearchResults': 'No dragon matches this search.',
    'sanctuaire.busyExpedition': 'on expedition',
    'sanctuaire.sortRecent': 'Recent',
    'sanctuaire.sortFavorites': 'Favourites',
    'sanctuaire.sortAlpha': 'A-Z',
    'sanctuaire.sortRarity': 'Rarity',
    'objectives.title': 'Objectives',
    'objectives.dailyTitle': "Today's objectives",
    'objectives.weeklyTitle': 'Weekly challenge',
    'objectives.allDone': 'All caught up',
    'objectives.toClaim': '{n} to claim',
    'objectives.dayStreak': '🔥 {n} day{s}',
    'objectives.nextMilestone': '{n} more day(s) to your next streak bonus',
    'objectives.dailyCount': "{n} today's objective{s}",
    'objectives.weeklyCount': '1 weekly challenge',
    'achievements.title': 'Achievements',
    'achievements.titleWithClaim': 'Achievements · {n} to claim',
    'dragondex.discoveredCount': '{n}/{total} discovered',
    'dragondex.filterAll': 'All',
    'dragondex.rarityAll': 'All rarities',
    'dragondex.rarityCommon': 'Common',
    'dragondex.rarityRare': 'Rare',
    'dragondex.rarityEpic': 'Epic',
    'dragondex.rarityLegendary': 'Legendary',
    'dragondex.rarityMythic': 'Mythic',
    'dragondex.searchPlaceholder': 'Search a discovered dragon…',
    'dragondex.searchAria': 'Search a dragon',
    'dragondex.noResults': 'No discovered dragon matches this search.',
    'dragondex.collectionComplete': 'Complete collection',
    'dragondex.collapseBannerAria': 'Collapse banner',
    'dragondex.masterGuardian': 'Master Guardian',
    'dragondex.collectionCompleteDesc': 'All {n} species have been discovered. Complete collection!',
    'dragondex.legendaryBannerText': "Legendary dragons: a rare chance to encounter them on expeditions, especially at the Peak of the Ancient Dragons and during legendary quests. Mythic dragons: pair two legendaries in the Lab, attempt the mythic quest once all six legendaries are gathered, or push to the Eternal Veil with a first mythic already in hand.",
    'dragondex.lockedSuffix': ' (locked)',
    'carte.pathTitle': 'Expedition path',
    'carte.pathSubtitle': 'Advance zone by zone as your level grows.',
    'carte.zoneLevel': 'Level {n}',
    'carte.back': 'Back',
    'carte.chooseDragon': 'Choose a dragon',
    'carte.buildTeam': 'Build your team',
    'carte.noDragonAtAll': 'Hatch a dragon in your sanctuary first.',
    'carte.noDragonAvailable': 'All your dragons are already on an expedition.',
    'carte.noTeamDragons': 'No dragon available for a team.',
    'carte.team': 'Team ({n}/3)',
    'carte.statVigueur': 'Vigor',
    'carte.statEclat': 'Radiance',
    'carte.statHarmonie': 'Harmony',
    'carte.harmonyBonus': '💡 Varied temperaments: harmony bonus active',
    'carte.elementalBonus': '🌈 Varied elements: harvest bonus active',
    'carte.perfectMatchBonus': '🎯 Team perfectly matched to the zone: maximum bonus!',
    'carte.launchExpedition': 'Launch the expedition',
    'carte.expeditionDone': 'Expedition complete!',
    'carte.returnIn': 'Back in {time}',
    'carte.claim': 'Collect',
    'carte.teamSuffix': ' · team',
    'carte.scalesUnit': 'scales',
    'boutique.title': 'Decorations',
    'boutique.subtitle': 'Customize your sanctuary with scales earned by playing — never real money here.',
    'boutique.equipped': 'Equipped ✓',
    'boutique.equip': 'Equip',
    'labo.title': 'Laboratory',
    'labo.subtitle': 'Pair two adult dragons to get an unexpected egg — sometimes even legendary. Unite two legendaries, and the mythic is no longer completely out of reach.',
    'labo.needTwo': 'You need at least 2 adult, unoccupied dragons to attempt a breeding.',
    'labo.choose': 'Choose',
    'labo.choosePicker': 'Choose a parent',
    'labo.closeAria': 'Close',
    'labo.noOtherAdult': 'No other adult dragon available.',
    'labo.availableIn': 'Available in {time}',
    'labo.breed': 'Breed ({cost})',
    'labo.pityLegendary': 'Still {n} attempt(s) without legendary before one is guaranteed',
    'labo.pityLegendaryReady': '✨ Next breed: guaranteed legendary!',
    'labo.pityMythic': 'Still {n} attempt(s) without mythic before one is guaranteed',
    'labo.pityMythicReady': '✨ Next breed: guaranteed mythic!',
    'modal.hatchAria': 'Hatching',
    'modal.hatchMysterious': 'A mysterious egg…',
    'modal.hatchMoving': "It's moving…",
    'modal.hatchReady': 'This is it!',
    'modal.hatchTapButton': '✨ Tap to hatch ({n}/3)',
    'modal.legendaryBadge': '✨ LEGENDARY DRAGON ✨',
    'modal.welcome': 'Welcome {name} ✨',
    'modal.hatchNext': 'Hatch the next one ({n} left)',
    'modal.closeAria': 'Close',
    'modal.removeFavorite': 'Remove from favourites',
    'modal.addFavorite': 'Add to favourites',
    'modal.renameAria': 'Rename this dragon',
    'modal.confirmNameAria': 'Confirm the name',
    'modal.temperamentLabel': 'Temperament: {t}',
    'modal.stageLabel': 'Stage: {s}',
    'modal.careCount': '{n}/{total} care',
    'modal.inExpedition': 'On expedition',
    'modal.pet': 'Pet',
    'modal.cooldownMin': '{n} min left',
    'modal.cooldownSec': '{n}s left',
    'modal.downloadCard': 'Download its card',
    'modal.legendaryNoRelease': 'Legendary dragons cannot be released.',
    'modal.confirmReleaseText': 'Release {name} permanently? (+{n} scales)',
    'modal.cancel': 'Cancel',
    'modal.confirm': 'Confirm',
    'modal.releaseButton': 'Release into the wild (+{n} scales)',
    'modal.speciesUnknownAria': 'Undiscovered dragon',
    'modal.discoverToReveal': 'Discover this dragon on an expedition to reveal its page.',
    'modal.parentalLockAria': 'Parental lock',
    'modal.adultZoneTitle': 'Adults-only area',
    'modal.holdInstructions': 'Hold the button down for a few seconds to continue.',
    'modal.holdAria': 'Hold to unlock',
    'modal.unlocked': 'Unlocked!',
    'modal.resetConfirmAria': 'Confirmation',
    'modal.resetTitle': 'Reset your progress?',
    'modal.resetText': 'All your dragons and progress will be permanently lost.',
    'tutorial.discoverAria': 'Discover Lumidra',
    'tutorial.skip': 'Skip',
    'tutorial.next': 'Next',
    'tutorial.start': "Let's go!",
    'tutorial.slide1Title': 'Your Sanctuary',
    'tutorial.slide1Text': 'This is where your dragons live. Care for them regularly to help them grow, and keep an eye on your daily objectives up top.',
    'tutorial.slide2Title': 'The Map',
    'tutorial.slide2Text': 'Advance zone by zone as you level up, and launch expeditions to bring back scales and new eggs.',
    'tutorial.slide3Title': 'The Dragondex',
    'tutorial.slide3Text': 'Your full collection: discovered species, achievements to unlock, and a search to find a specific dragon.',
    'tutorial.slide4Title': 'Shop & Lab',
    'tutorial.slide4Text': 'The Shop lets you decorate your sanctuary. In Strategist mode, the Laboratory also lets you pair two adult dragons.',
    'importModal.aria': 'Import confirmation',
    'importModal.title': 'Import this save?',
    'importModal.summary': 'Guardian: {name} — {n1} dragon{s1}, {n2} species discovered.',
    'importModal.deviceWarning': 'Your current progress on this device will be replaced by the imported file.',
    'importModal.import': 'Import',
    'toast.noDragonForCare': 'No dragon available for a cuddle right now',
    'toast.caredGrew': '{n} dragon{s} cared for, {g} of which grew up! ✨',
    'toast.caredPlain': '{n} dragon{s} cared for!',
    'toast.grew': '{name} grew up! ✨',
    'toast.dragondexComplete': 'Dragondex complete! You are a Master Guardian ✨🏆',
    'notif.body': 'Your expedition is over — treasure awaits you at the sanctuary! 🐉',
    'toast.expeditionLaunched': 'Expedition launched!',
    'toast.expeditionSpedUp': '⚡ Expedition sped up: the team is already back!',
    'toast.notEnoughScales': 'Not enough scales',
    'toast.eggAppeared': 'An egg appeared in the Laboratory!',
    'toast.mythicEgg': "A mythic egg... it's almost impossible! ✨🌟",
    'toast.legendaryEgg': 'A legendary egg shimmers in your pouch! ✨',
    'toast.gainEggScales': '+{n} scales and a new egg!',
    'toast.gainScales': '+{n} scales',
    'toast.decorUnavailable': 'This decoration is not available right now',
    'toast.decorAdded': '{name} added!',
    'toast.maxDecor': 'Maximum 3 decorations displayed',
    'toast.nameUpdated': 'Name updated',
    'toast.cardDownloaded': "Dragon's card downloaded!",
    'toast.cardError': 'Unable to generate the card',
    'toast.dragonReleased': '{name} released (+{n} scales)',
    'toast.zoneLevelRequired': 'Level {n} required to unlock this zone',
    'toast.corruptedSave': 'Your previous save could not be read — starting fresh, sorry 💛',
    'toast.streakBonus': '🔥 {n}-day streak! +{bonus} scales',
    'toast.streakMilestone': '🔥✨ {n}-day milestone! +{bonus} bonus scales',
    'toast.dailyComboBonus': '⭐ All 3 daily quests done! +{n} bonus scales',
    'toast.collectionMilestone': '📖✨ {n} species discovered! +{bonus} bonus scales',
    'toast.levelUp': '🎉 Level {n} reached!',
    'toast.weeklyChallengeDone': 'Weekly challenge completed! +{n} scales',
    'toast.questReward': '+{n} scales!',
    'toast.achievementUnlocked': 'Achievement unlocked: {name} (+{n} scales)',
    'toast.exportChooseDestination': 'Choose where to save your save file',
    'toast.exportFailed': 'Unable to export the save',
    'toast.exportSuccess': 'Save exported!',
    'toast.importInvalid': 'Invalid save file',
    'toast.importUnreadable': 'Unreadable save file',
    'toast.importReadError': 'Unable to read the file',
    'toast.importSuccess': 'Save imported!',
    'crash.title': 'Oops, something went wrong',
    'crash.message': 'Your save is safe. Just reload the app to continue.',
    'crash.reload': 'Reload',
  },
};
function t(key, vars) {
  const dict = T[state.language] || T.fr;
  let str = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : (T.fr[key] !== undefined ? T.fr[key] : key);
  if (vars) Object.keys(vars).forEach((k) => { str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]); });
  return str;
}

const SPECIES_BY_ID = new Map(SPECIES.map(s => [s.id, s]));
function speciesById(id) { return SPECIES_BY_ID.get(id); }

// Bascule TOUTES les données (espèces, zones, expéditions, décor, succès, titres) sur la
// langue demandée, en dérivant .name/.lore/.desc/.tagline depuis les paires Fr/En stockées.
// Zéro changement nécessaire ailleurs dans le code : tout continue de lire .name/.lore
// comme avant, ce sont juste les valeurs qui changent.
function applyLanguage(lang) {
  const en = lang === 'en';
  RARITY_LABEL = en ? RARITY_LABEL_EN : RARITY_LABEL_FR;
  STAGE_LABEL = en ? STAGE_LABEL_EN : STAGE_LABEL_FR;
  TEMPERAMENTS = en ? TEMPERAMENTS_EN : TEMPERAMENTS_FR;
  Object.values(ELEMENTS).forEach(e => { e.name = en ? e.nameEn : e.nameFr; });
  SPECIES.forEach(s => { s.name = en ? s.nameEn : s.nameFr; s.lore = en ? s.loreEn : s.loreFr; });
  ZONES.forEach(z => { z.name = en ? z.nameEn : z.nameFr; z.lore = en ? z.loreEn : z.loreFr; });
  EXPEDITION_TYPES.forEach(t => { t.name = en ? t.nameEn : t.nameFr; t.tagline = en ? t.taglineEn : t.taglineFr; });
  DECOR.forEach(d => { d.name = en ? d.nameEn : d.nameFr; });
  ACHIEVEMENTS.forEach(a => { a.name = en ? a.nameEn : a.nameFr; a.desc = en ? a.descEn : a.descFr; });
  TITLES.forEach(t => { t.name = en ? t.nameEn : t.nameFr; });
}
function dragonDisplayName(dragon, species) { return (dragon.customName && dragon.customName.trim()) || species.name; }
function computeStage(careCount) { return careCount >= 12 ? 'adulte' : careCount >= 5 ? 'juvenile' : 'bebe'; }
function computeLevel(xp) { return Math.floor(xp / 60) + 1; }
function xpIntoLevel(xp) { return xp % 60; }

// Centralise tous les gains d'XP pour détecter une montée de niveau et la célébrer
// (toast + son + vibration), plutôt que de dupliquer cette détection à chaque appel.
function addXp(amount) {
  const before = computeLevel(state.xp);
  state.xp += amount;
  const after = computeLevel(state.xp);
  if (after > before) {
    setTimeout(() => {
      showToast(t('toast.levelUp', { n: after }));
      playAchievementSound();
      haptic([30, 50, 30, 50, 80]);
    }, 350);
  }
}
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function fmtCountdown(ms) {
  if (ms <= 0) return '00:00';
  const s = Math.ceil(ms / 1000);
  if (s >= 3600) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${String(m).padStart(2, '0')}min`;
  }
  const m = Math.floor(s / 60);
  const r = s % 60;
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
}

function weightedSpeciesFromZone(zone, legendaryChance, mythicChance) {
  if (mythicChance) {
    const mythicPool = SPECIES.filter(s => s.variant === 5 && zone.elements.includes(s.element));
    if (mythicPool.length && Math.random() < mythicChance) {
      return mythicPool[randInt(0, mythicPool.length - 1)];
    }
  }
  if (legendaryChance) {
    const legendaryPool = SPECIES.filter(s => s.variant === 4 && zone.elements.includes(s.element));
    if (legendaryPool.length && Math.random() < legendaryChance) {
      return legendaryPool[randInt(0, legendaryPool.length - 1)];
    }
  }
  const pool = SPECIES.filter(s => zone.elements.includes(s.element) && s.variant < 4);
  const weighted = [];
  pool.forEach(s => { const w = s.variant <= 1 ? 5 : s.variant === 2 ? 2 : 1; for (let i = 0; i < w; i++) weighted.push(s); });
  return weighted[randInt(0, weighted.length - 1)];
}

function allLegendariesDiscovered() {
  return SPECIES.filter(s => s.variant === 4).every(s => state.discovered.includes(s.id));
}
function hasAnyMythic() {
  return state.discovered.some(id => speciesById(id).variant === 5);
}

function computeDragonStats(dragon, zone) {
  const s = speciesById(dragon.speciesId);
  const rarityBase = [30, 30, 45, 60, 85, 115][s.variant];
  const stageBonus = { bebe: 0, juvenile: 8, adulte: 16 }[dragon.stage];
  const vigueur = rarityBase + stageBonus;
  const eclat = rarityBase + stageBonus + (zone.elements.includes(s.element) ? 20 : 0);
  return { vigueur, eclat };
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}


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
      <g class="dragon-tail-swish"><path d="M126,150 C155,148 172,130 178,150 C182,168 165,178 148,172 C138,168 130,160 126,150 Z" fill="url(#${gradId})" stroke="${INK}" stroke-width="3"/></g>
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
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
}


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
  saveStateDebounced();
  showToast(t('toast.weeklyChallengeDone', { n: w.reward }));
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
  saveStateDebounced();
  showToast(t('toast.achievementUnlocked', { name: ach.name, n: ach.reward }));
  haptic([30, 40, 60]);
  playAchievementSound();
  renderTopBar();
  if (ui.screen === 'dragondex') renderScreenDragondex();
}

/* ---- état persistant + état d'interface transitoire ---- */
let state = freshDefaultState();
let saveWasCorrupted = false; // signalé une fois au joueur au démarrage si la sauvegarde était illisible, jamais persisté
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
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible */ }
  }, 300);
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
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible */ }
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


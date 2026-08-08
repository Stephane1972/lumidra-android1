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

// Chaque tempérament donne un petit trait passif distinct et concret — jusqu'ici le
// tempérament n'était qu'une étiquette sans effet ; il influence maintenant vraiment
// le jeu (endurance, cooldown de soin, chance en expédition, XP d'affection).
// L'index (0-3) est la clé canonique : le texte affiché dépend juste de la langue.
function temperamentIndex(dragon) {
  let i = TEMPERAMENTS_FR.indexOf(dragon.temperament);
  if (i === -1) i = TEMPERAMENTS_EN.indexOf(dragon.temperament);
  return i === -1 ? 0 : i;
}
function isLoyalDragon(dragon) { return temperamentIndex(dragon) === 3; }
function isBoldDragon(dragon) { return temperamentIndex(dragon) === 2; }

// state.decorEquipped est désormais un tableau à 3 emplacements fixes (valeurs nullable) pour
// permettre de choisir précisément quelle pièce va à quelle place — les anciennes sauvegardes
// (simple liste compacte, sans null) sont complétées automatiquement au premier accès.
function normalizeDecorSlots() {
  const s = (state.decorEquipped || []).slice(0, 3);
  while (s.length < 3) s.push(null);
  state.decorEquipped = s;
}

// Lien d'attachement : plus on s'occupe d'un dragon précis (careCount cumulé, qui continue
// de grimper même une fois adulte), plus son trait de tempérament se renforce. Trois paliers,
// jamais de régression — le lien ne se perd pas si on espace les câlins.
const BOND_THRESHOLDS = [0, 15, 40]; // careCount requis pour les paliers 1 / 2 / 3
function bondTier(dragon) {
  const c = dragon.careCount || 0;
  if (c >= BOND_THRESHOLDS[2]) return 3;
  if (c >= BOND_THRESHOLDS[1]) return 2;
  return 1;
}
function bondNextThreshold(dragon) {
  const tier = bondTier(dragon);
  return tier >= 3 ? null : BOND_THRESHOLDS[tier];
}
const TRAIT_KEYS = ['calme', 'joueur', 'audacieux', 'loyal'];
// Ampleur de chaque trait selon le palier de lien (1/2/3) : Calme/Joueur/Audacieux en fraction, Loyal en points d'XP fixes.
const TRAIT_MAGNITUDE = {
  calme: [0.15, 0.22, 0.30],
  joueur: [0.20, 0.30, 0.40],
  audacieux: [0.25, 0.35, 0.50],
  loyal: [1, 2, 3],
};
function traitKey(dragon) { return TRAIT_KEYS[temperamentIndex(dragon)]; }
function traitMagnitude(dragon) { return TRAIT_MAGNITUDE[traitKey(dragon)][bondTier(dragon) - 1]; }

function effectiveCareCooldown(dragon) {
  // Joueur : récupère plus vite (ampleur croissante avec le lien), on peut le câliner plus souvent.
  return temperamentIndex(dragon) === 1 ? Math.round(CARE_COOLDOWN_MS * (1 - traitMagnitude(dragon))) : CARE_COOLDOWN_MS;
}
const CARE_COOLDOWN_MS = 90000; // 1 min 30 — un vrai temps de pause, plus une boucle instantanée
const SAVE_KEY = 'lumidra-save-v1';

const SPECIES = [
  { id:'braisor', nameFr:'Braisor', nameEn:'Braisor', element:'feu', variant:0, loreFr:"Petit dragon trapu qui traîne une fumée joueuse derrière lui.", loreEn:"A stocky little dragon that trails a playful wisp of smoke behind it.", almanacFr:"Vit en petits groupes près des cheminées de lave éteintes ; adore chasser les braises volantes.", almanacEn:"Lives in small groups near cooled lava vents and loves chasing stray embers as they drift by." },
  { id:'cendrelle', nameFr:'Cendrelle', nameEn:'Cendrelle', element:'feu', variant:1, loreFr:"Ailes fines couvertes de cendres dorées, toujours en mouvement.", loreEn:"Thin wings dusted with golden ash, forever on the move.", almanacFr:"Niche dans les fissures rocheuses en altitude ; ne reste jamais immobile plus de quelques secondes.", almanacEn:"Nests in high rocky crevices and can rarely sit still for more than a few seconds." },
  { id:'pyrhelios', nameFr:'Pyrhélios', nameEn:'Pyrhelios', element:'feu', variant:2, loreFr:"Sa crête flamboyante réagit à son humeur.", loreEn:"Its blazing crest flares up and down with its mood.", almanacFr:"Territorial mais joueur entre pairs ; sa crête change de couleur selon qu'il est calme, curieux ou excité.", almanacEn:"Territorial yet playful with its own kind — its crest shifts colour between calm, curious and excited." },
  { id:'magmaroth', nameFr:'Magmaroth', nameEn:'Magmaroth', element:'feu', variant:3, loreFr:"Carapace de roche volcanique craquelée, chaleur rassurante.", loreEn:"A shell of cracked volcanic rock, radiating a comforting warmth.", almanacFr:"Se déplace lentement mais franchit sans effort les coulées encore tièdes ; les jeunes gardiens s'y adossent pour se réchauffer.", almanacEn:"Moves slowly but crosses still-warm lava flows with ease; young Guardians often lean against it to warm up." },
  { id:'goutelin', nameFr:'Goutelin', nameEn:'Droplin', element:'eau', variant:0, loreFr:"Translucide, il rebondit comme une bulle.", loreEn:"Translucent, it bounces about like a soap bubble.", almanacFr:"Vit en bancs près de la surface des mares calmes ; se laisse porter par le courant plutôt que de nager.", almanacEn:"Lives in loose schools near the surface of calm pools, drifting with the current more than swimming." },
  { id:'nageoline', nameFr:'Nageoline', nameEn:'Finnelle', element:'eau', variant:1, loreFr:"Ses nageoires en éventail changent de teinte avec la météo.", loreEn:"Its fan-shaped fins shift colour with the weather.", almanacFr:"Change de teinte selon la pression atmosphérique, ce qui en fait un baromètre vivant pour les pêcheurs locaux.", almanacEn:"Shifts colour with air pressure, making it a living barometer for local fishers." },
  { id:'brumael', nameFr:'Brumael', nameEn:'Mistael', element:'eau', variant:2, loreFr:"Enveloppé d'une brume permanente, curieux et discret.", loreEn:"Wrapped in a permanent mist, curious yet shy.", almanacFr:"Ne sort de sa brume que pour observer les visiteurs de loin, avant de disparaître à nouveau.", almanacEn:"Only steps out of its mist to watch visitors from a distance before vanishing again." },
  { id:'abyssia', nameFr:'Abyssia', nameEn:'Abyssia', element:'eau', variant:3, loreFr:"Serpentin bioluminescent, plus actif la nuit.", loreEn:"A bioluminescent ribbon, most active after dark.", almanacFr:"Dort le jour dans les grottes sous-marines et ne s'illumine qu'à la tombée de la nuit.", almanacEn:"Sleeps by day in underwater caves and only lights up once night falls." },
  { id:'argilon', nameFr:'Argilon', nameEn:'Clayon', element:'terre', variant:0, loreFr:"Peau craquelée façon argile séchée au soleil.", loreEn:"Skin cracked like sun-baked clay.", almanacFr:"Se love dans la terre sèche pour se protéger de la chaleur ; sa peau craquelle un peu plus chaque saison.", almanacEn:"Burrows into dry earth to escape the heat — its skin cracks a little more with every passing season." },
  { id:'mousselin', nameFr:'Mousselin', nameEn:'Mossling', element:'terre', variant:1, loreFr:"Recouvert de mousse vivante, doux au toucher.", loreEn:"Covered in living moss, soft to the touch.", almanacFr:"Sa mousse abrite parfois de minuscules insectes ; il ne s'en formalise jamais et les protège plutôt.", almanacEn:"Tiny insects sometimes live in its moss — it never minds and tends to shelter them instead." },
  { id:'racinelle', nameFr:'Racinelle', nameEn:'Rootelle', element:'terre', variant:2, loreFr:"Sa queue en racines se couvre de fleurs au printemps.", loreEn:"Its root-like tail blooms with flowers every spring.", almanacFr:"Reste immobile des heures durant, confondu avec un jeune arbre, avant de fleurir soudainement au printemps.", almanacEn:"Can stay perfectly still for hours, mistaken for a young sapling, before suddenly blooming each spring." },
  { id:'gravalor', nameFr:'Gravalor', nameEn:'Gravalor', element:'terre', variant:3, loreFr:"Écailles de granit, ses pas résonnent légèrement.", loreEn:"Granite scales — its footsteps echo faintly.", almanacFr:"Marche si lentement que la mousse a le temps de pousser sur son dos entre deux déplacements.", almanacEn:"Walks so slowly that moss has time to grow on its back between one move and the next." },
  { id:'brisalys', nameFr:'Brisalys', nameEn:'Brisalys', element:'air', variant:0, loreFr:"Ailes en feuille, il plane plus qu'il ne vole.", loreEn:"Leaf-shaped wings — it glides more than it flies.", almanacFr:"Préfère planer dans les courants ascendants plutôt que de battre des ailes ; économise ainsi son énergie toute la journée.", almanacEn:"Prefers riding updrafts to flapping its wings, saving its energy for the whole day." },
  { id:'voltine', nameFr:"Vol'tine", nameEn:"Voltine", element:'air', variant:1, loreFr:"Vive et joueuse, elle adore les loopings.", loreEn:"Quick and playful, she loves a good loop-the-loop.", almanacFr:"Capable d'enchaîner une dizaine de loopings sans jamais perdre le nord ; adore impressionner les autres dragons.", almanacEn:"Can chain a dozen loop-the-loops without ever losing its bearings, and loves showing off to other dragons." },
  { id:'cirrusca', nameFr:'Cirrusca', nameEn:'Cirrusca', element:'air', variant:2, loreFr:"Son corps semble fait de nuages compressés.", loreEn:"Its body seems woven from compressed clouds.", almanacFr:"Change légèrement de forme selon le vent, un peu comme un vrai nuage qui se reconfigure sans cesse.", almanacEn:"Subtly reshapes itself with the wind, much like a real cloud constantly reforming." },
  { id:'plumzephyr', nameFr:'Plumzéphyr', nameEn:'Plumzephyr', element:'air', variant:3, loreFr:"Ailes immenses qui chantent avec le vent.", loreEn:"Enormous wings that sing with the wind.", almanacFr:"Ses grandes ailes produisent un chant différent selon la force du vent ; les anciens s'en servent pour prévoir la météo.", almanacEn:"Its huge wings sing a different tune depending on wind strength — elders use the sound to predict the weather." },
  { id:'lumeo', nameFr:'Lumeo', nameEn:'Lumeo', element:'lumiere', variant:0, loreFr:"Sa lueur douce sert de veilleuse vivante.", loreEn:"Its gentle glow works as a living night light.", almanacFr:"S'installe volontiers près des chambres des jeunes gardiens ; sa lumière faiblit doucement quand vient l'heure de dormir.", almanacEn:"Happily settles near young Guardians' rooms — its glow gently dims when it's time to sleep." },
  { id:'clarinelle', nameFr:'Clarinelle', nameEn:'Clarinelle', element:'lumiere', variant:1, loreFr:"Écailles iridescentes qui projettent de petits arcs-en-ciel.", loreEn:"Iridescent scales that cast tiny rainbows.", almanacFr:"Ses écailles dispersent la lumière du matin en petits arcs-en-ciel qui dansent sur les murs alentour.", almanacEn:"Its scales scatter the morning light into tiny rainbows that dance across nearby walls." },
  { id:'auralia', nameFr:'Auralia', nameEn:'Auralia', element:'lumiere', variant:2, loreFr:"Un halo doré permanent l'entoure.", loreEn:"A permanent golden halo surrounds it.", almanacFr:"Son halo doré ne brille jamais plus fort que lorsqu'elle se sent entourée d'amis.", almanacEn:"Its golden halo never shines brighter than when it feels surrounded by friends." },
  { id:'solarys', nameFr:'Solarys', nameEn:'Solarys', element:'lumiere', variant:3, loreFr:"Son motif rayonne à midi, gardien du jour selon la légende.", loreEn:"Its pattern glows brightest at noon — legend calls it the keeper of the day.", almanacFr:"Se tourne instinctivement vers le soleil de midi, quelle que soit son activité du moment.", almanacEn:"Instinctively turns to face the noon sun, whatever else it happens to be doing." },
  { id:'feuillon', nameFr:'Feuillon', nameEn:'Leaflet', element:'nature', variant:0, loreFr:"Écailles façon jeunes pousses, il grandit avec le printemps.", loreEn:"Scales like fresh shoots — it grows along with spring.", almanacFr:"Ses écailles verdissent un peu plus chaque jour de printemps, comme de vraies jeunes pousses.", almanacEn:"Its scales grow a little greener with every spring day, just like real fresh shoots." },
  { id:'bourgette', nameFr:'Bourgette', nameEn:'Buddette', element:'nature', variant:1, loreFr:"De petites fleurs éclosent sur son dos.", loreEn:"Tiny flowers bloom along its back.", almanacFr:"Les petites fleurs sur son dos attirent parfois des papillons, qu'elle laisse volontiers se poser.", almanacEn:"The tiny flowers on its back sometimes attract butterflies, which it happily lets land." },
  { id:'lianor', nameFr:'Lianor', nameEn:'Vinor', element:'nature', variant:2, loreFr:"Sa queue en liane fleurie ne cesse jamais de pousser.", loreEn:"Its flowering vine tail never stops growing.", almanacFr:"Sa queue fleurie continue de pousser toute sa vie ; les plus vieux spécimens la portent en tresse.", almanacEn:"Its flowering vine tail keeps growing throughout its life — the oldest ones wear it braided." },
  { id:'sylvandre', nameFr:'Sylvandre', nameEn:'Sylvandre', element:'nature', variant:3, loreFr:"Allure de vieux chêne vivant, mémoire de la forêt.", loreEn:"Looks like a living old oak — a memory of the forest itself.", almanacFr:"Les oiseaux nichent parfois dans son ramage sans qu'il ne s'en aperçoive, tant il reste immobile.", almanacEn:"Birds sometimes nest in its branch-like antlers without it even noticing, it stays so still." },
  // Légendaires — extrêmement rares, aperçus surtout lors des quêtes légendaires et à la Cime des Anciens Dragons.
  { id:'ignarok', nameFr:'Ignarok', nameEn:'Ignarok', element:'feu', variant:4, loreFr:"Dragon de braise ancestrale, on dit qu'il dort au cœur des volcans depuis des siècles.", loreEn:"An ancestral ember dragon, said to have slept inside volcanoes for centuries.", almanacFr:"Ne se réveille que tous les quelques siècles ; sa dernière apparition confirmée remonte à plusieurs générations de gardiens.", almanacEn:"Only wakes once every few centuries — its last confirmed sighting predates several generations of Guardians." },
  { id:'leviatriss', nameFr:'Léviatriss', nameEn:'Leviatriss', element:'eau', variant:4, loreFr:"Créature abyssale légendaire, ses écailles scintillent comme des étoiles sous l'eau.", loreEn:"A legendary deep-sea creature whose scales glimmer like underwater stars.", almanacFr:"Nul filet ni expédition n'a jamais pu l'approcher de près ; on ne le connaît que par les récits de marins.", almanacEn:"No net or expedition has ever gotten close — it is known only through sailors' tales." },
  { id:'terragorn', nameFr:'Terragorn', nameEn:'Terragorn', element:'terre', variant:4, loreFr:"Géant de pierre vivante, chaque pas fait naître une nouvelle montagne, dit la légende.", loreEn:"A giant of living stone — legend says a new mountain rises with every step it takes.", almanacFr:"Certaines chaînes de montagnes porteraient encore la trace de ses tout premiers pas, selon la légende.", almanacEn:"Legend holds that some mountain ranges still bear the mark of its very first steps." },
  { id:'zephyrion', nameFr:'Zéphyrion', nameEn:'Zephyrion', element:'air', variant:4, loreFr:"Maître des tempêtes, invisible sauf quand il choisit de se montrer.", loreEn:"Master of storms, invisible unless it chooses to be seen.", almanacFr:"On dit qu'il ne se montre qu'aux gardiens dont le cœur est parfaitement calme, même en pleine tempête.", almanacEn:"Said to reveal itself only to Guardians whose heart stays perfectly calm, even in the eye of a storm." },
  { id:'aurelios', nameFr:'Aurélios', nameEn:'Aurelios', element:'lumiere', variant:4, loreFr:"Dragon solaire mythique, son envol dessinerait l'aube selon les anciens récits.", loreEn:"A mythical sun dragon — old tales say its flight paints the dawn itself.", almanacFr:"Les récits les plus anciens racontent que le tout premier lever de soleil aurait suivi son vol.", almanacEn:"The oldest tales claim the very first sunrise followed in the path of its flight." },
  { id:'sylvamater', nameFr:'Sylvamater', nameEn:'Sylvamater', element:'nature', variant:4, loreFr:"Esprit ancien de la forêt, on ne le voit qu'une fois par génération de gardiens.", loreEn:"An ancient forest spirit, glimpsed only once per generation of Guardians.", almanacFr:"Chaque génération de gardiens ne le croise qu'une seule fois, et jamais deux fois au même endroit.", almanacEn:"Each generation of Guardians crosses its path only once — and never twice in the same place." },
  // Mythiques — au-delà même des légendaires. On ne les obtient qu'en unissant deux dragons
  // légendaires au Laboratoire, ou tout en haut de la Cime, une fois tous les légendaires rencontrés.
  { id:'ignisia', nameFr:'Ignisia', nameEn:'Ignisia', element:'feu', variant:5, loreFr:"On dit qu'elle porte en elle la toute première étincelle, avant même le premier volcan.", loreEn:"Said to carry the very first spark, from before the first volcano ever formed.", almanacFr:"Certains récits la disent née avant même que la terre ait un nom ; nul ne sait où elle se repose.", almanacEn:"Some tales claim it existed before the earth itself had a name; no one knows where it rests." },
  { id:'thalassor', nameFr:'Thalassor', nameEn:'Thalassor', element:'eau', variant:5, loreFr:"Nul n'a vu le fond de l'océan qu'il habite — seuls ses reflets remontent parfois à la surface.", loreEn:"No one has seen the bottom of the ocean it calls home — only its glimmer ever reaches the surface.", almanacFr:"Aucune expédition n'a jamais atteint les profondeurs qu'il habite ; on ne le devine qu'à son reflet.", almanacEn:"No expedition has ever reached the depths it calls home — it is only ever glimpsed by its glimmer." },
  { id:'terrastrum', nameFr:'Terrastrum', nameEn:'Terrastrum', element:'terre', variant:5, loreFr:"Ses écailles renferment, dit-on, un fragment de chaque montagne jamais formée.", loreEn:"Its scales are said to hold a fragment of every mountain that has ever formed.", almanacFr:"Chaque fragment de montagne qu'il renferme raconterait, dit-on, l'histoire d'un sommet oublié.", almanacEn:"Each mountain fragment it holds is said to carry the story of a forgotten peak." },
  { id:'ouranis', nameFr:'Ouranis', nameEn:'Ouranis', element:'air', variant:5, loreFr:"Il ne se pose jamais — certains gardiens jurent qu'il porte le ciel lui-même sur son dos.", loreEn:"It never lands — some Guardians swear it carries the sky itself on its back.", almanacFr:"Aucun gardien n'a jamais pu confirmer s'il possède seulement un lieu où se poser.", almanacEn:"No Guardian has ever confirmed whether it even has a place it calls home to land." },
  { id:'luminae', nameFr:'Luminae', nameEn:'Luminae', element:'lumiere', variant:5, loreFr:"Sa lumière ne projette aucune ombre — un mystère que même les plus vieux récits n'expliquent pas.", loreEn:"Its light casts no shadow — a mystery even the oldest tales cannot explain.", almanacFr:"Les plus vieux almanachs le décrivent déjà ainsi, sans qu'aucune génération n'ait pu percer son secret.", almanacEn:"The oldest almanacs already described it this way, and no generation has managed to solve its mystery." },
  { id:'gaiane', nameFr:'Gaïane', nameEn:'Gaiane', element:'nature', variant:5, loreFr:"On raconte qu'elle a vu pousser le premier arbre, et qu'elle veille sur tous ceux qui ont suivi.", loreEn:"Said to have watched the very first tree grow, and to have watched over every one since.", almanacFr:"Chaque arbre planté par un gardien serait, selon la légende, un petit hommage à sa veille silencieuse.", almanacEn:"Legend says every tree a Guardian plants is a small tribute to its silent, ever-watchful care." },
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
  // --- Permanent : Lumière ---
  { id:'lanterne', nameFr:'Lanterne de Papier', nameEn:'Paper Lantern', cost:150, element:'lumiere' },
  { id:'autel', nameFr:'Autel Ancien', nameEn:'Ancient Altar', cost:420, element:'lumiere' },
  { id:'autel-astral', nameFr:'Autel Astral', nameEn:'Astral Altar', cost:650, element:'lumiere', shape:'gem' },
  { id:'orbe-astral', nameFr:'Orbe Astral', nameEn:'Astral Orb', cost:420, element:'lumiere', shape:'orb' },
  { id:'miroir-lune', nameFr:'Miroir de Lune', nameEn:'Moon Mirror', cost:380, element:'lumiere', shape:'gem' },
  { id:'brule-encens', nameFr:'Brûle-Encens', nameEn:'Incense Burner', cost:260, element:'lumiere', shape:'container' },
  { id:'vitrail-ancien', nameFr:'Vitrail Ancien', nameEn:'Ancient Stained Glass', cost:440, element:'lumiere', shape:'banner' },
  { id:'horloge-solaire', nameFr:'Horloge Solaire', nameEn:'Sundial', cost:400, element:'lumiere', shape:'charm' },
  // --- Permanent : Feu ---
  { id:'flamme-eternelle', nameFr:'Flamme Éternelle', nameEn:'Eternal Flame', cost:520, element:'feu' },
  { id:'flamme-primordiale', nameFr:'Flamme Primordiale', nameEn:'Primordial Flame', cost:720, element:'feu', shape:'flame' },
  { id:'torche-forge', nameFr:'Torche de Forge', nameEn:'Forge Torch', cost:200, element:'feu', shape:'flame' },
  { id:'brasero-ancien', nameFr:'Brasero Ancien', nameEn:'Ancient Brazier', cost:380, element:'feu', shape:'container' },
  // --- Permanent : Eau ---
  { id:'bassin', nameFr:'Bassin de Nénuphars', nameEn:'Lily Pond', cost:220, element:'eau' },
  { id:'fontaine-celeste', nameFr:'Fontaine Céleste', nameEn:'Celestial Fountain', cost:340, element:'eau', shape:'container' },
  { id:'etang-koi', nameFr:'Étang aux Koïs', nameEn:'Koi Pond', cost:300, element:'eau', shape:'orb' },
  { id:'puits-voeux', nameFr:'Puits aux Vœux', nameEn:'Wishing Well', cost:260, element:'eau', shape:'container' },
  // --- Permanent : Terre ---
  { id:'banc', nameFr:'Banc de Pierre', nameEn:'Stone Bench', cost:180, element:'terre' },
  { id:'statue-ancien', nameFr:'Statue de Gardien', nameEn:'Guardian Statue', cost:480, element:'terre' },
  { id:'rocher-runique', nameFr:'Rocher Runique', nameEn:'Runic Boulder', cost:240, element:'terre', shape:'statue' },
  { id:'totem-anciens', nameFr:'Totem des Anciens', nameEn:'Totem of the Ancients', cost:460, element:'terre', shape:'statue' },
  { id:'passerelle-bois', nameFr:'Passerelle de Bois', nameEn:'Wooden Footbridge', cost:220, element:'terre', shape:'container' },
  { id:'cabane-miniature', nameFr:'Cabane Miniature', nameEn:'Miniature Cabin', cost:400, element:'terre', shape:'container' },
  // --- Permanent : Air ---
  { id:'cristal', nameFr:'Cristal Lumineux', nameEn:'Glowing Crystal', cost:300, element:'air' },
  { id:'carillon', nameFr:'Carillon de Vent', nameEn:'Wind Chime', cost:340, element:'air' },
  { id:'moulin-vent', nameFr:'Moulin à Vent', nameEn:'Windmill', cost:280, element:'air', shape:'charm' },
  { id:'plume-suspendue', nameFr:'Plume Suspendue', nameEn:'Hanging Feather', cost:190, element:'air', shape:'banner' },
  { id:'girouette-dragon', nameFr:'Girouette Dragon', nameEn:'Dragon Weathervane', cost:360, element:'air', shape:'charm' },
  { id:'colonne-brise', nameFr:'Colonne de Brise', nameEn:'Breeze Column', cost:320, element:'air', shape:'gem' },
  // --- Permanent : Nature ---
  { id:'arche', nameFr:'Arche Fleurie', nameEn:'Flowered Arch', cost:260, element:'nature' },
  { id:'bosquet-bambous', nameFr:'Bosquet de Bambous', nameEn:'Bamboo Grove', cost:260, element:'nature', shape:'plant' },
  { id:'ruche-doree', nameFr:'Ruche Dorée', nameEn:'Golden Beehive', cost:300, element:'nature', shape:'container' },
  { id:'jardin-mousse', nameFr:'Jardin de Mousse', nameEn:'Moss Garden', cost:200, element:'nature', shape:'plant' },
  { id:'balancelle-jardin', nameFr:'Balancelle de Jardin', nameEn:'Garden Swing', cost:340, element:'nature', shape:'statue' },
  { id:'tapis-petales', nameFr:'Tapis de Pétales', nameEn:'Petal Carpet', cost:180, element:'nature', shape:'plant' },
  // --- Saisonnier : Été ---
  { id:'voile-solaire', nameFr:'Voile Solaire', nameEn:'Solar Sail', cost:260, seasonal:'ete', element:'lumiere' },
  { id:'etoile-mer-doree', nameFr:'Étoile de Mer Dorée', nameEn:'Golden Starfish', cost:240, seasonal:'ete', element:'eau', shape:'charm' },
  { id:'parasol-plage', nameFr:'Parasol de Plage', nameEn:'Beach Parasol', cost:260, seasonal:'ete', element:'lumiere', shape:'banner' },
  // --- Saisonnier : Automne ---
  { id:'citrouille-doree', nameFr:'Citrouille Dorée', nameEn:'Golden Pumpkin', cost:260, seasonal:'automne', element:'terre' },
  { id:'guirlande-feuilles', nameFr:'Guirlande de Feuilles', nameEn:'Leaf Garland', cost:220, seasonal:'automne', element:'terre', shape:'plant' },
  { id:'panier-recolte', nameFr:'Panier de Récolte', nameEn:'Harvest Basket', cost:240, seasonal:'automne', element:'terre', shape:'container' },
  // --- Saisonnier : Hiver ---
  { id:'guirlande-etoilee', nameFr:'Guirlande Étoilée', nameEn:'Starry Garland', cost:260, seasonal:'hiver', element:'lumiere' },
  { id:'bonhomme-neige', nameFr:'Bonhomme de Neige', nameEn:'Snowman', cost:260, seasonal:'hiver', element:'eau', shape:'orb' },
  { id:'couronne-houx', nameFr:'Couronne de Houx', nameEn:'Holly Wreath', cost:220, seasonal:'hiver', element:'nature', shape:'plant' },
  // --- Saisonnier : Printemps ---
  { id:'bouquet-cerisier', nameFr:'Bouquet de Fleurs de Cerisier', nameEn:'Cherry Blossom Bouquet', cost:240, seasonal:'printemps', element:'nature', shape:'plant' },
  { id:'nid-oiseau', nameFr:"Nid d'Oiseau Printanier", nameEn:'Spring Bird Nest', cost:200, seasonal:'printemps', element:'nature', shape:'container' },
  { id:'papillon-jade', nameFr:'Papillon de Jade', nameEn:'Jade Butterfly', cost:280, seasonal:'printemps', element:'nature', shape:'charm' },
  // --- Exclusifs : Voie du Gardien (obtenus uniquement via les paliers, jamais en boutique) ---
  { id:'lanterne-gardien', nameFr:'Lanterne du Gardien', nameEn:"Guardian's Lantern", cost:0, passOnly:true, element:'lumiere', shape:'charm' },
  { id:'brasier-gardien', nameFr:'Brasier du Gardien', nameEn:"Guardian's Brazier", cost:0, passOnly:true, element:'feu', shape:'flame' },
  { id:'stele-gardien', nameFr:'Stèle du Gardien', nameEn:"Guardian's Stele", cost:0, passOnly:true, element:'terre', shape:'statue' },
  { id:'aile-gardien', nameFr:'Aile de Cristal du Gardien', nameEn:"Guardian's Crystal Wing", cost:0, passOnly:true, element:'air', shape:'gem' },
];

// Paliers intermédiaires de la collection (avant les 100%), pour donner un cap régulier à viser.
const COLLECTION_MILESTONES = [6, 12, 18, 24, 30];

// La Voie du Gardien : une progression permanente (jamais de reset, jamais de date limite)
// alimentée par tout ce que le joueur fait déjà (quêtes, défi hebdo, séries, hauts faits).
// Chaque palier se débloque à un seuil cumulé de points et se réclame manuellement.
const PASS_TIERS = [
  { tier: 1, threshold: 40, reward: { type: 'ecailles', amount: 30 } },
  { tier: 2, threshold: 100, reward: { type: 'ecailles', amount: 40 } },
  { tier: 3, threshold: 170, reward: { type: 'ecailles', amount: 45 } },
  { tier: 4, threshold: 250, reward: { type: 'ecailles', amount: 50 } },
  { tier: 5, threshold: 340, reward: { type: 'decor', id: 'lanterne-gardien' } },
  { tier: 6, threshold: 440, reward: { type: 'ecailles', amount: 60 } },
  { tier: 7, threshold: 550, reward: { type: 'ecailles', amount: 65 } },
  { tier: 8, threshold: 670, reward: { type: 'ecailles', amount: 70 } },
  { tier: 9, threshold: 800, reward: { type: 'ecailles', amount: 75 } },
  { tier: 10, threshold: 940, reward: { type: 'decor', id: 'brasier-gardien' } },
  { tier: 11, threshold: 1100, reward: { type: 'ecailles', amount: 90 } },
  { tier: 12, threshold: 1270, reward: { type: 'ecailles', amount: 95 } },
  { tier: 13, threshold: 1450, reward: { type: 'ecailles', amount: 100 } },
  { tier: 14, threshold: 1640, reward: { type: 'ecailles', amount: 105 } },
  { tier: 15, threshold: 1840, reward: { type: 'decor', id: 'stele-gardien' } },
  { tier: 16, threshold: 2060, reward: { type: 'ecailles', amount: 120 } },
  { tier: 17, threshold: 2290, reward: { type: 'ecailles', amount: 125 } },
  { tier: 18, threshold: 2530, reward: { type: 'ecailles', amount: 130 } },
  { tier: 19, threshold: 2780, reward: { type: 'ecailles', amount: 140 } },
  { tier: 20, threshold: 3040, reward: { type: 'decor', id: 'aile-gardien' } },
];

// Ajoute des points à la Voie du Gardien et prévient si un nouveau palier vient de s'ouvrir
// (le joueur doit ensuite le réclamer lui-même depuis l'écran de la Voie).
function addPassPoints(amount) {
  if (!amount) return;
  const before = PASS_TIERS.filter(pt => state.passPoints >= pt.threshold).length;
  state.passPoints += amount;
  const after = PASS_TIERS.filter(pt => state.passPoints >= pt.threshold).length;
  saveStateDebounced();
  if (after > before) {
    setTimeout(() => showToast(t('toast.passTierReady'), 'milestone'), 500);
  }
}

function passTiersUnlockedCount() {
  return PASS_TIERS.filter(pt => state.passPoints >= pt.threshold).length;
}

function claimPassTier(tierNumber) {
  const pt = PASS_TIERS.find(p => p.tier === tierNumber);
  if (!pt || state.passClaimedTiers.includes(tierNumber) || state.passPoints < pt.threshold) return;
  state.passClaimedTiers.push(tierNumber);
  if (pt.reward.type === 'ecailles') {
    state.ecailles += pt.reward.amount;
    showToast(t('toast.passReward', { n: pt.reward.amount }));
  } else if (pt.reward.type === 'decor') {
    if (!state.decorOwned.includes(pt.reward.id)) state.decorOwned.push(pt.reward.id);
    showToast(t('toast.passRewardDecor'));
  }
  haptic([20, 30, 50]);
  playAchievementSound();
  saveStateDebounced();
  renderTopBar();
  renderModals();
}

/* =========================================================================
   PROFIL DE GARDIEN — comparaison asynchrone entre joueurs via un petit code
   texte (pas de serveur : tout se fait en local, le code s'échange à la main
   ou par message). Aucun classement mondial, aucun "perdant" affiché : juste
   deux profils côte à côte pour se situer entre amis.
   ========================================================================= */
const GUARDIAN_CODE_VERSION = 1;

function guardianProfileStats() {
  return {
    v: GUARDIAN_CODE_VERSION,
    name: (state.gardienName || 'Gardien').slice(0, 16),
    level: computeLevel(state.xp),
    discovered: state.discovered.length,
    total: SPECIES.length,
    legendary: state.discovered.filter(id => speciesById(id).variant === 4).length,
    mythic: state.discovered.filter(id => speciesById(id).variant === 5).length,
    passTier: state.passClaimedTiers.length,
    streak: state.longestStreak || 0,
  };
}

function encodeGuardianCode(stats) {
  const payload = [stats.v, stats.name, stats.level, stats.discovered, stats.total, stats.legendary, stats.mythic, stats.passTier, stats.streak].join('|');
  try {
    return 'LMD1-' + btoa(unescape(encodeURIComponent(payload)));
  } catch (e) {
    return null;
  }
}

function decodeGuardianCode(code) {
  if (!code) return null;
  const trimmed = code.trim().replace(/^LMD1-/, '');
  try {
    const payload = decodeURIComponent(escape(atob(trimmed)));
    const parts = payload.split('|');
    if (parts.length !== 9) return null;
    const [v, name, level, discovered, total, legendary, mythic, passTier, streak] = parts;
    const nums = [level, discovered, total, legendary, mythic, passTier, streak].map(Number);
    if (nums.some(n => !Number.isFinite(n) || n < 0)) return null;
    return {
      v: Number(v), name: (name || 'Gardien').slice(0, 16),
      level: nums[0], discovered: nums[1], total: nums[2],
      legendary: nums[3], mythic: nums[4], passTier: nums[5], streak: nums[6],
    };
  } catch (e) {
    return null;
  }
}

function addRivalComparison(decoded) {
  state.rivalComparisons = state.rivalComparisons || [];
  state.rivalComparisons.unshift({ id: uid('rival'), comparedAt: Date.now(), ...decoded });
  state.rivalComparisons = state.rivalComparisons.slice(0, 6);
  saveStateDebounced();
}

function removeRivalComparison(id) {
  state.rivalComparisons = (state.rivalComparisons || []).filter(r => r.id !== id);
  saveStateDebounced();
}

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
  passPoints: 0,
  passClaimedTiers: [],
  rivalComparisons: [],
  accessoriesOwned: [],
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
    decorOwned: [], decorEquipped: [], achievementsClaimed: [], dailyQuests: null, weeklyChallenge: null, expeditionLog: [], passClaimedTiers: [], rivalComparisons: [], accessoriesOwned: [],
  });
}

/* ---- utilitaires purs ---- */

function uid(prefix) { return prefix + '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

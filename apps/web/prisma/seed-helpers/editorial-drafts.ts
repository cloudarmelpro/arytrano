/**
 * E-T07 Batch C follow-up — DRAFT editorial content for the 29
 * quartiers across the 4 new cities (Antananarivo, Toamasina,
 * Mahajanga, Toliara).
 *
 * ⚠️  THIS IS PLACEHOLDER CONTENT. Generated from general urban
 *     knowledge — campus locations, district reputations, common
 *     transport infrastructure. It is NOT the editorial voice that
 *     Fianarantsoa got (which was written from on-the-ground
 *     interviews with students). Treat every entry as a v0 draft
 *     ready to be refined post-launch via `/admin/geo`.
 *
 * Why bundle as seed-helpers instead of i18n keys :
 *  - These strings live in the `Neighborhood.editorial` JSONB column
 *    (Batch A + B), not in `lib/i18n/messages/*.ts`. The DB is the
 *    runtime source of truth now — adding ~360 message keys for
 *    placeholder content would bloat the i18n typing chain for no
 *    user-facing benefit.
 *  - When the admin refines a row via `/admin/geo`, the DB write
 *    overrides this draft permanently. Next seed run preserves the
 *    refined content (upsert keeps the latest editorial).
 *
 * Wait — the `seed.ts` upsert UPDATEs editorial on every run. So if
 * an admin refines the content, then someone re-seeds, the refined
 * content is lost. This is a known limitation : v1 launch convention
 * is "seed runs once at deploy, admins edit after that". We'll add
 * a "skip if editorial != null on UPDATE" guard once Batch C2 ships
 * (the quizProfile admin form) and the refine-then-reseed flow
 * becomes routine.
 */

import type { EditorialPayload } from './neighborhood-payload'

// Keep this typed so a malformed entry fails the seed compile, not
// production runtime when an admin opens the page.
export const DRAFT_EDITORIAL: Record<string, EditorialPayload> = {
  // ===================== ANTANANARIVO =====================
  ankatso: {
    fr: {
      tagline: 'Quartier étudiant historique, sous le campus universitaire',
      landmark: 'Université d\'Antananarivo · Campus Ankatso',
      ambiance:
        'Très animé en semaine pendant l\'année scolaire — pics de fréquentation autour des amphis et de la cité universitaire. Plus calme en juillet-août.',
      walk:
        'Faculté des Sciences · Faculté de Lettres · Cité universitaire Ankatso · Cantines étudiantes',
      transport: 'Taxi-be lignes 116 / 119 vers Analakely · Bajaj courants',
      distance: '15-20 min du centre via taxi-be',
    },
    mg: {
      tagline:
        'Faritra mpianatra manan-tantara, eo ambanin\'ny anjerimanontolo',
      landmark: 'Anjerimanontolon\'Antananarivo · Campus Ankatso',
      ambiance:
        'Mavitrika tsara mandritra ny taom-pianarana — mihamaro ny olona manodidina ny amphi sy ny tobim-pianarana. Tony bebe kokoa ny volana jolay-aogositra.',
      walk:
        'Sampam-piofanana Siansa · Sampam-piofanana Taranja · Toby tobim-pianarana Ankatso · Toeram-pisakafoanana ho an\'ny mpianatra',
      transport:
        'Taxi-be laharana 116 / 119 mankany Analakely · Bajaj betsaka',
      distance: '15-20 minitra avy any afovoan-tanàna',
    },
  },
  ankaditapaka: {
    fr: {
      tagline: 'Central, dense, vie de quartier animée',
      landmark: 'Marchés locaux · Écoles privées',
      ambiance:
        'Très vivant la journée — commerces, gargotes, étudiants des lycées voisins. Soir plus calme mais éclairé.',
      walk:
        'Lycée Jules-Ferry à 5 min · Commerces de proximité · Pharmacie de garde',
      transport: 'Taxi-be ligne 1 · Bajaj · 10 min de marche d\'Analakely',
      distance: '8 min d\'Analakely à pied',
    },
    mg: {
      tagline: 'Afovoany, feno, fiainana mavitrika',
      landmark: 'Tsenan-tanàna · Sekoly tsy miankina',
      ambiance:
        'Tena velona mandritra ny andro — fivarotana, hotely, mpianatra avy any amin\'ny lisea akaiky. Tony kokoa ny alina nefa misy jiro.',
      walk:
        'Lisea Jules-Ferry 5 minitra · Fivarotana akaiky · Pharmacie',
      transport: 'Taxi-be laharana 1 · Bajaj · 10 minitra an-tongotra avy any Analakely',
      distance: '8 minitra an-tongotra avy Analakely',
    },
  },
  mahamasina: {
    fr: {
      tagline: 'Le stade, les lycées, et la rocade : un classique étudiant',
      landmark: 'Stade Mahamasina · Lycée Jules-Ferry',
      ambiance:
        'Mix lycéens, étudiants, familles. Très animé les jours de match — sinon flux régulier de monde toute la semaine.',
      walk:
        'Stade · Lycée Jules-Ferry · Bibliothèque Albert-Camus · Boulangeries',
      transport: 'Taxi-be lignes 117 / 162 · Bajaj 24/7',
      distance: '12 min d\'Analakely',
    },
    mg: {
      tagline: 'Ny kianja, ny lisea, sy ny rocade : iray amin\'ny mahazatra ho an\'ny mpianatra',
      landmark: 'Kianjan\'i Mahamasina · Lisea Jules-Ferry',
      ambiance:
        'Mifangaroharo : lisea, mpianatra, fianakaviana. Tena mavitrika ireo andro misy lalao — afatsy izay, betsaka foana ny olona mandritra ny herinandro.',
      walk:
        'Kianja · Lisea Jules-Ferry · Tranom-boky Albert-Camus · Mpanao mofo',
      transport: 'Taxi-be laharana 117 / 162 · Bajaj 24/7',
      distance: '12 minitra avy Analakely',
    },
  },
  anosy: {
    fr: {
      tagline: 'Le lac, les ministères, et un côté résidentiel apaisé',
      landmark: 'Lac Anosy · Ministères',
      ambiance:
        'Calme administratif en semaine, balades dominicales autour du lac. Plus haut de gamme que la moyenne — appartements et studios récents.',
      walk:
        'Lac · Ministères · Restaurants · Hôtels',
      transport: 'Taxi-be ligne 109 · Taxi privé recommandé le soir',
      distance: '5 min du centre',
    },
    mg: {
      tagline: 'Ny farihy, ny minisitera, sy ny tony manodidina',
      landmark: 'Farihin\'i Anosy · Minisitera',
      ambiance:
        'Mangina sy fitantanam-panjakana mandritra ny herinandro, fitsangantsanganana ny alahady manodidina ny farihy. Saro-bidy kokoa noho ny salan\'isan-tanàna — appartements vaovao.',
      walk: 'Farihy · Minisitera · Toeram-pisakafoanana · Hotely',
      transport:
        'Taxi-be laharana 109 · Taxi manokana fanafatra rehefa alina',
      distance: '5 minitra avy any afovoan-tanàna',
    },
  },
  ambohijatovo: {
    fr: {
      tagline: 'Cœur étudiant, lycées, et commerces partout',
      landmark: 'Lycée Saint-Michel · Boulangeries · Cybercafés',
      ambiance:
        'Vie locale dense en journée. Mix d\'étudiants, employés, familles. Très éclairé le soir, sécurité correcte.',
      walk:
        'Lycée Saint-Michel · Lycée Jean-Joseph-Rabearivelo · Pharmacie · Marché Ambohijatovo',
      transport: 'Taxi-be lignes 145 / 162 · Bajaj nombreux',
      distance: '8 min du centre',
    },
    mg: {
      tagline: 'Foiben\'ny mpianatra, lisea, sy fivarotana isan-tsokajiny',
      landmark: 'Lisea Saint-Michel · Mpanao mofo · Cybercafé',
      ambiance:
        'Tena mavitrika ny fiainana an-tanàna mandritra ny andro. Mifangaroharo : mpianatra, mpiasa, fianakaviana. Misy jiro tsara ny alina, milamina.',
      walk:
        'Lisea Saint-Michel · Lisea Jean-Joseph-Rabearivelo · Pharmacie · Tsenan\'i Ambohijatovo',
      transport: 'Taxi-be laharana 145 / 162 · Bajaj betsaka',
      distance: '8 minitra avy any afovoan-tanàna',
    },
  },
  ankorondrano: {
    fr: {
      tagline: 'Quartier d\'affaires, plus jeune actif qu\'étudiant',
      landmark: 'Tours de bureaux · Hôtels internationaux',
      ambiance:
        'Bureaux en journée, après-work dans les bars-restaurants. Peu adapté aux étudiants à petit budget — appartements neufs plus chers.',
      walk:
        'Centres commerciaux · Restaurants internationaux · Salles de sport',
      transport: 'Taxi-be ligne 138 · Bajaj 24/7',
      distance: '10-15 min du centre selon trafic',
    },
    mg: {
      tagline:
        'Faritry ny orinasa, mpiasa tanora kokoa noho ny mpianatra',
      landmark: 'Tilikambon\'ny birao · Hotely iraisam-pirenena',
      ambiance:
        'Birao mandritra ny andro, after-work any amin\'ny toeram-pisakafoanana. Tsy dia mety amin\'ny mpianatra tsy be vola — saro-bidy ny appartements vaovao.',
      walk:
        'Foibe fivarotana · Toeram-pisakafoanana iraisam-pirenena · Toeram-panatanjahantena',
      transport: 'Taxi-be laharana 138 · Bajaj 24/7',
      distance: '10-15 minitra arakaraka ny fifamoivoizana',
    },
  },
  isoraka: {
    fr: {
      tagline: 'Quartier chic, calme, résidentiel haut de gamme',
      landmark: 'Restaurants gastronomiques · Galeries d\'art',
      ambiance:
        'Calme, propre, classé parmi les quartiers les plus sûrs. Adapté aux étudiants qui ont du budget ou qui colocataient.',
      walk:
        'Restaurants · Galeries d\'art · Boutiques · Pharmacie',
      transport: 'Taxi-be ligne 117 · Taxi privé facile à trouver',
      distance: '5 min d\'Analakely à pied',
    },
    mg: {
      tagline: 'Faritra kanto, tony, fonenana saro-bidy',
      landmark:
        'Toeram-pisakafoanana sarobidy · Galerie zavakanto',
      ambiance:
        'Tony, madio, anisan\'ny faritra azo antoka indrindra. Mety amin\'ny mpianatra manana vola na izay miara-mipetraka.',
      walk:
        'Toeram-pisakafoanana · Galerie zavakanto · Magazay · Pharmacie',
      transport:
        'Taxi-be laharana 117 · Mora ahita taxi manokana',
      distance: '5 minitra an-tongotra avy Analakely',
    },
  },
  ambondrona: {
    fr: {
      tagline: 'Résidentiel mixte, plus abordable que le centre',
      landmark: 'Marché local · Petites écoles',
      ambiance:
        'Familles, employés, quelques étudiants. Vie de quartier calme mais animée le matin et en fin d\'après-midi.',
      walk:
        'Marché Ambondrona · Pharmacie · Boulangeries · Petites épiceries',
      transport: 'Taxi-be lignes 145 / 109 · Bajaj nombreux',
      distance: '10 min du centre',
    },
    mg: {
      tagline:
        'Fonenana mifangaroharo, mora kokoa noho ny afovoan-tanàna',
      landmark: 'Tsenan-tanàna · Sekoly kely',
      ambiance:
        'Fianakaviana, mpiasa, mpianatra vitsy. Fiainana mangina nefa mavitrika ny maraina sy ny tolakandro.',
      walk:
        'Tsenan\'i Ambondrona · Pharmacie · Mpanao mofo · Tranom-bahoaka',
      transport: 'Taxi-be laharana 145 / 109 · Bajaj betsaka',
      distance: '10 minitra avy any afovoan-tanàna',
    },
  },
  analakely: {
    fr: {
      tagline: 'Hypercentre commerçant, dense, marchés et bureaux',
      landmark: 'Marché Analakely · Gare routière · Mairie',
      ambiance:
        'Le centre névralgique de Tana. Très animé en journée — flux constant de monde. Studios + appartements anciens.',
      walk:
        'Marché Analakely · Banques · Cinéma Rex · Avenue de l\'Indépendance',
      transport: 'Toutes les lignes de taxi-be passent par ici',
      distance: 'Le centre',
    },
    mg: {
      tagline:
        'Foiben\'ny varotra, feno, tsena sy birao',
      landmark:
        'Tsenan\'i Analakely · Toby fiantsonan\'ny fiarakodia · Lapan\'ny tanàna',
      ambiance:
        'Foiben\'ny tanànan\'Antananarivo. Mavitrika tsara mandritra ny andro — be mpandalo lalandava. Studio sy appartements taloha.',
      walk:
        'Tsenan\'i Analakely · Banky · Sinema Rex · Arabe Fahaleovan-tena',
      transport: 'Mandalo eto ny taxi-be rehetra',
      distance: 'Afovoan-tanàna',
    },
  },
  tsaralalana: {
    fr: {
      tagline: 'Central, commerces, mix locataires',
      landmark: 'Cathédrale Andohalo · Avenue de l\'Indépendance',
      ambiance:
        'Vie urbaine classique : commerces, restaurants, hôtels. Studios anciens en rez-de-chaussée ou étage.',
      walk:
        'Cathédrale · Restaurants · Banques · Pharmacie de garde',
      transport: 'Taxi-be 117 / 145 · Bajaj 24/7',
      distance: '4 min d\'Analakely à pied',
    },
    mg: {
      tagline: 'Afovoany, fivarotana, mifangaroharo ireo mpanofa',
      landmark:
        'Katedraly Andohalo · Arabe Fahaleovan-tena',
      ambiance:
        'Fiainana an-tanàna mahazatra : fivarotana, toeram-pisakafoanana, hotely. Studios taloha ambany na ambony.',
      walk:
        'Katedraly · Toeram-pisakafoanana · Banky · Pharmacie',
      transport: 'Taxi-be 117 / 145 · Bajaj 24/7',
      distance: '4 minitra an-tongotra avy Analakely',
    },
  },

  // ===================== TOAMASINA =====================
  'anjoma-toamasina': {
    fr: {
      tagline: 'Central, populaire, lycées à pied',
      landmark: 'Lycée Anjoma · Marché local',
      ambiance:
        'Vie de quartier dense. Lycéens, marchands, taxis-vélos. Abordable, mais peut être bruyant le matin.',
      walk: 'Lycée Anjoma · Marché · Petites épiceries · Boulangerie',
      transport: 'Pousse-pousse · Bajaj · Taxi-bé du centre',
      distance: '10 min du Bazar Be',
    },
    mg: {
      tagline:
        'Afovoany, malaza, lisea akaiky an-tongotra',
      landmark: 'Lisea Anjoma · Tsena',
      ambiance:
        'Fiainana an-tanàna feno. Lisea, mpivarotra, posy. Mora vidy, nefa mety ho mafy feo ny maraina.',
      walk: 'Lisea Anjoma · Tsena · Tranom-bahoaka · Mpanao mofo',
      transport:
        'Posy · Bajaj · Taxi-bé avy any afovoan-tanàna',
      distance: '10 minitra avy any Bazar Be',
    },
  },
  mangarivotra: {
    fr: {
      tagline: 'Bord de mer, vie locale dense, populaire',
      landmark: 'Front de mer · Marché Mangarivotra',
      ambiance:
        'Très animé l\'après-midi quand les pêcheurs rentrent. Mix de familles, employés, étudiants. Brise marine.',
      walk: 'Plage · Marché aux poissons · Restaurants de bord de mer',
      transport: 'Pousse-pousse · Bajaj fréquents',
      distance: '15 min du Bazar Be',
    },
    mg: {
      tagline:
        'Amoron-dranomasina, fiainana an-tanàna feno, malaza',
      landmark: 'Amoron-dranomasina · Tsenan\'i Mangarivotra',
      ambiance:
        'Tena mavitrika ny tolakandro rehefa miverina ny mpanjono. Mifangaroharo fianakaviana, mpiasa, mpianatra. Misy rivotra avy any an-dranomasina.',
      walk:
        'Moron-dranomasina · Tsena trondro · Toeram-pisakafoanana amoron-dranomasina',
      transport: 'Posy · Bajaj betsaka',
      distance: '15 minitra avy Bazar Be',
    },
  },
  ankirihiry: {
    fr: {
      tagline: 'Le campus universitaire, calme, peu de commerces',
      landmark: 'Université de Toamasina',
      ambiance:
        'Très axé étudiants pendant l\'année scolaire. Plus calme et résidentiel hors période académique. Logements neufs proches du campus.',
      walk: 'Université · Bibliothèque universitaire · Quelques gargotes',
      transport: 'Bajaj quasi obligatoire pour le Bazar Be',
      distance: '20 min du centre',
    },
    mg: {
      tagline:
        'Ny tobim-pampianarana, tony, fivarotana vitsy',
      landmark: 'Oniversiten\'i Toamasina',
      ambiance:
        'Mifantoka amin\'ny mpianatra mandritra ny taom-pianarana. Tony sy fonenana ivelan\'izay. Trano vaovao manakaiky ny tobim-pampianarana.',
      walk:
        'Oniversite · Tranom-boky · Hotely vitsivitsy',
      transport: 'Tsy maintsy mandeha Bajaj mankany Bazar Be',
      distance: '20 minitra avy any afovoan-tanàna',
    },
  },
  'tanambao-v': {
    fr: {
      tagline: 'Cité périphérique, plus calme, loyers bas',
      landmark: 'Cité Tanambao V · École primaire',
      ambiance:
        'Très résidentiel, vie en cité. Calme, familles, peu d\'animation le soir.',
      walk:
        'Petites épiceries · École · Terrain de sport',
      transport: 'Bajaj indispensable · Pousse-pousse en journée',
      distance: '20 min du Bazar Be',
    },
    mg: {
      tagline:
        'Toby ivelan\'ny tanàna, tony kokoa, hofa ambany',
      landmark: 'Toby Tanambao V · Sekoly fototra',
      ambiance:
        'Tena fonenana, fiainan-toby. Tony, fianakaviana, tsy be hetsika ny alina.',
      walk:
        'Tranom-bahoaka · Sekoly · Kianja fanatanjahantena',
      transport:
        'Tsy maintsy Bajaj · Posy mandritra ny andro',
      distance: '20 minitra avy Bazar Be',
    },
  },
  ampasimazava: {
    fr: {
      tagline: 'Excentré sud, très calme, logements abordables',
      landmark: 'Petite plage · Quartier résidentiel',
      ambiance:
        'Bordure de ville, plus calme que la moyenne. Souvent en complément d\'un campus distant — bajaj obligatoire.',
      walk: 'Plage · Marché local · École',
      transport: 'Bajaj indispensable · Taxi-be rare',
      distance: '25 min du centre',
    },
    mg: {
      tagline:
        'Tao atsimon\'ny tanàna, tena tony, trano azo vidina',
      landmark: 'Moron-dranomasina kely · Faritra fonenana',
      ambiance:
        'Sisin-tanàna, tony kokoa noho ny salan\'isan-tanàna. Matetika mifameno amin\'ny tobim-pampianarana lavitra — tsy maintsy Bajaj.',
      walk: 'Moron-dranomasina · Tsena · Sekoly',
      transport: 'Tsy maintsy Bajaj · Taxi-be tsy dia firy',
      distance: '25 minitra avy any afovoan-tanàna',
    },
  },
  'morarano-toamasina': {
    fr: {
      tagline: 'Périphérie résidentielle, calme, familles',
      landmark: 'Église catholique · Petite école',
      ambiance:
        'Très résidentiel, peu d\'animation. Bon compromis prix/calme pour qui a un moyen de transport.',
      walk: 'École · Église · Quelques petites épiceries',
      transport: 'Bajaj · Pousse-pousse occasionnel',
      distance: '18 min du Bazar Be',
    },
    mg: {
      tagline:
        'Ivelan-tanàna fonenana, tony, fianakaviana',
      landmark: 'Trano fiangonan\'ny katolika · Sekoly kely',
      ambiance:
        'Tena fonenana, tsy dia be hetsika. Tsara mifandanja vidiny/tony ho an\'izay manana fitaterana.',
      walk:
        'Sekoly · Fiangonana · Tranom-bahoaka vitsivitsy',
      transport: 'Bajaj · Posy indraindray',
      distance: '18 minitra avy Bazar Be',
    },
  },
  'bazar-be': {
    fr: {
      tagline: 'Hypercentre commerçant, animé, lycées à pied',
      landmark: 'Bazar Be · Cathédrale · Lycées',
      ambiance:
        'Le cœur historique de Toamasina. Très animé en journée — commerces, restos, banques. Studios anciens en étage au-dessus des boutiques.',
      walk: 'Bazar Be · Lycée · Banques · Restaurants',
      transport: 'Taxi-be lignes vers Ankirihiry · Bajaj 24/7',
      distance: 'Le centre',
    },
    mg: {
      tagline:
        'Foiben\'ny varotra, mavitrika, lisea akaiky an-tongotra',
      landmark: 'Bazar Be · Katedraly · Lisea',
      ambiance:
        'Foiben\'i Toamasina manan-tantara. Mavitrika tsara mandritra ny andro — fivarotana, toeram-pisakafoanana, banky. Studios taloha ambony fivarotana.',
      walk:
        'Bazar Be · Lisea · Banky · Toeram-pisakafoanana',
      transport: 'Taxi-be mankany Ankirihiry · Bajaj 24/7',
      distance: 'Afovoan-tanàna',
    },
  },

  // ===================== MAHAJANGA =====================
  'mahajanga-be': {
    fr: {
      tagline: 'Vieille ville, hypercentre, animé, lycées proches',
      landmark: 'Cathédrale · Cour de Justice · Front de mer',
      ambiance:
        'Le cœur historique. Animé toute la journée — commerces, restos, plage à 5 min. Studios + appartements anciens, parfois rénovés.',
      walk: 'Front de mer · Lycée · Cathédrale · Marchés',
      transport: 'Taxi-be · Bajaj 24/7 · Pousse-pousse touristes',
      distance: 'Le centre',
    },
    mg: {
      tagline:
        'Tanàna taloha, foibe, mavitrika, lisea akaiky',
      landmark:
        'Katedraly · Tranon\'ny Fitsarana · Amoron-dranomasina',
      ambiance:
        'Ny foibe manan-tantara. Mavitrika manontolo andro — fivarotana, toeram-pisakafoanana, ranomasina 5 minitra. Studios sy appartements taloha, indraindray havaozina.',
      walk:
        'Amoron-dranomasina · Lisea · Katedraly · Tsena',
      transport: 'Taxi-be · Bajaj 24/7 · Posy ho an\'ny mpizahatany',
      distance: 'Afovoan-tanàna',
    },
  },
  mahabibo: {
    fr: {
      tagline: 'Populaire, marchés, vie de rue dense',
      landmark: 'Marché Mahabibo · Petites mosquées · Écoles',
      ambiance:
        'Quartier vivant, mix populations. Marché animé en journée, vie locale forte. Plus abordable que Mahajanga Be.',
      walk: 'Marché Mahabibo · École · Petites épiceries',
      transport: 'Taxi-be · Bajaj · Pousse-pousse',
      distance: '8 min du centre',
    },
    mg: {
      tagline: 'Malaza, tsena, fiainana an-tanàna feno',
      landmark:
        'Tsenan\'i Mahabibo · Moske kely · Sekoly',
      ambiance:
        'Faritra velona, mifangaroharo. Tsena mavitrika mandritra ny andro, fiainana an-tanàna matanjaka. Mora vidy kokoa noho Mahajanga Be.',
      walk:
        'Tsenan\'i Mahabibo · Sekoly · Tranom-bahoaka',
      transport: 'Taxi-be · Bajaj · Posy',
      distance: '8 minitra avy any afovoan-tanàna',
    },
  },
  aranta: {
    fr: {
      tagline: 'Résidentiel mixte, proche centre, vie locale calme',
      landmark: 'Lycée Aranta · Mosquée',
      ambiance:
        'Mix étudiants + familles. Plus calme que Mahabibo, plus animé que la périphérie. Bon compromis.',
      walk: 'Lycée Aranta · Pharmacie · Boulangeries',
      transport: 'Taxi-be · Bajaj 24/7',
      distance: '6 min du centre',
    },
    mg: {
      tagline:
        'Fonenana mifangaroharo, akaiky afovoany, fiainana an-tanàna tony',
      landmark: 'Lisea Aranta · Moske',
      ambiance:
        'Mifangaroharo mpianatra sy fianakaviana. Tony kokoa noho Mahabibo, mavitrika kokoa noho ivelan-tanàna. Mifandanja tsara.',
      walk:
        'Lisea Aranta · Pharmacie · Mpanao mofo',
      transport: 'Taxi-be · Bajaj 24/7',
      distance: '6 minitra avy any afovoany',
    },
  },
  antanimalandy: {
    fr: {
      tagline: 'Proche université de Mahajanga, axé étudiants',
      landmark: 'Université de Mahajanga',
      ambiance:
        'Très étudiant pendant l\'année scolaire. Quelques gargotes, cybercafés, photocopies. Plus calme hors période.',
      walk:
        'Université · Bibliothèque · Petites gargotes étudiantes',
      transport: 'Bajaj quasi obligatoire vers le centre',
      distance: '15 min du centre',
    },
    mg: {
      tagline:
        'Akaiky ny Oniversiten\'i Mahajanga, ho an\'ny mpianatra',
      landmark: 'Oniversiten\'i Mahajanga',
      ambiance:
        'Tena mpianatra mandritra ny taom-pianarana. Hotely vitsivitsy, cybercafé, photocopie. Tony kokoa ivelan\'ny taom-pianarana.',
      walk:
        'Oniversite · Tranom-boky · Hotely ho an\'ny mpianatra',
      transport: 'Tsy maintsy Bajaj mankany afovoany',
      distance: '15 minitra avy any afovoany',
    },
  },
  'mahajanga-tsaramandroso': {
    fr: {
      tagline: 'Périphérie résidentielle, calme, prix bas',
      landmark: 'Quartier résidentiel · Petite mosquée',
      ambiance:
        'Très calme, familles, peu d\'animation. Adapté à qui cherche du silence et un loyer doux.',
      walk: 'Petites épiceries · École · Mosquée',
      transport: 'Bajaj indispensable',
      distance: '15 min du centre',
    },
    mg: {
      tagline:
        'Ivelan-tanàna fonenana, tony, mora vidy',
      landmark: 'Faritra fonenana · Moske kely',
      ambiance:
        'Tena tony, fianakaviana, tsy be hetsika. Mety amin\'izay mitady fahanginana sy hofa mora.',
      walk: 'Tranom-bahoaka · Sekoly · Moske',
      transport: 'Tsy maintsy Bajaj',
      distance: '15 minitra avy any afovoany',
    },
  },
  'ambondrona-mahajanga': {
    fr: {
      tagline: 'Quartier central résidentiel, populaire',
      landmark: 'Marché Ambondrona · Petites écoles',
      ambiance:
        'Très local. Marchés, petits commerces, vie de quartier. Mix étudiants + familles + ouvriers.',
      walk:
        'Marché · École · Pharmacie · Boulangeries',
      transport: 'Taxi-be · Bajaj 24/7',
      distance: '8 min du centre',
    },
    mg: {
      tagline:
        'Faritra afovoany fonenana, malaza',
      landmark: 'Tsenan\'i Ambondrona · Sekoly kely',
      ambiance:
        'Tena malaza. Tsena, fivarotana kely, fiainana an-tanàna. Mifangaroharo mpianatra, fianakaviana, mpiasa.',
      walk: 'Tsena · Sekoly · Pharmacie · Mpanao mofo',
      transport: 'Taxi-be · Bajaj 24/7',
      distance: '8 minitra avy any afovoany',
    },
  },

  // ===================== TOLIARA =====================
  sanfily: {
    fr: {
      tagline: 'Quartier central, animé, commerces',
      landmark: 'Lycée Sanfily · Marché · Cathédrale',
      ambiance:
        'Mix étudiants + lycéens + employés. Très animé en journée, calme le soir. Bon spot étudiant.',
      walk: 'Lycée · Marché · Cathédrale · Banques',
      transport: 'Taxi-be · Bajaj · Pousse-pousse fréquents',
      distance: 'Le centre',
    },
    mg: {
      tagline: 'Faritra afovoany, mavitrika, fivarotana',
      landmark:
        'Lisea Sanfily · Tsena · Katedraly',
      ambiance:
        'Mifangaroharo mpianatra sy lisea sy mpiasa. Mavitrika mandritra ny andro, tony ny alina. Tsara ho an\'ny mpianatra.',
      walk: 'Lisea · Tsena · Katedraly · Banky',
      transport: 'Taxi-be · Bajaj · Posy betsaka',
      distance: 'Afovoan-tanàna',
    },
  },
  mahavatse: {
    fr: {
      tagline: 'Populaire, abordable, vie de rue dense',
      landmark: 'Marché Mahavatse · Petites écoles',
      ambiance:
        'Quartier très local, animé. Mix familles + ouvriers + quelques étudiants. Loyers abordables, vie dense.',
      walk: 'Marché · École · Mosquée · Petits commerces',
      transport: 'Bajaj fréquents · Pousse-pousse · Taxi-be',
      distance: '8 min du centre',
    },
    mg: {
      tagline:
        'Malaza, mora vidy, fiainana an-tanàna feno',
      landmark: 'Tsenan\'i Mahavatse · Sekoly kely',
      ambiance:
        'Faritra tena malaza, mavitrika. Mifangaroharo fianakaviana, mpiasa, mpianatra vitsy. Hofa mora vidy, fiainana feno.',
      walk: 'Tsena · Sekoly · Moske · Fivarotana kely',
      transport: 'Bajaj betsaka · Posy · Taxi-be',
      distance: '8 minitra avy any afovoany',
    },
  },
  tsimenatse: {
    fr: {
      tagline: 'Proche université de Toliara, axé étudiants',
      landmark: 'Université de Toliara · Bibliothèque',
      ambiance:
        'Très étudiant pendant l\'année scolaire. Cybercafés, photocopies, gargotes. Plus calme hors période.',
      walk:
        'Université · Bibliothèque · Gargotes étudiantes',
      transport: 'Bajaj quasi obligatoire vers le centre',
      distance: '12 min du centre',
    },
    mg: {
      tagline:
        'Akaiky ny Oniversiten\'i Toliara, ho an\'ny mpianatra',
      landmark: 'Oniversiten\'i Toliara · Tranom-boky',
      ambiance:
        'Tena mpianatra mandritra ny taom-pianarana. Cybercafé, photocopie, hotely. Tony kokoa ivelan\'ny taom-pianarana.',
      walk:
        'Oniversite · Tranom-boky · Hotely ho an\'ny mpianatra',
      transport: 'Tsy maintsy Bajaj mankany afovoany',
      distance: '12 minitra avy any afovoany',
    },
  },
  ankilibe: {
    fr: {
      tagline: 'Périphérie côtière, calme, prix bas',
      landmark: 'Plage Ankilibe · Petit port de pêche',
      ambiance:
        'Très calme, vue mer. Souvent occupé par des étudiants à petit budget qui acceptent les 15-20 min jusqu\'au campus.',
      walk: 'Plage · Port · École · Petits commerces',
      transport: 'Bajaj indispensable · Pousse-pousse en journée',
      distance: '20 min du centre',
    },
    mg: {
      tagline:
        'Ivelan-tanàna amoron-dranomasina, tony, mora vidy',
      landmark:
        'Moron-dranomasinan\'i Ankilibe · Seranan\'ny mpanjono kely',
      ambiance:
        'Tena tony, mahita ny ranomasina. Matetika mpianatra tsy be vola izay manaiky 15-20 minitra mankany an-toby.',
      walk: 'Moron-dranomasina · Seranana · Sekoly · Fivarotana kely',
      transport: 'Tsy maintsy Bajaj · Posy mandritra ny andro',
      distance: '20 minitra avy any afovoany',
    },
  },
  betania: {
    fr: {
      tagline: 'Plage et résidentiel calme, plus haut de gamme',
      landmark: 'Plage Betania · Hôtels',
      ambiance:
        'Calme, vue mer, plus aisé que Mahavatse. Studios et appartements neufs orientés mer. Loyers plus élevés.',
      walk: 'Plage · Hôtels · Restaurants en bord de mer',
      transport: 'Bajaj · Taxi privé fréquent',
      distance: '10 min du centre',
    },
    mg: {
      tagline:
        'Moron-dranomasina sy fonenana tony, saro-bidy kokoa',
      landmark: 'Moron-dranomasinan\'i Betania · Hotely',
      ambiance:
        'Tony, mahita ny ranomasina, manana vola kokoa noho Mahavatse. Studios sy appartements vaovao manatrika ny ranomasina. Hofa saro-bidy kokoa.',
      walk:
        'Moron-dranomasina · Hotely · Toeram-pisakafoanana amoron-dranomasina',
      transport: 'Bajaj · Taxi manokana betsaka',
      distance: '10 minitra avy any afovoany',
    },
  },
  andaboly: {
    fr: {
      tagline: 'Résidentiel mixte central, vie locale',
      landmark: 'Marché Andaboly · Petites écoles',
      ambiance:
        'Mix étudiants + familles. Vie de quartier active sans être bruyante. Bon compromis prix/centralité.',
      walk: 'Marché · École · Pharmacie · Petites épiceries',
      transport: 'Taxi-be · Bajaj 24/7',
      distance: '6 min du centre',
    },
    mg: {
      tagline:
        'Fonenana mifangaroharo afovoany, fiainana an-tanàna',
      landmark: 'Tsenan\'i Andaboly · Sekoly kely',
      ambiance:
        'Mifangaroharo mpianatra sy fianakaviana. Fiainana an-tanàna mavitrika nefa tsy mafy feo. Mifandanja tsara vidiny/afovoany.',
      walk:
        'Tsena · Sekoly · Pharmacie · Tranom-bahoaka',
      transport: 'Taxi-be · Bajaj 24/7',
      distance: '6 minitra avy any afovoany',
    },
  },
}

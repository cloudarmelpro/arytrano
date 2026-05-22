import type { MessageKey } from './fr-MG'

/**
 * Malagasy translations.
 *
 * Typed by `Record<MessageKey, string>` — TS enforces that every key from
 * the FR-MG dictionary has a translation here (no silent fallback to key
 * names) while allowing each value to be a different string.
 *
 * Note: Malagasy keyboard layout produces apostrophes literally; we keep
 * the ASCII `'` rather than the typographic curly version for consistency
 * with how owners enter listings.
 */
export const mg: Record<MessageKey, string> = {
  // Common
  'common.appName': 'AryTrano',
  'common.home': 'Fandraisana',
  'common.perMonth': '/volana',
  'common.learnMore': 'Hahafantatra bebe kokoa',

  // Legal pages (placeholder v0.5)
  'legal.eyebrow': 'Filazana ara-dalàna',
  'legal.lastUpdated': 'Fanavaozana farany: {date}',
  'legal.draftNotice':
    'Dika voalohany (v0.5). Hojeren’ny mpanolotsaina ara-dalàna ity antontan-taratasy ity alohan’ny fanatontosana. Raha misy fanontaniana, alefaso amin’ny contact@arytrano.mg.',

  // /legal/terms — CGU (Malagasy translations are placeholders, FR is the authoritative text per Madagascar law)
  'legal.terms.title': 'Fepetra ankapobeny',
  'legal.terms.s1.h': '1. Tanjona',
  'legal.terms.s1.body':
    'AryTrano dia sehatra mampifandray ny mpianatra sy ny tompon-trano ao Fianarantsoa (Madagasikara). Tsy mpiantoka ara-trano izahay, tsy manao sonia ny bail an’ny olona, ary tsy mandray commission amin’ny hofa.',
  'legal.terms.s2.h': '2. Famoronana kaonty',
  'legal.terms.s2.body':
    'Maimaim-poana ny fisoratana anarana. Mila ho efa 18 taona ianao, manana mailaka manan-kery, ary — raha mamoaka filazana — taratasy fanondroana sy taratasy fanamarinana ny fananana. Tompon’andraikitra amin’ny teny miafinao ianao.',
  'legal.terms.s3.h': '3. Votoaty navoaka',
  'legal.terms.s3.body':
    'Ny filazana, sary, hevitra ary hafatra navoakanao dia anao ihany. Amin’ny famoahanao azy ireo amin’ny AryTrano, manome anay alalana voafetra ianao mba haneho azy ireo. Manome antoka ianao fa manaja ny lalàna malagasy izy ireo.',
  'legal.terms.s4.h': '4. Fanaraha-maso',
  'legal.terms.s4.body':
    'Manamarina ny filazana tsirairay an-tanana izahay (mahaolona, taratasy fananana, sary). Manana zo handraisana fanapahan-kevitra hanaisotra filazana na hanafoana kaonty raha misy fandikan-dalàna.',
  'legal.terms.s5.h': '5. Famerana ny andraikitra',
  'legal.terms.s5.body':
    'AryTrano dia fitaovana fampifandraisana. Tsy mpandray anjara amin’ny fifanarahana bail izahay. Ny fifandirana rehetra dia tsy maintsy voafaritra mivantana eo amin’ny andaniny.',
  'legal.terms.s6.h': '6. Fanovana',
  'legal.terms.s6.body':
    'Mety hiova ireo fepetra ireo. Hampandrenesina amin’ny mailaka ianao 30 andro alohan’ny fanovana lehibe. Ny fitohizan’ny fampiasana ny sehatra dia midika ho fanekena.',

  // /legal/privacy
  'legal.privacy.title': 'Politikan’ny tsiambaratelo',
  'legal.privacy.s1.h': '1. Vaovao angonina',
  'legal.privacy.s1.body':
    'Amin’ny fisoratana anarana: mailaka, anarana, teny miafina (hashed). Amin’ny famoahana filazana (tompon-trano): taratasy fanondroana (chiffré AES-256-GCM), taratasy fananana, laharana WhatsApp. Amin’ny fitsidihana: adiresy IP hashed, fitenenana, cookies session.',
  'legal.privacy.s2.h': '2. Tanjona',
  'legal.privacy.s2.body':
    'Fanamarinana, fampifandraisana, fanaraha-maso, fisorohana ny famitahana, statistika anonyme. Tsy mivarotra, tsy manofa ary tsy mizara vaovao manokana amin’ny olon-kafa izahay.',
  'legal.privacy.s3.h': '3. Fitehirizana',
  'legal.privacy.s3.body':
    'Kaonty mpianatra: raha mbola mavitrika + 12 volana. Kaonty tompon-trano voamarina: raha mbola misy filazana + 5 taona aorian’izay (adidy ara-kaonty malagasy). Taratasy fanondroana chiffré: 6 volana aorian’ny fanamarinana.',
  'legal.privacy.s4.h': '4. Ny zonao',
  'legal.privacy.s4.body':
    'Araka ny lalàna malagasy 2014-038 momba ny fiarovana ny vaovao manokana, afaka mampihatra ny zo hidirana, hanitsy, hamafa ary hanaova portability ianao. Soraty contact@arytrano.mg miaraka amin’ny porofo maha-olona.',
  'legal.privacy.s5.h': '5. Filaminana',
  'legal.privacy.s5.body':
    'TLS 1.3 amin’ny fifandraisana rehetra. Teny miafina hashed (Argon2id). Taratasy fanondroana chiffré + rotation lakile. Ny fidirana voafetra amin’ny ekipa fanamarinana (4 olona farafahabetsany).',
  'legal.privacy.s6.h': '6. Mpiara-miasa',
  'legal.privacy.s6.body':
    'Hosting: Vercel (USA, GDPR via SCC). Base de données: Postgres voatantana. Sary: Cloudinary. Mailaka: Resend. Manaja ny baikonay sy ny adidy ara-dalàna izy ireo.',

  // /legal/cookies
  'legal.cookies.title': 'Politikan’ny cookies',
  'legal.cookies.s1.h': '1. Inona ny cookies',
  'legal.cookies.s1.body':
    'Ny cookie dia rakitra kely tahirizin’ny browser-nao. AryTrano mampiasa cookies ilaina fotsiny (session, fiteny, anti-CSRF). Tsy misy cookie ho an’ny dokam-barotra, tsy misy tracker.',
  'legal.cookies.s2.h': '2. Lisitry ny cookies',
  'legal.cookies.s2.body':
    'authjs.session-token: session mpampiasa (30 andro). arytrano_locale: fitenenanao FR/MG (1 taona). __Host-csrf: fiarovana anti-CSRF. HttpOnly + Secure + SameSite=Lax izy rehetra.',
  'legal.cookies.s3.h': '3. Tsy mila fanekena',
  'legal.cookies.s3.body':
    'Satria mampiasa cookies ilaina fotsiny izahay, tsy mila bannera fanekena araka ny lalàna malagasy 2014-038 sy ny RGPD eorôpeanina.',
  'legal.cookies.s4.h': '4. Fanafoanana',
  'legal.cookies.s4.body':
    'Azonao foanana na sakanina ny cookies amin’ny browser-nao. Fanairana: tsy hahafahanao mijanona miditra raha tsy misy session cookie. Tsy hitazona ny fiteny raha tsy misy locale cookie.',
  'legal.cookies.s5.h': '5. Fanovana',
  'legal.cookies.s5.body':
    'Raha misy cookie vaovao (analytics sns), havaozinay ity politika ity ary haseho bannera fanekena alohan’ny famoahana.',

  // /legal/mentions
  'legal.mentions.title': 'Filazana ara-dalàna',
  'legal.mentions.s1.h': 'Editora',
  'legal.mentions.s1.body':
    'AryTrano SARL (eo am-pisoratana). Foibe: Fianarantsoa, Madagasikara. Solontena ara-dalàna: ho fenoina alohan’ny famoahana.',
  'legal.mentions.s2.h': 'Fifandraisana',
  'legal.mentions.s2.body':
    'Mailaka: contact@arytrano.mg. WhatsApp: +261 — ho fenoina. Ho an’ny fanontaniana momba ny vaovao: privacy@arytrano.mg.',
  'legal.mentions.s3.h': 'Hosting',
  'legal.mentions.s3.body':
    'Voapetraka ao amin’ny Vercel Inc. (USA). 340 S Lemon Ave #4133, Walnut, CA 91789, USA. GDPR via Standard Contractual Clauses.',
  'legal.mentions.s4.h': 'Zon’ny saina',
  'legal.mentions.s4.body':
    'Ny anarana AryTrano, ny logo, ny design ary ny kaody loharano dia fananan’ny AryTrano SARL. Ny famerenana raha tsy misy fanomezan-dalana an-tsoratra alohan’izay dia voarara. Ireo filazana sy sary dia an’ny mpamoaka azy ireo.',
  'legal.mentions.s5.h': 'Lalàna mihatra',
  'legal.mentions.s5.body':
    'Ireo filazana ireo sy ny fifandirana rehetra dia fehezin’ny lalàna malagasy. Fahefana manokana an’ny fitsarana ao Fianarantsoa.',
  'common.loading': 'Miandry…',
  'common.back': 'Hiverina',
  'common.close': 'Hidio',
  'common.next': 'Manaraka',
  'common.previous': 'Teo aloha',

  // A11y
  'a11y.skipToContent': 'Mankanesa amin\'ny votoatiny',

  // Header / nav
  'header.nav.listings': 'Trano hofaina',
  'header.nav.quartiers': 'Faritra',
  'header.nav.howItWorks': 'Ahoana ny fomba',
  'header.nav.owners': 'Tompon-trano',
  'header.topbar.becomeOwner': 'Lasa tompon-trano',
  'header.topbar.help': 'Fanampiana',
  'header.topbar.studentSpace': 'Faritry ny mpianatra',
  'header.action.favorites': 'Tianay',
  'header.action.reservations': 'Ny famandrihako',
  'header.cta.signUp': 'Hisoratra',
  // Footer (v3)
  'footerV3.newsletter.eyebrow': 'Fampandrenesana WhatsApp',
  'footerV3.newsletter.title':
    'Mahazo ireo filazana vaovao mivantana amin’ny WhatsApp.',
  'footerV3.newsletter.lead':
    'Safidio ny faritra sy ny tetibolanao — handefa hafatra izahay raha vao misy filazana voamarina mifanaraka. Hanafoanana amin’ny teny iray.',
  'footerV3.newsletter.phonePlaceholder': '34 12 345 67',
  'footerV3.newsletter.phoneLabel': 'Laharana WhatsApp Madagasikara',
  'footerV3.newsletter.submit': 'Ampandrenesana ahy',
  'footerV3.newsletter.submitting': 'Mandefa…',
  'footerV3.newsletter.success':
    'Voarainay — hampahafantarinay anao raha vao misy filazana voamarina mifanaraka.',
  'footerV3.newsletter.alreadySubscribed':
    'Efa ao anaty lisitra ianao. Voavaovao ny safidinao.',
  'footerV3.newsletter.error.invalid':
    'Laharana diso. Andrasana : 32, 33, 34, 37, 38 na 39 arahin’ny isa 7.',
  'footerV3.newsletter.error.rateLimit':
    'Be loatra ny andrana. Andramo indray afaka adiny iray.',
  'footerV3.newsletter.error.unavailable':
    'Nisy olana. Andramo indray afaka kely.',

  // Public unsubscribe page (T-045)
  'unsubscribe.success.title': 'Voarainay — voaesotra ianao.',
  'unsubscribe.success.body':
    'Tsy hisy hafatra WhatsApp na mailaka momba ny filazana vaovao intsony. Azonao atao ny misoratra anarana indray amin\'ny alalan\'ny rohy ao ambany pejy.',
  'unsubscribe.alreadyDone.title': 'Efa voaesotra ianao.',
  'unsubscribe.alreadyDone.body':
    'Tsy misy olana — tsy hisy hafatra alefa amin\'io laharana io. Raha tianao ny mandray filazana indray, mamerena amin\'ny formulaire ao ambany pejy.',
  'unsubscribe.invalid.title': 'Tsy mety na lany andro ny rohy.',
  'unsubscribe.invalid.body':
    'Tsy fantatra ny rohy nokitihinao. Raha mbola mahazo hafatra ianao, fifandraisana amin\'ny contact@arytrano.mg.',
  'unsubscribe.backHome': 'Hiverina amin\'ny AryTrano',

  'footerV3.tagline':
    'Tadiavo ny tranonao ao Fianarantsoa, tsy misy mpanelanelana. Tompon-trano voamarina, fifandraisana mivantana, maimaim-poana ho an’ny mpianatra.',
  'footerV3.status.allOperational': 'Mandeha tsara ireo serivisy rehetra',
  'footerV3.col.product': 'Vokatra',
  'footerV3.col.owners': 'Tompon-trano',
  'footerV3.col.about': 'Orinasa',
  'footerV3.col.legal': 'Lalàna',
  'footerV3.link.viewListings': 'Hijery ny filazana',
  'footerV3.link.howItWorks': 'Ahoana ny fomba',
  'footerV3.link.quartiers': 'Faritra',
  'footerV3.link.faq': 'FAQ',
  'footerV3.link.publishListing': 'Hamoaka filazana',
  'footerV3.link.verification': 'Fanamarinana',
  'footerV3.link.pricing': 'Sarany (maimaim-poana)',
  'footerV3.link.resources': 'Loharanon-kevitra',
  'footerV3.link.about': 'Mombamomba',
  'footerV3.link.contact': 'Fifandraisana',
  'footerV3.link.blog': 'Blog',
  'footerV3.link.careers': 'Asa',
  'footerV3.link.terms': 'Fitsipika',
  'footerV3.link.privacy': 'Tsiambaratelo',
  'footerV3.link.cookies': 'Cookies',
  'footerV3.link.mentions': 'Filazana',
  'footerV3.pay.label': 'Karazana fandoavam-bola (mivantana amin’ny tompon-trano)',
  'footerV3.pay.mvola': 'M-Vola',
  'footerV3.pay.orangeMoney': 'Orange Money',
  'footerV3.pay.airtelMoney': 'Airtel Money',
  'footerV3.pay.bankTransfer': 'Famindram-bola an-banky',
  'footerV3.pay.cash': 'Vola madinika',
  'footerV3.bottom.copyright': '© {year} AryTrano',
  'footerV3.bottom.madeIn': 'Made in Fianarantsoa, Madagasikara',
  'footerV3.bottom.status': 'Toetra',
  'footerV3.bottom.security': 'Filaminana',
  'footerV3.bottom.press': 'Press',
  'footerV3.bottom.sitemap': 'Sitemap',
  'header.signIn': 'Hiditra',
  'header.signOut': 'Hivoaka',
  'header.dashboard': 'Ny toerako',
  'header.avatarMenu.aria': 'Tolotra ho an\'ny mpampiasa',
  'header.avatarMenu.dashboard': 'Ny toerako',
  'header.avatarMenu.myListings': 'Ny tranoko',
  'header.avatarMenu.favorites': 'Ireo tiako',
  'header.avatarMenu.profile': 'Mombamomba sy parametre',
  'header.avatarMenu.adminConsole': 'Console admin',
  'header.avatarMenu.section.account': 'Kaonty',
  'header.avatarMenu.section.admin': 'Admin',
  'header.avatarMenu.signOut': 'Hivoaka',

  // Listing types
  'listing.type.ROOM': 'Efitra',
  'listing.type.STUDIO': 'Studio',
  'listing.type.APARTMENT': 'Apartemà',
  'listing.type.HOUSE': 'Trano',

  // /annonces
  'annonces.title': 'Trano hofaina ao Fianarantsoa',
  'annonces.lead':
    'Efitra, studio sy apartemà ho an\'ny mpianatra. Apetraky ny tompon-trano mivantana — tsy misy mpanelanelana.',
  'annonces.metaDescription':
    'Mitady toeram-ponenana ho an\'ny mpianatra ao Fianarantsoa : efitra, studio, apartemà voafefy. Resaka mivantana amin\'ny tompon-trano.',
  'annonces.count.one': 'Trano {count}',
  'annonces.count.other': 'Trano {count}',
  'annonces.count.hasMore': '(maro hafa)',
  'annonces.empty.title': 'Mbola tsy misy trano ao Fianarantsoa.',
  'annonces.empty.lead': 'Manampy isan-kerinandro izahay — miverena tsy ho ela.',
  'annonces.empty.filtered.title': 'Tsy misy trano mifanaraka amin\'ireo sivana.',
  'annonces.empty.filtered.lead':
    'Andramo halefa ireo sivana na esory ireo sivana.',
  'annonces.pagination.next': 'Trano manaraka →',
  'annonces.pagination.backToStart': '← Hiverina any am-piandohana',

  // Filters
  'filters.type.label': 'Karazana',
  'filters.type.all': 'Karazana rehetra',
  'filters.neighborhood.label': 'Faritra',
  'filters.neighborhood.all': 'Faritra rehetra',
  'filters.neighborhood.search': 'Soraty ny faritra…',
  'filters.neighborhood.empty': 'Tsy nahitana faritra',
  'filters.neighborhood.clear': 'Fafao',
  'filters.priceMin.label': 'Vidiny ambany (Ar)',
  'filters.priceMin.placeholder': 'Ambany',
  'filters.priceMax.label': 'Vidiny ambony (Ar)',
  'filters.priceMax.placeholder': 'Ambony',
  'filters.price.label': 'Tetibola isam-bolana (Ar)',
  'filters.price.separator': '→',
  'filters.price.hint': 'Enter mba hampihatra',
  'filters.reset': 'Avadika',
  'filters.sidebar.title': 'Sivana',
  'toolbar.search.label': 'Fitadiavana :',
  'filters.amenities.label': 'Izay omen\'ity trano ity',

  // Sort
  'sort.label': 'Alamino :',
  'sort.byLabel': 'Alamino araka :',
  'sort.newest': 'Vaovao indrindra',
  'sort.newest.short': 'Vaovao',
  'sort.priceAsc': 'Mihena vidiny',
  'sort.priceAsc.short': 'Vidiny ↑',
  'sort.priceDesc': 'Miakatra vidiny',
  'sort.priceDesc.short': 'Vidiny ↓',

  // Card
  'card.perMonth': '/ volana',
  'card.noPhoto': 'Tsy misy sary',

  // Detail page
  'detail.breadcrumb.listings': 'Trano hofaina',
  'detail.breadcrumb.aria': 'Lalan-tantana',
  'detail.section.description': 'Famaritana',
  'detail.section.location': 'Toerana',
  'detail.section.amenities': 'Izay omen\'ity trano ity',
  'detail.location.mapPlaceholder': 'Sarintany ho avy',
  'detail.location.mapAria': 'Sarintanin\'i {neighborhood}, {city}',
  'detail.location.privacyHint': 'Toerana an-tsamboatra (200 m) — ho hazavain\'ny tompon-trano ny adiresy raha vao mifandray aminao.',

  // Amenities catalog
  'amenity.WIFI': 'Misy WiFi',
  'amenity.PARKING': 'Toeram-piantsonana fiara',
  'amenity.MOTO_PARKING': 'Toeram-piantsonana moto / bisikileta',
  'amenity.HOT_WATER': 'Rano mafana',
  'amenity.WATER_TANK': 'Tanky rano',
  'amenity.GENERATOR': 'Groupe électrogène',
  'amenity.AIR_CONDITIONING': 'Climatisation',
  'amenity.KITCHEN_EQUIPPED': 'Lakozia feno fitaovana',
  'amenity.WASHING_MACHINE': 'Milina manasa lamba',
  'amenity.GUARD': 'Mpiambina 24/7',
  'amenity.SECURITY_GATE': 'Vavahady mihidy / fefy',
  'amenity.TERRACE': 'Terasy / balikônia',
  'amenity.GARDEN': 'Zaridaina',
  'amenity.STUDY_DESK': 'Latabatra fianarana',
  'amenity.CLOSE_TO_UNIVERSITY': 'Akaikin\'ny anjerimanontolo',
  'amenity.CLOSE_TO_MARKET': 'Akaikin\'ny tsena',
  'amenity.PUBLIC_TRANSPORT': 'Misy fitateram-bahoaka manakaiky',

  // Reviews
  'reviews.section.title': 'Hevitra',
  'reviews.section.empty': 'Mbola tsy misy hevitra. Aza misalasala mitatitra voalohany.',
  'reviews.countOne': '{count} hevitra',
  'reviews.countOther': '{count} hevitra',
  'reviews.ownerResponse': 'Valin\'ny tompon-trano',
  'reviews.ownerResponse.badge': 'Tompon-trano',
  'reviews.toast.submitted': 'Misaotra noho ny hevitrao !',
  'reviews.toast.error': 'Tsy mety mamoaka ny hevitra izao.',
  'reviews.form.title': 'Asio ny hevitrao',
  'reviews.form.lead': 'Manampia ireo mpianatra ho avy hahafantatra ity trano ity.',
  'reviews.form.rating.label': 'Ny isany',
  'reviews.form.rating.aria': 'Isa (1 ka hatramin\'ny 5 kintana)',
  'reviews.form.body.label': 'Ny fanehoan-kevitrao',
  'reviews.form.body.placeholder': 'Inona no nahafinaritra anao ? Inona no azo atao tsara kokoa ?',
  'reviews.form.body.hint': 'Eo amin\'ny 20 ka hatramin\'ny 2000 mari-pamantarana.',
  'reviews.form.submit': 'Avoaka ny hevitra',
  'reviews.form.submitting': 'Mavoaka…',
  'reviews.form.thanksTitle': 'Voapetraka ny hevitra',
  'reviews.form.thanksLead': 'Misaotra noho ny fizaranao traikefa.',
  'reviews.form.gateOwner': 'Tsy azonao tombanana ny filazana mahakasika anao.',
  'reviews.form.gateAlreadyReviewed': 'Efa nametraka hevitra teto ianao.',
  'reviews.form.gateSignedOut': 'Midira mba hametraka hevitra eto.',
  'reviews.ownerResponse.cta': 'Mamaly ampahibemaso',
  'reviews.ownerResponse.label': 'Ny valinteninao',
  'reviews.ownerResponse.placeholder': 'Misaotra anao tamin\'ny fanehoan-kevitra. …',
  'reviews.ownerResponse.hint': 'Eo amin\'ny 10 ka hatramin\'ny 1000 mari-pamantarana. Hita ampahibemaso.',
  'reviews.ownerResponse.submit': 'Avoaka ny valiny',
  'reviews.ownerResponse.submitting': 'Mavoaka…',
  'reviews.ownerResponse.toast.saved': 'Voapetraka ny valiny',
  'reviews.ownerResponse.toast.updated': 'Voahavaozy ny valiny',
  'reviews.ownerResponse.toast.deleted': 'Voafafa ny valiny',
  'reviews.ownerResponse.toast.deleteError': 'Tsy nety namafa ny valiny.',
  'reviews.ownerResponse.toast.error': 'Tsy nety mamoaka ny valiny.',
  'reviews.ownerResponse.edit': 'Hanova ny valiny',
  'reviews.ownerResponse.delete': 'Hofafa ny valiny',
  'reviews.ownerResponse.deleteConfirm.title': 'Fafao ity valiny ity ?',
  'reviews.ownerResponse.deleteConfirm.lead': 'Tafapetraka ihany ny hevitr\'ilay olona. Afaka mamaly indray ianao avy eo.',
  'commentActions.menuAria': 'Safidy ho an\'ny hevitra',
  'commentActions.edit': 'Hanova',
  'commentActions.delete': 'Fafao',

  // Review reactions
  'reviews.reactions.like.label': 'Tiako',
  'reviews.reactions.like.add': 'Tiavo ity hevitra ity',
  'reviews.reactions.like.remove': 'Esory ny « Tiako »',
  'reviews.reactions.dislike.label': 'Tsy tiako',
  'reviews.reactions.dislike.add': 'Aza tiavina ity hevitra ity',
  'reviews.reactions.dislike.remove': 'Esory ny « Tsy tiako »',
  'reviews.reactions.error': 'Tsy mety. Andramo indray.',
  'reviews.authorActions.youBadge': 'Ianao',
  'reviews.verifiedStay.label': 'Voamarina',
  'reviews.verifiedStay.tooltip': 'Nifandray tamin’ny tompony tamin’ny alalan’ny AryTrano ny mpanoratra alohan’ny nanoratany an’ity hevitra ity.',
  'listing.badge.verified.label': 'Filazana voamarina',
  'listing.badge.verified.tooltip': 'Nohamarinin’ny ekipan’ny AryTrano ity filazana ity.',
  'admin.listings.verify.cta': 'Hamarino',
  'admin.listings.unverify.cta': 'Esory ny fanamarinana',
  'admin.listings.verify.toast.verified': 'Voamarina ny filazana.',
  'admin.listings.verify.toast.unverified': 'Voaesotra ny fanamarinana.',
  'admin.listings.verify.toast.error': 'Tsy nahomby ny fanovana ny fanamarinana.',
  'reviews.authorActions.edit': 'Hanova',
  'reviews.authorActions.delete': 'Fafao',
  'reviews.authorActions.save': 'Tehirizo',
  'reviews.authorActions.saving': 'Mitahiry…',
  'reviews.authorActions.cancel': 'Hialana',
  'reviews.authorActions.confirmDelete': 'Fafao',
  'reviews.authorActions.deleting': 'Mamafa…',
  'reviews.authorActions.deleteConfirm.title': 'Fafao ity hevitra ity ?',
  'reviews.authorActions.deleteConfirm.lead': 'Tsy azo averina intsony ity. Tsy ho hita ampahibemaso intsony ny hevitrao.',
  'reviews.authorActions.toast.updated': 'Voahavaozy ny hevitra',
  'reviews.authorActions.toast.updateError': 'Tsy nety nanavao ny hevitra.',
  'reviews.authorActions.toast.deleted': 'Voafafa ny hevitra',
  'reviews.authorActions.toast.deleteError': 'Tsy nety namafa ny hevitra.',

  // Listing form (amenity picker)
  'listingForm.amenities.label': 'Fitaovana sy tolotra',
  'listingForm.amenities.hint': 'Marihina rehetra izay tafiditra ao amin\'ny trano.',
  'listingForm.customAmenities.label': 'Fitaovana manokana',
  'listingForm.customAmenities.hint': 'Misy zavatra tsy hita amin\'ny lisitra ? Ampio eto (10 farany).',
  'listingForm.customAmenities.placeholder': 'Oh : Mahita ny tendrombohitra, lafaoro mofo…',
  'listingForm.customAmenities.add': 'Ampio',
  'listingForm.customAmenities.remove': 'Esory {label}',
  'listingForm.customAmenities.counter': '{count} / {max} fitaovana',
  'listingForm.customAmenities.limitReached': 'Tratra ny fetra (10).',
  'listingForm.customAmenities.listAria': 'Fitaovana manokana voampy',
  'detail.feature.surface': 'Velarany',
  'detail.feature.bedrooms': 'Efitra fatoriana',
  'detail.feature.bathrooms': 'Efitrano fandroana',
  'detail.feature.furnished': 'Misy fanaka',
  'detail.feature.yes': 'Eny',
  'detail.feature.no': 'Tsia',
  'detail.price.monthly': 'Hofa isam-bolana',
  'detail.price.perMonth': 'isam-bolana',
  'detail.owner.title': 'Tompon-trano',
  'detail.owner.hostedBy': 'Filazana avy amin\'i {name}',
  'detail.report.cta': 'Mahatsiaro fisalasalana amin\'ity filazana ity ?',
  'detail.notFound': 'Tsy hita ny trano',
  'detail.photoCounter': '{current} / {total}',
  'detail.photoCount.alt': 'Jereo amin\'ny lehibe ny sary {n}',

  // Contact
  'contact.whatsapp': 'WhatsApp',
  'contact.call': 'Antsoa',
  'contact.aria.whatsapp': 'Mifandraisa amin\'ny tompon-trano amin\'ny WhatsApp',
  'contact.aria.call': 'Antsoa ny tompon-trano',
  'contact.hint':
    'Tsy hita ny laharana raha tsy hatramin\'ny rehefa kitihana. Voasoratra ho an\'ny tompon-trano ny kitihana — tsy mitahiry adiresy IP raw izahay.',
  'contact.noPhone': 'Mbola tsy nametraka laharany ny tompon-trano.',
  'contact.error.generic': 'Tsy afaka mahazo ny laharana izao.',

  // Photo gallery
  'gallery.label': 'Tahirin-tsary',
  'gallery.open': 'Jereo amin\'ny lehibe ny sary {n}',
  'gallery.prev': 'Sary teo aloha',
  'gallery.next': 'Sary manaraka',
  'gallery.close': 'Hidio ny tahirin-tsary',
  'gallery.showAll': 'Jereo ny sary {n}',

  // Share
  'share.label': 'Zarao',
  'share.aria': 'Zarao ity filazana ity',
  'share.copied': 'Voakopia ny rohy',
  'share.failed': 'Tsy mety mizara. Andramo indray.',

  // Related listings
  'detail.related.title': 'Filazana mitovy',
  'detail.related.lead': 'Trano hafa eo amin\'io faritra io',

  // Auth error page
  'authError.title.default': 'Nisy olana',
  'authError.title.configuration': 'Olana amin\'ny fametrahana',
  'authError.title.accessDenied': 'Tsy nahazo lalana',
  'authError.title.verification': 'Tsy mety na efa lany andro ity rohy ity',
  'authError.title.credentialsSignin': 'Diso ny mari-pamantarana',
  'authError.title.oauthAccountNotLinked': 'Kaonty tsy mifandray',
  'authError.back.signIn': 'Hiverina amin\'ny fidirana',
  'authError.back.home': 'Fandraisana',

  // Locale switcher
  'locale.switcher.aria': 'Misafidiana fiteny',
  'locale.switcher.fr-MG.aria': 'Passer en français',
  'locale.switcher.mg.aria': 'Mividy amin\'ny teny malagasy',

  // Landing page (T-041 → T-051)

  // Meta
  'landing.meta.title': 'AryTrano — Trano voamarina ho an\'ny mpianatra ao Fianarantsoa',
  'landing.meta.description':
    'Tadiavo trano ho mpianatra ao Fianarantsoa amin\'ny dokam-barotra voamarina. Fifandraisana mivantana amin\'ny tompon-trano amin\'ny WhatsApp. Vidiny Ariary.',

  // Top bar
  'landing.topBar.ownerCta': 'Tompon-trano ve ianao ? Apetraho maimaim-poana →',

  // Hero
  'landing.hero.eyebrow': 'Faritra rehetra · Fianarantsoa',
  'landing.hero.title':
    'Tadiavo ny tranonao ho mpianatra. Voamarina, tsotra, amin\'ny Ariary.',
  'landing.hero.lead.one':
    'Doka {count} ao Fianarantsoa, voajery avy amin\'ny ekipanay. Fifandraisana mivantana amin\'ny tompony amin\'ny WhatsApp.',
  'landing.hero.lead.other':
    'Doka {count} ao Fianarantsoa, voajery tsirairay avy amin\'ny ekipanay. Fifandraisana mivantana amin\'ny tompony amin\'ny WhatsApp.',
  'landing.hero.search.quartier.label': 'Faritra',
  'landing.hero.search.quartier.placeholder': 'Faritra rehetra',
  'landing.hero.search.type.label': 'Karazana trano',
  'landing.hero.search.type.placeholder': 'Karazana rehetra',
  'landing.hero.search.priceMax.label': 'Tetibola isam-bolana',
  'landing.hero.search.priceMax.placeholder': 'Ariary / volana',
  'landing.hero.search.submit.one': 'Hijery ny doka',
  'landing.hero.search.submit.other': 'Hijery ireo doka {count}',
  'landing.hero.search.formAria': 'Mitady trano ho an’ny mpianatra ao Fianarantsoa',
  'landing.hero.search.quartier.groupLabel': 'Faritra malaza',
  'landing.hero.search.quartier.itemSubtitle': 'Fianarantsoa',
  'landing.hero.search.quartier.noResults': 'Tsy misy faritra mifanaraka.',
  'landing.hero.search.type.groupLabel': 'Karazana trano',
  'landing.hero.search.type.noResults': 'Tsy misy karazana mifanaraka.',
  'landing.hero.microStats': 'Doka {count} · {verified} tompony voamarina',

  // Trust strip — title + sous-titre
  'landing.trust.verified.title': 'Fanamarinana ataon\'olona',
  'landing.trust.verified.subtitle': 'Karatra + acte voasivana',
  'landing.trust.photos.title': 'Sary voaaro',
  'landing.trust.photos.subtitle': 'EXIF voasaringitra + jereny an-tanana',
  'landing.trust.contact.title': 'Fifandraisana mivantana',
  'landing.trust.contact.subtitle': 'WhatsApp, tsy misy sarany',
  'landing.trust.price.title': 'Vidiny Ariary',
  'landing.trust.price.subtitle': 'Mazava, tsy misy fanahy ratsy',

  // Neighborhoods
  'landing.neighborhoods.title': 'Faritra ao Fianarantsoa',
  'landing.neighborhoods.lead':
    'Avy amin\'ny ivon-tanàna velona ka hatramin\'ny tendrombohitra mangina — faritra 8 voarakitra.',
  'landing.neighborhoods.viewAll': 'Hijery ny doka rehetra →',
  'landing.neighborhoods.count.one': 'doka {count}',
  'landing.neighborhoods.count.other': 'doka {count}',
  'landing.neighborhoods.soon': 'Tsy ho ela',
  // Descripteurs par quartier
  'landing.neighborhoods.andrainjato.tagline': 'Centre, velona',
  'landing.neighborhoods.andrainjato.landmark':
    'Akaikin\'ny lisea Andrianampoinimerina',
  'landing.neighborhoods.antarandolo.tagline': 'Mangina, fonenana',
  'landing.neighborhoods.antarandolo.landmark': 'Akaikin\'ny fac Siansa',
  'landing.neighborhoods.tsianolondroa.tagline': 'Centre, tsena',
  'landing.neighborhoods.tsianolondroa.landmark': 'Foiben\'ny tantara',
  'landing.neighborhoods.mahamanina.tagline': 'Tendrombohitra, panorama',
  'landing.neighborhoods.mahamanina.landmark': 'Sehatra ambony',
  'landing.neighborhoods.anjoma.tagline': 'Gara, varotra',
  'landing.neighborhoods.anjoma.landmark': 'Taxi-be & tsena',
  'landing.neighborhoods.ankidona.tagline': 'Mpianatra, velona',
  'landing.neighborhoods.ankidona.landmark': 'Akaikin\'ny INSPC',
  'landing.neighborhoods.ambalavato.tagline': 'Milamina, fianakaviana',
  'landing.neighborhoods.ambalavato.landmark': 'Sekoly & fiangonana',
  'landing.neighborhoods.mahasoabe.tagline': 'Manodidina, milamina',
  'landing.neighborhoods.mahasoabe.landmark': 'Tendrombohitra atsimo',

  // Featured listings
  'landing.featured.title': 'Doka amin\'izao',
  'landing.featured.lead': 'Ireo trano vao nampiana farany.',
  'landing.featured.viewAll.one': 'Hijery ny doka',
  'landing.featured.viewAll.other': 'Hijery ireo doka {count}',
  'landing.featured.viewMap': 'Sari-tany feno',
  'landing.featured.tab.all': 'Rehetra',
  'landing.featured.tab.STUDIO': 'Studio',
  'landing.featured.tab.ROOM': 'Efitra',
  'landing.featured.tab.APARTMENT': 'Trano',
  'landing.featured.tab.HOUSE': 'Trano feno',
  'landing.featured.tab.empty': 'Mbola tsy misy doka ato — averina jerena.',
  'landing.featured.badge.new': 'Vaovao',
  'landing.featured.relativeTime.today': 'androany',
  'landing.featured.relativeTime.daysAgo.one': '{count} andro lasa',
  'landing.featured.relativeTime.daysAgo.other': '{count} andro lasa',

  // How it works
  'landing.how.title': 'Dingana telo.',
  'landing.how.lead':
    'Mitady, mifandray, mitsidika. Tsotra. Tsy mety mametraka tena eo aminareo sy ny tompony mihitsy AryTrano.',
  'landing.how.step1.title': 'Tadiavo amin\'ny faritra na vola',
  'landing.how.step1.body':
    'Sivana haingana, sary, vidiny Ariary, marika « voamarina » hita avy hatrany.',
  'landing.how.step2.title': 'Mifandraisa amin\'ny WhatsApp anatin\'ny click iray',
  'landing.how.step2.body':
    'Hafatra efa misy referansy ny doka. Valiny avy amin\'ny tompony anatin\'ny 24h.',
  'landing.how.step3.title': 'Tsidiho ary manaova sonia',
  'landing.how.step3.body':
    'Tsidiho mivantana, ifampiraharaha, manao sonia ny fifanarahana. Tsy misy commission AryTrano.',

  // Owner block
  'landing.ownerBlock.eyebrow': 'Tompon-trano ve ianao?',
  'landing.ownerBlock.title':
    'Lavo haingana kokoa. Tsy misy sarany. Tsy misy mpanofa sandoka.',
  'landing.ownerBlock.lead':
    'Apetraho ny dokanao anatin\'ny 5 minitra, mahaza fangatahana avy amin\'ny mpianatra voamarina, tantano ny WhatsApp avy amin\'ny dashboard.',
  'landing.ownerBlock.bullet1': 'Doka maimaim-poana 100%, mandritra ny fotoana',
  'landing.ownerBlock.bullet2':
    'Fanamarinana maha-mpianatra tafiditra ao',
  'landing.ownerBlock.bullet3':
    'Mamaly amin\'ny WhatsApp avy amin\'ny dashboard',
  'landing.ownerBlock.bullet4':
    'Stats fijerena sy tiana amin\'ny fotoana hahitanao',
  'landing.ownerBlock.cta': 'Hapetraka doka',
  'landing.ownerBlock.ctaSecondary': 'Hijery ohatra',

  // Testimonials
  'landing.testimonials.title': 'Manantena anay izy ireo',
  'landing.testimonials.lead':
    'Mpianatra sy tompon-trano nahita tamin\'ny AryTrano.',
  'landing.testimonials.role.student': 'Mpianatra',
  'landing.testimonials.role.owner': 'Tompon-trano',
  'landing.testimonials.t1.name': 'Ramatoa Rasoa',
  'landing.testimonials.t1.area': 'Andrainjato',
  'landing.testimonials.t1.role': 'owner',
  'landing.testimonials.t1.quote':
    'Anatin\'ny 3 andro, fangatahana 5 lasa marina. Niova ny zavatra noho ny fanamarinana AryTrano — tsy misy intsony fotoana very.',
  'landing.testimonials.t2.name': 'Andriamatoa Heriniaina',
  'landing.testimonials.t2.area': 'Antarandolo',
  'landing.testimonials.t2.role': 'student',
  'landing.testimonials.t2.quote':
    'Nila studio akaikin\'ny fac aho, tsy misy hosoka. Nataon\'ny AryTrano nifandray mivantana tamin\'ny tompony aho tao anatin\'ny click 2.',
  'landing.testimonials.t3.name': 'Ramatoa Bao',
  'landing.testimonials.t3.area': 'Mahamanina',
  'landing.testimonials.t3.role': 'owner',
  'landing.testimonials.t3.quote':
    'Tiako ilay marika « Tompo voamarina » mampisokatra ahy amin\'ireo doka tsy mazava ao Facebook.',
  'landing.testimonials.t4.name': 'Andriamatoa Rakoto',
  'landing.testimonials.t4.area': 'Tsianolondroa',
  'landing.testimonials.t4.role': 'student',
  'landing.testimonials.t4.quote':
    'WhatsApp mivantana amin\'ny tompony, hafatra efa misy, mahafinaritra. Nitsidika ny ampitso, nanao sonia ny bail tamin\'ny herinandro.',
  'landing.testimonials.t5.name': 'Fianakaviana Andry',
  'landing.testimonials.t5.area': 'Anjoma',
  'landing.testimonials.t5.role': 'owner',
  'landing.testimonials.t5.quote':
    'Manana trano 3 hofainay. Manampy anay hahafantatra hoe iza ny doka tokony ho ampian\'ny dashboard.',
  'landing.testimonials.t6.name': 'Andriamatoa Tahina',
  'landing.testimonials.t6.area': 'Ankidona',
  'landing.testimonials.t6.role': 'student',
  'landing.testimonials.t6.quote':
    'Vidiny mazava amin\'ny Ariary, sary marina, nanao sonia tsy nila nitsidika tamin\'ny tsy fahalalana.',

  // FAQ
  'landing.faq.title': 'Fanontaniana matetika',
  'landing.faq.lead': 'Izay rehetra anontaniana anay, amin\'ny mazava.',
  'landing.faq.q1.question':
    'Ahoana no anamarinan\'ny AryTrano ny tompon-trano?',
  'landing.faq.q1.answer':
    'Manamarina ny karatra fanondrom-pirenena sy ny porofo ny mpitantana (acte na facture) ny ekipanay alohan\'ny hanomezana ny marika « Tompo voamarina ». Tsy misy doka mitondra ity marika ity raha tsy avy amin\'ny olona izany fanamarinana izany.',
  'landing.faq.q2.question':
    'Ahoana no ahafantarana fa azo antoka ny doka iray?',
  'landing.faq.q2.answer':
    'Tadiavo ny marika maitso « Filazana voamarina » — manamarina fa voajery ny adiresy, ny vidiny, sy ny visit. Manamarina ihany koa ny mpampandeha fa tsy nangalarina avy any an-kafa ny sary alohan’ny famoahana.',
  'landing.faq.q3.question': 'Ahoana no ifandraisako amin\'ny tompony?',
  'landing.faq.q3.answer':
    'Click amin\'ny « Mifandraisa » dia misokatra mivantana ny WhatsApp miaraka amin\'ny hafatra efa misy. Tsy misy mpampifandray, tsy misy commission — miresaka mivantana amin\'ny tompony ianao, tsy misy sarany.',
  'landing.faq.q4.question': 'Ohatrinona ny sarany ho an\'ny mpianatra?',
  'landing.faq.q4.answer':
    'Maimaim-poana 100%. Afaka mitady, mifandray, mitsidika sy manao sonia ny bail-nao tsy misy Ariary aloa amin\'ny AryTrano.',
  'landing.faq.q5.question': 'Tompon-trano aho, ahoana no fametrahana?',
  'landing.faq.q5.answer':
    'Manaova kaonty tompon-trano (maimaim-poana), alefaso ny karatra fanondrom-pirenenanao sy ny acte na facture an\'ny trano. Manamarina anatin\'ny 24–48h ny ekipanay, ary afaka mampahatonga doka rehetra tianao ianao.',

  // Footer — 4 colonnes
  'landing.footer.tagline':
    'Trano ho mpianatra voamarina ao Fianarantsoa. Doka azo antoka, fifandraisana mivantana, tsy misy sarany miafina.',
  'landing.footer.section.product': 'Vokatra',
  'landing.footer.section.owners': 'Tompon-trano',
  'landing.footer.section.resources': 'Loharanon-kevitra',
  'landing.footer.section.legal': 'Lalàna',
  'landing.footer.link.listings': 'Dokam-barotra',
  'landing.footer.link.howItWorks': 'Ahoana no fiasany',
  'landing.footer.link.faq': 'Fanontaniana matetika',
  'landing.footer.link.neighborhoods': 'Faritra',
  'landing.footer.link.publishListing': 'Hapetraka doka',
  'landing.footer.link.verification': 'Fanamarinana',
  'landing.footer.link.pricing': 'Sarany (maimaim-poana)',
  'landing.footer.link.about': 'Mombamomba',
  'landing.footer.link.blog': 'Blog',
  'landing.footer.link.careers': 'Asa',
  'landing.footer.link.press': 'Mpanao gazety',
  'landing.footer.link.security': 'Filaminana',
  'landing.footer.link.status': 'Statut',
  'landing.footer.link.contact': 'Fifandraisana',
  'landing.footer.link.terms': 'Fepetra',
  'landing.footer.link.privacy': 'Fiarovana',
  'landing.footer.link.cookies': 'Cookies',
  'landing.footer.copyright': '© {year} AryTrano · Fianarantsoa, Madagasikara',

  // Landing v3
  'landing.neighborhoods.eyebrow': 'Faritra',
  'landing.how.eyebrow': 'Ahoana ny fomba',
  'landing.students.eyebrow': 'Ho an’ny mpianatra',
  'landing.students.title':
    'Natao ho an’ny zava-misy aminao, tsy ho an’ny banky eorôpeanina.',
  'landing.students.lead':
    'Tsy misy fanovàna EUR→Ar. Tsy mila 5G. Tsy mila application 60 Mo. AryTrano namboarina any Fianarantsoa, ho an’i Fianarantsoa.',
  'landing.students.s1.stat': '< 200',
  'landing.students.s1.statSub': 'ko / pejy',
  'landing.students.s1.title': 'Malaky sy maivana',
  'landing.students.s1.desc':
    'Pejy voakomprema, sary nohatsaraina, mety hampiasaina amin’ny tambajotra malemy.',
  'landing.students.s1.highlight': 'Mandeha amin’ny 3G',
  'landing.students.s2.stat': '100%',
  'landing.students.s2.statSub': 'amin’ny Ariary',
  'landing.students.s2.title': 'Daholo amin’ny Ariary',
  'landing.students.s2.desc':
    'Vidiny mazava, tsy misy fanovàna. Vakianao ny totaly, aloanao ny totaly.',
  'landing.students.s2.highlight': 'Tsy misy fanovàna',
  'landing.students.s3.stat': '0',
  'landing.students.s3.statSub': 'app hapetraka',
  'landing.students.s3.title': 'WhatsApp mivantana',
  'landing.students.s3.desc':
    'Mifandray amin’ny tompon-trano amin’ny tsindrina iray. Tsy misy chat hapetraka.',
  'landing.students.s3.highlight': 'Mivantana amin’ny WhatsApp',
  'landing.students.s4.stat': 'FR·MG',
  'landing.students.s4.statSub': 'roa fiteny voajanahary',
  'landing.students.s4.title': 'Frantsay · Malagasy',
  'landing.students.s4.desc':
    'Hovay ny fiteny amin’ny tsindrina iray. Tsy very hevitra.',
  'landing.students.s4.highlight': 'Safidio, na oviana na oviana',

  'landing.ownerBlock.stat1.n': '0',
  'landing.ownerBlock.stat1.sub': 'Ar saran-jadona',
  'landing.ownerBlock.stat2.n': '5',
  'landing.ownerBlock.stat2.sub': 'mn hampoizina',
  'landing.ownerBlock.stat3.n': '24-48h',
  'landing.ownerBlock.stat3.sub': 'fanamarinana',
  'landing.ownerBlock.stat4.sub': 'tompon-trano voamarina',
  'landing.ownerBlock.dashboard.previewBadge': 'Sary an-tsaina',
  'landing.ownerBlock.dashboard.notif.title': 'Hafatra WhatsApp vaovao',
  'landing.ownerBlock.dashboard.notif.sub': 'avy amin’i Hery · 3 mn lasa',
  'landing.ownerBlock.dashboard.author': 'Rmme Rasoa',
  'landing.ownerBlock.dashboard.role': 'Dashboard tompon-trano',
  'landing.ownerBlock.dashboard.verified': 'Voamarina',
  'landing.ownerBlock.dashboard.thisWeek': 'Amin’ity herinandro ity',
  'landing.ownerBlock.dashboard.views': 'fijery',
  'landing.ownerBlock.dashboard.contacts': 'fifandraisana',
  'landing.ownerBlock.dashboard.favorites': 'tiana',
  'landing.ownerBlock.dashboard.active': 'Mavitrika',
  'landing.ownerBlock.dashboard.l1.title': 'Studio · Andrainjato',
  'landing.ownerBlock.dashboard.l1.price': '220k Ar',
  'landing.ownerBlock.dashboard.l2.title': 'Efitra · Antarandolo',
  'landing.ownerBlock.dashboard.l2.price': '140k Ar',
  'landing.ownerBlock.dashboard.l3.title': 'T1 · Anjoma',
  'landing.ownerBlock.dashboard.l3.price': '320k Ar',

  'landing.faq.eyebrow': 'Fanontaniana mahazatra',
  'landing.faq.contact.title': 'Apetraho ny fanontanianao',
  'landing.faq.contact.sub': 'Valiny latsaky ny 24h',

  'landing.finalCta.title': 'Vonona hitady trano ao Fianarantsoa ?',
  'landing.finalCta.lead':
    '64 filazana voamarina, tompon-trano azo itokisana, fifandraisana mivantana amin’ny WhatsApp. Maimaim-poana ho an’ny mpianatra.',
  'landing.finalCta.cta': 'Hijery ny filazana rehetra',

  // Auth page chrome
  'auth.back.home': 'Hiverina any an-tampony',
  'auth.eyebrow.signin': 'Tonga soa',
  'auth.eyebrow.signup': 'Tongasoa',
  'auth.eyebrow.forgot': 'Teny miafina hadinoina',
  'auth.h1.signin': 'Tonga soa amin’i AryTrano',
  'auth.h1.signup': 'Mamorona kaontinao AryTrano',
  'auth.h1.forgot': 'Hadinoko ny teny miafina ?',
  'auth.sub.signin':
    'Tohizo ny fitadiavana, na valio ny tompon-trano.',
  'auth.sub.signup':
    'Mitady, mifandray, manao sonia — 100% maimaim-poana ho an’ny mpianatra.',
  'auth.sub.forgot':
    'Soraty ny mailaka-nao dia handefasanay rohy hanavaozana azy.',
  'auth.alt.signup': 'Mbola tsy manana kaonty ?',
  'auth.alt.signupLink': 'Hisoratra anarana maimaim-poana',
  'auth.alt.signin': 'Efa manana kaonty ?',
  'auth.alt.signinLink': 'Hiditra',
  'auth.role.student.sub': 'Mitady trano hipetrahana',
  'auth.role.owner.sub': 'Mametraka ny tranoko',

  // Auth side panel
  'auth.panel.eyebrow': 'Trano ho an’ny mpianatra · Fianarantsoa',
  'auth.panel.title': 'Mirosoa amin’ny tompon-trano voamarina 168 sy mpianatra mavitrika 1 200.',
  'auth.panel.value1.title': 'Filazana voamarina',
  'auth.panel.value1.sub':
    'Maha-olona + taratasy fananana voadinika avy amin’ny ekipanay.',
  'auth.panel.value2.title': 'Fifandraisana mivantana amin’ny WhatsApp',
  'auth.panel.value2.sub': 'Tsy misy mpanelanelana, tsy misy commission.',
  'auth.panel.value3.title': 'Vidiny mazava amin’ny Ariary',
  'auth.panel.value3.sub': 'Voasoratra mazava, tsy misy fanovàna fitaka.',
  'auth.panel.teaser.badge': 'Voamarina',
  'auth.panel.teaser.title': 'Studio · 18m²',
  'auth.panel.teaser.location': 'Andrainjato',
  'auth.panel.teaser.price': '220 000 Ar',
  'auth.panel.proof':
    '· filazana mavitrika 64 · tompon-trano voamarina 168 · faritra 8',

  // ── /comment-ca-marche ──
  'comment.meta.title': 'Ahoana ny fomba ao Fianarantsoa',
  'comment.meta.description':
    'Ahoana no fiasan’i AryTrano : process mpianatra sy tompon-trano, fanamarinana, fiarovana, modely ara-toekarena.',
  'comment.eyebrow': 'Ahoana ny fomba',
  'comment.h1.lead': 'Sehatra iray. Tsy misy mpanelanelana.',
  'comment.h1.accent': 'Tsy misy commission.',
  'comment.sub':
    'Mampifandray mivantana ny mpianatra sy ny tompon-trano ao Fianarantsoa i AryTrano. Hamarinanay ny andaniny avy, arovanay ny sary, ataonay mora ny fifandraisana.',
  'comment.audience.student': 'Mitady trano aho',
  'comment.audience.owner': 'Tompon-trano aho',

  'comment.studentFlow.s1.title': 'Mitady arakaraka ny safidinao',
  'comment.studentFlow.s1.desc':
    'Sivany faritra, karazana (studio / efitra / T1 / T2), tetibola farafahabetsany, fitaovana (WiFi, rano mafana, voakemba, balcon…).',
  'comment.studentFlow.s1.example':
    'Ohatra : « Studio voakemba ao Andrainjato, hatramin’ny 250 000 Ar/volana, misy WiFi »',
  'comment.studentFlow.s1.time': '2 mn',
  'comment.studentFlow.s2.title': 'Hitanao ny filazana voamarina',
  'comment.studentFlow.s2.desc':
    'Ny baodjy « Voamarina » dia midika fa ny ekipanay no nanamarina an-tanana ny mahaolona ny tompon-trano sy namaky ny filazana tsirairay alohan’ny famoahana.',
  'comment.studentFlow.s2.example':
    'Aelo ny sivana « Voamarina ihany » mba hijery ireo voamarina ihany.',
  'comment.studentFlow.s2.time': 'avy hatrany',
  'comment.studentFlow.s3.title': 'Mifandray amin’ny WhatsApp',
  'comment.studentFlow.s3.desc':
    'Tsindrio « Mifandray » dia hisokatra ny WhatsApp misy hafatra efa vita. Miresaka mivantana amin’ny tompon-trano ianao.',
  'comment.studentFlow.s3.example':
    'Tsy misy mpanelanelana, tsy misy file — manorata, mamaly ny tompon-trano.',
  'comment.studentFlow.s3.time': '< 1 mn',
  'comment.studentFlow.s4.title': 'Mijery ny trano',
  'comment.studentFlow.s4.desc':
    'Mifanao fotoana mivantana amin’ny tompon-trano. Ny adiresy marina dia omena amin’izay fotoana izay. Maimaim-poana.',
  'comment.studentFlow.s4.example':
    'Torohevitra : mijery amin’ny atoandro, mangataha hijery trano 2-3 farafahakeliny.',
  'comment.studentFlow.s4.time': '30-45 mn',
  'comment.studentFlow.s5.title': 'Manao sonia ny bail',
  'comment.studentFlow.s5.desc':
    'Manao sonia mivantana amin’ny tompon-trano. Tsy maka commission AryTrano, tsy miditra amin’ny fifanarahana.',
  'comment.studentFlow.s5.example':
    'Mangataha quittance isaky ny volana mba hanana porofo.',
  'comment.studentFlow.s5.time': '1 ora',

  'comment.ownerFlow.s1.title': 'Mamorona kaonty tompon-trano',
  'comment.ownerFlow.s1.desc':
    'Mailaka + laharana WhatsApp + tenimiafina. Izay ihany.',
  'comment.ownerFlow.s1.example':
    'Tsy mila karatra bankaty. Maimaim-poana ny AryTrano v0.5.',
  'comment.ownerFlow.s1.time': '1 mn',
  'comment.ownerFlow.s2.title': 'Mandefa taratasy fanamarinana',
  'comment.ownerFlow.s2.desc':
    'Sary CIN na passeport mazava. Voatahiry amin’ny Cloudinary, azon’ny ekipanay ihany hatrany hijerena ho fanamarinana.',
  'comment.ownerFlow.s2.example':
    'Ny taratasinao dia tsy haseho ho an’ny besinimaro ary tsy alefa amin’ny mpianatra.',
  'comment.ownerFlow.s2.time': '2 mn',
  'comment.ownerFlow.s3.title': 'Mamaritra ny trano',
  'comment.ownerFlow.s3.desc':
    'Karazana, hofa, faritra, fitaovana, fanazavana. Sary 1 farafahakeliny (4-5 no tena tsara : sisiny ivelany, efitra lehibe, salle de bain, lakozia).',
  'comment.ownerFlow.s3.example':
    'Sary atoandro, tsy misy olona, tsy misy filtre. Ny tena izy no mahatoky ny mpianatra.',
  'comment.ownerFlow.s3.time': '5 mn',
  'comment.ownerFlow.s4.title': 'Hanamarina ao anatin’ny 24-48 ora ny ekipanay',
  'comment.ownerFlow.s4.desc':
    'Fanaraha-maso an-tanana ny taratasinao sy famakian’ny filazana (lohateny, famaritana, sary, vidiny). Raha tsara izany, dia voapariaka ny filazana miaraka amin’ny baodjy « Voamarina ».',
  'comment.ownerFlow.s4.example':
    'Matetika latsaky ny 48 ora amin’ny andro fiasana. Mandefa mailaka aminao izahay raha vita ny fanamarinana.',
  'comment.ownerFlow.s4.time': '24-48h',
  'comment.ownerFlow.s5.title': 'Mahazo fangatahana',
  'comment.ownerFlow.s5.desc':
    'Tsindrian’ny mpianatra ny « Mifandray » → tonga avy hatrany amin’ny WhatsApp-nao ny hafatra.',
  'comment.ownerFlow.s5.example':
    'Hovaina ho « Voa-hofa » amin’ny tsindrina iray.',
  'comment.ownerFlow.s5.time': 'mitohy',

  'comment.why.eyebrow': 'Nahoana AryTrano',
  'comment.why.title': 'Hitady trano mpianatra, tsy misy ahiahy.',
  'comment.why.p1':
    'Ao Fianarantsoa, ny tsenan’ny trano hofan’ny mpianatra dia mandalo amin’ny WhatsApp, Facebook ary ny vavavolo. Misy filazana tsara — fa misy ihany koa kaonty hosoka, sary nangalarina tao Booking, sy « tompon-trano » manjavona aorian’ny tahiry.',
  'comment.why.p2':
    'Ny fitsipika tsotran’ny AryTrano : tsy misy filazana voapariaka raha tsy efa nohamarinin’ny olombelona ao amin’ny ekipa ny tompon-trano sy ny filazana.',
  'comment.why.stat1.n': '8',
  'comment.why.stat1.label':
    'faritra ao Fianarantsoa — manampy tsikelikely izahay',
  'comment.why.stat2.n': '0',
  'comment.why.stat2.label':
    'commission, na ho an’ny mpianatra na ho an’ny tompon-trano — maimaim-poana v0.5',
  'comment.why.stat3.n': '24-48h',
  'comment.why.stat3.label':
    'fotoana fanamarinana ny filazana vaovao ataon’ny ekipanay',
  'comment.why.stat4.n': '1 isa-1',
  'comment.why.stat4.label':
    'voamarina an-tanana ny tompon-trano tsirairay alohan’ny famoahana',

  'comment.verif.eyebrow': 'Izay tena ataonay',
  'comment.verif.title': 'Ny fiarovana 6 mihatra ankehitriny.',
  'comment.verif.v1.title': 'Mahaolona ny tompon-trano',
  'comment.verif.v1.desc':
    'Taratasy fanamarinana (CIN na passeport) angatahina amin’ny famoronana ny kaonty. Hojerena tsirairay alohan’ny famoahana.',
  'comment.verif.v1.why':
    'Misakana ny kaonty tsy fantatra tsy hamoaka filazana.',
  'comment.verif.v2.title': 'Filazana voadinika 1 isa-1',
  'comment.verif.v2.desc':
    'Tsy misy filazana mivoaka ho azy. Olombelona ao amin’ny ekipa no mamaky ny lohateny, ny famaritana, ny sary, sy ny vidiny alohan’ny famoahana.',
  'comment.verif.v2.why':
    'Misivana ireo filazana banga, sary saro-pantarina, na vidiny tsy mifanaraka.',
  'comment.verif.v3.title': 'Sary tsy misy data manokana',
  'comment.verif.v3.desc':
    'Ny metadata an’ny sary (GPS, modelin’ny telefaonina, daty) dia esorina ho azy amin’ny famoahana alohan’ny fitehirizana.',
  'comment.verif.v3.why':
    'Misakana ny sary tsy hanambara tampoka ny adiresy marin’ny trano.',
  'comment.verif.v4.title': 'Laharana hita rehefa tsindrina',
  'comment.verif.v4.desc':
    'Ny laharana WhatsApp dia tsy hita mihitsy ao amin’ny kaody pejy. Hita ihany rehefa tsindrian’ny mpianatra, ary voafetra ny isan’ny tsindrin’izy.',
  'comment.verif.v4.why':
    'Manakana ny scripts manangona laharana mba hamarotana na hanaparitahana spam.',
  'comment.verif.v5.title': 'Hevitra voamarina aorian’ny fonenana',
  'comment.verif.v5.desc':
    'Ny mpianatra nifandray tamin’ny tompon-trano amin’ny alalan’ny plateforme ihany no afaka mametraka hevitra. Be ny isa, tsy azo ovaina aorian’ny famoahana.',
  'comment.verif.v5.why':
    'Misakana ny hevitra 5★ hosoka ataon’ny namana na bots.',
  'comment.verif.v6.title': 'Fitarainana iray tsindry',
  'comment.verif.v6.desc':
    'Amin’ny filazana tsirairay, misy bokotra « Mitaraina » mandefa ny olana amin’ny ekipanay. Raha be ny fitarainana, dia jerena haingana ny filazana.',
  'comment.verif.v6.why':
    'Manome ny mpianatra fitaovana mivantana hampahafantatra anay raha misy olana.',

  'comment.dont.eyebrow': 'Izay tsy ataonay',
  'comment.dont.title': 'Mba tsy hisalasalana.',
  'comment.dont.sub':
    'Mampifandray AryTrano. Ny sisa dia ataonao sy ny tompon-trano.',
  'comment.dont.i1':
    'Tsy mandray commission MIHITSY, na amin’ny hofa, na amin’ny caution.',
  'comment.dont.i2':
    'TSY mikarakara fitsidihana — ianao mifandahatra mivantana.',
  'comment.dont.i3':
    'TSY manoratra bail — eo aminareo no anaovanareo.',
  'comment.dont.i4':
    'TSY mitantana fandoavam-bola — virement, mobile money, an-tanana.',
  'comment.dont.i5':
    'TSY mitahiry vaovao bankaty — tsy ilainay.',
  'comment.dont.i6':
    'TSY mivarotra ny vaovaonao — tsy misy ads, tsy misy profilage.',

  'comment.finalCta.student.title': 'Vonona hitady ?',
  'comment.finalCta.student.lead':
    'Filazana voamarina 64 · havaozina isan’andro',
  'comment.finalCta.student.cta': 'Hijery ny filazana',
  'comment.finalCta.owner.title': 'Vonona hamoaka ?',
  'comment.finalCta.owner.lead':
    '5 mn hamoahana · fanamarinana 24-48 ora',
  'comment.finalCta.owner.cta': 'Hamoaka ny filazako',

  // ── /proprietaires ──
  'proprietaires.meta.title': 'Hamoaka filazana ao Fianarantsoa',
  'proprietaires.meta.description':
    'Hamoaha ny filazanao ao anatin’ny 5 mn. Maimaim-poana, mandritra ny androm-piainana. Fanamarinana 24-48 ora.',
  'proprietaires.hero.eyebrow': 'Ho an’ny tompon-trano',
  'proprietaires.hero.title': 'Hofa haingana. Tsy misy saran’asa. Tsy misy mpanofa sandoka.',
  'proprietaires.hero.sub':
    'Hamoaha filazana ao anatin’ny minitra vitsivitsy, mahazo fangatahana mivantana amin’ny WhatsApp, mitazona ny fifandraisana mivantana amin’ny mpianatra. Tsy misy commission amin’ny hofa, na oviana na oviana.',
  'proprietaires.hero.ctaPrimary': 'Hamoaka filazana',
  'proprietaires.hero.ctaSecondary': 'Hijery ny tolotra',
  'proprietaires.hero.stat1.n': '0 Ar',
  'proprietaires.hero.stat1.label': 'commission na sara-pisoratana anarana',
  'proprietaires.hero.stat2.n': '24-48h',
  'proprietaires.hero.stat2.label': 'fotoana fanamarinana ny filazana',
  'proprietaires.hero.stat3.n': '1 isa-1',
  'proprietaires.hero.stat3.label': 'voamarina an-tanana ny tompon-trano tsirairay',

  'proprietaires.preview.url': 'arytrano.mg/publier',
  'proprietaires.preview.step': 'Dingana 3/4',
  'proprietaires.preview.title': 'Faritao ny trano',
  'proprietaires.preview.field.type': 'Karazana',
  'proprietaires.preview.field.typeV': 'Studio voakemba',
  'proprietaires.preview.field.quartier': 'Faritra',
  'proprietaires.preview.field.quartierV': 'Andrainjato',
  'proprietaires.preview.field.surface': 'Velarana',
  'proprietaires.preview.field.surfaceV': '18 m²',
  'proprietaires.preview.field.price': 'Hofa / volana',
  'proprietaires.preview.field.priceV': '220 000 Ar',
  'proprietaires.preview.photos': 'Sary (5 farafahakeliny)',
  'proprietaires.preview.prev': 'Hiverina',
  'proprietaires.preview.next': 'Hitohy',

  'proprietaires.steps.eyebrow': 'Ahoana hamoaka',
  'proprietaires.steps.title': 'Dingana 4. Minitra vitsy. Maimaim-poana.',
  'proprietaires.steps.s1.title': 'Mamorona kaonty',
  'proprietaires.steps.s1.desc':
    'Mailaka + laharana WhatsApp + tenimiafina. Izay ihany no hanombohana.',
  'proprietaires.steps.s2.title': 'Mandefa taratasy fanamarinana',
  'proprietaires.steps.s2.desc':
    'Sary CIN na passeport mazava. Hita amin’ny ekipanay ihany hatrany ho fanamarinana — tsy haseho ho an’ny besinimaro.',
  'proprietaires.steps.s3.title': 'Mamaritra ny trano',
  'proprietaires.steps.s3.desc':
    'Lohateny, vidiny, faritra, fitaovana, sary. Hijerin’ny ekipanay tsirairay alohan’ny famoahana.',
  'proprietaires.steps.s4.title': 'Mahazo fangatahana',
  'proprietaires.steps.s4.desc':
    'Raha mitsindry « Mifandray » ny mpianatra, misokatra ny WhatsApp amin’ny lafiny mpianatra misy hafatra efa vita. Mamaly rehefa tianao.',

  'proprietaires.verif.eyebrow': 'Fanamarinana',
  'proprietaires.verif.title': 'Nahoana no hamarinina ny tompon-trano tsirairay ?',
  'proprietaires.verif.body':
    'Ao Fianarantsoa, ny tsenan’ny trano hofan’ny mpianatra dia mandalo amin’ny WhatsApp sy Facebook — tsy misy sivana, misy kaonty hosoka sy filazana nangalarina. AryTrano dia tsy mamoaka raha tsy nohamarinin’ny olombelona ao amin’ny ekipa ny olona ao ambadiky ny filazana.',
  'proprietaires.verif.i1.title': 'Taratasy mahaolona',
  'proprietaires.verif.i1.desc':
    'CIN na passeport voadinika an-tanana amin’ny ekipanay rehefa miforona ny kaonty.',
  'proprietaires.verif.i2.title': 'Filazana voadinika 1 isa-1',
  'proprietaires.verif.i2.desc':
    'Lohateny, famaritana, vidiny, sary — vakian’ny olombelona ny filazana tsirairay alohan’ny famoahana.',
  'proprietaires.verif.i3.title': 'Sary tsy misy data manokana',
  'proprietaires.verif.i3.desc':
    'Amin’ny famoahana, esorina ho azy ny metadata (GPS, modelin’ny telefaonina, daty) mba tsy hampiseho mihitsy ny adiresy marina.',
  'proprietaires.verif.i4.title': 'Laharana hita rehefa tsindrina',
  'proprietaires.verif.i4.desc':
    'Ny laharana WhatsApp-nao dia tsy hita mihitsy ao amin’ny kaody pejy. Hita ihany rehefa tsindrian’ny mpianatra hifandraisana — fiarovana anti-scraping ao anatin’izany.',
  'proprietaires.verif.card.preview': 'Sary an-tsaina',
  'proprietaires.verif.card.author': 'Mombamomba ny tompon-trano',
  'proprietaires.verif.card.verifiedAt': 'Voamarina avy amin’ny AryTrano',
  'proprietaires.verif.card.badge': 'Voamarina',
  'proprietaires.verif.card.row.cin': 'Taratasy mahaolona',
  'proprietaires.verif.card.row.cinV': '✓ Voadinika an-tanana',
  'proprietaires.verif.card.row.acte': 'Filazana',
  'proprietaires.verif.card.row.acteV': '✓ Vakiana 1 isa-1',
  'proprietaires.verif.card.row.phone': 'Laharana WhatsApp',
  'proprietaires.verif.card.row.phoneV': '✓ Hita rehefa tsindrina',
  'proprietaires.verif.card.row.active': 'Sary',
  'proprietaires.verif.card.row.activeV': '✓ Metadata voafafa',
  'proprietaires.verif.card.row.response': 'Hevitry ny mpanofa',
  'proprietaires.verif.card.row.responseV': 'Azo atao aorian’ny fonenana',
  'proprietaires.verif.card.row.rating': 'Fitarainana',
  'proprietaires.verif.card.row.ratingV': 'Iray tsindry, amin’ny filazana tsirairay',

  'proprietaires.pricing.eyebrow': 'Ny tolotra v0.5',
  'proprietaires.pricing.title': 'Maimaim-poana hanombohana.',
  'proprietaires.pricing.lead':
    'Mandritra ny beta, ny famoahana filazana amin’ny AryTrano dia tsy mandoa na inona na inona. Tsy misy commission amin’ny hofa, tsy mila karatra bankaty.',
  'proprietaires.pricing.disclaimer':
    'Tsy misy commission amin’ny hofa — na izao na rahatrizay. Izay ampanirakin’ny mpianatra aminao no azonao.',
  'proprietaires.pricing.standard.name': 'Beta v0.5',
  'proprietaires.pricing.standard.price': '0 Ar',
  'proprietaires.pricing.standard.sub': 'Mandritra ny beta',
  'proprietaires.pricing.standard.f1': 'Famoronana kaonty + fanamarinana an-tanana',
  'proprietaires.pricing.standard.f2': 'Filazana voadinika tsirairay amin’ny ekipanay',
  'proprietaires.pricing.standard.f3': 'Fangatahana avy amin’ny mpianatra mivantana amin’ny WhatsApp',
  'proprietaires.pricing.standard.f4': 'Sary tsy misy data manokana (fiarovana)',
  'proprietaires.pricing.standard.f5': 'Fifandraisana voaaro amin’ny scraping',
  'proprietaires.pricing.standard.cta': 'Hamorona kaontiko tompon-trano',
  'proprietaires.pricing.roadmap.eyebrow': 'Roadmap',
  'proprietaires.pricing.roadmap.body':
    'Aoriana, ho avy ny safidy karama : marika « Voamarina » mafy kokoa sy fanitarana ny fahitana ny filazana. Foana azo safidiana, tsy mihatra amin’ny hofa, tsy mihatra amin’ny mpianatra.',
  'proprietaires.pricing.priceSuffix': '',

  'proprietaires.faq.eyebrow': 'Fanontaniana avy amin’ny tompon-trano',
  'proprietaires.faq.title': 'Valianay mivantana ianao.',
  'proprietaires.faq.q1.q': 'Mahafiriana ny fanamarinana ?',
  'proprietaires.faq.q1.a':
    'Amin’ny ankapobeny 24-48 ora. Raha mandefa ny taratasinao alatsinainy maraina, voamarina ny talata.',
  'proprietaires.faq.q2.q': 'Voaaro ve ny taratasy fanondroana ?',
  'proprietaires.faq.q2.a':
    'Eny. Voatahiry amin’ny Cloudinary (CDN voaaro amin’ny HTTPS), azon’ny ekipanay ihany hatrany. Tsy haseho mihitsy amin’ny mombamomba anao ho an’ny besinimaro, ary tsy alefa amin’ny mpianatra.',
  'proprietaires.faq.q3.q': 'Filazana firy no azoko avoaka ?',
  'proprietaires.faq.q3.a':
    'Izay tianao mandritra ny beta v0.5 — manaraka ny fanamarinana an-tanana alohan’ny famoahana ny tsirairay. Raha mahita fihetsika tsy mety izahay (filazana mitovy, votoaty mamitaka), afaka mametra ny kaonty mandritra ny fotoana.',
  'proprietaires.faq.q4.q': 'Ahoana no fitantanako ny fangatahana ?',
  'proprietaires.faq.q4.a':
    'Tonga amin’ny WhatsApp-nao ny hafatra. Misy stats ihany koa amin’ny dashboard.',
  'proprietaires.faq.q5.q': 'Inona no hitranga raha mahita mpanofa aho ?',
  'proprietaires.faq.q5.a':
    'Hovaina ho « Voa-hofa » ao amin’ny dashboard. Tsy misy commission, tsy misy taratasy.',
  'proprietaires.faq.q6.q': 'Raha tsy mandoa ny mpanofa ?',
  'proprietaires.faq.q6.a':
    'AryTrano tsy mitantana ny fifandraisana bail/fandoavam-bola — anjaranao sy ny mpanofa izany. Raha misy olana, soraty aminay : afaka mihaino, manamarika ny mpanofa ho an’ny tompon-trano hoavy, ary manolotra torohevitra. Tsy misy serivisy ara-dalàna amin’ny v0.5.',

  'proprietaires.finalCta.title': 'Vonona hamoaka ?',
  'proprietaires.finalCta.lead': '5 mn. Tsy misy saran’asa. Validation 24-48 ora.',
  'proprietaires.finalCta.cta': 'Mamorona kaonty tompon-trano',

  // ── /quartiers page ──
  'quartiers.meta.title': 'Faritra ao Fianarantsoa',
  'quartiers.meta.description':
    'Fantaro ny faritra 8 ao Fianarantsoa: hatsaran-toetra, fitaterana, salan’ny vidim-panofana, filazana misy.',
  'quartiers.eyebrow': 'Faritra',
  'quartiers.h1': 'Ireo faritra 8 ao Fianarantsoa.',
  'quartiers.lead':
    'Manomboka amin’i Antarandolo manana hetsika hatrany hatrany ny haavon’i Ankidona — safidio ny faritra mifanaraka amin’ny fomba fiainanao, fa tsy ny tetibola fotsiny.',
  'quartiers.stats.quartiers.label': 'Faritra voarakitra',
  'quartiers.stats.listings.label': 'Filazana misy',
  'quartiers.stats.priceRange.label': 'Eo anelanelan’ny Ar/volana',
  'quartiers.stats.priceRange.value': '95k–420k',
  'quartiers.block.dataCell.avgPrice': 'Salan’ny hofa',
  'quartiers.block.dataCell.distance': 'Lavitra ny afovoany',
  'quartiers.block.dataCell.listings': 'Filazana',
  'quartiers.block.dataCell.listings.value.one': '{count} mavitrika',
  'quartiers.block.dataCell.listings.value.other': '{count} mavitrika',
  'quartiers.block.dataCell.avgPrice.sub': '/volana',
  'quartiers.block.dataCell.avgPrice.noData': '—',
  'quartiers.block.poi.walk': 'An-tongotra',
  'quartiers.block.poi.transport': 'Fitaterana',
  'quartiers.block.sample.label': 'Topi-maso amin’ny filazana',
  'quartiers.block.sample.viewAll.one': 'Hijery ny filazana',
  'quartiers.block.sample.viewAll.other': 'Hijery ireo {count}',
  'quartiers.block.sample.empty': 'Tsy misy filazana mavitrika amin’izao.',
  'quartiers.cta.eyebrow': 'Misalasala ve ianao ?',
  'quartiers.cta.title': 'Tsy fantatrao izay faritra mifanaraka aminao ?',
  'quartiers.cta.lead':
    'Mamalia fanontaniana 6 (tetibola, sekoly, karazana trano, atmosfera, fitaterana, laharam-pahamehana) — homenay anao ny faritra 3 mifanaraka aminao. Tsy mila kaonty.',
  'quartiers.cta.primary': 'Manaova fanontaniana (2 min)',
  'quartiers.cta.secondary': 'Hijery ny filazana rehetra',

  // Quiz wizard — meta + chrome
  'quiz.meta.title':
    'Inona no faritra mifanaraka aminao any Fianarantsoa ?',
  'quiz.meta.description':
    'Fanontaniana 6, 2 minitra — homenay anao ny faritra ao Fianarantsoa mifanaraka amin’ny tetibolanao, ny sekolinao ary ny fomba fiainanao.',
  'quiz.h1': 'Inona no faritra mifanaraka aminao ?',
  'quiz.lead':
    'Fanontaniana 6 hahitana ireo faritra ao Fianarantsoa mifanaraka amin’ny fiainanao mpianatra.',
  'quiz.progress': 'Fanontaniana {step} amin’ny {total}',
  'quiz.next': 'Manaraka',
  'quiz.back': 'Miverina',
  'quiz.submit': 'Hijery ny faritra',
  'quiz.restart': 'Atao indray',

  // Q1 — Tetibola
  'quiz.q.budget.title': 'Ohatrinona ny tetibolanao isam-bolana ?',
  'quiz.q.budget.help': 'Hofan-trano sy fandaniana iraisana.',
  'quiz.q.budget.opt.lt150k': 'Latsaky ny 150 000 Ar',
  'quiz.q.budget.opt.150_250k': '150 000 – 250 000 Ar',
  'quiz.q.budget.opt.250_400k': '250 000 – 400 000 Ar',
  'quiz.q.budget.opt.gte400k': 'Mihoatra ny 400 000 Ar',

  // Q2 — Sekoly
  'quiz.q.school.title': 'Aiza ianao no mianatra ?',
  'quiz.q.school.help': 'Hizahanay aloha ireo faritra akaikin’ny sekolinao.',
  'quiz.q.school.opt.university': 'Anjerimanontolo Fianarantsoa',
  'quiz.q.school.opt.lycee': 'Lycée · afovoan-tanàna',
  'quiz.q.school.opt.unsure': 'Hafa · tsy mbola fantatro',

  // Q3 — Karazana trano
  'quiz.q.housingType.title': 'Karazana trano inona no tadiavinao ?',
  'quiz.q.housingType.help': 'Azonao sivanina any aoriana.',
  'quiz.q.housingType.opt.ROOM': 'Efitra tokana',
  'quiz.q.housingType.opt.STUDIO': 'Studio',
  'quiz.q.housingType.opt.APARTMENT': 'Appartement',
  'quiz.q.housingType.opt.any': 'Tsy misy safidy',

  // Q4 — Atmosfera
  'quiz.q.vibe.title': 'Inona no atmosfera tianao ?',
  'quiz.q.vibe.help': 'Ampifanarahanay ny atmosferan’ny faritra amin’ny anao.',
  'quiz.q.vibe.opt.calm': 'Mangina, te-hatory aho',
  'quiz.q.vibe.opt.lively': 'Mavitrika, fiainana an-tanàna, tsena',
  'quiz.q.vibe.opt.mixed': 'Mifangaro : mangina alina, mavitrika atoandro',

  // Q5 — Fitaterana
  'quiz.q.mobility.title': 'Ahoana ny fivezivezenao ?',
  'quiz.q.mobility.help': 'Isan’andro — sekoly, fividianana, fialambolana.',
  'quiz.q.mobility.opt.walk': 'An-tongotra fotsiny',
  'quiz.q.mobility.opt.taxibe': 'Taxi-be · posy',
  'quiz.q.mobility.opt.car': 'Manana fiara aho',

  // Q6 — Laharam-pahamehana
  'quiz.q.priority.title': 'Inona ny laharam-pahamehanao ?',
  'quiz.q.priority.help': 'Ny zava-dehibe indrindra amin’ny safidinao.',
  'quiz.q.priority.opt.price': 'Vidiny ambany indrindra',
  'quiz.q.priority.opt.school': 'Akaikin’ny sekoly',
  'quiz.q.priority.opt.calm': 'Fiadanana',
  'quiz.q.priority.opt.social': 'Fiainan’ny mpiara-monina · varotra',

  // Pejy valiny
  'quiz.results.eyebrow': 'Ny faritranao',
  'quiz.results.title': 'Indreto ny faritra 3 mifanaraka aminao',
  'quiz.results.subtitle':
    'Nampitahainay tamin’ny mombamomba ny faritra tsirairay ny valin-teninao. Voalohany ny tena mifanaraka.',
  'quiz.results.topMatchLabel': 'Tena mifanaraka',
  'quiz.results.whyMatches': 'Antony mifanaraka',
  'quiz.results.alsoConsider': 'Mendrika dinihina ihany koa',
  'quiz.results.viewListings.one': 'Hijery ilay filazana',
  'quiz.results.viewListings.other': 'Hijery ireo filazana {count}',
  'quiz.results.viewListings.zero':
    'Mbola tsy misy filazana — hampahafantarinay ianao',
  'quiz.results.emailEyebrow': 'Aza adino',
  'quiz.results.emailTitle':
    'Raiso ny filazana vaovao amin’ireo faritra ireo',
  'quiz.results.emailLead':
    'Mailaka iray isaky ny filazana vaovao, tsy misy spam. Azonao foanana foana.',
  'quiz.results.emailPlaceholder': 'mailakanao@ohatra.com',
  'quiz.results.emailSubmit': 'Misoratra anarana',
  'quiz.results.emailSuccess':
    'Voarainay — hosoratanay aminao raha vao misy filazana vaovao.',
  'quiz.results.emailError':
    'Nisy olana. Andramo indray afaka kely.',
  'quiz.results.shareLabel': 'Hizara ny valiny',

  // Antony eo amin’ny carte (kaody → teny azon’ny olona vakiana)
  'quiz.reason.budget.match': 'Mifanaraka amin’ny tetibolanao',
  'quiz.reason.school.university.close': 'Akaikin’ny fac',
  'quiz.reason.school.lycee.close': 'Akaikin’ny lycée',
  'quiz.reason.housingType.available': 'Misy ny karazan-trano tadiavinao',
  'quiz.reason.vibe.match': 'Atmosfera mifanaraka aminao',
  'quiz.reason.mobility.walk.good': 'Rehetra an-tongotra',
  'quiz.reason.mobility.taxibe.good': 'Misy taxi-be tsara',
  'quiz.reason.mobility.car.good': 'Mety amin’ny fiara',
  'quiz.reason.priority.price.matches': 'Vidiny manintona',
  'quiz.reason.priority.school.matches': 'Faritra mpianatra',
  'quiz.reason.priority.calm.matches': 'Toerana milamina',
  'quiz.reason.priority.social.matches': 'Fiainana an-tanàna mavitrika',

  // 8 faritra — atmosfera, an-tongotra, fitaterana, halaviran-dalana
  'quartiers.andrainjato.ambiance':
    'Mavitrika nandritra ny herinandro, milamina ny faran’ny herinandro. Toerana fonenan’ny mpianatra mananontanona.',
  'quartiers.andrainjato.walk':
    'Fac de Sciences · École polytechnique · Tranom-boky an-tampon’oniversite',
  'quartiers.andrainjato.transport': 'Taxi-be lalana 1 · Pousse-pousse',
  'quartiers.andrainjato.distance': '10 mn ny afovoany',

  'quartiers.antarandolo.ambiance':
    'Fonenana, ankohonana. Milamina tokoa, madio, hazavaina tsara amin’ny alina.',
  'quartiers.antarandolo.walk':
    'Fiangonana katolika · Sekoly tsy miankina Sainte-Marie · Tsenakely',
  'quartiers.antarandolo.transport': 'Taxi-be lalana 3',
  'quartiers.antarandolo.distance': '15 mn ny afovoany',

  'quartiers.tsianolondroa.ambiance':
    'Foiben’ny tantara. Velombelona, tsena sy fivarotana an-tongotra.',
  'quartiers.tsianolondroa.walk':
    'Tsena ivon-toerana · Banky · Toeram-pisakafoanana · Sinema',
  'quartiers.tsianolondroa.transport':
    'Ny taxi-be rehetra · Gara fitaterana 10 mn',
  'quartiers.tsianolondroa.distance': 'Afovoan-tanàna',

  'quartiers.mahamanina.ambiance':
    'Havoana sy panorama eo ambonin’ny tanàna. Milamina, lalana mideza.',
  'quartiers.mahamanina.walk':
    'Toerana fijerena ny tanàna · Epicerie kely an-toerana',
  'quartiers.mahamanina.transport': 'Taxi-be lalana 4 (tsy tafiditra)',
  'quartiers.mahamanina.distance': '20 mn ny afovoany',

  'quartiers.anjoma.ambiance':
    'Sampanan-dalan’ny fitaterana. Mahasoa amin’ny dia, indraindray mitabataba.',
  'quartiers.anjoma.walk':
    'Gara fitaterana · Toeram-pivarotam-pamokarana · Fivarotana · Fivarotam-panafody 24h',
  'quartiers.anjoma.transport': 'Ny lalana rehetra · Gara fitaterana eo an-toerana',
  'quartiers.anjoma.distance': '8 mn ny afovoany',

  'quartiers.ankidona.ambiance':
    'Havoana fonenana. Topimaso malalaka, rivotra madio.',
  'quartiers.ankidona.walk': 'Belvédère · Fiangonana FJKM',
  'quartiers.ankidona.transport':
    'Taxi-be lalana 5 (mahalana) · An-tongotra no faniriana',
  'quartiers.ankidona.distance': '18 mn ny afovoany',

  'quartiers.ambalavato.ambiance':
    'Toerana ho an’ny sekoly sy ny mpianatra. Fiainana an-tanàna mavitrika.',
  'quartiers.ambalavato.walk':
    'Lycée Andrianampoinimerina · Kianja fanatanjahantena · Fivarotam-panafody',
  'quartiers.ambalavato.transport': 'Taxi-be lalana 1',
  'quartiers.ambalavato.distance': '12 mn ny afovoany',

  'quartiers.mahasoabe.ambiance':
    'Faritra atsimo milamina. Tony, fianakaviana, sekoly sy paroasy.',
  'quartiers.mahasoabe.walk':
    'Sekoly ambaratonga voalohany · Paroasy · Fivarotana kely',
  'quartiers.mahasoabe.transport': 'Taxi-be lalana 6',
  'quartiers.mahasoabe.distance': '25 mn ny afovoany',

  // Home page (legacy, dropped after T-051)
  'home.metaTitle': 'Trano ho an\'ny mpianatra ao Madagasikara',
  'home.metaDescription':
    'Tadiavo ny efitra na apartemà ao Fianarantsoa. Tompon-trano voamarina, vidiny amin\'ny Ariary, fifandraisana mivantana amin\'ny WhatsApp.',
  'home.eyebrow':
    'Fianarantsoa — tsy ho ela Antananarivo, Toamasina, Mahajanga, Toliara',
  'home.heroTitle':
    'Tadiavo ny tranonao ho mpianatra ao Madagasikara, amin\'ny fahatokisana.',
  'home.heroLead':
    'AryTrano dia mampifandray ny mpianatra amin\'ny tompon-trano voamarina. Sary marina, vidiny mazava, fifandraisana mivantana amin\'ny WhatsApp na finday.',
  'home.cta.dashboard': 'Ny solaitrabeko',
  'home.cta.signUp': 'Hanao kaonty',
  'home.cta.signIn': 'Hiditra',
  'home.feature.verified.title': 'Tompon-trano voamarina',
  'home.feature.verified.body':
    'Voamarina ny mombamomba, voafantina ny dokam-barotra. Fantatrao izay iresahanao.',
  'home.feature.price.title': 'Vidiny Ariary',
  'home.feature.price.body':
    'Soratana mazava isam-bolana, tsy misy sarany miafina. Tsy misy fahatongavana mahasosotra.',
  'home.feature.contact.title': 'Fifandraisana mivantana',
  'home.feature.contact.body':
    'WhatsApp na finday amin\'ny kitihana iray. Tsy misy hafatra mampihena hafainganana.',

  // User roles
  'role.STUDENT': 'Mpianatra',
  'role.OWNER': 'Tompon-trano',
  'role.ADMIN': 'Mpitantana',

  // Listing statuses
  'status.DRAFT': 'Volavolan-kevitra',
  'status.PUBLISHED': 'Navoaka',
  'status.UNAVAILABLE': 'Tsy malalaka',
  'status.SUSPENDED': 'Naatoatoana',
  'status.DELETED': 'Voafafa',

  // Account sidebar
  'sidebar.myAccount': 'Ny kaontiko',
  'sidebar.section.listings': 'Trano hofaina',
  'sidebar.section.discover': 'Fitadiavana',
  'sidebar.section.account': 'Kaonty',
  'sidebar.favorites': 'Tiana',

  // Favorites
  'favorites.add': 'Ampio amin\'ny tiana',
  'favorites.remove': 'Esory amin\'ny tiana',
  'favorites.save': 'Tehirizo',
  'favorites.saved': 'Voatahiry',
  'favorites.error': 'Tsy mety. Andramo indray.',
  'favorites.page.metaTitle': 'Ireo tiako',
  'favorites.page.title': 'Ireo tiako',
  'favorites.page.lead': 'Ireo filazana notahirizinao.',
  'favorites.page.empty.title': 'Mbola tsy misy ny tiana',
  'favorites.page.empty.lead': 'Tsindrio ny fo eo amin\'ny filazana mba hahitanao izany eto.',
  'favorites.page.empty.cta': 'Hijery ny filazana',
  'favorites.page.next': 'Pejy manaraka',
  'favorites.page.pagination': 'Pejy ireo tiana',
  'favorites.removeAll.cta': 'Esory daholo',
  'favorites.removeAll.dialog.title': 'Esorina daholo ny tiana ?',
  'favorites.removeAll.dialog.body':
    'Hanesotra filazana {count} amin\'ny tiana ianao. Tsy azo averina — fa azonao atao indray ny mametraka azy iray-iray.',
  'favorites.removeAll.dialog.cancel': 'Hialana',
  'favorites.removeAll.dialog.confirm': 'Esory daholo',
  'favorites.removeAll.dialog.pending': 'Manesotra…',
  'favorites.removeAll.success': 'Voaesotra ny tiana {count}.',
  'favorites.removeAll.needsAuth': 'Midira mba hitantana ny tiana.',
  'favorites.removeAll.error': 'Tsy nahomby ny fanesorana. Andramo indray.',
  'sidebar.myListings': 'Ny tranoko',
  'sidebar.verifyOwner': 'Fanamarinana maha-ianao',
  'sidebar.profile': 'Mombamomba',
  'sidebar.security': 'Filaminana',
  'sidebar.signOut': 'Hivoaka',

  // Dashboard — listing stats (T-046)
  'dashboard.listingStats.title': 'Antontan-tarehimarika filazana',
  'dashboard.listingStats.back': 'Hiverina amin\'ny tranoko',
  'dashboard.listingStats.viewPublic': 'Hijery ny filazana navoaka',
  'dashboard.listingStats.kpi.contactsTotal': 'Fifandraisana totaly',
  'dashboard.listingStats.kpi.contactsTotal.help':
    'Isan\'ny tsindrim-paneva « Mifandray » nanomboka tamin\'ny voalohany.',
  'dashboard.listingStats.kpi.contacts30d': 'Fifandraisana 30 andro',
  'dashboard.listingStats.kpi.contacts30d.help':
    '{wa} WhatsApp · {ph} telefaonina',
  'dashboard.listingStats.kpi.reviews': 'Hevitra navoaka',
  'dashboard.listingStats.kpi.reviews.helpRated':
    'Salan\'isa {avg}/5',
  'dashboard.listingStats.kpi.reviews.helpEmpty':
    'Mbola tsy misy hevitra. Hangatahina hanome hevitra ny mpianatra 14 andro aorian\'ny fifandraisana.',
  'dashboard.listingStats.kpi.conversion': 'Tahan\'ny hevitra',
  'dashboard.listingStats.kpi.conversion.help':
    'Hevitra navoaka ÷ fifandraisana totaly. Mitombo arakaraka ny fizarana.',
  'dashboard.listingStats.recentContacts.title': 'Fifandraisana farany',
  'dashboard.listingStats.recentContacts.empty':
    'Mbola tsy misy fifandraisana. Jereo raha mety ny sary sy ny vidiny.',
  'dashboard.listingStats.recentContacts.signedIn':
    'Mpitsidika voafantatra (kaonty AryTrano)',
  'dashboard.listingStats.recentContacts.anonymous':
    'Mpitsidika tsy fantatra',
  'dashboard.listingStats.recentContacts.privacy':
    'Mba hanajana ny vie privée ny mpianatra, hita ihany ny mombamomba azy rehefa nandefa hafatra WhatsApp izy ireo.',
  'dashboard.listingStats.channel.whatsapp': 'Fifandraisana WhatsApp',
  'dashboard.listingStats.channel.phone': 'Antso telefaonina',
  'dashboard.listings.statsCta': 'Antontan-tarehimarika',

  // Dashboard — listings index
  'dashboard.listings.title': 'Ny tranoko',
  'dashboard.listings.count.one': 'Trano {count}',
  'dashboard.listings.count.other': 'Trano {count}',
  'dashboard.listings.leadSuffix': '· volavolan-kevitra, navoaka, tsy malalaka.',
  'dashboard.listings.newListing': 'Trano vaovao',
  'dashboard.listings.create.cta': 'Hamorona trano',
  'dashboard.listings.empty.title': 'Mbola tsy misy trano.',
  'dashboard.listings.empty.lead':
    'Manaova ny trano voalohany — afaka ampianao sy avoakanao avy eo.',
  'dashboard.listings.edit': 'Hanova',
  'dashboard.listings.noThumbnail': 'Mbola tsy misy sary',
  'dashboard.listings.contactCount.one': 'Fifandraisana {count}',
  'dashboard.listings.contactCount.other': 'Fifandraisana {count}',
  'dashboard.listings.photoCount.one': 'Sary {count}',
  'dashboard.listings.photoCount.other': 'Sary {count}',
  'dashboard.listings.publishedOn': 'Navoaka ny {date}',
  'dashboard.listings.createdOn': 'Noforonina ny {date}',
  'dashboard.listings.perMonth': '/ volana',

  // Dashboard — new listing
  'dashboard.newListing.title': 'Trano vaovao',
  'dashboard.newListing.lead':
    'Manaova volavolan-kevitra — afaka ampianao sary sy avoakanao avy eo.',
  'dashboard.backToListings': '← Ny tranoko',

  // Dashboard — edit listing
  'dashboard.editListing.section.photos.title': 'Sary',
  'dashboard.editListing.section.photos.lead':
    'Mila farafahakeliny sary 1 vao afaka avoaka. Ny voalohany no atao sary fanasongadinana.',
  'dashboard.editListing.section.info.title': 'Mombamomba',
  'dashboard.editListing.section.info.lead': 'Ireo mombamomba hiseho amin\'ny pejy ho an\'ny besinimaro.',
  'dashboard.editListing.section.status.title': 'Sata sy famoahana',
  'dashboard.editListing.section.status.lead':
    'Avoahy rehefa vonona. Azonao soratana hoe tsy malalaka aoriana fa tsy very ny URL.',

  // Profile page
  'dashboard.profile.title': 'Mombamomba ho an\'ny besinimaro',
  'dashboard.profile.lead':
    'Ireo mombamomba ireo dia miseho amin\'ny tranonao. Voasokitra EXIF, sary novaina ho WebP.',

  // Profile form
  'profileForm.avatar.title': 'Sary mombamomba',
  'profileForm.avatar.lead': 'JPG na PNG · 2 Mo am-pony · EXIF voasokitra.',
  'profileForm.avatar.change': 'Hanova',
  'profileForm.avatar.uploading': 'Mampakatra…',
  'profileForm.avatar.remove': 'Esory',
  'profileForm.name.label': 'Anarana hiseho',
  'profileForm.name.placeholder': 'Andry Rakoto',
  'profileForm.email.label': 'Adiresy mailaka na anaram-pampiasa',
  'profileForm.phone.label': 'Laharana WhatsApp',
  'profileForm.phone.placeholder': '+261 34 12 345 67',
  'profileForm.phone.hint': 'Miafina mandra-pikitihana — manakana ny fakana.',
  'profileForm.locale.label': 'Fiteny tiana',
  'profileForm.locale.placeholder': 'Misafidiana fiteny',
  'profileForm.locale.fr-MG': 'Français (Madagascar)',
  'profileForm.locale.mg': 'Malagasy',
  'profileForm.cancel': 'Hanafoana',
  'profileForm.save': 'Tehirizo',
  'profileForm.saving': 'Mitahiry…',
  'profileForm.toast.saved': 'Voasoratra ny mombamomba.',
  'profileForm.toast.avatarSaved': 'Novaina ny sary.',
  'profileForm.toast.avatarRemoved': 'Voafafa ny sary.',
  'profileForm.toast.avatarFailed': 'Tsy nahomby ny fampakarana.',
  'profileForm.toast.error': 'Nisy olana.',

  // Listing form
  'listingForm.title.label': 'Lohateny',
  'listingForm.title.placeholder': 'Efitra mangina ho an\'ny mpianatra ao Andrainjato',
  'listingForm.description.label': 'Famaritana',
  'listingForm.description.placeholder':
    'Mazava, mangina, akaikin\'ny anjerimanontolo. Misy Wifi…',
  'listingForm.description.hint': 'Farafahakeliny 20 marika, farabetsany 2000.',
  'listingForm.type.label': 'Karazana trano',
  'listingForm.type.placeholder': 'Misafidiana',
  'listingForm.price.label': 'Vidiny isam-bolana (Ar)',
  'listingForm.city.label': 'Tanàna',
  'listingForm.city.placeholder': 'Misafidiana tanàna',
  'listingForm.neighborhood.label': 'Faritra',
  'listingForm.neighborhood.placeholder': 'Misafidiana faritra',
  'listingForm.neighborhood.pickCityFirst': 'Safidio aloha ny tanàna',
  'listingForm.surface.label': 'Velarany (m²)',
  'listingForm.bedrooms.label': 'Efitra fatoriana',
  'listingForm.bathrooms.label': 'Efitrano fandroana',
  'listingForm.furnished.label': 'Misy fanaka',
  'listingForm.submit.create': 'Hamorona volavolan-kevitra',
  'listingForm.submit.update': 'Tehirizo ny fanovana',
  'listingForm.submit.saving': 'Mitahiry…',
  'listingForm.toast.saved': 'Voasoratra ny trano.',

  // Listing actions
  'listingActions.publish': 'Avoaka',
  'listingActions.publishing': 'Mamoaka…',
  'listingActions.markUnavailable': 'Soraty hoe tsy malalaka',
  'listingActions.markAvailable': 'Ampidiro indray',
  'listingActions.updating': 'Manavao…',
  'listingActions.delete': 'Fafao',
  'listingActions.deleting': 'Mamafa…',
  'listingActions.confirm': 'Hamafiso',
  'listingActions.cancel': 'Hanafoana',
  'listingActions.confirmHint': 'Soraty',
  'listingActions.confirmWord': 'SUPPRIMER',
  'listingActions.toast.ok': 'OK',
  'listingActions.toast.error': 'Nisy olana.',
  'listingActions.menuAria': 'Asa amin’ny filazana',
  'listingActions.confirmInput.aria': 'Soraty SUPPRIMER mba hanamafisana',

  // Photo manager
  'photoManager.counter': '{current} / {max} sary · sintony-aroso hanavaozana ny filaharany.',
  'photoManager.counterHint': 'Ny sary voalohany no atao sary fanasongadinana.',
  'photoManager.add': 'Manampia sary',
  'photoManager.uploading': 'Mampakatra…',
  'photoManager.empty': 'Mbola tsy misy sary. Manampia farafahakeliny iray vao afaka avoakanao ny trano.',
  'photoManager.thumbnail': 'Sary fanasongadinana',
  'photoManager.remove': 'Esory',
  'photoManager.toast.added': 'Voampy ny sary.',
  'photoManager.toast.removed': 'Voafafa ny sary.',
  'photoManager.toast.reordered': 'Voasoratra ny filaharana.',
  'photoManager.toast.uploadFailed': 'Tsy nahomby ny fampakarana — andramo indray.',
  'photoManager.toast.removeFailed': 'Tsy nahomby ny famafana.',
  'photoManager.toast.reorderFailed': 'Tsy nahomby ny famindrana.',
  'photoManager.toast.pickFile': 'Misafidiana sary',

  // Dashboard — welcome
  'dashboard.welcome.title': 'Tongasoa {name}',
  'dashboard.welcome.titleNoName': 'Tongasoa',
  'dashboard.welcome.account.STUDENT': 'Kaonty mpianatra.',
  'dashboard.welcome.account.OWNER': 'Kaonty tompon-trano.',
  'dashboard.welcome.account.ADMIN': 'Kaonty mpitantana.',
  'dashboard.stats.totalListings': 'Ny tranoko',
  'dashboard.stats.publishedHint': '{count} navoaka',
  'dashboard.stats.favorites': 'Tiana',
  'dashboard.stats.favoritesHint': 'Filazana voatahiry',
  'dashboard.stats.welcomeRole': 'Andraikitra',
  'dashboard.quickActions.title': 'Fidirana haingana',
  'dashboard.quickActions.go': 'Sokafy',
  'dashboard.nav.listings.title': 'Ny tranoko',
  'dashboard.nav.listings.lead': 'Manaova, ovay, avoaka ny tranonao.',
  'dashboard.nav.favorites.title': 'Ireo tiako',
  'dashboard.nav.favorites.lead': 'Hitao ireo filazana notahirizinao.',
  'dashboard.nav.profile.title': 'Mombamomba',
  'dashboard.nav.profile.lead': 'Ovay ny anarana, finday, fiteny.',
  'dashboard.nav.settings.title': 'Safidy',
  'dashboard.nav.settings.lead':
    'Tenimiafina, fifandraisana sosialy, sary, famafana.',

  // Settings page
  'settings.metaTitle': 'Safidy',
  'settings.title': 'Filaminana',
  'settings.oauthNotConfigured':
    'Tsy misy mpitatitra OAuth voakajy amin\'ity fametrahana ity.',
  'settings.lead':
    'Tantano ny fomba fidirana, jereo ny fidirana vao haingana, ary fafao ny kaontinao raha ilaina.',
  'settings.section.password.title': 'Tenimiafina',
  'settings.section.password.lead': 'Ovay ny tenimiafinao na manampia.',
  'settings.section.oauth.title': 'Fifandraisana sosialy',
  'settings.section.oauth.lead': 'Ampifandraiso na esory ny kaonty Google / Facebook.',
  'settings.section.logins.title': 'Fidirana farany',
  'settings.section.logins.lead': 'Hamarino fa tsy misy fivoriana mahasahirana.',
  'settings.section.notifications.title': 'Fanairana',
  'settings.section.notifications.lead':
    'Fehezo ireo mailaka azonao mandeha ho azy.',
  'settings.notifications.contactReceived.label':
    'Mailaka isaky ny fifandraisana vaovao',
  'settings.notifications.contactReceived.help':
    'Mandefa mailaka aminao izahay raha vao mitsindry « Mifandray » ny mpianatra amin\'ny iray amin\'ny filazanao. Esory raha aleo manjery ny dashboard fotsiny.',
  'settings.notifications.toast.on': 'Voahetsika ny fanairana.',
  'settings.notifications.toast.off': 'Nofoanana ny fanairana.',
  'settings.notifications.error':
    'Tsy nahomby ny fanavaozana ny safidy.',
  'settings.section.danger.title': 'Faritra mampidi-doza',
  'settings.section.danger.lead': 'Mamafa ny kaontinao dia tsy azo verenina.',

  // Password section
  'password.add.lead':
    'Mbola tsy misy tenimiafinao. Manampia iray mba ahafahanao miditra tsy amin\'ny Google.',
  'password.add.label': 'Tenimiafina vaovao',
  'password.add.submit': 'Manampia tenimiafina',
  'password.add.submitting': 'Mitahiry…',
  'password.change.current.label': 'Tenimiafina ankehitriny',
  'password.change.new.label': 'Tenimiafina vaovao',
  'password.change.set': 'Voapetraka ny tenimiafina.',
  'password.change.edit': 'Hanova',
  'password.change.submit': 'Hanavao',
  'password.change.submitting': 'Manavao…',
  'password.cancel': 'Hanafoana',
  'password.toast.added': 'Voampy ny tenimiafina.',
  'password.toast.updated': 'Novaina ny tenimiafina.',

  // OAuth connections
  'oauth.linked': 'Mifandray',
  'oauth.unlinked': 'Tsy mifandray',
  'oauth.link': 'Ampifandraiso',
  'oauth.unlink': 'Esory',
  'oauth.unlinkConfirm': 'Hamafiso ny fanesorana',
  'oauth.cannotUnlink': 'Tsy azonao esorina ny fomba fidirana farany.',

  // Login events
  'loginEvents.empty': 'Mbola tsy misy fidirana voasoratra.',
  'loginEvents.method.CREDENTIALS': 'Tenimiafina',
  'loginEvents.method.GOOGLE': 'Google',
  'loginEvents.method.FACEBOOK': 'Facebook',
  'loginEvents.method.MAGIC_LINK': 'Rohy majika',
  'loginEvents.method.MOBILE_API': 'App finday',
  'loginEvents.mostRecent': 'Vao haingana',
  'loginEvents.unknownLocation': 'Toerana tsy fantatra',
  'loginEvents.unknownBrowser': 'Mpitsidika tsy fantatra',

  // Delete account
  'deleteAccount.lead':
    'Rehefa voafafa, dia tsy azo verenina intsony ny kaontinao sy ny tranonao.',
  'deleteAccount.cta': 'Fafao ny kaontiko',
  'deleteAccount.warning.title': 'Tsy azo verenina ity hetsika ity.',
  'deleteAccount.warning.item.pii': 'Hatao tsy fantatra ny mombamomba anao manokana',
  'deleteAccount.warning.item.listings': 'Hofafana ny tranonao',
  'deleteAccount.warning.item.oauth': 'Esorina ny fifandraisana sosialy',
  'deleteAccount.warning.item.signOut': 'Avoaka avy hatrany ianao',
  'deleteAccount.confirm.label': 'Soraty',
  'deleteAccount.confirm.suffix': 'eto ambany mba hanamafisana',
  'deleteAccount.submit': 'Hamafiso ny famafana',
  'deleteAccount.submitting': 'Mamafa…',
  'deleteAccount.cancel': 'Hanafoana',
  'deleteAccount.toast.success': 'Voafafa ny kaonty.',

  // Auth — sign-in
  'signIn.title': 'Fidirana',
  'signIn.noAccount': 'Mbola tsy manana kaonty?',
  'signIn.signUpLink': 'Hanao kaonty',
  'signIn.separator': 'Na manohy amin\'ny mailaka',
  'signIn.email.label': 'Adiresy mailaka na anaram-pampiasa',
  'signIn.email.placeholder': 'andry@etu.mg',
  'signIn.password.label': 'Tenimiafina',
  'signIn.password.show': 'Asehoy',
  'signIn.password.hide': 'Afeno',
  'signIn.forgot': 'Hadinonao ve ny tenimiafinao?',
  'signIn.submit': 'Hiditra',
  'signIn.submitting': 'Miditra…',
  'signIn.twofa.title': 'Fanamarinana dingana roa',
  'signIn.twofa.lead': 'Soraty ny kaody 6 isa avy amin\'ny rindrambaiko fanamarinana — na kaody famerenana raha tsy azonao kitihina ilay finday.',
  'signIn.twofa.code.label': 'Kaody',
  'signIn.twofa.code.hint': 'Kaody 6 isa (Google Authenticator, 1Password…) na kaody famerenana XXXX-XXXX.',
  'signIn.twofa.submit': 'Hamarino',
  'signIn.twofa.submitting': 'Manamarina…',
  'signIn.twofa.back': 'Miverina',

  // Auth — sign-up
  'signUp.title': 'Hanao kaonty',
  'signUp.haveAccount': 'Efa manana kaonty?',
  'signUp.signInLink': 'Hiditra',
  'signUp.separator': 'Na manohy amin\'ny mailaka',
  'signUp.roleSelector.ariaLabel': 'Karazana kaonty',
  'signUp.role.STUDENT': 'Mpianatra',
  'signUp.role.OWNER': 'Tompon-trano',
  'signUp.name.label': 'Anarana feno',
  'signUp.name.placeholder': 'Andry Rakoto',
  'signUp.email.label': 'Adiresy mailaka na anaram-pampiasa',
  'signUp.email.placeholder': 'andry@etu.mg',
  'signUp.password.label': 'Tenimiafina',
  'signUp.password.show': 'Asehoy',
  'signUp.password.hide': 'Afeno',
  'signUp.verifyBadge': 'Fanamarinana mailaka',
  'signUp.verifyHint':
    'Hisy rohy fampandehanana alefa amin\'ny adiresinao. Tsindrio anatin\'ny ora iray.',
  'signUp.terms': 'Manohy aho, manaiky ny Fepetra sy ny Politikan\'ny Tsiambaratelo.',
  'signUp.submit': 'Hamorona ny kaontiko',
  'signUp.submitting': 'Mamorona…',

  // Auth — forgot password
  'forgot.title': 'Hadinonao ve ny tenimiafinao?',
  'forgot.lead':
    'Soraty ny mailaky ny kaontinao. Halefa rohy mateza 1 ora hanavaozanao azy.',
  'forgot.email.label': 'Adiresy mailaka na anaram-pampiasa',
  'forgot.email.placeholder': 'andry@etu.mg',
  'forgot.email.hint': 'Famerana : 3 fandefasana isan\'adiresy isan\'ora.',
  'forgot.submit': 'Andefaso ny rohy',
  'forgot.submitting': 'Mandefa…',
  'forgot.backToSignIn': '← Hiverina amin\'ny fidirana',
  'forgot.toast.sent': 'Raha misy kaonty amin\'io mailaka io, vao avy nalefa ny rohy.',

  // Auth — reset password
  'reset.password.label': 'Tenimiafina vaovao',
  'reset.confirm.label': 'Hamafiso ny tenimiafina',
  'reset.confirm.mismatch': 'Tsy mitovy ny tenimiafina roa.',
  'reset.submit': 'Hanavao ny tenimiafina',
  'reset.submitting': 'Manavao…',

  // Auth — verify email
  'verifyEmail.title': 'Hamarino ny boatim-pailakanao',
  'verifyEmail.lead':
    'Vao avy nalefa rohy fanamarinana amin\'ny adiresinao. Tsindrio anatin\'ny 24 ora hampiasanao ny kaontinao.',
  'verifyEmail.signInLink': 'Mankanesa amin\'ny fidirana',
  'verifyEmail.changeEmail': 'Hanova adiresy mailaka',
  'verifyEmail.helpInbox':
    'Tsy noraisinao ? Jereo ny spam, na tsindrio « Avereno alefa » etsy ambony. Raha tsy mandeha, soraty indray amin\'ny adiresy hafa.',
  'verifyEmail.resend.cta': 'Avereno alefa ny rohy',
  'verifyEmail.resend.pending': 'Mandefa…',
  'verifyEmail.resend.cooldown': 'Avereno alefa ({seconds}s)',
  'verifyEmail.resend.success': 'Voaverina alefa. Jereo ny boatinao.',
  'verifyEmail.resend.rateLimit':
    'Maro be ny fanandramana. Andramo indray afaka adiny iray.',
  'verifyEmail.resend.invalid': 'Adiresy email tsy mety.',
  'verifyEmail.resend.unavailable':
    'Tsy afaka mandefa amin\'izao. Andramo afaka kely.',
  'signIn.emailNotVerified':
    'Mbola tsy voamarina ny email — tsindrio ny rohy ao amin\'ny boatinao.',
  'signIn.verifiedToast':
    'Voamarina ny email. Afaka miditra ianao.',
  'signIn.reason.sessionExpired':
    'Lany andro ny session. Midira indray hanohizana ny tao aminao.',
  'signIn.reason.accountSuspended':
    'Voasakana ny kaontinao. Mifandraisa aminay raha hadisoana.',
  'dashboard.reason.adminRevoked':
    'Voaesotra ny zo admin-nao. Mifandraisa amin\'ny admin hafa raha ilaina.',

  // 404 — global + scoped listing variant
  'notFound.title': 'Tsy misy ity pejy ity (na tsy misy intsony).',
  'notFound.lead':
    'Mety efa tsy mandeha ny rohy, na nafindra ny loharanon-kevitra. Miverena amin\'ny fandraisana na jereo ny filazana misy.',
  'notFound.cta.home': 'Fandraisana',
  'notFound.cta.listings': 'Hijery ny filazana',
  'listing.notFound.title': 'Tsy misy intsony ity filazana ity.',
  'listing.notFound.lead':
    'Mety efa nesorin\'ny tompony na nahofa. Be no filazana hafa miandry anao — araka ny faritra na ny sivana.',
  'listing.notFound.cta.search': 'Filazana rehetra',
  'listing.notFound.cta.quartiers': 'Hizaha ny faritra',

  // Auth — error page descriptions
  'authError.description.default': 'Tsy afaka namarana ny fidirana izahay. Andramo indray.',
  'authError.description.configuration':
    'Tsy mety idirana vetivety ny serivisin\'ny fidirana. Andramo indray — raha mitohy ny olana, ifandraiso aminay.',
  'authError.description.accessDenied':
    'Nofoananao na nolavin\'ny mpitatitra ny fidirana. Andramo indray na ampiasao fomba hafa.',
  'authError.description.verification':
    'Tsy mitombina intsony ity rohy ity. Mangataha vaovao avy amin\'ny pejy fidirana.',
  'authError.description.credentialsSignin':
    'Diso ny mailaka na tenimiafina. Hamarino ny mombamomba ary andramo indray.',
  'authError.description.oauthAccountNotLinked':
    'Mifandray amin\'ny fomba fidirana hafa ity mailaka ity. Midira amin\'ny fomba mahazatra ary ampifandraiso io mpitatitra io ao amin\'ny safidy.',
  'authError.code': 'Kaody',

  // OAuth providers
  'oauthProvider.google': 'Manohy amin\'ny Google',
  'oauthProvider.facebook': 'Manohy amin\'ny Facebook',
  'oauthProvider.redirecting': 'Mihodina…',

  // Admin console
  'admin.console': 'Console admin',
  'admin.section.dashboard': 'Solaitra fanaraha-maso',
  'admin.section.moderation': 'Fanaraha-maso',
  'admin.section.marketing': 'Marketing',
  'admin.nav.overview': 'Topi-maso ankapobeny',
  'admin.nav.listings': 'Trano hofaina',
  'admin.nav.reports': 'Fitarainana',
  'admin.nav.testimonials': 'Fijoroana ho vavolombelona',
  'admin.nav.whatsappAlerts': 'Fanairana WhatsApp',
  'admin.headerLink': 'Admin',

  // Admin WhatsApp Alerts (T-044)
  'admin.alerts.page.title': 'Fanairana WhatsApp',
  'admin.alerts.page.lead':
    'Lisitry ny mpisoratra anarana. Sivanao araka ny faritra na ny fiteny, safidio, esory amin\'ny CSV, dia mandefa broadcast amin\'ny WhatsApp Business.',
  'admin.alerts.kpi.total': 'Mpisoratra mavitrika',
  'admin.alerts.kpi.newThisWeek': '7 andro lasa',
  'admin.alerts.kpi.locale': 'Araka ny fiteny',
  'admin.alerts.kpi.unsubscribed': 'Voaesotra',
  'admin.alerts.filter.quartier': 'Faritra',
  'admin.alerts.filter.locale': 'Fiteny',
  'admin.alerts.filter.allQuartiers': 'Faritra rehetra',
  'admin.alerts.filter.allLocales': 'Fiteny rehetra',
  'admin.alerts.col.phone': 'Telefaonina',
  'admin.alerts.col.locale': 'Fiteny',
  'admin.alerts.col.quartier': 'Faritra sivanina',
  'admin.alerts.col.signedUp': 'Nisoratra ny',
  'admin.alerts.col.anyQuartier': 'faritra rehetra',
  'admin.alerts.selectedCount': '{count} voafidy',
  'admin.alerts.selection.clear': 'Esory ny safidy',
  'admin.alerts.selection.toggleAll': 'Safidio ny rehetra',
  'admin.alerts.selection.toggleOne': 'Safidio ity laharana ity',
  'admin.alerts.export.all': 'Esorina amin\'ny CSV ({count})',
  'admin.alerts.export.selected': 'Esory ny voafidy',
  'admin.alerts.export.success': 'CSV voatahiry — fifandraisana {count}.',
  'admin.alerts.empty':
    'Tsy misy mpisoratra mifanaraka. Vahao na esory ny sivana.',
  'admin.alerts.next': 'Pejy manaraka',
  'admin.alerts.privacy':
    'Ireo voaesotra (T-045) dia esorina amin\'ny export rehetra, na dia amin\'ny safidy aza — anti pile-on.',

  // Admin testimonials CRUD (T-042)
  'admin.testimonials.list.title': 'Fijoroana ho vavolombelona',
  'admin.testimonials.list.lead':
    'Teny navoaka ao amin\'ny pejy fandraisan\'ny AryTrano. Manampia, manova, mamoaha na manesotra araka ny ilaina.',
  'admin.testimonials.list.create': 'Hanampy vaovao',
  'admin.testimonials.list.empty':
    'Mbola tsy misy — tsindrio « Hanampy vaovao » mba hanomboka.',
  'admin.testimonials.list.next': 'Pejy manaraka',
  'admin.testimonials.list.backLink': 'Hiverina amin\'ny lisitra',
  'admin.testimonials.filter.audience.all': 'Mpanaraka rehetra',
  'admin.testimonials.filter.audience.owner': 'Tompon-trano',
  'admin.testimonials.filter.audience.student': 'Mpianatra',
  'admin.testimonials.filter.status.all': 'Sata rehetra',
  'admin.testimonials.filter.status.published': 'Navoaka',
  'admin.testimonials.filter.status.draft': 'Drafy',
  'admin.testimonials.new.title': 'Fijoroana vaovao',
  'admin.testimonials.new.lead':
    'Mamorona teny avy amin\'ny tena valin-teny azo tamin\'ny WhatsApp na mailaka tamin\'ny tompon-trano na mpianatra.',
  'admin.testimonials.edit.title': 'Manova ny fijoroana',
  'admin.testimonials.edit.lead':
    'Hita amin\'ny besinimaro aorian\'ny fanavaozana (mety 5 mn cache).',
  'admin.testimonials.form.audience.label': 'Mpanaraka',
  'admin.testimonials.form.audience.owner': 'Tompon-trano',
  'admin.testimonials.form.audience.student': 'Mpianatra',
  'admin.testimonials.form.authorName.label': 'Anarana hiseho',
  'admin.testimonials.form.authorName.placeholder': 'Andry R. na Maison Rasoa',
  'admin.testimonials.form.authorMeta.label': 'Andalana faharoa (tsy voatery)',
  'admin.testimonials.form.authorMeta.placeholder':
    'Trano 3 voamarina · Andrainjato',
  'admin.testimonials.form.authorMeta.help':
    'Miseho kely eo ambanin\'ny anarana. Ilaina ho amin\'ny tontolo (anarana asa, faritra, taonan\'ny fiaraha-miasa).',
  'admin.testimonials.form.body.label': 'Teny',
  'admin.testimonials.form.body.placeholder':
    'Voa-hofa tao anatin\'ny 4 andro ny studio-ko. Tsy nisy taratasy amin\'ny AryTrano.',
  'admin.testimonials.form.body.charCount': '{count}/{max} litera',
  'admin.testimonials.form.sortOrder.label': 'Filaharana',
  'admin.testimonials.form.sortOrder.help':
    'Kely = ambony amin\'ny landing. 0 ho default. Mahasoa raha mametra teny hero.',
  'admin.testimonials.form.publishImmediately.label':
    'Mamoaka avy hatrany',
  'admin.testimonials.form.publishImmediately.help':
    'Esory raha tianao ho draft — afaka mamoaka aty aoriana avy amin\'ny lisitra.',
  'admin.testimonials.form.submit.create': 'Mamorona',
  'admin.testimonials.form.submit.update': 'Manavao',
  'admin.testimonials.form.submit.pending': 'Mitahiry…',
  'admin.testimonials.row.edit': 'Manova',
  'admin.testimonials.row.publish': 'Mamoaka',
  'admin.testimonials.row.unpublish': 'Esory amin\'ny besinimaro',
  'admin.testimonials.row.delete': 'Esory',
  'admin.testimonials.delete.dialog.title': 'Esorina io fijoroana io ?',
  'admin.testimonials.delete.dialog.body':
    'Tsy azo averina io. Esorina avy hatrany amin\'ny landing ny teny.',
  'admin.testimonials.delete.dialog.cancel': 'Hialana',
  'admin.testimonials.delete.dialog.confirm': 'Esory',
  'admin.testimonials.toast.published': 'Navoaka ny fijoroana.',
  'admin.testimonials.toast.unpublished': 'Voaesotra tamin\'ny besinimaro.',
  'admin.testimonials.toast.deleted': 'Voaesotra ny fijoroana.',
  'admin.testimonials.toast.error': 'Tsy nahomby. Andramo indray.',

  // Admin overview
  'admin.overview.title': 'Topi-maso ankapobeny',
  'admin.overview.lead':
    'Fanaraha-maso AryTrano · trano, fitarainana, mpampiasa. Avy hatrany ny isa rehetra.',
  'admin.overview.unauthorized.title': 'Voatokana ho an\'ny mpitantana ihany',
  'admin.overview.unauthorized.lead':
    'Tsy manana andraikitra ADMIN ny kaontinao. Raha hadisoana, ifandraiso amin\'ny tompon\'andraikitra.',
  'admin.stats.listings.total': 'Trano total',
  'admin.stats.listings.published': 'Navoaka',
  'admin.stats.listings.draft': 'Volavolan-kevitra',
  'admin.stats.listings.unavailable': 'Tsy malalaka',
  'admin.stats.listings.suspended': 'Naatoatoana',
  'admin.stats.listings.deleted': 'Voafafa',
  'admin.stats.reports.open': 'Fitarainana misokatra',
  'admin.stats.reports.lead':
    'Atao laharam-pahamehana. Tsindrio mba hijerena ny lisitra.',
  'admin.stats.users.total': 'Mpampiasa',
  'admin.stats.users.owners': 'Tompon-trano',
  'admin.stats.users.students': 'Mpianatra',

  // Admin — listings page
  'admin.listings.title': 'Trano rehetra',
  'admin.listings.lead':
    'Sata rehetra. Sivano, tadiavo amin\'ny lohateny na tompon-trano, ary fehezo.',
  'admin.listings.search.label': 'Karoka',
  'admin.listings.search.placeholder': 'Lohateny, anarana na mailaky ny tompon-trano',
  'admin.listings.filter.status': 'Sata',
  'admin.listings.filter.status.all': 'Sata rehetra',
  'admin.listings.empty.filtered':
    'Tsy misy trano mifanaraka amin\'ireo fepetra.',
  'admin.listings.empty.lead': 'Ovay ireo sivana na avadiho.',
  'admin.listings.empty.all': 'Mbola tsy misy trano mihitsy.',
  'admin.listings.viewPublic': 'Hijery ho an\'ny besinimaro',
  'admin.listings.viewOwner': 'Hanovan\'ny tompon-trano',
  'admin.listings.reportBadge.one': 'Fitarainana {count}',
  'admin.listings.reportBadge.other': 'Fitarainana {count}',
  'admin.listings.next': 'Manaraka →',
  'admin.listings.backToStart': '← Hiverina any am-piandohana',

  // Admin — suspend dialog
  'admin.suspend.cta': 'Atoatoy',
  'admin.suspend.dialog.title': 'Atoatoy ny trano',
  'admin.suspend.dialog.lead':
    'Atoatoy "{title}" — tsy ho hita ampahibemaso intsony ny trano ary mahazo mailaka misy ny antony ny tompon-trano.',
  'admin.suspend.reason.label': 'Antony (hita amin\'ny tompon-trano)',
  'admin.suspend.reason.placeholder':
    'Ohatra: Tsy mifanaraka ny sary, vidiny diso mibaribary, votoaty saro-pady…',
  'admin.suspend.cancel': 'Hanafoana',
  'admin.suspend.confirm': 'Hamafiso ny fanatoanana',
  'admin.suspend.submitting': 'Manatoatoa…',
  'admin.suspend.error.tooShort': 'Tsy maintsy 5 marika farafahakeliny ny antony.',
  'admin.suspend.toast.success': 'Voatoatoa ny trano.',
  'admin.suspend.toast.error': 'Tsy afaka manatoatoa izao.',

  // Reports — public form
  'report.cta': 'Mitaraina',
  'report.dialog.title': 'Mitaraina momba ity trano ity',
  'report.dialog.lead':
    'Tsy fantatra ny manao ny fitarainana, alefa amin\'ny mpitantana. Misafidiana ny antony akaiky indrindra.',
  'report.reason.label': 'Antony',
  'report.reason.placeholder': 'Misafidiana antony',
  'report.reason.SCAM': 'Hosoka ahiahiana',
  'report.reason.STOLEN_PHOTOS': 'Sary nangalarina / sandoka',
  'report.reason.WRONG_INFO': 'Mombamomba diso',
  'report.reason.INAPPROPRIATE': 'Votoaty tsy mety',
  'report.reason.ALREADY_RENTED': 'Efa nofaina / tsy malalaka',
  'report.reason.OTHER': 'Antony hafa',
  'report.details.label': 'Antsipiriany (tsy voatery)',
  'report.details.placeholder': 'Manampia mombamomba raha ilaina (1000 marika farabetsany)',
  'report.cancel': 'Hanafoana',
  'report.submit': 'Alefaso ny fitarainana',
  'report.submitting': 'Mandefa…',
  'report.toast.success': 'Misaotra, voasoratra ny fitarainanao.',
  'report.toast.error': 'Tsy afaka mandefa fitarainana izao.',

  // Reports — admin
  'admin.reports.title': 'Fitarainana',
  'admin.reports.lead':
    'Filaharana fanaraha-maso. Atao laharam-pahamehana ny fitarainana misokatra, soraty hoe vita na lavina.',
  'admin.reports.empty.title': 'Mbola tsy misy fitarainana.',
  'admin.reports.empty.lead': 'Vaovao mahafaly — tsy misy tokony fehezina.',
  'admin.reports.status.OPEN': 'Misokatra',
  'admin.reports.status.IN_REVIEW': 'Mandeha',
  'admin.reports.status.RESOLVED': 'Vita',
  'admin.reports.status.DISMISSED': 'Nolavina',
  'admin.reports.filter.status': 'Sata',
  'admin.reports.filter.all': 'Rehetra',
  'admin.reports.action.resolve': 'Soraty hoe vita',
  'admin.reports.action.dismiss': 'Lavina',
  'admin.reports.toast.resolved': 'Vita ny fitarainana.',
  'admin.reports.toast.dismissed': 'Nolavina ny fitarainana.',
  'admin.reports.toast.error': 'Tsy afaka manavao ny fitarainana.',
  'admin.reports.viewListing': 'Hijery ny trano',
  'admin.reports.reportedBy': 'Notoloran\'i',
  'admin.reports.anonymous': 'Tsy fantatra',
  'admin.reports.details': 'Antsipiriany',
  'admin.reports.adminNote': 'Naoty ny mpitantana',

  // Reports — admin dialog
  'admin.reports.dialog.openCta': 'Fehezo',
  'admin.reports.dialog.title': 'Mamehy ny fitarainana',
  'admin.reports.dialog.lead':
    'Misafidiana ny safidinao ary hazavao amin\'ny fehezanteny iray. Voasoratra ho an\'ny mpitaraina (raha tafiditra) sy hita amin\'ny tompon-trano io naoty io.',
  'admin.reports.dialog.decision.label': 'Safidy',
  'admin.reports.dialog.note.label': 'Fanazavana (hita amin\'ny mpitaraina + tompon-trano)',
  'admin.reports.dialog.note.placeholder':
    'Ohatra: "Naatoatoana ny trano, marina fa nangalarina ny sary." NA "Tsy nahita zavatra ahiahy, lavina."',
  'admin.reports.dialog.note.hint':
    'Farafahakeliny 5, farabetsany 500 marika. Tsy misy fiverenana andalana na PII momba ny mpitaraina.',
  'admin.reports.dialog.note.tooShort': 'Tsy maintsy 5 marika farafahakeliny ny fanazavana.',
  'admin.reports.dialog.cancel': 'Hanafoana',
  'admin.reports.dialog.submit': 'Hamafiso',
  'admin.reports.dialog.submitting': 'Mitahiry…',

  // Owner moderation section
  'dashboard.listings.reportBadge.one': 'Fitarainana {count}',
  'dashboard.listings.reportBadge.other': 'Fitarainana {count}',
  'dashboard.editListing.section.moderation.title': 'Fanaraha-maso',
  'dashboard.editListing.section.moderation.lead':
    'Tantaran\'ny fitarainana momba ity trano ity. Ny naotin\'ny mpitantana no manazava ny safidy tsirairay.',
  'dashboard.editListing.moderation.empty':
    'Tsy misy fitarainana mihitsy. Tohizo izao.',
  'dashboard.editListing.moderation.byVisitor': 'Fitarainana avy amin\'ny mpitsidika',

  // Reporter submit toast
  'report.toast.signedInTransparent':
    'Misaotra. Halefa mailaka ho anao rehefa nofehezin\'ny mpitantana ny fitarainanao.',

  // 2FA — section + setup + disable
  'settings.section.twofa.title': 'Fanamarinana faharoa',
  'settings.section.twofa.lead':
    'Manampia sosona filaminana iray amin\'ny kaody 6 marika avy amin\'ny rindranasa (Google Authenticator, Authy, 1Password, sns.).',
  'twofa.idle.disabled.title': 'Tsy mihodina ny 2FA',
  'twofa.idle.disabled.lead':
    'Soso-kevitra indrindra ho an\'ny mpitantana sy ny tompon-trano.',
  'twofa.idle.disabled.enableCta': 'Ampihodino ny 2FA',
  'twofa.idle.enabled.title': '2FA mihodina',
  'twofa.idle.enabled.codesLeft':
    'Kaody famerenana {count} sisa amin\'ny 10. Mamoròna vaovao raha tsy maro intsony.',
  'twofa.idle.enabled.disableCta': 'Atsaharo',
  'twofa.setup.title': 'Dingana 1 — Diniho ny QR',
  'twofa.setup.lead':
    'Sokafy ny rindranasa fanamarinana, scaner-o ity QR ity, ary ampidiro ny kaody 6 marika.',
  'twofa.setup.qrAlt': 'QR ho diniho amin\'ny rindranasa 2FA-nao',
  'twofa.setup.cantScan': 'Tsy afaka manao scan ? Soraty manaraka ity kaody ity :',
  'twofa.setup.afterScan': 'Mamorona kaody vaovao isaky ny 30 segondra ny rindranasa.',
  'twofa.setup.code.label': 'Kaody 6 marika avy amin\'ny rindranasa',
  'twofa.setup.submit': 'Hamarino sy ampihodino',
  'twofa.setup.submitting': 'Manamarina…',
  'twofa.cancel': 'Hanafoana',
  'twofa.recovery.title': 'Kaody famerenana — soraty izao',
  'twofa.recovery.lead':
    'Raha very ny finday, afaka miditra indray indray monja amin\'izy ireo. Tehirizo amin\'ny toerana azo antoka (password manager, taratasy). Tsy ho hitanao intsony.',
  'twofa.recovery.confirm': 'Voasoratro amin\'ny toerana azo antoka ireo kaody ireo.',
  'twofa.recovery.done': 'Vita, voatahiry',
  'twofa.disable.title': 'Atsaharo ny 2FA',
  'twofa.disable.lead':
    'Hamafiso amin\'ny kaody avy amin\'ny rindranasa NA kaody famerenana.',
  'twofa.disable.code.label': 'Kaody 2FA na kaody famerenana',
  'twofa.disable.submit': 'Atsaharo',
  'twofa.disable.submitting': 'Atsahatra…',
  'twofa.toast.enabled': 'Mihodina ny 2FA. Tehirizo ny kaody famerenana.',
  'twofa.toast.disabled': 'Voatsahatra ny 2FA.',

  // Owner verified badge (T-040)
  'owner.badge.verified.label': 'Tompo voamarina',
  'owner.badge.verified.tooltip': 'Nohamarinin’ny AryTrano ny maha-tompony.',

  // Admin · CIN review queue (T-039)
  'admin.cin.title': 'Fanamarinana maha-olona',
  'admin.cin.lead':
    'Tompon-trano miandry fanamarinana CIN. Manamarina dia mamoaka ny marika « Tompo voamarina » amin’ireo filazana.',
  'admin.cin.empty.title': 'Tsy misy CIN tokony jerena.',
  'admin.cin.empty.lead': 'Foana ny filaharana — vita ny rehetra.',
  'admin.cin.submittedAt': 'Nalefa tamin’ny {date}',
  'admin.cin.openImage': 'Jereo ny sary',
  'admin.cin.openPdf': 'Jereo ny PDF',
  'admin.cin.approve.cta': 'Hamarino',
  'admin.cin.approve.toast.ok': 'Voamarina ny maha-olona.',
  'admin.cin.approve.toast.error': 'Tsy nahomby ny fanamarinana.',
  'admin.cin.reject.cta': 'Lavina',
  'admin.cin.reject.confirm': 'Hamafiso ny fandavana',
  'admin.cin.reject.cancel': 'Hanafoana',
  'admin.cin.reject.reasonPlaceholder':
    'Antony hojeren’ny tompony (ohatra : sary tsy mazava, tsy ampy lafiny, lasa daty…)',
  'admin.cin.reject.reasonAria': 'Antony nandavana',
  'admin.cin.reject.reasonHint': 'Eo amin’ny 5 ka hatramin’ny 500 litera. Hiseho amin’ny tompony.',
  'admin.cin.reject.tooShort': 'Antony fohy loatra (5 litera farafahakeliny).',
  'admin.cin.reject.toast.ok': 'Voarakitra ny fandavana, voafampahafantatra ny tompony.',
  'admin.cin.reject.toast.error': 'Tsy nahomby ny fandavana.',
  'admin.cin.legal.notice':
    'Voarakitra (admin id + daty) isaky ny manokatra CIN ho an’ny fanara-maso. Tsy azo entina mihitsy ny tahirin-kevitra eo ivelan’ity sehatra ity.',
  'admin.nav.cinQueue': 'Fanamarinana CIN',

  // Owner CIN verification (T-038/T-039)
  'verifyOwner.title': 'Fanamarinana ny maha-ianao',
  'verifyOwner.lead':
    'Andefaso sary mazava na PDF an’ny CIN-nao. Manamarina ny mpitantana, ary hihoma-batsy ny marika « Tompo voamarina » amin’ireo filazanao.',
  'verifyOwner.status.none':
    'Mbola tsy nandefa ny CIN-nao ianao.',
  'verifyOwner.status.pending.title': 'CIN miandry fanamarinana',
  'verifyOwner.status.pending.lead':
    'Hojeren’ny mpitantana izany ato anatin’ny andro vitsivitsy. Holazaina aminao amin’ny mailaka.',
  'verifyOwner.status.verified.title': 'Voamarina ny maha-ianao',
  'verifyOwner.status.verified.lead':
    'Voamarina ny maha-ianao. Hiseho amin’ireo filazanao ny marika « Tompo voamarina ».',
  'verifyOwner.status.rejected.title': 'Tsy ekena ny fanamarinana',
  'verifyOwner.status.rejected.lead':
    'Afaka mandefa sary na PDF vaovao ianao araka ny torohevitra.',
  'verifyOwner.upload.placeholder': 'Tsindrio hisafidianana rakitra',
  'verifyOwner.upload.hint':
    'JPG, PNG, WebP, HEIC na PDF. 5 Mo no farany. Voafonosina alohan’ny fitehirizana ny tahirin-kevitra.',
  'verifyOwner.upload.submit': 'Alefa hijerena',
  'verifyOwner.upload.resubmit': 'Andefasana indray ny tahirin-kevitra',
  'verifyOwner.upload.submitting': 'Mandefa…',
  'verifyOwner.legal.notice':
    'Voafonosina (AES-256-GCM) ny tahirin-kevitra ary ny ekipa moderasiona ihany no afaka mijery. Afaka mangataka ny famafana izy io amin’ny alalan’ny support. Maharitra 6 volana taorian’ny fanamarinana ny fitehirizana.',
}

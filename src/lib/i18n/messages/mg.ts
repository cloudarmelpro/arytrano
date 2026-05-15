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
  'common.loading': 'Miandry…',
  'common.back': 'Hiverina',
  'common.close': 'Hidio',
  'common.next': 'Manaraka',
  'common.previous': 'Teo aloha',

  // A11y
  'a11y.skipToContent': 'Mankanesa amin\'ny votoatiny',

  // Header / nav
  'header.nav.listings': 'Trano hofaina',
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

  // Home page
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
  'sidebar.myListings': 'Ny tranoko',
  'sidebar.profile': 'Mombamomba',
  'sidebar.security': 'Filaminana',
  'sidebar.signOut': 'Hivoaka',

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
    'Vao avy nalefa rohy majika amin\'ny adiresinao. Tsindrio anatin\'ny ora iray hampiasanao ny kaontinao.',
  'verifyEmail.signInLink': 'Mankanesa amin\'ny fidirana',
  'verifyEmail.changeEmail': 'Hanova adiresy mailaka',

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
  'admin.nav.overview': 'Topi-maso ankapobeny',
  'admin.nav.listings': 'Trano hofaina',
  'admin.nav.reports': 'Fitarainana',
  'admin.headerLink': 'Admin',

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
}

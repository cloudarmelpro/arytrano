/**
 * French (Madagascar) — DEFAULT locale.
 *
 * Add new keys here FIRST. The Malagasy file `mg.ts` is typed off this one
 * so missing keys there are caught at compile time. Use short stable keys
 * grouped by surface: `header.*`, `annonces.*`, `detail.*`, `footer.*`, etc.
 */
export const frMG = {
  // Common / shared
  'common.appName': 'AryTrano',
  'common.loading': 'Chargement…',
  'common.back': 'Retour',
  'common.close': 'Fermer',
  'common.next': 'Suivant',
  'common.previous': 'Précédent',

  // A11y
  'a11y.skipToContent': 'Aller au contenu principal',

  // Header / nav
  'header.nav.listings': 'Annonces',
  'header.signIn': 'Se connecter',
  'header.signOut': 'Déconnexion',
  'header.dashboard': 'Mon espace',
  'header.avatarMenu.aria': 'Menu utilisateur',
  'header.avatarMenu.dashboard': 'Mon espace',
  'header.avatarMenu.myListings': 'Mes annonces',
  'header.avatarMenu.favorites': 'Mes favoris',
  'header.avatarMenu.profile': 'Profil & paramètres',
  'header.avatarMenu.adminConsole': 'Console admin',
  'header.avatarMenu.section.account': 'Compte',
  'header.avatarMenu.section.admin': 'Admin',
  'header.avatarMenu.signOut': 'Déconnexion',

  // Listing types
  'listing.type.ROOM': 'Chambre',
  'listing.type.STUDIO': 'Studio',
  'listing.type.APARTMENT': 'Appartement',
  'listing.type.HOUSE': 'Maison',

  // /annonces — public list
  'annonces.title': 'Annonces à Fianarantsoa',
  'annonces.lead':
    'Chambres, studios et appartements pour étudiants. Annonces postées par les propriétaires — contact direct, pas de commission.',
  'annonces.metaDescription':
    "Trouvez votre logement étudiant à Fianarantsoa : chambres, studios, appartements meublés. Contact direct avec le propriétaire, pas d'intermédiaire.",
  'annonces.count.one': '{count} annonce',
  'annonces.count.other': '{count} annonces',
  'annonces.count.hasMore': '(plus disponibles)',
  'annonces.empty.title': "Aucune annonce pour l'instant à Fianarantsoa.",
  'annonces.empty.lead': 'On en publie chaque semaine — reviens bientôt.',
  'annonces.empty.filtered.title': 'Aucune annonce ne correspond à ces filtres.',
  'annonces.empty.filtered.lead':
    'Essaie d’élargir tes critères ou de réinitialiser les filtres.',
  'annonces.pagination.next': 'Annonces suivantes →',
  'annonces.pagination.backToStart': '← Retour au début de la liste',

  // Filters
  'filters.type.label': 'Type',
  'filters.type.all': 'Tous les types',
  'filters.neighborhood.label': 'Quartier',
  'filters.neighborhood.all': 'Tous les quartiers',
  'filters.neighborhood.search': 'Tape un quartier…',
  'filters.neighborhood.empty': 'Aucun quartier trouvé',
  'filters.neighborhood.clear': 'Effacer',
  'filters.priceMin.label': 'Prix min (Ar)',
  'filters.priceMin.placeholder': 'Min',
  'filters.priceMax.label': 'Prix max (Ar)',
  'filters.priceMax.placeholder': 'Max',
  'filters.price.label': 'Budget mensuel (Ar)',
  'filters.price.separator': '→',
  'filters.price.hint': 'Entrée pour appliquer',
  'filters.reset': 'Réinitialiser',
  'filters.sidebar.title': 'Filtres',
  'toolbar.search.label': 'Recherche :',
  'filters.amenities.label': 'Ce que propose ce logement',

  // Sort
  'sort.label': 'Trier :',
  'sort.byLabel': 'Trier par :',
  'sort.newest': 'Nouveautés',
  'sort.newest.short': 'Récents',
  'sort.priceAsc': 'Prix croissant',
  'sort.priceAsc.short': 'Prix ↑',
  'sort.priceDesc': 'Prix décroissant',
  'sort.priceDesc.short': 'Prix ↓',

  // Card
  'card.perMonth': '/ mois',
  'card.noPhoto': 'Pas de photo',

  // Detail page
  'detail.breadcrumb.listings': 'Annonces',
  'detail.breadcrumb.aria': 'Fil d\'Ariane',
  'detail.section.description': 'Description',
  'detail.section.location': 'Localisation',
  'detail.section.amenities': 'Ce que propose ce logement',
  'detail.location.mapPlaceholder': 'Carte interactive bientôt',
  'detail.location.mapAria': 'Carte de {neighborhood}, {city}',
  'detail.location.privacyHint': 'Localisation approximative (200 m) — le propriétaire partage l\'adresse exacte au moment du contact.',

  // Amenities catalog (keep in sync with prisma Amenity enum + features/listings/amenities.tsx)
  'amenity.WIFI': 'WiFi inclus',
  'amenity.PARKING': 'Parking voiture',
  'amenity.MOTO_PARKING': 'Parking moto / vélo',
  'amenity.HOT_WATER': 'Eau chaude',
  'amenity.WATER_TANK': 'Citerne / réserve d\'eau',
  'amenity.GENERATOR': 'Groupe électrogène',
  'amenity.AIR_CONDITIONING': 'Climatisation',
  'amenity.KITCHEN_EQUIPPED': 'Cuisine équipée',
  'amenity.WASHING_MACHINE': 'Machine à laver',
  'amenity.GUARD': 'Gardiennage 24/7',
  'amenity.SECURITY_GATE': 'Portail fermé / clôture',
  'amenity.TERRACE': 'Terrasse / balcon',
  'amenity.GARDEN': 'Jardin',
  'amenity.STUDY_DESK': 'Bureau / coin étude',
  'amenity.CLOSE_TO_UNIVERSITY': 'Proche université',
  'amenity.CLOSE_TO_MARKET': 'Proche marché',
  'amenity.PUBLIC_TRANSPORT': 'Transport en commun proche',

  // Reviews
  'reviews.section.title': 'Avis',
  'reviews.section.empty': 'Aucun avis pour le moment. Sois la première personne à donner ton retour.',
  'reviews.countOne': '{count} avis',
  'reviews.countOther': '{count} avis',
  'reviews.ownerResponse': 'Réponse du propriétaire',
  'reviews.ownerResponse.badge': 'Propriétaire',
  'reviews.toast.submitted': 'Merci pour ton avis !',
  'reviews.toast.error': 'Impossible de publier l\'avis pour le moment.',
  'reviews.form.title': 'Laisse ton avis',
  'reviews.form.lead': 'Aide les futurs étudiants à se faire une idée du logement.',
  'reviews.form.rating.label': 'Ta note',
  'reviews.form.rating.aria': 'Note (1 à 5 étoiles)',
  'reviews.form.body.label': 'Ton commentaire',
  'reviews.form.body.placeholder': 'Qu\'est-ce qui t\'a plu ? Qu\'est-ce qui pourrait être amélioré ?',
  'reviews.form.body.hint': '20 caractères minimum, 2000 maximum.',
  'reviews.form.submit': 'Publier l\'avis',
  'reviews.form.submitting': 'Publication…',
  'reviews.form.thanksTitle': 'Avis publié',
  'reviews.form.thanksLead': 'Merci d\'avoir partagé ton expérience.',
  'reviews.form.gateOwner': 'Tu ne peux pas évaluer ta propre annonce.',
  'reviews.form.gateAlreadyReviewed': 'Tu as déjà publié un avis sur cette annonce.',
  'reviews.form.gateSignedOut': 'Connecte-toi pour laisser un avis sur ce logement.',
  'reviews.ownerResponse.cta': 'Répondre publiquement',
  'reviews.ownerResponse.label': 'Ta réponse',
  'reviews.ownerResponse.placeholder': 'Merci pour ton retour. …',
  'reviews.ownerResponse.hint': '10 caractères minimum, 1000 maximum. Visible publiquement sur la page de l\'annonce.',
  'reviews.ownerResponse.submit': 'Publier la réponse',
  'reviews.ownerResponse.submitting': 'Publication…',
  'reviews.ownerResponse.toast.saved': 'Réponse publiée',
  'reviews.ownerResponse.toast.updated': 'Réponse mise à jour',
  'reviews.ownerResponse.toast.deleted': 'Réponse supprimée',
  'reviews.ownerResponse.toast.deleteError': 'Impossible de supprimer la réponse.',
  'reviews.ownerResponse.toast.error': 'Impossible de publier la réponse.',
  'reviews.ownerResponse.edit': 'Modifier la réponse',
  'reviews.ownerResponse.delete': 'Supprimer la réponse',
  'reviews.ownerResponse.deleteConfirm.title': 'Supprimer cette réponse ?',
  'reviews.ownerResponse.deleteConfirm.lead': 'L\'avis de la personne reste publié. Tu pourras répondre à nouveau plus tard.',
  'commentActions.menuAria': 'Options du commentaire',
  'commentActions.edit': 'Modifier',
  'commentActions.delete': 'Supprimer',

  // Review reactions
  'reviews.reactions.like.label': 'J\'aime',
  'reviews.reactions.like.add': 'Aimer cet avis',
  'reviews.reactions.like.remove': 'Retirer mon « J\'aime »',
  'reviews.reactions.dislike.label': 'J\'aime pas',
  'reviews.reactions.dislike.add': 'Ne pas aimer cet avis',
  'reviews.reactions.dislike.remove': 'Retirer mon « J\'aime pas »',
  'reviews.reactions.error': 'Action impossible. Réessaie.',
  'reviews.authorActions.youBadge': 'Toi',
  'reviews.verifiedStay.label': 'Séjour confirmé',
  'reviews.verifiedStay.tooltip': 'L’auteur a contacté le propriétaire via AryTrano avant d’écrire cet avis.',
  'listing.badge.verified.label': 'Annonce vérifiée',
  'listing.badge.verified.tooltip': 'L’équipe AryTrano a confirmé cette annonce.',
  'admin.listings.verify.cta': 'Vérifier',
  'admin.listings.unverify.cta': 'Retirer la vérif',
  'admin.listings.verify.toast.verified': 'Annonce vérifiée.',
  'admin.listings.verify.toast.unverified': 'Vérification retirée.',
  'admin.listings.verify.toast.error': 'Impossible de mettre à jour la vérification.',
  'reviews.authorActions.edit': 'Modifier',
  'reviews.authorActions.delete': 'Supprimer',
  'reviews.authorActions.save': 'Enregistrer',
  'reviews.authorActions.saving': 'Enregistrement…',
  'reviews.authorActions.cancel': 'Annuler',
  'reviews.authorActions.confirmDelete': 'Supprimer',
  'reviews.authorActions.deleting': 'Suppression…',
  'reviews.authorActions.deleteConfirm.title': 'Supprimer cet avis ?',
  'reviews.authorActions.deleteConfirm.lead': 'Cette action est définitive. Ton avis ne sera plus visible publiquement.',
  'reviews.authorActions.toast.updated': 'Avis mis à jour',
  'reviews.authorActions.toast.updateError': 'Impossible de mettre à jour l\'avis.',
  'reviews.authorActions.toast.deleted': 'Avis supprimé',
  'reviews.authorActions.toast.deleteError': 'Impossible de supprimer l\'avis.',

  // Listing form (amenity picker)
  'listingForm.amenities.label': 'Équipements et services',
  'listingForm.amenities.hint': 'Coche tout ce qui est inclus dans le logement.',
  'listingForm.customAmenities.label': 'Équipements personnalisés',
  'listingForm.customAmenities.hint': 'Quelque chose qui ne figure pas dans la liste ? Ajoute-le ici (max 10).',
  'listingForm.customAmenities.placeholder': 'Ex : Vue sur la montagne, four à pain…',
  'listingForm.customAmenities.add': 'Ajouter',
  'listingForm.customAmenities.remove': 'Retirer {label}',
  'listingForm.customAmenities.counter': '{count} / {max} équipement(s)',
  'listingForm.customAmenities.limitReached': 'Limite atteinte (10).',
  'listingForm.customAmenities.listAria': 'Équipements personnalisés ajoutés',
  'detail.feature.surface': 'Surface',
  'detail.feature.bedrooms': 'Chambres',
  'detail.feature.bathrooms': 'Salles de bain',
  'detail.feature.furnished': 'Meublé',
  'detail.feature.yes': 'Oui',
  'detail.feature.no': 'Non',
  'detail.price.monthly': 'Loyer mensuel',
  'detail.price.perMonth': 'par mois',
  'detail.owner.title': 'Propriétaire',
  'detail.owner.hostedBy': 'Annonce de {name}',
  'detail.report.cta': 'Cette annonce vous semble suspecte ?',
  'detail.notFound': 'Annonce introuvable',
  'detail.photoCounter': '{current} / {total}',
  'detail.photoCount.alt': 'Voir la photo {n} en grand',

  // Contact
  'contact.whatsapp': 'WhatsApp',
  'contact.call': 'Appeler',
  'contact.aria.whatsapp': 'Contacter le propriétaire par WhatsApp',
  'contact.aria.call': 'Appeler le propriétaire',
  'contact.hint':
    "Le numéro reste masqué jusqu'au clic. Ton clic est enregistré pour le propriétaire — pas d'adresse IP brute stockée.",
  'contact.noPhone': "Le propriétaire n'a pas encore renseigné son numéro.",
  'contact.error.generic': 'Impossible de récupérer le contact pour le moment.',

  // Photo gallery
  'gallery.label': 'Galerie de photos',
  'gallery.open': 'Voir la photo {n} en grand',
  'gallery.prev': 'Photo précédente',
  'gallery.next': 'Photo suivante',
  'gallery.close': 'Fermer la galerie',
  'gallery.showAll': 'Voir les {n} photos',

  // Share
  'share.label': 'Partager',
  'share.aria': 'Partager cette annonce',
  'share.copied': 'Lien copié dans le presse-papier',
  'share.failed': 'Impossible de partager. Réessaie.',

  // Related listings
  'detail.related.title': 'Annonces similaires',
  'detail.related.lead': 'Autres logements dans le même quartier',

  // Auth error page
  'authError.title.default': 'Une erreur est survenue',
  'authError.title.configuration': 'Erreur de configuration',
  'authError.title.accessDenied': 'Accès refusé',
  'authError.title.verification': 'Lien invalide ou expiré',
  'authError.title.credentialsSignin': 'Identifiants incorrects',
  'authError.title.oauthAccountNotLinked': 'Compte non lié',
  'authError.back.signIn': 'Retour à la connexion',
  'authError.back.home': 'Accueil',

  // Locale switcher
  'locale.switcher.aria': 'Choisir la langue',
  'locale.switcher.fr-MG.aria': 'Passer en français',
  'locale.switcher.mg.aria': 'Mividy amin\'ny teny malagasy',

  // Home page
  'home.metaTitle': 'Logement étudiant à Madagascar',
  'home.metaDescription':
    'Trouve ta chambre ou ton appartement à Fianarantsoa. Propriétaires vérifiés, prix en Ariary, contact WhatsApp direct.',
  'home.eyebrow':
    'Fianarantsoa — bientôt Antananarivo, Toamasina, Mahajanga, Toliara',
  'home.heroTitle': 'Trouve ton logement étudiant à Madagascar, en toute confiance.',
  'home.heroLead':
    'AryTrano connecte les étudiants avec des propriétaires vérifiés. Photos honnêtes, prix clairs, contact direct par WhatsApp ou téléphone.',
  'home.cta.dashboard': 'Mon tableau de bord',
  'home.cta.signUp': 'Créer un compte',
  'home.cta.signIn': 'Se connecter',
  'home.feature.verified.title': 'Propriétaires vérifiés',
  'home.feature.verified.body':
    'Identité contrôlée, annonces modérées. Tu sais à qui tu parles.',
  'home.feature.price.title': 'Prix en Ariary',
  'home.feature.price.body':
    'Affichés clairement par mois, sans frais cachés. Pas de mauvaise surprise.',
  'home.feature.contact.title': 'Contact direct',
  'home.feature.contact.body':
    'WhatsApp ou téléphone en un clic. Pas de messagerie qui ralentit.',

  // User roles
  'role.STUDENT': 'Étudiant',
  'role.OWNER': 'Propriétaire',
  'role.ADMIN': 'Administrateur',

  // Listing statuses
  'status.DRAFT': 'Brouillon',
  'status.PUBLISHED': 'Publiée',
  'status.UNAVAILABLE': 'Indisponible',
  'status.SUSPENDED': 'Suspendue',
  'status.DELETED': 'Supprimée',

  // Account sidebar
  'sidebar.myAccount': 'Mon compte',
  'sidebar.section.listings': 'Annonces',
  'sidebar.section.discover': 'Découverte',
  'sidebar.section.account': 'Compte',
  'sidebar.favorites': 'Favoris',

  // Favorites
  'favorites.add': 'Ajouter aux favoris',
  'favorites.remove': 'Retirer des favoris',
  'favorites.save': 'Sauvegarder',
  'favorites.saved': 'Sauvegardé',
  'favorites.error': 'Action impossible. Réessaie.',
  'favorites.page.metaTitle': 'Mes favoris',
  'favorites.page.title': 'Mes favoris',
  'favorites.page.lead': 'Les annonces que tu as sauvegardées.',
  'favorites.page.empty.title': 'Pas encore de favoris',
  'favorites.page.empty.lead': 'Clique sur le cœur d\'une annonce pour la retrouver ici.',
  'favorites.page.empty.cta': 'Parcourir les annonces',
  'favorites.page.next': 'Page suivante',
  'favorites.page.pagination': 'Pagination des favoris',
  'sidebar.myListings': 'Mes annonces',
  'sidebar.verifyOwner': 'Vérification d’identité',
  'sidebar.profile': 'Profil',
  'sidebar.security': 'Sécurité',
  'sidebar.signOut': 'Déconnexion',

  // Dashboard pages — listings index (owner)
  'dashboard.listings.title': 'Mes annonces',
  'dashboard.listings.count.one': '{count} annonce',
  'dashboard.listings.count.other': '{count} annonces',
  'dashboard.listings.leadSuffix': '· brouillons, publiées, indisponibles.',
  'dashboard.listings.newListing': 'Nouvelle annonce',
  'dashboard.listings.create.cta': 'Créer une annonce',
  'dashboard.listings.empty.title': 'Aucune annonce pour l\'instant.',
  'dashboard.listings.empty.lead':
    'Crée ta première annonce — tu pourras la compléter et la publier ensuite.',
  'dashboard.listings.edit': 'Éditer',
  'dashboard.listings.noThumbnail': 'Pas encore de photo',
  'dashboard.listings.contactCount.one': '{count} contact',
  'dashboard.listings.contactCount.other': '{count} contacts',
  'dashboard.listings.photoCount.one': '{count} photo',
  'dashboard.listings.photoCount.other': '{count} photos',
  'dashboard.listings.publishedOn': 'Publiée le {date}',
  'dashboard.listings.createdOn': 'Créée le {date}',
  'dashboard.listings.perMonth': '/ mois',

  // Dashboard — new listing
  'dashboard.newListing.title': 'Nouvelle annonce',
  'dashboard.newListing.lead':
    'Crée le brouillon — tu pourras ajouter des photos et publier ensuite.',
  'dashboard.backToListings': '← Mes annonces',

  // Dashboard — edit listing
  'dashboard.editListing.section.photos.title': 'Photos',
  'dashboard.editListing.section.photos.lead':
    'Au moins 1 photo nécessaire pour publier. La 1ʳᵉ sert de vignette.',
  'dashboard.editListing.section.info.title': 'Informations',
  'dashboard.editListing.section.info.lead': 'Détails affichés sur la page publique.',
  'dashboard.editListing.section.status.title': 'Statut & publication',
  'dashboard.editListing.section.status.lead':
    'Publie quand tout est prêt. Tu peux marquer indisponible plus tard sans perdre l\'URL.',

  // Profile page
  'dashboard.profile.title': 'Profil public',
  'dashboard.profile.lead':
    'Ces informations apparaissent sur vos annonces. EXIF retiré, photos converties en WebP.',

  // Profile form
  'profileForm.avatar.title': 'Photo de profil',
  'profileForm.avatar.lead': 'JPG ou PNG · 2 Mo max · EXIF retiré.',
  'profileForm.avatar.change': 'Changer',
  'profileForm.avatar.uploading': 'Upload…',
  'profileForm.avatar.remove': 'Retirer',
  'profileForm.name.label': 'Nom affiché',
  'profileForm.name.placeholder': 'Andry Rakoto',
  'profileForm.email.label': 'Adresse email ou nom d\'utilisateur',
  'profileForm.phone.label': 'Téléphone WhatsApp',
  'profileForm.phone.placeholder': '+261 34 12 345 67',
  'profileForm.phone.hint': 'Masqué jusqu\'au clic — anti-scraping.',
  'profileForm.locale.label': 'Langue préférée',
  'profileForm.locale.placeholder': 'Choisir une langue',
  'profileForm.locale.fr-MG': 'Français (Madagascar)',
  'profileForm.locale.mg': 'Malagasy',
  'profileForm.cancel': 'Annuler',
  'profileForm.save': 'Enregistrer',
  'profileForm.saving': 'Enregistrement…',
  'profileForm.toast.saved': 'Profil mis à jour.',
  'profileForm.toast.avatarSaved': 'Photo mise à jour.',
  'profileForm.toast.avatarRemoved': 'Photo supprimée.',
  'profileForm.toast.avatarFailed': 'Échec de l\'upload.',
  'profileForm.toast.error': 'Une erreur est survenue.',

  // Listing form
  'listingForm.title.label': 'Titre',
  'listingForm.title.placeholder': 'Chambre étudiante calme à Andrainjato',
  'listingForm.description.label': 'Description',
  'listingForm.description.placeholder':
    'Lumineuse, calme, proche université. Wifi inclus...',
  'listingForm.description.hint': 'Min. 20 caractères, max. 2000.',
  'listingForm.type.label': 'Type de logement',
  'listingForm.type.placeholder': 'Choisir',
  'listingForm.price.label': 'Prix par mois (Ar)',
  'listingForm.city.label': 'Ville',
  'listingForm.city.placeholder': 'Choisir une ville',
  'listingForm.neighborhood.label': 'Quartier',
  'listingForm.neighborhood.placeholder': 'Choisir un quartier',
  'listingForm.neighborhood.pickCityFirst': 'Choisis une ville d\'abord',
  'listingForm.surface.label': 'Surface (m²)',
  'listingForm.bedrooms.label': 'Chambres',
  'listingForm.bathrooms.label': 'Salles de bains',
  'listingForm.furnished.label': 'Meublé',
  'listingForm.watermark.label': 'Ajouter un filigrane « AryTrano » sur les photos',
  'listingForm.watermark.hint': 'Un texte semi-transparent en bas-droite décourage la réutilisation des photos sur d’autres sites.',
  'listingForm.submit.create': 'Créer le brouillon',
  'listingForm.submit.update': 'Enregistrer les modifications',
  'listingForm.submit.saving': 'Enregistrement…',
  'listingForm.toast.saved': 'Annonce enregistrée.',

  // Listing actions (publish / toggle / delete)
  'listingActions.publish': 'Publier',
  'listingActions.publishing': 'Publication…',
  'listingActions.markUnavailable': 'Marquer indisponible',
  'listingActions.markAvailable': 'Remettre en ligne',
  'listingActions.updating': 'Mise à jour…',
  'listingActions.delete': 'Supprimer',
  'listingActions.deleting': 'Suppression…',
  'listingActions.confirm': 'Confirmer',
  'listingActions.cancel': 'Annuler',
  'listingActions.confirmHint': 'Tape',
  'listingActions.confirmWord': 'SUPPRIMER',
  'listingActions.toast.ok': 'OK',
  'listingActions.toast.error': 'Une erreur est survenue.',
  'listingActions.menuAria': 'Actions sur l’annonce',
  'listingActions.confirmInput.aria': 'Tape SUPPRIMER pour confirmer',

  // Photo manager
  'photoManager.counter': '{current} / {max} photos · glisser-déposer pour réordonner.',
  'photoManager.counterHint': 'La 1ʳᵉ photo sera la vignette.',
  'photoManager.add': 'Ajouter une photo',
  'photoManager.uploading': 'Upload…',
  'photoManager.empty': 'Pas encore de photo. Ajoutes-en au moins une pour publier l\'annonce.',
  'photoManager.thumbnail': 'Vignette',
  'photoManager.remove': 'Retirer',
  'photoManager.toast.added': 'Photo ajoutée.',
  'photoManager.toast.removed': 'Photo retirée.',
  'photoManager.toast.reordered': 'Ordre mis à jour.',
  'photoManager.toast.uploadFailed': 'Échec de l\'upload — réessaie.',
  'photoManager.toast.removeFailed': 'Suppression échouée.',
  'photoManager.toast.reorderFailed': 'Réordonnancement échoué.',
  'photoManager.toast.pickFile': 'Choisis une photo',

  // Dashboard — welcome (root /dashboard)
  'dashboard.welcome.title': 'Bienvenue {name}',
  'dashboard.welcome.titleNoName': 'Bienvenue',
  'dashboard.welcome.account.STUDENT': 'Compte étudiant.',
  'dashboard.welcome.account.OWNER': 'Compte propriétaire.',
  'dashboard.welcome.account.ADMIN': 'Compte administrateur.',
  'dashboard.stats.totalListings': 'Mes annonces',
  'dashboard.stats.publishedHint': '{count} publiée(s)',
  'dashboard.stats.favorites': 'Favoris',
  'dashboard.stats.favoritesHint': 'Annonces sauvegardées',
  'dashboard.stats.welcomeRole': 'Rôle',
  'dashboard.quickActions.title': 'Accès rapide',
  'dashboard.quickActions.go': 'Ouvrir',
  'dashboard.nav.listings.title': 'Mes annonces',
  'dashboard.nav.listings.lead': 'Créer, modifier, publier tes annonces.',
  'dashboard.nav.favorites.title': 'Mes favoris',
  'dashboard.nav.favorites.lead': 'Retrouve les annonces que tu as sauvegardées.',
  'dashboard.nav.profile.title': 'Profil',
  'dashboard.nav.profile.lead': 'Édite ton nom, téléphone, langue.',
  'dashboard.nav.settings.title': 'Paramètres',
  'dashboard.nav.settings.lead':
    'Mot de passe, connexions sociales, photo, suppression.',

  // Settings page
  'settings.metaTitle': 'Paramètres',
  'settings.title': 'Sécurité',
  'settings.oauthNotConfigured':
    'Aucun fournisseur OAuth configuré pour cette installation.',
  'settings.lead':
    'Gère tes méthodes de connexion, surveille les accès récents et supprime ton compte si besoin.',
  'settings.section.password.title': 'Mot de passe',
  'settings.section.password.lead': 'Modifie ton mot de passe ou ajoute-en un.',
  'settings.section.oauth.title': 'Connexions sociales',
  'settings.section.oauth.lead': 'Lie ou délie tes comptes Google / Facebook.',
  'settings.section.logins.title': 'Dernières connexions',
  'settings.section.logins.lead': 'Vérifie qu\'aucune session suspecte n\'apparaît.',
  'settings.section.danger.title': 'Zone dangereuse',
  'settings.section.danger.lead': 'Supprimer ton compte est irréversible.',

  // Password section
  'password.add.lead':
    'Tu n\'as pas encore de mot de passe. Ajoute-en un pour pouvoir te connecter sans Google.',
  'password.add.label': 'Nouveau mot de passe',
  'password.add.submit': 'Ajouter un mot de passe',
  'password.add.submitting': 'Enregistrement…',
  'password.change.current.label': 'Mot de passe actuel',
  'password.change.new.label': 'Nouveau mot de passe',
  'password.change.set': 'Mot de passe défini.',
  'password.change.edit': 'Modifier',
  'password.change.submit': 'Mettre à jour',
  'password.change.submitting': 'Mise à jour…',
  'password.cancel': 'Annuler',
  'password.toast.added': 'Mot de passe ajouté.',
  'password.toast.updated': 'Mot de passe modifié.',

  // OAuth connections section
  'oauth.linked': 'Lié',
  'oauth.unlinked': 'Non lié',
  'oauth.link': 'Lier',
  'oauth.unlink': 'Délier',
  'oauth.unlinkConfirm': 'Confirmer le déliement',
  'oauth.cannotUnlink': 'Tu ne peux pas délier ta dernière méthode de connexion.',

  // Login events section
  'loginEvents.empty': 'Aucune connexion enregistrée pour l\'instant.',
  'loginEvents.method.CREDENTIALS': 'Mot de passe',
  'loginEvents.method.GOOGLE': 'Google',
  'loginEvents.method.FACEBOOK': 'Facebook',
  'loginEvents.method.MAGIC_LINK': 'Lien magique',
  'loginEvents.method.MOBILE_API': 'App mobile',
  'loginEvents.mostRecent': 'Plus récent',
  'loginEvents.unknownLocation': 'Localisation inconnue',
  'loginEvents.unknownBrowser': 'Navigateur inconnu',

  // Delete account section
  'deleteAccount.lead':
    'Une fois supprimé, ton compte et tes annonces ne pourront pas être récupérés.',
  'deleteAccount.cta': 'Supprimer mon compte',
  'deleteAccount.warning.title': 'Cette action est irréversible.',
  'deleteAccount.warning.item.pii': 'Tes informations personnelles seront anonymisées',
  'deleteAccount.warning.item.listings': 'Tes annonces seront supprimées',
  'deleteAccount.warning.item.oauth': 'Tes connexions sociales seront déliées',
  'deleteAccount.warning.item.signOut': 'Tu seras déconnecté immédiatement',
  'deleteAccount.confirm.label': 'Tape',
  'deleteAccount.confirm.suffix': 'ci-dessous pour confirmer',
  'deleteAccount.submit': 'Confirmer la suppression',
  'deleteAccount.submitting': 'Suppression…',
  'deleteAccount.cancel': 'Annuler',
  'deleteAccount.toast.success': 'Compte supprimé.',

  // Auth — sign-in
  'signIn.title': 'Connexion',
  'signIn.noAccount': 'Pas encore de compte ?',
  'signIn.signUpLink': 'Créer un compte',
  'signIn.separator': 'Ou continuez avec votre email',
  'signIn.email.label': 'Adresse email ou nom d\'utilisateur',
  'signIn.email.placeholder': 'andry@etu.mg',
  'signIn.password.label': 'Mot de passe',
  'signIn.password.show': 'Afficher',
  'signIn.password.hide': 'Masquer',
  'signIn.forgot': 'Mot de passe oublié ?',
  'signIn.submit': 'Se connecter',
  'signIn.submitting': 'Connexion…',
  'signIn.twofa.title': 'Vérification en deux étapes',
  'signIn.twofa.lead': 'Entre le code à 6 chiffres de ton application d\'authentification — ou un code de récupération si tu n\'as pas accès au téléphone.',
  'signIn.twofa.code.label': 'Code',
  'signIn.twofa.code.hint': '6 chiffres (Google Authenticator, 1Password…) ou code de récupération XXXX-XXXX.',
  'signIn.twofa.submit': 'Vérifier',
  'signIn.twofa.submitting': 'Vérification…',
  'signIn.twofa.back': 'Retour',

  // Auth — sign-up
  'signUp.title': 'Créer un compte',
  'signUp.haveAccount': 'Déjà un compte ?',
  'signUp.signInLink': 'Se connecter',
  'signUp.separator': 'Ou continuez avec votre email',
  'signUp.roleSelector.ariaLabel': 'Type de compte',
  'signUp.role.STUDENT': 'Étudiant·e',
  'signUp.role.OWNER': 'Propriétaire',
  'signUp.name.label': 'Nom complet',
  'signUp.name.placeholder': 'Andry Rakoto',
  'signUp.email.label': 'Adresse email ou nom d\'utilisateur',
  'signUp.email.placeholder': 'andry@etu.mg',
  'signUp.password.label': 'Mot de passe',
  'signUp.password.show': 'Afficher',
  'signUp.password.hide': 'Masquer',
  'signUp.verifyBadge': 'Vérification email',
  'signUp.verifyHint':
    'Un lien d\'activation sera envoyé à votre adresse. Cliquez-le dans l\'heure.',
  'signUp.terms': 'En continuant, j\'accepte les Conditions et la Politique de confidentialité.',
  'signUp.submit': 'Créer mon compte',
  'signUp.submitting': 'Création…',

  // Auth — forgot password
  'forgot.title': 'Mot de passe oublié ?',
  'forgot.lead':
    'Renseignez l\'email de votre compte. On vous envoie un lien valable 1 heure pour le réinitialiser.',
  'forgot.email.label': 'Adresse email ou nom d\'utilisateur',
  'forgot.email.placeholder': 'andry@etu.mg',
  'forgot.email.hint': 'Limite : 3 envois par heure par adresse.',
  'forgot.submit': 'Envoyer le lien',
  'forgot.submitting': 'Envoi…',
  'forgot.backToSignIn': '← Retour à la connexion',
  'forgot.toast.sent': 'Si un compte existe pour cet email, un lien vient d\'être envoyé.',

  // Auth — reset password
  'reset.password.label': 'Nouveau mot de passe',
  'reset.confirm.label': 'Confirmer le mot de passe',
  'reset.confirm.mismatch': 'Les deux mots de passe ne correspondent pas.',
  'reset.submit': 'Mettre à jour le mot de passe',
  'reset.submitting': 'Mise à jour…',

  // Auth — verify email (post-magic-link send)
  'verifyEmail.title': 'Vérifiez votre boîte mail',
  'verifyEmail.lead':
    'On vient d\'envoyer un lien magique à votre adresse. Cliquez-le dans l\'heure pour activer votre compte.',
  'verifyEmail.signInLink': 'Aller à la connexion',
  'verifyEmail.changeEmail': 'Changer d\'adresse email',

  // Auth — error page details
  'authError.description.default': 'On n\'a pas pu finaliser ta connexion. Réessaie dans un instant.',
  'authError.description.configuration':
    'Le service de connexion n\'est temporairement pas joignable. Réessaie dans un instant — si le problème persiste, contacte-nous.',
  'authError.description.accessDenied':
    'Tu as annulé la connexion ou le fournisseur a refusé l\'accès. Réessaie ou utilise un autre mode de connexion.',
  'authError.description.verification':
    'Ce lien de connexion n\'est plus valide. Demande-en un nouveau depuis la page de connexion.',
  'authError.description.credentialsSignin':
    'Email ou mot de passe incorrect. Vérifie tes informations et réessaie.',
  'authError.description.oauthAccountNotLinked':
    'Cet email est déjà associé à un autre mode de connexion. Connecte-toi avec ta méthode habituelle, puis lie ce fournisseur depuis tes paramètres.',
  'authError.code': 'Code',

  // OAuth providers
  'oauthProvider.google': 'Continuer avec Google',
  'oauthProvider.facebook': 'Continuer avec Facebook',
  'oauthProvider.redirecting': 'Redirection…',

  // Admin console
  'admin.console': 'Console admin',
  'admin.section.dashboard': 'Tableau de bord',
  'admin.section.moderation': 'Modération',
  'admin.nav.overview': 'Vue d\'ensemble',
  'admin.nav.listings': 'Annonces',
  'admin.nav.reports': 'Signalements',
  'admin.headerLink': 'Admin',

  // Admin overview page
  'admin.overview.title': 'Vue d\'ensemble',
  'admin.overview.lead':
    'Modération AryTrano · annonces, signalements, utilisateurs. Tous les chiffres sont en temps réel.',
  'admin.overview.unauthorized.title': 'Accès réservé aux administrateurs',
  'admin.overview.unauthorized.lead':
    'Ton compte n\'a pas le rôle ADMIN. Si c\'est une erreur, contacte le support.',
  'admin.stats.listings.total': 'Total annonces',
  'admin.stats.listings.published': 'Publiées',
  'admin.stats.listings.draft': 'Brouillons',
  'admin.stats.listings.unavailable': 'Indisponibles',
  'admin.stats.listings.suspended': 'Suspendues',
  'admin.stats.listings.deleted': 'Supprimées',
  'admin.stats.reports.open': 'Signalements ouverts',
  'admin.stats.reports.lead':
    'À traiter en priorité. Clique pour voir la file.',
  'admin.stats.users.total': 'Utilisateurs',
  'admin.stats.users.owners': 'Propriétaires',
  'admin.stats.users.students': 'Étudiants',

  // Admin — listings page
  'admin.listings.title': 'Toutes les annonces',
  'admin.listings.lead':
    'Tous statuts confondus. Filtre, cherche par titre ou propriétaire, et modère.',
  'admin.listings.search.label': 'Recherche',
  'admin.listings.search.placeholder': 'Titre, nom ou email du propriétaire',
  'admin.listings.filter.status': 'Statut',
  'admin.listings.filter.status.all': 'Tous les statuts',
  'admin.listings.empty.filtered':
    'Aucune annonce ne correspond à ces critères.',
  'admin.listings.empty.lead': 'Modifie les filtres ou réinitialise.',
  'admin.listings.empty.all': 'Aucune annonce dans la plateforme pour l\'instant.',
  'admin.listings.viewPublic': 'Voir publique',
  'admin.listings.viewOwner': 'Édition propriétaire',
  'admin.listings.reportBadge.one': '{count} signalement',
  'admin.listings.reportBadge.other': '{count} signalements',
  'admin.listings.next': 'Suivants →',
  'admin.listings.backToStart': '← Retour au début',

  // Admin — suspend dialog
  'admin.suspend.cta': 'Suspendre',
  'admin.suspend.dialog.title': 'Suspendre l\'annonce',
  'admin.suspend.dialog.lead':
    'Suspendre "{title}" — l\'annonce devient invisible publiquement et le propriétaire reçoit un email avec la raison.',
  'admin.suspend.reason.label': 'Raison (visible par le propriétaire)',
  'admin.suspend.reason.placeholder':
    'Ex: Photos non conformes, prix manifestement faux, contenu sensible…',
  'admin.suspend.cancel': 'Annuler',
  'admin.suspend.confirm': 'Confirmer la suspension',
  'admin.suspend.submitting': 'Suspension…',
  'admin.suspend.error.tooShort': 'La raison doit faire au moins 5 caractères.',
  'admin.suspend.toast.success': 'Annonce suspendue.',
  'admin.suspend.toast.error': 'Impossible de suspendre pour le moment.',

  // Reports — public form (T-025)
  'report.cta': 'Signaler',
  'report.dialog.title': 'Signaler cette annonce',
  'report.dialog.lead':
    'Ton signalement est anonyme et envoyé à l\'équipe de modération. Choisis la raison la plus proche.',
  'report.reason.label': 'Raison',
  'report.reason.placeholder': 'Choisir une raison',
  'report.reason.SCAM': 'Arnaque suspectée',
  'report.reason.STOLEN_PHOTOS': 'Photos volées / fausses',
  'report.reason.WRONG_INFO': 'Informations inexactes',
  'report.reason.INAPPROPRIATE': 'Contenu inapproprié',
  'report.reason.ALREADY_RENTED': 'Déjà loué / non disponible',
  'report.reason.OTHER': 'Autre raison',
  'report.details.label': 'Détails (optionnel)',
  'report.details.placeholder': 'Ajoute du contexte si utile (1000 caractères max.)',
  'report.cancel': 'Annuler',
  'report.submit': 'Envoyer le signalement',
  'report.submitting': 'Envoi…',
  'report.toast.success': 'Merci, ton signalement a été enregistré.',
  'report.toast.error': 'Impossible d\'envoyer le signalement pour le moment.',

  // Reports — admin page
  'admin.reports.title': 'Signalements',
  'admin.reports.lead':
    'File de modération. Traite les signalements ouverts en priorité, marque comme résolus ou rejetés.',
  'admin.reports.empty.title': 'Aucun signalement pour l\'instant.',
  'admin.reports.empty.lead': 'Bonne nouvelle — rien à modérer.',
  'admin.reports.status.OPEN': 'Ouvert',
  'admin.reports.status.IN_REVIEW': 'En cours',
  'admin.reports.status.RESOLVED': 'Résolu',
  'admin.reports.status.DISMISSED': 'Rejeté',
  'admin.reports.filter.status': 'Statut',
  'admin.reports.filter.all': 'Tous',
  'admin.reports.action.resolve': 'Marquer résolu',
  'admin.reports.action.dismiss': 'Rejeter',
  'admin.reports.toast.resolved': 'Signalement résolu.',
  'admin.reports.toast.dismissed': 'Signalement rejeté.',
  'admin.reports.toast.error': 'Impossible de mettre à jour le signalement.',
  'admin.reports.viewListing': 'Voir l\'annonce',
  'admin.reports.reportedBy': 'Signalé par',
  'admin.reports.anonymous': 'Anonyme',
  'admin.reports.details': 'Détails',
  'admin.reports.adminNote': 'Note du modérateur',

  // Reports — admin dialog
  'admin.reports.dialog.openCta': 'Traiter',
  'admin.reports.dialog.title': 'Traiter le signalement',
  'admin.reports.dialog.lead':
    'Choisis ta décision et explique-la en une phrase. Cette note est envoyée au signaleur (si connecté) et visible par le propriétaire de l\'annonce.',
  'admin.reports.dialog.decision.label': 'Décision',
  'admin.reports.dialog.note.label': 'Explication (visible signaleur + propriétaire)',
  'admin.reports.dialog.note.placeholder':
    'Ex: "Annonce suspendue, photos en effet réutilisées d\'un autre site." OU "Pas d\'élément suspect, signalement rejeté."',
  'admin.reports.dialog.note.hint':
    'Min. 5 caractères, max. 500. Pas de retour à la ligne ni de PII du signaleur.',
  'admin.reports.dialog.note.tooShort': 'L\'explication doit faire au moins 5 caractères.',
  'admin.reports.dialog.cancel': 'Annuler',
  'admin.reports.dialog.submit': 'Confirmer',
  'admin.reports.dialog.submitting': 'Enregistrement…',

  // Owner moderation section
  'dashboard.listings.reportBadge.one': '{count} signalement',
  'dashboard.listings.reportBadge.other': '{count} signalements',
  'dashboard.editListing.section.moderation.title': 'Modération',
  'dashboard.editListing.section.moderation.lead':
    'Historique des signalements sur cette annonce. La note du modérateur explique chaque décision.',
  'dashboard.editListing.moderation.empty':
    'Aucun signalement sur cette annonce. Continue comme ça.',
  'dashboard.editListing.moderation.byVisitor': 'Signalement d\'un visiteur',

  // Reporter submit toast
  'report.toast.signedInTransparent':
    'Merci. On t\'envoie un email quand l\'équipe de modération a traité ton signalement.',

  // 2FA — section + setup + disable
  'settings.section.twofa.title': 'Authentification à deux facteurs',
  'settings.section.twofa.lead':
    'Ajoute une couche de sécurité avec un code à 6 chiffres généré par une application (Google Authenticator, Authy, 1Password, etc.).',
  'twofa.idle.disabled.title': '2FA désactivé',
  'twofa.idle.disabled.lead':
    'Recommandé surtout pour les comptes administrateurs et propriétaires.',
  'twofa.idle.disabled.enableCta': 'Activer le 2FA',
  'twofa.idle.enabled.title': '2FA activé',
  'twofa.idle.enabled.codesLeft':
    '{count} code(s) de récupération restant(s) sur 10. Génère-en de nouveaux quand il en reste peu.',
  'twofa.idle.enabled.disableCta': 'Désactiver',
  'twofa.setup.title': 'Étape 1 — Scanne le QR',
  'twofa.setup.lead':
    'Ouvre ton application d\'authentification, scanne ce QR code, puis entre le code à 6 chiffres affiché.',
  'twofa.setup.qrAlt': 'QR code à scanner avec ton application 2FA',
  'twofa.setup.cantScan': 'Tu ne peux pas scanner ? Saisis cette clé manuellement :',
  'twofa.setup.afterScan': 'Ton app génère un nouveau code toutes les 30 secondes.',
  'twofa.setup.code.label': 'Code à 6 chiffres de ton application',
  'twofa.setup.submit': 'Vérifier et activer',
  'twofa.setup.submitting': 'Vérification…',
  'twofa.cancel': 'Annuler',
  'twofa.recovery.title': 'Codes de récupération — note-les maintenant',
  'twofa.recovery.lead':
    'Si tu perds ton téléphone, ces codes te permettent de te reconnecter une fois chacun. Stocke-les dans un endroit sûr (gestionnaire de mots de passe, papier). Tu ne pourras plus les revoir.',
  'twofa.recovery.confirm': 'J\'ai noté ces codes dans un endroit sûr.',
  'twofa.recovery.done': 'C\'est bon, j\'ai sauvegardé',
  'twofa.disable.title': 'Désactiver le 2FA',
  'twofa.disable.lead':
    'Confirme avec un code de ton application OU un code de récupération.',
  'twofa.disable.code.label': 'Code 2FA ou code de récupération',
  'twofa.disable.submit': 'Désactiver',
  'twofa.disable.submitting': 'Désactivation…',
  'twofa.toast.enabled': 'Le 2FA est activé. Sauvegarde tes codes de récupération.',
  'twofa.toast.disabled': 'Le 2FA est désactivé.',

  // Owner verified badge (T-040)
  'owner.badge.verified.label': 'Propriétaire vérifié',
  'owner.badge.verified.tooltip': 'L’identité du propriétaire a été vérifiée par AryTrano.',

  // Admin · CIN review queue (T-039)
  'admin.cin.title': 'Vérifications d’identité',
  'admin.cin.lead':
    'Propriétaires en attente de vérification CIN. Approuver débloque le badge « Propriétaire vérifié » sur leurs annonces.',
  'admin.cin.empty.title': 'Aucune CIN à examiner.',
  'admin.cin.empty.lead': 'La file est vide — tout est traité.',
  'admin.cin.submittedAt': 'Envoyée le {date}',
  'admin.cin.openImage': 'Voir l’image',
  'admin.cin.openPdf': 'Voir le PDF',
  'admin.cin.approve.cta': 'Approuver',
  'admin.cin.approve.toast.ok': 'Identité confirmée.',
  'admin.cin.approve.toast.error': 'Impossible d’approuver pour le moment.',
  'admin.cin.reject.cta': 'Rejeter',
  'admin.cin.reject.confirm': 'Confirmer le rejet',
  'admin.cin.reject.cancel': 'Annuler',
  'admin.cin.reject.reasonPlaceholder':
    'Motif lisible par le propriétaire (ex : photo floue, recto manquant, document expiré…)',
  'admin.cin.reject.reasonAria': 'Motif du rejet',
  'admin.cin.reject.reasonHint': 'De 5 à 500 caractères. Sera affiché au propriétaire.',
  'admin.cin.reject.tooShort': 'Motif trop court (5 caractères minimum).',
  'admin.cin.reject.toast.ok': 'Rejet enregistré, le propriétaire est notifié.',
  'admin.cin.reject.toast.error': 'Impossible de rejeter pour le moment.',
  'admin.cin.legal.notice':
    'Chaque ouverture de CIN est journalisée (admin id + date) pour audit. Ne télécharger les bytes hors de cette console est strictement interdit.',
  'admin.nav.cinQueue': 'Vérifications CIN',

  // Owner CIN verification (T-038/T-039)
  'verifyOwner.title': 'Vérification d’identité',
  'verifyOwner.lead':
    'Envoie une photo nette de ta CIN ou un scan PDF. Un admin vérifie ton identité — cela débloque le badge « Propriétaire vérifié » sur tes annonces.',
  'verifyOwner.status.none':
    'Tu n’as pas encore envoyé ta CIN.',
  'verifyOwner.status.pending.title': 'CIN en cours de vérification',
  'verifyOwner.status.pending.lead':
    'Un admin va l’examiner sous quelques jours. Tu seras notifié par email.',
  'verifyOwner.status.verified.title': 'Identité vérifiée',
  'verifyOwner.status.verified.lead':
    'Ton identité est confirmée. Le badge « Propriétaire vérifié » apparaît sur tes annonces.',
  'verifyOwner.status.rejected.title': 'Vérification refusée',
  'verifyOwner.status.rejected.lead':
    'Tu peux renvoyer une nouvelle photo / un nouveau scan en suivant les recommandations.',
  'verifyOwner.upload.placeholder': 'Clique pour choisir un fichier',
  'verifyOwner.upload.hint':
    'JPG, PNG, WebP, HEIC ou PDF. Max 5 Mo. Le document est chiffré avant stockage.',
  'verifyOwner.upload.submit': 'Envoyer pour vérification',
  'verifyOwner.upload.resubmit': 'Renvoyer un nouveau document',
  'verifyOwner.upload.submitting': 'Envoi en cours…',
  'verifyOwner.legal.notice':
    'Le document est chiffré au repos (AES-256-GCM) et n’est consulté que par l’équipe modération. Tu peux demander sa suppression à tout moment via le support. Politique de conservation : 6 mois après vérification.',
} as const

export type MessageKey = keyof typeof frMG

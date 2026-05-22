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
  'common.home': 'Accueil',
  'common.perMonth': '/mois',
  'common.learnMore': 'En savoir plus',

  // ── Legal pages (placeholder v0.5 — to be reviewed by counsel) ──
  'legal.eyebrow': 'Mentions légales',
  'legal.lastUpdated': 'Dernière mise à jour : {date}',
  'legal.draftNotice':
    'Version provisoire (v0.5). Ce document sera révisé par un conseil juridique avant le lancement officiel. Pour toute question, écris-nous à contact@arytrano.mg.',

  // /legal/terms — CGU
  'legal.terms.title': 'Conditions générales d’utilisation',
  'legal.terms.s1.h': '1. Objet',
  'legal.terms.s1.body':
    'AryTrano est une plateforme qui met en relation des étudiants et des propriétaires de logements à Fianarantsoa (Madagascar). Nous ne sommes pas agent immobilier, ne signons aucun bail à votre place, et ne percevons aucune commission sur les loyers.',
  'legal.terms.s2.h': '2. Création de compte',
  'legal.terms.s2.body':
    'L’inscription est gratuite. Tu dois être majeur (18 ans), fournir une adresse email valide, et — si tu publies des annonces — une pièce d’identité et un justificatif de propriété. Tu es responsable de la confidentialité de ton mot de passe.',
  'legal.terms.s3.h': '3. Contenus publiés',
  'legal.terms.s3.body':
    'Les annonces, photos, avis et messages que tu publies restent ta propriété. En les publiant sur AryTrano, tu nous accordes une licence limitée pour les afficher sur la plateforme. Tu garantis que ces contenus respectent la loi malagasy et ne portent pas atteinte aux droits de tiers.',
  'legal.terms.s4.h': '4. Modération',
  'legal.terms.s4.body':
    'Nous vérifions manuellement chaque annonce avant publication (identité, titre de propriété, photos). Nous nous réservons le droit de retirer une annonce ou de suspendre un compte en cas de violation des présentes CGU.',
  'legal.terms.s5.h': '5. Limitation de responsabilité',
  'legal.terms.s5.body':
    'AryTrano fournit un outil de mise en relation. Nous ne sommes pas partie au contrat de bail entre étudiant et propriétaire. Tout litige relatif au logement, au loyer ou aux conditions d’occupation doit être réglé directement entre les parties.',
  'legal.terms.s6.h': '6. Modifications',
  'legal.terms.s6.body':
    'Ces CGU peuvent évoluer. Tu seras notifié(e) par email au moins 30 jours avant l’entrée en vigueur de toute modification substantielle. La poursuite de l’usage de la plateforme vaut acceptation.',

  // /legal/privacy
  'legal.privacy.title': 'Politique de confidentialité',
  'legal.privacy.s1.h': '1. Données collectées',
  'legal.privacy.s1.body':
    'Lors de ton inscription : email, nom, mot de passe (haché). Lors de la publication d’une annonce (propriétaires) : pièce d’identité (chiffrée AES-256-GCM), justificatif de propriété, numéro WhatsApp. Lors de la navigation : adresse IP hachée (rate-limit anti-abus), locale préférée, cookies de session.',
  'legal.privacy.s2.h': '2. Finalités',
  'legal.privacy.s2.body':
    'Authentification, mise en relation, modération, prévention de la fraude, statistiques agrégées anonymisées. Nous ne vendons, ne louons et ne partageons aucune donnée personnelle avec des tiers à des fins commerciales.',
  'legal.privacy.s3.h': '3. Conservation',
  'legal.privacy.s3.body':
    'Compte étudiant : tant que le compte reste actif + 12 mois après la dernière connexion. Compte propriétaire vérifié : tant que des annonces sont actives + 5 ans après la dernière annonce supprimée (obligation comptable malagasy). Pièces d’identité chiffrées : 6 mois après la fin de la vérification.',
  'legal.privacy.s4.h': '4. Tes droits',
  'legal.privacy.s4.body':
    'Conformément à la loi malagasy n°2014-038 relative à la protection des données personnelles, tu peux exercer à tout moment tes droits d’accès, de rectification, d’effacement et de portabilité. Écris à contact@arytrano.mg avec une preuve d’identité.',
  'legal.privacy.s5.h': '5. Sécurité',
  'legal.privacy.s5.body':
    'TLS 1.3 sur toutes les connexions. Mots de passe hachés (Argon2id). Pièces d’identité chiffrées au repos avec rotation des clés. Accès aux données restreint à l’équipe de vérification (4 personnes max). Aucune fuite à signaler à ce jour.',
  'legal.privacy.s6.h': '6. Sous-traitants',
  'legal.privacy.s6.body':
    'Hébergement : Vercel (USA, conformité GDPR via SCC). Base de données : Postgres managé. Stockage images : Cloudinary (chiffré au repos). Email transactionnel : Resend. Tous nos sous-traitants traitent les données selon nos instructions et leurs propres engagements légaux.',

  // /legal/cookies
  'legal.cookies.title': 'Politique cookies',
  'legal.cookies.s1.h': '1. Ce que sont les cookies',
  'legal.cookies.s1.body':
    'Un cookie est un petit fichier texte stocké par ton navigateur. AryTrano utilise uniquement des cookies strictement nécessaires au fonctionnement du site (session, locale, anti-CSRF). Aucun cookie publicitaire, aucun tracker tiers.',
  'legal.cookies.s2.h': '2. Liste des cookies utilisés',
  'legal.cookies.s2.body':
    'authjs.session-token : session utilisateur (durée 30 jours). arytrano_locale : ta langue préférée FR/MG (durée 1 an). __Host-csrf : protection anti-CSRF (durée de session). Tous ces cookies sont en HttpOnly + Secure + SameSite=Lax.',
  'legal.cookies.s3.h': '3. Pas de consentement requis',
  'legal.cookies.s3.body':
    'Comme nous n’utilisons que des cookies strictement nécessaires, aucun bandeau de consentement n’est obligatoire selon la loi malagasy 2014-038 ni le RGPD européen pour les visiteurs UE.',
  'legal.cookies.s4.h': '4. Désactivation',
  'legal.cookies.s4.body':
    'Tu peux supprimer ou bloquer les cookies via les paramètres de ton navigateur. Attention : sans le cookie de session, tu ne pourras pas rester connecté. Sans le cookie de locale, la langue par défaut sera FR à chaque visite.',
  'legal.cookies.s5.h': '5. Modifications',
  'legal.cookies.s5.body':
    'Si nous introduisons un nouveau cookie (analytics, etc.), cette politique sera mise à jour et un bandeau de consentement explicite apparaîtra avant le dépôt.',

  // /legal/mentions
  'legal.mentions.title': 'Mentions légales',
  'legal.mentions.s1.h': 'Éditeur',
  'legal.mentions.s1.body':
    'AryTrano SARL (en cours d’immatriculation). Siège social : Fianarantsoa, Madagascar. Représentant légal : à compléter avant lancement officiel.',
  'legal.mentions.s2.h': 'Contact',
  'legal.mentions.s2.body':
    'Email : contact@arytrano.mg. WhatsApp : +261 — à compléter. Pour les questions de protection des données : privacy@arytrano.mg.',
  'legal.mentions.s3.h': 'Hébergement',
  'legal.mentions.s3.body':
    'Le site est hébergé par Vercel Inc. (USA). 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Conformité GDPR via Standard Contractual Clauses.',
  'legal.mentions.s4.h': 'Propriété intellectuelle',
  'legal.mentions.s4.body':
    'Le nom AryTrano, le logo, le design et le code source sont la propriété exclusive d’AryTrano SARL. Toute reproduction sans autorisation préalable écrite est interdite. Les annonces et photos appartiennent à leurs auteurs.',
  'legal.mentions.s5.h': 'Loi applicable',
  'legal.mentions.s5.body':
    'Les présentes mentions et tout litige relatif à l’utilisation d’AryTrano sont régis par le droit malagasy. Compétence exclusive des tribunaux de Fianarantsoa.',
  'common.loading': 'Chargement…',
  'common.back': 'Retour',
  'common.close': 'Fermer',
  'common.next': 'Suivant',
  'common.previous': 'Précédent',

  // A11y
  'a11y.skipToContent': 'Aller au contenu principal',

  // Header / nav
  'header.nav.listings': 'Annonces',
  'header.nav.quartiers': 'Quartiers',
  'header.nav.howItWorks': 'Comment ça marche',
  'header.nav.owners': 'Propriétaires',
  'header.topbar.becomeOwner': 'Devenir propriétaire',
  'header.topbar.help': 'Aide',
  'header.topbar.studentSpace': 'Espace étudiant',
  'header.action.favorites': 'Mes favoris',
  'header.action.reservations': 'Mes réservations',
  'header.cta.signUp': 'S’inscrire',
  // Footer (v3 — newsletter + 5 columns + payments + bottom)
  'footerV3.newsletter.eyebrow': 'Alertes WhatsApp',
  'footerV3.newsletter.title':
    'Reçois les nouvelles annonces direct sur WhatsApp.',
  'footerV3.newsletter.lead':
    'Choisis tes quartiers et ton budget — on t’envoie un message dès qu’une annonce vérifiée correspond. Désabo en 1 mot.',
  'footerV3.newsletter.phonePlaceholder': '34 12 345 67',
  'footerV3.newsletter.phoneLabel': 'Numéro WhatsApp Madagascar',
  'footerV3.newsletter.submit': 'M’alerter',
  'footerV3.newsletter.submitting': 'Envoi…',
  'footerV3.newsletter.success':
    'C’est noté — on t’écrit dès qu’une annonce vérifiée correspond.',
  'footerV3.newsletter.alreadySubscribed':
    'Tu es déjà sur la liste. Tes préférences ont été mises à jour.',
  'footerV3.newsletter.error.invalid':
    'Numéro invalide. Format attendu : 32, 33, 34, 37, 38 ou 39 suivi de 7 chiffres.',
  'footerV3.newsletter.error.rateLimit':
    'Trop d’essais. Réessaie dans une heure.',
  'footerV3.newsletter.error.unavailable':
    'Une erreur est survenue. Réessaie dans un moment.',

  // Public unsubscribe page (T-045)
  'unsubscribe.success.title': 'C\'est noté — tu es désabonné.',
  'unsubscribe.success.body':
    'On ne t\'enverra plus de messages WhatsApp ni d\'emails sur les nouvelles annonces. Tu peux te réinscrire à tout moment depuis le footer du site.',
  'unsubscribe.alreadyDone.title': 'Tu étais déjà désabonné.',
  'unsubscribe.alreadyDone.body':
    'Pas de soucis — aucun message ne partira vers ce numéro. Si tu veux à nouveau recevoir les annonces, repasse par le formulaire en bas du site.',
  'unsubscribe.invalid.title': 'Lien invalide ou expiré.',
  'unsubscribe.invalid.body':
    'Le lien de désabonnement que tu as cliqué n\'est pas reconnu. Si tu reçois encore des messages, contacte-nous à contact@arytrano.mg.',
  'unsubscribe.backHome': 'Retour à AryTrano',

  'footerV3.tagline':
    'Trouve ton logement à Fianarantsoa, sans intermédiaire. Propriétaires vérifiés, contact direct, gratuit pour les étudiants.',
  'footerV3.status.allOperational': 'Tous les services opérationnels',
  'footerV3.col.product': 'Produit',
  'footerV3.col.owners': 'Propriétaires',
  'footerV3.col.about': 'Entreprise',
  'footerV3.col.legal': 'Légal',
  'footerV3.link.viewListings': 'Voir les annonces',
  'footerV3.link.howItWorks': 'Comment ça marche',
  'footerV3.link.quartiers': 'Quartiers',
  'footerV3.link.faq': 'FAQ',
  'footerV3.link.publishListing': 'Publier une annonce',
  'footerV3.link.verification': 'Vérification',
  'footerV3.link.pricing': 'Tarifs (gratuit)',
  'footerV3.link.resources': 'Ressources',
  'footerV3.link.about': 'À propos',
  'footerV3.link.contact': 'Contact',
  'footerV3.link.blog': 'Blog',
  'footerV3.link.careers': 'Recrutement',
  'footerV3.link.terms': 'CGU',
  'footerV3.link.privacy': 'Confidentialité',
  'footerV3.link.cookies': 'Cookies',
  'footerV3.link.mentions': 'Mentions',
  'footerV3.pay.label': 'Paiements acceptés (loyer direct propriétaire)',
  'footerV3.pay.mvola': 'M-Vola',
  'footerV3.pay.orangeMoney': 'Orange Money',
  'footerV3.pay.airtelMoney': 'Airtel Money',
  'footerV3.pay.bankTransfer': 'Virement bancaire',
  'footerV3.pay.cash': 'Espèces',
  'footerV3.bottom.copyright': '© {year} AryTrano',
  'footerV3.bottom.madeIn': 'Made in Fianarantsoa, Madagascar',
  'footerV3.bottom.status': 'Statut',
  'footerV3.bottom.security': 'Sécurité',
  'footerV3.bottom.press': 'Presse',
  'footerV3.bottom.sitemap': 'Sitemap',
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

  // Landing page (T-041 → T-051) — replaces the v0 minimalist home page
  // with a Booking-inspired structure: top bar + hero search + trust strip
  // + featured listings + neighborhoods + how-it-works + owner CTA + FAQ.

  // Meta
  'landing.meta.title': 'AryTrano — Logement étudiant vérifié à Fianarantsoa',
  'landing.meta.description':
    'Trouve un logement étudiant à Fianarantsoa parmi des annonces vérifiées. Contact direct propriétaire en WhatsApp. Prix en Ariary.',

  // Top bar
  'landing.topBar.ownerCta': 'Tu es propriétaire ? Publie gratuitement →',

  // Hero (v2 — design "Marketplace local moderne")
  'landing.hero.eyebrow': 'Tous quartiers · Fianarantsoa',
  'landing.hero.title':
    'Trouve ton logement étudiant. Vérifié, simple, en Ariary.',
  'landing.hero.lead.one':
    '{count} annonce à Fianarantsoa, contrôlée par notre équipe. Contact propriétaire direct via WhatsApp.',
  'landing.hero.lead.other':
    '{count} annonces à Fianarantsoa, contrôlées une par une par notre équipe. Contact propriétaire direct via WhatsApp.',
  'landing.hero.search.city.label': 'Ville',
  'landing.hero.search.city.placeholder': 'Choisis ta ville',
  'landing.hero.search.city.noResults': 'Aucune ville ne correspond.',
  'landing.hero.search.quartier.label': 'Quartier',
  'landing.hero.search.quartier.placeholder': 'Tous les quartiers',
  'landing.hero.search.type.label': 'Type de logement',
  'landing.hero.search.type.placeholder': 'Tous les types',
  'landing.hero.search.priceMax.label': 'Budget mensuel',
  'landing.hero.search.priceMax.placeholder': 'Ariary / mois',
  'landing.hero.search.submit.one': 'Voir l’annonce',
  'landing.hero.search.submit.other': 'Voir les {count} annonces',
  'landing.hero.search.formAria': 'Rechercher un logement étudiant à Fianarantsoa',
  'landing.hero.search.quartier.groupLabel': 'Quartiers populaires',
  'landing.hero.search.quartier.itemSubtitle': 'Fianarantsoa',
  'landing.hero.search.quartier.noResults': 'Aucun quartier ne correspond.',
  'landing.hero.search.type.groupLabel': 'Type de logement',
  'landing.hero.search.type.noResults': 'Aucun type ne correspond.',
  'landing.hero.microStats': '{count} annonces · {verified} proprios vérif.',

  // Trust strip — titre + sous-titre court
  'landing.trust.verified.title': 'Vérification humaine',
  'landing.trust.verified.subtitle': 'Pièce + acte contrôlés',
  'landing.trust.photos.title': 'Photos protégées',
  'landing.trust.photos.subtitle': 'EXIF strippé + revue manuelle',
  'landing.trust.contact.title': 'Contact direct',
  'landing.trust.contact.subtitle': 'WhatsApp, zéro frais',
  'landing.trust.price.title': 'Prix en Ariary',
  'landing.trust.price.subtitle': 'Net, sans surprise',

  // Neighborhoods
  'landing.neighborhoods.title': 'Quartiers de Fianarantsoa',
  'landing.neighborhoods.lead':
    'Du centre animé aux hauteurs calmes — 8 quartiers couverts.',
  'landing.neighborhoods.viewAll': 'Voir toutes les annonces →',
  'landing.neighborhoods.count.one': '{count} annonce',
  'landing.neighborhoods.count.other': '{count} annonces',
  'landing.neighborhoods.soon': 'Bientôt',
  // Quartier descriptors (slug-keyed) — 1 tagline d'ambiance + 1 landmark
  'landing.neighborhoods.andrainjato.tagline': 'Centre, animé',
  'landing.neighborhoods.andrainjato.landmark':
    'Près lycée Andrianampoinimerina',
  'landing.neighborhoods.antarandolo.tagline': 'Calme, résidentiel',
  'landing.neighborhoods.antarandolo.landmark': 'Proche fac de Sciences',
  'landing.neighborhoods.tsianolondroa.tagline': 'Centre, marchés',
  'landing.neighborhoods.tsianolondroa.landmark': 'Cœur historique',
  'landing.neighborhoods.mahamanina.tagline': 'Hauteurs, panorama',
  'landing.neighborhoods.mahamanina.landmark': 'Vue colline',
  'landing.neighborhoods.anjoma.tagline': 'Gare routière, commerces',
  'landing.neighborhoods.anjoma.landmark': 'Taxi-be & marchés',
  'landing.neighborhoods.ankidona.tagline': 'Étudiant, vivant',
  'landing.neighborhoods.ankidona.landmark': 'Proche INSPC',
  'landing.neighborhoods.ambalavato.tagline': 'Tranquille, familial',
  'landing.neighborhoods.ambalavato.landmark': 'Écoles & paroisses',
  'landing.neighborhoods.mahasoabe.tagline': 'Périphérie, paisible',
  'landing.neighborhoods.mahasoabe.landmark': 'Hauteurs sud',

  // Featured listings — tabs + métadonnées card
  'landing.featured.title': 'Annonces du moment',
  'landing.featured.lead': 'Les derniers logements ajoutés.',
  'landing.featured.viewAll.one': 'Voir l’annonce',
  'landing.featured.viewAll.other': 'Voir les {count} annonces',
  'landing.featured.viewMap': 'Carte complète',
  'landing.featured.tab.all': 'Tous',
  'landing.featured.tab.STUDIO': 'Studio',
  'landing.featured.tab.ROOM': 'Chambre',
  'landing.featured.tab.APARTMENT': 'Appartement',
  'landing.featured.tab.HOUSE': 'Maison',
  'landing.featured.tab.empty':
    'Pas encore d’annonce dans cette catégorie — reviens bientôt.',
  'landing.featured.badge.new': 'Nouveau',
  'landing.featured.relativeTime.today': 'aujourd’hui',
  'landing.featured.relativeTime.daysAgo.one': 'il y a {count} j',
  'landing.featured.relativeTime.daysAgo.other': 'il y a {count} j',

  // How it works
  'landing.how.title': 'Trois étapes.',
  'landing.how.lead':
    'Tu cherches, tu contactes, tu visites. C’est tout. AryTrano ne se met jamais entre toi et le propriétaire.',
  'landing.how.step1.title': 'Cherche par quartier ou budget',
  'landing.how.step1.body':
    'Filtres rapides, photos, prix en Ariary, badge « vérifié » visible en un coup d’œil.',
  'landing.how.step2.title': 'Contacte en 1 clic sur WhatsApp',
  'landing.how.step2.body':
    'Message pré-rempli avec la référence de l’annonce. Réponse propriétaire sous 24h en moyenne.',
  'landing.how.step3.title': 'Visite et signe ton bail',
  'landing.how.step3.body':
    'Tu visites en personne, tu négocies direct, tu signes ton contrat. Aucune commission AryTrano.',

  // Owner block — 4 bullets, 2 CTAs
  'landing.ownerBlock.eyebrow': 'Tu es propriétaire ?',
  'landing.ownerBlock.title':
    'Loue plus vite. Sans frais. Sans faux locataires.',
  'landing.ownerBlock.lead':
    'Publie ton annonce en 5 minutes, reçois des demandes d’étudiants vérifiés, gère tes messages WhatsApp depuis ton dashboard.',
  'landing.ownerBlock.bullet1': 'Annonce 100% gratuite, à vie',
  'landing.ownerBlock.bullet2': 'Vérification d’identité étudiante incluse',
  'landing.ownerBlock.bullet3': 'Réponds en WhatsApp depuis le dashboard',
  'landing.ownerBlock.bullet4': 'Stats de vues et favoris en temps réel',
  'landing.ownerBlock.cta': 'Publier une annonce',
  'landing.ownerBlock.ctaSecondary': 'Voir un exemple',

  // Testimonials (placeholder data — to replace once we ship real ones)
  'landing.testimonials.title': 'Ils nous font confiance',
  'landing.testimonials.lead':
    'Étudiants et propriétaires qui ont trouvé via AryTrano.',
  'landing.testimonials.role.student': 'Étudiant·e',
  'landing.testimonials.role.owner': 'Propriétaire',
  'landing.testimonials.t1.name': 'Mme Rasoa',
  'landing.testimonials.t1.area': 'Andrainjato',
  'landing.testimonials.t1.role': 'owner',
  'landing.testimonials.t1.quote':
    'En 3 jours, 5 demandes sérieuses. La vérif AryTrano change tout — fini les pertes de temps avec des faux candidats.',
  'landing.testimonials.t2.name': 'M. Heriniaina',
  'landing.testimonials.t2.area': 'Antarandolo',
  'landing.testimonials.t2.role': 'student',
  'landing.testimonials.t2.quote':
    'Je voulais un studio proche de la fac sans arnaque. AryTrano m’a mis en contact direct avec le proprio en 2 clics.',
  'landing.testimonials.t3.name': 'Mme Bao',
  'landing.testimonials.t3.area': 'Mahamanina',
  'landing.testimonials.t3.role': 'owner',
  'landing.testimonials.t3.quote':
    'Ce que j’aime : le badge « Propriétaire vérifié » me distingue des annonces douteuses sur Facebook.',
  'landing.testimonials.t4.name': 'M. Rakoto',
  'landing.testimonials.t4.area': 'Tsianolondroa',
  'landing.testimonials.t4.role': 'student',
  'landing.testimonials.t4.quote':
    'WhatsApp direct avec le proprio, message pré-rempli, super pratique. Visite le lendemain, bail signé la semaine d’après.',
  'landing.testimonials.t5.name': 'Famille Andry',
  'landing.testimonials.t5.area': 'Anjoma',
  'landing.testimonials.t5.role': 'owner',
  'landing.testimonials.t5.quote':
    'On a 3 logements à louer. Le dashboard avec stats de vues + favoris nous aide à savoir quelle annonce booster.',
  'landing.testimonials.t6.name': 'M. Tahina',
  'landing.testimonials.t6.area': 'Ankidona',
  'landing.testimonials.t6.role': 'student',
  'landing.testimonials.t6.quote':
    'Prix clairs en Ariary, photos honnêtes, j’ai signé sans visiter à l’aveugle.',

  // FAQ — answers refreshed to match design's tone
  'landing.faq.title': 'Questions fréquentes',
  'landing.faq.lead': 'Tout ce qu’on nous demande, en clair.',
  'landing.faq.q1.question': 'Comment AryTrano vérifie les propriétaires ?',
  'landing.faq.q1.answer':
    'Notre équipe vérifie la pièce d’identité et un justificatif de propriété (acte ou facture) avant d’attribuer le badge « Propriétaire vérifié ». Aucune annonce ne porte ce badge sans vérification humaine.',
  'landing.faq.q2.question': 'Comment savoir si une annonce est fiable ?',
  'landing.faq.q2.answer':
    'Cherche le badge vert « Annonce vérifiée » — il certifie que la visite, l’adresse et le prix ont été confirmés. Nos modérateurs vérifient aussi que les photos n’ont pas été volées ailleurs avant publication.',
  'landing.faq.q3.question': 'Comment je contacte un propriétaire ?',
  'landing.faq.q3.answer':
    'Un clic sur « Contacter » ouvre directement WhatsApp avec un message pré-rempli. Aucun intermédiaire, aucune commission — tu parles au propriétaire sans frais.',
  'landing.faq.q4.question': 'Combien coûte AryTrano pour les étudiants ?',
  'landing.faq.q4.answer':
    'C’est 100% gratuit. Tu peux chercher, contacter, visiter et signer ton bail sans payer un seul Ariary à AryTrano.',
  'landing.faq.q5.question': 'Je suis propriétaire, comment publier ?',
  'landing.faq.q5.answer':
    'Crée un compte propriétaire (gratuit), envoie ta pièce d’identité et l’acte ou la facture du logement. Notre équipe valide sous 24–48h et tu peux publier autant d’annonces que tu veux.',

  // Footer — 4 colonnes (Produit / Propriétaires / Ressources / Légal)
  'landing.footer.tagline':
    'Logement étudiant vérifié à Fianarantsoa. Annonces fiables, contact direct, sans frais cachés.',
  'landing.footer.section.product': 'Produit',
  'landing.footer.section.owners': 'Propriétaires',
  'landing.footer.section.resources': 'Ressources',
  'landing.footer.section.legal': 'Légal',
  'landing.footer.link.listings': 'Annonces',
  'landing.footer.link.howItWorks': 'Comment ça marche',
  'landing.footer.link.faq': 'Questions fréquentes',
  'landing.footer.link.neighborhoods': 'Quartiers',
  'landing.footer.link.publishListing': 'Publier une annonce',
  'landing.footer.link.verification': 'Vérification',
  'landing.footer.link.pricing': 'Tarifs (gratuit)',
  'landing.footer.link.about': 'À propos',
  'landing.footer.link.blog': 'Blog',
  'landing.footer.link.careers': 'Recrutement',
  'landing.footer.link.press': 'Presse',
  'landing.footer.link.security': 'Sécurité',
  'landing.footer.link.status': 'Statut',
  'landing.footer.link.contact': 'Contact',
  'landing.footer.link.terms': 'Mentions',
  'landing.footer.link.privacy': 'Confidentialité',
  'landing.footer.link.cookies': 'Cookies',
  'landing.footer.copyright': '© {year} AryTrano · Fianarantsoa, Madagascar',

  // Landing v3 (design-driven additions)
  'landing.neighborhoods.eyebrow': 'Quartiers',
  'landing.how.eyebrow': 'Comment ça marche',
  'landing.students.eyebrow': 'Pour les étudiants',
  'landing.students.title': 'Pensé pour ta réalité, pas une banque européenne.',
  'landing.students.lead':
    'Pas de conversion EUR→Ar bidon. Pas de friction 5G-only. Pas d’app de 60 Mo à télécharger. AryTrano est conçu à Fianarantsoa, pour Fianarantsoa.',
  'landing.students.s1.stat': '< 200',
  'landing.students.s1.statSub': 'ko / page',
  'landing.students.s1.title': 'Léger comme une plume',
  'landing.students.s1.desc':
    'Pages compressées, photos optimisées, vraiment utilisable même sur réseau lent.',
  'landing.students.s1.highlight': 'Marche même en 3G',
  'landing.students.s2.stat': '100%',
  'landing.students.s2.statSub': 'en Ariary',
  'landing.students.s2.title': 'Tout en Ariary',
  'landing.students.s2.desc':
    'Prix nets, sans conversion fantaisiste. Tu lis le montant, tu paies le montant.',
  'landing.students.s2.highlight': 'Pas de conversion bidon',
  'landing.students.s3.stat': '0',
  'landing.students.s3.statSub': 'app à installer',
  'landing.students.s3.title': 'WhatsApp natif',
  'landing.students.s3.desc':
    'Contact propriétaire d’un clic. Pas de chat propriétaire à installer.',
  'landing.students.s3.highlight': 'Direct sur ton WhatsApp',
  'landing.students.s4.stat': 'FR·MG',
  'landing.students.s4.statSub': 'bilingue natif',
  'landing.students.s4.title': 'Français · Malagasy',
  'landing.students.s4.desc':
    'Bascule le site en français ou en malagasy en 1 clic. Aucune perte de contexte.',
  'landing.students.s4.highlight': 'Au choix, à tout moment',

  'landing.ownerBlock.stat1.n': '0',
  'landing.ownerBlock.stat1.sub': 'Ar commission',
  'landing.ownerBlock.stat2.n': '5',
  'landing.ownerBlock.stat2.sub': 'min pour publier',
  'landing.ownerBlock.stat3.n': '24-48h',
  'landing.ownerBlock.stat3.sub': 'validation',
  'landing.ownerBlock.stat4.sub': 'proprios vérifiés',
  'landing.ownerBlock.dashboard.previewBadge': 'Aperçu',
  'landing.ownerBlock.dashboard.notif.title': 'Nouveau message WhatsApp',
  'landing.ownerBlock.dashboard.notif.sub': 'de Hery · il y a 3 min',
  'landing.ownerBlock.dashboard.author': 'Mme Rasoa',
  'landing.ownerBlock.dashboard.role': 'Dashboard propriétaire',
  'landing.ownerBlock.dashboard.verified': 'Vérifiée',
  'landing.ownerBlock.dashboard.thisWeek': 'Cette semaine',
  'landing.ownerBlock.dashboard.views': 'vues',
  'landing.ownerBlock.dashboard.contacts': 'contacts',
  'landing.ownerBlock.dashboard.favorites': 'favoris',
  'landing.ownerBlock.dashboard.active': 'Active',
  'landing.ownerBlock.dashboard.l1.title': 'Studio meublé · Andrainjato',
  'landing.ownerBlock.dashboard.l1.price': '220k Ar',
  'landing.ownerBlock.dashboard.l2.title': 'Chambre · Antarandolo',
  'landing.ownerBlock.dashboard.l2.price': '140k Ar',
  'landing.ownerBlock.dashboard.l3.title': 'T1 · Anjoma',
  'landing.ownerBlock.dashboard.l3.price': '320k Ar',

  'landing.faq.eyebrow': 'Questions fréquentes',
  'landing.faq.contact.title': 'Pose ta question',
  'landing.faq.contact.sub': 'Réponse en moins de 24h',

  'landing.finalCta.title': 'Prêt à trouver ton logement à Fianarantsoa ?',
  'landing.finalCta.lead':
    '64 annonces vérifiées, propriétaires de confiance, contact WhatsApp direct. Aucun frais pour les étudiants.',
  'landing.finalCta.cta': 'Voir toutes les annonces',

  // Auth page chrome (eyebrows + back link)
  'auth.back.home': 'Retour à l’accueil',
  'auth.eyebrow.signin': 'Bon retour',
  'auth.eyebrow.signup': 'Bienvenue',
  'auth.eyebrow.forgot': 'Mot de passe oublié',
  'auth.h1.signin': 'Bon retour sur AryTrano',
  'auth.h1.signup': 'Crée ton compte AryTrano',
  'auth.h1.forgot': 'Mot de passe oublié ?',
  'auth.sub.signin': 'Continue ta recherche, ou réponds à un propriétaire.',
  'auth.sub.signup':
    'Cherche, contacte, signe — 100% gratuit pour les étudiants.',
  'auth.sub.forgot':
    'Entre ton email et on t’envoie un lien pour le réinitialiser.',
  'auth.alt.signup': 'Pas encore de compte ?',
  'auth.alt.signupLink': 'Inscris-toi gratuitement',
  'auth.alt.signin': 'Déjà un compte ?',
  'auth.alt.signinLink': 'Connecte-toi',
  'auth.role.student.sub': 'Je cherche un logement',
  'auth.role.owner.sub': 'Je publie mon logement',

  // Auth side panel
  'auth.panel.eyebrow': 'Logement étudiant · Fianarantsoa',
  'auth.panel.title': 'Rejoins 168 propriétaires vérifiés et 1 200 étudiants déjà actifs.',
  'auth.panel.value1.title': 'Annonces vérifiées',
  'auth.panel.value1.sub': 'Identité + acte ou facture contrôlés par notre équipe.',
  'auth.panel.value2.title': 'Contact WhatsApp direct',
  'auth.panel.value2.sub': 'Aucun intermédiaire, aucune commission.',
  'auth.panel.value3.title': 'Prix nets en Ariary',
  'auth.panel.value3.sub': 'Affichés clairement, sans conversion bidon.',
  'auth.panel.teaser.badge': 'Vérifiée',
  'auth.panel.teaser.title': 'Studio meublé · 18m²',
  'auth.panel.teaser.location': 'Andrainjato',
  'auth.panel.teaser.price': '220 000 Ar',
  'auth.panel.proof':
    '· 64 annonces actives · 168 propriétaires vérifiés · 8 quartiers couverts',

  // ── /comment-ca-marche page ──
  'comment.meta.title': 'Comment ça marche à Fianarantsoa',
  'comment.meta.description':
    'Comment AryTrano fonctionne : process étudiant et propriétaire, vérification, sécurité, modèle économique.',
  'comment.eyebrow': 'Comment ça marche',
  'comment.h1.lead': 'Une plateforme. Zéro intermédiaire.',
  'comment.h1.accent': 'Aucune commission.',
  'comment.sub':
    'AryTrano connecte directement les étudiants et les propriétaires de Fianarantsoa. On vérifie les deux côtés, on protège les photos, on facilite le contact. On ne se met jamais entre vous.',
  'comment.audience.student': 'Je cherche un logement',
  'comment.audience.owner': 'Je suis propriétaire',

  'comment.studentFlow.s1.title': 'Tu cherches selon tes critères',
  'comment.studentFlow.s1.desc':
    'Filtre par quartier, type (studio / chambre / T1 / T2), budget max, équipements (WiFi, eau chaude, meublé, balcon…). Trie par prix ou récence.',
  'comment.studentFlow.s1.example':
    'Exemple : « Studio meublé à Andrainjato, max 250 000 Ar/mois, avec WiFi »',
  'comment.studentFlow.s1.time': '2 min',
  'comment.studentFlow.s2.title': 'Tu repères les annonces vérifiées',
  'comment.studentFlow.s2.desc':
    'Le badge « Vérifiée » signifie que notre équipe a contrôlé manuellement la pièce d’identité du propriétaire et relu chaque détail de l’annonce avant publication.',
  'comment.studentFlow.s2.example':
    'Active le filtre « Vérifiées seulement » pour ne voir que les annonces validées.',
  'comment.studentFlow.s2.time': 'instantané',
  'comment.studentFlow.s3.title': 'Tu contactes via WhatsApp',
  'comment.studentFlow.s3.desc':
    'Un clic sur « Contacter » ouvre WhatsApp avec un message pré-rempli incluant la référence. Tu parles direct au propriétaire.',
  'comment.studentFlow.s3.example':
    'Aucun intermédiaire, aucune file d’attente — tu écris, le propriétaire répond.',
  'comment.studentFlow.s3.time': '< 1 min',
  'comment.studentFlow.s4.title': 'Tu visites le logement',
  'comment.studentFlow.s4.desc':
    'Rendez-vous direct avec le propriétaire. L’adresse exacte t’est communiquée à ce moment-là (jamais publique). Visite gratuite, sans engagement.',
  'comment.studentFlow.s4.example':
    'Conseil : visite de jour, demande à voir 2-3 logements minimum avant de te décider.',
  'comment.studentFlow.s4.time': '30-45 min',
  'comment.studentFlow.s5.title': 'Tu signes ton bail',
  'comment.studentFlow.s5.desc':
    'Tu signes directement avec le propriétaire. AryTrano ne touche aucune commission, ne se mêle pas du contrat, ne stocke pas tes infos bancaires.',
  'comment.studentFlow.s5.example':
    'Demande une quittance de loyer chaque mois pour garder une preuve écrite.',
  'comment.studentFlow.s5.time': '1h',

  'comment.ownerFlow.s1.title': 'Tu crées ton compte propriétaire',
  'comment.ownerFlow.s1.desc':
    'Email + numéro WhatsApp + mot de passe. C’est tout pour commencer.',
  'comment.ownerFlow.s1.example':
    'Pas de carte bancaire requise. AryTrano est gratuit en v0.5.',
  'comment.ownerFlow.s1.time': '1 min',
  'comment.ownerFlow.s2.title': 'Tu envoies une pièce d’identité',
  'comment.ownerFlow.s2.desc':
    'Photo de ta CIN ou de ton passeport, lisible. Stockée via Cloudinary et accessible uniquement à notre équipe pour la validation.',
  'comment.ownerFlow.s2.example':
    'Ta pièce d’identité ne sera jamais affichée publiquement ni transmise à un étudiant.',
  'comment.ownerFlow.s2.time': '2 min',
  'comment.ownerFlow.s3.title': 'Tu décris ton premier logement',
  'comment.ownerFlow.s3.desc':
    'Type, loyer, quartier, équipements, description libre. 1 photo minimum (idéalement 4-5 : façade, pièce principale, salle de bain, cuisine).',
  'comment.ownerFlow.s3.example':
    'Photos de jour, sans personnes, sans filtre. L’authenticité rassure les étudiants.',
  'comment.ownerFlow.s3.time': '5 min',
  'comment.ownerFlow.s4.title': 'Notre équipe vérifie sous 24-48h',
  'comment.ownerFlow.s4.desc':
    'Contrôle manuel de ta pièce d’identité et relecture éditoriale de ton annonce (titre, description, photos, prix). Si tout est OK, ton annonce est publiée avec le badge « Vérifiée ».',
  'comment.ownerFlow.s4.example':
    'En général sous 48h ouvrées. On t’envoie un email dès que la validation est faite.',
  'comment.ownerFlow.s4.time': '24-48h',
  'comment.ownerFlow.s5.title': 'Tu reçois les demandes',
  'comment.ownerFlow.s5.desc':
    'Les étudiants cliquent « Contacter » → leur message arrive sur ton WhatsApp avec la référence. Tu vois aussi tes stats dans ton dashboard.',
  'comment.ownerFlow.s5.example':
    'Tu mets une annonce en « Loué » en un clic depuis ton dashboard quand c’est fait.',
  'comment.ownerFlow.s5.time': 'continu',

  'comment.why.eyebrow': 'Pourquoi AryTrano',
  'comment.why.title': 'Chercher un logement étudiant, sans louche.',
  'comment.why.p1':
    'À Fianarantsoa, le marché du logement étudiant passe par WhatsApp, Facebook et le bouche-à-oreille. Plein de bonnes annonces — mais aussi des faux comptes, des photos volées sur Booking, des « propriétaires » qui disparaissent après acompte.',
  'comment.why.p2':
    'AryTrano part d\'une règle simple : aucune annonce n\'est publiée tant qu\'un humain de l\'équipe n\'a pas validé le propriétaire et l\'annonce.',
  'comment.why.stat1.n': '8',
  'comment.why.stat1.label': 'quartiers couverts à Fianarantsoa — on en ajoute progressivement',
  'comment.why.stat2.n': '0',
  'comment.why.stat2.label': 'commission, ni pour l’étudiant ni pour le propriétaire — gratuit en v0.5',
  'comment.why.stat3.n': '24-48h',
  'comment.why.stat3.label': 'délai de validation d’une nouvelle annonce par notre équipe',
  'comment.why.stat4.n': '1 par 1',
  'comment.why.stat4.label': 'chaque propriétaire validé manuellement avant publication',

  'comment.verif.eyebrow': 'Ce qu’on fait vraiment',
  'comment.verif.title': 'Les 6 garde-fous qu’on tient aujourd’hui.',
  'comment.verif.v1.title': 'Identité du propriétaire',
  'comment.verif.v1.desc':
    'Pièce d’identité (CIN ou passeport) demandée à la création du compte propriétaire. Notre équipe contrôle chaque pièce avant d’autoriser la publication.',
  'comment.verif.v1.why': 'Empêche un compte anonyme de publier une annonce.',
  'comment.verif.v2.title': 'Annonces validées 1 par 1',
  'comment.verif.v2.desc':
    'Aucune annonce n’apparaît automatiquement. Un humain de l’équipe relit le titre, la description, les photos et la cohérence du prix avant publication.',
  'comment.verif.v2.why':
    'Filtre les annonces vides, les photos floues et les prix manifestement incohérents.',
  'comment.verif.v3.title': 'Photos sans données privées',
  'comment.verif.v3.desc':
    'Les métadonnées des photos (GPS, modèle de téléphone, date) sont automatiquement supprimées au moment de l’upload, avant stockage.',
  'comment.verif.v3.why':
    'Empêche qu’une photo de l’intérieur d’un logement révèle accidentellement son adresse exacte.',
  'comment.verif.v4.title': 'Contact révélé au clic',
  'comment.verif.v4.desc':
    'Le numéro WhatsApp du propriétaire n’apparaît jamais dans le code source de la page. Il est révélé uniquement quand un étudiant clique pour le voir, et chaque clic est limité dans le temps.',
  'comment.verif.v4.why':
    'Bloque les scripts qui aspirent les numéros pour les revendre ou spammer.',
  'comment.verif.v5.title': 'Avis vérifiés après séjour',
  'comment.verif.v5.desc':
    'Seul un étudiant qui a réellement contacté le propriétaire via la plateforme peut laisser un avis. Les notes sont publiques et non modifiables après publication.',
  'comment.verif.v5.why':
    'Empêche les faux avis 5★ écrits par des amis ou des bots.',
  'comment.verif.v6.title': 'Signalement à un clic',
  'comment.verif.v6.desc':
    'Sur chaque annonce, un bouton « Signaler » envoie le problème à notre équipe. Les signalements multiples déclenchent une review immédiate de l’annonce.',
  'comment.verif.v6.why':
    'Donne aux étudiants un canal direct pour nous alerter d’un comportement suspect.',

  'comment.dont.eyebrow': 'Ce qu’on ne fait pas',
  'comment.dont.title': 'Pour qu’il n’y ait aucune ambiguïté.',
  'comment.dont.sub':
    'AryTrano connecte. Le reste se passe entre toi et le propriétaire.',
  'comment.dont.i1':
    'On ne prend AUCUNE commission, ni sur le loyer, ni sur le dépôt.',
  'comment.dont.i2':
    'On n’organise PAS les visites — tu prends rendez-vous direct avec le propriétaire.',
  'comment.dont.i3':
    'On ne rédige PAS le bail — c’est entre toi et le propriétaire, librement.',
  'comment.dont.i4':
    'On ne gère PAS les paiements — virement direct, mobile money, en main propre.',
  'comment.dont.i5':
    'On ne stocke PAS d’infos bancaires — on n’en a tout simplement pas besoin.',
  'comment.dont.i6':
    'On ne vend PAS tes données — pas d’ads, pas de profilage, pas de tracking tiers.',

  'comment.finalCta.student.title': 'Prêt à chercher ?',
  'comment.finalCta.student.lead':
    '64 annonces vérifiées · mises à jour quotidiennement',
  'comment.finalCta.student.cta': 'Voir les annonces',
  'comment.finalCta.owner.title': 'Prêt à publier ?',
  'comment.finalCta.owner.lead':
    '5 minutes pour publier · validation en 24-48h',
  'comment.finalCta.owner.cta': 'Publier mon annonce',

  // ── /proprietaires page ──
  'proprietaires.meta.title': 'Publier une annonce à Fianarantsoa',
  'proprietaires.meta.description':
    'Publie ton annonce en 5 minutes. Gratuit, à vie. Vérification 24-48h, contact WhatsApp direct, aucune commission.',
  'proprietaires.hero.eyebrow': 'Pour les propriétaires',
  'proprietaires.hero.title': 'Loue plus vite. Sans frais. Sans faux locataires.',
  'proprietaires.hero.sub':
    'Publie ton annonce en quelques minutes, reçois les demandes directement sur WhatsApp, garde le contact direct avec les étudiants. Aucune commission sur les loyers, jamais.',
  'proprietaires.hero.ctaPrimary': 'Publier une annonce',
  'proprietaires.hero.ctaSecondary': 'Voir l’offre',
  'proprietaires.hero.stat1.n': '0 Ar',
  'proprietaires.hero.stat1.label': 'commission ni frais d’inscription',
  'proprietaires.hero.stat2.n': '24-48h',
  'proprietaires.hero.stat2.label': 'délai de validation d’une annonce',
  'proprietaires.hero.stat3.n': '1 par 1',
  'proprietaires.hero.stat3.label': 'chaque propriétaire validé manuellement',

  'proprietaires.preview.url': 'arytrano.mg/publier',
  'proprietaires.preview.step': 'Étape 3 sur 4',
  'proprietaires.preview.title': 'Décris ton logement',
  'proprietaires.preview.field.type': 'Type',
  'proprietaires.preview.field.typeV': 'Studio meublé',
  'proprietaires.preview.field.quartier': 'Quartier',
  'proprietaires.preview.field.quartierV': 'Andrainjato',
  'proprietaires.preview.field.surface': 'Surface',
  'proprietaires.preview.field.surfaceV': '18 m²',
  'proprietaires.preview.field.price': 'Loyer / mois',
  'proprietaires.preview.field.priceV': '220 000 Ar',
  'proprietaires.preview.photos': 'Photos (5 min.)',
  'proprietaires.preview.prev': 'Précédent',
  'proprietaires.preview.next': 'Continuer',

  'proprietaires.steps.eyebrow': 'Comment publier',
  'proprietaires.steps.title': '4 étapes. Quelques minutes. Gratuit.',
  'proprietaires.steps.s1.title': 'Crée ton compte',
  'proprietaires.steps.s1.desc':
    'Email + numéro WhatsApp + mot de passe. C’est tout pour commencer.',
  'proprietaires.steps.s2.title': 'Envoie ta pièce d’identité',
  'proprietaires.steps.s2.desc':
    'Photo de ta CIN ou passeport, lisible. Visible uniquement par notre équipe pour validation — jamais publique.',
  'proprietaires.steps.s3.title': 'Décris ton logement',
  'proprietaires.steps.s3.desc':
    'Titre, prix, quartier, équipements, photos. Notre équipe relit chaque détail avant publication.',
  'proprietaires.steps.s4.title': 'Reçois les demandes',
  'proprietaires.steps.s4.desc':
    'Quand un étudiant clique « Contacter », WhatsApp s’ouvre côté étudiant avec un message pré-rempli. Tu réponds quand tu veux.',

  'proprietaires.verif.eyebrow': 'Vérification',
  'proprietaires.verif.title': 'Pourquoi on vérifie chaque propriétaire ?',
  'proprietaires.verif.body':
    'À Fianarantsoa, le marché du logement étudiant passe par WhatsApp et Facebook — sans filtre, avec son lot de faux comptes et d’annonces volées. AryTrano refuse de publier sans qu’un humain de l’équipe ait validé la personne derrière l’annonce.',
  'proprietaires.verif.i1.title': 'Pièce d’identité',
  'proprietaires.verif.i1.desc':
    'CIN ou passeport contrôlé manuellement par notre équipe à la création du compte.',
  'proprietaires.verif.i2.title': 'Annonce relue 1 par 1',
  'proprietaires.verif.i2.desc':
    'Titre, description, prix, photos — chaque annonce est relue par un humain avant d’apparaître publiquement.',
  'proprietaires.verif.i3.title': 'Photos sans données privées',
  'proprietaires.verif.i3.desc':
    'À l’upload, on supprime automatiquement les métadonnées (GPS, modèle de téléphone, date) pour ne jamais exposer l’adresse exacte.',
  'proprietaires.verif.i4.title': 'Contact révélé au clic',
  'proprietaires.verif.i4.desc':
    'Ton numéro WhatsApp n’est jamais dans le code source de la page. Il est révélé uniquement quand un étudiant clique pour te contacter — anti-scraping intégré.',
  'proprietaires.verif.card.preview': 'Aperçu',
  'proprietaires.verif.card.author': 'Profil propriétaire',
  'proprietaires.verif.card.verifiedAt': 'Validé par AryTrano',
  'proprietaires.verif.card.badge': 'Vérifiée',
  'proprietaires.verif.card.row.cin': 'Pièce d’identité',
  'proprietaires.verif.card.row.cinV': '✓ Contrôle manuel',
  'proprietaires.verif.card.row.acte': 'Annonce',
  'proprietaires.verif.card.row.acteV': '✓ Relue 1 par 1',
  'proprietaires.verif.card.row.phone': 'Numéro WhatsApp',
  'proprietaires.verif.card.row.phoneV': '✓ Révélé au clic',
  'proprietaires.verif.card.row.active': 'Photos',
  'proprietaires.verif.card.row.activeV': '✓ Métadonnées effacées',
  'proprietaires.verif.card.row.response': 'Avis locataires',
  'proprietaires.verif.card.row.responseV': 'Activable après séjour',
  'proprietaires.verif.card.row.rating': 'Signalement',
  'proprietaires.verif.card.row.ratingV': 'À un clic, sur chaque annonce',

  'proprietaires.pricing.eyebrow': 'L’offre v0.5',
  'proprietaires.pricing.title': 'Gratuit pour démarrer.',
  'proprietaires.pricing.lead':
    'Pendant la beta, publier ton annonce sur AryTrano ne coûte rien. Aucune commission sur le loyer, aucune carte demandée.',
  'proprietaires.pricing.disclaimer':
    'Aucune commission sur les loyers — ni maintenant, ni jamais. Ce que l’étudiant t’envoie, c’est ce que tu touches.',
  'proprietaires.pricing.standard.name': 'Beta v0.5',
  'proprietaires.pricing.standard.price': '0 Ar',
  'proprietaires.pricing.standard.sub': 'Pendant la beta',
  'proprietaires.pricing.standard.f1': 'Création de compte + validation manuelle',
  'proprietaires.pricing.standard.f2': 'Annonces validées 1 par 1 par notre équipe',
  'proprietaires.pricing.standard.f3': 'Demandes des étudiants directement sur WhatsApp',
  'proprietaires.pricing.standard.f4': 'Photos sans métadonnées privées (anti-fuite)',
  'proprietaires.pricing.standard.f5': 'Contact protégé contre le scraping',
  'proprietaires.pricing.standard.cta': 'Créer mon compte propriétaire',
  'proprietaires.pricing.roadmap.eyebrow': 'Roadmap',
  'proprietaires.pricing.roadmap.body':
    'Plus tard, des options payantes optionnelles arriveront : badge « Vérifié » renforcé et placement boosté de l’annonce. Toujours optionnel, jamais sur le loyer, jamais facturé à l’étudiant.',
  'proprietaires.pricing.priceSuffix': '',

  'proprietaires.faq.eyebrow': 'Questions de propriétaires',
  'proprietaires.faq.title': 'On vous répond direct.',
  'proprietaires.faq.q1.q': 'Combien de temps prend la vérification ?',
  'proprietaires.faq.q1.a':
    'En général 24-48h ouvrées. Si tu envoies tes pièces le lundi matin, ton compte est validé dans la journée du mardi.',
  'proprietaires.faq.q2.q': 'Mes pièces d’identité sont-elles sécurisées ?',
  'proprietaires.faq.q2.a':
    'Oui. Tes pièces sont stockées sur Cloudinary (CDN sécurisé en HTTPS), accessibles uniquement à notre équipe de vérification. Elles ne sont jamais affichées sur ton profil public ni transmises aux étudiants.',
  'proprietaires.faq.q3.q': 'Combien d’annonces puis-je publier ?',
  'proprietaires.faq.q3.a':
    'Autant que tu veux pendant la beta v0.5 — chaque annonce passe par la validation manuelle avant publication. Si on voit des comportements problématiques (annonces dupliquées, contenus trompeurs), on peut limiter ponctuellement le compte.',
  'proprietaires.faq.q4.q': 'Comment je gère les demandes ?',
  'proprietaires.faq.q4.a':
    'Tu reçois les messages directement sur WhatsApp avec la référence de l’annonce. Tu vois aussi les stats (vues, contacts, favoris) dans ton dashboard.',
  'proprietaires.faq.q5.q': 'Que se passe-t-il si je trouve un locataire ?',
  'proprietaires.faq.q5.a':
    'Tu mets ton annonce en « Loué » depuis ton dashboard. Aucune commission, aucune paperasse côté AryTrano. Tu signes ton bail librement avec l’étudiant.',
  'proprietaires.faq.q6.q': 'Et si un locataire fait défaut ?',
  'proprietaires.faq.q6.a':
    'AryTrano ne gère pas les relations bail/paiement — c’est entre toi et le locataire. Si tu rencontres un problème, écris-nous : on peut t’écouter, signaler le locataire pour les futurs propriétaires, et te donner des conseils pratiques. Pas de service juridique en v0.5.',

  'proprietaires.finalCta.title': 'Prêt à publier ?',
  'proprietaires.finalCta.lead': '5 minutes. Aucun frais. Validation sous 24-48h.',
  'proprietaires.finalCta.cta': 'Créer mon compte propriétaire',

  // ── /quartiers page ──
  'quartiers.meta.title': 'Quartiers de Fianarantsoa',
  'quartiers.meta.description':
    'Découvre les 8 quartiers de Fianarantsoa : ambiance, transports, loyer moyen, annonces disponibles.',
  // E-T07 multi-ville : meta variantes paramétrées par ville pour
  // /quartiers/<citySlug>
  'quartiers.cityMeta.title': 'Quartiers de {city}',
  'quartiers.cityMeta.description':
    'Découvre les quartiers étudiants de {city} : ambiance, transports, loyer moyen, annonces disponibles.',
  // City labels — E-T07
  'cities.fianarantsoa.name': 'Fianarantsoa',
  'cities.fianarantsoa.tagline': 'La capitale étudiante du Sud',
  'cities.antananarivo.name': 'Antananarivo',
  'cities.antananarivo.tagline': 'Capitale + plus grand bassin étudiant',
  'cities.toamasina.name': 'Toamasina',
  'cities.toamasina.tagline': 'Côte Est, port + université',
  'cities.mahajanga.name': 'Mahajanga',
  'cities.mahajanga.tagline': 'Côte Ouest, climat doux',
  'cities.toliara.name': 'Toliara',
  'cities.toliara.tagline': 'Sud-Ouest, université + sciences marines',
  'quartiers.eyebrow': 'Quartiers',
  'quartiers.h1': 'Les 8 quartiers de Fianarantsoa.',
  'quartiers.lead':
    'Du centre commercial animé d’Antarandolo aux hauteurs résidentielles d’Ankidona — choisis ton quartier selon ton style de vie, pas seulement ton budget.',
  'quartiers.stats.quartiers.label': 'Quartiers couverts',
  'quartiers.stats.listings.label': 'Annonces actives',
  'quartiers.stats.priceRange.label': 'Fourchette Ar/mois',
  'quartiers.stats.priceRange.value': '95k–420k',
  'quartiers.block.dataCell.avgPrice': 'Loyer moyen',
  'quartiers.block.dataCell.distance': 'Distance centre',
  'quartiers.block.dataCell.listings': 'Annonces',
  'quartiers.block.dataCell.listings.value.one': '{count} active',
  'quartiers.block.dataCell.listings.value.other': '{count} actives',
  'quartiers.block.dataCell.avgPrice.sub': '/mois',
  'quartiers.block.dataCell.avgPrice.noData': '—',
  'quartiers.block.poi.walk': 'À pied',
  'quartiers.block.poi.transport': 'Transports',
  'quartiers.block.sample.label': 'Aperçu des annonces',
  'quartiers.block.sample.viewAll.one': 'Voir l’annonce',
  'quartiers.block.sample.viewAll.other': 'Voir les {count}',
  'quartiers.block.sample.empty': 'Aucune annonce active pour le moment.',
  'quartiers.cta.eyebrow': 'Tu hésites ?',
  'quartiers.cta.title': 'Pas sûr du quartier qui te correspond ?',
  'quartiers.cta.lead':
    'Réponds à 6 questions (budget, école, type de logement, ambiance, transports, priorité) — on te recommande les 3 quartiers qui te collent. Aucun compte requis.',
  'quartiers.cta.primary': 'Faire le quiz (2 min)',
  'quartiers.cta.secondary': 'Voir toutes les annonces',

  // Quiz wizard — meta + chrome
  'quiz.meta.title': 'Quel quartier de Fianarantsoa te correspond ?',
  'quiz.meta.description':
    '6 questions, 2 minutes — on te recommande les quartiers de Fianarantsoa qui matchent ton budget, ton école et ton mode de vie.',
  'quiz.h1': 'Quel quartier te correspond ?',
  'quiz.lead':
    '6 questions pour trouver les quartiers de Fianarantsoa qui matchent ta vie étudiante.',
  'quiz.progress': 'Question {step} sur {total}',
  'quiz.next': 'Continuer',
  'quiz.back': 'Retour',
  'quiz.submit': 'Voir mes quartiers',
  'quiz.restart': 'Refaire le quiz',

  // Q1 — Budget
  'quiz.q.budget.title': 'Quel est ton budget mensuel max ?',
  'quiz.q.budget.help': 'Loyer charges comprises.',
  'quiz.q.budget.opt.lt150k': 'Moins de 150 000 Ar',
  'quiz.q.budget.opt.150_250k': '150 000 – 250 000 Ar',
  'quiz.q.budget.opt.250_400k': '250 000 – 400 000 Ar',
  'quiz.q.budget.opt.gte400k': 'Plus de 400 000 Ar',

  // Q2 — School
  'quiz.q.school.title': 'Tu étudies où ?',
  'quiz.q.school.help': 'On priorise les quartiers proches de ton école.',
  'quiz.q.school.opt.university': 'Université de Fianarantsoa',
  'quiz.q.school.opt.lycee': 'Lycée / centre-ville',
  'quiz.q.school.opt.unsure': 'Autre · je ne sais pas encore',

  // Q3 — Housing type
  'quiz.q.housingType.title': 'Quel type de logement tu cherches ?',
  'quiz.q.housingType.help': 'Tu pourras toujours filtrer après.',
  'quiz.q.housingType.opt.ROOM': 'Chambre seule',
  'quiz.q.housingType.opt.STUDIO': 'Studio',
  'quiz.q.housingType.opt.APARTMENT': 'Appartement',
  'quiz.q.housingType.opt.any': 'Pas de préférence',

  // Q4 — Vibe
  'quiz.q.vibe.title': 'Quelle ambiance tu préfères ?',
  'quiz.q.vibe.help': "On match l'ambiance du quartier à la tienne.",
  'quiz.q.vibe.opt.calm': 'Calme, je veux dormir',
  'quiz.q.vibe.opt.lively': 'Animé, vie locale, marchés',
  'quiz.q.vibe.opt.mixed': 'Mix : calme la nuit, vie le jour',

  // Q5 — Mobility
  'quiz.q.mobility.title': 'Comment tu te déplaces ?',
  'quiz.q.mobility.help': 'Au quotidien — école, courses, sorties.',
  'quiz.q.mobility.opt.walk': 'À pied uniquement',
  'quiz.q.mobility.opt.taxibe': 'Taxi-be · pousse-pousse',
  'quiz.q.mobility.opt.car': "J'ai un véhicule",

  // Q6 — Priority
  'quiz.q.priority.title': 'Ta priorité numéro 1 ?',
  'quiz.q.priority.help': 'Le critère qui pèse le plus dans ton choix.',
  'quiz.q.priority.opt.price': 'Prix le plus bas',
  'quiz.q.priority.opt.school': 'Proximité école',
  'quiz.q.priority.opt.calm': 'Tranquillité',
  'quiz.q.priority.opt.social': 'Vie sociale · commerces',

  // Results page
  'quiz.results.eyebrow': 'Tes quartiers',
  'quiz.results.title': 'Voici les 3 quartiers qui te collent',
  'quiz.results.subtitle':
    "On a comparé tes réponses aux profils de chaque quartier. Top match en premier.",
  'quiz.results.topMatchLabel': 'Top match',
  'quiz.results.whyMatches': 'Pourquoi ça matche',
  'quiz.results.alsoConsider': "À considérer aussi",
  'quiz.results.viewListings.one': "Voir l'annonce",
  'quiz.results.viewListings.other': 'Voir les {count} annonces',
  'quiz.results.viewListings.zero': "Pas encore d'annonces — sois alerté",
  'quiz.results.emailEyebrow': 'Reste informé',
  'quiz.results.emailTitle': 'Reçois les nouvelles annonces dans ces quartiers',
  'quiz.results.emailLead':
    'Un email par nouvelle annonce, jamais de spam. Tu peux te désabonner à tout moment.',
  'quiz.results.emailPlaceholder': 'ton@email.com',
  'quiz.results.emailSubmit': "M'inscrire",
  'quiz.results.emailSuccess': 'C\'est noté — on t\'écrit dès qu\'une annonce sort.',
  'quiz.results.emailError': "Une erreur est survenue. Réessaie dans un moment.",
  'quiz.results.shareLabel': 'Partager mes résultats',

  // Reason chips on result cards (machine codes → human text)
  'quiz.reason.budget.match': 'Dans ton budget',
  'quiz.reason.school.university.close': 'Proche de la fac',
  'quiz.reason.school.lycee.close': 'Proche des lycées',
  'quiz.reason.housingType.available': 'Type de logement dispo',
  'quiz.reason.vibe.match': 'Ambiance qui te correspond',
  'quiz.reason.mobility.walk.good': 'Tout à pied',
  'quiz.reason.mobility.taxibe.good': 'Bien desservi en taxi-be',
  'quiz.reason.mobility.car.good': 'Pratique en voiture',
  'quiz.reason.priority.price.matches': 'Prix attractifs',
  'quiz.reason.priority.school.matches': 'Quartier étudiant',
  'quiz.reason.priority.calm.matches': 'Cadre tranquille',
  'quiz.reason.priority.social.matches': 'Vie locale animée',

  // 8 quartiers — ambiance, walk, transport, distance
  'quartiers.andrainjato.ambiance':
    'Animé en semaine, calme le weekend. Quartier étudiant historique.',
  'quartiers.andrainjato.walk':
    'Fac de Sciences · École polytechnique · Bibliothèque universitaire',
  'quartiers.andrainjato.transport': 'Taxi-be ligne 1 · Pousse-pousse',
  'quartiers.andrainjato.distance': '10 min centre-ville',

  'quartiers.antarandolo.ambiance':
    'Résidentiel, familles. Très calme, propre, bien éclairé le soir.',
  'quartiers.antarandolo.walk':
    'Église catholique · École privée Sainte-Marie · Petit marché local',
  'quartiers.antarandolo.transport': 'Taxi-be ligne 3',
  'quartiers.antarandolo.distance': '15 min centre-ville',

  'quartiers.tsianolondroa.ambiance':
    'Cœur historique. Vivant, marchés et commerces à pied.',
  'quartiers.tsianolondroa.walk':
    'Marché central · Banques · Restaurants · Cinéma',
  'quartiers.tsianolondroa.transport':
    'Toutes lignes taxi-be · Gare routière à 10 min',
  'quartiers.tsianolondroa.distance': 'Centre-ville',

  'quartiers.mahamanina.ambiance':
    'Hauteurs et panorama sur la ville. Calme, accès en pente.',
  'quartiers.mahamanina.walk':
    'Point de vue panoramique · Petite épicerie de quartier',
  'quartiers.mahamanina.transport': 'Taxi-be ligne 4 (irrégulier)',
  'quartiers.mahamanina.distance': '20 min centre-ville',

  'quartiers.anjoma.ambiance':
    'Carrefour de transports. Pratique pour voyager, parfois bruyant.',
  'quartiers.anjoma.walk':
    'Gare routière · Stations-service · Commerces · Pharmacie 24h',
  'quartiers.anjoma.transport': 'Toutes lignes · Gare routière sur place',
  'quartiers.anjoma.distance': '8 min centre-ville',

  'quartiers.ankidona.ambiance':
    'Hauteurs résidentielles. Vue dégagée, air frais.',
  'quartiers.ankidona.walk': 'Belvédère · Église protestante FJKM',
  'quartiers.ankidona.transport': 'Taxi-be ligne 5 (rare) · À pied recommandé',
  'quartiers.ankidona.distance': '18 min centre-ville',

  'quartiers.ambalavato.ambiance':
    'Quartier scolaire et étudiant. Vie locale dense.',
  'quartiers.ambalavato.walk':
    'Lycée Andrianampoinimerina · Terrain de sport · Pharmacie',
  'quartiers.ambalavato.transport': 'Taxi-be ligne 1',
  'quartiers.ambalavato.distance': '12 min centre-ville',

  'quartiers.mahasoabe.ambiance':
    'Périphérie sud paisible. Tranquille, familial, écoles et paroisses.',
  'quartiers.mahasoabe.walk':
    'Écoles primaires · Paroisses · Petits commerces',
  'quartiers.mahasoabe.transport': 'Taxi-be ligne 6',
  'quartiers.mahasoabe.distance': '25 min centre-ville',

  // Legacy `home.*` keys kept for backward-compat / tests until the
  // landing rewrite is fully merged. Drop after T-051.
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
  'favorites.removeAll.cta': 'Retirer tous',
  'favorites.removeAll.dialog.title': 'Retirer tous tes favoris ?',
  'favorites.removeAll.dialog.body':
    'Tu vas retirer {count} annonces de tes favoris. L\'action ne peut pas être annulée — mais tu peux les re-favoriser une par une.',
  'favorites.removeAll.dialog.cancel': 'Annuler',
  'favorites.removeAll.dialog.confirm': 'Tout retirer',
  'favorites.removeAll.dialog.pending': 'Suppression…',
  'favorites.removeAll.success': '{count} favoris retirés.',
  'favorites.removeAll.needsAuth': 'Connecte-toi pour gérer tes favoris.',
  'favorites.removeAll.error': 'Impossible de retirer les favoris. Réessaie.',
  'sidebar.myListings': 'Mes annonces',
  'sidebar.verifyOwner': 'Vérification d’identité',
  'sidebar.profile': 'Profil',
  'sidebar.security': 'Sécurité',
  'sidebar.signOut': 'Déconnexion',

  // Dashboard — listing stats (T-046)
  'dashboard.listingStats.title': 'Statistiques de l\'annonce',
  'dashboard.listingStats.back': 'Retour à mes annonces',
  'dashboard.listingStats.viewPublic': 'Voir l\'annonce publiée',
  'dashboard.listingStats.kpi.contactsTotal': 'Contacts au total',
  'dashboard.listingStats.kpi.contactsTotal.help':
    'Nombre cumulé de clics « Contacter » depuis la création.',
  'dashboard.listingStats.kpi.contacts30d': 'Contacts 30 derniers jours',
  'dashboard.listingStats.kpi.contacts30d.help':
    '{wa} WhatsApp · {ph} téléphone',
  'dashboard.listingStats.kpi.reviews': 'Avis publiés',
  'dashboard.listingStats.kpi.reviews.helpRated':
    'Note moyenne {avg}/5',
  'dashboard.listingStats.kpi.reviews.helpEmpty':
    'Aucun avis encore. Tes premiers locataires seront sollicités 14 jours après contact.',
  'dashboard.listingStats.kpi.conversion': 'Taux de retour',
  'dashboard.listingStats.kpi.conversion.help':
    'Avis publiés ÷ contacts totaux. Cet indicateur monte au fil des séjours.',
  'dashboard.listingStats.recentContacts.title': 'Derniers contacts',
  'dashboard.listingStats.recentContacts.empty':
    'Aucun contact reçu pour le moment. Vérifie que tes photos et ton prix sont en place.',
  'dashboard.listingStats.recentContacts.signedIn':
    'Visiteur identifié (compte AryTrano)',
  'dashboard.listingStats.recentContacts.anonymous':
    'Visiteur anonyme',
  'dashboard.listingStats.recentContacts.privacy':
    'Pour respecter la vie privée des étudiants, leur identité n\'est dévoilée qu\'à travers leur message WhatsApp.',
  'dashboard.listingStats.channel.whatsapp': 'Contact WhatsApp',
  'dashboard.listingStats.channel.phone': 'Appel téléphonique',
  'dashboard.listings.statsCta': 'Stats',
  'dashboard.listings.expiresOn': 'Expire le {date}',
  'dashboard.listings.expired': 'Expirée',
  'dashboard.listings.expiration.extend': 'Prolonger',
  'dashboard.listings.expiration.republish': 'Republier',
  'dashboard.listings.expiration.pending': '…',
  'dashboard.listings.expiration.extended':
    'Annonce prolongée — 60 jours de plus.',
  'dashboard.listings.expiration.republished':
    'Annonce republiée — visible publiquement à nouveau.',
  'dashboard.listings.expiration.needsAuth':
    'Connecte-toi pour prolonger l\'annonce.',
  'dashboard.listings.expiration.error':
    'Impossible de prolonger l\'annonce. Réessaie.',

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
  'settings.section.notifications.title': 'Notifications',
  'settings.section.notifications.lead':
    'Contrôle les emails automatiques que tu reçois.',
  'settings.notifications.contactReceived.label':
    'Email à chaque nouveau contact',
  'settings.notifications.contactReceived.help':
    'On t\'envoie un email dès qu\'un étudiant clique « Contacter » sur une de tes annonces. Désactive si tu préfères seulement consulter le dashboard.',
  'settings.notifications.toast.on': 'Notifications activées.',
  'settings.notifications.toast.off': 'Notifications désactivées.',
  'settings.notifications.error':
    'Impossible de mettre à jour la préférence.',
  'settings.section.data.title': 'Mes données',
  'settings.section.data.lead':
    'Télécharge tout ce qu\'on conserve sur ton compte (annonces, avis, favoris, recherches…) en un seul fichier.',
  'settings.dataExport.label': 'Télécharger mes données',
  'settings.dataExport.help':
    'Un fichier JSON listant tout ce qu\'on stocke à ton sujet : profil, annonces que tu possèdes, avis que tu as écrits, favoris, recherches sauvées, soumissions au quiz, abonnement WhatsApp, et les 50 dernières connexions. Conforme RGPD. Limite : 1 export par heure.',
  'settings.dataExport.cta': 'Télécharger',
  'settings.dataExport.pending': 'Préparation…',
  'settings.dataExport.success': 'Téléchargement démarré.',
  'settings.dataExport.needsAuth': 'Reconnecte-toi pour télécharger.',
  'settings.dataExport.rateLimit':
    'Tu as déjà téléchargé tes données récemment. Réessaie dans une heure.',
  'settings.dataExport.error':
    'Export impossible. Réessaie plus tard ou contacte le support.',
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

  // Auth — verify email (post-sign-up + resend flow)
  'verifyEmail.title': 'Vérifie ta boîte mail',
  'verifyEmail.lead':
    'On vient d\'envoyer un lien de confirmation à ton adresse. Clique dessus dans les 24 heures pour activer ton compte.',
  'verifyEmail.signInLink': 'Aller à la connexion',
  'verifyEmail.changeEmail': 'Changer d\'adresse email',
  'verifyEmail.helpInbox':
    'Pas reçu ? Vérifie tes spams, ou clique sur « Renvoyer » ci-dessus. Si rien ne marche, recommence l\'inscription avec une autre adresse.',
  'verifyEmail.resend.cta': 'Renvoyer le lien',
  'verifyEmail.resend.pending': 'Envoi…',
  'verifyEmail.resend.cooldown': 'Renvoyer ({seconds}s)',
  'verifyEmail.resend.success': 'Email renvoyé. Vérifie ta boîte.',
  'verifyEmail.resend.rateLimit':
    'Trop d\'essais. Réessaie dans une heure.',
  'verifyEmail.resend.invalid': 'Adresse email invalide.',
  'verifyEmail.resend.unavailable':
    'Impossible pour le moment. Réessaie dans un instant.',
  // Sign-in : strict-mode messages
  'signIn.emailNotVerified':
    'Email pas encore vérifié — clique sur le lien dans ta boîte mail.',
  'signIn.verifiedToast':
    'Email vérifié. Tu peux te connecter.',
  'signIn.reason.sessionExpired':
    'Session expirée. Reconnecte-toi pour reprendre où tu en étais.',
  'signIn.reason.accountSuspended':
    'Ton compte est suspendu. Contacte-nous si tu penses que c\'est une erreur.',
  'dashboard.reason.adminRevoked':
    'Ton accès admin a été révoqué. Contacte un autre admin si nécessaire.',

  // 404 — global + scoped listing variant
  'notFound.title': 'Cette page n\'existe pas (ou plus).',
  'notFound.lead':
    'Le lien est peut-être obsolète, ou la ressource a été déplacée. Reviens à l\'accueil ou parcours les annonces disponibles.',
  'notFound.cta.home': 'Accueil',
  'notFound.cta.listings': 'Voir les annonces',
  'listing.notFound.title': 'Cette annonce n\'est plus en ligne.',
  'listing.notFound.lead':
    'Le proprio l\'a peut-être retirée ou louée. Plein d\'autres annonces t\'attendent — par quartier ou par filtres.',
  'listing.notFound.cta.search': 'Toutes les annonces',
  'listing.notFound.cta.quartiers': 'Explorer les quartiers',

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
  'admin.section.marketing': 'Marketing',
  'admin.nav.overview': 'Vue d\'ensemble',
  'admin.nav.listings': 'Annonces',
  'admin.nav.reports': 'Signalements',
  'admin.nav.testimonials': 'Témoignages',
  'admin.nav.whatsappAlerts': 'Alertes WhatsApp',
  'admin.nav.quizAnalytics': 'Quiz analytics',
  'admin.headerLink': 'Admin',

  // Admin Quiz analytics (T-043)
  'admin.quiz.page.title': 'Analytics du quiz quartier',
  'admin.quiz.page.lead':
    'Distribution des réponses + top quartiers recommandés. Sert à orienter les contenus marketing et à ajuster les profils de quartier.',
  'admin.quiz.kpi.total': 'Soumissions totales',
  'admin.quiz.kpi.last7Days': '7 derniers jours',
  'admin.quiz.kpi.last30Days': '30 derniers jours',
  'admin.quiz.kpi.emailRate': 'Taux email opt-in',
  'admin.quiz.kpi.emailRate.help':
    '{with} avec email · {without} sans',
  'admin.quiz.section.locale': 'Répartition par langue',
  'admin.quiz.section.topQuartiers': 'Top quartiers recommandés',
  'admin.quiz.section.topQuartiers.help':
    'Compte le nombre de fois qu\'un quartier apparaît dans le top-3 recommandé (toutes positions confondues).',
  'admin.quiz.section.answers': 'Distribution des réponses',
  'admin.quiz.empty': 'Aucune soumission encore — partage le lien /quartiers/quiz.',
  // Question labels
  'admin.quiz.question.budget': 'Budget mensuel',
  'admin.quiz.question.school': 'École fréquentée',
  'admin.quiz.question.housingType': 'Type de logement',
  'admin.quiz.question.vibe': 'Ambiance recherchée',
  'admin.quiz.question.mobility': 'Mobilité préférée',
  'admin.quiz.question.priority': 'Priorité',
  // Budget values
  'admin.quiz.answer.budget.lt150k': '< 150k Ar',
  'admin.quiz.answer.budget.150_250k': '150k - 250k Ar',
  'admin.quiz.answer.budget.250_400k': '250k - 400k Ar',
  'admin.quiz.answer.budget.gte400k': '> 400k Ar',
  // School
  'admin.quiz.answer.school.university': 'Université',
  'admin.quiz.answer.school.lycee': 'Lycée',
  'admin.quiz.answer.school.unsure': 'Pas sûr·e',
  // Housing type
  'admin.quiz.answer.housingType.ROOM': 'Chambre',
  'admin.quiz.answer.housingType.STUDIO': 'Studio',
  'admin.quiz.answer.housingType.APARTMENT': 'Appartement',
  'admin.quiz.answer.housingType.any': 'Indifférent',
  // Vibe
  'admin.quiz.answer.vibe.calm': 'Calme',
  'admin.quiz.answer.vibe.lively': 'Animé',
  'admin.quiz.answer.vibe.mixed': 'Mixte',
  // Mobility
  'admin.quiz.answer.mobility.walk': 'À pied',
  'admin.quiz.answer.mobility.taxibe': 'Taxi-be',
  'admin.quiz.answer.mobility.car': 'Voiture',
  // Priority
  'admin.quiz.answer.priority.price': 'Prix',
  'admin.quiz.answer.priority.school': 'École',
  'admin.quiz.answer.priority.calm': 'Calme',
  'admin.quiz.answer.priority.social': 'Vie sociale',

  // Admin WhatsApp Alerts (T-044)
  'admin.alerts.page.title': 'Alertes WhatsApp',
  'admin.alerts.page.lead':
    'Liste des abonnés actifs. Filtre par quartier ou langue, sélectionne, exporte en CSV puis broadcast manuel via WhatsApp Business.',
  'admin.alerts.kpi.total': 'Abonnés actifs',
  'admin.alerts.kpi.newThisWeek': '7 derniers jours',
  'admin.alerts.kpi.locale': 'Par langue',
  'admin.alerts.kpi.unsubscribed': 'Désabonnés',
  'admin.alerts.filter.quartier': 'Quartier',
  'admin.alerts.filter.locale': 'Langue',
  'admin.alerts.filter.allQuartiers': 'Tous quartiers',
  'admin.alerts.filter.allLocales': 'Toutes langues',
  'admin.alerts.col.phone': 'Téléphone',
  'admin.alerts.col.locale': 'Langue',
  'admin.alerts.col.quartier': 'Quartier filtré',
  'admin.alerts.col.signedUp': 'Inscrit le',
  'admin.alerts.col.anyQuartier': 'tous quartiers',
  'admin.alerts.selectedCount': '{count} sélectionné(s)',
  'admin.alerts.selection.clear': 'Désélectionner',
  'admin.alerts.selection.toggleAll': 'Tout sélectionner',
  'admin.alerts.selection.toggleOne': 'Sélectionner cette ligne',
  'admin.alerts.export.all': 'Exporter {count} en CSV',
  'admin.alerts.export.selected': 'Exporter la sélection',
  'admin.alerts.export.success': 'CSV téléchargé — {count} contacts.',
  'admin.alerts.empty':
    'Aucun abonné ne matche le filtre. Élargis ou efface les filtres.',
  'admin.alerts.next': 'Page suivante',
  'admin.alerts.privacy':
    'Les abonnés désabonnés (T-045) sont automatiquement exclus de toutes les exportations, même si tu les inclus dans une sélection — anti pile-on.',

  // Admin testimonials CRUD (T-042)
  'admin.testimonials.list.title': 'Témoignages',
  'admin.testimonials.list.lead':
    'Citations publiées sur la landing AryTrano. Ajoute, édite, publie ou retire selon les besoins marketing.',
  'admin.testimonials.list.create': 'Nouveau témoignage',
  'admin.testimonials.list.empty':
    'Aucun témoignage encore — clique « Nouveau témoignage » pour commencer.',
  'admin.testimonials.list.next': 'Page suivante',
  'admin.testimonials.list.backLink': 'Retour à la liste',
  'admin.testimonials.filter.audience.all': 'Toutes audiences',
  'admin.testimonials.filter.audience.owner': 'Propriétaires',
  'admin.testimonials.filter.audience.student': 'Étudiants',
  'admin.testimonials.filter.status.all': 'Tous statuts',
  'admin.testimonials.filter.status.published': 'Publiés',
  'admin.testimonials.filter.status.draft': 'Brouillons',
  'admin.testimonials.new.title': 'Nouveau témoignage',
  'admin.testimonials.new.lead':
    'Crée une citation à partir d\'un retour réel collecté par WhatsApp ou email avec un propriétaire / étudiant.',
  'admin.testimonials.edit.title': 'Éditer le témoignage',
  'admin.testimonials.edit.lead':
    'Les modifications sont visibles publiquement après revalidation (jusqu\'à 5 min de cache).',
  'admin.testimonials.form.audience.label': 'Audience',
  'admin.testimonials.form.audience.owner': 'Propriétaire',
  'admin.testimonials.form.audience.student': 'Étudiant',
  'admin.testimonials.form.authorName.label': 'Nom affiché',
  'admin.testimonials.form.authorName.placeholder': 'Andry R. ou Maison Rasoa',
  'admin.testimonials.form.authorMeta.label': 'Sous-ligne (optionnel)',
  'admin.testimonials.form.authorMeta.placeholder':
    '3 logements vérifiés · Andrainjato',
  'admin.testimonials.form.authorMeta.help':
    'Apparaît en petit sous le nom. Idéal pour le contexte (rôle, quartier, ancienneté).',
  'admin.testimonials.form.body.label': 'Citation',
  'admin.testimonials.form.body.placeholder':
    'Mon studio loué en 4 jours. Et zéro paperasse côté AryTrano.',
  'admin.testimonials.form.body.charCount': '{count}/{max} caractères',
  'admin.testimonials.form.sortOrder.label': 'Ordre',
  'admin.testimonials.form.sortOrder.help':
    'Plus petit = plus haut sur la landing. 0 par défaut. Utile pour épingler une citation hero.',
  'admin.testimonials.form.publishImmediately.label':
    'Publier immédiatement',
  'admin.testimonials.form.publishImmediately.help':
    'Décoche pour créer en brouillon — tu pourras publier plus tard depuis la liste.',
  'admin.testimonials.form.submit.create': 'Créer',
  'admin.testimonials.form.submit.update': 'Mettre à jour',
  'admin.testimonials.form.submit.pending': 'Enregistrement…',
  'admin.testimonials.row.edit': 'Éditer',
  'admin.testimonials.row.publish': 'Publier',
  'admin.testimonials.row.unpublish': 'Dépublier',
  'admin.testimonials.row.delete': 'Supprimer',
  'admin.testimonials.delete.dialog.title': 'Supprimer ce témoignage ?',
  'admin.testimonials.delete.dialog.body':
    'L\'action est définitive. La citation disparaît de la landing immédiatement.',
  'admin.testimonials.delete.dialog.cancel': 'Annuler',
  'admin.testimonials.delete.dialog.confirm': 'Supprimer',
  'admin.testimonials.toast.published': 'Témoignage publié.',
  'admin.testimonials.toast.unpublished': 'Témoignage dépublié.',
  'admin.testimonials.toast.deleted': 'Témoignage supprimé.',
  'admin.testimonials.toast.error': 'Action impossible. Réessaie.',

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

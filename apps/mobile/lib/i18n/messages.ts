import type { Locale } from '@arytrano/shared'

/**
 * Mobile i18n dictionary.
 *
 * Scope = strings the user actually reads in the mobile app. We do
 * NOT mirror the web's ~1700 keys — most of those drive surfaces the
 * mobile app doesn't (admin moderation, owner dashboard, marketing
 * landing). When a mobile screen needs a new string, add it here in
 * BOTH locales — never default to one language.
 *
 * Conventions :
 *  - keys are dot-notation, scoped by screen (`onboarding.slide1.title`)
 *  - placeholders use `{name}` syntax — the translator inlines them
 *  - both locales must have every key; we type-check this at compile
 *    time via the `Messages` type below
 */

export const messages = {
  'fr-MG': {
    'common.appName': 'AryTrano',
    'common.back': '← Retour',
    'common.loading': 'Chargement…',
    'common.continue': 'Continuer',
    'common.skip': 'Passer',
    'common.cancel': 'Annuler',
    'common.retry': 'Réessayer',
    'common.signIn': 'Se connecter',
    'common.signUp': 'Créer un compte',
    'common.profile': 'Profil',

    'home.greeting': 'Trouve ton logement étudiant',
    'home.empty.title': 'Aucune annonce pour le moment',
    'home.empty.lead':
      "On publie une dizaine d'annonces par mois. Reviens bientôt.",
    'home.empty.filtered.title': 'Aucune annonce ne correspond',
    'home.empty.filtered.lead':
      "Essaie d'élargir les filtres ou efface-les pour voir tout le catalogue.",
    'home.error.title': 'Connexion impossible',
    'home.error.lead':
      'Vérifie ta connexion et tire vers le bas pour réessayer.',
    'home.filters.label': 'Filtres :',
    'home.filters.clear': 'Effacer',
    'home.filters.priceMax': 'jusqu’à {amount} Ar',

    'onboarding.slide1.title': 'Trouve ton logement',
    'onboarding.slide1.body':
      'Studios, chambres et appartements à Madagascar, dans les meilleurs quartiers étudiants.',
    'onboarding.slide2.title': 'Contact direct',
    'onboarding.slide2.body':
      'Aucun intermédiaire. Tu parles directement au propriétaire via WhatsApp ou téléphone.',
    'onboarding.slide3.title': 'Vérifié, gratuit',
    'onboarding.slide3.body':
      'Les annonces sont contrôlées par notre équipe. Aucune commission, aucun frais caché.',
    'onboarding.locale.title': 'Tu préfères en quelle langue ?',
    'onboarding.locale.fr': 'Français',
    'onboarding.locale.mg': 'Malagasy',
    'onboarding.cta.browse': 'Voir les annonces',
    'onboarding.cta.signIn': 'J\'ai déjà un compte',
    'onboarding.slide.progress': 'Diapositive {current} sur {total}',

    'signIn.title': 'Connexion',
    'signIn.lead': 'Retrouve tes recherches sauvegardées et tes favoris.',
    'signIn.field.email': 'Email',
    'signIn.field.password': 'Mot de passe',
    'signIn.cta': 'Se connecter',
    'signIn.noAccount': 'Pas encore de compte ?',
    'signIn.createAccount': 'Créer un compte',
    'signIn.error.invalid': 'Email ou mot de passe incorrect.',
    'signIn.error.network': 'Connexion impossible. Réessaie.',

    'signUp.title': 'Créer un compte',
    'signUp.lead':
      'Sauve tes recherches, marque tes favoris, contacte les propriétaires.',
    'signUp.field.name': 'Prénom',
    'signUp.field.email': 'Email',
    'signUp.field.password': 'Mot de passe',
    'signUp.field.passwordHelper': 'Au moins 8 caractères',
    'signUp.cta': 'Créer mon compte',
    'signUp.haveAccount': 'Déjà un compte ?',
    'signUp.signIn': 'Se connecter',
    'signUp.error.exists': 'Un compte avec cet email existe déjà.',
    'signUp.error.network': 'Inscription impossible. Réessaie.',

    'profile.title': 'Mon profil',
    'profile.row.savedSearches': 'Recherches sauvegardées',
    'profile.row.leases': 'Mes baux',
    'profile.row.favorites': 'Mes favoris',
    'profile.row.settings': 'Paramètres du compte',
    'profile.logout': 'Se déconnecter',
    'profile.logout.confirm.title': 'Se déconnecter',
    'profile.logout.confirm.body': 'Tu pourras te reconnecter à tout moment.',
    'profile.comingSoon.title': 'Bientôt',
    'profile.comingSoon.body': 'Ce flow arrive dans la prochaine version.',

    'favorites.title': 'Mes favoris',
    'favorites.empty.title': 'Aucun favori pour le moment',
    'favorites.empty.lead':
      'Tape sur le cœur sur une annonce pour la garder ici.',
    'favorites.added': 'Ajouté aux favoris',
    'favorites.removed': 'Retiré des favoris',
    'favorites.action.add': 'Ajouter aux favoris',
    'favorites.action.remove': 'Retirer des favoris',
    'favorites.error': 'Action impossible. Réessaie.',

    'savedSearches.title': 'Recherches sauvegardées',
    'savedSearches.empty.title': 'Aucune recherche sauvegardée',
    'savedSearches.empty.lead':
      'Sauve une recherche depuis le site pour la retrouver ici et activer les alertes.',
    'savedSearches.allListings': 'Toutes les annonces',
    'savedSearches.run': 'Lancer',
    'savedSearches.alerts.on': 'Alertes activées',
    'savedSearches.alerts.off': 'Alertes désactivées',
    'savedSearches.delete': 'Supprimer',
    'savedSearches.delete.confirm.title': 'Supprimer cette recherche ?',
    'savedSearches.delete.confirm.body':
      'Tu ne recevras plus d\'alertes pour ce filtre.',
    'savedSearches.error': 'Action impossible. Réessaie.',

    'listing.detail.type.ROOM': 'Chambre',
    'listing.detail.type.STUDIO': 'Studio',
    'listing.detail.type.APARTMENT': 'Appartement',
    'listing.detail.type.HOUSE': 'Maison',
    'listing.detail.verified': '✓ Annonce vérifiée',
    'listing.detail.stat.surface': 'Surface',
    'listing.detail.stat.bedrooms': 'Chambres',
    'listing.detail.stat.bathrooms': 'Salles de bain',
    'listing.detail.stat.furnished': 'Meublé',
    'listing.detail.stat.yes': 'Oui',
    'listing.detail.stat.no': 'Non',
    'listing.detail.description': 'Description',
    'listing.detail.amenities': 'Équipements',
    'listing.detail.contact.whatsapp': 'WhatsApp',
    'listing.detail.contact.phone': 'Appeler',
    'listing.detail.video.cta': 'Visite vidéo',
    'listing.detail.contact.errorTitle': 'Erreur',
    'listing.detail.contact.errorBody':
      'Impossible de récupérer le contact.',
    'listing.detail.contact.whatsappMissing':
      "WhatsApp n'est pas installé sur cet appareil.",
    'listing.detail.owner.createLease': 'Créer un bail',
    'listing.detail.interest.cta': 'Je suis intéressé(e)',
    // E-T28 mobile — concierge lead funnel
    'lead.form.title': 'Demande de visite',
    'lead.form.subtitle':
      'Un opérateur AryTrano te recontacte sous 24h pour fixer la visite.',
    'lead.form.name': 'Ton prénom',
    'lead.form.phone': 'Numéro de téléphone',
    'lead.form.phone.help': 'On t’enverra un code de vérification.',
    'lead.form.budget': 'Budget mensuel (Ar)',
    'lead.form.moveIn': 'Disponibilité',
    'lead.form.moveIn.IMMEDIATE': 'Immédiatement',
    'lead.form.moveIn.WITHIN_2_WEEKS': 'Dans 2 semaines',
    'lead.form.moveIn.WITHIN_1_MONTH': 'Dans 1 mois',
    'lead.form.moveIn.LATER': 'Plus tard',
    'lead.form.notes': 'Message (optionnel)',
    'lead.form.budgetConfirmed': 'Je confirme mon budget',
    'lead.form.submit': 'Envoyer la demande',
    'lead.form.submitting': 'Envoi…',
    'lead.otp.title': 'Vérifie ton numéro',
    'lead.otp.subtitle':
      'On t’a envoyé un code à 6 chiffres par SMS. Saisis-le pour confirmer.',
    'lead.otp.code': 'Code à 6 chiffres',
    'lead.otp.verify': 'Vérifier',
    'lead.otp.resend': 'Renvoyer le code',
    'lead.otp.resending': 'Envoi…',
    'lead.success.title': 'Demande envoyée !',
    'lead.success.subtitle':
      'L’équipe AryTrano te recontacte sous 24h. Garde ton téléphone à portée.',
    'lead.success.back': 'Retour à l’annonce',
    'lead.error.generic':
      'Impossible d’envoyer la demande. Réessaie dans un instant.',
    'lead.error.rateLimited': 'Trop d’essais. Réessaie dans une heure.',
    'lease.tenant.error.checkoutOpen':
      "Impossible d'ouvrir le checkout. Vérifie ta connexion puis réessaye.",
    'listing.detail.notFound.title': 'Annonce introuvable',
    'listing.detail.notFound.lead':
      "Le lien est peut-être expiré ou l'annonce a été retirée.",
    'listing.detail.noPhoto': 'Aucune photo',
    'listing.detail.photo.counter': 'Photo {current} sur {total}',
    'listing.detail.owner.verified': 'Identité vérifiée',
    'listing.detail.owner.role': 'Propriétaire',

    'listing.amenity.WIFI': 'Wi-Fi',
    'listing.amenity.PARKING': 'Parking voiture',
    'listing.amenity.MOTO_PARKING': 'Parking moto',
    'listing.amenity.HOT_WATER': 'Eau chaude',
    'listing.amenity.WATER_TANK': 'Réservoir d’eau',
    'listing.amenity.GENERATOR': 'Groupe électrogène',
    'listing.amenity.AIR_CONDITIONING': 'Climatisation',
    'listing.amenity.KITCHEN_EQUIPPED': 'Cuisine équipée',
    'listing.amenity.WASHING_MACHINE': 'Machine à laver',
    'listing.amenity.GUARD': 'Gardien',
    'listing.amenity.SECURITY_GATE': 'Portail sécurisé',
    'listing.amenity.TERRACE': 'Terrasse',
    'listing.amenity.BALCONY': 'Balcon',
    'listing.amenity.GARDEN': 'Jardin',
    'listing.amenity.FURNISHED_KITCHEN': 'Cuisine meublée',
    'listing.amenity.PUBLIC_TRANSPORT': 'Transports en commun',

    'units.ariaryPerMonth': '{amount} ariary par mois',
    'units.perMonth': 'Ar / mois',

    // Leases (E-T22 mobile)
    'lease.list.title': 'Mes baux',
    'lease.list.empty.title': 'Aucun bail pour l\'instant.',
    'lease.list.empty.lead':
      'Un propriétaire t\'inviteras ici quand un contrat sera prêt à signer.',
    'lease.list.role.owner': 'Propriétaire',
    'lease.list.role.tenant': 'Locataire',
    'lease.list.row.openCta': 'Voir le bail',
    'lease.status.DRAFT': 'Brouillon',
    'lease.status.PENDING_TENANT': 'En attente de ta signature',
    'lease.status.ACTIVE': 'Actif',
    'lease.status.REFUSED': 'Refusé',
    'lease.status.TERMINATED': 'Terminé',
    'lease.status.DISPUTED': 'En litige',
    'lease.detail.title': 'Détail du bail',
    'lease.detail.parties.owner': 'Propriétaire',
    'lease.detail.parties.tenant': 'Locataire',
    'lease.detail.terms.startDate': 'Date de début',
    'lease.detail.terms.duration': 'Durée',
    'lease.detail.terms.months': '{count} mois',
    'lease.detail.terms.monthlyRent': 'Loyer mensuel',
    'lease.detail.terms.caution': 'Caution',
    'lease.tenant.cta.accept': 'Accepter et signer',
    'lease.tenant.cta.refuse': 'Refuser',
    'lease.tenant.refuse.reason.label': 'Raison du refus (optionnel)',
    'lease.tenant.refuse.reason.placeholder':
      'Ex : conditions différentes',
    'lease.tenant.refuse.confirm': 'Confirmer le refus',
    'lease.tenant.outcome.signed': 'Bail accepté. Tu peux fermer l\'app.',
    'lease.tenant.outcome.refused': 'Bail refusé.',
    'lease.tenant.error.generic':
      'Erreur — vérifie ta connexion et réessaie.',
  },
  mg: {
    'common.appName': 'AryTrano',
    'common.back': '← Hiverina',
    'common.loading': 'Mizotra…',
    'common.continue': 'Tohizo',
    'common.skip': 'Lalovana',
    'common.cancel': 'Hialana',
    'common.retry': 'Andramo indray',
    'common.signIn': 'Hiditra',
    'common.signUp': 'Hamorona kaonty',
    'common.profile': 'Mombamomba',

    'home.greeting': 'Mahita ny toerana fonenanao',
    'home.empty.title': 'Tsy misy filazana amin\'izao fotoana izao',
    'home.empty.lead':
      'Manoratra filazana am-polony isam-bolana izahay. Miverena tsy ho ela.',
    'home.empty.filtered.title': 'Tsy misy filazana mifanaraka',
    'home.empty.filtered.lead':
      'Halefao ny sivana na fafao mba hijery ny filazana rehetra.',
    'home.error.title': 'Tsy mety mifandray',
    'home.error.lead':
      'Jereo ny fifandraisananao ary sintony midina hanandramana indray.',
    'home.filters.label': 'Sivana :',
    'home.filters.clear': 'Fafao',
    'home.filters.priceMax': 'hatramin\'ny {amount} Ar',

    'onboarding.slide1.title': 'Mitady toerana fonenana',
    'onboarding.slide1.body':
      'Studio, efitra, ary trano ao Madagasikara, ao amin\'ny faritra tsara indrindra ho an\'ny mpianatra.',
    'onboarding.slide2.title': 'Mifandray mivantana',
    'onboarding.slide2.body':
      'Tsy misy mpanelanelana. Miresaka mivantana amin\'ny tompony amin\'ny WhatsApp na finday ianao.',
    'onboarding.slide3.title': 'Voamarina, maimaim-poana',
    'onboarding.slide3.body':
      'Voadiniky ny ekipanay ny filazana. Tsy misy karama, tsy misy saran-tsoratra miafina.',
    'onboarding.locale.title': 'Inona no fiteny tianao ?',
    'onboarding.locale.fr': 'Frantsay',
    'onboarding.locale.mg': 'Malagasy',
    'onboarding.cta.browse': 'Hijery ny filazana',
    'onboarding.cta.signIn': 'Manana kaonty aho',
    'onboarding.slide.progress': 'Pejy {current} amin\'ny {total}',

    'signIn.title': 'Hiditra',
    'signIn.lead':
      'Hahita indray ny fitadiavana voatahiry sy ny tianao ianao.',
    'signIn.field.email': 'Mailaka',
    'signIn.field.password': 'Tenimiafina',
    'signIn.cta': 'Hiditra',
    'signIn.noAccount': 'Mbola tsy manana kaonty ?',
    'signIn.createAccount': 'Hamorona kaonty',
    'signIn.error.invalid': 'Diso ny mailaka na tenimiafina.',
    'signIn.error.network': 'Tsy mety. Andramo indray.',

    'signUp.title': 'Hamorona kaonty',
    'signUp.lead':
      'Tahirizo ny fitadiavanao, mariho ny tianao, mifandraisa amin\'ny tompon-trano.',
    'signUp.field.name': 'Anarana',
    'signUp.field.email': 'Mailaka',
    'signUp.field.password': 'Tenimiafina',
    'signUp.field.passwordHelper': '8 mari-pamantarana fara-fahakeliny',
    'signUp.cta': 'Hamorona ny kaontiko',
    'signUp.haveAccount': 'Efa manana kaonty ?',
    'signUp.signIn': 'Hiditra',
    'signUp.error.exists': 'Efa misy kaonty amin\'io mailaka io.',
    'signUp.error.network': 'Tsy mety. Andramo indray.',

    'profile.title': 'Mombamomba ahy',
    'profile.row.savedSearches': 'Fitadiavana voatahiry',
    'profile.row.leases': 'Ireo bail-ko',
    'profile.row.favorites': 'Ny tiako',
    'profile.row.settings': 'Fandrindrana kaonty',
    'profile.logout': 'Hivoaka',
    'profile.logout.confirm.title': 'Hivoaka',
    'profile.logout.confirm.body':
      'Azonao atao ny miverina hiditra amin\'ny fotoana rehetra.',
    'profile.comingSoon.title': 'Tsy ho ela',
    'profile.comingSoon.body':
      'Ho avy amin\'ny dingana manaraka ity asa ity.',

    'favorites.title': 'Ny tiako',
    'favorites.empty.title': 'Tsy mbola misy tianao',
    'favorites.empty.lead':
      'Tsindrio ny fo amin\'ny filazana iray hitahirizana azy eto.',
    'favorites.added': 'Voapetraka amin\'ny tiana',
    'favorites.removed': 'Voaesotra amin\'ny tiana',
    'favorites.action.add': 'Ampio amin\'ny tiana',
    'favorites.action.remove': 'Esory amin\'ny tiana',
    'favorites.error': 'Tsy mety. Andramo indray.',

    'savedSearches.title': 'Fitadiavana voatahiry',
    'savedSearches.empty.title': 'Tsy misy fitadiavana voatahiry',
    'savedSearches.empty.lead':
      'Tahirizo fitadiavana iray amin\'ny site mba hahitana azy eto sy hampandeha ny fanairana.',
    'savedSearches.allListings': 'Ny filazana rehetra',
    'savedSearches.run': 'Alefa',
    'savedSearches.alerts.on': 'Mavitrika ny fanairana',
    'savedSearches.alerts.off': 'Voasakana ny fanairana',
    'savedSearches.delete': 'Esorina',
    'savedSearches.delete.confirm.title': 'Esorina ity fitadiavana ity ?',
    'savedSearches.delete.confirm.body':
      'Tsy handray fanairana intsony ho an\'ity sivana ity ianao.',
    'savedSearches.error': 'Tsy mety. Andramo indray.',

    'listing.detail.type.ROOM': 'Efitra',
    'listing.detail.type.STUDIO': 'Studio',
    'listing.detail.type.APARTMENT': 'Trano fonenana',
    'listing.detail.type.HOUSE': 'Trano',
    'listing.detail.verified': '✓ Filazana voamarina',
    'listing.detail.stat.surface': 'Velarana',
    'listing.detail.stat.bedrooms': 'Efitra',
    'listing.detail.stat.bathrooms': 'Efitrano fandroana',
    'listing.detail.stat.furnished': 'Misy fanaka',
    'listing.detail.stat.yes': 'Eny',
    'listing.detail.stat.no': 'Tsia',
    'listing.detail.description': 'Famaritana',
    'listing.detail.amenities': 'Fitaovana',
    'listing.detail.contact.whatsapp': 'WhatsApp',
    'listing.detail.contact.phone': 'Antso',
    'listing.detail.video.cta': 'Horonan-tsary',
    'listing.detail.contact.errorTitle': 'Hadisoana',
    'listing.detail.contact.errorBody': 'Tsy nahazo ny kontaka.',
    'listing.detail.contact.whatsappMissing':
      "Tsy voapetraka eto ny WhatsApp.",
    'listing.detail.owner.createLease': 'Mamorona bail',
    'listing.detail.interest.cta': 'Mahaliana ahy',
    // E-T28 mobile — concierge lead funnel (MG)
    'lead.form.title': 'Hangataka famangiana',
    'lead.form.subtitle':
      'Ho antsoin\'ny AryTrano ianao ao anatin\'ny 24 ora hanaovana fotoana.',
    'lead.form.name': 'Anaranao',
    'lead.form.phone': 'Laharan-tariby',
    'lead.form.phone.help': 'Handefasanay kaody fanamarinana ho anao.',
    'lead.form.budget': 'Tetibola isam-bolana (Ar)',
    'lead.form.moveIn': 'Vonona rahoviana ?',
    'lead.form.moveIn.IMMEDIATE': 'Avy hatrany',
    'lead.form.moveIn.WITHIN_2_WEEKS': 'Anatin\'ny 2 herinandro',
    'lead.form.moveIn.WITHIN_1_MONTH': 'Anatin\'ny 1 volana',
    'lead.form.moveIn.LATER': 'Aoriana kokoa',
    'lead.form.notes': 'Hafatra (azo ialana)',
    'lead.form.budgetConfirmed': 'Manamafy ny tetibolako aho',
    'lead.form.submit': 'Alefa ny fangatahana',
    'lead.form.submitting': 'Alefa…',
    'lead.otp.title': 'Hamarino ny laharanao',
    'lead.otp.subtitle':
      'Nandefa kaody 6 marika tamin\'ny SMS izahay. Soraty mba hamaranana.',
    'lead.otp.code': 'Kaody 6 marika',
    'lead.otp.verify': 'Hamarino',
    'lead.otp.resend': 'Mandefasa kaody indray',
    'lead.otp.resending': 'Alefa…',
    'lead.success.title': 'Voaray ny fangatahana !',
    'lead.success.subtitle':
      'Hifandray aminao ny AryTrano ao anatin\'ny 24 ora. Tano akaiky ny finao.',
    'lead.success.back': 'Hiverina amin\'ny filazana',
    'lead.error.generic':
      'Tsy afaka mandefa ny fangatahana. Andramo indray.',
    'lead.error.rateLimited': 'Be loatra ny andrana. Andramo ao anatin\'ny ora iray.',
    'lease.tenant.error.checkoutOpen':
      'Tsy afaka manokatra ny checkout. Hamarino ny fifandraisanao dia andramo indray.',
    'listing.detail.notFound.title': 'Tsy hita ny filazana',
    'listing.detail.notFound.lead':
      'Mety tapitra ny rohy na nesorina ny filazana.',
    'listing.detail.noPhoto': 'Tsy misy sary',
    'listing.detail.photo.counter': 'Sary {current} amin\'ny {total}',
    'listing.detail.owner.verified': 'Voamarina ny mombamomba',
    'listing.detail.owner.role': 'Tompon-trano',

    'listing.amenity.WIFI': 'Wi-Fi',
    'listing.amenity.PARKING': 'Toeram-pijanonan-tsarety',
    'listing.amenity.MOTO_PARKING': 'Toeram-pijanonana môtô',
    'listing.amenity.HOT_WATER': 'Rano mafana',
    'listing.amenity.WATER_TANK': 'Tahirin-drano',
    'listing.amenity.GENERATOR': 'Milina herinaratra',
    'listing.amenity.AIR_CONDITIONING': 'Fitaovam-pampangatsiakana',
    'listing.amenity.KITCHEN_EQUIPPED': 'Lakozia feno fitaovana',
    'listing.amenity.WASHING_MACHINE': 'Milina manasa lamba',
    'listing.amenity.GUARD': 'Mpiambina',
    'listing.amenity.SECURITY_GATE': 'Vavahady miaro',
    'listing.amenity.TERRACE': 'Tokotany',
    'listing.amenity.BALCONY': 'Balkôny',
    'listing.amenity.GARDEN': 'Zaridaina',
    'listing.amenity.FURNISHED_KITCHEN': 'Lakozia misy fanaka',
    'listing.amenity.PUBLIC_TRANSPORT': 'Fitaterana iombonana',

    'units.ariaryPerMonth': '{amount} ariary isam-bolana',
    'units.perMonth': 'Ar / volana',

    // Leases (E-T22 mobile)
    'lease.list.title': 'Ireo bail-ko',
    'lease.list.empty.title': 'Mbola tsy misy bail.',
    'lease.list.empty.lead':
      'Hampiantsoina ato ianao raha vao misy fifanarahana hosoniavina.',
    'lease.list.role.owner': 'Tompon-trano',
    'lease.list.role.tenant': 'Mpanofa',
    'lease.list.row.openCta': 'Jereo ny bail',
    'lease.status.DRAFT': 'Bilan-kevitra',
    'lease.status.PENDING_TENANT': 'Miandry ny soniavinao',
    'lease.status.ACTIVE': 'Mavitrika',
    'lease.status.REFUSED': 'Nolavina',
    'lease.status.TERMINATED': 'Vita',
    'lease.status.DISPUTED': 'Misy disadisa',
    'lease.detail.title': 'Antsipirian\'ny bail',
    'lease.detail.parties.owner': 'Tompon-trano',
    'lease.detail.parties.tenant': 'Mpanofa',
    'lease.detail.terms.startDate': 'Daty fanombohana',
    'lease.detail.terms.duration': 'Faharetana',
    'lease.detail.terms.months': '{count} volana',
    'lease.detail.terms.monthlyRent': 'Hofa isam-bolana',
    'lease.detail.terms.caution': 'Antoka',
    'lease.tenant.cta.accept': 'Manaiky sy hanao sonia',
    'lease.tenant.cta.refuse': 'Mandà',
    'lease.tenant.refuse.reason.label': 'Antony fandavana (azo halefa)',
    'lease.tenant.refuse.reason.placeholder':
      'Oh : tsy mitovy ny fepetra',
    'lease.tenant.refuse.confirm': 'Hamafiso ny fandavana',
    'lease.tenant.outcome.signed':
      'Voaray ny bail. Azonao akatona ny app.',
    'lease.tenant.outcome.refused': 'Nolavina ny bail.',
    'lease.tenant.error.generic':
      'Hadisoana — jereo ny tambajotranao dia andramo indray.',
  },
} as const satisfies Record<Locale, Record<string, string>>

export type MessageKey = keyof (typeof messages)['fr-MG']

/**
 * Translator factory — returns a function that resolves a key against
 * the given locale, with optional `{var}` interpolation. Falling back
 * to the FR key when MG is missing keeps the app resilient to partial
 * translations during development.
 */
export type Translator = (
  key: MessageKey,
  vars?: Record<string, string | number>,
) => string

export function buildTranslator(locale: Locale): Translator {
  const dict = messages[locale]
  const fallback = messages['fr-MG']
  return (key, vars) => {
    const raw = dict[key] ?? fallback[key] ?? key
    if (!vars) return raw
    return raw.replace(/\{(\w+)\}/g, (_, name) =>
      name in vars ? String(vars[name]) : `{${name}}`,
    )
  }
}

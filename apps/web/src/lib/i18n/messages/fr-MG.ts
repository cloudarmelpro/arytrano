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
  'common.cancel': 'Annuler',

  // Lease wizard + detail (E-T26)
  'lease.wizard.eyebrow': 'Bail',
  'lease.wizard.title': 'Signer un bail avec ton locataire',
  'lease.wizard.lead':
    'Renseigne les infos du bail pour « {listing} ». Après ton paiement, ton locataire reçoit une invitation pour signer à son tour.',
  'lease.wizard.progress': 'Étape {current} sur {total}',
  'lease.wizard.feeRecap.label': 'Récapitulatif des frais',
  'lease.wizard.step1.title': 'Le locataire',
  'lease.wizard.step1.help':
    'Indique l’email du compte AryTrano du locataire — s’il n’en a pas, demande-lui de s’inscrire d’abord sur arytrano.com.',
  'lease.wizard.step2.title': 'Les conditions',
  'lease.wizard.step2.help':
    'Loyer mensuel, caution, date de début et durée. La caution reste due au propriétaire — AryTrano ne la garde pas.',
  'lease.wizard.step3.title': 'Récapitulatif et paiement',
  'lease.wizard.step3.help':
    'Tu vas être redirigé vers GoalPay pour payer les frais de signature AryTrano de l’annonce « {listing} ».',
  'lease.fields.tenantEmail': 'Email du locataire',
  'lease.fields.tenantEmail.help':
    'Le locataire doit déjà avoir un compte AryTrano avec cet email.',
  'lease.fields.monthlyRent': 'Loyer mensuel (Ar)',
  'lease.fields.monthlyRent.help':
    'Montant que le locataire te paie chaque mois. AryTrano ne prend aucune commission sur le loyer.',
  'lease.fields.caution': 'Caution (Ar)',
  'lease.fields.caution.help':
    'Montant de la caution. Mets 0 si tu n’en prends pas. Une commission de 8% s’applique sur ce montant.',
  'lease.fields.startDate': 'Date de début',
  'lease.fields.startDate.help':
    'À partir d’aujourd’hui ; format JJ/MM/AAAA.',
  'lease.fields.durationMonths': 'Durée (mois)',
  'lease.fields.durationMonths.help': 'Maximum 60 mois (5 ans).',
  'lease.caution.derived.none': 'Aucune caution sur cette annonce',
  'lease.caution.derived.half': '½ mois × loyer',
  'lease.caution.derived.months': '{count} mois × loyer',
  'lease.fees.signature': 'Frais de signature AryTrano',
  'lease.fees.commission': 'Commission caution (8%)',
  'lease.fees.total': 'Total à payer maintenant',
  'lease.cta.payAndSign': 'Payer et signer',
  'lease.cta.loading': 'Initialisation du paiement…',
  'lease.cta.create': 'Créer le bail',
  'lease.cta.creating': 'Création du bail…',
  'lease.cta.microcopy':
    'Tu ne paies rien. Le locataire paie 20% du loyer à AryTrano au moment où il accepte.',
  'lease.fees.platform.label': 'Le locataire paiera à AryTrano',
  'lease.fees.platform.help':
    'Frais AryTrano : 20% du loyer mensuel, dûs par le locataire à la signature. Toi tu ne paies rien.',

  // Lease list (/dashboard/leases)
  'lease.list.eyebrow': 'Mes baux',
  'lease.list.title': 'Tes baux sur AryTrano',
  'lease.list.empty.title': 'Aucun bail pour l’instant.',
  'lease.list.empty.body':
    'Quand tu signes un bail avec un locataire, il apparaît ici. Tu peux démarrer un nouveau bail depuis la page d’une annonce publiée.',
  'lease.list.row.asOwner': 'Propriétaire',
  'lease.list.row.asTenant': 'Locataire',
  'lease.list.row.owner': 'Propriétaire : {name}',
  'lease.list.row.tenant': 'Locataire : {name}',
  'lease.list.row.perMonth': '/mois',

  // Lease detail (/dashboard/leases/[id])
  'lease.detail.eyebrow': 'Bail',
  'lease.detail.field.monthlyRent': 'Loyer mensuel',
  'lease.detail.field.caution': 'Caution',
  'lease.detail.field.startDate': 'Date de début',
  'lease.detail.field.duration': 'Durée',
  'lease.detail.field.durationValue': '{count} mois',
  'lease.detail.parties.title': 'Parties au bail',
  'lease.detail.parties.owner': 'Propriétaire',
  'lease.detail.parties.tenant': 'Locataire',
  'lease.detail.signedAt': 'A signé',
  'lease.detail.reference': 'Réf {ref}',
  'lease.detail.you': 'toi',
  'lease.detail.financial.title': 'Récapitulatif financier',
  'lease.detail.financial.platformFee': 'Frais AryTrano (20% du loyer)',
  'lease.detail.financial.platformFee.tenantPays':
    'Tu paies ce montant à AryTrano à l’acceptation. Le loyer + la caution sont versés directement au propriétaire (hors AryTrano).',
  'lease.detail.financial.platformFee.ownerInfo':
    'Le locataire paiera ce montant à AryTrano à l’acceptation. Toi tu ne paies rien.',
  'lease.detail.financial.timing': 'Durée {months} mois · Début {date}',
  'lease.detail.signedOn': 'Signé le {date}',
  'lease.detail.pendingAction': 'En attente d’action',
  'lease.detail.statusNext.PENDING_TENANT.tenant':
    'Accepte et paie les frais AryTrano pour activer le bail.',
  'lease.detail.statusNext.PENDING_TENANT.owner':
    'On attend que ton locataire accepte et règle les frais AryTrano.',
  'lease.detail.statusNext.ACTIVE': 'Bail actif. Bonne installation.',
  'lease.detail.statusNext.REFUSED.owner':
    'Le bail n’a pas abouti. Tu peux relancer une autre invitation depuis ton annonce.',
  'lease.detail.statusNext.REFUSED.tenant':
    'Ce bail n’a pas abouti. Continue ta recherche sur AryTrano.',
  'lease.detail.statusNext.TERMINATED': 'Le bail s’est terminé naturellement.',
  'lease.detail.statusNext.DISPUTED': 'Un litige est ouvert sur ce bail.',
  'lease.detail.statusNext.DRAFT': 'Brouillon — pas encore envoyé au locataire.',
  'lease.detail.active.cta.tenant': 'Continuer ma recherche',
  'lease.detail.active.cta.owner': 'Voir mes annonces',
  'lease.detail.refused.cta.tenant': 'Voir d’autres annonces',
  'lease.detail.refused.cta.owner': 'Voir mes annonces',

  // Tenant action area on the detail page
  'lease.tenant.title': 'Un propriétaire t’invite à signer',
  'lease.tenant.help':
    'Vérifie les conditions ci-dessus. Si tout est correct, accepte le bail pour le rendre actif.',
  'lease.tenant.cta.accept': 'Accepter et signer',
  'lease.tenant.cta.acceptAndPay': 'Accepter et payer {amount}',
  'lease.tenant.cta.refuse': 'Refuser',
  'lease.tenant.refuse.reason.label': 'Raison du refus (optionnel)',
  'lease.tenant.refuse.reason.placeholder':
    'Ex : conditions différentes de l’accord verbal',
  'lease.tenant.refuse.confirm': 'Confirmer le refus',
  'lease.tenant.outcome.signed': 'Bail accepté. Mise à jour de la page…',
  'lease.tenant.outcome.refused': 'Bail refusé. Mise à jour de la page…',
  'lease.owner.waiting':
    '{name} doit accepter ce bail pour qu’il devienne actif. Tu seras notifié à la signature.',
  'lease.owner.cancel.cta': 'Annuler ce bail',
  'lease.owner.cancel.warning':
    'L’annulation libère l’annonce. Le frais de signature est non-refundable de principe — notre équipe examinera ton cas et te recontactera si un geste commercial s’applique.',
  'lease.owner.cancel.reason.label': 'Raison de l’annulation (optionnel)',
  'lease.owner.cancel.reason.placeholder':
    'Ex : locataire injoignable, j’ai trouvé un autre candidat…',
  'lease.owner.cancel.reason.help':
    'Visible par l’admin AryTrano uniquement, jamais par le locataire.',
  'lease.owner.cancel.confirm': 'Confirmer l’annulation',
  'lease.owner.cancel.outcome':
    'Bail annulé. L’annonce redevient disponible. Mise à jour de la page…',

  // Lease status badge labels
  'lease.status.DRAFT': 'Brouillon',
  'lease.status.PENDING_TENANT': 'En attente locataire',
  'lease.status.ACTIVE': 'Actif',
  'lease.status.REFUSED': 'Refusé',
  'lease.status.TERMINATED': 'Terminé',
  'lease.status.DISPUTED': 'Litige',

  // Server Action + REST handler error messages (A6 audit fix)
  'lease.error.notAuthenticated': 'Non authentifié.',
  'lease.error.ownerOnly': 'Seuls les propriétaires peuvent signer un bail.',
  'lease.error.rateLimit':
    'Trop de demandes de bail. Réessaie dans une heure.',
  'lease.error.invalidFields': 'Champs invalides.',
  'lease.error.listingNotFound': 'Annonce introuvable.',
  'lease.error.listingNotOwned':
    'Tu n’es pas le propriétaire de cette annonce.',
  'lease.error.listingNotRentable':
    'Cette annonce n’est pas disponible à la signature (statut : {status}).',
  'lease.error.tenantNotFound':
    'Aucun compte AryTrano avec cet email. Demande à ton locataire de créer un compte sur arytrano.com, puis reviens ici.',
  'lease.error.tenantIsOwner': 'Tu ne peux pas signer un bail avec toi-même.',
  'lease.error.existingLease':
    'Un bail est déjà en cours sur cette annonce (statut : {status}).',
  'lease.error.leaseNotFound': 'Bail introuvable.',
  'lease.error.notTenant': 'Tu n’es pas le locataire désigné sur ce bail.',
  'lease.error.notOwner': 'Tu n’es pas le propriétaire désigné sur ce bail.',
  'lease.error.cannotSign':
    'Ce bail ne peut plus être signé (statut : {status}).',
  'lease.error.cannotRefuse':
    'Ce bail ne peut plus être refusé (statut : {status}).',
  'lease.error.cannotCancel':
    'Ce bail ne peut plus être annulé (statut : {status}).',
  'lease.error.cannotPay':
    'Ce bail ne peut plus être payé (statut : {status}).',
  'lease.error.alreadyPaid':
    'Ce bail est déjà en cours d’activation. Patiente quelques secondes puis recharge la page.',
  'lease.error.payloadTooLarge': 'Charge utile trop volumineuse.',
  'sidebar.myLeases': 'Mes baux',
  'sidebar.section.tenant': 'Locataire',
  'dashboard.editListing.section.lease.title': 'Signer un bail',
  'dashboard.editListing.section.lease.lead':
    'Tu as trouvé un locataire ? Formalise le bail sur AryTrano pour activer le Contrat AryTrano (PDF généré, état des lieux, arbitrage).',
  'dashboard.editListing.section.lease.cta': 'Démarrer un bail',

  // ── Legal pages (placeholder v0.5 — to be reviewed by counsel) ──
  'legal.eyebrow': 'Mentions légales',
  'legal.lastUpdated': 'Dernière mise à jour : {date}',
  'legal.draftNotice':
    'Version provisoire (v0.5). Ce document sera révisé par un conseil juridique avant le lancement officiel. Pour toute question, écris-nous à contact@arytrano.com.',

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

  // /legal/terms-owner — CGU Propriétaire (T-049, 2026-05-29)
  // Texte juridiquement contraignant ; les traductions MG restent indicatives.
  'legal.termsOwner.title': 'Conditions d’utilisation — Propriétaires',
  'legal.termsOwner.preambule.h': 'Préambule',
  'legal.termsOwner.preambule':
    'AryTrano (« la Plateforme ») met en relation des propriétaires souhaitant louer un bien immobilier et des locataires (étudiants, familles) à la recherche d’un logement. En créant un compte propriétaire sur la Plateforme, tu acceptes sans réserve les présentes Conditions Générales d’Utilisation.',
  'legal.termsOwner.s1.h': '1. Acceptation des CGU',
  'legal.termsOwner.s1.body':
    'L’inscription en tant que propriétaire — par formulaire ou via un service tiers (Google, Facebook) — vaut acceptation pleine et entière des présentes Conditions. Tu ne peux pas publier d’annonce ni initier un bail sans avoir préalablement accepté ces CGU.',
  'legal.termsOwner.s2.h': '2. Engagements du propriétaire',
  'legal.termsOwner.s2.body':
    'En tant que propriétaire, tu t’engages à :\n• Publier des annonces sincères, exactes et actualisées\n• Fournir des photos réelles du bien proposé\n• Indiquer un loyer et une caution conformes à la réalité du marché\n• Maintenir tes coordonnées (téléphone, email) à jour pour qu’AryTrano puisse te relayer les demandes\n• Répondre aux sollicitations du locataire dans un délai raisonnable une fois la mise en relation effectuée',
  'legal.termsOwner.s3.h': '3. Modèle de mise en relation',
  'legal.termsOwner.s3.body':
    'AryTrano agit en tant qu’intermédiaire : les coordonnées des visiteurs intéressés sont reçues par notre équipe, qui te les transmet après qualification. AryTrano se réserve le droit de filtrer les locataires (sérieux, capacité de paiement présumée) avant transmission.',
  'legal.termsOwner.s4.h': '4. Frais de service AryTrano',
  'legal.termsOwner.s4.body':
    'À la signature du bail, le LOCATAIRE règle à AryTrano une commission égale à 20 % du loyer mensuel. Le loyer mensuel et la caution sont versés directement au propriétaire, en dehors de la Plateforme. Le propriétaire ne paie aucun frais à AryTrano dans le cadre de ce modèle.',
  'legal.termsOwner.s5.h':
    '5. Obligation de transparence — Locations hors plateforme',
  'legal.termsOwner.s5.body':
    'CLAUSE ESSENTIELLE.\n\nLorsqu’un bien est publié sur AryTrano et que le propriétaire conclut un bail avec un locataire trouvé en dehors de la Plateforme (par bouche-à-oreille, par un autre site, ou directement), il s’engage à :\n\na) Notifier AryTrano sous 48 heures après signature du bail externe, depuis son espace propriétaire ou via le WhatsApp AryTrano (+261 33 45 37 686) ;\nb) Dépublier l’annonce sur AryTrano dans le même délai.\n\nÀ défaut, le propriétaire s’engage à verser à AryTrano une indemnité forfaitaire UNIQUE — c’est-à-dire un paiement en une seule fois, et non récurrent — égale à 10 % du loyer mensuel convenu avec le locataire externe. Cette indemnité est due dès lors qu’AryTrano apporte la preuve raisonnable de la conclusion d’un bail externe non déclaré, et que l’annonce était active sur la Plateforme au moment de la conclusion du bail externe. Le règlement intervient sous 30 jours à compter de la notification formelle par AryTrano.\n\nPourquoi cette clause ? Pour préserver l’équité entre les propriétaires qui respectent leurs engagements et ceux qui utiliseraient la visibilité d’AryTrano sans contrepartie.',
  'legal.termsOwner.s6.h': '6. Suspension et résiliation',
  'legal.termsOwner.s6.body':
    'AryTrano peut suspendre ou supprimer le compte d’un propriétaire en cas de non-respect des présentes CGU (notamment l’article 5), d’annonces trompeuses, de comportement discriminatoire, ou de toute pratique contraire au droit malgache. Le propriétaire peut résilier son compte à tout moment depuis /dashboard/settings. Les baux en cours restent valables jusqu’à leur terme.',
  'legal.termsOwner.s7.h': '7. Limitation de responsabilité',
  'legal.termsOwner.s7.body':
    'AryTrano fournit un service de mise en relation. AryTrano n’est pas partie au contrat de bail entre propriétaire et locataire et ne saurait être tenue responsable des dégradations causées par le locataire, des impayés de loyer, ou des litiges entre les parties au bail.',
  'legal.termsOwner.s8.h': '8. Modifications des CGU',
  'legal.termsOwner.s8.body':
    'AryTrano peut modifier les présentes CGU à tout moment. Les propriétaires sont notifiés par email avec un préavis de 15 jours. À défaut d’opposition, l’utilisation continue de la Plateforme vaut acceptation des nouvelles conditions.',
  'legal.termsOwner.s9.h': '9. Loi applicable',
  'legal.termsOwner.s9.body':
    'Les présentes CGU sont régies par le droit malgache. En cas de litige, les parties s’efforcent de trouver une solution amiable avant tout recours juridictionnel. À défaut, les tribunaux de Fianarantsoa sont seuls compétents.',

  // /onboarding/owner/terms — gate (T-049)
  'onboarding.owner.terms.eyebrow': 'Bienvenue · CGU Propriétaire',
  'onboarding.owner.terms.title': 'Avant d’aller plus loin',
  'onboarding.owner.terms.title.named': 'Bienvenue {name}',
  'onboarding.owner.terms.lead':
    'Nos Conditions d’utilisation Propriétaire encadrent la publication des annonces, la mise en relation avec les locataires, et notre modèle de revenu (le locataire paie 20 % du loyer à AryTrano à la signature, toi tu ne paies rien). Une clause mérite ton attention immédiate :',
  'onboarding.owner.terms.highlight.eyebrow': 'Clause clé',
  'onboarding.owner.terms.highlight.title':
    'Si tu loues hors AryTrano sans nous prévenir : pénalité unique de 10 % d’un mois de loyer',
  'onboarding.owner.terms.highlight.body':
    'Si un bien publié sur AryTrano est loué à un locataire trouvé en dehors de la plateforme et que tu ne nous le signales pas sous 48h (depuis ton espace ou via WhatsApp AryTrano), tu nous devras une indemnité forfaitaire unique égale à 10 % du loyer mensuel convenu. C’est un paiement unique — pas une charge récurrente — destiné à préserver l’équité entre les propriétaires honnêtes et les autres.',
  'onboarding.owner.terms.fullTextLink': 'Lire les CGU complètes →',
  'onboarding.owner.terms.checkbox':
    'J’ai lu et j’accepte les Conditions d’utilisation Propriétaire d’AryTrano, y compris la clause de transparence (article 5).',
  'onboarding.owner.terms.cta': 'Accepter et continuer',
  'onboarding.owner.terms.cta.loading': 'Enregistrement…',
  'onboarding.owner.terms.error.checkRequired':
    'Coche la case pour accepter les CGU avant de continuer.',
  'onboarding.owner.terms.error.notOwner':
    'Cette page est réservée aux comptes propriétaire.',

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
    'Conformément à la loi malagasy n°2014-038 relative à la protection des données personnelles, tu peux exercer à tout moment tes droits d’accès, de rectification, d’effacement et de portabilité. Écris à contact@arytrano.com avec une preuve d’identité.',
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
    'Email : contact@arytrano.com. WhatsApp : +261 — à compléter. Pour les questions de protection des données : privacy@arytrano.com.',
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
    'Le lien de désabonnement que tu as cliqué n\'est pas reconnu. Si tu reçois encore des messages, contacte-nous à contact@arytrano.com.',
  'unsubscribe.backHome': 'Retour à AryTrano',

  'footerV3.tagline':
    'Trouve ton logement à Fianarantsoa, sans intermédiaire. Propriétaires vérifiés, contact direct, gratuit pour les étudiants.',
  'footerV3.status.allOperational': 'Tous les services opérationnels',
  'footerV3.col.product': 'Produit',
  'footerV3.col.cities': 'Villes',
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
  'annonces.title': 'Annonces étudiantes',
  // E-T07 : title variantes paramétrées par ville quand ?city= est dans l'URL.
  'annonces.title.city': 'Annonces à {city}',
  'annonces.lead':
    'Chambres, studios et appartements pour étudiants. Annonces postées par les propriétaires — contact direct, pas de commission.',
  'annonces.metaDescription':
    "Trouvez votre logement étudiant à Madagascar : chambres, studios, appartements meublés. Contact direct avec le propriétaire, pas d'intermédiaire.",
  'annonces.metaDescription.city':
    'Trouvez votre logement étudiant à {city} : chambres, studios, appartements meublés. Contact direct avec le propriétaire, pas d\'intermédiaire.',
  'annonces.count.one': '{count} annonce',
  'annonces.count.other': '{count} annonces',
  'annonces.count.hasMore': '(plus disponibles)',
  'annonces.empty.title': "Aucune annonce pour l'instant.",
  'annonces.empty.title.city': "Aucune annonce pour l'instant à {city}.",
  'annonces.map.empty': 'Aucune annonce sur la carte avec ces filtres.',
  // City tabs above the filter row
  'annonces.cityTabs.all': 'Toutes',
  'annonces.cityTabs.aria': 'Filtrer par ville',
  'annonces.cityTabs.eyebrow': 'Ville',
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
  'filters.price.range.aria': 'Plage de prix mensuel',
  'filters.price.from': 'À partir de',
  'filters.price.to': "Jusqu'à",
  'filters.price.unit': 'Ar/mois',
  'filters.price.max.plus': '+',
  'filters.reset': 'Réinitialiser',
  'filters.sidebar.title': 'Filtres',
  'filters.chips.aria': 'Filtres actifs',
  'filters.chips.remove': 'Retirer ce filtre',
  'filters.chips.removeNamed': 'Retirer le filtre {filter}',
  'filters.chips.clearAll': 'Tout effacer',
  'annonces.search.aria': 'Affiner la recherche',
  'annonces.search.city.label': 'Ville',
  'annonces.search.city.all': 'Toutes les villes',
  'annonces.search.quartier.label': 'Quartier',
  'annonces.search.quartier.all': 'Tous les quartiers',
  'annonces.search.type.label': 'Type',
  'annonces.search.type.all': 'Tous les types',
  'annonces.search.cta': 'Rechercher',
  'annonces.mapPreview.cta': 'Voir sur la carte',
  'annonces.mapPreview.backCta': 'Retour à la liste',
  'annonces.mapPreview.empty': 'Aucune annonce à cartographier',
  'annonces.mapPreview.count.one': '{count} annonce localisée',
  'annonces.mapPreview.count.other': '{count} annonces localisées',
  'toolbar.search.label': 'Recherche :',
  'toolbar.query.label': 'Recherche par mots-clés',
  'toolbar.query.placeholder': 'Mot-clé (ex. meublé, balcon, calme…)',
  'toolbar.view.label': 'Vue',
  'toolbar.view.grid': 'Grille',
  'toolbar.view.map': 'Carte',
  'annonces.map.empty.title': 'Aucune annonce à afficher sur la carte',
  'annonces.map.empty.lead': 'Modifiez vos filtres ou repassez en vue Grille.',
  'filters.amenities.label': 'Ce que propose ce logement',
  // 2026-06-09 sidebar additions — bedrooms / bathrooms / furnished
  // (filters.type.label + filters.type.all reuse existing keys above)
  'filters.bedrooms.label': 'Chambres',
  'filters.bedrooms.any': 'Indifférent',
  'filters.bedrooms.atLeast': '{count}+',
  'filters.bedrooms.chip': '{count}+ ch.',
  'filters.bathrooms.label': 'Salles de bain',
  'filters.bathrooms.any': 'Indifférent',
  'filters.bathrooms.atLeast': '{count}+',
  'filters.bathrooms.chip': '{count}+ sdb',
  'filters.furnished.label': 'Meublé',
  'filters.furnished.any': 'Indifférent',
  'filters.furnished.yes': 'Meublé',
  'filters.furnished.no': 'Non meublé',

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
  'card.caution': 'Caution : {count} mois ({amount})',
  'card.caution.half': 'Caution : ½ mois ({amount})',
  'card.noPhoto': 'Pas de photo',
  'card.new': 'Nouveau',
  'card.rating.aria': 'Noté {rating} sur 5 ({count} avis)',

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

  // Contact — concierge model (T-018, switched 2026-05-27)
  // The contact goes through AryTrano, not the owner directly. Visitor
  // talks to our team, who relays the inquiry to the owner offline.
  'contact.whatsapp': 'WhatsApp AryTrano',
  'contact.call': 'Appeler AryTrano',
  'contact.aria.whatsapp': 'Contacter AryTrano par WhatsApp pour cette annonce',
  'contact.aria.call': 'Appeler AryTrano pour cette annonce',
  'contact.hint':
    "Tu contactes notre équipe — on fait le lien avec le propriétaire. Pas de spam pour personne, et ton message arrive directement à AryTrano avec la référence de l'annonce.",
  'contact.noPhone':
    "Cette annonce n'est pas encore contactable. On reviendra vers toi dès qu'on aura confirmé les coordonnées.",
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
  'landing.trust.eyebrow': 'Pourquoi AryTrano',
  'landing.trust.heading': 'La location, sans mauvaise surprise.',
  'landing.trust.lead':
    'Pas de fausses annonces, pas de frais cachés, pas de paiement avant visite. Chaque propriétaire et chaque photo passent en revue avant publication.',
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
  'landing.neighborhoods.viewAll': 'Voir toutes les annonces',
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
  'proprietaires.hero.ctaMicrocopy':
    'Publié en moins de 5 minutes · Aucune carte demandée',
  'proprietaires.hero.trustpill1': 'Fianarantsoa · Antananarivo',
  'proprietaires.hero.trustpill2': 'Bilingue FR / MG',
  'proprietaires.hero.trustpill3': 'Validation sous 24-48h',
  'proprietaires.hero.trustpill.activeOwners.one': 'propriétaire actif',
  'proprietaires.hero.trustpill.activeOwners.other': 'propriétaires actifs',
  'proprietaires.hero.notif.title': 'Nouveau message',
  'proprietaires.hero.notif.body': 'Mialy R. · il y a 2 min',
  'proprietaires.hero.stat1.n': '0 Ar',
  'proprietaires.hero.stat1.label': 'Pour publier ton annonce',
  'proprietaires.hero.stat2.n': '−78 %',
  'proprietaires.hero.stat2.label': 'D’économie vs frais d’agence',
  'proprietaires.hero.stat3.n': '100 %',
  'proprietaires.hero.stat3.label': 'Du loyer reste à toi',

  'proprietaires.preview.url': 'arytrano.com/annonces/...',
  'proprietaires.preview.step': 'Étape 3 sur 4',
  'proprietaires.preview.title': 'Décris ton logement',
  'proprietaires.preview.verified': 'Vérifiée',
  'proprietaires.preview.live': 'Annonce active',
  'proprietaires.preview.subtitle': 'Fianarantsoa · Quartier étudiant',
  'proprietaires.preview.stats.views': '128 vues',
  'proprietaires.preview.stats.contacts': '8 contacts',
  'proprietaires.preview.stats.posted': 'Publiée il y a 3 j',
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

  'proprietaires.pricing.eyebrow': 'Tarification',
  'proprietaires.pricing.title': 'Tu paies seulement quand tu loues.',
  'proprietaires.pricing.lead':
    'Publier ton annonce ne te coûte rien. AryTrano se rémunère uniquement lorsqu’un bail est signé sur la plateforme — jamais sur ton loyer, jamais à l’étudiant.',
  'proprietaires.pricing.disclaimer':
    'Aucune commission sur les loyers — ni maintenant, ni jamais. Le frais success-based est facturé une fois par bail signé, en échange du Contrat AryTrano.',

  // Card 1 — Publication (gratuit)
  'proprietaires.pricing.publication.eyebrow': 'Publication',
  'proprietaires.pricing.publication.price': '0 Ar',
  'proprietaires.pricing.publication.sub': 'Pour toujours. Aucune carte demandée.',
  'proprietaires.pricing.publication.f1':
    'Annonces illimitées, durée illimitée',
  'proprietaires.pricing.publication.f2':
    'Badge propriétaire vérifié (KYC standard)',
  'proprietaires.pricing.publication.f3':
    'Contact direct WhatsApp avec les locataires',
  'proprietaires.pricing.publication.f4':
    'Photos protégées (EXIF strippé, anti-fuite)',
  'proprietaires.pricing.publication.f5':
    'Statistiques basiques (vues, contacts)',
  'proprietaires.pricing.publication.h3': 'Publier ne coûte rien.',
  'proprietaires.pricing.publication.cta': 'Créer mon compte gratuit',

  // Card 2 — Quand tu loues (success-based)
  'proprietaires.pricing.success.badge': 'Recommandé',
  'proprietaires.pricing.success.eyebrow': 'Quand tu loues',
  'proprietaires.pricing.success.price': '15 000 Ar',
  'proprietaires.pricing.success.priceSuffix': '+ 8% caution',
  'proprietaires.pricing.success.sub': 'par bail signé sur AryTrano',
  'proprietaires.pricing.success.f1':
    'Contrat de bail PDF généré (économise le notaire)',
  'proprietaires.pricing.success.f2':
    'État des lieux numérique horodaté (photos + vidéo)',
  'proprietaires.pricing.success.f3':
    'Reçus mensuels de paiement loyer automatiques',
  'proprietaires.pricing.success.f4':
    'Arbitrage AryTrano en cas de litige sur la caution',
  'proprietaires.pricing.success.f5':
    'Badge « Propriétaire de confiance » après 3 baux sans litige',
  'proprietaires.pricing.success.example':
    'Ex : caution 500 000 Ar → 15 000 + 40 000 = 55 000 Ar',
  'proprietaires.pricing.success.h3': 'Tu paies à la signature du bail.',
  'proprietaires.pricing.success.cta': 'Démarrer maintenant',

  // Flow — 4 steps
  'proprietaires.pricing.flow.eyebrow': 'Comment ça marche',
  'proprietaires.pricing.flow.title':
    'De la publication au bail signé, en 4 étapes.',
  'proprietaires.pricing.flow.step1':
    'Tu publies ton annonce — gratuit, illimité, aucun engagement.',
  'proprietaires.pricing.flow.step2':
    'Un locataire t’envoie un message via la plateforme.',
  'proprietaires.pricing.flow.step3':
    'Visite, accord verbal — tu signes le bail numériquement sur AryTrano.',
  'proprietaires.pricing.flow.step4':
    'Tu paies 15 000 Ar + 8% caution — ton Contrat AryTrano s’active.',

  // Comparatif vs agences
  'proprietaires.pricing.comparison.eyebrow': 'Comparé aux agences',
  'proprietaires.pricing.comparison.title':
    'Beaucoup moins cher qu’une agence immobilière classique.',
  'proprietaires.pricing.comparison.agency.label': 'Agence immobilière',
  'proprietaires.pricing.comparison.agency.amount': '125 000 – 250 000 Ar',
  'proprietaires.pricing.comparison.agency.note':
    '50 à 100 % d’un mois de loyer en frais d’agence (sur loyer 250 000 Ar/mois).',
  'proprietaires.pricing.comparison.arytrano.label': 'AryTrano',
  'proprietaires.pricing.comparison.arytrano.amount': '~55 000 Ar',
  'proprietaires.pricing.comparison.arytrano.note':
    '15 000 Ar + 8% caution (sur caution 500 000 Ar) — incluant contrat PDF + arbitrage.',
  'proprietaires.pricing.comparison.savings':
    'Économie moyenne : ~195 000 Ar par location (-78 %).',
  'proprietaires.pricing.comparison.savingsPercent': '−78',
  'proprietaires.pricing.comparison.savingsLabel':
    'Économie moyenne par location',

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
  'proprietaires.faq.q5.q':
    'Pourquoi je paie 15 000 Ar + 8 % de caution à la signature ?',
  'proprietaires.faq.q5.a':
    'C’est ce qui active ton « Contrat AryTrano » : un bail PDF généré gratuitement (évite ~30 000 Ar de notaire), un état des lieux numérique horodaté, des reçus mensuels automatiques, et notre service d’arbitrage si litige sur la caution. Sans ce frais, on ne pourrait pas couvrir ces livrables. Comparé à une agence classique (50-100 % d’un mois de loyer), c’est environ 4× moins cher. Aucune commission sur ton loyer — tu touches 100 % de ce que paie le locataire chaque mois.',
  'proprietaires.faq.q6.q': 'Et si un locataire fait défaut sur le loyer ?',
  'proprietaires.faq.q6.a':
    'AryTrano ne garantit pas le paiement mensuel du loyer — c’est entre toi et le locataire. En cas de défaut, tu peux ouvrir un litige depuis ton dashboard : on examine l’historique du Contrat AryTrano (signatures, reçus mensuels), on signale le locataire pour les futurs propriétaires, et on peut t’orienter vers des recours légaux locaux. La caution reste un levier que tu peux utiliser selon les conditions du bail.',

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

  // E-T11 B4 Hub /villes
  'villesHub.meta.title': 'Toutes les villes — AryTrano',
  'villesHub.meta.description':
    'Logement étudiant à Madagascar : Fianarantsoa, Antananarivo, Toamasina, Mahajanga, Toliara. Annonces vérifiées, contact direct propriétaire.',
  'villesHub.eyebrow': 'Couverture AryTrano',
  'villesHub.title': 'Toutes les villes',
  'villesHub.lead':
    '{count} villes couvertes. Choisis ta destination pour parcourir les quartiers et les annonces disponibles.',
  'villesHub.card.count': '{count} annonces',
  'villesHub.card.empty': 'Bientôt',
  'villesHub.card.cta': 'Voir la ville',

  // E-T11 City landing /villes/[citySlug]
  'cityLanding.meta.title': 'Logement étudiant à {city} — AryTrano',
  'cityLanding.meta.description':
    '{count} annonces actives à {city} — chambres, studios et appartements pour étudiants. Contact direct propriétaire, sans intermédiaire.',
  'cityLanding.eyebrow': 'Ville',
  'cityLanding.title': 'Logement étudiant à {city}.',
  'cityLanding.description':
    'Trouve ta chambre, ton studio ou ton appartement à {city} en contactant les propriétaires directement. Pas d\'agence, pas de commission.',
  'cityLanding.description.empty':
    'On démarre la couverture de {city}. Tu es propriétaire ? Sois le premier à publier ton annonce.',
  'cityLanding.stats.activeListings': 'Annonces actives',
  'cityLanding.stats.verifiedOwners': 'Propriétaires vérifiés',
  'cityLanding.stats.neighborhoodsCount': 'Quartiers couverts',
  'cityLanding.cta.searchListings': 'Voir les annonces à {city}',
  'cityLanding.cta.exploreQuartiers': 'Explorer les quartiers',
  'cityLanding.listings.eyebrow': 'Disponible maintenant',
  'cityLanding.listings.title': 'Dernières annonces à {city}',
  'cityLanding.listings.lead':
    '{total} annonces publiées actuellement. Les plus récentes en premier.',
  'cityLanding.listings.viewAll': 'Voir les {total}',
  'cityLanding.quartiers.eyebrow': 'Quartiers',
  'cityLanding.quartiers.title': 'Quartiers étudiants de {city}',
  'cityLanding.quartiers.lead':
    '{count} quartiers couverts à {city} — chacun avec son ambiance et son budget moyen.',
  'cityLanding.quartiers.card.count': '{count} annonces',
  'cityLanding.quartiers.card.empty': 'Bientôt',

  // E-T11 B2 — neighborhood landing page
  'neighborhoodLanding.meta.title': '{quartier}, {city} — Logement étudiant',
  'neighborhoodLanding.meta.description':
    '{count} annonces étudiantes à {quartier}, {city}. Loyers, ambiance, contact direct propriétaire — pas de commission.',
  'neighborhoodLanding.title': '{quartier}, {city}.',
  'neighborhoodLanding.description':
    '{count} annonces actives à {quartier}. Compare les prix, repère l\'ambiance du quartier, contacte les proprios directement.',
  'neighborhoodLanding.description.empty':
    'Aucune annonce active à {quartier} pour l\'instant. Tu es propriétaire dans le coin ? Publie ton bien et touche les premiers étudiants intéressés.',
  'neighborhoodLanding.stats.listings': 'Annonces',
  'neighborhoodLanding.stats.avgPrice': 'Loyer moyen / mois',
  'neighborhoodLanding.stats.reviews': '{count} avis publiés',
  'neighborhoodLanding.map.eyebrow': 'Sur la carte',
  'neighborhoodLanding.map.title': 'Localisation',
  'neighborhoodLanding.listings.eyebrow': 'Disponible',
  'neighborhoodLanding.listings.title':
    '{count} annonces à {quartier}',
  'neighborhoodLanding.listings.viewAll': 'Voir les {total}',
  'neighborhoodLanding.listings.empty.title':
    'Pas encore d\'annonce à {quartier}.',
  'neighborhoodLanding.listings.empty.lead':
    'On vient de seeder ce quartier — la mise en ligne se fait au rythme des proprios qui rejoignent AryTrano. Tu peux ouvrir la marche.',
  'neighborhoodLanding.listings.empty.cta': 'Publier mon annonce',
  'neighborhoodLanding.reviews.eyebrow': 'Retours d\'étudiants',
  'neighborhoodLanding.reviews.title': 'Avis sur {quartier}',
  'neighborhoodLanding.reviews.lead':
    'Note agrégée des étudiants qui ont vécu dans une des annonces de {quartier}. Les avis détaillés se trouvent sur chaque page d\'annonce.',
  'neighborhoodLanding.reviews.basedOn': 'Sur {count} avis',
  'neighborhoodLanding.siblings.title': 'Autres quartiers de {city}',

  'quartiers.eyebrow': 'Quartiers',
  // E-T07 : H1 + lead dynamiques paramétrés par ville
  'quartiers.h1': '{count} quartiers de {city}.',
  'quartiers.h1.empty': 'Bientôt à {city}.',
  'quartiers.lead':
    'Chaque quartier a sa propre ambiance, son budget moyen et ses commodités. Choisis selon ton style de vie, pas seulement ton budget.',
  'quartiers.lead.empty':
    'On est en train de cartographier les quartiers étudiants de {city}. Reviens dans quelques semaines, ou explore les autres villes ci-dessus.',
  'quartiers.cityNav.aria': 'Changer de ville',
  'quartiers.jump.eyebrow': 'Aller au quartier',
  'quartiers.stats.quartiers.label': 'Quartiers couverts',
  'quartiers.stats.listings.label': 'Annonces actives',
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

  // Q0 — Ville (E-T07, affichée si ≥ 2 villes ont des profils quiz)
  'quiz.q.city.title': 'Tu cherches dans quelle ville ?',
  'quiz.q.city.help':
    'On scope les recommandations à la ville choisie. D\'autres villes arrivent au fil des semaines.',

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
  'status.RENTED': 'Louée',

  // Account sidebar
  'sidebar.myAccount': 'Mon compte',
  'sidebar.section.listings': 'Annonces',
  'sidebar.section.discover': 'Découverte',
  'sidebar.section.account': 'Compte',
  'sidebar.favorites': 'Favoris',
  'sidebar.savedSearches': 'Recherches sauvegardées',

  // E-T09 — saved searches
  'savedSearch.page.title': 'Recherches sauvegardées',
  'savedSearch.page.lead':
    'Tes recherches enregistrées. Lance-les en un clic ou désactive les alertes si tu n\'es plus intéressé.',
  'savedSearch.page.empty.title': 'Aucune recherche sauvegardée.',
  'savedSearch.page.empty.lead':
    'Quand tu poses des filtres sur /annonces, clique sur « Sauver la recherche » pour la retrouver ici.',
  'savedSearch.page.empty.cta': 'Parcourir les annonces',
  'savedSearch.save.cta': 'Sauver la recherche',
  'savedSearch.save.success': 'Recherche sauvegardée.',
  'savedSearch.save.error': 'Impossible. Réessaie.',
  'savedSearch.save.needsAuth': 'Connecte-toi pour sauver.',
  'savedSearch.save.noFilters':
    'Pose au moins un filtre avant de sauver la recherche.',
  'savedSearch.dialog.title': 'Donne un nom à ta recherche',
  'savedSearch.dialog.body':
    'On t\'avertira par email quand de nouvelles annonces matcheront. Tu peux désactiver les alertes plus tard.',
  'savedSearch.dialog.signInBody':
    'Crée un compte ou connecte-toi pour sauvegarder cette recherche et recevoir des alertes.',
  'savedSearch.dialog.nameLabel': 'Nom',
  'savedSearch.dialog.namePlaceholder': 'Studio Andrainjato sous 250k',
  'savedSearch.dialog.cancel': 'Annuler',
  'savedSearch.dialog.save': 'Sauver',
  'savedSearch.dialog.pending': 'Sauvegarde…',
  'savedSearch.dialog.signInCta': 'Se connecter',
  'savedSearch.row.allListings': 'Toutes les annonces',
  'savedSearch.row.run': 'Lancer',
  'savedSearch.row.alertsOnCta': 'Alertes activées',
  'savedSearch.row.alertsOffCta': 'Alertes désactivées',
  'savedSearch.row.alertsOn': 'Alertes activées.',
  'savedSearch.row.alertsOff': 'Alertes désactivées.',
  'savedSearch.row.delete': 'Supprimer',
  'savedSearch.row.confirmDelete':
    'Supprimer cette recherche sauvegardée ?',
  'savedSearch.row.deleted': 'Recherche supprimée.',

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
  'listingForm.cautionMonths.label': 'Caution demandée',
  'listingForm.cautionMonths.help':
    'Standard à Madagascar : 1-3 mois. ½ mois possible pour les chambres / courtes durées. La caution est figée pour toutes les locations de cette annonce.',
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
  'oauth.unlinkHint.needPassword':
    'Ajoute un mot de passe avant de délier ta dernière connexion.',

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
  'admin.section.content': 'Contenu',
  'admin.nav.overview': 'Vue d\'ensemble',
  'admin.nav.geo': 'Géographie',
  'admin.nav.listings': 'Annonces',
  'admin.nav.leads': 'Leads (E-T28)',
  'admin.nav.disputes': 'Litiges (E-T27)',
  'admin.nav.reports': 'Signalements',
  'admin.nav.testimonials': 'Témoignages',
  'admin.nav.whatsappAlerts': 'Alertes WhatsApp',
  'admin.nav.quizAnalytics': 'Quiz analytics',
  'admin.nav.revenue': 'Revenus',

  // PWA offline fallback (E-T13)
  'offline.title': 'Tu sembles hors ligne',
  'offline.lead':
    'AryTrano garde une copie locale du site pour t\'aider à naviguer même sans signal. Connecte-toi à internet pour voir les nouvelles annonces.',
  'offline.cta.home': 'Aller à l\'accueil',
  'offline.cta.retry': 'Réessayer',
  'offline.footer':
    'Si le problème persiste, vérifie ton wifi ou tes données mobiles.',
  'admin.headerLink': 'Admin',

  // Admin revenue dashboard (E-T19 v0.5 — success-fee tracker)
  'admin.revenue.title': 'Revenus',
  'admin.revenue.lead':
    'Suivi des frais de signature et commissions caution encaissés par AryTrano. Ne compte que les paiements CONFIRMÉS — les refunds + disputes sont surveillés à part.',
  'admin.revenue.kpi.heading': 'Indicateurs revenus',
  'admin.revenue.kpi.thisMonth': 'Ce mois',
  'admin.revenue.kpi.thisMonth.hint': '{count} paiements confirmés',
  'admin.revenue.kpi.lastMonth': 'Mois précédent',
  'admin.revenue.kpi.lastMonth.hint': '{count} paiements confirmés',
  'admin.revenue.kpi.vsLastMonth': 'vs mois précédent',
  'admin.revenue.kpi.allTime': 'Total cumulé',
  'admin.revenue.kpi.allTime.hint': '{count} paiements depuis le lancement',
  'admin.revenue.kpi.signedThisMonth': 'Baux signés ce mois',
  'admin.revenue.kpi.signedThisMonth.hint':
    'Leases passés en ACTIVE — l\'indicateur santé du modèle.',
  'admin.revenue.health.heading': 'Santé du modèle',
  'admin.revenue.kpi.disputeRate': 'Taux de litige',
  'admin.revenue.kpi.disputeRate.hint':
    'Part des baux jamais finalisés (DISPUTED / total ACTIVE + TERMINATED + DISPUTED).',
  'admin.revenue.kpi.disputeRate.na': 'N/A',
  'admin.revenue.kpi.refundQueue': 'File refunds',
  'admin.revenue.kpi.refundQueue.hint':
    'REFUND_PENDING + REFUNDED. À traiter manuellement avec GoalPay.',
  'admin.revenue.status.title': 'Paiements par statut',
  'admin.revenue.status.caption':
    'Distribution des paiements LEASE_SUCCESS_FEE par statut.',
  'admin.revenue.status.column.status': 'Statut',
  'admin.revenue.status.column.count': 'Nombre',
  'admin.revenue.status.empty': 'Aucun paiement enregistré pour l\'instant.',
  'admin.revenue.recent.title': 'Derniers paiements',
  'admin.revenue.recent.caption':
    'Les 30 derniers paiements LEASE_SUCCESS_FEE, du plus récent au plus ancien.',
  'admin.revenue.recent.column.date': 'Date',
  'admin.revenue.recent.column.listing': 'Annonce',
  'admin.revenue.recent.column.status': 'Statut',
  'admin.revenue.recent.column.amount': 'Montant',
  'admin.revenue.recent.row.noListing': '(annonce supprimée)',
  'admin.revenue.recent.empty':
    'Aucun paiement encore — le tableau se remplira dès le premier bail signé.',

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
  'admin.testimonials.list.create': 'Nouveau',
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

  // E-T28 — Lead CTA + dialog (2026-06-10, T-RES-05 / T-RES-11)
  'lead.cta.interested': 'Je suis intéressé(e)',
  'lead.cta.submit': 'Envoyer ma demande',
  'lead.cta.submitting': 'Envoi en cours…',
  'lead.dialog.title': 'Décrivez votre projet',
  'lead.dialog.subtitle':
    'L’équipe AryTrano vous recontacte sous 4h en moyenne au sujet de « {listing} ».',
  'lead.dialog.disclaimer':
    'D’autres candidats peuvent négocier en parallèle. AryTrano sécurise les échanges et organise la visite virtuelle quand le propriétaire confirme.',
  'lead.form.name': 'Votre nom',
  'lead.form.phone': 'Votre numéro WhatsApp',
  'lead.form.phoneHint':
    'Format international, ex : +261 34 12 345 67. Nous l’utilisons uniquement pour vous recontacter.',
  'lead.form.moveInWindow': 'Quand souhaitez-vous emménager ?',
  'lead.form.budgetConfirmed':
    'Je confirme avoir le budget pour ce loyer (caution incluse).',
  'lead.moveInWindow.thisMonth': 'Ce mois-ci',
  'lead.moveInWindow.nextMonth': 'Le mois prochain',
  'lead.moveInWindow.in2Months': 'Dans 2 mois',
  'lead.moveInWindow.flexible': 'Flexible',
  'lead.confirmation.title': 'On vous a noté(e) !',
  'lead.confirmation.body':
    'L’équipe AryTrano vous recontacte par WhatsApp ou téléphone bientôt. Vous pouvez fermer cette fenêtre.',

  // T-002 — Phone OTP step (2026-06-11)
  'lead.otp.title': 'Vérifie ton numéro',
  'lead.otp.subtitle':
    'On vient d’envoyer un code à 6 chiffres au {phone}. Il expire dans 10 minutes.',
  'lead.otp.codeLabel': 'Code reçu par SMS',
  'lead.otp.codePlaceholder': '123456',
  'lead.otp.submit': 'Vérifier',
  'lead.otp.submitting': 'Vérification…',
  'lead.otp.resend': 'Renvoyer un code',
  'lead.otp.resending': 'Envoi…',
  'lead.otp.changeNumber': '← Changer de numéro',
  'lead.otp.error.invalid': 'Code incorrect.',
  'lead.otp.error.expired': 'Code expiré. Demande un nouveau code.',
  'lead.otp.error.tooMany':
    'Trop de tentatives. Demande un nouveau code.',
  'lead.otp.smsConsole.banner':
    'Mode dev : le code est imprimé dans le terminal du serveur. Vérifie la console.',

  // E-T27.1 — lease PDF (2026-06-12)
  'lease.pdf.download': '📄 Télécharger le bail',
  'lease.pdf.signing': 'Préparation…',
  'lease.pdf.pending': 'PDF en cours de génération…',
} as const

export type MessageKey = keyof typeof frMG

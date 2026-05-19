# AryTrano — Tickets

> Format : user stories pour **v0** (MVP). Épics haut-niveau pour v0.5/v1/v2.
> Source de vérité du scope : `public/docs/AryTrano.docx` § AJUSTEMENTS & RECOMMANDATIONS POST-ANALYSE.
> Statut : `📋 todo` · `🚧 in-progress` · `✅ done` · `🧊 frozen` · `❌ cut`

---

## 🚀 v0 — MVP Foundation (Fianarantsoa)

Objectif : un étudiant peut chercher une chambre à Fianarantsoa, voir les annonces avec photos, contacter le propriétaire. Un propriétaire peut publier une annonce. L'admin peut modérer.

### Auth & comptes

#### T-001 · Inscription étudiant
**En tant que** visiteur étudiant
**Je veux** créer un compte avec email + mot de passe
**Afin de** sauvegarder mes recherches plus tard
**Acceptance** : formulaire validé Zod côté serveur · email vérifié par lien · redirige vers la home connecté · message en FR + MG
**Priorité** : P0 · **Statut** : ✅ done (2026-05-13) — i18n FR-MG pending pour message bilingue / email verification reportée à v0.5

#### T-002 · Inscription propriétaire
**En tant que** visiteur propriétaire
**Je veux** créer un compte propriétaire (rôle distinct)
**Afin de** publier des annonces
**Acceptance** : choix du rôle au signup · même flow que T-001 · onboarding minimal (nom, téléphone, ville)
**Priorité** : P0 · **Statut** : ✅ done (2026-05-13) — onboarding ville reporté au flow listing

#### T-003 · Connexion
**En tant que** utilisateur enregistré
**Je veux** me connecter
**Afin d**'accéder à mon dashboard
**Acceptance** : auth par email/password · session persistante · "mot de passe oublié" présent · OAuth Google bouton
**Priorité** : P0 · **Statut** : ✅ done (2026-05-13)

#### T-004 · Réinitialisation mot de passe
**En tant que** utilisateur
**Je veux** réinitialiser mon mot de passe via email
**Afin de** récupérer mon compte
**Acceptance** : email Gmail SMTP avec lien à durée limitée (1h) · anti-enumeration · token SHA-256 hashé en DB, single-use
**Priorité** : P1 · **Statut** : ✅ done (2026-05-13) — rate-limit reporté + template bilingue MG pending

#### T-005 · Édition de profil
**En tant que** utilisateur connecté
**Je veux** éditer mon nom, téléphone, photo de profil
**Afin de** maintenir mes infos à jour
**Acceptance** : formulaire validé · upload photo via Cloudinary · EXIF stripped
**Priorité** : P1 · **Statut** : ✅ done (2026-05-13) — Cloudinary intégré, EXIF auto via transformation `q_auto`

#### T-026 · Paramètres du compte (connexions sociales)
**En tant que** utilisateur connecté
**Je veux** voir et gérer mes méthodes de connexion (mot de passe + Google + Facebook)
**Afin de** lier / délier mes comptes sociaux et ajouter / modifier mon mot de passe
**Acceptance** : page `/dashboard/settings` · changement de mdp exige mdp actuel · ajout de mdp pour user OAuth-only sans current · lier OAuth re-route vers `signIn(provider)` · délier refusé si dernière méthode · refresh côté DB après chaque op
**Priorité** : P0 · **Statut** : ✅ done (2026-05-13)

#### T-027 · Suppression de compte
**En tant que** utilisateur connecté
**Je veux** supprimer mon compte
**Afin de** quitter la plateforme
**Acceptance** : confirmation "SUPPRIMER" requise · soft-delete (status `DELETED`) · anonymisation PII (email → deleted-{id}@arytrano.local, name → [supprimé], phone/image/passwordHash null) · Account OAuth supprimés · Session supprimées · listings du user passent à `DELETED` · avatar Cloudinary nettoyé · user signé out
**Priorité** : P1 · **Statut** : ✅ done (2026-05-13)

#### T-028 · Historique des connexions (device + méthode)
**En tant que** utilisateur connecté
**Je veux** voir les 10 dernières connexions à mon compte (date, méthode, navigateur, OS, device type)
**Afin de** détecter une connexion suspecte
**Acceptance** : table `LoginEvent` · enregistré à chaque login (Credentials web + OAuth + magic-link + mobile API) · ipHash SHA-256(ip+AUTH_SECRET) sans IP brute · UA parsé via ua-parser-js · section "Dernières connexions" sur `/dashboard/settings` · endpoint `GET /api/v1/users/me/login-events?limit=10` · format relative-time FR ("il y a 2h") · plus récent en premier avec badge "Plus récent"
**Priorité** : P1 · **Statut** : ✅ done (2026-05-13) — OAuth web events n'ont pas IP/UA car Auth.js ne donne pas la request en events.signIn

---

### Annonces — côté propriétaire

#### T-006 · Création d'annonce (brouillon)
**En tant que** propriétaire
**Je veux** créer une annonce en brouillon (titre, description, prix, type, ville, quartier)
**Afin de** la compléter avant publication
**Acceptance** : statut `DRAFT` · prix MGA en `Decimal(12,2)` · ville/quartier en select depuis seed · sauvegarde via bouton "Créer le brouillon"
**Priorité** : P0 · **Statut** : ✅ done (2026-05-13)

#### T-007 · Upload photos
**En tant que** propriétaire
**Je veux** ajouter jusqu'à 8 photos à mon annonce
**Afin de** mettre en valeur le logement
**Acceptance** : upload via Cloudinary server-side · drag-reorder HTML5 · suppression individuelle · format `webp` auto · taille max 5 Mo par photo · max 8 photos par annonce
**Priorité** : P0 · **Statut** : ✅ done (2026-05-13)

#### T-008 · Publication d'annonce
**En tant que** propriétaire
**Je veux** publier mon brouillon
**Afin de** le rendre visible aux étudiants
**Acceptance** : validation champs obligatoires (titre ≥5, description ≥20, prix >0, cityId, neighborhoodId, ≥1 photo) · statut `DRAFT` → `PUBLISHED` + `publishedAt` set
**Priorité** : P0 · **Statut** : ✅ done (2026-05-13) — index search à faire en v0.5 (T-014 filtres)

#### T-009 · Édition d'annonce
**En tant que** propriétaire
**Je veux** modifier une annonce publiée
**Afin de** corriger ou actualiser
**Acceptance** : édition garde statut, slug regénéré si titre change (suffixe = id stable), partial update via PATCH
**Priorité** : P1 · **Statut** : ✅ done (2026-05-13) — historique conservé reporté en v0.5

#### T-010 · Disponibilité ON/OFF
**En tant que** propriétaire
**Je veux** marquer une annonce comme indisponible / à nouveau dispo
**Afin de** la mettre en pause sans la supprimer
**Acceptance** : bouton toggle dans le dashboard · `PUBLISHED` ↔ `UNAVAILABLE` (DRAFT et SUSPENDED rejetés) · URL slug garde l'accessibilité publique en lecture seule
**Priorité** : P1 · **Statut** : ✅ done (2026-05-13)

#### T-011 · Suppression (soft) d'annonce
**En tant que** propriétaire
**Je veux** supprimer une annonce
**Afin de** retirer définitivement
**Acceptance** : soft-delete (statut `DELETED`) · confirmation par saisie "SUPPRIMER" inline · 30j de récupération possible côté admin (T-024 v0.5)
**Priorité** : P2 · **Statut** : ✅ done (2026-05-13) — photos Cloudinary conservées jusqu'à cleanup cron

#### T-029 · Rate limit listings (create + upload photos)
**En tant qu'**équipe sécurité
**Je veux** limiter la création de listings et l'upload de photos par owner
**Afin de** protéger le quota Cloudinary et la DB de spam
**Acceptance** : `rateLimiters.createListing` (10/h/userId) sur `POST /api/v1/listings` + `createListingAction` ✅ · `rateLimiters.photoUpload` (30/h/userId + 8/min/listingId) sur `POST .../photos` + `uploadListingPhotoAction` ✅ · 429 avec FR message clair ✅
**Priorité** : P1 · **Statut** : ✅ done (2026-05-13) — implémenté en réaction à audit security listings

#### T-030 · Magic-bytes validation sur uploads (avatar + listing photos)
**En tant qu'**équipe sécurité
**Je veux** vérifier les magic bytes des fichiers uploadés
**Afin de** rejeter les fichiers polyglot (HTML déguisés en image, SVG masqués en HEIC)
**Acceptance** : `file-type` installé ✅ · helper `lib/images/sniff.ts` (allowlist jpg/png/webp/heic/heif) ✅ · sniff dans `addListingPhoto` + `updateAvatar` AVANT upload Cloudinary ✅ · log warn si rejet ✅ · double défense côté Cloudinary (allowed_formats + assert format) ✅
**Priorité** : P1 · **Statut** : ✅ done (2026-05-13)

---

### Annonces — côté visiteur / étudiant

#### T-012 · Liste publique des annonces
**En tant que** visiteur
**Je veux** voir la liste paginée des annonces publiées
**Afin de** parcourir l'offre
**Acceptance** :
- 20/page · cursor-based pagination · vignette ≤30 KB · LCP < 2.5s en 3G fast
- **`next/image`** obligatoire (pas `<img>` natif — critique 3G Madagascar)
- Alt descriptif `<type> à <quartier>, <ville>` (pas `alt=""`)
- Nouvelle query dédiée `list-public-listings` (status=PUBLISHED, sans filtre owner, projection narrow — pas de PII owner)
- Schema Prisma doit avoir `lat`, `lng`, `blurhash` — sinon migration d'abord
- `placeholder="blur"` + `blurDataURL` via blurhash sur les vignettes
- `metadata.alternates.canonical` sur URLs filtrées (`?type=ROOM&priceMin=…` → canonical = `/<city-slug>`) pour consolider signaux Google
- Pas de JSON-LD per-card (réservé à T-013 détail) · optionnellement `ItemList` si la liste est le contenu principal
- Vérifier `public/images/arytrano.png` existe (OG image fallback pour WhatsApp/FB shares)
- Title page ≤ 42 chars (root template `%s — AryTrano` ajoute ~12 chars, total < 60)
**Priorité** : P0 · **Statut** : ✅ done (2026-05-14) — page `/annonces` + query `list-public-listings` + component `PublicListingCard` + sitemap + lien Header. URL pattern détail (`/<city>/<neighborhood>/<slug>`) attend T-013. Blurhash placeholder ready côté code (fallback `placeholder='empty'` si DB column null — à générer à l'upload en suivi).

#### T-013 · Détail d'une annonce
**En tant que** visiteur
**Je veux** consulter la page détail (photos, description, prix, localisation, contact)
**Afin d**'évaluer si elle me convient
**Acceptance** : URL slug SEO `/<city-slug>/<neighborhood-slug>/<listing-slug>` ✅ · structured data Schema.org `RealEstateListing` (image, geo via listing.lat||neighborhood.lat||city.lat, price, areaServed) ✅ · OG image = première photo Cloudinary ✅ · query `get-public-listing` (lat, lng, description, blurhash photos) ✅ · escape HTML de la description (React auto-escape via `whitespace-pre-wrap`, pas de `dangerouslySetInnerHTML` sur user content) ✅ · CSP headers (script-src + img-src + connect-src + frame-ancestors none + form-action self) ✅ · helper `lib/seo/realestate-listing.ts` ✅ · sitemap dynamique avec listings PUBLISHED ✅
**Priorité** : P0 · **Statut** : ✅ done (2026-05-14) — Bouton contact = placeholder disabled "Bientôt" (réservé T-018 WhatsApp). CSP nonce-based + hreflang fr-MG/mg ajoutés 2026-05-15.

#### T-014 · Filtres
**En tant que** visiteur
**Je veux** filtrer par prix (min/max), type (chambre, studio, apparts, maison), quartier
**Afin de** réduire les résultats
**Acceptance** : filtres dans URL ✅ (partageable) · résultats mis à jour sans full reload ✅ (useTransition + router.replace scroll:false) · panneau filtres responsive ✅ (flex-wrap mobile + horizontal desktop) · noindex sur pages filtrées ✅ (canonical → /annonces) · validation Zod côté server (priceMin ≤ priceMax) ✅
**Priorité** : P0 · **Statut** : ✅ done (2026-05-14) — focus-trap modal mobile reporté (UX flex-wrap acceptable v0). Multi-select neighborhoods/types reporté v0.5.

#### T-015 · Recherche par ville + quartier
**En tant que** visiteur
**Je veux** sélectionner ville puis quartier
**Afin de** chercher localement
**Acceptance** : v0 = Fianarantsoa seulement ✅ · quartiers seedés ✅ · autocomplete sur quartier ✅ (Base UI Combobox, client-side filter, `autoHighlight` + Empty state i18n FR/MG, Clear button)
**Priorité** : P0 · **Statut** : ✅ done (2026-05-14) — remplace le Select par un Combobox dans `ListingFilters`. Filtrage client-side OK pour v0 (~10 quartiers Fianar). Server-side query (autocomplete keyed by city slug) reportée v1 multi-ville.

#### T-016 · Tri des résultats
**En tant que** visiteur
**Je veux** trier par "nouveautés" / "prix croissant" / "prix décroissant"
**Afin de** prioriser ce qui m'intéresse
**Acceptance** : sort dans URL (`?sort=newest|price-asc|price-desc`, défaut newest) ✅ · index DB couvre déjà (`@@index([status, publishedAt(sort: Desc)])` + `@@index([status, priceMonthlyMGA])`) ✅ · `id` comme tie-breaker pour stabilité du cursor pagination ✅ · component `ListingSort` séparé (barre entre filters et grid) ✅ · cursor reset on sort change ✅
**Priorité** : P1 · **Statut** : ✅ done (2026-05-14)

#### T-017 · Galerie photos
**En tant que** visiteur
**Je veux** parcourir les photos en plein écran
**Afin de** mieux voir le logement
**Acceptance** : lightbox Base UI Dialog (focus trap auto + ESC handling) ✅ · nav clavier ← / → ✅ · focus restauré à la fermeture (Base UI default) ✅ · compteur "3 / 8" en haut ✅ · aria-label sur boutons prev/next/close ✅ · backdrop click ferme ✅ · `<button>` triggers (focus-visible ring) ✅
**Priorité** : P1 · **Statut** : ✅ done (2026-05-14)

---

### Contact

#### T-018 · Bouton contact WhatsApp / téléphone
**En tant que** visiteur
**Je veux** contacter le propriétaire en 1 clic via WhatsApp ou téléphone
**Afin de** négocier rapidement
**Acceptance** : numéro masqué jusqu'au clic (anti-scraping — phone JAMAIS dans le payload public, exposé via Server Action seulement après record event) ✅ · `aria-label` explicite ("Contacter le propriétaire par WhatsApp" / "Appeler le propriétaire") ✅ · ouvre `wa.me/<phone>` (new tab + noopener) ou `tel:<phone>` ✅ · normalisation E.164 phone MG (+261) côté service ✅ · empty state si owner n'a pas de phone ✅ · spinner per-channel pendant pending ✅ · rate-limit 30/h par (IP, listing) avec fail-CLOSED sur IP null ✅ (2026-05-15)
**Priorité** : P0 · **Statut** : ✅ done (2026-05-14, rate-limit ajouté 2026-05-15)

#### T-019 · Log de contact (analytics basique)
**En tant que** propriétaire
**Je veux** voir combien de personnes ont cliqué sur le contact
**Afin de** mesurer l'intérêt
**Acceptance** : table `ContactEvent` (listingId, channel, ipHash, uaHash, ts) ✅ · pas de PII brute (ipHash SHA-256+AUTH_SECRET, uaHash idem, pas d'IP/UA stocké en clair) ✅ · compteur "X contact(s)" sur card dashboard owner (status PUBLISHED only) ✅ · log déclenché à chaque clic (volume réel, pas juste uniques) ✅
**Priorité** : P2 · **Statut** : ✅ done (2026-05-14) — détail par-listing (timeline + breakdown channel) reporté v0.5

---

### i18n bilingue

#### T-020 · Locale switcher
**En tant que** visiteur
**Je veux** basculer entre français et malagasy
**Afin de** lire dans ma langue préférée
**Acceptance** : préférence dans cookie `arytrano_locale` 1 an ✅ · sync `User.locale` DB pour signed-in users ✅ · accessible depuis header sur chaque page (FR/MG segmented control) ✅ · `<html lang>` correct (server-rendered) ✅ · pas de full reload (router.refresh + useTransition) ✅
**Priorité** : P0 · **Statut** : ✅ done (2026-05-14) — URL prefix `/mg/...` + hreflang fr-MG/mg ajoutés 2026-05-15. Cookie reste autoritaire; le prefix URL existe pour SEO indexable séparément.

#### T-021 · Tous les écrans publics traduits
**En tant que** locuteur malagasy ou français
**Je veux** une expérience complète dans ma langue
**Afin de** ne pas dépendre du français pour tout
**Acceptance** : public-facing surface translated ✅ (Header, `/`, `/annonces` + filtres + sort + cards, page détail + breadcrumb + features + price + contact + galerie) · dictionaries fr-MG + mg synchronisés via type `Record<MessageKey, string>` (compile-time enforcement, missing key = TS error) ✅
**Priorité** : P0 · **Statut** : ✅ done (2026-05-14) — auth-error, sign-in, sign-up, forgot/reset password, dashboard, settings restent FR-only v0 (auth-gated, faible impact users non-FR). Couverture complète + hreflang = v0.5.

---

### Modération basique

#### T-022 · Connexion admin
**En tant qu**'admin AryTrano
**Je veux** accéder à un dashboard admin
**Afin de** modérer la plateforme
**Acceptance** : route `/admin/*` gated par rôle ADMIN (redirect /dashboard si non-admin, /sign-in si non auth) ✅ · AdminSidebar séparé avec sections DASHBOARD/MODÉRATION + badge live count des reports OPEN ✅ · Lien Admin visible dans Header pour role ADMIN ✅ · Page `/admin` overview avec stats (listings par status, reports open, users par role) via groupBy queries ✅ · i18n FR/MG complet ✅
**Priorité** : P0 · **Statut** : ✅ done (2026-05-14) — 2FA admin reporté v0.5. Sessions admin séparées = JWT staleness à fermer en même temps (project_jwt_role_staleness memory).

#### T-023 · Liste de toutes les annonces (admin)
**En tant qu**'admin
**Je veux** voir toutes les annonces (tous statuts)
**Afin de** modérer
**Acceptance** : query `list-admin-listings` (tous statuts, all owners, +report count) ✅ · filtres par statut (DRAFT/PUBLISHED/UNAVAILABLE/SUSPENDED/DELETED) ✅ · recherche par titre/nom owner/email owner (case-insensitive contains) ✅ · cursor pagination 30/page ✅ · badge "X signalements" sur cards avec reports OPEN ✅ · liens "Voir publique" (PUBLISHED only) + Suspendre ✅ · i18n FR/MG ✅
**Priorité** : P0 · **Statut** : ✅ done (2026-05-14)

#### T-024 · Suspendre une annonce (admin)
**En tant qu**'admin
**Je veux** suspendre une annonce litigieuse
**Afin de** la cacher en attendant investigation
**Acceptance** : Server Action + service `suspendListing` avec `requireAdmin()` defense-in-depth ✅ · statut SUSPENDED + suspendedReason/At/By ✅ · raison obligatoire (min 5, max 500) ✅ · propriétaire notifié par email Gmail SMTP (FR escape HTML) ✅ · transactional: OPEN reports → IN_REVIEW ✅ · Admin ne peut pas suspendre sa propre annonce ✅ · Dialog Base UI + textarea + spinner pending ✅ · i18n FR/MG ✅
**Priorité** : P0 · **Statut** : ✅ done (2026-05-14)

#### T-025 · Signalement basique
**En tant que** visiteur
**Je veux** signaler une annonce suspecte (arnaque, photo volée, etc.)
**Afin que** l'admin puisse intervenir
**Acceptance** : Dialog Base UI sur page détail "Signaler" ✅ · 6 raisons enum (SCAM, STOLEN_PHOTOS, WRONG_INFO, INAPPROPRIATE, ALREADY_RENTED, OTHER) + textarea optionnel 1000 chars ✅ · Report DB avec reporterId nullable (anonyme OK) ✅ · rate-limit Upstash: 10/h/IP global + 3/h/(IP+listing) anti-pile-on ✅ · Generic error message (anti-enumeration) ✅ · Admin page `/admin/reports` avec filter par status (OPEN/IN_REVIEW/RESOLVED/DISMISSED) ✅ · actions Resolve/Dismiss + audit fields (resolvedAt/By) ✅ · Sidebar badge live count des reports OPEN ✅ · i18n FR/MG ✅
**Priorité** : P0 · **Statut** : ✅ done (2026-05-14)

---

## 🌱 v0.5 — Confiance & médias

Objectif : crédibiliser la plateforme. Découpage en phases — Phase A
(quick wins indépendants) puis Phase B (emails transverses). Les phases
C/D/E sont planifiées mais non détaillées ici.

### Phase A — Trust signals indépendants

#### T-031 · Avis avec preuve de séjour (`Review.verifiedStay`)
**En tant que** visiteur étudiant
**Je veux** voir un badge "Séjour confirmé" sur les avis fiables
**Afin de** distinguer les vrais témoignages des avis fabriqués
**Acceptance** :
- Schema : `Review.verifiedStay Boolean @default(false)` + migration
- Le flag est calculé **au submit** (`submitReview` service), pas à la lecture (évite N+1 + figeage de l'évaluation au moment du témoignage)
- Critère MVP v0.5 : présence d'au moins **un** `ContactEvent` avec `(userId === authorId, listingId === review.listingId, createdAt < review.createdAt)`. Proxy raisonnable : "l'étudiant a contacté le proprio via la plateforme avant d'écrire son avis"
- **Limite documentée** : contact off-platform (WhatsApp direct, in-person) ne déclenche pas le flag → faux-négatif accepté en v0.5
- UI : badge `"Séjour confirmé"` (icône check + `text-success bg-success/10 rounded-md h-7 px-2.5 text-xs font-medium`) sur `ReviewRow` quand `verifiedStay === true`
- i18n FR : `reviews.verifiedStay.label`, `.tooltip` ; idem MG
- Tests : unit sur la logique de détermination (avec/sans ContactEvent antérieur, edge cases timing)
- Backfill : skip (4 listings actuels, accept stale `false`)
**Priorité** : P1 · **Statut** : 📋 todo

#### T-032 · EXIF strip explicite Cloudinary (audit M1)
**En tant qu'**équipe sécurité
**Je veux** retirer explicitement les EXIF (GPS notamment) avant Cloudinary
**Afin de** garantir la promesse UI "EXIF retiré" sans dépendre du comportement par défaut
**Acceptance** :
- `cloudinary.uploader.upload_stream` reçoit `{ image_metadata: false, exif: false }` dans **tous** les appels (avatar + listing photos)
- `lib/cloudinary/index.ts` mis à jour, pas de changement d'API publique
- Test manuel documenté : upload photo avec GPS → `exiftool` sur l'URL Cloudinary doit ne rien retourner
- Memory : créer `feedback_exif_strip_explicit.md`
**Priorité** : P1 · **Statut** : 📋 todo

#### T-033 · Badge "Annonce vérifiée" (admin marker)
**En tant qu'**admin
**Je veux** marquer manuellement une annonce comme "vérifiée"
**Afin de** récompenser les bons propriétaires et signaler aux étudiants
**Acceptance** :
- Schema : `Listing.verifiedAt DateTime?` + `Listing.verifiedBy String?` (FK soft, pas de cascade — résiste à la suppression de l'admin)
- Service `verifyListing(adminId, listingId)` + `unverifyListing(adminId, listingId)` avec `requireAdmin()` guard
- UI admin : bouton "Vérifier" / "Retirer la vérif" sur `/admin/listings` cards, distinct de Suspendre
- UI public : badge `"Annonce vérifiée"` (icône shield + `text-primary bg-primary/10 rounded-md`) sur :
  - `PublicListingCard` (overlay top-left, prioritaire sur le status DRAFT/etc — ou aligné dessous)
  - Page détail (à côté du titre, niveau visuel = status)
- Email owner sur **première** vérification → consomme T-034 (Phase B). Si T-034 pas encore mergé : log + TODO, pas de blocking
- Audit trail : la transition non-vérifié → vérifié écrit `verifiedAt` + `verifiedBy` ; retirer la vérif passe `verifiedAt = null` mais on garde `verifiedBy` en historique facultatif (à décider à l'impl)
- i18n FR/MG : `listing.badge.verified.label`, `admin.listings.verify.cta`, `admin.listings.unverify.cta`, `admin.listings.verify.confirm`
**Priorité** : P1 · **Statut** : 📋 todo

### Phase B — Email transactionnels (transverse)

#### T-034 · Notifications email transactionnelles (batch 1)
**En tant qu'**utilisateur (owner/étudiant)
**Je veux** être notifié par email des events qui me concernent
**Afin de** rester engagé sans avoir à revenir manuellement
**Acceptance** :
- 3 templates dans ce batch :
  1. **"Annonce publiée"** → owner — déclenché par `publishListing` service
  2. **"Avis reçu sur ton annonce"** → owner — déclenché par `submitReview` service
  3. **"Ton annonce est vérifiée"** → owner — déclenché par `verifyListing` service (T-033)
- Localization : chaque template a une variante FR + MG ; locale lue depuis `User.locale`
- Architecture : `lib/email/templates/<event>.ts` exporte `subject(locale, data)` + `html(locale, data)` + `text(locale, data)`
- Sécurité : `escapeHtml()` systématique sur tout user content interpolé (cf memory `feedback_email_header_injection`)
- Rate-limit dédié par-event-par-userId (e.g. 10/h pour éviter spam si retry-loop)
- Liens cliquables pointent vers la page concernée (`/dashboard/listings/${id}/edit` ou page détail publique selon contexte)
- Tests : 1 unit test par template (escape HTML + variable interpolation)
**Priorité** : P1 · **Statut** : 📋 todo

### Reportés à phases ultérieures v0.5

- **Phase C — Bande passante** (E-T04) : génération `blurhash` au upload (lib `blurhash` côté serveur depuis le Buffer), stockage `Photo.blurhash`, `placeholder="blur"` systémique, script de backfill. ~1 jour.
- **E-T06 templates suivants** : "Signalement reçu" (owner), "Réponse à ton avis" (étudiant), "Demande de vérification CIN reçue/approuvée/rejetée" (owner, dépend E-T02 dégelée).
- **E-T05 badge "Propriétaire vérifié"** : bloqué par E-T02 (frozen).

### 🧊 Gel légal

#### E-T02 · Vérification propriétaire CIN
**Pourquoi gelé** : stocker une carte d'identité, même chiffrée AES-GCM, soulève des questions de protection des données personnelles à Madagascar qu'on n'a pas tranchées. Le badge "Propriétaire vérifié" reste verrouillé tant que cet épic n'est pas dégelé.
**Plan technique préparé** (à dégeler quand légalement OK) :
- Schema OwnerProfile : `cinCiphertext Bytes?`, `cinIvHex String?`, `cinAuthTagHex String?`, `cinKeyVersion Int?`, `cinUploadedAt/VerifiedAt DateTime?`, `cinVerifiedBy String?`, `cinRejectionReason String?`
- Crypto : AES-256-GCM via `lib/auth/totp.ts` pattern + `env.PII_ENCRYPTION_KEY` déjà déclaré
- Workflow : upload → magic-bytes sniff → chiffre en RAM → store ciphertext → admin queue → approve/reject → email owner
- Alternative à considérer : externaliser à un service KYC tiers (Sumsub) — pas dans le scope v0.5
**Statut** : 🧊 frozen (validation légale Madagascar requise)
---

## 🏗️ v1 — Échelle (épics)

Objectif : multi-ville + meilleure découverte.

- **E-T07** — Multi-ville (Antananarivo, Toamasina, Mahajanga, Toliara)
- **E-T08** — Favoris (étudiant peut sauvegarder des annonces)
- **E-T09** — Recherches sauvegardées + alertes email
- **E-T10** — Vue carte centrale (Leaflet/MapLibre) avec clusters par quartier
- **E-T11** — Pages SEO ville + quartier (`/fianarantsoa/`, `/fianarantsoa/andrainjato/`)
- **E-T12** — Sitemap dynamique + hreflang complet
- **E-T13** — PWA basique (offline last-viewed)
- **E-T14** — Recherche full-text Postgres

---

## 💰 v2 — Monétisation (épics)

Objectif : revenus durables.

- **E-T15** — Intégration GoalPay (`PaymentProvider` interface + adaptateur)
- **E-T16** — Annonces premium (mise en avant, top of list)
- **E-T17** — Pack visibilité propriétaire (X jours featured)
- **E-T18** — Caution / paiement premier mois via Mobile Money (à valider légalement)
- **E-T19** — Tableau de bord revenus admin
- **E-T20** — Réconciliation quotidienne GoalPay ↔ DB

---

## ❄️ Frozen / À discuter

- Messagerie interne (vs WhatsApp direct) — pas sûr que ça apporte de la valeur en v0
- App mobile native — web responsive d'abord
- Avis sur les locataires (côté propriétaire) — risques RGPD + utilité limitée

---

## Conventions

- **ID** : `T-NNN` pour stories v0, `E-TNN` pour épics post-MVP
- **Priorité** : P0 (bloquant MVP), P1 (important MVP), P2 (nice-to-have MVP)
- Quand un ticket est pris en charge, mettre 🚧 et lier le PR/commit ici
- Quand fini, mettre ✅ et la date de merge

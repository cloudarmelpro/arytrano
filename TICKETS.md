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
**Priorité** : P1 · **Statut** : ✅ done (confirmé 2026-05-22) — schema `Review.verifiedStay`, calcul au submit dans `create-review.ts` via `hasPriorContactEvent`, badge UI sur `ReviewRow` avec tooltip i18n. Le flow étudiant submit existe (form inline sur la page détail listing).

#### T-032 · EXIF strip explicite Cloudinary (audit M1)
**En tant qu'**équipe sécurité
**Je veux** retirer explicitement les EXIF (GPS notamment) avant Cloudinary
**Afin de** garantir la promesse UI "EXIF retiré" sans dépendre du comportement par défaut
**Acceptance** :
- `cloudinary.uploader.upload_stream` reçoit `{ image_metadata: false, exif: false }` dans **tous** les appels (avatar + listing photos)
- `lib/cloudinary/index.ts` mis à jour, pas de changement d'API publique
- Test manuel documenté : upload photo avec GPS → `exiftool` sur l'URL Cloudinary doit ne rien retourner
- Memory : créer `feedback_exif_strip_explicit.md`
**Priorité** : P1 · **Statut** : ✅ done (déjà appliqué) — `image_metadata: false` + `exif: false` dans tous les `upload_stream` (avatar + listing photos). Memory existante.

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
**Priorité** : P1 · **Statut** : ✅ done (confirmé 2026-05-22) — schema Listing.verifiedAt + verifiedBy, services `verifyListing` + `unverifyListing` avec preserve-original-timestamp sur re-verify, Server Action `toggleListingVerifiedAction` avec requireAdmin guard, bouton `VerifyListingButton` sur `/admin/listings`, badge `VerifiedListingBadge` sur PublicListingCard + page détail, email transactionnel `listing-verified` template + envoi à la première vérification uniquement (fail-soft).

### Phase C — Marketing surface + discovery (shipped 2026-05-20)

#### T-035 · Testimonial DB-driven sur LandingOwnerBlock
**En tant qu'**éditeur AryTrano (admin)
**Je veux** un témoignage de propriétaire affiché sur le bloc landing « Propriétaires »
**Afin de** crédibiliser la plateforme auprès des nouveaux propriétaires sans inventer une fausse Mme Rasoa
**Acceptance** : modèle Prisma `Testimonial` (audience STUDENT/OWNER, body Text, authorName, authorMeta?, sortOrder Int, publishedAt nullable) ✅ · index `(audience, publishedAt, sortOrder)` ✅ · query `getFeaturedOwnerTestimonial` cached 5 min ✅ · `LandingOwnerBlock` rend la card uniquement si `testimonial !== null` (pas de fallback fictif) ✅ · admin UI pour curer = T-041 (Phase D)
**Priorité** : P1 · **Statut** : ✅ done (2026-05-20)

#### T-036 · Quartier quiz interactif (6 questions → top 4)
**En tant que** visiteur étudiant indécis
**Je veux** un mini-quiz qui me recommande les quartiers de Fianarantsoa qui matchent mon budget, mon école et mon style
**Afin de** découvrir des quartiers que je n'aurais pas explorés sans guide
**Acceptance** : route `/quartiers/quiz` ✅ · 6 questions (budget, école, type logement, ambiance, mobilité, priorité n°1) ✅ · profils de scoring hardcodés pour les 8 quartiers seedés ✅ · service pur `scoreQuartiers` testable (11 tests Vitest) ✅ · résultats top 4 (1 hero + 3 secondaires en grid) ✅ · raisons traduites via reason codes ✅ · modèle Prisma `QuizSubmission` (locale, email?, answers Json, recommendedSlugs[], ipHash) ✅ · Server Action `submitQuizAction` + `subscribeQuizEmailAction` (conditional update WHERE email IS NULL) ✅ · rate-limit 20/h/IP fail-CLOSED ✅ · email capture optionnel sur résultats ✅
**Priorité** : P1 · **Statut** : ✅ done (2026-05-20)

#### T-037 · WhatsApp Alert capture (footer newsletter)
**En tant que** visiteur étudiant
**Je veux** laisser mon numéro WhatsApp dans le footer pour être notifié des nouvelles annonces
**Afin de** ne pas avoir à revenir tous les jours sur le site
**Acceptance** : modèle Prisma `WhatsAppAlert` (phoneE164 UNIQUE, locale, quartierSlug?, ipHash) ✅ · normalisation phone MG (operators 32/33/34/37/38/39 → E.164) avec 23 tests Vitest ✅ · Server Action `subscribeWhatsAppAlertAction` + rate-limit 5/h/IP fail-CLOSED ✅ · single-subscription policy par phone (replace destructive documenté) ✅ · footer `WhatsAppAlertForm` Client Component (try/catch + client-side validation + success/error states inline) ✅ · broadcast manuel admin = T-043
**Priorité** : P1 · **Statut** : ✅ done (2026-05-20)

#### T-038 · /quartiers vraie carte interactive (pigeon-maps + OSM)
**En tant que** visiteur
**Je veux** voir une vraie carte de Fianarantsoa avec les 8 quartiers placés sur leurs coordonnées
**Afin de** comprendre la géographie de la ville et choisir un quartier en connaissance
**Acceptance** : `pigeon-maps` 5KB JS (vs MapLibre 80KB — choix bandwidth MG) ✅ · tuiles OSM via `tile.openstreetmap.org` ✅ · pins overlay aux vrais lat/lng issus du seed ✅ · attribution OSM visible (ToS) ✅ · `attributionPrefix={false}` pour retirer la marque Pigeon ✅ · CSP `img-src` étendu pour OSM apex + wildcard ✅ · les anciennes rayures-pin-faux retirées ✅ · provider commercial pour prod = AUD-008
**Priorité** : P1 · **Statut** : ✅ done (2026-05-20)

#### T-039 · /quartiers — blocs avec vraie photo annonce
**En tant que** visiteur
**Je veux** voir une vraie photo représentative de chaque quartier
**Afin de** ne pas être face à des rayures de placeholder qui crient « site pas fini »
**Acceptance** : QuartiersBlocks utilise `sampleListings[0].photo` comme image de bloc ✅ · `next/image` plein cadre + blur placeholder ✅ · gradient bas pour lisibilité du badge nombre d'annonces ✅ · fallback dégradé coloré propre si aucune annonce dans le quartier ✅
**Priorité** : P1 · **Statut** : ✅ done (2026-05-20)

#### T-040 · /comment-ca-marche refonte honnêteté + design
**En tant que** visiteur (étudiant ou propriétaire)
**Je veux** que la page « Comment ça marche » dise uniquement ce qui est vrai du produit
**Afin de** ne pas découvrir des promesses non tenues après inscription (titre de propriété, OTP, reverse-image-search…)
**Acceptance** : 4 stats inventées (1 sur 5, 800k Ar) remplacées par stats vraies (8 quartiers, 0 commission, 24-48h, 1 par 1) ✅ · 6 vérifications alignées sur les vraies features (identité, modération éditoriale, EXIF strip, contact reveal-on-click, avis, signalement) ✅ · 5 student-flow steps nettoyés (drop OTP, acte de propriété, délai 2h14min) ✅ · 5 owner-flow steps idem ✅ · section CommentMoney supprimée (pas pertinente v0.5) ✅ · CommentFinalCta extrait + déplacé à la fin de la page ✅ · design pass : borders + shadows retirés au profit de `bg-muted/40` + transitions par teinte ✅ · timeline alternée gauche/droite pour les 5 steps ✅ · numéro 01-06 dans bulle `bg-secondary` opaque sur ligne verticale ✅
**Priorité** : P1 · **Statut** : ✅ done (2026-05-20)

#### T-041r · /proprietaires refonte honnêteté + design + FAQ Motion
**En tant que** propriétaire prospect
**Je veux** une page d'atterrissage qui ne me promet QUE ce que la plateforme fait vraiment
**Afin de** créer mon compte en confiance et ne pas être déçu après inscription
**Acceptance** : Hero stats (168/64/24h fictifs) → 0 Ar/24-48h/1 par 1 honnêtes ✅ · Step 2 « acte ou facture du logement chiffré séparé » → « CIN seul stocké Cloudinary » ✅ · 4 vérifications réécrites pour matcher les vraies features ✅ · VerifCard mock conservée mais avec badge « APERÇU » + contenu aligné sur les vraies features (plus de Mme Rasoa + 12 avis + 2h14min) ✅ · Pricing dual Standard/Premium fictif → single card « Beta v0.5 gratuit » + section roadmap honnête ✅ · FAQ q2 (« serveur séparé chiffré ») + q3 (« 5 Standard / illimité Premium ») + q6 (« partenaires Aro/Mama ») nettoyées ✅ · `ProprietairesFaqAccordion` Client Component Motion-driven (height auto + opacity, exclusive one-open, icon rotation primary) ✅ · design pass borders/shadows out ✅ · FAQPage JSON-LD survit au passage client (généré server-side) ✅
**Priorité** : P1 · **Statut** : ✅ done (2026-05-20)

---

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
**Priorité** : P1 · **Statut** : ✅ done (déjà livré) — 9 templates dans `src/lib/email/templates/` (listing-published, review-received, review-prompt, listing-verified, listing-expiring, listing-expired, report-received, review-replied, contact-received, cin-result, verify-email) + tests unitaires par template. Wrapper `sendTransactionalEmail` avec rate-limit 10/h/userId/eventType.

### Phase D — Admin curation des surfaces marketing (todo)

#### T-042 · Admin CRUD Testimonials
**En tant qu'**admin AryTrano
**Je veux** créer / éditer / publier / dépublier des témoignages affichés sur la landing
**Afin de** mettre en avant la voix des vrais propriétaires (et étudiants plus tard) sans toucher la DB en direct

**Implementation outline**
1. Créer la feature `features/admin-testimonials/` (séparée de `features/landing/` qui ne contient que les queries lecture publique)
2. Service `services/create-testimonial.ts`, `update-testimonial.ts`, `publish-testimonial.ts`, `delete-testimonial.ts` — pure functions avec validation
3. Server Actions `actions/*.ts` thin wrappers + `requireAdmin()` guard
4. Query `queries/list-admin-testimonials.ts` (tous statuts, pagination cursor 20/page, filtres audience + status)
5. Routes `app/admin/testimonials/page.tsx` (liste), `app/admin/testimonials/new/page.tsx` (création), `app/admin/testimonials/<id>/edit/page.tsx` (édition)
6. Composants `TestimonialForm.tsx` (Client), `TestimonialList.tsx` (Server), `TestimonialRow.tsx` avec actions inline
7. Lien Admin sidebar : nouvelle section « MARKETING » avec « Témoignages »
8. Sur chaque mutation : `revalidateTag('landing-testimonials')` pour rafraîchir le cache `getFeaturedOwnerTestimonial`

**Files créés**
- `src/features/admin-testimonials/services/create-testimonial.ts`
- `src/features/admin-testimonials/services/update-testimonial.ts`
- `src/features/admin-testimonials/services/publish-testimonial.ts`
- `src/features/admin-testimonials/services/delete-testimonial.ts`
- `src/features/admin-testimonials/actions/create-testimonial.ts`
- `src/features/admin-testimonials/actions/update-testimonial.ts`
- `src/features/admin-testimonials/actions/publish-testimonial.ts`
- `src/features/admin-testimonials/actions/delete-testimonial.ts`
- `src/features/admin-testimonials/queries/list-admin-testimonials.ts`
- `src/features/admin-testimonials/schemas/testimonial.ts` (Zod : body 30-500, authorName 2-80, authorMeta 0-200, sortOrder 0-9999, audience enum)
- `src/features/admin-testimonials/components/TestimonialForm.tsx`
- `src/features/admin-testimonials/components/TestimonialList.tsx`
- `src/features/admin-testimonials/components/TestimonialRow.tsx`
- `src/features/admin-testimonials/index.ts` + `server.ts`
- `src/app/admin/testimonials/page.tsx`
- `src/app/admin/testimonials/new/page.tsx`
- `src/app/admin/testimonials/[id]/edit/page.tsx`
- `src/features/admin-testimonials/__tests__/create-testimonial.test.ts`

**Files modifiés**
- `src/components/shared/AdminSidebar.tsx` : ajout section MARKETING > Témoignages
- `src/lib/i18n/messages/fr-MG.ts` + `mg.ts` : nouvelles clés `admin.testimonials.*`

**DB schema** : aucun changement (modèle `Testimonial` existe déjà T-035)

**API endpoints** (mobile-ready via E-T21) : optionnel pour v0.5 — admin ne consomme que les actions web. Si on prévoit admin mobile, prévoir `GET/POST/PATCH/DELETE /api/v1/admin/testimonials`.

**i18n keys nouvelles**
- `admin.testimonials.list.title` (« Témoignages ») / `.empty` / `.search.placeholder` / `.filter.audience.label` / `.filter.status.label` / `.filter.status.published` / `.filter.status.draft`
- `admin.testimonials.new.title` (« Nouveau témoignage ») / `.form.body.label` / `.form.authorName.label` / `.form.authorMeta.label` / `.form.audience.label` / `.form.audience.student` / `.form.audience.owner` / `.form.sortOrder.label` / `.form.submit`
- `admin.testimonials.row.publish` / `.unpublish` / `.edit` / `.delete` / `.confirmDelete`
- `admin.testimonials.toast.created` / `.updated` / `.published` / `.unpublished` / `.deleted`
- `admin.testimonials.error.bodyTooShort` / `.bodyTooLong` / `.authorNameRequired`

**Dependencies**
- T-035 (Testimonial DB model) ✅ done
- T-022 (Admin connexion) ✅ done
- Pas de blocker

**Tests**
- `create-testimonial.test.ts` : input valide → row créée avec publishedAt null par défaut · input body trop court → ZodError · audience invalide → ZodError
- `publish-testimonial.test.ts` : publish d'un brouillon → publishedAt set à now() · publish d'un déjà publié → no-op (idempotent) · admin non-authentifié → throw
- `update-testimonial.test.ts` : partial update (juste body) ne touche pas publishedAt · update protège contre les fields non-listés
- Integration : E2E Playwright « admin crée → publie → testimonial apparaît sur `/` dans les 5 min ou après revalidateTag »

**Edge cases**
- Quand `sortOrder` n'est pas fourni, default à 0
- Quand on dépublie le seul testimonial OWNER published, `LandingOwnerBlock` doit masquer la card (vérifier le `testimonial: null` path)
- Suppression définitive : confirmation par saisie texte « SUPPRIMER » (cf T-027 pattern)
- Soft delete vs hard delete : v0.5 hard delete (volumes bas, pas de besoin d'archive)

**A11y**
- Form labels via Field/FieldLabel ✅
- Bouton « Publier » avec aria-pressed reflétant le state actuel
- Sidebar nouvelle section avec aria-current sur l'item actif

**Effort estimé** : ~1 jour (services + actions + 3 routes + form + i18n)

**Priorité** : P1 · **Statut** : ✅ done (2026-05-22) — feature `features/admin-testimonials/` complète : services CRUD + 4 Server Actions (create/update/publish/delete avec requireAdmin), query paginée cursor 20/page + filtres audience+status, 3 routes `/admin/testimonials/{,/new,/[id]/edit}`, TestimonialForm Client avec useActionState + field errors + char counter, TestimonialActions inline (edit/publish/unpublish/delete Dialog), AdminSidebar section MARKETING > Témoignages, ~50 nouvelles clés i18n FR+MG. `revalidateTag('landing-testimonials', 'max')` après chaque mutation (Next 16 signature avec profile).

#### T-043 · Admin view Quiz submissions + analytics
**En tant qu'**admin
**Je veux** voir les soumissions du quiz et des stats agrégées (top quartiers recommandés, distribution budget, taux conversion email)
**Afin de** prendre des décisions produit basées sur ce que cherchent les étudiants

**Implementation outline**
1. Query `list-admin-quiz-submissions.ts` (cursor 30/page, filtres locale + dateRange + hasEmail)
2. Query `get-quiz-analytics.ts` qui agrège : budget distribution (groupBy answers->>'budget'), school distribution, priority distribution, top 8 quartiers via UNNEST(recommendedSlugs) GROUP BY, total + email conversion rate
3. Route `/admin/quiz/page.tsx` avec tabs « Liste » et « Analytics » (URL `?tab=list|analytics`)
4. Component `QuizSubmissionsTable.tsx` (Server, lit la liste) avec colonnes : date, locale, recommendedSlugs (chips), email (masqué)
5. Component `EmailRevealButton.tsx` (Client) qui appelle Server Action `revealQuizEmail(id)` → écrit dans AuditLog (nouveau model) + retourne le full email · stockage : email reste en DB tel quel, on log juste les accès
6. Component `QuizAnalyticsCharts.tsx` (Client) qui rend les charts en SVG inline (pas de lib externe — d3 ou Recharts trop lourd pour Madagascar 3G) ou via canvas natif
7. Export CSV : Server Action `exportQuizCsv(filters)` qui stream un CSV (max 1000 rows pour limiter le coût mémoire), retourne via `Content-Disposition: attachment`
8. Lien Admin sidebar : section MARKETING > « Quiz quartier »

**Files créés**
- `src/features/admin-quiz/queries/list-admin-quiz-submissions.ts`
- `src/features/admin-quiz/queries/get-quiz-analytics.ts`
- `src/features/admin-quiz/actions/reveal-quiz-email.ts`
- `src/features/admin-quiz/actions/export-quiz-csv.ts`
- `src/features/admin-quiz/services/aggregate-analytics.ts` (pure fn, testable)
- `src/features/admin-quiz/components/QuizSubmissionsTable.tsx`
- `src/features/admin-quiz/components/EmailRevealButton.tsx`
- `src/features/admin-quiz/components/QuizAnalyticsCharts.tsx`
- `src/features/admin-quiz/server.ts` + `index.ts`
- `src/app/admin/quiz/page.tsx`
- `src/features/admin-quiz/__tests__/aggregate-analytics.test.ts`

**Files modifiés**
- `prisma/schema.prisma` : nouveau model `AuditLog` (adminId, action, targetType, targetId, metadata Json, createdAt) + `@@index([adminId, createdAt])` + `@@index([targetType, targetId])`
- `src/components/shared/AdminSidebar.tsx` : ajout lien
- `src/lib/i18n/messages/*.ts` : nouvelles clés

**DB schema**
```prisma
model AuditLog {
  id         String   @id @default(cuid())
  adminId    String   // User.id with role ADMIN
  action     String   // "quiz.email.reveal" | "testimonial.publish" | ...
  targetType String   // "QuizSubmission" | "Testimonial" | "User" | "Listing"
  targetId   String   // foreign-id (no FK to allow targetType polymorphism)
  metadata   Json?    // optional context, never PII
  createdAt  DateTime @default(now())

  @@index([adminId, createdAt])
  @@index([targetType, targetId])
}
```

**API endpoints** : aucun pour v0.5 (admin web only)

**i18n keys nouvelles**
- `admin.quiz.list.title` / `.empty` / `.table.date` / `.table.locale` / `.table.recommended` / `.table.email`
- `admin.quiz.email.masked` / `.reveal.button` / `.reveal.toast` (« Email révélé — l'accès a été audité »)
- `admin.quiz.analytics.title` / `.charts.budget.title` / `.charts.school.title` / `.charts.priority.title` / `.charts.topQuartiers.title`
- `admin.quiz.export.button` / `.export.toast.started` / `.export.toast.completed`
- `admin.quiz.filter.dateRange` / `.filter.locale` / `.filter.hasEmail`

**Dependencies**
- T-036 (Quiz feature) ✅ done
- T-022 (Admin connexion) ✅ done
- AuditLog model nouveau — peut être réutilisé par T-042, T-044

**Tests**
- `aggregate-analytics.test.ts` : input simulé de 100 submissions → distribution correcte sans NaN · empty input → tous zéros, pas de crash · email rate = subset / total
- `reveal-quiz-email.test.ts` : appel non-admin → throw · appel admin → log écrit + email retourné · idempotent (multiple reveals = multiple log entries)
- Integration : admin login → ouvre `/admin/quiz` → clique Reveal sur une row → vérifie qu'un AuditLog row est créé

**Edge cases**
- Quand `answers` JSON n'a pas une clé attendue (ex : ajout d'une question Q7 plus tard), l'analytics doit afficher « N/A » au lieu de crasher
- CSV export avec caractères spéciaux (virgules dans email, quotes) → escape correct
- Email reveal pour un email null → bouton désactivé, pas d'erreur
- Pagination cursor : si une row est supprimée entre 2 fetchs, skip plutôt que crash

**A11y**
- Tab navigation entre « Liste » et « Analytics » avec `role="tablist"`
- Charts SVG avec `<title>` + `<desc>` pour SR
- Table avec `<caption>` + headers properly scoped
- EmailRevealButton avec aria-pressed (after reveal)

**Effort estimé** : ~3 jours (queries SQL groupBy + charts SVG inline + audit log infra réutilisable)

**Priorité** : P2 · **Statut** : ✅ done (2026-05-22, scope v0.5) — feature `features/admin-quiz/` : query `getQuizAnalytics` agrège (total + 7d + 30d + email opt-in rate + byLocale + answer distribution par question via in-process loop sur JSON + top 10 quartiers recommandés via String[] unnesting). 6 questions × valeurs énumérées via constante `QUIZ_ANSWER_VALUES` partagée. Route `/admin/quiz-analytics` Server Component avec 4 KPI cards + section locale + section topQuartiers + 6 blocs questions, bar charts CSS-only (zéro chart library — `width: pct%` direct, bundle léger). AdminSidebar lien "Quiz analytics" section MARKETING avec IconBarChart. ~40 nouvelles clés i18n FR+MG (incluant tous les labels questions + valeurs : budget tranches, school, housingType, vibe, mobility, priority). Scope v0.5 : pas d'export CSV, pas de filtres temporels — KPI snapshot only. V1 add filters quartier + period si volume justifie.

---

#### T-044 · Admin WhatsApp Alerts list + broadcast manuel
**En tant qu'**admin
**Je veux** voir la liste des abonnés WhatsApp et envoyer un broadcast manuel à un sous-ensemble
**Afin de** notifier les étudiants quand de nouvelles annonces sortent dans leur quartier d'intérêt

**Implementation outline**
1. Query `list-admin-whatsapp-alerts.ts` (cursor 50/page, filtres quartierSlug + locale + dateRange + hasConfirmed)
2. Query `get-alerts-stats.ts` : total subscribers, breakdown par quartier, nouveaux 7j / 30j
3. Route `/admin/whatsapp-alerts/page.tsx` avec tabs Liste / Broadcast
4. Tab Liste : table avec phone (masqué `+261 33 ** ** 67` sauf reveal), locale flag, quartierSlug pill, dateRange · multi-select via checkbox + select-all-page · footer « 12 sélectionnés »
5. Tab Broadcast : textarea du message + preview compteur chars (max 1024 pour respecter limites WhatsApp standard) + dropdown audience (« Sélection courante 12 » / « Tous quartier X » / « Tous » avec confirmation)
6. Bouton « Préparer broadcast » → ouvre un modal avec liste de batchs (chunks de 5 phones par lien `wa.me`, copier-coller manuel) + lien `wa.me/?text=<encoded>` par batch · marque chaque envoi comme `lastBroadcastAt` dans la DB (nouvelle column)
7. Bouton « Exporter CSV » : Server Action stream un CSV phone E.164 + quartierSlug + locale (limit 1000 rows, audit logged)
8. Sidebar admin : section MARKETING > « WhatsApp Alerts »

**Files créés**
- `src/features/admin-whatsapp-alerts/queries/list-admin-whatsapp-alerts.ts`
- `src/features/admin-whatsapp-alerts/queries/get-alerts-stats.ts`
- `src/features/admin-whatsapp-alerts/actions/export-alerts-csv.ts`
- `src/features/admin-whatsapp-alerts/actions/record-broadcast.ts` (marque les rows comme lastBroadcastAt + écrit AuditLog)
- `src/features/admin-whatsapp-alerts/actions/reveal-alert-phone.ts`
- `src/features/admin-whatsapp-alerts/components/AlertsTable.tsx` (Client pour multi-select state)
- `src/features/admin-whatsapp-alerts/components/BroadcastComposer.tsx`
- `src/features/admin-whatsapp-alerts/components/AlertsStats.tsx`
- `src/features/admin-whatsapp-alerts/components/PhoneRevealButton.tsx`
- `src/features/admin-whatsapp-alerts/server.ts` + `index.ts`
- `src/app/admin/whatsapp-alerts/page.tsx`

**Files modifiés**
- `prisma/schema.prisma` : ajouter `lastBroadcastAt DateTime?` sur WhatsAppAlert
- `src/components/shared/AdminSidebar.tsx`
- `src/lib/i18n/messages/*.ts`

**DB schema**
```prisma
// Patch sur WhatsAppAlert :
lastBroadcastAt DateTime?  // tracks when this number last received a broadcast
```
+ Migration `20260521_add_last_broadcast_at`

**API endpoints** : aucun (admin web only)

**i18n keys nouvelles**
- `admin.whatsappAlerts.list.title` / `.table.phone` / `.table.quartier` / `.table.locale` / `.table.subscribedAt` / `.table.lastBroadcast`
- `admin.whatsappAlerts.broadcast.title` / `.composer.placeholder` / `.composer.charCount` / `.audience.selection` / `.audience.allInQuartier` / `.audience.all`
- `admin.whatsappAlerts.broadcast.confirm.title` / `.confirm.body` (« Tu vas envoyer à 47 numéros — confirme ») / `.confirm.cancel` / `.confirm.proceed`
- `admin.whatsappAlerts.broadcast.batch.title` (« Batch 1 / 10 ») / `.batch.openWhatsApp` (« Ouvrir WhatsApp Web ») / `.batch.markSent`
- `admin.whatsappAlerts.export.button` / `.stats.total` / `.stats.last7d` / `.stats.byQuartier`
- `admin.whatsappAlerts.phone.reveal` / `.phone.masked`

**Dependencies**
- T-037 (WhatsApp Alert schema) ✅ done
- T-045 (unsubscribe token) — recommandé avant le broadcast pour respect RGPD MG
- AuditLog model (T-043) à mutualiser

**Tests**
- `record-broadcast.test.ts` : marque les rows ciblés, écrit AuditLog, n'inclut PAS les rows unsubscribed
- `list-admin-whatsapp-alerts.test.ts` : filtres combinables (quartier + locale + date), exclut unsubscribed quand demandé
- Integration : admin sélectionne 5 rows, prépare broadcast, vérifie que 5 entries AuditLog créées avec target type=WhatsAppAlert

**Edge cases**
- Si tous les rows sélectionnés sont unsubscribed (cas tordu où l'admin n'a pas refresh la page), bouton broadcast disabled avec message
- Limite WhatsApp Web sur clicks rapides : chunker en batchs de 5 et insérer un délai visuel (« Attends 2s avant le next » countdown)
- Phone reveal : un par un, pas de « reveal all » (anti-dump)
- Tronquer le message si > 1024 chars avec warning compteur

**A11y**
- Multi-select avec keyboard (Shift+Click range, Ctrl+A)
- Annonce du compteur sélectionnés via `aria-live`
- Modal broadcast avec focus trap (Base UI Dialog)
- Bouton « Marquer envoyé » avec confirmation visuelle (toast + change badge couleur)

**Effort estimé** : ~3 jours (table multi-select + composer + batchs WhatsApp Web)

**Priorité** : P2 · **Statut** : ✅ done (2026-05-22, duplicate ticket — cf T-044 plus bas pour le détail).

---

#### T-045 · Public unsubscribe link pour WhatsApp Alerts
**En tant qu'**abonné WhatsApp Alert
**Je veux** me désabonner sans contacter le support
**Afin de** respecter ma vie privée et la loi

**Implementation outline**
1. Migration Prisma : ajouter `unsubscribedAt DateTime?` + `unsubscribeToken String? @unique` sur WhatsAppAlert
2. Au subscribe (T-037) : générer un token long-lived (crypto.randomBytes(24).toString('base64url')) + persister
3. Inclure le lien `https://arytrano.mg/u/<token>` dans le confirmation message + tous les futurs broadcasts manuels (T-044 composer template)
4. Route `app/u/[token]/page.tsx` (public, no-auth) : Server Component qui appelle le service `unsubscribe(token)`
5. Service `unsubscribe-by-token.ts` : SELECT WhatsAppAlert WHERE token + unsubscribedAt IS NULL → SET unsubscribedAt = now()
6. Composant `UnsubscribePage.tsx` : 3 états — loading / success / token invalid · success affiche « Tu es désabonné, on est tristes mais on respecte. Adieu 👋 » avec lien retour `/`
7. Mettre à jour queries broadcast (T-044) pour exclure `WHERE unsubscribedAt IS NOT NULL`
8. Backfill : pour les rows existantes sans token, générer un token au prochain access (lazy migration) OU script one-shot

**Files créés**
- `src/features/alerts/services/unsubscribe-by-token.ts`
- `src/features/alerts/services/generate-unsubscribe-token.ts`
- `src/app/u/[token]/page.tsx`
- `src/features/alerts/components/UnsubscribeView.tsx`
- `prisma/migrations/<timestamp>_add_unsubscribe_token/migration.sql`
- `prisma/seed-helpers/backfill-unsubscribe-tokens.ts` (script one-shot)
- `src/features/alerts/__tests__/unsubscribe-by-token.test.ts`

**Files modifiés**
- `prisma/schema.prisma` : `unsubscribedAt` + `unsubscribeToken`
- `src/features/alerts/actions/subscribe-whatsapp-alert.ts` : génère le token à la création
- `src/features/alerts/schemas/whatsapp-alert.ts` : pas de changement
- `src/lib/i18n/messages/*.ts` : clés `unsubscribe.*`

**DB schema**
```prisma
// Patch sur WhatsAppAlert :
unsubscribedAt   DateTime?  // null = encore actif
unsubscribeToken String?    @unique  // long-lived, généré au signup
```

**API endpoints**
- `GET /u/:token` route publique (Server Component, pas REST) — le mobile pourrait avoir besoin du même flow plus tard mais v1 web only

**i18n keys nouvelles**
- `unsubscribe.title` (« Te désabonner ») / `.loading` / `.success.title` / `.success.body` / `.success.cta` (« Retour à AryTrano »)
- `unsubscribe.error.invalidToken` (« Lien invalide ou expiré ») / `.error.alreadyUnsubscribed` (« Tu étais déjà désabonné — bonne journée »)
- Côté broadcast composer T-044 : `admin.whatsappAlerts.broadcast.unsubscribeLink.hint` (« N'oublie pas d'inclure le lien de désabonnement dans le message »)

**Dependencies**
- T-037 (WhatsApp Alert) ✅ done

**Tests**
- `unsubscribe-by-token.test.ts` : token valide → unsubscribedAt set, idempotent (2e call = no-op) · token inconnu → throw NotFoundError · token avec unsubscribedAt déjà set → message « déjà désabonné »
- `generate-unsubscribe-token.test.ts` : 1000 generations → 1000 uniques (collision check)
- Integration : subscribe (génère token) → fetch `/u/<token>` → vérifie DB · re-fetch même token → message déjà désabonné

**Edge cases**
- Backfill : 1000+ rows existantes sans token → script async qui fait UPDATE par batches de 100, pas en single transaction
- Token guess : `crypto.randomBytes(24).toString('base64url')` = 32 chars (192 bits entropy) — non-bruteforce-able
- URL slug `/u/<token>` — peut conflict avec `/u` autre route ? vérifier (probable que non vu la structure actuelle)
- Si l'admin renvoie un broadcast au même numéro post-unsubscribe (T-044 doit exclure), le flow tourne quand même mais ne devrait pas arriver

**A11y**
- Page success : H1 + paragraphe + bouton « Retour » accessible clavier
- Loading state avec `<output role="status">`
- Error state avec `role="alert"`

**Effort estimé** : ~1.5 jour (schema + service + page + backfill script + tests)

**Priorité** : P1 · **Statut** : ✅ done (2026-05-22, ticket dupliqué dans TICKETS.md — voir première occurrence T-045 plus haut pour le détail complet).

#### T-044 · Admin WhatsApp Alerts list + broadcast manuel
**En tant qu'**admin
**Je veux** voir la liste des abonnés WhatsApp et envoyer un broadcast manuel à un sous-ensemble
**Afin de** notifier les étudiants quand de nouvelles annonces sortent dans leur quartier d'intérêt
**Acceptance** : route `/admin/whatsapp-alerts` · liste paginée 50/page avec filtres (quartierSlug, locale, createdAt range) · sélection multi-row + bouton « Préparer broadcast » → génère un lien `https://wa.me/?text=…` pré-rempli pour copier-coller groupe par groupe (v0.5 manuel, pas d'API) · stats top : nombre total, nb par quartier, nouveaux des 7 derniers jours · export CSV des phones E.164 pour broadcast batch externe · i18n FR/MG · respect single-subscription policy (T-037 doc)
**Priorité** : P2 · **Statut** : ✅ done (2026-05-22, scope v0.5) — feature `features/admin-alerts/` : query `listWhatsAppAlerts` paginée 50/page filtres quartier+locale (exclut `unsubscribedAt IS NOT NULL` côté DB), query `getAlertsStats` (total + byLocale FR/MG + byQuartier + 7d + désabonnés), service `buildSubscribersCsv` RFC-4180 + BOM UTF-8 + escape anti-formula-injection (Excel/Sheets), Server Action `exportSubscribersCsvAction` requireAdmin filtre ids OR filtres globaux, route `/admin/whatsapp-alerts` avec 4 KPI cards + 2 filtres Select dans URL params + table avec multi-select checkbox (toggle one/all/indeterminate) + bouton Export all et Export selected, client trigger Blob download, AdminSidebar lien "Alertes WhatsApp" section MARKETING avec IconMegaphone, ~25 clés i18n FR+MG. **Scope v0.5** : pas de génération de wa.me text pré-rempli (l'admin compose son message dans WhatsApp Business directement). Si besoin v1 : ajouter un panel `BroadcastTemplate` qui formate `https://wa.me/<phone>?text=<msg>` par ligne sélectionnée.

#### T-045 · Public unsubscribe link pour WhatsApp Alerts
**En tant qu'**abonné WhatsApp Alert
**Je veux** me désabonner sans contacter le support
**Afin de** respecter ma vie privée et la loi
**Acceptance** : ajouter colonnes `unsubscribedAt DateTime?` + `unsubscribeToken String? @unique` sur WhatsAppAlert · au subscribe, générer + persister un token long-lived (cuid v2 ou crypto random base64) · email/WhatsApp message inclut un lien `https://arytrano.mg/u/<token>` qui marque `unsubscribedAt = now()` côté DB sans login · page de confirmation simple « Tu es désabonné, ciao » · queries broadcast doivent ignorer `unsubscribedAt IS NOT NULL` · i18n FR/MG · cf AUD-009
**Priorité** : P1 · **Statut** : ✅ done (2026-05-22) — schema migration `20260522060000_add_whatsapp_unsubscribe` (unsubscribedAt + unsubscribeToken unique + index), services `generate-unsubscribe-token.ts` (crypto.randomBytes 24→base64url 192-bit) + `unsubscribe-by-token.ts` (idempotent), subscribe action génère le token et re-active sur re-subscribe en gardant le token stable, route publique `/u/[token]` 200 partout (don't leak token existence) avec 3 états success/already/invalid, 5 clés i18n FR+MG. Future broadcast cron filtrera `WHERE unsubscribedAt IS NULL`.

---

### Phase E — Owner experience (todo)

#### T-046 · Owner dashboard — stats détaillées par annonce
**En tant que** propriétaire connecté
**Je veux** voir des stats par annonce (vues, contacts, conversion clic/contact, breakdown par canal WhatsApp vs téléphone, timeline 30 jours)
**Afin de** comprendre lesquelles de mes annonces marchent et lesquelles je dois améliorer

**Implementation outline**
1. Ajouter un compteur de vues anonymes : table `ListingView` (listingId, ipHash, sessionToken?, createdAt) — dédup par (listingId, ipHash, jour) pour ne pas compter 50 refresh d'un même visiteur
2. Beacon non-bloquant sur la page détail : `<script>` simple qui fire-and-forget POST `/api/internal/track-view` (Server Action exposée via route handler) au mount
3. Query `get-listing-stats.ts` qui agrège : (a) ContactEvent groupBy(date, channel) sur N jours · (b) ListingView groupBy(date) · (c) totaux période courante / période précédente
4. Route `app/dashboard/listings/[id]/stats/page.tsx` (auth-gated + ownership check)
5. Component `StatsSparkline.tsx` (Client SVG inline) qui rend les deux séries vues/contacts sur un axe partagé · ~3KB total
6. Component `StatsBreakdown.tsx` (Server) : 2 cards « WhatsApp clicks » + « Phone clicks » avec pourcentages
7. Component `StatsKpi.tsx` (Server) : 4 KPI tuiles (vues 30j, contacts 30j, taux conversion %, évolution vs période N-1 ↑/↓)
8. Time-range selector : tabs `[7j | 30j | 90j | 180j]` via URL query `?range=30`
9. Empty state : annonce < 7 jours → message « Reviens dans X jours pour des stats représentatives »

**Files créés**
- `prisma/migrations/<ts>_add_listing_view/migration.sql`
- `src/features/listings/queries/get-listing-stats.ts`
- `src/features/listings/services/record-listing-view.ts` (dédup par jour)
- `src/features/listings/actions/track-listing-view.ts` (anonymous, no auth)
- `src/app/api/internal/track-view/route.ts` (POST minimal endpoint)
- `src/app/dashboard/listings/[id]/stats/page.tsx`
- `src/features/listings/components/StatsSparkline.tsx`
- `src/features/listings/components/StatsBreakdown.tsx`
- `src/features/listings/components/StatsKpi.tsx`
- `src/features/listings/components/StatsRangeTabs.tsx`
- `src/features/listings/__tests__/get-listing-stats.test.ts`

**Files modifiés**
- `prisma/schema.prisma` : nouveau model `ListingView`
- `src/app/(public)/[citySlug]/[neighborhoodSlug]/[listingSlug]/page.tsx` : injecter le beacon `<script>` minimal (avec CSP nonce, cf memory)
- `src/components/shared/Header.tsx` : pas de changement
- `src/lib/i18n/messages/*.ts` : clés `dashboard.listings.stats.*`

**DB schema**
```prisma
model ListingView {
  id        String   @id @default(cuid())
  listingId String
  ipHash    String?  // SHA-256(ip + AUTH_SECRET), null si proxy fail
  // Dédup par jour : on stocke la date sans heure pour la query d'agrégation
  viewedOn  DateTime @db.Date
  createdAt DateTime @default(now())

  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([listingId, ipHash, viewedOn], name: "listing_unique_view_per_day")
  @@index([listingId, viewedOn])
}
```

**API endpoints**
- `POST /api/internal/track-view { listingId }` — anonymous, rate-limit 60/min/IP
- `GET /api/v1/me/listings/:id/stats?range=30` — pour mobile app (auth Bearer), retourne le même shape que la query SSR
- Rate-limit additions : `rateLimiters.trackView(ipHash)` 60/min/IP

**i18n keys nouvelles**
- `dashboard.listings.stats.title` / `.range.7d` / `.range.30d` / `.range.90d` / `.range.180d`
- `dashboard.listings.stats.kpi.views` / `.kpi.contacts` / `.kpi.conversion` / `.kpi.trend`
- `dashboard.listings.stats.breakdown.title` / `.breakdown.whatsapp` / `.breakdown.phone`
- `dashboard.listings.stats.empty.young` (« Reviens dans {days} jours ») / `.empty.noActivity`
- `dashboard.listings.stats.chart.legend.views` / `.legend.contacts`

**Dependencies**
- T-019 (ContactEvent) ✅ done
- T-022 (Owner dashboard) ✅ done
- Nouvelle infra anonymous tracking — la 1ère fois qu'on track quoi que ce soit côté visiteur

**Tests**
- `get-listing-stats.test.ts` : 100 events simulés → agrégation correcte par jour · range=7d retourne 7 buckets · empty range retourne tous zéros
- `record-listing-view.test.ts` : 2 calls même jour même IP → 1 seule row · 2 IPs différentes → 2 rows · listing inexistant → throw
- E2E : owner visite stats vide → message empty · owner contacte sa propre annonce (test scenario) → contact count incrémenté · refresh page de détail 50x → 1 seule vue comptée

**Edge cases**
- Owner regarde ses propres annonces → on n'incrémente PAS la vue (filtrer si session userId === owner.id)
- ipHash null (proxy fail) → on track quand même avec ipHash=null mais dédup par (listingId, null, date) qui collapse tout en 1 row/jour pour ces cas
- Cron de purge ListingView après 365j (rétention privacy)
- Si listing supprimé/SUSPENDED, garder les stats accessibles à l'owner (mais pas updateable)

**A11y**
- Charts SVG avec `<title>` + `<desc>` détaillés
- Tabs range navigation clavier
- KPI tuiles avec ratio annoncé en SR-only (`"32 contacts, +18% vs période précédente"`)

**Effort estimé** : ~2.5 jours (ListingView + queries SQL + beacon + 4 components + tests)

**Priorité** : P1 · **Statut** : ✅ done (2026-05-22, scope v0.5) — query `getListingStats(listingId, ownerId)` agrégée (total contacts + 30d split par canal WhatsApp/PHONE + reviews count + avg rating + conversion + 5 derniers contacts sans PII) avec auth check au niveau DB (WHERE ownerId), route `/dashboard/listings/[id]/stats` Server Component (4 StatCards + RecentContactRow list + privacy note), bouton « Stats » avec IconChart sur chaque card de `/dashboard/listings`, 17 nouvelles clés i18n FR+MG. Cohérent avec l'email T-047 (statsUrl pointe ici). Note : scope v0.5 = stats agrégées (pas de vue par jour / sparkline) — la table `ListingView` distincte des `ContactEvent` reste un upgrade v1 si on veut tracker les vues anonymes.

---

#### T-047 · Owner notifié par email à chaque nouveau contact
**En tant que** propriétaire
**Je veux** un email simple à chaque clic « Contacter » sur mes annonces
**Afin de** ne pas avoir besoin de refresh le dashboard

**Implementation outline**
1. Étendre `recordContactClick` service pour fire-and-forget un email après l'insert ContactEvent (sans bloquer le flow de reveal phone côté visiteur)
2. Nouveau template email `lib/email/templates/contact-received.{fr,mg}.ts` qui exporte subject + html + text
3. Rate-limit via `rateLimiters.transactionalEmail(userId, 'contact-received')` 10/h pour anti-spam
4. Vérifier `User.contactNotificationsEnabled` (nouveau champ) avant d'envoyer · par défaut true · UI opt-out dans `/dashboard/settings`
5. Lien dans l'email pointe vers `/dashboard/listings/<id>/stats` (T-046)
6. Aggregate digest mode (optionnel v1) : si > 5 contacts en 1h, batcher en email digest

**Files créés**
- `src/lib/email/templates/contact-received-fr.ts`
- `src/lib/email/templates/contact-received-mg.ts`
- `src/features/listings/services/notify-owner-contact.ts` (fire-and-forget wrapper)
- `src/features/listings/__tests__/notify-owner-contact.test.ts`
- `src/lib/email/templates/__tests__/contact-received.test.ts` (escape + interpolation)

**Files modifiés**
- `prisma/schema.prisma` : `User.contactNotificationsEnabled Boolean @default(true)`
- `src/features/listings/services/record-contact-click.ts` : call `notify-owner-contact` après insert (try/catch — non bloquant)
- `src/app/dashboard/settings/page.tsx` : toggle opt-out
- `src/features/auth/actions/update-profile.ts` : accepter `contactNotificationsEnabled` patch
- `src/lib/i18n/messages/*.ts` : clés settings + email subjects/bodies

**DB schema**
```prisma
// Patch sur User :
contactNotificationsEnabled Boolean @default(true)
```
Migration `<ts>_add_user_contact_notif_pref`

**API endpoints**
- `PATCH /api/v1/users/me { contactNotificationsEnabled }` — déjà exposé via mobile profile endpoint, juste ajouter le field au Zod schema

**i18n keys nouvelles**
- `email.contactReceived.subject` (« {studentTeaser} s'intéresse à ton annonce {listingTitle} » — pas le nom du student, juste un teaser anonyme)
- `email.contactReceived.bodyTitle` / `.bodyHello` / `.bodyAction` / `.bodyChannel.whatsapp` / `.bodyChannel.phone` / `.bodyCta` / `.bodyFooter.optOut`
- `settings.notifications.title` / `.contactReceived.label` / `.contactReceived.help`

**Dependencies**
- T-034 (Email templates infra) — devrait être fait avant
- T-019 (ContactEvent) ✅ done
- T-046 (lien vers stats) — pas bloquant mais cohérent

**Tests**
- `notify-owner-contact.test.ts` : owner avec opt-out=false → pas d'email · owner avec opt-out=true → email envoyé · rate-limit hit → pas d'email + log warning
- `contact-received.test.ts` : escape HTML dans tous les variables interpolées (titre annonce avec `<script>` injecté → escape correct) · MG vs FR templates rendent bien

**Edge cases**
- Si l'email gateway (Gmail SMTP) down, on ne fail PAS le reveal phone (try/catch + log)
- Owner sans email valide (cas tordu) → skip silently
- Rate-limit hit ne veut pas dire échec du reveal — visiteur ne doit jamais voir d'erreur côté son flow
- Cas où owner se contacte lui-même (test) → vérifier qu'on ne lui envoie pas un email

**A11y**
- Email HTML avec hiérarchie H1-H2 propre + lang attribute (`lang="fr-MG"` ou `lang="mg"`)
- Lien CTA en pleine largeur, bg-primary, text-white — verifier contrast en email-clients (Outlook etc)
- Plain-text fallback complet via le `text(...)` exporté

**Effort estimé** : ~1.5 jour (depend de l'état T-034)

**Priorité** : P1 · **Statut** : ✅ done (2026-05-22) — schema migration `20260522060500_add_user_contact_notif_pref` (User.contactNotificationsEnabled bool default true), email template `lib/email/templates/contact-received.ts` FR+MG (channel-aware WhatsApp/PHONE, anonymous — no student info), new TransactionalEventType `contact-received`, service `notify-owner-contact.ts` fire-soft skip conditions (opted-out / no email), hook fire-and-forget `void notifyOwnerContact(...)` dans `record-contact-click.ts` après l'insert ContactEvent (le reveal phone côté étudiant ne se bloque jamais sur SMTP), NotificationsSection Client Component (toggle optimistic + toast feedback) + Server Action `toggleContactNotificationsAction` avec auth guard + revalidatePath, intégré dans /dashboard/settings derrière condition role === OWNER|ADMIN, 9 nouvelles clés i18n FR+MG. Tests 115/115.

---

#### T-048 · Owner peut répondre à un avis
**En tant que** propriétaire ayant reçu un avis
**Je veux** publier une réponse publique à l'avis
**Afin d'**expliquer mon côté ou répondre à un retour négatif

**Implementation outline**
1. Vérifier l'état actuel : `OwnerResponseBubble.tsx` existe + `model OwnerResponse` ? Si oui, juste finaliser l'intégration · sinon créer
2. Schema (si pas encore) : `OwnerResponse` (reviewId UNIQUE, body Text, createdAt, updatedAt) + relation 1:1 avec Review
3. Service `submit-owner-response.ts` (validate reviewId belongs to owner's listing, escape HTML, 500 max chars)
4. Server Action `submitOwnerResponseAction` thin wrapper
5. Service `update-owner-response.ts` + `delete-owner-response.ts`
6. UI : bouton « Répondre » sous chaque Review sur la page publique détail listing (si auth + own listing) + sur `/dashboard/listings/<id>/reviews`
7. Form inline avec textarea + counter chars + Cancel/Submit
8. Email étudiant via T-034 « ton avis a reçu une réponse »

**Files créés (si pas déjà)**
- `src/features/reviews/services/submit-owner-response.ts`
- `src/features/reviews/services/update-owner-response.ts`
- `src/features/reviews/services/delete-owner-response.ts`
- `src/features/reviews/actions/submit-owner-response.ts`
- `src/features/reviews/actions/update-owner-response.ts`
- `src/features/reviews/actions/delete-owner-response.ts`
- `src/features/reviews/components/OwnerResponseForm.tsx` (Client)
- `src/lib/email/templates/review-response-{fr,mg}.ts`
- `src/features/reviews/__tests__/submit-owner-response.test.ts`

**Files modifiés**
- `prisma/schema.prisma` : ajouter OwnerResponse si absent (vérifier)
- `src/features/reviews/components/OwnerResponseBubble.tsx` : intégrer le bouton « Répondre » + le form inline
- `src/features/reviews/components/ReviewRow.tsx` : afficher la réponse si présente
- `src/lib/i18n/messages/*.ts`

**DB schema (à confirmer / créer si absent)**
```prisma
model OwnerResponse {
  id        String   @id @default(cuid())
  reviewId  String   @unique
  body      String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  review Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
}
```

**API endpoints**
- `POST /api/v1/reviews/:reviewId/response { body }` — auth required, ownership check
- `PATCH /api/v1/reviews/:reviewId/response { body }` — owner only
- `DELETE /api/v1/reviews/:reviewId/response` — owner only

**i18n keys nouvelles**
- `reviews.ownerResponse.cta` (« Répondre ») / `.placeholder` / `.charCount` / `.cancel` / `.submit`
- `reviews.ownerResponse.label` (« Réponse du propriétaire »)
- `reviews.ownerResponse.edited` (« Modifié »)
- `email.reviewResponse.subject` / `.body*`

**Dependencies**
- Review feature already implemented (T-031 partial)
- T-022 ✅ done
- T-034 pour l'email

**Tests**
- `submit-owner-response.test.ts` : owner submit → succès · non-owner submit → throw · body trop long → ZodError · 2 submits sur la même review → 2e fail (UNIQUE constraint)
- `update-owner-response.test.ts` : owner update sa réponse → succès · autre owner update → throw
- E2E : owner répond → étudiant reçoit email · visiteur public voit la réponse sous l'avis

**Edge cases**
- Si la review est supprimée (cascade), la response est supprimée aussi
- Owner peut éditer sa réponse 24h après publication puis lock (cohérent avec student review T-050)
- Empty submit ne crée pas de row vide
- Owner peut effacer sa réponse complètement (delete) — record d'audit dans AuditLog ?

**A11y**
- Form textarea avec `<label>` et `aria-describedby` pour le compteur chars
- Bouton « Répondre » avec aria-expanded quand le form est ouvert
- Réponse rendue avec `aria-labelledby` pointant vers le titre de la review parente

**Effort estimé** : ~1 jour (si schema + composant existent partiellement, sinon 2j)

**Priorité** : P2 · **Statut** : ✅ done (confirmé 2026-05-22) — schema `Review.ownerResponse` + `ownerResponseAt`, services `respond-to-review.ts` + `delete-owner-response.ts`, Server Actions correspondantes, composants `OwnerResponseForm` (Client, edit/create/delete) + `OwnerResponseBubble` (Server display sur ReviewRow), email template `review-replied.ts` envoyé à l'auteur de l'avis, rate-limit + auth guard (owner du listing uniquement).

---

#### T-049 · Alerte expiration annonce (60j)
**En tant que** propriétaire
**Je veux** être prévenu 7 jours avant que mon annonce expire (60j publié)
**Afin de** la renouveler / éditer / mettre offline en conscience

**Implementation outline**
1. Ajouter `Listing.expiresAt DateTime?` calculé à `publishedAt + 60d` au moment du publish (service `publish-listing.ts`)
2. Cron quotidien `cron/check-expiring-listings.ts` qui : (a) sélectionne listings avec `expiresAt BETWEEN now() AND now()+7d AND status=PUBLISHED AND lastReminderSentAt IS NULL OR < expiresAt-7d` · (b) envoie email rappel via T-034 · (c) update `lastReminderSentAt`
3. Au passage `expiresAt < now()`, transition automatique `PUBLISHED → EXPIRED` (nouveau enum value) — listing reste lisible publiquement mais hidden des `list-public-listings`
4. UI dashboard : badge « Expire bientôt » sur cards listing avec `expiresAt - now() < 7d` · bouton « Renouveler » qui appelle Server Action → reset `publishedAt = now()` + `expiresAt = now() + 60d`
5. Vercel Cron (`vercel.json` config) ou external scheduler (cron-job.org) qui hit `POST /api/cron/check-expiring-listings` avec un secret token header
6. Manual re-publish flow : owner clique « Renouveler » sur EXPIRED listing → re-trigger workflow (avec validation manuelle si écoulé > 30j)

**Files créés**
- `src/app/api/cron/check-expiring-listings/route.ts` (Bearer secret check + run script)
- `src/features/listings/services/check-expiring-listings.ts` (pure orchestrator)
- `src/features/listings/services/renew-listing.ts`
- `src/features/listings/actions/renew-listing.ts`
- `src/lib/email/templates/listing-expiring-{fr,mg}.ts`
- `src/features/listings/__tests__/check-expiring-listings.test.ts`
- `vercel.json` : `{ "crons": [{ "path": "/api/cron/check-expiring-listings", "schedule": "0 8 * * *" }] }`

**Files modifiés**
- `prisma/schema.prisma` : ajouter `expiresAt DateTime?` + `lastReminderSentAt DateTime?` sur Listing · ajouter EXPIRED dans enum ListingStatus
- `src/features/listings/services/publish-listing.ts` : set `expiresAt = publishedAt + 60d`
- `src/features/listings/queries/list-public-listings.ts` : exclure status=EXPIRED
- `src/features/listings/queries/list-admin-listings.ts` : autoriser filter EXPIRED
- `src/features/listings/components/ListingDashboardCard.tsx` : badge expiring + bouton Renouveler
- `src/lib/env.ts` : ajouter `CRON_SECRET`

**DB schema**
```prisma
// Patch sur Listing :
expiresAt          DateTime?
lastReminderSentAt DateTime?

// Patch sur enum ListingStatus :
enum ListingStatus {
  DRAFT
  PUBLISHED
  UNAVAILABLE
  EXPIRED       // nouveau
  SUSPENDED
  DELETED
}
```

**API endpoints**
- `POST /api/cron/check-expiring-listings` — secret-protected (Bearer match env CRON_SECRET)
- `POST /api/v1/listings/:id/renew` — owner only

**i18n keys nouvelles**
- `dashboard.listings.badge.expiringIn` (« Expire dans {days} jours ») / `.expired`
- `dashboard.listings.renew.cta` (« Renouveler ») / `.renew.confirm` / `.renew.success`
- `email.listingExpiring.subject` / `.body*` / `.renewCta`

**Dependencies**
- T-008 (Publication) ✅ done
- T-034 (Emails) à préparer si pas done
- Vercel deployment (pour le cron) ou external scheduler

**Tests**
- `check-expiring-listings.test.ts` : seeder 5 listings avec différents expiresAt → seuls ceux dans la fenêtre 7j sont récupérés · ré-run le même jour ne renvoie pas double email (lastReminderSentAt check)
- `renew-listing.test.ts` : owner renouvelle → expiresAt = now+60 · non-owner renouvelle → throw · listing SUSPENDED ne peut pas être renouvelé
- `publish-listing.test.ts` : vérifier que expiresAt est set au publish

**Edge cases**
- Cron qui rate un jour (Vercel down) : la fenêtre 7j accomode 1 jour de skip · rattrapage par-design
- Owner désactive son compte avant l'expiry : skip l'email + log
- Listing UNAVAILABLE → est-ce qu'on expire quand même ? Décision : oui, l'expiry est temporelle pas conditionnelle à status
- Cron secret leak : rotate via env var redeploy

**A11y**
- Badge expiring avec contraste OK sur la card
- Bouton Renouveler avec aria-label explicite
- Confirmation modal accessible (focus trap + ESC close)

**Effort estimé** : ~2 jours (cron + service + email + UI)

**Priorité** : P2 · **Statut** : ✅ done (2026-05-22) — schema migration `20260522134700_add_listing_expiration` (Listing.expiresAt + expirationAlertSentAt + composite index status+expiresAt), constante `LISTING_TTL_DAYS=60` exportée depuis `publish-listing.ts`, publishListing set expiresAt = now+60d + reset expirationAlertSentAt à chaque publish, service `processListingExpirations` orchestrator 2-passes (warning 7d via `listing-expiring` email + auto-expire PUBLISHED→UNAVAILABLE via `listing-expired` email), route `/api/cron/listing-expiration` Bearer-protégée + Sentry capture, service `extendListingExpiration` + Server Action `extendListingExpirationAction` avec auth guard (refuse SUSPENDED, supporte UNAVAILABLE→PUBLISHED republish flow), query `listOwnerListings` ajoute `expiryClass` (safe/warning/urgent/expired/null) calculé en query layer (pas dans le render — React Compiler), composant `ExtendExpirationButton` Client avec toast feedback (Prolonger vs Republier selon status), `ExpiryHint` inline avec tone color (red/amber/grey) sur `/dashboard/listings`, 2 nouveaux `TransactionalEventType` listing-expiring + listing-expired, 10 clés i18n FR+MG, runbook contabo-deployment.md §10b.4 systemd timer 09:30 UTC.

---

### Phase F — Étudiant experience (todo)

#### T-050 · Étudiant soumet un avis après contact
**En tant qu'**étudiant qui a contacté un propriétaire via la plateforme
**Je veux** laisser un avis sur l'expérience (annonce conforme, accueil du proprio, qualité du logement)
**Afin d'**aider les futurs étudiants à choisir

**Implementation outline**
1. Cron quotidien `cron/prompt-review.ts` qui sélectionne les ContactEvents avec `createdAt < now()-14d AND userId IS NOT NULL AND NOT EXISTS (Review WHERE userId+listingId)` → envoie email « Tu as contacté X, laisse-nous un avis »
2. Route `/listings/<id>/review/new` (auth-gated) qui ouvre le form
3. Service `submit-review.ts` qui vérifie : (a) auth · (b) ContactEvent existe pour (userId, listingId) avec createdAt > 7j · (c) pas de Review existante (UNIQUE constraint check)
4. Form : Star rating component (1-5), body textarea (30-1000 chars), submit
5. Set `Review.verifiedStay = true` si ContactEvent eligible (cf T-031 logic)
6. Email notification owner via T-047 / T-034
7. UI : carrousel étoiles + textarea + bouton submit avec loading state
8. Page « Merci » post-submit avec lien vers la review publique

**Files créés**
- `src/features/reviews/services/submit-review.ts` (si pas déjà fait — vérifier)
- `src/features/reviews/services/check-eligibility.ts` (peut-il review ? returns reason)
- `src/features/reviews/actions/submit-review.ts`
- `src/features/reviews/schemas/review.ts` (Zod : rating 1-5 Int, body 30-1000)
- `src/features/reviews/components/ReviewForm.tsx` (Client)
- `src/features/reviews/components/StarRating.tsx` (Client, accessible)
- `src/app/listings/[id]/review/new/page.tsx`
- `src/app/listings/[id]/review/thanks/page.tsx`
- `src/app/api/cron/prompt-review/route.ts`
- `src/lib/email/templates/review-prompt-{fr,mg}.ts`
- `src/features/reviews/__tests__/submit-review.test.ts`
- `src/features/reviews/__tests__/check-eligibility.test.ts`

**Files modifiés**
- `prisma/schema.prisma` : vérifier que Review.verifiedStay existe (cf T-031) — sinon ajouter
- `src/features/reviews/components/ReviewRow.tsx` : afficher la badge verifiedStay
- `src/lib/i18n/messages/*.ts` : clés `reviews.submit.*`
- `vercel.json` : ajouter le cron

**DB schema** : modèle Review existe (à vérifier les colonnes : id, listingId, userId, rating, body, verifiedStay, createdAt, updatedAt + `@@unique([userId, listingId])`)

**API endpoints**
- `POST /api/v1/listings/:id/reviews { rating, body }` — auth Bearer required
- `GET /api/v1/listings/:id/reviews` (déjà public, à vérifier)

**i18n keys nouvelles**
- `reviews.submit.title` (« Laisse ton avis ») / `.subtitle.aboutListing` / `.subtitle.aboutOwner`
- `reviews.submit.rating.label` / `.rating.help` (« 1 étoile = mauvais ») / `.rating.helpText.{1..5}`
- `reviews.submit.body.label` / `.body.placeholder` / `.body.charCount` (« {count}/1000 »)
- `reviews.submit.cta` / `.cancel` / `.error.notEligible` (« Tu dois avoir contacté le proprio depuis plus de 7 jours »)
- `reviews.thanks.title` / `.thanks.body` / `.thanks.cta` (« Voir ton avis »)
- `email.reviewPrompt.subject` / `.body*`

**Dependencies**
- T-019 (ContactEvent) ✅ done
- T-031 (Review.verifiedStay schema) — à compléter avant
- T-022 ✅ done
- T-047 (owner notif sur review)

**Tests**
- `submit-review.test.ts` : eligible student → review créée · non-eligible (pas de ContactEvent) → throw · 2 reviews same student-listing → UNIQUE violation handled gracefully · rating out of range → ZodError
- `check-eligibility.test.ts` : tous les cases (no contact / contact <7j / has review / banned user)
- `prompt-review.test.ts` (cron) : génère prompt emails pour eligible students, skip already-reviewed

**Edge cases**
- Student delete son compte → ses reviews restent affichées avec « Anonyme » (anonymisation soft cf T-027)
- Review modérée admin (SUSPENDED) → hidden des publics mais accessible owner
- 24h edit window puis lock — implement via `editableUntil DateTime?` ou check `createdAt + 24h > now()`
- Spam prevention : rate-limit 5 reviews/h/user

**A11y**
- Star rating : `<fieldset>` + `<legend>` + `<input type="radio">` styled · keyboard nav (arrows + enter)
- Form labels visibles + counter sr-only annoncé via aria-live
- Submit feedback `role="status"`

**Effort estimé** : ~2.5 jours (form + star rating accessible + service + cron + email)

**Priorité** : P1 · **Statut** : ✅ done (confirmé 2026-05-22) — la boucle review était déjà en place (schema, service `create-review.ts` avec verifiedStay computation via `hasPriorContactEvent`, ReviewForm inline sur la page détail, StarRating accessible, badge sur ReviewRow). Ajout 2026-05-22 du **cron de rappel email 14j post-contact** : nouveau champ `ContactEvent.reviewPromptSentAt`, services `find-review-prompt-candidates.ts` + `send-review-prompts.ts`, email template FR+MG `review-prompt.ts`, route `/api/cron/prompt-review` Bearer-protégée, env `CRON_SECRET`, nouveau `TransactionalEventType: 'review-prompt'`.

---

#### T-051 · Étudiant favoris UI complète
**En tant qu'**étudiant connecté
**Je veux** sauvegarder des annonces en favoris et les retrouver dans `/dashboard/favorites`
**Afin de** comparer plusieurs annonces avant de me décider

**Implementation outline**
1. Le schema Favorite existe (`features/favorites/`) et le toggle heart est branché sur PublicListingCard ✅
2. Créer la query `list-user-favorites.ts` (auth-gated, cursor 20/page, ordre createdAt DESC, sélectionne les listings avec status check)
3. Route `app/dashboard/favorites/page.tsx` qui rend la grille (réutilise PublicListingCard avec `authenticated=true` + `initialFavorited=true`)
4. Bouton « Retirer tous » → Server Action `removeAllFavorites` avec confirmation modal
5. Server Action `removeAllFavoritesAction` qui delete tous WHERE userId=me
6. Empty state : illustration + CTA « Voir les annonces » + texte d'encouragement
7. Badge « Plus disponible » sur cards dont status != PUBLISHED (DELETED, EXPIRED, SUSPENDED) — toujours visible mais désaturé (`opacity-60` + label)
8. Sync entre tabs : `revalidatePath('/dashboard/favorites')` au toggle + listener `storage` event optionnel

**Files créés**
- `src/features/favorites/queries/list-user-favorites.ts`
- `src/features/favorites/actions/remove-all-favorites.ts`
- `src/features/favorites/components/FavoritesEmptyState.tsx`
- `src/features/favorites/components/UnavailableBadge.tsx`
- `src/app/dashboard/favorites/page.tsx`
- `src/features/favorites/__tests__/list-user-favorites.test.ts`

**Files modifiés**
- `src/features/listings/components/PublicListingCard.tsx` : accepter prop `unavailable?: boolean` pour le rendu désaturé
- `src/components/shared/Header.tsx` : ajout entry dashboard nav « Mes favoris »
- `src/lib/i18n/messages/*.ts` : clés `dashboard.favorites.*`

**DB schema** : Favorite model existe (à confirmer : userId + listingId + createdAt + `@@unique([userId, listingId])` + `@@index([userId, createdAt])`)

**API endpoints**
- `GET /api/v1/me/favorites?cursor=&limit=20` — auth required
- `DELETE /api/v1/me/favorites` — remove all

**i18n keys nouvelles**
- `dashboard.favorites.title` / `.count` (« {count} favoris »)
- `dashboard.favorites.empty.title` (« Pas encore de favoris ») / `.empty.body` / `.empty.cta`
- `dashboard.favorites.removeAll.cta` / `.removeAll.confirm.title` / `.confirm.body` / `.confirm.proceed`
- `dashboard.favorites.unavailable.badge` (« Plus disponible ») / `.unavailable.help` (« L'annonce a été retirée ou expirée »)

**Dependencies**
- Favorite feature existe ✅
- T-022 ✅ done

**Tests**
- `list-user-favorites.test.ts` : retourne uniquement les favoris de l'utilisateur · pagination cursor stable · include status filter (un favoris d'annonce DELETED reste retourné avec flag unavailable)
- `remove-all-favorites.test.ts` : delete tous mes favoris, ne touche pas ceux d'autres users
- E2E : student ajoute 3 favoris depuis /annonces, va sur /dashboard/favorites, voit les 3, click remove-all → confirmation → liste vide

**Edge cases**
- Limit max favoris ? Si oui (ex 100), retourner erreur claire au toggle si dépassé
- Favoris créés avant un changement de schema Listing (lat/lng null par exemple) → guard
- Cas listing supprimé : on garde la row Favorite (historique student) mais badge unavailable

**A11y**
- Empty state avec illustration `aria-hidden` + texte H1
- Bouton remove-all avec confirmation Dialog accessible
- Grid heading « Mes favoris » + count en sr-only
- Cards désaturées avec announcement sr-only « Cette annonce n'est plus disponible »

**Effort estimé** : ~1 jour (queries + page + empty state + remove-all + i18n)

**Priorité** : P1 · **Statut** : ✅ done (2026-05-22) — l'essentiel existait déjà (`/dashboard/favoris` + query `list-user-favorites` + toggle heart). Ajout du flow « Retirer tous » : service `remove-all-favorites.ts` + Server Action avec auth guard + `RemoveAllFavoritesButton` Client Component (Dialog Base UI + toast feedback) + i18n FR/MG. Le query exclut DELETED/SUSPENDED (cleaner que le badge « Plus disponible » prévu).

---

#### T-052 · Étudiant profile page (RGPD self-service)
**En tant qu'**étudiant connecté
**Je veux** une page `/dashboard/profile` qui me montre mon profil et mes activités, plus un export RGPD
**Afin de** comprendre ce que la plateforme sait de moi (transparence RGPD)

**Implementation outline**
1. Route `app/dashboard/profile/page.tsx` (Server, auth-gated)
2. Summary card profil : nom, photo, locale, email, créé le X (lecture seule, édition via `/dashboard/settings` existant)
3. Section « Mes favoris » (count + lien vers T-051)
4. Section « Mes avis » (count + lien vers `/dashboard/reviews` si construit, sinon embed simple)
5. Section « Mes contacts initiés » : timeline des ContactEvent où userId=me (date + listing titre + canal) — anonymisable
6. Section « Historique des connexions » : réutilise T-028 existing component
7. Section « Mes données » : bouton « Télécharger mes données » → Server Action `exportUserData` qui retourne un JSON complet (profil + favoris + reviews + contacts + sessions + soumissions quiz si email match)
8. Format JSON RGPD-compliant avec metadata « exported_at », « locale », sections nommées

**Files créés**
- `src/app/dashboard/profile/page.tsx`
- `src/features/auth/services/export-user-data.ts` (pure, retourne struct sérialisable)
- `src/features/auth/actions/export-user-data.ts`
- `src/features/auth/queries/get-user-contact-history.ts`
- `src/features/auth/queries/get-user-profile-summary.ts`
- `src/features/auth/components/ProfileSummaryCard.tsx`
- `src/features/auth/components/ContactHistoryTimeline.tsx`
- `src/features/auth/components/DataExportSection.tsx`
- `src/features/auth/__tests__/export-user-data.test.ts`

**Files modifiés**
- `src/components/shared/Header.tsx` ou DashboardSidebar : ajout « Mon profil »
- `src/lib/i18n/messages/*.ts` : clés `dashboard.profile.*`

**DB schema** : aucun changement

**API endpoints**
- `GET /api/v1/me/profile` — full profile summary
- `GET /api/v1/me/export` — RGPD export, returns `Content-Disposition: attachment; filename="arytrano-export-{date}.json"`

**i18n keys nouvelles**
- `dashboard.profile.title`
- `dashboard.profile.summary.name` / `.email` / `.locale` / `.createdAt`
- `dashboard.profile.favorites.title` / `.count` / `.viewAll`
- `dashboard.profile.reviews.title` / `.count` / `.viewAll`
- `dashboard.profile.contacts.title` / `.empty` / `.viaWhatsApp` / `.viaPhone`
- `dashboard.profile.sessions.title` (réutilise T-028 keys)
- `dashboard.profile.export.title` / `.body` (« Télécharge un JSON avec tout ce qu'on a sur toi ») / `.cta` / `.success`

**Dependencies**
- T-022 ✅ done
- T-028 (login history) ✅ done
- T-051 (favoris) à completer

**Tests**
- `export-user-data.test.ts` : génère un JSON avec toutes les sections attendues · n'inclut PAS les données d'autres users · le format est versionné (« schema_version »)
- `get-user-contact-history.test.ts` : retourne uniquement les ContactEvents où userId=me · paginé · order createdAt DESC

**Edge cases**
- User avec 1000+ favoris → export streamable ou warning « volume important »
- Quiz submissions matching student's email → inclus dans export ? Décision : oui, c'est de la PII qui leur appartient
- User déjà supprimé (soft delete) accédant à export → 401 forbidden

**A11y**
- Sections avec headings H2 cohérents
- Timeline contacts avec `<time datetime>` proper
- Bouton export avec aria-busy pendant download
- Format JSON download via `<a download>` standard, pas de popup

**Effort estimé** : ~1.5 jour (page + queries + export service + Dialog confirm)

**Priorité** : P2 · **Statut** : ✅ done (2026-05-22, scope v0.5) — `/dashboard/profile` ProfileForm + `/dashboard/settings` DeleteAccountSection existaient déjà. Ajout 2026-05-22 : service `export-user-data.ts` collecte profil + listings authored + reviews + favorites + savedSearches + quizSubmissions (matched par email) + whatsAppAlert (matched par phone) + 50 dernières connexions, exclut secrets (passwordHash, totpSecret, recoveryCodes), Server Action `exportMyDataAction` auth-guarded + rate-limit 1/h/userId via `rateLimiters.exportUserData`, `DataExportSection` Client Component avec Blob download `arytrano-mes-donnees-{YYYY-MM-DD}.json`, intégré dans /dashboard/settings au-dessus de la danger zone, 9 nouvelles clés i18n FR+MG. RGPD-aligned : export complet en JSON, suppression compte propre via DeleteAccountSection existant.

---

### Phase G — Quality pre-launch (todo)

#### T-053 · Carte sur page détail listing
**En tant que** visiteur sur une page d'annonce
**Je veux** voir un mini-pin sur une carte du quartier
**Afin de** situer géographiquement le logement avant de contacter

**Implementation outline**
1. Composant `<ListingNeighborhoodMap />` Client (lazy-loaded via `next/dynamic` avec `ssr: false` car pigeon-maps DOM-only)
2. Centré sur `neighborhood.lat/lng` (PAS sur l'adresse exacte du listing — anti-stalking + cohérent avec design v0.5 où l'adresse n'est révélée qu'au contact)
3. Zoom 14-15 (assez pour voir les rues du quartier, pas assez pour identifier un immeuble)
4. Single pin avec popover statique « Quartier de {neighborhoodName} » + count d'annonces dans le quartier
5. Insérée dans la page détail entre la galerie et la section infos (Server Component qui mount le Client lazy)
6. Skeleton loader pendant le chargement client (~300ms)
7. Mentions OSM (attribution) déjà gérée par le component pigeon-maps avec `attributionPrefix={false}`

**Files créés**
- `src/features/listings/components/ListingNeighborhoodMap.tsx` (Client, dynamic-only)
- `src/features/listings/components/ListingNeighborhoodMapLoader.tsx` (Server, dynamic wrapper avec Suspense skeleton)
- `src/features/listings/components/ListingMapSkeleton.tsx`

**Files modifiés**
- `src/app/(public)/[citySlug]/[neighborhoodSlug]/[listingSlug]/page.tsx` : importer + insérer le loader
- `src/lib/i18n/messages/*.ts` : `listing.detail.map.title` / `.popover.quartier` / `.popover.count`

**DB schema** : aucun (utilise les lat/lng existants sur Neighborhood)

**API endpoints** : aucun (data déjà SSR-rendered)

**i18n keys nouvelles**
- `listing.detail.map.title` (« Situation géographique »)
- `listing.detail.map.popover.quartier` (« Quartier de {name} »)
- `listing.detail.map.popover.count` (« {count} annonces ici »)
- `listing.detail.map.privacy.note` (« L'adresse exacte est partagée au contact »)

**Dependencies**
- T-038 (pigeon-maps + CSP) ✅ done
- T-013 (page détail listing) ✅ done

**Tests**
- Component snapshot avec coordonnées Andrainjato
- E2E : ouvrir page détail → vérifier map visible après hydration, popover sur click pin

**Edge cases**
- Si neighborhood.lat/lng null (ne devrait jamais arriver mais) → skip le render (early return)
- Si JS disabled → message « Active JavaScript pour la carte » avec skeleton statique
- Plusieurs maps sur la page (page détail + future suggestions ?) → vérifier qu'on charge pigeon-maps une seule fois (dedupping via dynamic import)

**A11y**
- Map container `role="img"` avec `aria-label` descriptif
- Pin focusable au clavier + popover déclenché par Enter
- Skip link « Aller au texte de l'annonce » au-dessus du map pour les utilisateurs SR

**Performance**
- Lazy-loaded (chunk séparé, ~30KB pigeon-maps + tuiles)
- Sur 3G, render le skeleton instantané + remplace par la map à l'hydration
- LCP target < 2.5s on 3G — la map ne doit JAMAIS bloquer le LCP (utiliser intersection observer si nécessaire)

**Effort estimé** : ~0.5 jour (composant existant pigeon-maps déjà intégré ailleurs)

**Priorité** : P1 · **Statut** : ✅ done (confirmé 2026-05-22) — `ListingMap` (Leaflet vanilla, 40KB gzipped, 200m radius circle au lieu d'un pin exact pour la privacy) intégré sur la page détail via `ListingMapClient` dynamic import. Centré sur `neighborhood.lat/lng`. Note 2026-05-22 : migré le tile provider de l'OSM apex public vers Stadia Maps (env `NEXT_PUBLIC_STADIA_API_KEY` + retina @2x + attribution Stadia+OMT+OSM) pour cohérence avec AUD-008 ; fallback OSM apex si pas de key (dev).

---

#### T-054 · Hreflang complet sur pages auth
**En tant que** locuteur malagasy ou français
**Je veux** que les pages auth (`/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`) soient aussi traduites en MG
**Afin de** ne pas être bloqué par une page FR-only si je suis en MG

**Implementation outline**
1. Audit les routes auth existantes : `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`, `/two-factor`
2. Pour chaque route, ajouter `generateMetadata` avec `localeAlternates('/path')` si pas présent
3. Vérifier que `<html lang={locale}>` est appliqué via le layout root (déjà OK normalement)
4. Identifier les clés i18n manquantes en MG (TS error si Record<MessageKey, string>) — la majorité sont déjà présentes par contrainte de type
5. Compléter les chaînes MG manquantes pour `auth.*` keys
6. Tester les flow MG : `/mg/sign-in` charge en malagasy · cookie locale switch fonctionne après login
7. Ajouter ces pages au sitemap (déjà fait probablement, vérifier)
8. Tester les emails magic-link / forgot-password en MG (template MG existant)

**Files créés**
- `src/features/auth/__tests__/auth-i18n-coverage.test.ts` (snapshot des clés présentes FR + MG, fail si désync)

**Files modifiés**
- `src/app/(auth)/sign-in/page.tsx` : ajouter `generateMetadata` avec alternates
- `src/app/(auth)/sign-up/page.tsx` : idem
- `src/app/(auth)/forgot-password/page.tsx` : idem
- `src/app/(auth)/reset-password/page.tsx` : idem
- `src/app/(auth)/verify-email/page.tsx` : idem
- `src/app/(auth)/two-factor/page.tsx` : idem
- `src/lib/i18n/messages/mg.ts` : ajouter toutes les clés `auth.*` qui sont en placeholder/empty
- `src/app/sitemap.ts` : confirmer que les routes auth sont incluses

**DB schema** : aucun

**API endpoints** : aucun (web pages only)

**i18n keys** : compléter ce qui manque côté MG pour `auth.signIn.*`, `auth.signUp.*`, `auth.forgotPassword.*`, `auth.resetPassword.*`, `auth.verifyEmail.*`, `auth.twoFactor.*`

**Dependencies**
- T-020 (Locale switcher) ✅ done
- Auth flows complets ✅ done

**Tests**
- `auth-i18n-coverage.test.ts` : compare les clés FR et MG, fail si l'une manque dans l'autre
- E2E : passer en MG via switcher, naviguer vers sign-in, vérifier que les labels sont en MG
- Snapshot generateMetadata sur `/mg/sign-in` → contient `alternates.languages` correctes

**Edge cases**
- Email templates magic-link en MG : vérifier que le template existe et n'a pas de placeholder FR
- Erreurs de validation Zod en MG : les messages Zod custom doivent être par-locale (cf pattern existant)
- Lien « mot de passe oublié » sur sign-in : route locale-aware

**A11y**
- `<html lang>` correct côté MG
- Heading hierarchy préservée FR ↔ MG (même structure)

**Effort estimé** : ~1 jour (audit + compléter clés manquantes + tester)

**Priorité** : P2 · **Statut** : ✅ done (2026-05-22) — `alternates: await localeAlternates(...)` ajouté à `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`, `/auth-error` (6 pages). Les 3 pages token-gated (reset, verify, error) gardent aussi `robots: { index: false, follow: false }`. Cohérence FR↔MG complète, plus de hreflang manquant côté auth.

---

#### T-055 · Backup DB automatique + restauration testée
**En tant qu'**équipe AryTrano
**Je veux** un backup quotidien de la DB Postgres avec rétention 30j
**Afin de** ne pas perdre les données en cas de crash, intrusion, ou erreur humaine

**Implementation outline**
1. Choisir le provider de backup selon le hosting Postgres :
   - **Neon** : Point-In-Time Recovery natif (7j gratuit / 30j paid) — preferred si Neon est le hosting
   - **Supabase** : Daily backups + PITR sur Pro plan
   - **Self-hosted Postgres** : cron `pg_dump | gzip | aws s3 cp s3://arytrano-backups/$(date).sql.gz`
2. Configurer la rétention 30j minimum + verrouillage IAM (S3 versioning + MFA delete optional)
3. Tester le restore : provisionner une DB de test (`arytrano_test_restore`), restaurer un backup vieux de 7j, tourner l'app contre, vérifier qu'on peut login + voir un listing
4. Documenter le runbook : `public/docs/runbook-restore.md`
   - Section : quand restaurer (criteria)
   - Section : étapes (commands exacts avec placeholders)
   - Section : validation post-restore (smoke tests)
   - Section : escalation (qui contacter)
5. Configurer une alerte : si un backup échoue (provider notif → Slack ou email)
6. Schedule trimestriel : exécuter un restore de test à blanc (chaos engineering light)

**Files créés**
- `public/docs/runbook-restore.md`
- `scripts/test-restore.sh` (helper pour le test trimestriel)
- `.github/workflows/backup-monitor.yml` (optionnel : workflow qui hit le provider API et alerte si pas de backup récent)

**Files modifiés**
- `public/docs/AryTrano.docx` (ou README) : section « Backup policy »
- `package.json` : éventuels scripts npm pour le restore helper

**DB schema** : aucun

**API endpoints** : aucun

**i18n keys** : aucun

**Dependencies**
- Hosting Postgres décidé (Neon recommended)
- Accès Slack/email pour les alerts

**Tests**
- Test manuel restore documenté (à exécuter avant launch + une fois par trimestre après)
- Healthcheck script qui vérifie « dernier backup < 26h » et alerte sinon

**Edge cases**
- Provider backup échoue silencieusement → necessite monitoring externe (T-056)
- Restore d'un backup avec migration Prisma plus ancienne que le code actuel → procédure docs (rollback de code + re-deploy old migrations)
- Données chiffrées (CIN si E-T02 dégelé) : clé de chiffrement DOIT être backupée SÉPARÉMENT du DB backup (sinon backup inutile)

**A11y** : N/A (ops procedure)

**Effort estimé** : ~1 jour (config provider + test restore + runbook)

**Priorité** : P0 (pre-launch) · **Statut** : ✅ done (2026-05-22) — scripts `scripts/backup-db.sh` (pg_dump → gzip → rclone Cloudflare R2, retention 30j + archive mensuelle + Slack webhook on failure + freshness flag pour `/api/health`), `scripts/restore-db.sh` avec safeguard `--allow-prod` + double confirmation typed `RESTORE PRODUCTION`, `scripts/check-backup-freshness.sh` runs every 6h alerte si > 26h, runbook `public/docs/runbooks/restore-db.md` + `contabo-deployment.md §8`, env `BACKUP_FRESHNESS_FILE`, route `/api/health` DB ping + lastBackupAgeHours (503 si DB down mais 200 si backup stale — anti dead-cron lockout).

---

#### T-056 · Monitoring & alerting basique
**En tant qu'**équipe AryTrano
**Je veux** être alerté quand l'app est down, l'erreur 5xx augmente, ou un job critique échoue
**Afin de** intervenir avant que les utilisateurs ne signalent

**Implementation outline**
1. Choisir un provider monitoring : **Sentry** (preferred — error tracking + perf + replay) ou **BetterStack** (logs + uptime ping) ou **Vercel Analytics + Healthchecks.io** (cheap)
2. Installer le SDK Sentry Next.js (`@sentry/nextjs`) + config `sentry.client.config.ts` + `sentry.server.config.ts` + `sentry.edge.config.ts`
3. Configurer le DSN dans env (`SENTRY_DSN`)
4. PII scrubber config : aucune row Prisma user dans les traces, hash IPs avant envoi, drop request body (peut contenir password)
5. Alertes configurées dans Sentry :
   - 5xx rate > 1% sur 5min → Slack #alerts
   - p95 latency > 2s sur 5min → Slack
   - Cron job failed (custom event) → Slack
   - Deploy failed (Vercel webhook → Sentry) → Slack
6. Configurer un endpoint healthcheck `/api/health` qui vérifie DB ping + Redis ping + retourne 200 OK
7. Ajouter Sentry releases tag pour relier erreurs ↔ deploys (via `@sentry/cli` dans CI)
8. Status page interne `/admin/status` qui montre les derniers errors + uptime (Server-rendered avec données Sentry API ou direct)

**Files créés**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `src/app/api/health/route.ts`
- `src/app/admin/status/page.tsx`
- `public/docs/runbook-incidents.md`

**Files modifiés**
- `next.config.ts` : wrap with `withSentryConfig`
- `.env.example` : ajouter `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- `src/lib/env.ts` : ajouter les vars Sentry (optional)
- `src/app/error.tsx` + `src/app/global-error.tsx` : ajouter Sentry `captureException`
- `vercel.json` : webhook vers Sentry pour deploys
- `package.json` : `@sentry/nextjs` dep

**DB schema** : aucun

**API endpoints**
- `GET /api/health` — public, pas auth, retourne `{ ok: true, db: 'up', cache: 'up' }` ou 503 si check fail

**i18n keys** : aucun (admin only)

**Dependencies**
- Compte Sentry (ou alternative)
- Slack workspace pour les alertes

**Tests**
- E2E : forcer une erreur 500 sur staging → vérifier qu'elle apparaît dans Sentry
- Healthcheck : `curl /api/health` retourne 200 quand DB up, 503 quand DB down
- PII scrubber : envoyer une exception avec body { email: 'x@y.mg' } → vérifier que l'email n'apparaît PAS dans Sentry trace

**Edge cases**
- DSN absent en dev local → Sentry SDK no-op silencieusement
- Erreurs déjà connues (ZodErrors validation côté serveur, expected ContactReveal rate-limited) → fingerprint custom pour pas spammer
- Privacy : utilisateurs MG en mode incognito ne doivent rien envoyer à Sentry (pas de cookie/identifier)
- Coûts : free tier Sentry = 5k errors/mois — survey trafic v0.5 pour rester dans

**A11y** : N/A (admin tooling)

**Effort estimé** : ~1.5 jour (SDK + scrubbers + alertes + status page + runbook)

**Priorité** : P0 (pre-launch) · **Statut** : ✅ done (2026-05-22) — `@sentry/nextjs@10.53` + 3 sentry.{client,server,edge}.config.ts (no-op si DSN missing), `src/instrumentation.ts` Next 16 register + onRequestError, `lib/observability/scrub-pii.ts` strips Auth/Cookie/body + masque email/+261/CIN (10 tests), boundaries `app/error.tsx` + `global-error.tsx` avec captureException, `next.config.ts` wrappé `withSentryConfig` (sourcemaps upload + deleteSourcemapsAfterUpload), 6 env vars Sentry, runbook `monitoring.md` + `incidents.md` (severity matrix + 5 playbooks).

---

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

## 🏗️ v1 — Échelle

Objectif : multi-ville + meilleure découverte + app mobile + API publique.

### Multi-ville

#### E-T07 · Multi-ville (Antananarivo + Toamasina + Mahajanga + Toliara)
**En tant que** visiteur en dehors de Fianarantsoa
**Je veux** chercher des annonces dans ma ville
**Afin de** utiliser AryTrano où je suis

**Implementation outline**
1. Recherche éditoriale : pour chaque ville, identifier les ~30-50 quartiers étudiants pertinents (universités, lycées) avec lat/lng (Google Maps + OpenStreetMap)
2. Étendre `prisma/seed.ts` pour seeder 4 villes + ~150 quartiers · garde Fianar existant comme baseline
3. Vérifier que les routes `/<citySlug>/<neighborhoodSlug>/<listingSlug>` fonctionnent déjà (architecture city-aware existe)
4. Étendre `LandingSearchCard` pour exposer un Select City qui filtre les neighborhoods en cascade · si une seule ville → fallback au comportement actuel
5. Étendre `QuartiersMapClient` pour accepter `centerLat`/`centerLng` props · supprimer la constante `FIANARANTSOA_CENTER` hardcodée
6. Refactor `quartier-profiles.ts` (quiz) en `city-quartier-profiles.ts` keyed par cityId · seed les profils des 150 quartiers (effort éditorial)
7. Nouvelles routes : `/quartiers/<citySlug>` pour scope la page Quartiers par ville · redirect 301 de `/quartiers` → `/quartiers/fianarantsoa` (defaut)
8. Adapter le quiz `/quartiers/quiz` : ajouter une question Q0 « Quelle ville ? » avant les 6 existantes · le scoring se limite au cityId choisi
9. Onboarding propriétaire : ajouter une étape « Dans quelle ville se trouve ton bien ? » avant la création d'annonce · stocker `User.preferredCityId?` pour pré-remplir
10. Mettre à jour le sitemap (T-061 cf E-T12)
11. Audit i18n : ajouter les noms de quartier en FR + MG (effort éditorial important)
12. Migration de données : les listings existants (tous Fianar) restent attachés à `cityId = fianarantsoa` → no-op

**Files créés**
- `prisma/seed-helpers/cities-tana.ts`, `cities-toamasina.ts`, `cities-mahajanga.ts`, `cities-toliara.ts` (data seeds)
- `src/features/quiz/data/city-quartier-profiles.ts` (remplace `quartier-profiles.ts`)
- `src/features/quiz/services/get-profiles-for-city.ts`
- `src/app/(public)/quartiers/[citySlug]/page.tsx` (nouvelle route paramétrée)
- `src/features/landing/queries/list-cities-with-counts.ts`
- `src/features/landing/components/CitySelect.tsx`
- `src/features/auth/components/OwnerCityOnboardingStep.tsx`

**Files modifiés**
- `prisma/seed.ts` : appeler les seeds des 4 nouvelles villes
- `src/features/landing/components/LandingSearchCard.tsx` : ajouter le CitySelect
- `src/features/landing/components/QuartiersMapClient.tsx` : accepter center prop
- `src/features/landing/queries/get-quartiers-data.ts` : prendre un `citySlug` optionnel
- `src/app/(public)/quartiers/page.tsx` : redirect vers `/quartiers/fianarantsoa`
- `src/app/(public)/quartiers/quiz/page.tsx` : ajouter step ville
- `src/features/quiz/components/QuizWizard.tsx` : add Q0 city
- `src/features/listings/components/ListingForm.tsx` : forcer city à la création
- `src/lib/i18n/messages/*.ts` : centaines de nouvelles clés `cities.*` + `quartiers.*`
- `prisma/schema.prisma` : `User.preferredCityId String?` (FK soft to City)

**DB schema**
```prisma
// Patch sur User :
preferredCityId String?
preferredCity   City? @relation(fields: [preferredCityId], references: [id], onDelete: SetNull)
```
Migration `<ts>_add_user_preferred_city`

**API endpoints**
- `GET /api/v1/cities` (déjà existe?) — retourner toutes les villes seedées + count d'annonces
- `GET /api/v1/cities/:slug/neighborhoods` — cascade pour le mobile

**i18n keys nouvelles**
- `cities.tana.name` / `cities.toamasina.name` / `cities.mahajanga.name` / `cities.toliara.name`
- `cities.tana.tagline` / `cities.toamasina.tagline` / etc.
- `quartiers.<slug>.name.fr` / `.name.mg` × ~150 quartiers (effort)
- `landing.search.cityLabel` (« Ville ») / `.cityPlaceholder` (« Choisis ta ville »)
- `quiz.q0.city.title` / `.city.help`
- `onboarding.owner.city.title` / `.city.help`

**Dependencies**
- T-036 (quiz) ✅ done
- T-038 (map) ✅ done

**Tests**
- `get-profiles-for-city.test.ts` : retourne les profils du bon cityId · empty si ville inconnue
- `seed.test.ts` (integration) : seed all cities → vérifier counts attendus
- E2E : visiteur sur landing → CitySelect dropdown → choisit Toamasina → /quartiers/toamasina charge

**Edge cases**
- Listings existants tous Fianar → après seed, le filtre ville fonctionne mais les autres villes sont vides initialement (empty state + CTA « Sois le premier »)
- User preferredCityId pointing to a deleted city → cascade SetNull
- Hardcoded references à 'fianarantsoa' dans le code (grep nécessaire) à neutraliser

**A11y**
- CitySelect avec Combobox accessible (Base UI) + keyboard
- Empty state des villes vides : claire + actionable

**Effort estimé** : ~2 semaines (avec content seeding 150 quartiers FR + MG)

**Priorité** : P0 (v1 launch trigger) · **Statut** : 📋 todo

---

#### E-T11 · Pages SEO ville + quartier indexables
**En tant qu'**équipe SEO
**Je veux** des landing pages dédiées par ville et par quartier
**Afin de** ranker sur « logement étudiant Antananarivo » / « location quartier Anosy »

**Implementation outline**
1. Nouvelles routes : `/villes/<citySlug>` (city landing) + `/villes/<citySlug>/quartiers/<neighborhoodSlug>` (quartier landing)
2. Server Component qui fetche : (a) la City + neighborhoods + counts · (b) top 8-12 annonces de la ville · (c) descriptor éditorial · (d) carte du quartier zoomée si quartier
3. Composants `CityHero`, `CityListings`, `CityQuartiersGrid`, `NeighborhoodHero`, `NeighborhoodMap`, `NeighborhoodListings`, `NeighborhoodReviews`
4. Structured data : `Place` schema (geo, areaServed) + `ItemList` pour les annonces
5. Metadata SEO-rich : `<title>` « Logement étudiant à {citySlug} — AryTrano » · description longue (~150 chars) · OG image custom (text overlay « {city} {quartier} ») via opengraph-image route handler
6. Breadcrumb hiérarchique : Home > Ville > Quartier
7. Sitemap.ts génère dynamiquement ces URLs (cf E-T12)
8. Internal linking : page détail listing lie vers la ville et le quartier · page quartier lie vers la ville · landing page liste toutes les villes

**Files créés**
- `src/app/(public)/villes/[citySlug]/page.tsx`
- `src/app/(public)/villes/[citySlug]/quartiers/[neighborhoodSlug]/page.tsx`
- `src/app/(public)/villes/[citySlug]/opengraph-image.tsx` (dynamic OG)
- `src/app/(public)/villes/[citySlug]/quartiers/[neighborhoodSlug]/opengraph-image.tsx`
- `src/features/cities/components/CityHero.tsx`
- `src/features/cities/components/CityListings.tsx`
- `src/features/cities/components/CityQuartiersGrid.tsx`
- `src/features/cities/components/NeighborhoodHero.tsx`
- `src/features/cities/components/NeighborhoodReviews.tsx`
- `src/features/cities/queries/get-city-landing-data.ts`
- `src/features/cities/queries/get-neighborhood-landing-data.ts`
- `src/lib/seo/place-schema.ts` (helper)

**Files modifiés**
- `src/app/sitemap.ts` : ajouter les villes + quartiers dynamiquement
- `src/lib/i18n/messages/*.ts` : descriptors quartiers + tagline villes
- `src/components/shared/Footer.tsx` : ajouter liens « Villes » avec les 5

**DB schema** : aucun changement

**API endpoints** : aucun nouveau (cohérence : ces pages sont SSR avec données déjà disponibles)

**i18n keys nouvelles**
- `cityLanding.title` (« Logement étudiant à {city} ») / `.description` / `.cta.searchListings`
- `cityLanding.stats.activeListings` / `.verifiedOwners` / `.neighborhoodsCount`
- `cityLanding.quartiers.title` (« Quartiers étudiants de {city} »)
- `neighborhoodLanding.title` (« {quartier}, {city} ») / `.description`
- `neighborhoodLanding.about.title` (« À propos de {quartier} ») / `.about.lead`
- `neighborhoodLanding.listings.title` (« {count} annonces dans {quartier} ») / `.empty`
- `neighborhoodLanding.reviews.title` (« Ils ont vécu ici »)

**Dependencies**
- E-T07 (Multi-ville) doit précéder
- T-038 (map) ✅
- T-031 (reviews schema)

**Tests**
- `get-city-landing-data.test.ts` : retourne city + neighborhoods + top listings · cache de 5 min via `unstable_cache`
- E2E : visiteur depuis Google search « logement Anosy » → arrive sur `/villes/antananarivo/quartiers/anosy` → contenu indexable + carte + annonces
- Structured data validator (Google Rich Results Test) : Place + ItemList OK

**Edge cases**
- City avec 0 annonces → empty state « Sois le premier à publier » + CTA owner
- Quartier supprimé d'une ville après indexation Google → 410 Gone ou 301 vers la ville
- OG image dynamic generation : fallback si génération échoue (utiliser le default site OG)

**A11y**
- Breadcrumb avec ARIA correctly
- Map alternative : list semantic ordonnée par count d'annonces
- Heading hierarchy : H1 ville → H2 sections → H3 cards

**Performance**
- Cache `unstable_cache` 5 min pour les données ville
- ISR via `revalidate = 300`
- OG images statiques générées au build si possible (vs runtime)

**Effort estimé** : ~1 semaine (après E-T07)

**Priorité** : P0 · **Statut** : ✅ done (2026-05-23) — 4 batches livrés : B1 `/villes/[citySlug]` (Hero SEO + Listings top 8 + QuartiersGrid + query cached 5min + sitemap dyn priority 0.85). B2 `/villes/[city]/quartiers/[n]` (Hero + Map zoomée + Listings 12 + Reviews aggregated + Place JSON-LD + ItemList JSON-LD + siblings chip row + sitemap dyn priority 0.75). B4 internal linking (listing detail breadcrumb clickable vers /villes/<city> + /villes/<city>/quartiers/<n>, footer "Villes" colonne, hub `/villes` listant les 5 villes). B3 OG images dynamiques next/og pour /villes/[citySlug] + /villes/[city]/quartiers/[n] (1200×630 PNG, branded primary bg, count d'annonces). ~75 nouvelles clés i18n FR+MG.

---

#### E-T12 · Sitemap dynamique complet + hreflang
**En tant qu'**équipe SEO
**Je veux** un sitemap.xml qui reflète l'état réel de la DB (listings, quartiers, villes) avec les bons hreflang FR-MG / MG
**Afin de** maximiser l'indexabilité Google

**Implementation outline**
1. Étendre `src/app/sitemap.ts` pour inclure dynamiquement :
   - Toutes les villes (`/villes/<slug>`)
   - Tous les quartiers (`/villes/<citySlug>/quartiers/<neighborhoodSlug>`)
   - Les pages quiz scopées par ville (`/quartiers/<citySlug>/quiz`)
2. `<xhtml:link rel="alternate" hreflang>` déjà géré par `alternates.languages` (vérifier que c'est rendu)
3. `lastmod` réel par URL : `City.updatedAt`, `Neighborhood.updatedAt`, `Listing.updatedAt`
4. Si > 10k URLs : splitter en sitemap-index avec sub-sitemaps :
   - `sitemap-index.xml`
   - `sitemap-listings.xml`
   - `sitemap-villes.xml`
   - `sitemap-quartiers.xml`
   - `sitemap-static.xml` (legal, comment-ca-marche, etc.)
5. Configurer dans `next.config.ts` : `headers()` pour les sitemap.xml routes (Content-Type: application/xml; charset=utf-8)
6. Submit sitemap à Google Search Console + Bing Webmaster Tools (manual step)
7. Robots.txt : `Sitemap: https://arytrano.mg/sitemap-index.xml` (vérifier que c'est fait)
8. Validation : utiliser Google Search Console + Screaming Frog (gratuit jusqu'à 500 URLs) pour audit

**Files créés**
- `src/app/sitemap-index.xml/route.ts` (si splitting nécessaire)
- `src/app/sitemap-listings.xml/route.ts`
- `src/app/sitemap-villes.xml/route.ts`
- `src/app/sitemap-quartiers.xml/route.ts`
- `src/app/sitemap-static.xml/route.ts`
- `src/lib/seo/sitemap-helpers.ts` (langs builder, URL builders)

**Files modifiés**
- `src/app/sitemap.ts` : si on garde un single sitemap (< 10k URLs), juste étendre · sinon, supprimer et remplacer par sitemap-index
- `src/app/robots.ts` : référencer sitemap-index
- `src/features/listings/queries/list-sitemap-listings.ts` : ajouter `select: { slug, citySlug, neighborhoodSlug, updatedAt }` minimal

**DB schema** : aucun changement

**API endpoints** : aucun (sitemap = route handler, pas API)

**i18n keys** : aucun

**Dependencies**
- E-T07 + E-T11 (les routes ville/quartier doivent exister avant qu'on les sitemap)

**Tests**
- Sitemap XML validates against XSD schema · all URLs return 200 · hreflang pairs sont bidirectionnels (FR pointe vers MG et vice-versa)
- Tester avec un seed contenant 1 ville + 5 quartiers + 10 listings → sitemap contient le bon nombre d'entries
- E2E : `curl https://arytrano.mg/sitemap-index.xml` retourne 200 + référence les sub-sitemaps

**Edge cases**
- Listings DRAFT, UNAVAILABLE, SUSPENDED, EXPIRED, DELETED → exclus du sitemap
- Listings publiés depuis > 6 mois sans update → toujours dans le sitemap (lastmod stable)
- DB lente → cron qui pre-génère les sitemaps en blob storage et serve depuis cache ? overkill pour < 100k URLs
- Hreflang mistakes : un FR-MG sans MG counterpart → garde uniquement la FR

**A11y** : N/A

**Performance**
- Cache `revalidate = 3600` (1h) déjà set
- Split files : chaque sub-sitemap < 50k URLs (Google limit)

**Effort estimé** : ~3 jours (après E-T11)

**Priorité** : P1 · **Statut** : ✅ done (2026-05-23, scope v1) — `src/app/sitemap.ts` étendu avec : hub `/villes`, 5 city landings `/villes/<slug>`, 37 quartier landings `/villes/<city>/quartiers/<n>`, 5 quartiers pages `/quartiers/<slug>`, tous les listings PUBLISHED `/<city>/<n>/<slug>`. `lastModified` calculé dynamiquement via `groupBy MAX(publishedAt)` par city ET par (city, neighborhood) — Google voit la fraîcheur en temps réel quand un proprio publie. Hreflang `x-default` + `fr-MG` + `mg` sur chaque entry. robots.ts hardened avec `/u/` (T-045 tokens) + `/api/cron/` disallow. `revalidate = 3600` (régénération horaire). Scope v1 : sitemap simple suffisant (< 200 URLs total, loin du 50k Google limit). Split en sitemap-index reporté à v2 si volume explose.

### Découverte & engagement

#### E-T09 · Recherches sauvegardées + alertes email
**En tant qu'**étudiant qui cherche activement
**Je veux** sauvegarder une recherche (filtre par ville + quartier + prix max + type) et être notifié par email à chaque nouvelle annonce qui match
**Afin de** ne pas devoir revenir tous les jours

**Implementation outline**
1. Nouveau model `SavedSearch` (userId, name, filters JSONB, notifyEmail Boolean default true, lastNotifiedAt DateTime?, createdAt, updatedAt)
2. UI sur `/annonces` : bouton « Sauvegarder cette recherche » qui apparaît dès qu'≥ 1 filtre URL appliqué + auth-gated (sinon prompt sign-in)
3. Modal de sauvegarde : champ nom (« Studio Andrainjato max 250k »), preview des filtres, toggle « M'envoyer un email quand nouvelles annonces »
4. Route `/dashboard/searches` : liste paginée des SavedSearch · edit name + filters + delete · activate/deactivate notifications
5. Cron quotidien `cron/notify-saved-searches.ts` à 08:00 UTC :
   - SELECT SavedSearch WHERE notifyEmail=true
   - Pour chaque : run la query avec `publishedAt > lastNotifiedAt`
   - Si > 0 matches : envoyer email digest (« 3 nouvelles annonces matchent ta recherche ») + update lastNotifiedAt
   - Cap : max 5 listings dans l'email (lien « Voir les autres » pour le reste)
6. Server Actions : `saveSearch`, `updateSavedSearch`, `deleteSavedSearch`, `toggleSearchNotifications`
7. Limit : max 10 SavedSearches per user (anti-abuse)

**Files créés**
- `prisma/migrations/<ts>_add_saved_search/migration.sql`
- `src/features/searches/services/save-search.ts`
- `src/features/searches/services/notify-saved-searches.ts` (cron orchestrator)
- `src/features/searches/services/find-new-matches.ts` (pure fn given filters + sinceDate)
- `src/features/searches/actions/save-search.ts`
- `src/features/searches/actions/update-search.ts`
- `src/features/searches/actions/delete-search.ts`
- `src/features/searches/actions/toggle-notifications.ts`
- `src/features/searches/queries/list-user-searches.ts`
- `src/features/searches/schemas/saved-search.ts` (Zod : name 2-50 chars, filters object matching ListingFilters)
- `src/features/searches/components/SaveSearchButton.tsx` (Client)
- `src/features/searches/components/SaveSearchDialog.tsx`
- `src/features/searches/components/SearchesList.tsx`
- `src/features/searches/components/SearchRow.tsx`
- `src/app/dashboard/searches/page.tsx`
- `src/app/api/cron/notify-saved-searches/route.ts`
- `src/lib/email/templates/saved-search-digest-{fr,mg}.ts`
- `src/features/searches/__tests__/find-new-matches.test.ts`

**Files modifiés**
- `prisma/schema.prisma` : nouveau model `SavedSearch`
- `src/app/(public)/annonces/page.tsx` ou `ListingFilters` : ajouter SaveSearchButton
- `vercel.json` : ajouter le cron
- `src/lib/i18n/messages/*.ts`

**DB schema**
```prisma
model SavedSearch {
  id              String   @id @default(cuid())
  userId          String
  name            String   @db.VarChar(50)
  filters         Json     // { citySlug?, neighborhoodSlug?, type?, priceMin?, priceMax?, sort? }
  notifyEmail     Boolean  @default(true)
  lastNotifiedAt  DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([notifyEmail, lastNotifiedAt])  // cron query
}
```

**API endpoints**
- `GET /api/v1/me/searches`
- `POST /api/v1/me/searches { name, filters, notifyEmail }`
- `PATCH /api/v1/me/searches/:id { name?, filters?, notifyEmail? }`
- `DELETE /api/v1/me/searches/:id`
- `POST /api/cron/notify-saved-searches` — Bearer secret

**i18n keys nouvelles**
- `searches.save.button` (« Sauvegarder cette recherche ») / `.dialog.title` / `.dialog.name.label` / `.dialog.name.placeholder` / `.dialog.notify.label` / `.dialog.notify.help` / `.dialog.submit`
- `searches.list.title` / `.list.empty` / `.list.count`
- `searches.row.lastMatch` (« Dernière notif il y a {time} ») / `.row.edit` / `.row.delete` / `.row.toggle.on` / `.row.toggle.off`
- `searches.error.maxReached` (« Max 10 recherches — supprime-en une avant »)
- `email.searchDigest.subject` (« {count} nouvelles annonces matchent ta recherche {name} ») / `.body*` / `.cta`

**Dependencies**
- T-022 ✅ done
- T-034 (emails) à avoir
- E-T07 (multi-ville) pour le filtre city pertinent

**Tests**
- `find-new-matches.test.ts` : filtres restrictifs → 0 matches · filtres larges → matches expected · sinceDate respecté
- `notify-saved-searches.test.ts` (cron) : envoie email pour chaque match · skip si pas de nouveaux matches · update lastNotifiedAt même si email échoue
- E2E : student applique filtres → save search → publish une annonce qui match → manual trigger cron → vérifie email reçu

**Edge cases**
- Filters JSON ne correspond plus à la structure (migration de schema) → graceful skip + log
- User supprime son compte → cascade supprime ses SavedSearch
- Trop de matches dans un digest (> 50) → email plus court avec « Voir les {count} sur AryTrano »
- Premier run : `lastNotifiedAt` null → considérer comme « since createdAt » pour éviter de notifier toutes les annonces existantes

**A11y**
- SaveSearchDialog avec focus trap + ESC
- Toggle switch accessible (cf shadcn Switch primitive)

**Effort estimé** : ~1 semaine

**Priorité** : P1 · **Statut** : 📋 todo

---

#### E-T10 · Vue carte centrale avec clusters
**En tant que** visiteur
**Je veux** voir TOUTES les annonces de la ville sur une carte avec clusters par quartier
**Afin de** explorer spatialement plutôt qu'en liste

**Implementation outline**
1. Route `/annonces/map` ou toggle list ↔ map sur `/annonces` (URL query `?view=list|map`)
2. Provider de carte : décision entre pigeon-maps (déjà utilisé, 5KB) ou MapLibre/Leaflet pour le marker clustering plus mature · pigeon-maps a `<Overlay>` mais pas de clustering natif → besoin de la lib `supercluster` (40KB) à intégrer manuellement · MapLibre + `maplibre-gl-cluster` plus simple mais ~80KB JS · décision : **MapLibre** pour la robustesse, lazy-loaded
3. Server Component fetche les listings (avec lat/lng) selon filtres URL, limit 500
4. Client component reçoit les listings, build superclusters basé sur le zoom level
5. Cluster click : zoom-in (Leaflet/MapLibre native) ou expand to individual markers
6. Marker click : popover mini-card (photo thumbnail + titre + prix + CTA « Voir »)
7. Respect des filtres URL (priceMin, type, neighborhood, etc.) — sync entre list view et map view
8. Empty state map : « 0 annonces sur la carte avec ces filtres »
9. Fallback list-only mode si JS off / 3G timeout (déjà géré par next/dynamic ssr:false)
10. Tuiles : OSM commercial provider (Maptiler ou Stadia) — cohérent avec AUD-008 et T-038
11. CSP étendu pour Maptiler/Stadia tile URLs si on switch

**Files créés**
- `src/features/listings/components/ListingsMapView.tsx` (Client, dynamic)
- `src/features/listings/components/ListingsMapLoader.tsx` (Server wrapper)
- `src/features/listings/services/build-clusters.ts` (pure fn, supercluster)
- `src/features/listings/components/MapMarkerPopover.tsx`
- `src/features/listings/components/MapViewToggle.tsx` (Client, switch list/map)
- `src/features/listings/__tests__/build-clusters.test.ts`

**Files modifiés**
- `src/app/(public)/annonces/page.tsx` : conditional render list vs map
- `src/features/listings/queries/list-public-listings.ts` : retourner lat/lng + thumbnail
- `src/proxy.ts` : étendre CSP `img-src` + `connect-src` pour le nouveau tile provider
- `src/lib/env.ts` : `TILE_PROVIDER_URL` env var
- `package.json` : `maplibre-gl` + `supercluster` deps

**DB schema** : aucun changement (lat/lng existent sur Listing si on les a, sinon utiliser neighborhood.lat/lng — décision : utiliser le centre du quartier pour anti-stalking cf T-053)

**API endpoints**
- `GET /api/v1/listings/map?bbox=&filters=` — pour le mobile (zoom-dependent fetch)

**i18n keys nouvelles**
- `annonces.view.list` / `.view.map`
- `annonces.map.empty` (« Aucune annonce sur la carte avec ces filtres ») / `.map.fallback` (« Active JS pour voir la carte »)
- `annonces.map.marker.viewListing` (« Voir cette annonce »)
- `annonces.map.cluster.count` (« {count} annonces ici, zoom pour voir »)

**Dependencies**
- T-014 (filtres) ✅ done
- E-T07 (multi-ville) recommandé avant pour scoper
- AUD-008 (tile provider commercial)

**Tests**
- `build-clusters.test.ts` : 1000 points → bon nombre de clusters par zoom level · pure function, pas de DOM
- E2E : visiteur clique « Voir sur carte » → map charge, voit clusters, click cluster → zoom-in + markers individuels

**Edge cases**
- > 500 listings dans le bbox : retourner 500 + flag « zoom in pour plus » dans la response
- Listing sans lat/lng → exclu de la map view (mais visible en list view)
- 2 listings au même point (lat/lng identiques) → markerOffset ou groupé en mini-cluster de 2
- User sur mobile portrait : map prend ~70% de la viewport, list dropdown depuis le bas

**A11y**
- Toggle list ↔ map avec `role="tablist"`
- Map view a un fallback list semantic visible aux SR (« 32 annonces dans cette zone : ... »)
- Markers focusable via Tab, popover via Enter
- Annonce live des clusters click pour SR

**Performance**
- Lazy MapLibre via dynamic import (chunk ~120KB)
- Tuiles fetched on-demand par bbox
- Listings filtered server-side avant envoi (max 500 LPs)

**Effort estimé** : ~1 semaine

**Priorité** : P1 · **Statut** : 📋 todo

---

#### E-T14 · Recherche full-text Postgres (titre + description)
**En tant que** visiteur
**Je veux** taper un mot-clé (« balcon », « université », « jardin ») et obtenir les annonces qui en parlent
**Afin de** affiner ma recherche au-delà des filtres structurés

**Implementation outline**
1. Migration Prisma : ajouter une colonne générée `Listing.searchVector tsvector` calculée à partir de `to_tsvector('french', title || ' ' || description)` (et idéalement multi-lingual avec un fallback pour MG)
2. Index GIN sur la colonne `searchVector`
3. Query helper : `searchListings(query, filters, cursor)` qui fait `WHERE searchVector @@ websearch_to_tsquery('french', :query) AND status='PUBLISHED' ORDER BY ts_rank(searchVector, websearch_to_tsquery(...)) DESC, publishedAt DESC`
4. Barre de recherche dans le header de `/annonces` (form GET → URL `?q=jardin`)
5. Highlight des matches dans le titre de la card (utiliser `ts_headline()` ou client-side mark)
6. Empty state si 0 result : suggestions (« Essaie : balcon, meublé, université »)
7. Combine avec filtres existants : `q=balcon&priceMax=300000&type=STUDIO`
8. Cursor pagination compatible (cursor sur `(rank, publishedAt, id)`)
9. Cible perf : 99p < 100ms sur 10k listings avec index GIN

**Files créés**
- `prisma/migrations/<ts>_add_listing_search_vector/migration.sql` (raw SQL pour la colonne générée + index GIN)
- `src/features/listings/queries/search-listings.ts`
- `src/features/listings/components/SearchInput.tsx` (Client, form submit on enter or debounced)
- `src/features/listings/components/SearchEmptyState.tsx`
- `src/features/listings/services/highlight-matches.ts` (pure, escape HTML safe)
- `src/features/listings/__tests__/search-listings.test.ts`

**Files modifiés**
- `prisma/schema.prisma` : ajouter `searchVector Unsupported("tsvector")?` (Prisma ne gère pas tsvector nativement — utiliser raw queries pour cette colonne)
- `src/app/(public)/annonces/page.tsx` : intégrer SearchInput + branch sur `searchListings` si `q` présent
- `src/lib/i18n/messages/*.ts` : `search.input.placeholder` / `.empty.title` / `.empty.suggestions`

**DB schema (raw SQL nécessaire)**
```sql
-- migration.sql
ALTER TABLE "Listing"
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('french', coalesce(description, '')), 'B')
) STORED;

CREATE INDEX listing_search_vector_idx ON "Listing" USING GIN(search_vector);
```

**API endpoints**
- `GET /api/v1/listings?q=jardin&priceMax=300000` — étendre le handler existant pour gérer `q`

**i18n keys nouvelles**
- `search.input.placeholder` (« Cherche par mot-clé... »)
- `search.empty.title` (« Aucune annonce ne correspond à "{q}" »)
- `search.empty.suggestions` (« Essaie : ») + chips de suggestions hardcodés (balcon, meublé, université, jardin, wifi)
- `search.results.title` (« {count} annonces pour "{q}" »)

**Dependencies**
- T-012 (listings list) ✅
- T-014 (filtres) ✅
- Postgres FTS (built-in)

**Tests**
- `search-listings.test.ts` : query « balcon » → matches listings avec ce mot · ranking correct (titre weight > description) · empty query → fallback comportement actuel
- `highlight-matches.test.ts` : escape HTML + highlight via `<mark>` proprement
- Performance : EXPLAIN ANALYZE sur 10k seed → < 100ms

**Edge cases**
- Query avec SQL injection attempt → `websearch_to_tsquery` est safe par design
- Query vide → fallback liste normale
- Query en MG (mots malagasy) → French stemmer ne marche pas — fallback `to_tsvector('simple', ...)` ou créer une colonne MG dédiée
- Query courte (1 char) → ignorer ou retourner empty
- Stop words FR ignorés automatiquement par le stemmer

**A11y**
- Input avec label sr-only
- Live region pour le count de results updaté
- Keyboard : Enter submit, Esc clear

**Performance**
- Index GIN couvre les 99p sub-100ms
- Cache `unstable_cache` pour les queries populaires ? Risk de stale, à mesurer
- Cursor pagination basée sur (rank, publishedAt, id) → stable même avec updates

**Effort estimé** : ~5 jours (incluant tuning du stemmer FR + MG)

**Priorité** : P2 · **Statut** : 📋 todo

---

#### E-T13 · PWA basique (offline last-viewed)
**En tant qu'**utilisateur en 3G instable
**Je veux** pouvoir consulter les annonces que j'ai déjà vues même hors connexion
**Afin de** pas perdre mon historique si ma connexion saute

**Implementation outline**
1. Créer `public/manifest.json` complet : name, short_name, icons (192/512), theme_color, background_color, display=standalone, start_url=/
2. Générer/Designer les icons PWA (192×192, 512×512, maskable) — assets dans `public/icons/`
3. Service Worker : utiliser `next-pwa` (Workbox) ou config Next 16 native (vérifier le support actuel)
4. Cache strategy :
   - HTML : NetworkFirst avec 3s timeout
   - Images Cloudinary : CacheFirst max 50 entries, max 30 days
   - Static assets (_next/static) : CacheFirst forever (hashed filenames)
   - Runtime cache : last 20 listings visited (NetworkFirst + fallback to cache)
5. Bannière offline : Composant `OfflineBanner.tsx` qui s'affiche quand `navigator.onLine === false`, montre les 20 listings cachés
6. Install prompt : utiliser `BeforeInstallPromptEvent` sur Chrome/Edge, custom prompt UI
7. Pas de push notifications v1 (UX consent complexe + nécessite VAPID + Web Push API)
8. Test offline mode : DevTools → offline → naviguer sur des listings déjà vus

**Files créés**
- `public/manifest.json`
- `public/icons/icon-192.png`, `icon-512.png`, `maskable-icon-512.png`, `apple-touch-icon.png`
- `src/app/(public)/sw.ts` ou `public/sw.js` (selon Next 16 patterns)
- `src/components/shared/PwaInstallPrompt.tsx`
- `src/components/shared/OfflineBanner.tsx`
- `src/lib/pwa/cache-strategies.ts`

**Files modifiés**
- `src/app/layout.tsx` : `<link rel="manifest">` + `<meta name="theme-color">` + `<link rel="apple-touch-icon">`
- `next.config.ts` : config PWA via wrapper ou natif
- `package.json` : `next-pwa` dep (si choix Workbox)
- `src/lib/i18n/messages/*.ts` : clés PWA

**DB schema** : aucun

**API endpoints** : aucun

**i18n keys nouvelles**
- `pwa.install.banner.title` (« Ajoute AryTrano à ton écran d'accueil ») / `.banner.body` / `.banner.install` / `.banner.dismiss`
- `pwa.offline.banner.title` (« Tu es hors ligne ») / `.offline.body` (« Voici tes derniers logements vus »)
- `pwa.offline.cached.viewLast` (« {count} annonces sauvegardées »)

**Dependencies**
- Décision Workbox vs native Service Worker
- Design : icons PWA (peut être généré depuis le logo existant)

**Tests**
- E2E : install PWA dans Chrome → vérifie qu'il apparaît dans App tray · DevTools offline + naviguer sur listing visité → page charge depuis cache
- Lighthouse PWA audit : score 100

**Edge cases**
- Service Worker update : prompt user « Nouvelle version disponible, recharger »
- Cache full (50 listings) : LRU eviction
- Browser support : pas tous les browsers MG supportent PWA (UC Browser, Opera Mini) — graceful degradation
- iOS Safari : pas de `beforeinstallprompt`, instructions manuelles « Add to Home Screen »

**A11y**
- OfflineBanner avec `role="alert"` + `aria-live="polite"`
- Install prompt accessible : button visible avec aria-label

**Performance**
- Service Worker registration non-bloquante
- Cache hit ratio target > 70% sur pages déjà visitées

**Effort estimé** : ~3 jours (config + icons + cache strategies + UX prompts)

**Priorité** : P2 (low impact tant que la connectivité Fianar reste autour de 3G stable) · **Statut** : 📋 todo

### API publique + Mobile

#### E-T21 · REST API publique `/api/v1/` (mobile-first)
**En tant que** dev de l'app mobile React Native
**Je veux** une API REST stable et documentée sur `/api/v1/`
**Afin de** consommer les mêmes services que le web

**Implementation outline**
1. Architecture déjà prête : `features/X/api/` handlers existent dans la structure · les services dans `features/X/services/` sont déjà transport-agnostic
2. Auth : émettre un JWT à `POST /api/v1/auth/login` (Bearer token signed avec `AUTH_SECRET`, 30d expiry) + `POST /api/v1/auth/refresh` pour renew · payload : `{ sub, role, locale, exp }`
3. Middleware `lib/api/auth-middleware.ts` qui parse `Authorization: Bearer <jwt>`, valide, attache `request.user` au context
4. Routes à implémenter (couverture complète web→API parity) :
   - `POST /api/v1/auth/register`, `/login`, `/logout`, `/refresh`
   - `GET /api/v1/users/me`, `PATCH /api/v1/users/me`, `DELETE /api/v1/users/me`
   - `GET /api/v1/users/me/login-events`, `GET /api/v1/users/me/favorites`, `GET /api/v1/users/me/searches`, `GET /api/v1/users/me/export`
   - `GET /api/v1/cities`, `GET /api/v1/cities/:slug/neighborhoods`
   - `GET /api/v1/listings` (filters + cursor), `GET /api/v1/listings/:id`, `POST /api/v1/listings`, `PATCH /api/v1/listings/:id`, `DELETE /api/v1/listings/:id`
   - `POST /api/v1/listings/:id/photos`, `DELETE /api/v1/listings/:id/photos/:photoId`, `PATCH /api/v1/listings/:id/photos/reorder`
   - `POST /api/v1/listings/:id/publish`, `POST /api/v1/listings/:id/unpublish`
   - `POST /api/v1/contact/:listingId` (reveal phone)
   - `GET /api/v1/listings/:id/reviews`, `POST /api/v1/listings/:id/reviews`
   - `POST /api/v1/reviews/:id/response`, `PATCH /api/v1/reviews/:id/response`
   - `POST /api/v1/quiz/submit`, `POST /api/v1/quiz/subscribe-email`
   - `POST /api/v1/whatsapp-alerts/subscribe`
   - `GET /api/v1/listings/:id/stats` (owner only)
5. Format de réponse :
   - Success : `{ data: T, meta?: { cursor, total } }`
   - Error : `{ error: { code: 'validation_failed' | 'not_found' | 'unauthorized' | 'forbidden' | 'rate_limited' | 'conflict', message, fields?: Record<string,string[]> } }`
   - HTTP codes : 200/201/204 success, 400 validation, 401 auth, 403 forbidden, 404 not found, 409 conflict, 422 business rule, 429 rate limit
6. Rate-limits : ré-utiliser `rateLimiters.*` avec bearer-userId si auth, sinon ipHash · documenté par-endpoint
7. OpenAPI 3.1 spec générée via `@asteasolutions/zod-to-openapi` au build time · exposée à `GET /api/v1/openapi.json`
8. Documentation : `public/docs/api-v1.md` avec exemples curl + Postman collection + auth flow

**Files créés**
- `src/lib/api/auth-middleware.ts`
- `src/lib/api/errors.ts` (déjà partiel)
- `src/lib/api/jwt.ts` (sign + verify)
- `src/lib/api/openapi.ts` (registry + generator)
- `src/app/api/v1/auth/login/route.ts`
- `src/app/api/v1/auth/register/route.ts`
- `src/app/api/v1/auth/refresh/route.ts`
- `src/app/api/v1/auth/logout/route.ts`
- `src/app/api/v1/users/me/route.ts`
- `src/app/api/v1/users/me/login-events/route.ts`
- `src/app/api/v1/users/me/favorites/route.ts`
- `src/app/api/v1/users/me/searches/route.ts`
- `src/app/api/v1/users/me/export/route.ts`
- `src/app/api/v1/cities/route.ts`
- `src/app/api/v1/cities/[slug]/neighborhoods/route.ts`
- `src/app/api/v1/listings/route.ts` (GET + POST)
- `src/app/api/v1/listings/[id]/route.ts` (GET + PATCH + DELETE)
- `src/app/api/v1/listings/[id]/photos/route.ts`
- `src/app/api/v1/listings/[id]/photos/[photoId]/route.ts`
- `src/app/api/v1/listings/[id]/publish/route.ts`
- `src/app/api/v1/listings/[id]/stats/route.ts`
- `src/app/api/v1/listings/[id]/reviews/route.ts`
- `src/app/api/v1/contact/[listingId]/route.ts`
- `src/app/api/v1/quiz/submit/route.ts`
- `src/app/api/v1/quiz/subscribe-email/route.ts`
- `src/app/api/v1/whatsapp-alerts/subscribe/route.ts`
- `src/app/api/v1/openapi.json/route.ts`
- `public/docs/api-v1.md`
- `public/docs/postman-collection.json`
- Tests : `src/app/api/v1/__tests__/*` (un test par endpoint, integration with seeded DB)

**Files modifiés**
- `src/features/*/api/` : la majorité existent déjà comme handlers — soit on les expose direct depuis les route.ts, soit on les déplace
- `src/lib/env.ts` : pas de nouvelle var (AUTH_SECRET réutilisé)
- `package.json` : `@asteasolutions/zod-to-openapi` dep
- `next.config.ts` : si on veut générer le openapi.json au build → script post-build

**DB schema** : aucun changement (l'API expose la même DB que le web)

**API endpoints** : tout listé ci-dessus

**i18n keys** : aucun (l'API retourne des codes machine-readable, le client traduit)

**Dependencies**
- Toutes les features v0 + v0.5 doivent avoir leur logique en `services/` (architecture déjà respectée)
- Décision sur JWT vs session cookie pour le mobile — JWT preferred

**Tests**
- Integration test per endpoint : seed DB → call avec/sans auth → vérifier shape de la réponse
- Auth flow : register → login → me → token refresh → logout
- Rate-limit : burst de requêtes → 429 attendu
- OpenAPI spec : valide contre la spec OpenAPI 3.1 (avec un linter type Spectral)

**Edge cases**
- JWT révoqué (logout) : on garde un blocklist Redis ou on accepte la stalesness 30d (premier choix pour la v1)
- Tokens expirés → 401 avec message clair pour que le client trigger refresh
- Concurrency : 2 PATCH en parallèle sur le même listing → last-write-wins (acceptable v1, optimistic locking en v2)
- Versioning : `/api/v1/` lock le format · si breaking change → `/api/v2/` avec 6 mois de overlap

**A11y** : N/A (API)

**Security**
- Tous les endpoints rate-limités
- Authn check first (avant Zod) pour éviter de leak la structure validation
- CORS : restreindre à `arytrano.mg` + scheme `arytrano://` pour deep-links mobile
- Logs : pas de PII dans les access logs (header `Authorization` redacted)

**Performance**
- Cursor pagination obligatoire (pas d'offset)
- Cache hints : `Cache-Control: private, max-age=0` par défaut · public 5min sur `/api/v1/listings` filtré + `/api/v1/cities`
- Compression gzip / brotli activée

**Effort estimé** : ~2 semaines (l'archi est prête, c'est de l'écriture de handlers + tests + docs)

**Priorité** : P0 (v1 trigger) · **Statut** : 📋 todo

---

#### E-T22 · App mobile MVP (React Native / Expo)
**En tant qu'**étudiant à Fianarantsoa
**Je veux** une app native iOS / Android pour browser + contacter les annonces
**Afin de** ne pas devoir ouvrir le navigateur à chaque fois

**Implementation outline**
1. Setup Expo project séparé (mono-repo via pnpm/npm workspaces OU repo séparé qui consomme un npm package partagé `@arytrano/shared`)
2. Stack :
   - **Expo SDK 53+** avec EAS Build pour CI iOS + Android
   - **NativeWind** (Tailwind RN) — partage les tokens design (couleurs, spacing) avec le web
   - **React Navigation v7** — Stack + Bottom Tabs
   - **TanStack Query** — cache API + offline-first
   - **Expo SecureStore** — store JWT refresh token
   - **Expo Notifications** — push (déclenché par T-049 + T-047 via le serveur)
   - **Sentry React Native** — error tracking aligné avec T-056
3. Scope MVP (~6 écrans) :
   - Onboarding (intro slides + locale + sign-in / browse-as-guest)
   - Sign-in + Sign-up (formulaire + Google OAuth via expo-auth-session)
   - Home (Annonces list + filtres)
   - Listing detail (galerie + infos + map + contact CTA WhatsApp/Phone)
   - Favoris (liste sauvegardée local + sync API)
   - Profile (settings + locale switch + logout)
4. Deep-links : `arytrano://listings/<id>` + universal links `https://arytrano.mg/...` qui forward au mobile si installed
5. WhatsApp contact : `Linking.openURL('whatsapp://send?phone=...&text=...')` avec fallback web `wa.me`
6. Push notifications : register Expo token au sign-in → store dans `User.expoPushToken` → backend envoie via Expo Push API depuis les services (T-049, T-047)
7. Offline-first : TanStack Query persiste le cache via AsyncStorage · 20 listings cached
8. Distribution :
   - Phase 1 (beta) : TestFlight + Play Console Internal Testing → 20-50 testeurs proprios + students
   - Phase 2 : Play Store public release (Madagascar focused)
   - Phase 3 : Apple App Store public (low iOS share MG)
9. Branding : logo, palette, fonts cohérents avec le web — designer pass requis avant store submission
10. Partage de code : créer un package `packages/shared/` avec Zod schemas + types + service pure functions (scoring quiz, phone normalization) · importé par web ET mobile

**Files créés (workspace mobile)**
- `mobile/` ou `apps/mobile/` workspace
- `mobile/app/_layout.tsx` (Expo Router)
- `mobile/app/(tabs)/index.tsx` (home)
- `mobile/app/(tabs)/search.tsx`
- `mobile/app/(tabs)/favorites.tsx`
- `mobile/app/(tabs)/profile.tsx`
- `mobile/app/listing/[id].tsx`
- `mobile/app/auth/sign-in.tsx`
- `mobile/app/auth/sign-up.tsx`
- `mobile/app/onboarding.tsx`
- `mobile/lib/api-client.ts` (typed wrapper sur l'API v1)
- `mobile/lib/auth.ts` (SecureStore + token refresh)
- `mobile/lib/push.ts`
- `mobile/components/ListingCard.tsx`
- `mobile/components/SearchFilters.tsx`
- `mobile/components/Gallery.tsx`
- `mobile/components/ContactButton.tsx`
- `mobile/eas.json` (EAS config)
- `mobile/app.json` (Expo config + bundleId + version)
- `packages/shared/src/schemas/` (déplacés ou re-exportés depuis web)
- `packages/shared/src/services/score-quartiers.ts` (déplacé)
- `packages/shared/src/services/normalize-phone.ts` (déplacé)
- `packages/shared/package.json`

**Files modifiés (web)**
- `package.json` root : workspaces config si monorepo
- `src/features/quiz/services/score-quartiers.ts` : import depuis `@arytrano/shared`
- `src/features/alerts/schemas/whatsapp-alert.ts` : import depuis `@arytrano/shared`
- `prisma/schema.prisma` : `User.expoPushToken String?` pour le push registration

**DB schema**
```prisma
// Patch sur User :
expoPushToken String? @unique
```

**API endpoints** : tous via E-T21, plus :
- `POST /api/v1/users/me/push-token { token }` — register Expo push token
- `DELETE /api/v1/users/me/push-token` — un-register (sur logout)

**i18n keys** : majoritairement les mêmes que le web · l'app utilise le même dict via le shared package

**Dependencies**
- E-T21 (API publique) doit être en avance
- T-020 (Locale switcher) — pattern à reproduire mobile
- Designer pass pour les écrans (Figma)

**Tests**
- E2E via Maestro ou Detox : sign-in → browse → contact → vérifie WhatsApp ouverture
- Snapshot tests pour les composants critiques (ListingCard, Gallery)
- Tests API client : mocks via msw (Mock Service Worker compatible RN)

**Edge cases**
- Push token expire / device replaced → endpoint refresh côté serveur
- Offline state : afficher banner + permettre browse cached listings
- Deep-link sur listing supprimé → 404 screen
- iOS notifications opt-in flow (Android grants by default)
- Apple Sign In requis si Google Sign In actif (App Store policy)

**A11y**
- VoiceOver / TalkBack support : `accessibilityLabel` + `accessibilityHint` sur tous les composants interactifs
- Dynamic Type / Font Scale respect
- Color contrast WCAG AA même en dark mode (à confirmer scope dark mode v1)

**Performance**
- Bundle size cible < 30MB IPA / 15MB APK (Hermes engine activé)
- Cold start < 3s sur device mid-range (Xiaomi Redmi Note 8 — populaire MG)
- Image caching via expo-image (mieux que RN Image standard)

**Effort estimé** : ~3 mois en parallèle du web v1 (necessite 1 dev mobile dédié ou 1 dev fullstack qui partage le temps)

**Priorité** : P0 (v1 trigger) · **Statut** : 📋 todo

---

## 💰 v2 — Monétisation

> **Modèle décidé 2026-05-25** (après décente terrain Fianarantsoa) :
> - **Locataire = gratuit à vie.** Aucun frais à aucun moment.
> - **Propriétaire = compte unique** (pas de tiers Free/Pro). Toutes les fonctionnalités accessibles à tous.
> - **AryTrano facture success-based** : `15 000 Ar fixe + 8% de la caution` (si caution existe) par **bail signé sur la plateforme**.
> - **Livrable contre les 15k+8%** : le **« Contrat AryTrano »** — PDF juridique généré, état des lieux numérique horodaté (photos entrée+sortie), reçus mensuels auto, arbitrage AryTrano en cas de litige caution, badge « Propriétaire de confiance ».
> - **Anti-disintermédiation** : pas de verrous techniques (impossibles à petite échelle) — la valeur du Contrat AryTrano (économie notaire + arbitrage + reputation) rend la signature on-platform rationnelle pour le proprio.
>
> **Subscriptions / boost à la carte / badge one-time sont supersedés** par ce modèle (cf E-T16/E-T17/E-T23 dépréciés ci-dessous). Ils pourront être réactivés en v2.5+ si la traction du success-based révèle un besoin de revenu récurrent.
>
> **Math cible (~6 mois)** : 50 baux/mois × 55k Ar (15k + 40k de 8% caution moyenne 500k) ≈ **2,75M Ar/mois (~$580 USD)**. Bootstrap-viable.
>
> **Stratégie reste** : monétiser côté propriétaire, gratuit côté étudiant.

### Pricing communication (public)

#### E-T25 · Pricing block public sur `/proprietaires`
**En tant qu'**équipe AryTrano
**Je veux** afficher le nouveau modèle de pricing success-based sur la page propriétaires publique
**Afin de** valider le message auprès des proprios avant tout investissement infra paiement, et préparer le funnel d'acquisition

**Implementation outline**
1. Refondre la section Pricing actuelle de `ProprietairesPage.tsx` (qui affiche « Beta v0.5 — Gratuit ») avec le nouveau modèle
2. Layout : 2 cards côte à côte
   - **Card 1 — « Publication »** : 0 Ar, illimité, badge confiance, stats basiques, durée illimitée. CTA « Créer mon compte gratuit »
   - **Card 2 — « Quand tu loues »** : 15 000 Ar + 8% caution. En échange : Contrat AryTrano PDF, état des lieux numérique, arbitrage caution, badge confiance renforcé, reçus mensuels auto. CTA « Voir un exemple de Contrat AryTrano »
3. Section explicative en dessous : « Tu paies seulement quand tu loues, pas quand tu publies » + diagramme du flow (publier → contact → visite → signer sur AryTrano → frais déclenchés)
4. FAQ entry à ajouter : « Pourquoi je paye 15k+8% à la signature ? » avec explication courte du Contrat AryTrano
5. Comparatif vs agences classiques (qui prennent 50-100% d'un mois en frais d'agence) → mise en valeur du tarif AryTrano
6. Pas de paiement réel, pas de backend — UI marketing only
7. Aucun changement DB

**Files créés**
- (aucun — refonte de l'existant)

**Files modifiés**
- `apps/web/src/features/static-pages/proprietaires/ProprietairesPage.tsx` — section `<Pricing>`
- `apps/web/src/features/static-pages/proprietaires/faq-items.ts` — ajouter FAQ pricing
- `apps/web/src/lib/i18n/messages/fr-MG.ts` + `mg.ts` — nouvelles clés `proprietaires.pricing.*` :
  - `.publication.title` / `.price` / `.features.*` / `.cta`
  - `.success.title` / `.price` / `.priceSub` / `.features.*` / `.cta`
  - `.comparison.title` / `.body` (vs agences)
  - `.faq.whyPay.q` / `.faq.whyPay.a`
  - `.flow.step1` / `.flow.step2` / `.flow.step3` / `.flow.step4`

**API endpoints** : aucun

**Dependencies** : aucun (pur UI)

**Tests**
- Visuel : 2 cards lisibles desktop + mobile
- A11y : labels heading hierarchy, contraste WCAG AA sur les CTAs

**Edge cases**
- Pas applicable (rendu statique)

**A11y**
- Tarifs en font tabular-nums
- Iconographie de support (pas de couleur seule comme signal)

**Effort estimé** : ~3 heures

**Priorité** : P0 (premier pas v2 — validation marché avant tout code backend) · **Statut** : 📋 todo

---

#### E-T26 · Lease signature on-platform + success-based fee
**En tant que** propriétaire et locataire qui ont trouvé un accord
**Je veux** signer numériquement le bail sur AryTrano et déclencher le paiement du frais de service
**Afin de** formaliser la location avec preuve juridique + activer le Contrat AryTrano

**Implementation outline**
1. Flow user :
   - Propriétaire sur sa page de gestion d'annonce → bouton « J'ai un locataire à signer »
   - Wizard 3 étapes :
     1. **Inviter locataire** : email ou téléphone du locataire (créer compte si pas existant)
     2. **Conditions** : loyer mensuel, caution montant, date début, durée bail, charges incluses
     3. **Récap + paiement** : affiche `15 000 Ar + 8% × {caution} = {total} Ar`, owner accepte CGV, redirect GoalPay
   - Webhook success → status Lease `PENDING_TENANT_SIGNATURE`, email locataire « Le proprio a signé, à toi »
   - Locataire reçoit email/SMS → log in → accepte / refuse les conditions → signe à son tour
   - Si refus → Lease annulé, refund automatique au proprio
   - Si signature locataire → status `ACTIVE` → Contrat AryTrano généré (cf E-T27)
2. Pricing :
   - `LEASE_SIGNATURE_FEE_MGA` = 15 000 (env var)
   - `CAUTION_COMMISSION_RATE` = 0.08 (env var)
   - Si caution = 0 → seulement 15 000 Ar
   - Frais payé en UN paiement combiné au moment de la signature owner
3. Model `Lease` :
   - `id`, `listingId`, `ownerId`, `tenantId`, `monthlyRentMGA Int`, `cautionMGA Int @default(0)`
   - `startDate`, `durationMonths Int`
   - `signatureFeeMGA Int`, `cautionCommissionMGA Int`, `paymentId` FK
   - `status` enum (DRAFT, PENDING_TENANT, ACTIVE, REFUSED, TERMINATED, DISPUTED)
   - `ownerSignedAt`, `tenantSignedAt`, `terminatedAt?`
   - Audit fields
4. Side-effects à `Lease.status = ACTIVE` :
   - `Listing.status` passe en `RENTED` (nouveau enum value, hide de la grille publique)
   - Trigger event downstream pour E-T27 (génération PDF + setup état des lieux)
5. Pas de listing supprimée tant que Lease ACTIVE (FK Restrict)
6. Anti-disintermédiation soft : email mensuel au proprio « Ton annonce est toujours visible, est-elle louée ? » avec CTA `signer maintenant` ou `marquer louée hors plateforme` (option 2 = honnêteté, 0 Ar mais réputation note)
7. Rate-limit : initiate lease 5/h/proprio (anti-spam)
8. Le frais combiné `signatureFee + cautionCommission` est versé d'un coup à AryTrano via GoalPay → Pas d'escrow, AryTrano NE GARDE JAMAIS la caution elle-même

**Files créés**
- `prisma/migrations/<ts>_add_lease/migration.sql`
- `apps/web/src/features/leases/schemas/lease-input.ts` (Zod)
- `apps/web/src/features/leases/services/initiate-lease.ts`
- `apps/web/src/features/leases/services/owner-sign-lease.ts`
- `apps/web/src/features/leases/services/tenant-sign-lease.ts`
- `apps/web/src/features/leases/services/refuse-lease.ts`
- `apps/web/src/features/leases/services/calculate-fees.ts` (pure : `(rentMGA, cautionMGA) → { signature, commission, total }`)
- `apps/web/src/features/leases/actions/initiate-lease.ts`
- `apps/web/src/features/leases/actions/sign-lease.ts`
- `apps/web/src/features/leases/queries/get-lease-by-id.ts`
- `apps/web/src/features/leases/queries/list-user-leases.ts`
- `apps/web/src/features/leases/components/LeaseWizard.tsx` (client, 3 steps)
- `apps/web/src/features/leases/components/LeaseStep1Tenant.tsx`
- `apps/web/src/features/leases/components/LeaseStep2Terms.tsx`
- `apps/web/src/features/leases/components/LeaseStep3Recap.tsx`
- `apps/web/src/features/leases/components/LeaseStatusBadge.tsx`
- `apps/web/src/app/dashboard/listings/[id]/lease/new/page.tsx`
- `apps/web/src/app/dashboard/leases/[id]/page.tsx`
- `apps/web/src/app/dashboard/leases/page.tsx` (liste mes baux)
- `apps/web/src/app/api/v1/leases/route.ts`
- `apps/web/src/app/api/v1/leases/[id]/sign/route.ts`
- `apps/web/src/features/leases/__tests__/calculate-fees.test.ts`
- `apps/web/src/features/leases/__tests__/initiate-lease.test.ts`
- `apps/web/src/lib/email/templates/lease-invite-tenant-{fr,mg}.ts`
- `apps/web/src/lib/email/templates/lease-signed-{fr,mg}.ts`
- `apps/web/src/lib/email/templates/lease-refused-{fr,mg}.ts`

**Files modifiés**
- `prisma/schema.prisma` : nouveau model `Lease` + enum `LeaseStatus` + ajout `RENTED` à `ListingStatus`
- `apps/web/src/lib/env.ts` : `LEASE_SIGNATURE_FEE_MGA`, `CAUTION_COMMISSION_RATE`
- `apps/web/src/lib/rate-limit/index.ts` : `initiateLease` (5/h/userId)
- `apps/web/src/features/payments/schemas/payment-purpose.ts` : ajouter `LEASE_SUCCESS_FEE` à l'enum
- `apps/web/prisma/schema.prisma` : `Payment.amountMGA` `Decimal(12,2)` → `Int` (corriger memory violation MGA no subunit)

**DB schema**
```prisma
model Lease {
  id                   String       @id @default(cuid())
  listingId            String
  ownerId              String
  tenantId             String
  monthlyRentMGA       Int
  cautionMGA           Int          @default(0)
  startDate            DateTime
  durationMonths       Int
  signatureFeeMGA      Int          // typiquement 15000
  cautionCommissionMGA Int          // 8% × cautionMGA
  paymentId            String?      @unique
  status               LeaseStatus  @default(DRAFT)
  ownerSignedAt        DateTime?
  tenantSignedAt       DateTime?
  terminatedAt         DateTime?
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt

  listing Listing  @relation(fields: [listingId], references: [id], onDelete: Restrict)
  owner   User     @relation("OwnerLeases", fields: [ownerId], references: [id], onDelete: Restrict)
  tenant  User     @relation("TenantLeases", fields: [tenantId], references: [id], onDelete: Restrict)
  payment Payment? @relation(fields: [paymentId], references: [id])

  @@index([listingId])
  @@index([ownerId, status])
  @@index([tenantId, status])
  @@index([status, createdAt])
}

enum LeaseStatus {
  DRAFT                 // proprio rédige, locataire pas encore invité
  PENDING_TENANT        // proprio a signé+payé, attend locataire
  ACTIVE                // les 2 ont signé
  REFUSED               // locataire a refusé → refund proprio
  TERMINATED            // bail terminé normalement (fin de durée)
  DISPUTED              // litige en cours (arbitrage E-T27)
}

// Add to ListingStatus enum:
enum ListingStatus {
  // ... existants
  RENTED  // bail actif, masqué de la grille publique
}
```

**API endpoints**
- `POST /api/v1/leases` — owner initiate (auth)
- `GET /api/v1/leases/:id` — viewer must be owner or tenant
- `POST /api/v1/leases/:id/sign` — tenant signs (auth, must be invited)
- `POST /api/v1/leases/:id/refuse` — tenant refuses (triggers refund)

**i18n keys nouvelles**
- `lease.wizard.title` / `.step1.title` / `.step2.title` / `.step3.title`
- `lease.fields.tenantEmail` / `.tenantPhone` / `.monthlyRent` / `.caution` / `.startDate` / `.durationMonths`
- `lease.fees.signature` (« Frais de signature ») / `.fees.commission` (« Commission caution (8%) ») / `.fees.total`
- `lease.cta.payAndSign` (« Signer et payer ») / `.cta.sendToTenant`
- `lease.cgv.accept`
- `lease.status.draft` / `.pendingTenant` / `.active` / `.refused` / `.terminated` / `.disputed`
- `lease.tenant.title` (« Un propriétaire t'invite à signer un bail ») / `.tenant.cta.accept` / `.cta.refuse`
- `lease.email.invite.subject` / `.body*`
- `lease.email.signed.subject`
- `lease.email.refused.subject`

**Dependencies**
- E-T15 (PaymentProvider) doit précéder
- E-T27 (Contrat AryTrano) consomme `Lease.status = ACTIVE` mais peut être codé en parallèle

**Tests**
- `calculate-fees.test.ts` : pure function — caution=0 → seulement signature · caution=500k → 15k + 40k = 55k · arrondi cohérent
- `initiate-lease.test.ts` : créer lease en DRAFT → payment initié · webhook success → PENDING_TENANT
- `tenant-sign.test.ts` : tenant ACCEPT → status ACTIVE + listing RENTED · REFUSE → refund + status REFUSED
- `idempotency.test.ts` : double-click signature owner → 1 seul payment row (idempotency key)
- E2E sandbox : flow complet owner → tenant → ACTIVE

**Edge cases**
- Listing supprimée entre initiate et tenant sign → refund auto + email
- Tenant n'a pas de compte → invitation via magic link (auth feature existante)
- Tenant met > 7j à signer → reminder email J+3, J+7 ; au-delà → DRAFT auto-cancelled + refund proprio
- Caution = 0 (proprio sans caution) → seulement 15k facturés, pas de 8%
- Owner essaye d'initier 2 baux sur la même listing (double-booking) → rejeter le 2e si premier en PENDING_TENANT ou ACTIVE
- Refund partiel non supporté v1 (tout ou rien)
- Si webhook GoalPay timeout/manqué → cron de reconciliation (E-T20) repolling

**A11y**
- Wizard avec progress indicator + steps labelled
- Validation inline (montants, dates) avec aria-describedby
- Bouton « Payer et signer » disabled pendant transaction
- Confirmation modal accessible

**Security**
- Frais calculés côté serveur (jamais accepter du client)
- Anti rate-limit initiate
- Owner ne peut signer que ses propres listings
- Tenant ne peut signer que les baux où il est invité
- Audit trail Payment.metadata { leaseId, computedFees }

**Effort estimé** : ~2 semaines (après E-T15)

**Priorité** : P0 (cœur du modèle revenu) · **Statut** : 📋 todo

---

#### E-T27 · « Contrat AryTrano » — livrable PDF + état des lieux + arbitrage
**En tant que** propriétaire et locataire qui ont signé un bail
**Je veux** recevoir un Contrat AryTrano (PDF juridique + état des lieux numérique horodaté + service d'arbitrage caution)
**Afin de** matérialiser la valeur des 15k+8% payés et avoir une preuve formelle de l'accord

**Implementation outline**
1. **Génération PDF du contrat de bail** :
   - À `Lease.status = ACTIVE` (les 2 ont signé), trigger background job
   - Template HTML conformité juridique MG (à valider avec juriste local) avec : parties, logement, loyer, caution, durée, conditions standard
   - Render via `puppeteer-core` headless ou `react-pdf` (eval lequel : puppeteer plus flexible mais plus lourd)
   - Upload Cloudinary (private folder, signed URLs avec expiry 7j)
   - Email aux 2 parties avec PDF attaché + lien permanent dans leur dashboard
2. **État des lieux numérique** :
   - Page `/dashboard/leases/[id]/inventory` accessible aux 2 parties
   - Wizard upload : photos de chaque pièce (cuisine, chambre, salle de bain, etc.) — min 1 par room, max 10
   - Vidéo optionnelle 30s max
   - Notes texte par photo (« mur cuisine taché 3cm² »)
   - À `Lease.status = ACTIVE` initial = état d'ENTRÉE obligatoire (force le proprio + locataire à co-uploader avant remise des clés)
   - À `Lease.status = TERMINATED` = état de SORTIE obligatoire (déclenche la libération de la caution côté proprio)
   - Toutes les photos `image_metadata: false, exif: false` (per memory cloudinary) + watermark horodatage + ID lease
   - Storage : `InventoryItem` model (leaseId, phase ENTRY/EXIT, roomKey, photoUrls[], video?, notes, uploadedAt, uploadedBy)
3. **Arbitrage caution (litige)** :
   - À fin de bail, si désaccord → owner ou tenant clique « Ouvrir un litige » sur la page lease
   - Form : raison du litige, montant en jeu, attachements (photos / messages)
   - Status `Lease → DISPUTED`
   - Notif admin (Slack + email)
   - Page `/admin/disputes` : admin voit états entrée + sortie côte à côte, lit les claims, tranche
   - Décision admin enregistrée + email aux 2 parties + status passe `TERMINATED` (ou refund partial enclenché si applicable)
   - SLA cible : décision sous 7j
   - Note : AryTrano ne reverse pas d'argent (pas escrow) ; l'arbitrage produit un verdict moral + reputation impact (badge « Propriétaire de confiance » peut être retiré si verdict défavorable répété)
4. **Badge « Propriétaire de confiance »** :
   - Auto-attribué après 3 baux ACTIVE sans litige
   - Visible sur PublicListingCard + page détail
   - Boost de visibilité +30% dans le tri par défaut (sort `newest` + multiplier sur position)
   - Retiré après 2 litiges perdus (admin decision)
5. **Reçus mensuels auto** :
   - Cron mensuel `cron/generate-monthly-receipts.ts` 
   - Pour chaque Lease ACTIVE, génère un reçu PDF mensuel (mois écoulé) → upload Cloudinary → email tenant + owner
   - Reçu liste : mois concerné, loyer payé, lease ID, signatures originales référencées
   - Status « payé » présumé (AryTrano ne vérifie pas le paiement réel — c'est juste un récapitulatif administratif que les 2 parties peuvent contester)

**Files créés**
- `apps/web/src/features/leases/services/generate-lease-pdf.ts`
- `apps/web/src/features/leases/services/generate-monthly-receipt.ts`
- `apps/web/src/features/leases/services/open-dispute.ts`
- `apps/web/src/features/leases/services/resolve-dispute.ts` (admin)
- `apps/web/src/features/inventory/services/upload-inventory-item.ts`
- `apps/web/src/features/inventory/services/validate-inventory-phase.ts`
- `apps/web/src/features/inventory/queries/get-inventory-by-lease.ts`
- `apps/web/src/features/inventory/components/InventoryUploader.tsx`
- `apps/web/src/features/inventory/components/InventoryViewer.tsx`
- `apps/web/src/features/inventory/components/RoomCard.tsx`
- `apps/web/src/features/disputes/components/DisputeForm.tsx`
- `apps/web/src/features/disputes/components/DisputeResolveForm.tsx` (admin)
- `apps/web/src/app/dashboard/leases/[id]/inventory/page.tsx`
- `apps/web/src/app/dashboard/leases/[id]/dispute/page.tsx`
- `apps/web/src/app/admin/disputes/page.tsx`
- `apps/web/src/app/admin/disputes/[leaseId]/page.tsx`
- `apps/web/src/app/api/cron/generate-monthly-receipts/route.ts`
- `apps/web/src/lib/invoicing/lease-pdf-template.tsx` (or .html if puppeteer)
- `apps/web/src/lib/invoicing/monthly-receipt-template.tsx`
- `apps/web/src/lib/email/templates/contract-ready-{fr,mg}.ts`
- `apps/web/src/lib/email/templates/dispute-opened-{fr,mg}.ts`
- `apps/web/src/lib/email/templates/dispute-resolved-{fr,mg}.ts`
- `apps/web/src/features/leases/__tests__/generate-lease-pdf.test.ts`
- `apps/web/src/features/disputes/__tests__/resolve-dispute.test.ts`

**Files modifiés**
- `prisma/schema.prisma` : nouveau model `InventoryItem` + model `Dispute`
- `apps/web/src/components/shared/AdminSidebar.tsx` : lien « Litiges »
- `vercel.json` : cron monthly receipts (1er du mois 06:00 UTC)
- `apps/web/src/lib/env.ts` : `CONTRACT_TEMPLATE_VERSION` (versionner les templates pour audit légal)

**DB schema**
```prisma
model InventoryItem {
  id          String          @id @default(cuid())
  leaseId     String
  phase       InventoryPhase  // ENTRY | EXIT
  roomKey     String          // kitchen | bedroom | bathroom | living | other-X
  photoUrls   String[]
  videoUrl    String?
  notes       String?         @db.Text
  uploadedAt  DateTime        @default(now())
  uploadedBy  String          // userId

  lease Lease @relation(fields: [leaseId], references: [id], onDelete: Cascade)

  @@index([leaseId, phase])
}

enum InventoryPhase {
  ENTRY
  EXIT
}

model Dispute {
  id              String         @id @default(cuid())
  leaseId         String         @unique
  openedById      String
  reason          String         @db.Text
  claimedAmountMGA Int           @default(0)
  attachmentUrls  String[]
  status          DisputeStatus  @default(OPEN)
  resolution      String?        @db.Text
  resolvedById    String?
  resolvedAt      DateTime?
  createdAt       DateTime       @default(now())

  lease    Lease @relation(fields: [leaseId], references: [id], onDelete: Cascade)
  openedBy User  @relation("DisputesOpened", fields: [openedById], references: [id], onDelete: Restrict)
  resolvedBy User? @relation("DisputesResolved", fields: [resolvedById], references: [id], onDelete: Restrict)

  @@index([status, createdAt])
}

enum DisputeStatus {
  OPEN
  IN_REVIEW
  RESOLVED_OWNER  // verdict en faveur du proprio
  RESOLVED_TENANT // verdict en faveur du locataire
  RESOLVED_SPLIT  // chacun a tort partiellement
}
```

**API endpoints**
- `POST /api/v1/leases/:id/inventory/:phase` — upload inventory item (auth, must be owner or tenant)
- `GET /api/v1/leases/:id/inventory` — fetch all inventory items for lease
- `POST /api/v1/leases/:id/dispute` — open dispute (auth)
- `POST /api/v1/admin/disputes/:id/resolve` — admin only
- `GET /api/v1/leases/:id/contract.pdf` — signed download URL (Cloudinary signed)
- `POST /api/cron/generate-monthly-receipts` — Bearer secret

**i18n keys nouvelles** (préfixe `lease.contract.*`, `inventory.*`, `dispute.*`)
- Contract : `.contract.ready.title` / `.ready.body` / `.download.cta`
- Inventory : `.inventory.title` / `.phase.entry` / `.phase.exit` / `.room.kitchen` / `.bedroom` / `.bathroom` / `.living` / `.upload.cta` / `.requirements`
- Dispute : `.dispute.open.cta` / `.open.form.reason` / `.amount` / `.status.open` / `.inReview` / `.resolved.*`
- Admin : `.admin.disputes.title` / `.tableHeaders.*` / `.resolve.verdict.*`
- Emails : `.email.contractReady.*` / `.dispute.opened.*` / `.dispute.resolved.*`

**Dependencies**
- E-T26 (Lease model + ACTIVE status) doit précéder
- Cloudinary EXIF strip per memory `feedback_exif_strip_explicit`
- E-T15 NOT directly needed (cet ticket ne touche pas le paiement)
- Validation légale du template de bail MG (juriste à briefer) avant production

**Tests**
- `generate-lease-pdf.test.ts` : input Lease ACTIVE → PDF généré valide (parse back to verify content)
- `resolve-dispute.test.ts` : admin verdict RESOLVED_TENANT → email envoyé, status updated, badge proprio impacté
- `validate-inventory-phase.test.ts` : ENTRY incomplet (room manquante) → reject
- E2E : créer Lease → upload entry inventory → terminate → upload exit → ouvrir dispute → admin resolve

**Edge cases**
- Lease ACTIVE > N mois sans état des lieux ENTRY → reminder J+7, blocage status après J+14 (statut suspendu)
- Photo upload échoue (réseau MG) → retry client + queue offline (PWA)
- Dispute ouverte 6 mois après terminate → accepter mais flagger « hors délai standard »
- Admin tente de résoudre dispute pas in-review → erreur 409
- PDF generation timeout (puppeteer slow) → retry async, email envoyé après
- Cloudinary down → fallback en attente, retry cron

**A11y**
- Wizard inventory accessible (steps + drag-drop input file avec keyboard fallback)
- PDF downloadable avec `aria-label` descriptif
- Dispute form labels explicits
- Admin resolve form avec radio group (verdict) + textarea (raisonnement)

**Security**
- Photos `image_metadata: false, exif: false` Cloudinary (anti-leak GPS / device)
- Signed URLs avec TTL 7j pour les PDFs (anti-link-sharing public)
- Admin dispute resolution = ADMIN role only + audit log
- Upload size limit 5MB par photo, 20MB par vidéo
- Rate-limit upload inventory 20/h/userId

**Legal/Compliance**
- Template de bail à faire valider par juriste MG (conformité Code du Bail Madagascar)
- CGU section « Service d'arbitrage » à rédiger (limites de responsabilité AryTrano + caractère non-contraignant juridiquement du verdict — c'est une médiation, pas une décision judiciaire)
- Reçus mensuels : usage administratif uniquement, pas une preuve de paiement légale

**Effort estimé** : ~3 semaines (1 sem PDF + état des lieux, 1 sem dispute admin, 1 sem reçus + tests + validation légale template)

**Priorité** : P0 (livrable contre les 15k+8% — sans ça le modèle est vide) · **Statut** : 📋 todo

---

### Paiement infra

#### E-T15 · Intégration GoalPay (PaymentProvider abstraction) — REWRITTEN 2026-05-25 with actual GoalPay API
**En tant qu'**équipe AryTrano
**Je veux** une intégration au provider Mobile Money local (GoalPay) qui peut être swappée si on change d'avis (Voaray, Efaina, Papi, Orange Money direct)
**Afin de** ne pas être verrouillé à un seul provider

> **⚠️ Surface API GoalPay réelle (vérifiée 2026-05-25 sur https://goalpay.pro/docs/api/integrations)** :
> - **UN seul endpoint** : `POST https://api.goalpay.pro/api/payement/service` (initiation)
> - **PAS d'API refund** — process manuel via support GoalPay (`goalpay.mg@gmail.com` / WhatsApp `+261 34 23 041 65`)
> - **PAS d'API lookup/status check** — notre seul signal = le webhook
> - **PAS de sandbox documenté** — tester en prod avec montants minimaux (100 Ar)
> - **Webhook events** : `payment.success` / `payment.failed` / `payment.canceled` / `payment.expired`
> - **Signature webhook** : header `x-gpay-signature`, HMAC-SHA256 du raw body, hex digest
> - **Auth init** : token `TGP_*` dans le BODY (pas un header), JAMAIS exposé côté client
> - **Currency** : `"Ar"` only, montants en Int Ariary (matche memory `project_mga_no_subunit`)
> - **Expiry checkout** : 10 minutes (au-delà → event `payment.expired`)

**Implementation outline (révisée)**
1. Définir `PaymentProvider` interface dans `lib/payments/types.ts` :
   - `initiatePayment(input)` → returns `{ providerTxId (= GoalPay order_reference), checkoutUrl, expiresInMinutes }`
   - `verifyWebhookSignature(rawBody, signatureHeader): boolean` (timing-safe)
   - `parseWebhook(rawBody)` → typed event payload
   - **Pas de** `refund()` ni `lookup()` (non supportés par GoalPay)
2. Implémenter `features/payments/goalpay/` :
   - `client.ts` (fetch wrapper avec timeout 30s, no retry — GoalPay init est idempotent côté merchant via notre `reference`)
   - `signature.ts` (HMAC-SHA256 verify avec `crypto.timingSafeEqual`)
   - `provider.ts` (implements PaymentProvider)
3. Service layer `features/payments/services/` :
   - `initiate-payment.ts` (générique, prend `purpose` + `amountMGA` + métadonnées)
   - `record-webhook-event.ts` (idempotent state machine via UNIQUE `idempotencyKey` ET status guards)
4. Route webhook `/api/webhooks/goalpay/route.ts` :
   - 1) Verify signature (reject 401 si invalid)
   - 2) Parse body via Zod (reject 400 si schema invalid)
   - 3) Look up Payment by `data.reference` (= our `idempotencyKey`)
   - 4) Idempotency : si status déjà CONFIRMED/FAILED/CANCELED/EXPIRED → 200 noop
   - 5) Update Payment.status + audit PaymentEvent row + trigger downstream (E-T26 callback)
   - 6) Return 200 OK rapidement (< 5s) sinon GoalPay retry
5. Model `Payment` (révisé — déjà partiellement en place) :
   - `idempotencyKey` UNIQUE (= notre `reference` envoyé à GoalPay et reçu en retour dans webhook)
   - `providerTxId` (= GoalPay `order_reference`, nullable jusqu'au retour de l'init)
   - `amountMGA Int` ← **fix Decimal→Int** per memory `project_mga_no_subunit`
   - `status` enum (INITIATED, PENDING, CONFIRMED, FAILED, REFUND_PENDING, REFUNDED, EXPIRED, CANCELED)
   - `purpose` enum (PREMIUM_LISTING, FEATURED_PLACEMENT déjà ; ajouter LEASE_SUCCESS_FEE pour E-T26)
   - `completedAt DateTime?` (set au webhook success)
   - `expiresAt DateTime?` (createdAt + 10 min, info pour cron de reconciliation E-T20)
   - `webhookReceivedAt DateTime?` (audit)
6. Rate-limit `initiatePayment` 10/h/userId pour anti-spam
7. Tests :
   - `signature.test.ts` : HMAC valide passe, tampering body → invalid, missing header → invalid
   - `record-webhook-event.test.ts` : premier appel insert audit + update status, 2e appel même reference → noop, status transitions guard
   - `parse-webhook.test.ts` : Zod schema rejette payload malformé
8. Documentation runbook `public/docs/runbook-payments.md` :
   - Que faire si GoalPay down (queuing? circuit breaker?)
   - **Process refund manuel** : contacter GoalPay support + admin update DB status to REFUNDED
   - Comment tester en prod (100 Ar minimum)
   - Escalation contacts

**Files créés**
- `src/lib/payments/types.ts`
- `src/features/payments/goalpay/client.ts`
- `src/features/payments/goalpay/signature.ts`
- `src/features/payments/goalpay/provider.ts`
- `src/features/payments/services/initiate-badge-payment.ts`
- `src/features/payments/services/initiate-boost-payment.ts`
- `src/features/payments/services/initiate-subscription-payment.ts`
- `src/features/payments/services/record-webhook-event.ts`
- `src/features/payments/services/refund-payment.ts`
- `src/features/payments/queries/list-user-payments.ts`
- `src/features/payments/queries/get-payment-by-id.ts`
- `src/features/payments/actions/refund-payment.ts` (admin only)
- `src/features/payments/__tests__/record-webhook-event.test.ts`
- `src/features/payments/__tests__/signature.test.ts`
- `src/app/api/webhooks/goalpay/route.ts`
- `src/app/api/v1/payments/me/route.ts` (list my payments)
- `public/docs/runbook-payments.md`

**Files modifiés**
- `prisma/schema.prisma` : nouveau model `Payment` + enum `PaymentProvider`, `PaymentStatus`, `PaymentEventType`
- `src/lib/env.ts` : `GOALPAY_API_URL`, `GOALPAY_API_KEY`, `GOALPAY_WEBHOOK_SECRET`
- `src/lib/rate-limit/index.ts` : `initiatePayment` (10/h/userId)
- `src/proxy.ts` : CSP `connect-src` étendu pour GoalPay si paiement initie côté client (sinon n/a)

**DB schema**
```prisma
model Payment {
  id            String              @id @default(cuid())
  provider      PaymentProvider
  providerTxId  String              @unique
  amountMGA     Int                 // MGA no subunit, Int
  status        PaymentStatus
  eventType     PaymentEventType
  userId        String
  listingId     String?
  metadata      Json?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  completedAt   DateTime?

  user    User     @relation(fields: [userId], references: [id], onDelete: Restrict)
  listing Listing? @relation(fields: [listingId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt])
  @@index([status, createdAt])  // reconciliation
}

enum PaymentProvider {
  GOALPAY
  // VOARAY, EFAINA, PAPI, ORANGE_MONEY in v2.x
}

enum PaymentStatus {
  INITIATED
  PROCESSING
  SUCCESS
  FAILED
  REFUNDED
  REFUNDING
}

enum PaymentEventType {
  BADGE_VERIFIED
  BOOST
  SUBSCRIPTION
}
```

**API endpoints**
- `POST /api/webhooks/goalpay` — public webhook, signature-protected
- `GET /api/v1/payments/me` — list user's payments (auth)
- `POST /api/v1/admin/payments/:id/refund` — admin only

**i18n keys nouvelles**
- `payments.initiate.title` (« Paiement en cours ») / `.redirect.help` (« Tu vas être redirigé vers GoalPay »)
- `payments.success.title` / `.success.body`
- `payments.failed.title` / `.failed.body` / `.failed.retry`
- `payments.history.title` (« Mon historique de paiements »)
- `payments.refund.requested` / `.refund.completed`

**Dependencies**
- Compte GoalPay business signé + API keys
- Décision : on devient escrow agent (E-T18 lié) ou juste reseller de services à AryTrano (E-T16/17/23) ? Cas 2 plus simple légalement

**Tests**
- `signature.test.ts` : HMAC valide passe · tampering → invalid
- `record-webhook-event.test.ts` : premier appel insert + update status · 2e appel même providerTxId → noop · concurrence 10 appels même tx → 1 seul row final (UNIQUE constraint)
- `refund-payment.test.ts` : admin trigger refund → status REFUNDING → webhook callback → REFUNDED
- E2E sandbox : initiate badge payment → redirect GoalPay sandbox → success callback → vérifier listing.verifiedAt set

**Edge cases**
- Webhook arrive avant que le client revient sur `/payment/success` (race) → handle gracefully, redirect au /dashboard avec toast
- Payment FAILED → afficher raison (carte refusée, balance insuffisante)
- Payment in PROCESSING > 24h → admin alert (cron T-020)
- Currency : tout en MGA Int (per memory) · si GoalPay renvoie un format avec décimales → reject
- Reconciliation : Payment côté DB sans webhook reçu après 1h → cron polling GoalPay API

**A11y**
- Pages payment success/failed/processing avec status announcements
- Loader pendant la redirection
- Bouton « Réessayer » si failed

**Security**
- WEBHOOK_SECRET en env, jamais en logs
- Signature verification AVANT toute logique métier
- Rate-limit aussi sur webhook endpoint (DDoS protection — légitimes < 100/min)
- Audit trail complet : qui a déclenché un refund admin → AuditLog

**Effort estimé** : ~2 semaines

**Priorité** : P0 (v2 trigger) · **Statut** : 📋 todo

---

#### E-T20 · Réconciliation quotidienne GoalPay ↔ DB
**En tant qu'**équipe finance
**Je veux** un job nightly qui vérifie que tous les paiements DB matchent l'état GoalPay (et inversement)
**Afin de** détecter les divergences (transaction côté GoalPay sans Payment row côté DB, ou vice-versa)

**Implementation outline**
1. Cron `cron/reconcile-payments.ts` à 02:00 UTC daily
2. Phase A — sweep stuck transactions : SELECT Payments WHERE status IN (INITIATED, PROCESSING) AND createdAt < now() - 1h → call `provider.lookup(providerTxId)` → update status
3. Phase B — detect orphan webhook transactions : fetch GoalPay API listing all transactions last 48h → SELECT Payment WHERE providerTxId NOT IN (...) → log + Slack alert (rare, indicates webhook missed)
4. Phase C — generate daily report : count transactions par status, montant total success/failed/refunded, anomalies count
5. Send report email à admin@arytrano.mg quotidien avec markdown table
6. Update `lastReconciliationAt` dans une nouvelle table `ReconciliationRun` (ou stocké dans Settings/Config table)
7. Runbook documenté `public/docs/runbook-reconciliation.md` : si une divergence est détectée, étapes pour la résoudre

**Files créés**
- `src/features/payments/services/reconcile-payments.ts`
- `src/features/payments/services/generate-reconciliation-report.ts`
- `src/app/api/cron/reconcile-payments/route.ts` (Bearer-protected)
- `src/lib/email/templates/reconciliation-report-fr.ts` (admin only, MG pas nécessaire)
- `src/features/payments/__tests__/reconcile-payments.test.ts`
- `public/docs/runbook-reconciliation.md`

**Files modifiés**
- `prisma/schema.prisma` : nouveau model `ReconciliationRun` (ranAt, durationMs, divergencesCount, reportJson)
- `vercel.json` : ajouter le cron 02:00 UTC daily
- `src/lib/env.ts` : ajouter `ADMIN_ALERT_EMAIL` si pas déjà

**DB schema**
```prisma
model ReconciliationRun {
  id              String   @id @default(cuid())
  ranAt           DateTime @default(now())
  durationMs      Int
  divergencesCount Int
  reportJson      Json
}
```

**API endpoints**
- `POST /api/cron/reconcile-payments` — Bearer secret

**i18n keys** : aucun (admin email FR-only OK)

**Dependencies**
- E-T15 (GoalPay integration) doit précéder

**Tests**
- `reconcile-payments.test.ts` : seed avec 5 INITIATED stuck + 2 SUCCESS → cron met à jour les statuts via provider.lookup mock · seed avec 1 orphan webhook → alerte loguée
- Integration : run cron manually sur staging avec quelques tx sandbox GoalPay → vérifier que tout est synced

**Edge cases**
- GoalPay API rate-limited pendant le run → backoff retry
- Provider down → log error, retry next day, alerte admin
- Très grand volume (100k tx/jour future) → paginate les fetch GoalPay
- Transaction GoalPay sans userId metadata → log warning, ne pas créer Payment row

**A11y** : N/A

**Performance**
- Cron timeout 5 min (Vercel limit)
- Si > 1000 stuck txs, batcher en chunks de 100

**Effort estimé** : ~3 jours

**Priorité** : P1 · **Statut** : 📋 todo

### Offres payantes propriétaire

#### E-T23 · ~~Badge « Vérifié » payant (10k Ar one-time)~~ — SUPERSEDED
**Statut** : ⚠️ **Superseded par E-T26+E-T27 (2026-05-25)**. Le modèle success-based remplace le badge one-time : le badge « Propriétaire de confiance » est désormais **gratuit + automatique** après 3 baux signés sans litige (cf E-T27). Plus de paiement séparé pour la vérification d'identité (qui reste une étape gratuite côté KYC standard). Conserver ce ticket pour traçabilité historique.

~~**En tant que** propriétaire~~
~~**Je veux** payer 10 000 Ar pour obtenir un badge « Vérifié renforcé » qui boost ma visibilité et signale aux étudiants que j'ai validé une identité étendue~~
~~**Afin de** me démarquer et accélérer mes locations~~

**Implementation outline**
1. Flow utilisateur :
   - Owner sur `/dashboard/listings/<id>/verify` → page d'introduction (qu'est-ce que le badge, prix, ce qu'il faut fournir)
   - Owner clique « Passer la vérif » → upload CIN/passeport (déjà partiel via T-033)
   - Pré-paiement : redirige vers GoalPay (E-T15) avec amount 10000 MGA + eventType=BADGE_VERIFIED + metadata { listingId, userId }
   - Si paiement success → status « En attente validation admin »
   - Admin valide manuellement la pièce d'identité (page `/admin/badge-requests`) → set `Listing.verifiedAt` + `verifiedBy`
   - Email owner « Ton badge est actif » + facture PDF
   - Si admin reject (fake docs) → refund automatique via E-T15 + email explication
2. Prix configurable env var `BADGE_VERIFIED_AMOUNT_MGA = 10000`
3. CGV affichées avant paiement (checkbox required)
4. Facture PDF générée via `puppeteer-core` headless + template HTML → upload Cloudinary → email + dashboard download
5. Badge visible sur PublicListingCard + page détail (déjà T-033 design)
6. Refund admin manuel si litige (E-T15 supporte)
7. Dégel de E-T02 (CIN storage) si pas encore done

**Files créés**
- `src/app/dashboard/listings/[id]/verify/page.tsx`
- `src/app/dashboard/listings/[id]/verify/success/page.tsx`
- `src/app/dashboard/listings/[id]/verify/failed/page.tsx`
- `src/app/admin/badge-requests/page.tsx`
- `src/features/payments/services/initiate-badge-payment.ts` (déjà listé dans E-T15)
- `src/features/listings/services/approve-badge-request.ts`
- `src/features/listings/services/reject-badge-request.ts`
- `src/features/admin/queries/list-badge-requests.ts`
- `src/lib/invoicing/generate-invoice.ts`
- `src/lib/invoicing/templates/invoice-html.ts`
- `src/lib/email/templates/badge-approved-{fr,mg}.ts`
- `src/lib/email/templates/badge-rejected-{fr,mg}.ts`
- `src/features/listings/__tests__/approve-badge-request.test.ts`

**Files modifiés**
- `prisma/schema.prisma` : ajouter `Listing.verificationStatus` enum (NONE, PAID_PENDING, APPROVED, REJECTED, REFUNDED) + `verificationPaymentId String?`
- `src/features/listings/components/PublicListingCard.tsx` : badge « Vérifié » sur card (déjà T-033)
- `src/components/shared/AdminSidebar.tsx` : nouveau lien « Demandes de vérif »
- `src/lib/env.ts` : `BADGE_VERIFIED_AMOUNT_MGA`
- `prisma/schema.prisma` : link Payment.eventType=BADGE_VERIFIED to Listing

**DB schema**
```prisma
// Patch sur Listing :
verificationStatus    VerificationStatus @default(NONE)
verificationPaymentId String?
verifiedAt            DateTime?  // existant T-033
verifiedBy            String?    // existant T-033

enum VerificationStatus {
  NONE
  PAID_PENDING   // paiement OK, attente admin
  APPROVED       // admin validé
  REJECTED       // admin rejeté + refund initié
  REFUNDED       // refund completed
}
```

**API endpoints**
- `POST /api/v1/listings/:id/verify/initiate` — owner triggers payment
- `POST /api/v1/admin/badge-requests/:listingId/approve` — admin only
- `POST /api/v1/admin/badge-requests/:listingId/reject { reason }` — admin only

**i18n keys nouvelles**
- `verify.intro.title` (« Devenir Vérifié ») / `.intro.benefits` / `.intro.price` / `.intro.process`
- `verify.upload.title` / `.upload.help` / `.upload.cta`
- `verify.payment.cta` (« Passer au paiement ») / `.payment.cgv`
- `verify.pending.title` (« En attente de validation ») / `.pending.body`
- `verify.approved.title` / `.approved.body`
- `verify.rejected.title` / `.rejected.refundInfo`
- `admin.badgeRequests.title` / `.table.owner` / `.table.listing` / `.table.docs` / `.table.amount` / `.action.approve` / `.action.reject` / `.reject.reasonPlaceholder`
- `email.badgeApproved.subject` / `.body*`
- `email.badgeRejected.subject` / `.body*`

**Dependencies**
- E-T15 (PaymentProvider) doit précéder
- E-T02 (CIN storage) **frozen** — dégeler avant ce ticket
- T-033 (badge admin marker) — réutiliser

**Tests**
- `approve-badge-request.test.ts` : admin approuve → `verifiedAt` set, email sent · payment status SUCCESS required
- `reject-badge-request.test.ts` : admin rejette → refund déclenché via PaymentProvider · email reason
- E2E sandbox : owner pay GoalPay sandbox → admin approve → vérifie badge visible publique

**Edge cases**
- Owner paie 2x rapidement (double-click) → idempotency via PaymentProvider (transaction unique)
- Listing supprimé entre payment et admin approve → refund + close
- Badge déjà actif → refuser le re-paiement (vérifier état avant initiate)
- Reject avec raison "CIN floue" → refund full, owner peut re-essayer

**A11y**
- Stepper visuel (1. Intro → 2. Upload → 3. Paiement → 4. Attente)
- Upload accessible (input file avec label)
- Confirmation modal Dialog accessible

**Effort estimé** : ~1 semaine (après E-T15 + E-T02 dégelé)

**Priorité** : P0 (v2 trigger, premier revenu) · **Statut** : 📋 todo

---

#### E-T16 · ~~Annonces premium (boost top of list)~~ — SUPERSEDED
**Statut** : ⚠️ **Superseded par E-T26+E-T27 (2026-05-25)**. Le modèle success-based remplace le boost à la carte : le boost de visibilité +30% est désormais **gratuit + automatique** pour les propriétaires titulaires du badge « Propriétaire de confiance » (3 baux ACTIVE sans litige, cf E-T27). Garder cet ancien ticket pour traçabilité — pourra être réactivé en v2.5+ si on identifie un besoin de boost ponctuel additionnel.

~~**En tant que** propriétaire~~
~~**Je veux** payer pour mettre mon annonce en haut des résultats de recherche pendant N jours~~
~~**Afin de** maximiser ma visibilité pendant la haute saison étudiante~~

**Implementation outline**
1. Pricing tiers configurables env :
   - 7 jours = 5 000 Ar
   - 30 jours = 15 000 Ar
   - (futurs : 14 jours pivot, packs combinés)
2. Flow utilisateur :
   - Owner clique « Booster » sur sa card listing → modal avec choix durée + total
   - Redirect GoalPay (E-T15) avec eventType=BOOST + metadata { listingId, durationDays }
   - Webhook success → créer ListingBoost row avec startedAt=now + expiresAt=now+durationDays
   - Badge « Featured » visible publique
3. Query `list-public-listings` ordonne par `(hasActiveBoost DESC, publishedAt DESC)` · joint sur ListingBoost active
4. 1 boost max par listing à la fois — si nouveau pendant qu'un actif :
   - Option A (simple) : refuser, dire « Boost actif jusqu'au X, attends ou contact support »
   - Option B (pro-rata) : refund le restant + appliquer le nouveau · plus complexe v1
   - Décision v2.0 : Option A
5. Cron quotidien `cron/expire-boosts.ts` désactive les boosts expirés
6. Cap : pas plus de 30% des annonces de la ville simultanément boostées (cap configurable) · si cap atteint → queue ou refuser
7. UI dashboard : section « Performance boost » avec stats (vues pendant boost vs avant, ROI calculé)

**Files créés**
- `prisma/migrations/<ts>_add_listing_boost/migration.sql`
- `src/features/payments/services/initiate-boost-payment.ts` (cf E-T15)
- `src/features/listings/services/activate-boost.ts` (called from webhook)
- `src/features/listings/services/expire-boosts.ts` (cron)
- `src/features/listings/queries/list-active-boosts.ts`
- `src/features/listings/queries/check-boost-cap.ts`
- `src/features/listings/actions/initiate-boost.ts`
- `src/features/listings/components/BoostButton.tsx`
- `src/features/listings/components/BoostDialog.tsx`
- `src/features/listings/components/BoostBadge.tsx`
- `src/app/dashboard/listings/[id]/boost/page.tsx`
- `src/app/api/cron/expire-boosts/route.ts`
- `src/lib/email/templates/boost-activated-{fr,mg}.ts`
- `src/lib/email/templates/boost-expired-{fr,mg}.ts`
- `src/features/listings/__tests__/activate-boost.test.ts`

**Files modifiés**
- `prisma/schema.prisma` : nouveau model `ListingBoost`
- `src/features/listings/queries/list-public-listings.ts` : ORDER BY avec hasActiveBoost
- `src/features/listings/components/PublicListingCard.tsx` : badge « Featured »
- `vercel.json` : cron expire-boosts daily
- `src/lib/env.ts` : `BOOST_7D_AMOUNT_MGA`, `BOOST_30D_AMOUNT_MGA`, `BOOST_CAP_PERCENT`

**DB schema**
```prisma
model ListingBoost {
  id          String   @id @default(cuid())
  listingId   String   @unique  // 1 active boost max
  paymentId   String   @unique
  startedAt   DateTime @default(now())
  expiresAt   DateTime
  durationDays Int
  amountMGA   Int

  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  payment Payment @relation(fields: [paymentId], references: [id], onDelete: Restrict)

  @@index([expiresAt])  // cron
}
```

**API endpoints**
- `POST /api/v1/listings/:id/boost/initiate { durationDays }` — owner only
- `POST /api/cron/expire-boosts` — Bearer secret

**i18n keys nouvelles**
- `boost.cta` (« Booster ») / `.dialog.title` / `.dialog.tier.7d` (« 7 jours · 5 000 Ar ») / `.dialog.tier.30d` (« 30 jours · 15 000 Ar ») / `.dialog.cta`
- `boost.active.badge` (« Featured ») / `.active.expires` (« Boost actif jusqu'au {date} ») / `.active.cancel` (en gris, contact support)
- `boost.stats.title` (« Performance du boost ») / `.stats.viewsBefore` / `.stats.viewsDuring` / `.stats.lift`
- `boost.cap.full` (« Trop d'annonces boostées en ce moment, attends quelques jours »)
- `email.boostActivated.*`, `email.boostExpired.*`

**Dependencies**
- E-T15 (PaymentProvider)
- T-046 (stats per listing) pour les stats boost
- E-T07 (multi-ville) pour le cap par ville

**Tests**
- `activate-boost.test.ts` : webhook BOOST success → ListingBoost row créé avec bon expiresAt · double-trigger → rejected (UNIQUE constraint)
- `check-boost-cap.test.ts` : 30% atteint → refuser, sinon OK
- `expire-boosts.test.ts` : cron → désactive les expirés, n'altère pas les actifs
- E2E : boost 7d → vérifie ordre de tri sur /annonces · expire au jour 8 → ordre normal

**Edge cases**
- Listing supprimé entre payment et activate → refund automatique
- Listing status changé (UNAVAILABLE) pendant boost actif → boost continue à exister (mais visibilité 0)
- Multi-tier (achat 7d puis 30d cumulatif) — v2.0 = NO, refuser

**A11y**
- Boost button avec aria-label clair
- Badge « Featured » announcement sr-only sur les cards
- Modal accessible

**Effort estimé** : ~1 semaine

**Priorité** : P1 · **Statut** : 📋 todo

---

#### E-T17 · ~~Subscription propriétaire actif (10k Ar/mois/annonce)~~ — SUPERSEDED
**Statut** : ⚠️ **Superseded par E-T26+E-T27 (2026-05-25)**. Décision après décente terrain : pas d'abonnement récurrent en v2 (friction billing trop élevée pour proprios MG). Le modèle success-based (`15 000 Ar + 8% caution / bail signé`) remplace la subscription. Réactivable en v2.5+ si le success-based révèle un besoin de MRR additionnel (ex: pros volumineux à qui on offrirait un plan « 0% commission + frais fixe »). Garder ce ticket pour traçabilité.

~~**En tant que** propriétaire avec plusieurs annonces actives~~
~~**Je veux** payer un forfait mensuel par annonce pour rester publié~~
~~**Afin de** professionnaliser ma gestion locative~~

**Implementation outline**
1. Pricing : 10 000 Ar/mois/annonce active · prix configurable env
2. Flow utilisateur :
   - Première annonce gratuite 60j (T-049 ready)
   - Si annonce active > 60j : CTA « Active ton abonnement » apparaît
   - Si annonce active > 75j sans subscription : status passe à `UNAVAILABLE` automatique (cron)
   - Upgrade via `/dashboard/billing` : choix annonces à activer + paiement initial
3. Storage carte / payment method : GoalPay supporte-t-il les tokenized payment methods pour auto-renewal ? **À valider** legally + technically · si non, owner doit re-payer manuellement chaque mois (UX dégradée mais legal-safe)
4. Cron mensuel `cron/renew-subscriptions.ts` au début du mois :
   - SELECT Subscriptions WHERE currentPeriodEnd < now()+3d AND status=ACTIVE
   - Pour chaque : trigger payment renewal (auto si token, sinon email avec lien)
   - Si payment success → update currentPeriodEnd = currentPeriodEnd + 30d
   - Si payment fail → status PAST_DUE + email owner (grace 7j)
   - Si grace expirée → status CANCELED + listings → UNAVAILABLE
5. UI `/dashboard/billing` : table subscriptions actives, prochaine échéance, montant, action « Annuler »
6. Grandfather : annonces publiées AVANT le launch v2 = gratuites à vie pour les early adopters (marketing card « Merci d'avoir cru en nous »)
7. Période transition 6 mois : les nouveaux owners ont la 1ère annonce gratuite 60j puis subscription · les anciens restent grandfathered

**Files créés**
- `prisma/migrations/<ts>_add_subscription/migration.sql`
- `src/features/payments/services/initiate-subscription-payment.ts` (cf E-T15)
- `src/features/payments/services/renew-subscriptions.ts` (cron)
- `src/features/payments/services/cancel-subscription.ts`
- `src/features/payments/queries/list-user-subscriptions.ts`
- `src/features/payments/queries/get-active-subscription.ts`
- `src/features/payments/actions/subscribe-listing.ts`
- `src/features/payments/actions/cancel-subscription.ts`
- `src/features/payments/components/SubscriptionsList.tsx`
- `src/features/payments/components/SubscribeButton.tsx`
- `src/app/dashboard/billing/page.tsx`
- `src/app/api/cron/renew-subscriptions/route.ts`
- `src/lib/email/templates/subscription-renewed-{fr,mg}.ts`
- `src/lib/email/templates/subscription-past-due-{fr,mg}.ts`
- `src/lib/email/templates/subscription-canceled-{fr,mg}.ts`

**Files modifiés**
- `prisma/schema.prisma` : nouveau model `Subscription`
- `src/features/listings/services/check-listing-active-status.ts` (nouveau ou existing) : exclure UNAVAILABLE après 75j sans subscription
- `src/components/shared/DashboardSidebar.tsx` : nouveau lien « Facturation »
- `vercel.json` : cron renew-subscriptions monthly
- `src/lib/env.ts` : `SUBSCRIPTION_MONTHLY_AMOUNT_MGA`, `GRACE_PERIOD_DAYS`

**DB schema**
```prisma
model Subscription {
  id                String             @id @default(cuid())
  userId            String
  listingId         String             @unique  // 1 subscription per listing
  status            SubscriptionStatus
  startedAt         DateTime           @default(now())
  currentPeriodEnd  DateTime
  paymentMethodToken String?           // GoalPay token if supported
  amountMGA         Int
  canceledAt        DateTime?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@index([userId, status])
  @@index([currentPeriodEnd, status])  // cron
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  GRANDFATHERED  // legacy free, never billed
}
```

**API endpoints**
- `GET /api/v1/me/subscriptions`
- `POST /api/v1/me/subscriptions { listingId }` → initiate payment
- `POST /api/v1/me/subscriptions/:id/cancel`
- `POST /api/cron/renew-subscriptions` — Bearer secret

**i18n keys nouvelles**
- `subscriptions.cta.subscribe` (« Activer l'abonnement ») / `.cta.renew` / `.cta.cancel`
- `subscriptions.list.title` (« Mes abonnements ») / `.list.empty`
- `subscriptions.status.active` / `.status.pastDue` / `.status.canceled` / `.status.grandfathered`
- `subscriptions.notice.firstFree` (« Cette annonce est gratuite pendant {days} jours ») / `.notice.expiring` (« Renouvellement dans {days} j »)
- `subscriptions.grandfathered.banner` (« Merci d'être early adopter — gratuit à vie »)
- `billing.title` / `.invoices.title` / `.invoice.download`
- `email.subscriptionRenewed.*`, `email.subscriptionPastDue.*`, `email.subscriptionCanceled.*`

**Dependencies**
- E-T15 (PaymentProvider) — required
- T-049 (Listing.expiresAt) — pour la transition « gratuit → subscription »
- Validation légale du tokenized payment method (GoalPay storage)

**Tests**
- `renew-subscriptions.test.ts` : cron renouvelle ACTIVE en PAST_DUE si payment fail · PAST_DUE → CANCELED après grace
- `subscribe-listing.test.ts` : owner subscribe → initiate payment · webhook success → Subscription ACTIVE
- E2E : owner ancien (grandfathered) garde l'accès gratuit · nouveau owner soumis au flow subscription

**Edge cases**
- Tokenized payment échoue (carte expirée) → email + lien manuel renew + grace 7j
- Owner cancel mid-period → reste actif jusqu'à currentPeriodEnd (pas de refund pro-rata v2.0)
- Listing supprimé pendant subscription active → cancel auto + refund partial (à décider)
- Grandfathered owner crée une nouvelle annonce après v2 launch → soumise au billing normal

**Legal/Compliance**
- Storage tokenized payment method en MG : nécessite license PCI-DSS ? À valider
- Recurring billing in MGA : GoalPay support
- Pre-launch comms aux early adopters : email explicatif 30j avant le switch

**Effort estimé** : ~3 semaines (legal + technical + recurring billing edge cases)

**Priorité** : P1 (depends on traction) · **Statut** : 📋 todo

---

#### E-T18 · Caution / paiement premier mois via Mobile Money
**En tant qu'**étudiant qui a trouvé un logement
**Je veux** payer la caution + premier mois via Mobile Money sur AryTrano
**Afin de** sécuriser la transaction sans rencontre physique stressante

**Status** : 🧊 **frozen** — validation légale Madagascar requise (AryTrano devient escrow agent, license financière probable)

**Plan technique (préparé pour dégel)**
- Provider PaymentProvider abstraction (cf E-T15)
- Nouveau model `EscrowDeposit` (studentId, listingId, depositMGA, firstMonthMGA, status enum HELD/RELEASED/REFUNDED/DISPUTED, heldAt, releasedAt?)
- Flow :
  - Étudiant initie paiement vers compte escrow AryTrano (via GoalPay split)
  - Propriétaire et étudiant confirment mutuellement la remise des clés via signature in-app (un boutton chacun, both required)
  - AryTrano libère vers propriétaire moins commission (~3-5% sur l'escrow)
  - Si litige → freeze, intervention admin, refund éventuel
- Commission étudiant 0% (promesse honnêteté maintenue)
- Commission propriétaire ~3-5% sur le montant total · sur les loyers Fianar typiques (200k Ar) = 6k-10k Ar par transaction
- Refund flow : dispute resolution doc + mediation interne

**Pré-requis légaux à clarifier avant dégel**
1. License d'agrément financier MG : nécessaire pour acter comme escrow ?
2. Compte bancaire MG dédié escrow (séparé du compte opérationnel)
3. Conformité KYC/AML pour les volumes attendus
4. Assurance responsabilité civile professionnelle
5. CGU spécifiques au flux de paiement + dispute resolution

**Effort estimé** : ~6 semaines (legal + technical + dispute resolution flow + mediation training)

**Priorité** : P2 (high upside but high regulatory risk) · **Statut** : 🧊 frozen (validation légale Madagascar requise — équipe juridique à briefer)

### Analytics / Business intelligence

#### E-T19 · Tableau de bord revenus admin
**En tant qu'**équipe AryTrano
**Je veux** voir nos revenus en temps réel (MRR, ARR, conversion subscription, churn, LTV)
**Afin de** piloter le business

**Implementation outline**
1. Route `/admin/revenue` gated par rôle ADMIN (futur sous-rôle FINANCE pour scoping accès)
2. KPI widgets en haut :
   - **MRR actuel** = SUM(Subscription.amountMGA) WHERE status=ACTIVE
   - **MRR M-1** + delta % vs M-1
   - **ARR** = MRR × 12
   - **Nouveaux subscribers ce mois** (Subscription.startedAt this month)
   - **Churn rate** = canceledThisMonth / (activeStartOfMonth)
   - **LTV moyen** = ARPU × 1/churnRate (approximation)
   - **ARPU** = MRR / activeSubscribers
3. Chart sparkline MRR sur 12 mois (SVG inline)
4. Breakdown par offering (BADGE_VERIFIED / BOOST / SUBSCRIPTION) : table avec count + total MGA
5. Top 10 customers par revenu lifetime (groupBy Payment.userId)
6. Export CSV mensuel pour comptable : Payment rows du mois + status + métadonnées owner
7. Alerte Slack si MRR chute > 10% mois sur mois (cron à fin de mois)
8. Privacy : pas d'email/nom dans la vue par défaut, juste userId mask → reveal via clic (cf T-043 pattern, log AuditLog)

**Files créés**
- `src/features/admin-revenue/queries/get-mrr.ts`
- `src/features/admin-revenue/queries/get-mrr-history.ts` (12 derniers mois)
- `src/features/admin-revenue/queries/get-churn-rate.ts`
- `src/features/admin-revenue/queries/get-arpu-ltv.ts`
- `src/features/admin-revenue/queries/get-revenue-by-offering.ts`
- `src/features/admin-revenue/queries/get-top-customers.ts`
- `src/features/admin-revenue/actions/export-monthly-csv.ts`
- `src/features/admin-revenue/services/check-mrr-alert.ts` (cron)
- `src/features/admin-revenue/components/RevenueKpiCard.tsx`
- `src/features/admin-revenue/components/MrrSparkline.tsx`
- `src/features/admin-revenue/components/RevenueByOfferingTable.tsx`
- `src/features/admin-revenue/components/TopCustomersTable.tsx`
- `src/app/admin/revenue/page.tsx`
- `src/app/api/cron/check-mrr-alert/route.ts`
- `src/features/admin-revenue/__tests__/get-mrr.test.ts`

**Files modifiés**
- `src/components/shared/AdminSidebar.tsx` : ajout « Revenus »
- `vercel.json` : cron mrr-alert
- `prisma/schema.prisma` : éventuel sous-rôle `User.financeAccess Boolean @default(false)` si on veut séparer ADMIN total vs ADMIN sans accès finance

**DB schema** : aucun nouveau model (queries agrégées sur Payment + Subscription existants)

**API endpoints**
- `GET /api/v1/admin/revenue/mrr` (admin only)
- `POST /api/cron/check-mrr-alert` — Bearer secret

**i18n keys** : admin FR-only acceptable
- `admin.revenue.title`
- `admin.revenue.kpi.mrr` / `.kpi.arr` / `.kpi.churn` / `.kpi.ltv` / `.kpi.arpu`
- `admin.revenue.chart.mrrHistory.title`
- `admin.revenue.table.offerings.title` / `.offerings.count` / `.offerings.total`
- `admin.revenue.table.topCustomers.title` / `.export.cta`
- `admin.revenue.alert.mrrDrop.subject` (Slack message template)

**Dependencies**
- E-T15 (Payment model)
- E-T26 (Lease model — pour calcul revenu success-based ; remplace E-T17 deprecated)
- T-022 (Admin) ✅

**Tests**
- `get-mrr.test.ts` : seed avec 10 subscriptions ACTIVE → MRR = sum · ignore CANCELED
- `get-churn-rate.test.ts` : seed avec 5 cancellations sur 100 actifs → churn = 5%
- `get-arpu-ltv.test.ts` : edge case churnRate = 0 → LTV infini, retourner null + label « insufficient data »
- E2E : admin charge `/admin/revenue` → KPI shown, chart visible

**Edge cases**
- Premier mois (pas de history) → afficher « Premier mois, données limitées »
- Churn rate 0 → LTV = ∞ → display « N/A jusqu'à premier churn »
- Grandfathered subs → excluded du MRR (amountMGA = 0)
- MRR alert false-positive : seasonality (étudiants en vacances) → smoothing 3-month rolling

**A11y**
- Charts SVG avec `<title>` + `<desc>` descriptifs
- KPI cards avec heading hierarchy (H2 section → H3 KPI)
- Tables avec `<caption>` + scoped headers
- Couleurs status (vert/rouge) jamais le seul signal — toujours icon ou texte

**Effort estimé** : ~1 semaine

**Priorité** : P1 (post-revenue) · **Statut** : 📋 todo

---

#### E-T24 · Cohort analytics + funnel
**En tant qu'**équipe produit
**Je veux** suivre les cohortes d'utilisateurs (étudiants + proprios) sur leur cycle de vie (signup → first contact → first review)
**Afin de** identifier où on perd les gens et où optimiser

**Implementation outline**
1. Pas de provider externe (Mixpanel/Amplitude coûte et data leaves MG) — on agrège depuis nos tables existantes (User, ContactEvent, Listing, Review)
2. Vues SQL matérialisées :
   - `cohort_signup_week` : (cohort_week, role, locale, count_signed_up)
   - `cohort_signup_to_first_activity_week` : (cohort_week, role, week_offset, count_active)
   - `funnel_owner` : (signup → first listing draft → first listing published → first contact received → first review received)
   - `funnel_student` : (signup → first listing viewed → first favorite → first contact → first review submitted)
3. Refresh matérialisées daily via cron `cron/refresh-analytics-views.ts`
4. Dashboard admin avec :
   - Cohort retention chart (heatmap : rows = signup week, cols = week 1/2/3/4/...12, cells = % retained)
   - Funnel chart (waterfall : step % conversion)
   - Filtres : par locale / city / rôle / date range
5. Pas de tracking pixel third-party (privacy + zero JS shipped)
6. Privacy : aggregations only, JAMAIS d'identification individuelle dans l'UI · seuils minimum (n ≥ 5) pour éviter de re-identifier sur des petites cohortes
7. Export CSV pour exploration externe

**Files créés**
- `prisma/migrations/<ts>_add_analytics_views/migration.sql` (raw SQL pour les vues matérialisées)
- `src/features/admin-analytics/queries/get-cohort-retention.ts`
- `src/features/admin-analytics/queries/get-funnel-owner.ts`
- `src/features/admin-analytics/queries/get-funnel-student.ts`
- `src/features/admin-analytics/services/refresh-views.ts`
- `src/features/admin-analytics/components/CohortHeatmap.tsx`
- `src/features/admin-analytics/components/FunnelChart.tsx`
- `src/app/admin/analytics/page.tsx`
- `src/app/api/cron/refresh-analytics-views/route.ts`
- `src/features/admin-analytics/__tests__/get-cohort-retention.test.ts`

**Files modifiés**
- `src/components/shared/AdminSidebar.tsx` : « Analytics »
- `vercel.json` : cron refresh daily

**DB schema (raw SQL)**
```sql
CREATE MATERIALIZED VIEW cohort_signup_week AS
SELECT
  date_trunc('week', "createdAt") AS cohort_week,
  "role",
  "locale",
  COUNT(*) AS count_signed_up
FROM "User"
WHERE "status" = 'ACTIVE'
GROUP BY 1, 2, 3;

CREATE INDEX cohort_signup_week_idx ON cohort_signup_week (cohort_week, role);

-- Refresh : REFRESH MATERIALIZED VIEW CONCURRENTLY cohort_signup_week;
```

**API endpoints**
- `GET /api/v1/admin/analytics/cohort?role=&filter=` (admin only)
- `GET /api/v1/admin/analytics/funnel?audience=owner|student`
- `POST /api/cron/refresh-analytics-views` — Bearer secret

**i18n keys** : admin FR-only
- `admin.analytics.title`
- `admin.analytics.cohort.title` (« Rétention par cohorte ») / `.heatmap.legend`
- `admin.analytics.funnel.title` (« Funnel conversion ») / `.funnel.owner` / `.funnel.student`
- `admin.analytics.filter.locale` / `.filter.role` / `.filter.dateRange`

**Dependencies**
- T-019 (ContactEvent) ✅
- T-031, T-050 (Reviews)
- T-008 (Listings) ✅
- Postgres matérialisé views support (standard)

**Tests**
- `get-cohort-retention.test.ts` : seed 100 users sur 12 weeks → retention matrix correcte
- `get-funnel-owner.test.ts` : 50 signups, 30 listings, 10 published, 5 contacts → funnel percents
- Privacy threshold : cohort week avec n=2 → masqué dans le résultat

**Edge cases**
- Premier mois (peu de data) → message « Données insuffisantes pour les cohortes < 4 semaines »
- View refresh fail (lock conflict) → skip + log + retry next day
- Filter combination qui produit n=0 → empty state clair

**A11y**
- Heatmap : table HTML semantic avec aria-label per cell · alternative text representation
- Funnel : list ordonnée des steps avec percentages
- Couleurs jamais seul signal

**Privacy**
- k-anonymity : ne pas montrer une cell de cohort avec < 5 personnes (sinon re-identifiable)
- Pas de hover qui montre les userIds (uniquement aggregations)

**Effort estimé** : ~1 semaine

**Priorité** : P2 · **Statut** : 📋 todo

---

## 🚀 Launch checklist (pre-prod Fianarantsoa)

Objectif : un livre de contrôle exhaustif à dérouler avant d'ouvrir publiquement aux 50 premiers propriétaires + ~200 étudiants beta.

### Tech & infra (code-side)

- [x] **T-055** Backup DB automatique + restauration testée ✅ done 2026-05-22 — scripts `scripts/backup-db.sh` + `restore-db.sh` + `check-backup-freshness.sh` + `/api/health` endpoint + runbook
- [x] **T-056** Monitoring + alerting (Sentry / scrubber PII / error boundaries) ✅ done 2026-05-22 — `instrumentation.ts` + 3 sentry.*.config.ts + scrub-pii.ts + error.tsx + global-error.tsx + runbook
- [x] **AUD-008** Tuiles OSM commerciales (Stadia Maps) ✅ done 2026-05-22 — env `NEXT_PUBLIC_STADIA_API_KEY` + fallback OSM apex dev + CSP étendu + runbook §9
- [x] **CSP + security headers** ✅ déjà en place (`proxy.ts` + `next.config.ts`)
- [x] **Runbook incident response** ✅ done — `public/docs/runbooks/incidents.md`

### Tech & infra (action hors-code, à faire manuellement)

- [ ] **Louer Contabo VPS S** (~€5.89/mo) + suivre `contabo-deployment.md` §1-6
- [ ] **Domain arytrano.mg achat** + DNS A records → IP Contabo
- [ ] **Cert SSL Let's Encrypt auto-renewal** (Caddy le fait auto si DNS pointe vers le VPS)
- [ ] **Créer compte Cloudflare R2** (backup storage) + configurer rclone — voir `contabo-deployment.md` §8
- [ ] **Créer compte Stadia Maps** (200k tiles/mo free) + authorized domains — voir `contabo-deployment.md` §9
- [ ] **Créer projet Sentry** (5k errors/mo free) + DSN + auth token — voir `monitoring.md`
- [ ] **CDN frontal Cloudflare** (free tier proxy devant le VPS — recommandé pour 3G MG)
- [ ] **Cloudinary quota check** (free tier = 25 GB storage, ~50k transformations / mois)
- [ ] **Upstash Redis quota check** (free tier = 10k commands/jour — pour rate limits)
- [ ] **Email Gmail SMTP relay** → migrer vers Postmark / Resend / SES si > 500 emails/jour
- [ ] **UptimeRobot** monitor sur `/api/health` (free tier 50 monitors)
- [ ] **Systemd timers** : backup-db (02:00 UTC), check-backup-freshness (every 6h), prompt-review (09:00 UTC) — configs dans `contabo-deployment.md` §8.4 + §10b
- [ ] **Performance audit Lighthouse mobile** (target LCP < 2.5s on 3G fast)

### Légal & conformité

- [ ] Mentions légales rédigées (`/legal/mentions`) — actuellement placeholder
- [ ] CGU rédigées (`/legal/terms`) — review juriste MG
- [ ] Politique de confidentialité (`/legal/privacy`) — RGPD-like MG
- [ ] Politique cookies (`/legal/cookies`) — actuellement placeholder
- [ ] **E-T02** Validation légale stockage CIN (frozen — dégeler avant de promettre « identité vérifiée »)
- [ ] Politique de modération publiée + escalation contact

### Contenu & seed

- [ ] Recruter 50 premiers propriétaires Fianarantsoa (via partenariat université, groupes WhatsApp étudiants, bouche-à-oreille)
- [ ] Seed manuel des 50 premières annonces avec photos correctes
- [ ] 5-10 vrais testimonials propriétaires (T-035 ready à recevoir)
- [ ] Rédaction admin de 3-5 articles blog (« Comment choisir un logement étudiant à Fianarantsoa », « Quartiers étudiants », etc.) — bloqué par création route `/blog/<slug>` (E-T25 ?)
- [ ] Pages métadonnées OG image custom par section (actuellement fallback unique)

### Comms & launch

- [ ] Page Facebook AryTrano créée + 5 posts pre-launch teaser
- [ ] Compte WhatsApp Business AryTrano (numéro dédié pour support)
- [ ] Groupe WhatsApp pour les early adopters (proprios)
- [ ] Email pre-launch envoyé aux subscribers WhatsApp Alert (T-037) avec « On lance le DD/MM/YYYY »
- [ ] Partenariat avec au moins 1 association étudiante Fianar pour distribuer le lien
- [ ] Press release courte en FR + MG (newspaper local Lalou / Midi / etc.)

### Day-1 ops

- [ ] Runbook incident response (qui est on-call, escalation, channels)
- [ ] Admin support : compte admin + accès Sentry + accès DB read-only ouvert pour 2 personnes
- [ ] Banner « Beta » visible site-wide (footer ou bandeau top) pendant 1-2 mois
- [ ] Form contact public `/contact` fonctionnel (actuellement existe ?)
- [ ] FAQ utilisateurs accessible (déjà sur `/comment-ca-marche` + `/proprietaires`)

---

## 🧰 v0.5+ Tooling & DX (suite des Audit followups)

(Cf section « Audit followups » plus haut. Ne pas dupliquer, juste rappel : les tickets AUD-001 à AUD-010 sont des followups techniques de l'audit pré-merge 2026-05-20. À considérer entre v0.5 et v1.)

---

## 📦 Session 2026-05-26 → 2026-05-27 — recap + suite

**18 commits livrés sur `main`** (de `5a7190c` à `20c3c25`). État `main` = **`20c3c25`**, branch up to date.

### Livré dans cette session

| Catégorie | Commits | Périmètre |
|---|---|---|
| **E-T15 GoalPay infra** | `376742a` | PaymentProvider + webhook HMAC + reconcile cron + audit fixes Wave 1 |
| **Audits Wave 2+3** | `23aa25f` | 22 fixes security/a11y/perf (HIGH+MEDIUM+LOW) |
| **Admin revenue v0.5** | `fa4df61` | `/admin/revenue` + FTS pg_trgm GIN + PWA offline fallback |
| **Saved-search + map** | `ee3306a` | Email fallback (push+email), `/annonces?view=map` toggle |
| **Mobile E-T22 lease** | `5814e15` | Tenant accept/refuse flow (Expo) + shared Zod schemas |
| **E-T07 Batch A+B** | `1052eb3` + `7ff0804` | Multi-ville schema + 29 brouillons éditoriaux + consumers DB-first |
| **E-T07 Batch C** | `1590fe9` + `5c5adba` + `75b0934` | Admin /admin/geo CRUD éditorial + create city/quartier + lighter layout |
| **E-T07 Batch C2** | `9118d8a` + `98429b1` | quizProfile admin form + shadcn Select |
| **Polish UI** | `c6b08bc` + `2460d4a` | Select item highlight + cursor-pointer |
| **Confirm destructive** | `bb642f3` | Dialog wrap sur "Effacer" éditorial + profile |
| **Migration check script** | `a3b1e60` | `npm run check:migrations` |
| **GoalPay credentials rename** | `20c3c25` | ACCESS_TOKEN → ACCESS_KEY, BASE_URL → PAYMENT_GOALPAY_URL (full URL) |

**Tests** : 189/189 vert sur tous les commits. Typecheck clean. Turbopack build clean (modulo env vars manquants en build prod — voir Launch checklist).

### GoalPay merchant — credentials reçues le 2026-05-27

L'utilisateur a confirmé l'activation du compte marchand. Variables prod attendues :
- `GOALPAY_ACCESS_KEY=TGP_*`
- `GOALPAY_WEBHOOK_SECRET=SK_*`
- `PAYMENT_GOALPAY_URL=https://api.goalpay.pro/api/payement/service`

Code adapté à ces noms dans `20c3c25`. Reste à : (1) coller les vraies valeurs en `.env`, (2) test e2e avec 100 Ar minimal après deploy prod (cf runbook `public/docs/runbooks/payments-goalpay.md §3`).

---

### 📋 Reste à faire — priorisé pour la session suivante

Convention : chaque ticket utilise le numéro suivant disponible. **Statut bloqueur explicité** quand applicable.

#### 🔴 P0 — bloqueurs lancement Fianarantsoa (non-code)

Ces items NE sont PAS du code que je peux écrire. Ils sont sur l'utilisateur ou un prestataire :

##### S2-1 · Provision Contabo VPS S + DNS arytrano.mg + SSL
**Bloqueur** : aucun ; juste à exécuter
**Description** : suivre `public/docs/runbooks/contabo-deployment.md` §1–6. Caddy gère le SSL auto via Let's Encrypt si le DNS pointe d'abord vers l'IP Contabo.
**Sortie attendue** : `https://arytrano.mg` répond 200 avec un certificat valide.
**Effort** : ~2h.

##### S2-2 · Comptes externes (R2, Stadia, Sentry, UptimeRobot)
**Bloqueur** : aucun
**Description** : 4 signups indépendants. Chacun donne des credentials à mettre en `.env` prod :
- Cloudflare R2 (backup storage rclone)
- Stadia Maps (`NEXT_PUBLIC_STADIA_API_KEY`, déjà câblé)
- Sentry (DSN + auth token)
- UptimeRobot (monitor sur `/api/health`)
**Sortie attendue** : 4 sets de credentials collés en `.env` prod + redéployé.
**Effort** : ~1h30 total.

##### S2-3 · GoalPay test e2e en prod avec 100 Ar
**Bloqueur** : S2-1 (besoin de `arytrano.mg/api/webhooks/goalpay` accessible publiquement pour que GoalPay puisse POSTer)
**Description** : suivre `public/docs/runbooks/payments-goalpay.md §3`. Owner test → wizard lease → paie 100 Ar via le checkout GoalPay → webhook arrive → lease passe DRAFT → PENDING_TENANT → tenant signe → ACTIVE.
**Sortie attendue** : 1 Lease ACTIVE + 1 Payment CONFIRMED + 1 PaymentEvent audit row.
**Effort** : ~30min après que l'infra soit up.

##### S2-4 · CGU + politique de confidentialité + mentions légales (juriste MG)
**Bloqueur** : juriste
**Description** : `/legal/terms`, `/legal/privacy`, `/legal/mentions`, `/legal/cookies` sont actuellement des placeholders. Faire rédiger par un juriste Madagascar (Code du Bail + RGPD-like local). Une fois reçus, copier-coller dans `messages/fr-MG.ts` + `mg.ts` ; les routes existent déjà.
**Effort code** : ~1h après livraison juriste (juste copy-paste). Effort juriste : indéterminé.

##### S2-5 · Recrutement 50 premiers proprios Fianarantsoa + 5–10 testimonials
**Bloqueur** : terrain
**Description** : c'est l'effort marketing principal. Le ticket `T-035` (testimonials DB-driven) attend déjà du contenu — admin peut le saisir via `/admin/testimonials` (existant).

---

#### 🟠 P1 — Code post-launch, dès qu'on a du trafic

##### S2-6 · Vérification audits 2026-05-27 (security + architecture)
**Bloqueur** : aucun
**Description** : les agents `security-reviewer` + `general-purpose` ont audité les 14 commits depuis `23aa25f`. **Findings à reporter ici une fois les agents revenus**. Triager HIGH → bloquant launch, MEDIUM → post-launch, LOW → v0.5+.
**Référence** : section "Findings audits 2026-05-27" ci-dessous.

##### S2-7 · Garde l'éditorial admin contre re-seed écrasement
**Bloqueur** : aucun
**Description** : actuellement `seed.ts` UPDATE `editorial` + `quizProfile` à chaque `db seed`. Si un admin raffine via `/admin/geo` puis quelqu'un re-seed (par exemple après un `db:reset`), le contenu raffiné est perdu. Le commentaire dans `editorial-drafts.ts` documente le risque.
**Fix proposé** : dans `seed.ts`, lire le row existant avant l'upsert. Si `editorial !== null` ET `editorial.fr.tagline !== draftPayload.fr.tagline`, **skip** l'écriture (le row a été édité, ne pas écraser). Idem pour `quizProfile`.
**Effort** : ~1h.

##### S2-8 · Backfill loginEvent device pour les sessions OAuth anciennes
**Bloqueur** : décision UX
**Description** : ~4 rows `LoginEvent` Google OAuth s'affichent "Appareil inconnu" dans `/dashboard/settings#login-events` parce qu'ils datent d'avant le fix `events.signIn` (commit `376742a`). Décider : (a) laisser flagger comme "pré-fix, device non enregistré", (b) backfill avec un placeholder « Connexion ancienne », (c) supprimer ces rows.
**Effort** : 30min selon option.

##### S2-9 · Wave 2 a11y MEDIUMs restants (M2 refuse-reason validation)
**Bloqueur** : aucun
**Description** : audit a11y avait identifié `LeaseTenantActions.tsx` refuse-reason `<Input>` sans `required`/`minLength` + sans `aria-invalid`. Form submit même avec raison vide. Memo : reason est explicitement optionnel côté business (le commentaire dans schema dit "optionnel"), mais l'a11y veut au moins le `aria-required="false"` pour clarifier. Très mineur.
**Effort** : 15min.

##### S2-10 · Mobile lease initiate flow (owner-side)
**Bloqueur** : aucun
**Description** : actuellement seul le tenant peut interagir avec un lease depuis l'app mobile (accept/refuse). L'initiate-lease wizard reste web-only — un owner doit ouvrir le site pour créer un bail. Ajouter le flow mobile :
- Screen `/app/leases/new/[listingId].tsx` (form simplifiée : tenantEmail + startDate + durationMonths ; rent + cautionMonths viennent du listing)
- Réutiliser `initiateLease` API endpoint
- Push vers checkout WebView GoalPay
**Effort** : ~1 jour. **Justifié seulement si les premiers proprios confirment qu'ils veulent ça mobile-first.**

##### S2-11 · Email backfill option dans admin/quiz-analytics
**Bloqueur** : aucun
**Description** : `/admin/quiz-analytics` montre le taux email opt-in mais pas la liste des emails. Si on veut envoyer un email blast aux étudiants qui ont fait le quiz, on doit aller dans DB. Ajouter un export CSV des emails consentants (avec marquage RGPD).
**Effort** : ~3h.

---

#### 🟡 P2 — v1 et au-delà, non-bloquants

##### S2-12 · E-T24 cohort analytics squelette
**Description** : queries de funnel (signup → publish OR contact → review) prêtes à dégrainer. Pas d'UI lourde tant qu'on n'a pas de trafic. Référence : section `E-T24` ligne ~3416 ci-dessus.
**Effort** : ~2 jours pour le squelette, + 1 jour pour l'UI quand on a des cohortes.

##### S2-13 · E-T13 PWA "last-viewed listings" via IndexedDB
**Description** : actuellement le SW a un fallback `/offline` mais ne stocke pas les dernières annonces vues. Pour Madagascar 3G instable, c'est un vrai plus. **Attention** : conflit avec la règle "listing-detail jamais runtime-cached" pour éviter de servir une annonce modérée hors-ligne — il faudrait un mécanisme TTL court + vérification moderation status au reconnect.
**Effort** : ~2 jours avec les guards.

##### S2-14 · E-T21 OpenAPI 3.1 spec finalisée + Postman collection
**Description** : `/api/v1/openapi.json` existe mais peut être incomplet. Vérifier que les 39 endpoints sont tous documentés via `zod-to-openapi`. Générer aussi la Postman collection (`public/docs/postman-collection.json`).
**Effort** : ~1 jour de validation + génération.

##### S2-15 · Reflow `/dashboard/leases` au-delà de 50 leases
**Description** : `listUserLeases` retourne max 50 sans pagination. Owner avec 60+ leases ne voit pas les plus anciens. Ajouter cursor pagination (cf PERF-M4 audit).
**Effort** : ~2h.

##### S2-16 · Centraliser la voix éditoriale → guide style pour /admin/geo
**Description** : les 29 brouillons éditoriaux dans `editorial-drafts.ts` ne suivent pas exactement la même voix que les 8 Fianar (lesquels viennent d'interviews terrain). Quand on raffine via `/admin/geo`, on doit avoir un mini-guide. Créer `public/docs/runbooks/editorial-style-guide.md` (1 page) qui rappelle :
- Ton : direct, opinionné, comme un grand frère qui connaît le quartier
- Anti-pattern : marketing creux, "magnifique quartier convivial pour tous"
- Tagline : ≤ 12 mots, doit donner envie de cliquer
- Ambiance : 2–3 phrases, contraste semaine/weekend si pertinent
- Walk : noms d'établissements précis (lycée X, marché Y, pas "écoles")
- Transport : lignes taxi-be spécifiques quand possible
- Distance : "X min Z" pas "près de", "à proximité"
**Effort** : ~1h pour le doc.

##### S2-17 · Mobile app — store listing + screenshots
**Description** : E-T22 mobile fonctionne mais n'est pas dans les stores. Préparer :
- 4–6 screenshots iPhone 15 / Pixel 8 (landing → listing detail → favoris → lease detail)
- Description FR + MG store
- Icon 1024×1024 (déjà placeholder dans `apps/mobile/assets/`)
- Privacy nutrition labels Apple + data safety Google
**Bloqueur** : compte Apple Developer (99 USD/an) + Google Play (25 USD once)
**Effort** : ~1 jour de préparation + délais review stores (3–7j Apple, 1j Google).

---

### 🔬 Findings audits 2026-05-27

**Méta** : scope = 14 commits entre `23aa25f` et `bb642f3`. Skip de doublons avec audits passés (Wave 1+2+3 déjà clean).

#### Security agent — 0 Critical, 0 High, 5 Medium, 5 Low

| Sev | Code | Fichier | Résumé | Statut |
|---|---|---|---|---|
| M1 | seed-clobber | `prisma/seed.ts:73-79` | re-seed efface silencieusement les édits admin via `/admin/geo` | ✅ **fixé** dans le commit suivant (guard `findUnique` → skip si non-null) |
| M2 | slug-immutability | `services/create-{city,neighborhood}.ts` | promesse seulement dans le doc, pas au niveau DB | ⏳ documenté ; faire si un update-city ship un jour |
| M3 | intent-fallthrough | `actions/update-{editorial,quiz-profile}.ts` | `intent` accepte strings arbitraires, fallback silencieux sur `save` | ✅ **fixé** (validation stricte `save \| clear`) |
| M4 | revalidatePath-unsafe | `actions/update-editorial.ts`, `update-quiz-profile.ts` | `revalidatePath` consume slugs raw FormData sans regex re-check | ⏳ admin-only, low impact ; à faire en next session |
| M5 | apostrophes-mixed | `seed-helpers/editorial-drafts.ts` | ASCII `\'` vs typographic `'` — fragilité encodage | ⏳ S2-cosmetic, post-launch |
| L1 | dispute-snapshot | `admin-revenue/get-revenue-stats.ts:122-128` | 9 queries en `Promise.all`, denom dispute peut osciller ±1 row | ⏳ wrap dans single groupBy |
| L2 | signedThisMonth | `admin-revenue/get-revenue-stats.ts:106-111` | leases sign-then-dispute disparaissent du KPI | ⏳ revisit quand DISPUTED devient courant |
| L3 | jwt-role-UI-only | `mobile/lib/auth/use-auth.ts` | role exposé sans signature verify — UI-only, attaquant = device owner | ⏳ rename `localRoleHint` pour clarifier |
| L4 | cuid-leak | `admin-geo/queries/get-neighborhood-admin.ts:54-63` | renvoie `id` cuid dans output admin (déjà gated par layout) | ⏳ documenter `AdminOnly` |
| L5 | redirect-throw-pattern | `actions/create-{city,neighborhood}.ts` | switch repose sur `redirect()` qui throw — pas de `return` explicite | ⏳ ajouter `return` defensif |

**Notes positives confirmées** :
- `requireAdmin()` partout sur les 4 admin-geo actions
- Zod-at-the-boundary sur les 4 services
- Pas de poisoning bundle client via `features/geo/index.ts` (HIGH fix — voir ci-dessous)
- Mobile lease : server toujours autoritaire, UI gate cosmétique
- Saved-search email : sanitize headers + escapeHtml + searchName jamais leaké

#### Architecture agent — 3 High, 6 Medium, 5 Low, 2 Nit

| Sev | Code | Fichier | Résumé | Statut |
|---|---|---|---|---|
| **H1** | geo-barrel-server-only | `features/geo/index.ts:3` | re-exporte `listCitiesWithNeighborhoods` qui a `'server-only'` — viole memory rule | ✅ **fixé** — split en `features/geo/server.ts` |
| **H2** | prisma-in-route | `app/admin/geo/cities/[citySlug]/neighborhoods/new/page.tsx:22` | `prisma.city.findUnique` direct dans le route file — viole arch rule #2 | ✅ **fixé** — `getCityForAdmin()` extrait dans `queries/` |
| **H3** | raw-textarea | `EditorialForm.tsx:208-217` | `<textarea>` hand-rolled au lieu du shadcn `<Textarea>` | ✅ **fixé** |
| M1 | deep-import-requireAdmin | `admin-geo/actions/*.ts:4-5` (×4) | import via `services/require-admin` au lieu de `@/features/admin/server` barrel | ✅ **fixé** sur les 4 fichiers |
| M2 | label-not-associated | `QuizProfileForm.tsx:311-332` `SubSelect` | `<label>` micro-label sans `htmlFor` matching le SelectTrigger | ⏳ S2-cosmetic — wire htmlFor + id |
| M3 | raw-checkbox | `QuizProfileForm.tsx:347-357` `CheckboxGroup` | `<input type="checkbox">` au lieu du shadcn `<Checkbox>` | ⏳ extract `<ChipCheckbox>` component ou compose avec shadcn |
| M4 | jwt-exp-not-checked | `mobile/lib/auth/use-auth.ts:35-39` | expired token reporte `signedIn:true` jusqu'au prochain 401 | ✅ **fixé** — check `payload.exp * 1000 < Date.now()` |
| M5 | no-unit-tests | `admin-geo/services/*.ts`, `admin-revenue/queries/get-revenue-stats.ts` | services neufs sans tests Vitest | ⏳ S2-9 dédié — au moins Zod paths + slug collision + dispute denom-zero |
| M6 | seed-clobber | (= sec M1) | duplicate de sec M1 | ✅ **fixé** |
| L1 | neighborhood-bare-slug | `LandingNeighborhoods.tsx:80` | `?neighborhood=` sans `?city=` → collisions cross-city | ✅ **fixé** — scoped avec `?city=${citySlug}&neighborhood=${slug}` |
| L2 | dead-orThrow | `admin-geo/services/update-*-OrThrow` | helpers déclarés mais jamais consommés (pas de REST endpoint) | ✅ **fixé** — supprimés |
| L3 | dead-ternary | `admin/revenue/page.tsx:23-26` | `locale === 'mg' ? 'fr-FR' : 'fr-FR'` — branches identiques | ✅ **fixé** — collapse |
| L4 | hook-duplication | `EditorialForm` + `QuizProfileForm` share formRef+intent pattern | ~30 lignes dupliquées | ⏳ extract `useIntentSubmit` SI un 3e form ship |
| L5 | i18n-inconsistent-admin | admin-geo strings hardcoded FR, admin-revenue via `t()` | inconsistance pattern | ⏳ S2 décision : tout admin = FR hardcoded OU tout via `t()` |
| Nit | formatAriary-dup | web `lib/format/currency.ts` + mobile inline (×2) | duplication pure fn | ⏳ move to `packages/shared/src/format/currency.ts` |
| Nit | expo-as-never | `mobile/app/leases.tsx:141` | `router.push as never` workaround | ⏳ Expo SDK 54 a une meilleure pattern |

**Score** : 8 findings fixés en live dans cette session (3 HIGH + 5 MEDIUM/LOW directs). 9 restants documentés pour next session avec priorité claire.

---

### 📦 Session 2026-05-27 (cont.) — 4 lots cleanup post-audit GoalPay

**4 commits livrés** sur `main` (de `2e7c6de` à `7aa5aed`). État `main` = **`7aa5aed`**.

| Lot | Commit | Périmètre | Findings résolus |
|---|---|---|---|
| **1 — Refacto archi** | `2e7c6de` | Split `features/payments/{index,server}.ts` + extract `resolveLeaseHrefForReturn` query (auth+lookup en parallèle) → 6 pages transaction/test passent de ~50 à ~10 lignes | Archi C1, H1, H2 · Perf M1, M2 |
| **2 — Correctness paiement** | `604c767` | Status filter dans reconcile updateMany · secret < 16 chars rejeté · TOCTOU via conditional updateMany dans tx · currency `Ar\|MGA` tolérance | Paiement C1, C2, H2, H3 |
| **3 — Défense en profondeur** | `981d4d6` | Rate-limit webhook 100/min/IP fail-CLOSED · sanitize `description` dans Sentry logs · alert Sentry sur 401 signature | Sécu H1, M2 + monitoring 401 |
| **4 — SEO + A11y** | `7aa5aed` | `robots.ts` disallows `/transaction/`, `/test/`, `/webhook-gpay` · `role=alert\|status` + `aria-live` sur TransactionResult · `aria-describedby` garde help+error · sr-only live region pour pending wizard · clé i18n `lease.cta.loading` (fr+mg) | SEO C1, A11y C1, H1, H3 |

**Tests** : 192/192 vert (3 nouveaux — empty/short secret, race-lost TOCTOU). Typecheck clean.

---

### 🔬 Findings audits 2026-05-27 (round 2) — 6 agents post-GoalPay-wiring

**Méta** : audits déclenchés après le wiring test mode. 6 angles parallèles (sécu, SEO, paiement, archi, a11y, perf). Scope = commits depuis `20c3c25`.

**Résolus en live (16/45)** : 5 CRITIQUE + 8 HAUTE + 3 MOYENNE. Détails dans le tableau ci-dessus par lot.

**Reportés (29/45)** — nouveaux tickets S2-18 → S2-22 ci-dessous.

#### 🟠 HAUTE reportées (4 — tickets S2-18 à S2-21)

##### S2-18 · Side-effect lease hors transaction webhook (Paiement H1)
**Bloqueur** : décision conception (atomicité vs rollback email)
**Description** : `applyLeasePaymentSideEffect` s'exécute APRÈS commit du Payment dans le webhook handler. Si le process crash entre les deux → Payment `CONFIRMED` + Lease `DRAFT` (état incohérent, GoalPay ne retentera pas car notre 200 a été envoyé). Options : (a) déplacer la side-effect DANS la transaction Prisma (risque rollback si email throw, à arbitrer), (b) ajouter un job de réconciliation `leases` qui rejoue les side-effects pour `Payment.CONFIRMED + Lease.DRAFT`. Option **(b)** est plus défensive.
**Fichier** : `src/app/api/webhooks/goalpay/route.ts:100-102` + `src/features/leases/services/apply-lease-payment-side-effect.ts`
**Effort** : ~3h (option b + test). **Justifié seulement après que le flow GoalPay prod soit testé end-to-end et qu'on observe un cas de DB/email failure.**

##### S2-19 · Migrer `/webhook-gpay` et `/api/goalpay/webhook/test` sous convention (Archi H3)
**Bloqueur** : coordination GoalPay support (changer URL dans leur dashboard)
**Description** : ces 2 aliases violent la convention `/api/webhooks/<provider>/` (Rule 8). Plan : (1) email GoalPay support pour mettre à jour le webhook URL prod vers `https://arytrano.com/api/webhooks/goalpay`, (2) bouger localement `/api/goalpay/webhook/test` → `/api/webhooks/goalpay/test`, (3) garder l'alias `/webhook-gpay` 6 mois pour compat + retirer.
**Effort** : ~30min code + email à GoalPay.

##### S2-20 · Differential HTTP status codes côté webhook (Sécu H2)
**Bloqueur** : aucun
**Description** : 400 (body invalide) / 401 (sig invalide) / 413 (too large) / 422 (mismatch) leak des info de stack. Un attaquant peut distinguer "endpoint live" de "endpoint dégradé" par fingerprinting. Mitigation : collapse tous les rejects publics sur **401 `{ error: "rejected" }`**, garder les statuts riches uniquement dans Sentry tags. À arbitrer avec la spec GoalPay retry policy avant de toucher (s'ils ont besoin de différencier pour décider de retry).
**Fichier** : `src/app/api/webhooks/goalpay/route.ts:56-58, 78-92, 88-91`
**Effort** : ~1h + test.

##### S2-21 · `description` + `og:*` sur pages transaction (SEO H)
**Bloqueur** : aucun
**Description** : les 6 pages `/transaction/*` et `/test/*` n'ont pas de `description` ni `openGraph` dans leurs `Metadata`. Impact SEO faible (noindex appliqué + maintenant disallow dans robots.ts), MAIS un user qui partage l'URL sur WhatsApp/Telegram (usages courants à Madagascar) verra un preview vide. Ajouter une description neutre + OG image par défaut depuis le layout.
**Fichiers** : 6 pages transaction/test
**Effort** : ~30min.

#### 🟡 MOYENNE reportées (13 — ticket parapluie S2-22)

##### S2-22 · Misc audit MEDIUMs round 2 (paiement, sécu, a11y, archi)
**Description** : 13 findings de sévérité MOYENNE répartis sur 4 domaines. Liste exhaustive :

**Paiement (4)** :
- **P-M1** : `Sentry.captureMessage('webhook event for unknown reference')` envoie `event.reference` dans Sentry. Identifiant interne pas critique, mais à documenter comme acceptable. Fichier : `record-webhook-event.ts:76-80`.
- **P-M2** : `unknown_reference` retourne 200 → GoalPay arrête de retry. Si webhook arrive avant que `Payment` soit committé (race init / DB lente), on perd l'event. Fix : retourner 503 (transient) si event arrive < 60s après tentative init. Fichier : `route.ts:118-119`.
- **P-M3** : pas de validation `amount === 0` sur `payment.success` (Zod accepte `nonnegative`). Un Payment initié avec `amountMGA=0` (bug en amont) passerait. Fix : reject mismatch. Fichier : `record-webhook-event.ts:87`.
- **P-M4** : `/api/goalpay/webhook/test` exposée en prod aussi. Gate `if (process.env.NODE_ENV === 'production') return 404`. Fichier : alias route.ts.

**Sécurité (1)** :
- **S-M1** : `cryptoRandomCuid` non-crypto-rated nominal (entropie OK à 96 bits). Acceptable, mais documenter explicitement "must be unguessable" dans le commentaire pour qu'un futur dev ne passe pas à un nano-id court. Fichier : `initiate-lease.ts:223-227`.

**A11y (3)** :
- **A-M1** : `<section>` du LeaseWizard sans `aria-labelledby` (3 sections → liste landmarks SR confuse). Fichier : `LeaseWizard.tsx:72, 124, 238`.
- **A-M2** : `startDate` sans `FieldDescription` (pas de hint de format JJ/MM/AAAA). Fichier : `LeaseWizard.tsx:186`.
- **A-M3** : CTAs "Voir le bail" / "Retour à l'accueil" sans `aria-label` contextualisé (listing.title). Nécessite passer `listingTitle` à TransactionResult. Fichier : `TransactionResult.tsx:92-105`.

**Archi (3)** :
- **AR-M1** : documenter `<feature>/server.ts` comme 2e surface publique dans ARCHITECTURE.md (pattern maintenant utilisé sur `geo`, `admin`, `payments`).
- **AR-M2** : `M2 QuizProfileForm` `<label>` micro-label sans `htmlFor` matching SelectTrigger (déjà reporté en round 1, encore pending).
- **AR-M3** : `M3 QuizProfileForm` `<input type="checkbox">` au lieu de shadcn `<Checkbox>` (round 1).

**Perf (1)** :
- **PF-M1** : `todayIso()` recalculée à chaque rendu LeaseWizard. Impact négligeable. Mémoïser ou déplacer hors composant. Fichier : `LeaseWizard.tsx:330`.

**Sécurité M2 doc** (mentioned in round 1 et non couvert par lot 3) :
- **S-M2** : sanitize `listing.title` user-input à la création/édition listing (au-delà du log) pour réduire la surface d'injection PII dans tous les contextes downstream (emails, push, push, payment description).

**Effort total** : ~4h cumulés. Aucun n'est bloqueur lancement Fianarantsoa.

---

### 📊 État global findings (cumulatif depuis 2026-05-20)

- **Round 1 (commit `23aa25f`)** : Wave 1+2+3 — 22 fixes appliqués
- **Round 1bis (mid-session 2026-05-27)** : 8 findings sur 17 (admin-geo + mobile audit) — 3 HIGH + 5 MEDIUM/LOW
- **Round 2 (post-GoalPay wiring)** : 16 findings sur 45 résolus en live — 5 CRITIQUE + 8 HAUTE + 3 MEDIUM. **29 reportés** sur tickets S2-18 → S2-22.

**Statut global avant launch Fianarantsoa** : aucun CRITIQUE en suspens, 4 HAUTE acceptables avec mitigations documentées (S2-18 défensif post-launch, S2-19 coordination provider, S2-20 cosmétique sécu, S2-21 cosmétique SEO).

---

## 🔁 Audit followups (post 2026-05-20 batch)

- **AUD-001** — Migrer `QuizSubmission.locale` + `WhatsAppAlert.locale` de `String` à enum `Locale` (FR_MG / MG). À faire **avant que les tables aient du volume**. Voir `TODO(audit P2)` dans `prisma/schema.prisma`. Nécessite : (1) migration SQL qui ALTER COLUMN avec USING-cast, (2) MAJ des 2 actions pour écrire `'FR_MG'` / `'MG'` au lieu de `'fr-MG'` / `'mg'`.
- **AUD-002** — Retirer `QuizSubmission @@index([email])` jamais utilisé par le code actuel. Le ré-ajouter quand "retrieve my submissions by email" sera implémenté.
- **AUD-003** — Réorganiser `Testimonial @@index([audience, publishedAt, sortOrder])` → `@@index([audience, sortOrder, publishedAt(sort: Desc)])` pour matcher la query `ORDER BY sortOrder ASC, publishedAt DESC`.
- ✅ **AUD-004** — ~~Dédupliquer FAQ `/proprietaires`~~ — **Done 2026-05-22** : `features/static-pages/proprietaires/faq-items.ts` exporte `PROPRIETAIRES_FAQ_ITEMS`, consommé par la route (JSON-LD) ET le composant (UI).
- ✅ **AUD-005** — ~~QuizWizard progress bar ARIA~~ — **Done 2026-05-22** : `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` + `aria-valuetext` + `aria-labelledby` pointant vers le label visuel.
- ✅ **AUD-006** — ~~`useReducedMotion` dans les composants Motion~~ — **Done 2026-05-22** : `<MotionConfig reducedMotion="user">` wrapping QuizWizard + QuizResults + ProprietairesFaqAccordion. Motion strip translate/scale/rotate quand l'utilisateur a prefers-reduced-motion=reduce; opacity conservée (non vestibular).
- ✅ **AUD-007** — ~~`aria-live` sur state changes~~ — **Done 2026-05-22** : `role="status"` + `aria-live="polite"` sur le success card de `WhatsAppAlertForm`. Le FAQ accordion garde son pattern WAI-ARIA Disclosure (`aria-expanded` + `aria-controls`) — ajouter aria-live dessus aurait été du double-talk avec ce qu'annonce déjà aria-expanded.
- ✅ **AUD-008** — ~~Pré-launch : remplacer le provider de tuiles OSM public (`tile.openstreetmap.org`) par Maptiler / Stadia / self-hosted~~ — **Done 2026-05-22** : Stadia Maps wired in `QuartiersMapClient.tsx` (env `NEXT_PUBLIC_STADIA_API_KEY` + `STADIA_STYLE`), fallback OSM apex en dev, CSP étendu, attribution Stadia + OpenMapTiles + OSM, doc dans `runbooks/contabo-deployment.md §9`.
- **AUD-009** — Anticiper `WhatsAppAlert.confirmedAt` + `unsubscribedAt` avant de wirer le broadcast WhatsApp Business API.
- **AUD-010** — Architecture : `QuartierRow` type est consommé par `features/quiz/components/*` (Client Components) via `import type` depuis `@/features/landing/server` (server-only barrel). Extraire le type dans `features/landing/types.ts` (client-safe) pour décourager un futur retrait du `type` keyword.

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

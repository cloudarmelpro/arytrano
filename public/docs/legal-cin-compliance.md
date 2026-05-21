# Conformité légale — Vérification CIN propriétaire (E-T02)

> **Statut** : à valider AVANT mise en production publique.
> **Référence légale principale** : Loi n° 2014-038 sur la protection
> des données à caractère personnel (Madagascar) — CMIL = Commission
> Malagasy de l'Informatique et des Libertés.
>
> L'implémentation technique (schéma + chiffrement AES-GCM + workflow
> admin) peut tourner en dev / staging sans bloquer, MAIS les actions
> ci-dessous doivent être faites avant d'activer le flux pour les
> vrais utilisateurs en production.

---

## 1. Déclaration préalable CMIL

- [ ] Déposer un dossier de **déclaration préalable** auprès de la CMIL
      (Antananarivo) avant tout traitement de données d'identité.
- [ ] Documenter dans la déclaration :
  - **Responsable du traitement** : AryTrano SARL (à constituer si pas
        encore fait)
  - **Finalité** : vérification de l'identité des propriétaires bailleurs
        publiant des annonces, pour lutter contre les arnaques.
  - **Catégories de données** : numéro CIN, photo recto CIN (chiffrée
        au repos), nom complet, date de naissance si visible.
  - **Durée de conservation** : voir §3.
  - **Destinataires** : équipe modération AryTrano uniquement.
  - **Transferts hors MG** : aucun (DB hébergée à confirmer — si Vercel/
        Postgres hébergé hors MG, déclaration de transfert international).

## 2. Base légale + consentement

- [ ] Ajouter une **case à cocher de consentement explicite** sur la page
      d'upload de CIN, avec un texte type :
  > "J'accepte que AryTrano collecte une copie de ma CIN dans le but
  > unique de vérifier mon identité en tant que propriétaire bailleur,
  > pour une durée maximale de [N] mois. Je peux demander la
  > suppression à tout moment via [adresse contact]."
- [ ] **Journaliser** la date + l'IP du consentement (table dédiée
      `ConsentEvent` à créer en même temps que le déploiement prod).
- [ ] Lien vers une **Politique de confidentialité publique** (page
      `/legal/privacy`) qui détaille les §1-7.

## 3. Politique de conservation

- [ ] Définir une **durée max** de conservation après vérification.
      Recommandation : **6 mois** post-vérification (assez pour répondre
      à un signalement / dispute), puis **purge automatique** du
      ciphertext (laisser uniquement `cinVerifiedAt` + `cinVerifiedBy`
      comme audit trail, **sans la copie**).
- [ ] Implémenter une tâche cron (Vercel Cron, n8n, ou job DB)
      `purge-old-cins` exécutée nightly qui :
  1. Sélectionne les `OwnerProfile` où `cinVerifiedAt < now() - 6 mois`
     ET `cinCiphertext IS NOT NULL`.
  2. Vide les colonnes `cinCiphertext / cinIvHex / cinAuthTagHex`.
  3. Log dans une table d'audit `CinPurgeEvent (ownerId, purgedAt)`.
- [ ] Pour les CIN **rejetées** : conserver max **30 jours** post-rejet
      le temps que l'owner puisse refaire, puis purge auto.

## 4. Droit d'accès / rectification / effacement

- [ ] Ajouter dans `/dashboard/profile` un bouton **"Demander la
      suppression de ma CIN"** qui :
  1. Vide les colonnes ciphertext (idem cron) instantanément.
  2. Garde `cinRejectionReason = "user-requested-deletion"` dans
     l'audit.
  3. Réinitialise le statut de vérification → l'owner doit refaire le
     processus s'il veut publier de nouveau (à confirmer : faut-il
     bloquer ses listings actuels ? Décision produit.).
- [ ] Implémenter une route REST `GET /api/v1/users/me/data-export`
      (RGPD-style) qui retourne toutes les données détenues sur le
      user — utile pour l'exercice du droit d'accès.

## 5. Sécurité technique

- [x] Chiffrement **AES-256-GCM** avec clé maître `PII_ENCRYPTION_KEY`
      (32 bytes, base64). Stockée en variable d'environnement, **jamais
      en DB**, **jamais en git**.
- [x] `cinKeyVersion` (default 1) → permettra une rotation de clé sans
      re-chiffrement atomique en bloquant tous les users.
- [ ] **Procédure de rotation de clé** documentée :
  1. Générer `PII_ENCRYPTION_KEY_V2`, déclarer dans env.
  2. Toute nouvelle CIN encryptée avec V2.
  3. Job background re-chiffre progressivement les V1 → V2.
  4. Une fois 0 V1 restants, désactiver V1.
- [ ] **Backup chiffré** de la DB — vérifier que les backups du provider
      (Vercel Postgres, Neon, etc.) sont chiffrés at-rest. Sinon, refus.
- [ ] **Logs** : interdire absolument tout `console.log` du ciphertext
      ou de la clé. Ajout d'une règle ESLint custom si possible.

## 6. Workflow admin — gestion d'accès

- [ ] L'accès à `/admin/owner-verifications` doit être **limité aux
      admins ayant signé un accord de confidentialité**.
- [ ] Logger chaque déchiffrement de CIN dans une table
      `CinAccessEvent (adminId, ownerId, accessedAt, reason)`.
      → traçabilité pour audit CMIL.
- [ ] Pas de téléchargement permanent : le visualiseur admin affiche
      le déchiffrement **en mémoire** uniquement, pas de fichier
      téléchargeable. Marquer l'aperçu avec adminId + date pour
      tracer les fuites éventuelles.
- [ ] Auto-déconnexion admin après 15 min d'inactivité.

## 7. Notification de fuite (breach notification)

- [ ] Procédure documentée en cas de breach :
  1. Détection (monitoring + alertes).
  2. Confinement (rotation clé immédiate, audit logs).
  3. Notification CMIL sous **72 heures** (obligation légale).
  4. Notification des users concernés.
- [ ] Souscrire à une **assurance cyber** couvrant les frais de
      notification + de remédiation.

## 8. Alternative à reconsidérer

Externaliser à un service de KYC tiers (Sumsub, Onfido, ComplyAdvantage,
Veriff, Persona…) qui gère la conformité légale à leur place. AryTrano
stockerait seulement leur `verificationId` + un statut. Coût ~$50-200/
mois selon volume. À évaluer si le coût de la conformité interne dépasse
ce budget.

---

## TL;DR avant prod

**Bloquants minimums avant d'ouvrir le flux à des vrais users** :
1. Déclaration CMIL déposée + numéro de récépissé en notre possession (§1)
2. Case à cocher de consentement + politique de confidentialité publiée (§2)
3. Cron de purge à 6 mois en place + testé (§3)
4. Procédure de rotation de clé documentée (§5)
5. Logs d'accès admin actifs (§6)

Tout le reste peut être complété progressivement.

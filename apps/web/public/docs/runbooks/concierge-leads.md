# Concierge lead operator runbook — E-T28 v1

**Audience** : opérateurs AryTrano qui gèrent la file `/admin/leads`.
**Statut** : v1 (2026-06-10) — sera révisé après les 100 premiers leads.
**Pré-requis** : compte AryTrano avec rôle ADMIN, application mobile Expo
installée avec ton token push enregistré, accès WhatsApp Business sur ton
téléphone, accès Google Workspace pour répondre depuis support@arytrano.com.

---

## 1. Vue d'ensemble — qu'est-ce qu'un lead ?

Un **LeadRequest** est créé chaque fois qu'un étudiant clique
**« Je suis intéressé(e) »** sur la page détail d'une annonce et soumet
le mini-formulaire (nom, téléphone WhatsApp, fenêtre d'emménagement,
confirmation budget).

Le lead arrive au statut `NEW` dans la file. Ton rôle :

1. **Claim** le lead sous 4h.
2. Contacte le propriétaire pour vérifier la disponibilité.
3. Si OK, contacte le locataire pour confirmer son intérêt.
4. Si les deux confirment, **convertis le lead en bail** depuis
   `/admin/leads/[id]` — l'AryTrano agit pour le compte du proprio.
5. Envoie au locataire le lien de paiement signature (template
   `leaseLink`).

> **Règle d'or** : aucun document (CIN, bail, montant en Ariary détaillé)
> ne quitte la plateforme. Tout passe par les liens du dashboard AryTrano.

---

## 2. États du lead — quand le faire avancer

```
NEW          → CLAIMED        (tu fais "Je claim")
CLAIMED      → IN_DISCUSSION  (premier message envoyé)
IN_DISCUSSION → AWAITING_OWNER (le proprio doit répondre)
IN_DISCUSSION → AWAITING_TENANT (le tenant doit répondre)
AWAITING_*   → IN_DISCUSSION  (la partie en attente a répondu)
IN_DISCUSSION → REJECTED      (un des deux se retire)
IN_DISCUSSION → CONVERTED     (clic "Convertir en bail")
```

Le cron auto-revert un lead `CLAIMED` à `NEW` après **4h sans activité**
(SLA dépassé). Le cron auto-archive vers `LAPSED` après **14 jours sans
activité non-SYSTEM**.

WIP cap **server-enforced = 6** leads en cours par opérateur. Si tu
essaies de claim un 7ᵉ, tu reçois un 409.

---

## 3. Workflow standard — happy path

### Étape 1 — Claim le lead

Ton téléphone vibre (push Expo `Nouveau lead AryTrano`). Tu ouvres
`/admin/leads`, tu cliques **« Je claim »** sur la ligne `NEW`.

Tu as maintenant **4h** avant que le cron ne revert au pool. Le compteur
SLA s'affiche en haut de la ligne.

### Étape 2 — Contacter le propriétaire

Ouvre la fiche `/admin/leads/[id]`. Dans la sidebar droite, clique le
template :

**→ Owner : nouveau lead**

WhatsApp Web (ou ton app native) ouvre avec le numéro du propriétaire
et un texte pré-rempli. Le message dit :

> Bonjour {Owner}, je suis {toi} de l'équipe AryTrano. Un étudiant,
> {tenant}, est intéressé par votre annonce « {titre} »...

Envoie le message. **Logge ton action** sur la fiche via le bloc
**« Avancer le lead »** :

- Nouveau statut : `IN_DISCUSSION` ou `AWAITING_OWNER`
- Canal : `whatsapp`
- Note : "Premier message envoyé au propriétaire."

L'horodatage `firstContactedAt` se met automatiquement quand tu poses
un MESSAGED avec un canal.

### Étape 3 — Réponse du propriétaire

**Scénario A : propriétaire confirme la dispo**

- Transition vers `AWAITING_TENANT`
- Note : "Proprio dispo, j'attends confirmation tenant."

Clique le template **→ Tenant : relance** dans la sidebar pour envoyer
au locataire la confirmation et la suite des étapes.

**Scénario B : propriétaire dit "loué"**

- Transition vers `REJECTED`
- Note : "Proprio a loué à un autre off-platform. Locataire informé."
- Clique **→ Tenant : sans réponse** pour informer le locataire et
  l'orienter vers le catalogue.

**Scénario C : pas de réponse sous 24h**

- Clique **→ Owner : relance**
- Transition reste `AWAITING_OWNER` avec une note "Relance J+1".

Le cron `sweep-stale-claimed-leads` ne te déchargera pas si tu logges
des activités — l'horloge se compte sur l'inactivité globale.

### Étape 4 — Réponse du locataire

**Scénario A : locataire confirme**

Tu as maintenant un accord verbal des deux côtés. Tu peux convertir.

### Étape 5 — Convertir en bail

Sur `/admin/leads/[id]`, scrolle jusqu'au bloc **« Convertir en bail »**
(visible seulement si tu es le claimer ET le lead n'est pas terminal).

Remplis le formulaire :

- **Email du locataire** : si le lead était signé, c'est pré-rempli.
  Sinon, demande au locataire de **s'inscrire sur arytrano.com** avant
  de continuer. Sans compte, tu auras `tenant_not_found`.
- **Date d'emménagement** : confirmée avec le proprio par WhatsApp.
- **Durée (mois)** : 12 par défaut, ajuste si demande spécifique.

⚠️ **Important** : en cliquant « Convertir en bail » tu **déclares
implicitement** que le propriétaire a verbalement accepté les
Conditions d'utilisation Propriétaire (T-049). C'est une **gate
bypass** server-side — on contourne `ownerTermsAcceptedFor()` parce
que l'opérateur prend la responsabilité.

Si le propriétaire n'a JAMAIS signé le bail dans sa carrière chez
AryTrano (jamais connecté à `/dashboard`), demande-lui d'abord par
WhatsApp s'il accepte explicitement les CGU (tu peux paraphraser :
*"Si on conclut, vous acceptez les Conditions d'utilisation Propriétaire
AryTrano disponibles sur arytrano.com/legal/terms-owner ?"*). Sa
réponse positive te suffit pour cocher mentalement la case.

### Étape 6 — Envoie le lien de paiement signature

Le Lease est créé. Une URL de la forme
`/dashboard/leases/[leaseId]` est accessible.

Clique le template **(à venir, T-RES-08bis)** ou copie le lien et envoie
au locataire le template manuel :

> Bonjour {tenant}, le bail pour « {titre} » est prêt. Voici votre lien
> de signature : {leaseUrl}. Les frais d'accompagnement AryTrano à
> régler maintenant pour valider le bail. À tout de suite !

Le locataire paye → le webhook GoalPay flippe le Lease à `ACTIVE` →
tu reçois un email récap.

Clique le template **→ Owner : bail payé** pour informer le propriétaire.

Le lead est maintenant `CONVERTED`. Ton WIP redescend de 1.

---

## 4. Anti-disintermédiation — ce que tu ne dois jamais faire

L'AryTrano gagne sa vie sur les frais d'accompagnement. Un proprio
qui contourne la plateforme = perte de revenu pour nous + perte de
protection pour le locataire. Règles :

1. **Ne jamais donner le numéro direct du locataire au proprio** (ni
   l'inverse). Toutes les communications passent par toi.
2. **Ne jamais conseiller un paiement direct** entre proprio et
   locataire pour les frais AryTrano. Si le proprio dit *"je peux faire
   moins cher si on fait sans AryTrano"*, réponds :
   > Je comprends, mais sans AryTrano vous perdez l'arbitrage caution
   > (E-T27), l'attestation de bail, et le suivi des paiements. C'est
   > pour ça qu'il y a un coût.
3. **Si tu détectes une tentative de disintermédiation** (le proprio
   demande explicitement de finir par WhatsApp privé), transition le
   lead vers `REJECTED` avec une note *"disintermediation attempt"* +
   ouvre un ticket sur Slack #compliance.
4. Ton contrat opérateur AryTrano contient une **clause anti-
   circumvention 12 mois** — interdiction de référer un locataire vers
   un propriétaire en off-platform. Briefing HR à signer avant ton
   premier shift.

---

## 5. PII discipline

Les leads contiennent des informations personnelles (nom + numéro
WhatsApp). Règles :

| Donnée | Où elle vit | Où elle ne doit JAMAIS aller |
|---|---|---|
| Nom locataire | `LeadRequest.tenantName` (clear) | Slack channel public, capture d'écran réseau social |
| Téléphone E.164 | `LeadRequest.tenantPhone` (clear) | Logs Sentry, copies d'écran client |
| CIN propriétaire | Cloudinary chiffré (E-T05) | WhatsApp en pièce jointe |
| Bail PDF | `/dashboard/leases/[id]` | WhatsApp en pièce jointe |
| Montants en Ariary | Lease row + page UI | Conversation WhatsApp détaillée (mets le lien dashboard) |

**Règle simple** : si tu dois envoyer un document, envoie le **lien
dashboard** où l'autre partie peut se connecter pour le consulter.
Jamais le document lui-même.

Les payloads `LeadActivity` que tu écris sont consultables par tous les
ADMINs en lecture. Évite d'y mettre des conversations textuelles
verbatim — résume.

---

## 6. Escalation matrix

| Situation | Qui contacter |
|---|---|
| Bug technique / page qui plante | Slack `#tech-on-call` + screenshot |
| Litige proprio-locataire actif | Slack `#disputes` + transition Lease → `DISPUTED` |
| Tentative de fraude (faux CIN, demande de virement direct) | Slack `#fraud` + lead → `REJECTED` + note détaillée |
| Compte locataire à supprimer (RGPD) | support@arytrano.com avec sujet `[RGPD-erase]` |
| Plus de credits Cloudinary / Sentry | Slack `#tech-on-call` |
| Problème de paiement GoalPay | support@goalpay.pro + Slack `#payments` |

---

## 7. Templates WhatsApp pré-définis

Tous accessibles depuis `/admin/leads/[id]` sidebar droite. Les
templates appellent `lib/wa-me/*` côté serveur, qui :

- Strip les caractères CRLF / tab / NUL des champs user-supplied
  (anti-injection).
- Cappent le texte à 1500 chars (limite WhatsApp).
- Normalisent le téléphone E.164 → digits-only (format `wa.me`).
- Switchent FR-MG / MG selon `User.locale`.

| Template | Destinataire | Quand l'utiliser |
|---|---|---|
| `newLead` | Owner | Premier contact après claim |
| `ownerReminder` | Owner | J+1 / J+2 sans réponse |
| `tenantFollowUp` | Tenant | Confirmer l'intérêt après accord owner |
| `noResponse` | Tenant | Archiver poliment après 14j d'inactivité |
| `leaseLink` | Tenant | Envoyer le lien `/dashboard/leases/[id]` |
| `leasePaidOwner` | Owner | Confirmation paiement signature |

---

## 8. Shifts opérateur

Pour recevoir les pushs Expo sur ton mobile, tu dois déclarer un shift
dans la table `OperatorShift` (UI dédiée à venir en v1.1). Pour v1,
seed direct DB :

```bash
docker exec -it arytrano-postgres psql -U arytrano -d arytrano -c "
INSERT INTO \"OperatorShift\" (id, \"operatorId\", \"startsAt\", \"endsAt\", \"createdAt\")
VALUES (
  gen_random_uuid()::text,
  '<ton-user-id>',
  NOW(),
  NOW() + INTERVAL '8 hours',
  NOW()
);
"
```

Une fois on-shift, tu reçois jusqu'à **1 push toutes les 10 minutes**
(anti-flood). Si plusieurs leads arrivent en rafale, ils s'accumulent
côté file mais tu reçois 1 ping qui te dit "regarde la file".

---

## 9. Métriques surveillées (Sentry)

| Tag | Que ça veut dire |
|---|---|
| `feature=leads source=WEB` | Nouveau lead web — info, normal |
| `cron=sweep-unclaimed-leads escalated > 0` | Tu as raté ton SLA de claim |
| `cron=sweep-stale-claimed-leads reverted > 0` | Tu as laissé un lead pourrir 48h |
| `step=notify-operators-on-new-lead` | Bug push fan-out — ping `#tech-on-call` |

Ton manager regarde le ratio `lead.created` (informational) /
`CONVERTED` (production) hebdo. Cible v1 : **30-40% de conversion** sur
les leads claimés.

---

## 10. Anti-abuse / fraude détectée

Le service `createInterestLead` rate-limit :
- 3 leads / heure / numéro de téléphone (`phoneHash`)
- 10 leads / heure / IP (`ipHash`)

Au-delà, le visiteur reçoit "Trop de demandes". Si tu vois qu'un même
numéro a 3 leads dans la même journée sur 3 listings différents avec
le même `tenantName` mais des noms tronqués différents, c'est suspect
— ouvre Slack `#fraud` avec le `tenantPhoneHash`.

---

## 11. v1 → v1.1 roadmap

Tickets connus à venir :

- **T-RES-09bis** : UI opérateur pour gérer ses shifts (au lieu du seed
  DB).
- **T-RES-08bis** : 6ᵉ template WhatsApp `leaseLink` injecté
  automatiquement dans `/admin/leads/[id]` après conversion.
- **T-002 (Phone OTP)** : gate la soumission anonyme du formulaire
  lead via un code SMS — actuellement on accepte tout numéro E.164
  bien formaté.
- **T-RES-07bis** : transformer la "bypass owner-terms" en pop-up
  d'audit avec timestamp de l'opérateur (compliance).

---

_Document v1.0 — 2026-06-10. Edited by Andry (AryTrano team). Pour
toute question : support@arytrano.com._

# Runbook — Paiements GoalPay (E-T15)

**Provider** : GoalPay (Mobile Money Madagascar)
**Docs officielles** : https://goalpay.pro/docs/api/integrations
**Support marchand** : `goalpay.mg@gmail.com` · WhatsApp `+261 34 23 041 65`
**Statut couverture API** : initiation + webhook seulement (pas de refund API, pas de lookup API, pas de sandbox)

---

## 1. Variables d'environnement requises

| Variable | Type | Description |
|---|---|---|
| `GOALPAY_ACCESS_KEY` | string `TGP_*` | Clé marchand envoyée par le support GoalPay après onboarding. **Server-only**, jamais envoyée au navigateur. |
| `GOALPAY_WEBHOOK_SECRET` | string `SK_*` | Secret partagé HMAC-SHA256 fourni par GoalPay (configuré côté merchant dashboard pour signer les webhooks). |
| `PAYMENT_GOALPAY_URL` | URL complète (default `https://api.goalpay.pro/api/payement/service`) | Endpoint complet de l'initiate-payment. Pas de sandbox documenté — toujours prod. |

**Note** : `GOALPAY_WEBHOOK_SECRET` est fourni par GoalPay support — on ne le génère pas nous-même. Coller la valeur reçue dans `.env`.

---

## 2. Configurer le webhook + redirects côté GoalPay

Dans le dashboard marchand GoalPay → onglet « Configuration » :

**Domaine du site** : `https://arytrano.com`

**Webhook URL** : 2 URLs acceptées (la 2e est un alias court pour compat
avec la config initiale GoalPay) :
- ✅ canonique : `https://arytrano.com/api/webhooks/goalpay`
- ✅ alias court : `https://arytrano.com/webhook-gpay`

Les deux pointent vers le même handler (HMAC verify + idempotent DB
record). N'importe laquelle marche ; nouvelle intégration → préférer
la canonique.

**Webhook secret** : coller la valeur `SK_*` fournie par GoalPay support
dans `.env` (variable `GOALPAY_WEBHOOK_SECRET`). Vérifier que la valeur
côté dashboard **matche exactement** celle de l'env — un mismatch fait
que toutes les callbacks renvoient `401 invalid_signature` et le statut
Payment reste bloqué en `INITIATED`.

**URLs de redirection après paiement** :
- Paiement réussi : `https://arytrano.com/transaction/done`
- Paiement annulé : `https://arytrano.com/transaction/canceled`
- Paiement échoué : `https://arytrano.com/transaction/fail`

Les 3 pages sont des Server Components qui :
1. Lisent `?reference=lease_XXX` de l'URL
2. Lookup le Payment + lease propriétaire-checké
3. Affichent un état UI + CTA vers `/dashboard/leases/[id]`

**Elles ne mutent JAMAIS l'état** — c'est le webhook qui pilote la state
machine. Le lien de redirect est replayable par n'importe qui ; on ne
peut donc pas lui faire confiance.

**Events webhook souscrits** : `payment.success`, `payment.failed`,
`payment.canceled`, `payment.expired` (les 4).

---

## 2.bis Mode TEST sur localhost (vérifié 2026-05-27)

GoalPay a un mode test après tout — accessible via l'onglet « Token de
test » du dashboard. Aucune transaction réelle, parfait pour vérifier
les redirects + webhooks avant le test prod 100 Ar.

**Dashboard → onglet TEST → coller** :

| Champ | Valeur localhost | Notes |
|---|---|---|
| Paiement réussi | `http://localhost:3000/test/success` | Le browser suit la redirection → localhost direct |
| Paiement annulé | `http://localhost:3000/test/cancel` | idem |
| Paiement échoué | `http://localhost:3000/test/fail` | idem |
| Webhook | `https://<ton-ngrok>.ngrok-free.app/api/goalpay/webhook/test` | GoalPay POSTe depuis SON serveur → besoin d'ngrok |

**.env local** : coller la TEST key (`TGPT_*`) reçue dans le dashboard
test → `GOALPAY_ACCESS_KEY` + le webhook secret test → `GOALPAY_WEBHOOK_SECRET`.
Restart `npm run dev` (Next.js charge .env au boot).

**Setup ngrok** (une seule fois) :
```bash
# Installer (Windows : winget install ngrok.ngrok ; macOS : brew install ngrok)
ngrok config add-authtoken <ton-token-depuis-ngrok.com/dashboard>

# Lancer le tunnel sur localhost:3000
ngrok http 3000

# Copier l'URL https affichée (ex: https://abc123.ngrok-free.app)
# Coller dans le dashboard GoalPay test : <url>/api/goalpay/webhook/test
```

**Routes test côté code** (créées dans le commit GoalPay test wiring) :
- `/test/{success,cancel,fail}` — miroir de `/transaction/*` prod
- `/api/goalpay/webhook/test` — alias du handler canonique
  `/api/webhooks/goalpay` (même HMAC verify, même idempotence)

---

## 3. Tester en prod (pas de sandbox)

GoalPay n'a pas de sandbox documenté. Le test se fait en prod avec un montant minimal.

**Procédure** :

1. Créer un Payment en DB via une initiation manuelle (Server Action admin ou test e2e)
2. Montant **100 Ar** (0.02 USD) — minimum testable
3. Payer via Mobile Money depuis un compte test (MVola / Orange Money / Airtel Money)
4. Vérifier en DB que le webhook arrive (≈ 5-15 secondes après paiement) :
   ```sql
   SELECT id, status, webhookReceivedAt, completedAt FROM "Payment" ORDER BY createdAt DESC LIMIT 1;
   -- attendu : status=CONFIRMED, webhookReceivedAt set, completedAt set
   ```
5. Si test failed (`payment.failed`) — annuler le paiement Mobile Money depuis le téléphone payeur avant validation

**Ne pas tester avec des montants élevés** — GoalPay débite réellement et un refund coûte (voir §5).

---

## 4. Diagnostiquer un Payment bloqué en `INITIATED`

Symptôme : un Payment a été initié il y a > 15 min mais reste à `status=INITIATED` (webhook jamais arrivé).

**Causes possibles** :

| Cause | Diagnostic | Fix |
|---|---|---|
| User n'a jamais cliqué "Payer" sur GoalPay | `createdAt + 10 min < now()` et pas de webhook | Cron `reconcile-payments` (E-T20) marquera `EXPIRED` automatiquement à 12h |
| Webhook signature rejetée (mismatch secret) | Logs Sentry : `401 invalid_signature` sur `/api/webhooks/goalpay` | Vérifier que `GOALPAY_WEBHOOK_SECRET` matche le dashboard GoalPay |
| URL webhook mal configurée côté GoalPay | Pas de hit sur `/api/webhooks/goalpay` (logs nginx/Vercel vides) | Re-vérifier l'URL dans le dashboard marchand |
| GoalPay infra down | Aucun de leurs marchands ne reçoit de webhook | Contacter support GoalPay |

**Vérif manuelle d'un Payment côté GoalPay** :
- Pas d'API → utiliser le dashboard marchand (recherche par `order_reference` ou `reference`)

---

## 5. Refund manuel (PAS d'API GoalPay)

**Important** : GoalPay n'expose pas d'endpoint refund. Le process est entièrement manuel.

### Procédure admin

1. Identifier le `Payment.id` à rembourser et confirmer avec l'utilisateur (litige, erreur, double-paiement)
2. **Marquer en DB** :
   ```sql
   UPDATE "Payment"
   SET status = 'REFUND_PENDING'
   WHERE id = 'pay_xxx';
   INSERT INTO "PaymentEvent" ("id", "paymentId", "status", "rawPayload", "occurredAt")
   VALUES (gen_random_uuid(), 'pay_xxx', 'REFUND_PENDING',
           '{"reason":"<your reason>","admin":"<email>"}'::jsonb, NOW());
   ```
3. **Contacter le support GoalPay** :
   - Email : `goalpay.mg@gmail.com`
   - Inclure : `order_reference`, `reference`, montant, raison, téléphone payeur
4. Quand GoalPay confirme le refund effectué (généralement < 48h) :
   ```sql
   UPDATE "Payment" SET status = 'REFUNDED' WHERE id = 'pay_xxx';
   INSERT INTO "PaymentEvent" (...) VALUES (...,'REFUNDED', ...);
   ```
5. Notifier l'utilisateur (email manuel pour v2.0, automatisé v2.1)

### Cas d'usage qui déclenchent un refund manuel

- Litige `Lease` arbitré en faveur du locataire (E-T27)
- Erreur côté proprio (a signé un bail sur la mauvaise annonce)
- Double-paiement (ne devrait pas arriver avec idempotency UNIQUE, mais sait-on jamais)
- Fraude détectée admin

---

## 6. Audit logs

Toute transition Payment génère une ligne `PaymentEvent` (audit trail immuable). Pour reconstituer l'historique d'un paiement :

```sql
SELECT pe.status, pe.occurredAt, pe."rawPayload"
FROM "PaymentEvent" pe
WHERE pe."paymentId" = 'pay_xxx'
ORDER BY pe.occurredAt ASC;
```

Les `rawPayload` JSON conservent les events webhook bruts → indispensables en cas de dispute juridique avec GoalPay.

---

## 7. Erreurs côté webhook (logs à surveiller)

| Code HTTP | Signification | Action attendue |
|---|---|---|
| `200 ok=true` (kind=applied) | Premier webhook, Payment status mis à jour | RAS, normal |
| `200 ok=true` (kind=noop) | Webhook dupliqué sur état terminal | RAS, normal (idempotency works) |
| `200 ok=true` (kind=unknown_reference) | Reference inconnue en DB | À investiguer : event de dev en prod ? Race avec création Payment ? |
| `401 invalid_signature` | Signature HMAC invalide | **CRITIQUE** : vérifier le secret OU tentative d'attaque |
| `400 invalid_payload` | Payload ne matche pas le Zod schema | À investiguer : GoalPay a-t-il changé le format ? |
| `422 mismatch` (reason=amount) | Montant webhook ≠ montant DB | **CRITIQUE** : tampering OU bug | 
| `422 mismatch` (reason=providerTxId) | order_reference différent du précédent | **CRITIQUE** : double init GoalPay |

Alertes Sentry recommandées : tout `401`, `400`, `422` doit lever une notif admin.

---

## 8. Migration DB

Quand `prisma migrate dev` tourne pour la première fois après E-T15 :

```bash
npx prisma migrate dev --name e_t15_goalpay_payment_model
```

Cela applique :
- `Payment.amountMGA` Decimal(12,2) → Int (cast safe car MGA sans subunit)
- Ajout `expiresAt`, `webhookReceivedAt`, `completedAt` (nullable)
- Ajout `PaymentPurpose.LEASE_SUCCESS_FEE` (pour E-T26)
- Ajout `PaymentStatus.CANCELED`, `EXPIRED`, `REFUND_PENDING`
- `Payment.providerTxId` devient UNIQUE

**Note** : si la table `Payment` contient déjà des rows avec status hors enum élargi, la migration échoue → vider la table en dev (`DELETE FROM "Payment"`) avant la migration.

---

## 9. Checklist déploiement prod

Avant le premier paiement réel :

- [x] Compte GoalPay marchand signé + token `TGP_*` reçu — 2026-05-27
- [x] Webhook secret généré (`openssl rand -hex 32`) — fourni par GoalPay support
- [x] Variables env présentes dans le serveur prod : `GOALPAY_ACCESS_KEY`, `GOALPAY_WEBHOOK_SECRET`, `PAYMENT_GOALPAY_URL`
- [x] URL webhook configurée dans le dashboard GoalPay : `https://arytrano.com/webhook-gpay` (alias de `/api/webhooks/goalpay`)
- [x] Webhook secret côté dashboard matche `GOALPAY_WEBHOOK_SECRET`
- [x] Migration Prisma appliquée en prod
- [x] **Test e2e en prod avec 100 Ar (voir §3) — validé 2026-05-27** : flow complet wizard → checkout GoalPay → paiement Mobile Money → webhook HMAC → state machine DB → redirect page. Tous les rows DB attendus présents (Payment.CONFIRMED + Lease transition + PaymentEvent audit).
- [x] Tests Vitest passent : `signature.test.ts`, `record-webhook-event.test.ts` (192/192 vert)
- [ ] Sentry alertes configurées sur 401/400/422 du webhook — partiellement câblé (commits récents ajoutent capture sur 401 invalid_signature + 422 mismatch). Reste à valider la dashboard Sentry alert rules.
- [ ] Runbook accessible à l'équipe ops

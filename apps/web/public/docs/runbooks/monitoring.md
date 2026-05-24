# Runbook — Monitoring & alerting (Sentry)

> Configure Sentry pour capturer les erreurs serveur + client, p95
> latence, et un canal d'alertes Slack/Discord. **Last reviewed** : 2026-05-22.

---

## TL;DR — production setup

1. Créer un projet Sentry **`arytrano-web`** (plan Developer free : 5k errors/mo)
2. Copier le DSN + créer un Auth Token (scope `project:write`)
3. Ajouter à `/etc/arytrano/app.env` :
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/yyy
   SENTRY_AUTH_TOKEN=sntrys_xxx
   SENTRY_ORG=arytrano
   SENTRY_PROJECT=arytrano-web
   SENTRY_ENVIRONMENT=production
   SENTRY_TRACES_SAMPLE_RATE=0.1
   ```
4. Re-déployer : `docker compose -f docker-compose.prod.yml up -d`
5. Vérifier dans Sentry qu'un event de test arrive : `curl https://arytrano.mg/api/sentry-test`

---

## Architecture

```
              ┌──────────────────┐
              │  Browser (RN /   │
              │  Next client)    │
              └────────┬─────────┘
                       │ Sentry SDK
                       ▼
              ┌──────────────────┐         ┌─────────────┐
              │  Sentry SaaS     │ alerts  │  Slack      │
              │  arytrano-web    ├────────►│  #ops       │
              └──────────────────┘         └─────────────┘
                       ▲
                       │ Sentry SDK
              ┌────────┴─────────┐
              │ Next.js server   │
              │ (Node + Edge)    │
              └──────────────────┘
```

**Ce qui est capturé** :
- Toutes les exceptions unhandled (server + client + edge)
- Performance traces 10% des requêtes (sample rate configurable)
- Breadcrumbs (route changes, fetch calls, console errors)
- Healthcheck `lastBackupAgeHours` exposé via `/api/health` (lu par monitoring externe)

**Ce qui n'est PAS capturé** :
- Session replay (privacy + bandwidth MG)
- User PII (email, phone, IP, body) — masqué par `scrub-pii.ts`
- Erreurs ignorées (NEXT_REDIRECT, ZodError, NetworkError fetch annulé)

---

## 1. Création du projet Sentry

1. Aller sur https://sentry.io → Create Project
2. Platform : **Next.js**
3. Project name : `arytrano-web`
4. Alert frequency : « Alert me on every new issue »
5. Team : AryTrano (créer si pas existant)

Récupérer après création :
- **DSN** : `Settings > Projects > arytrano-web > Client Keys (DSN)`
- **Auth Token** : `Settings > Account > API > Auth Tokens` → New token avec scopes `project:read` + `project:write` + `project:releases`
- **Org slug** : visible dans l'URL Sentry (`https://<org-slug>.sentry.io/...`)

---

## 2. Configurer les alertes Slack

1. Sentry → `Settings > Integrations > Slack` → Add to Slack
2. Autoriser sur le workspace AryTrano
3. Créer 2 rules d'alerte :

### Alerte A : Nouvelle erreur (issue created)

- Trigger : « An issue is first seen »
- Filter : `environment` is `production`
- Action : Send notification to `#ops` Slack channel

### Alerte B : Taux d'erreur 5xx haut

- Trigger : « Number of errors in an issue is more than 50 in 5 minutes »
- Filter : `level` is `error`
- Action : Slack `#ops`

### Alerte C : p95 latency > 2s

- Settings > Alerts > Metric Alerts → Create
- Metric : `transaction.duration`
- Aggregation : `p95`
- Threshold : > 2000ms over 5 min
- Action : Slack `#ops`

---

## 3. Tester l'intégration

### Test depuis le serveur (Server Component)

Ajouter temporairement dans `/api/sentry-test/route.ts` :
```ts
export async function GET() {
  throw new Error('Sentry server test — safe to ignore')
}
```

Curl :
```bash
curl https://arytrano.mg/api/sentry-test
```

Devrait apparaître dans Sentry > Issues sous 60s.

### Test depuis le client

Ajouter un bouton temporaire :
```tsx
<button onClick={() => { throw new Error('Sentry client test') }}>
  Test
</button>
```

Cliquer en prod → vérifier dans Sentry.

**Nettoyer** ces 2 tests après validation.

---

## 4. PII scrubber — what's stripped

Tout évènement passe par `src/lib/observability/scrub-pii.ts` avant l'envoi :

| Champ | Action |
|-------|--------|
| `request.headers.cookie` | Supprimé |
| `request.headers.authorization` | Supprimé |
| `request.headers['x-csrf-token']` | Supprimé |
| `request.data` (body) | Supprimé entièrement |
| `user.email` | Supprimé |
| `user.ip_address` | Supprimé |
| `user.username` | Supprimé |
| `user.id` | Conservé (anonyme, utile pour grouper) |
| Email dans message/breadcrumb/exception | Remplacé par `<email>` |
| Téléphone `+261…` | Remplacé par `<phone>` |
| CIN 12-digit | Remplacé par `<cin>` |

Tests unitaires : `src/lib/observability/__tests__/scrub-pii.test.ts` (10 tests).

Si tu vois quand même de la PII dans Sentry → ouvre un ticket P0 et ajoute la pattern au scrubber.

---

## 5. Performance budget

Free tier Sentry = **5 000 errors/mo** + 10 000 transactions/mo. Nos targets :

| Trigger | Estimate v0.5 beta | Action si dépassé |
|---------|---------------------|-------------------|
| Errors | < 100/mo | OK |
| Transactions (sample 10%) | ~5 000/mo | Réduire `SENTRY_TRACES_SAMPLE_RATE` à 0.05 |

Réviser au mois 2 quand on aura des données réelles.

---

## 6. Healthcheck monitoring (externe à Sentry)

Sentry capture les **erreurs**. Pour **uptime** (l'app répond ou pas), utiliser
un outil externe gratuit qui ping `/api/health` :

| Provider | Free tier |
|----------|-----------|
| **UptimeRobot** | 50 monitors, ping every 5min |
| **BetterStack Heartbeat** | 10 monitors, ping every 30s |
| **Cron-job.org** | Unlimited, gentle |

Setup recommandé : UptimeRobot, 1 monitor sur `https://arytrano.mg/api/health`,
expected response contient `"ok":true`, alert email + Slack si fail 2x consécutifs.

Le endpoint `/api/health` retourne aussi `lastBackupAgeHours` — configurer
une alerte sur ce champ si > 26h (catches le cas où le cron backup ne tourne plus).

---

## 7. Source maps (stack traces lisibles en prod)

`next.config.ts` est wrappé par `withSentryConfig` → à chaque `next build`,
les source maps sont uploadées vers Sentry et désactivées côté client
(`hideSourceMaps: true`). Résultat : Sentry montre du vrai code source,
les visiteurs ne voient pas tes sources via DevTools.

Pré-requis : `SENTRY_AUTH_TOKEN` doit être présent au moment du `next build`.
Si manquant, l'upload skip silencieusement (l'app marche pareil, juste les
stack traces seront minifiées dans Sentry).

---

## 8. Releases (versionner les déploiements)

Sentry associe chaque erreur à une « release ». Pour activer :

```bash
# Dans le pipeline de build, après `next build`
npx @sentry/cli releases new "arytrano@$(git rev-parse --short HEAD)"
npx @sentry/cli releases set-commits --auto "arytrano@$(git rev-parse --short HEAD)"
npx @sentry/cli releases finalize "arytrano@$(git rev-parse --short HEAD)"
```

Bénéfice : pour chaque erreur, Sentry te dit « regression introduced in commit abc123 ».

---

## 9. Désactiver Sentry temporairement

Si Sentry SaaS tombe ou tu veux freiner les events (quota dépassé) :
```bash
# Sur le VPS
nano /etc/arytrano/app.env
# Comment out :
# NEXT_PUBLIC_SENTRY_DSN=...
docker compose -f docker-compose.prod.yml restart app
```

Sans DSN, le SDK est no-op : zéro overhead, zéro network.

---

## Related runbooks

- `restore-db.md` — DB restore (T-055)
- `incidents.md` — playbook général incidents
- `contabo-deployment.md` — full deployment doc

# Deployment — Contabo VPS

> Step-by-step setup for hosting AryTrano on a Contabo VPS (single-box : app + DB).
>
> **Target spec** : Contabo VPS S — 4 vCPU, 8GB RAM, 75GB NVMe SSD, ~€5.89/mo
> **OS** : Ubuntu 24.04 LTS
> **Stack** : Docker Compose · Next.js app · Postgres 16 · Caddy reverse proxy
>
> **Last reviewed** : 2026-05-22

---

## 0. Architecture overview

```
                           Internet
                              │
                              ▼
                ┌─────────────────────────────┐
                │   Caddy (reverse proxy)     │
                │   Auto HTTPS (Let's Encrypt)│
                │   :443 → app:3000           │
                └─────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │   Next.js app (Docker)      │
                │   :3000                     │
                │   reads DATABASE_URL        │
                └─────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │   Postgres 16 (Docker)      │
                │   :5432 (internal only)     │
                │   volume: /var/lib/.../pg   │
                └─────────────────────────────┘
                              │
                              │ pg_dump nightly
                              ▼
                ┌─────────────────────────────┐
                │ Cloudflare R2 (S3 storage)  │
                │ Daily backups · 30j retention│
                │ Monthly archives · 12 mois  │
                └─────────────────────────────┘
```

External dependencies (managed services) :
- **Cloudinary** — image storage + transformations
- **Upstash Redis** — rate limits
- **Sentry** — error tracking (T-056)
- **Cloudflare R2** — backup storage (this doc)
- **Stadia Maps** — map tiles for /quartiers (AUD-008)
- **Gmail SMTP** ou **Resend** — emails transactionnels

---

## 1. Provision the VPS

1. Order Contabo VPS S (4 vCPU / 8GB / 75GB SSD / location EU)
2. OS : Ubuntu 24.04 LTS
3. Get root SSH credentials by email
4. SSH in, change root password, create deploy user :
   ```bash
   adduser deploy
   usermod -aG sudo deploy
   rsync -av /root/.ssh /home/deploy/
   chown -R deploy:deploy /home/deploy/.ssh
   ```
5. Configure UFW firewall :
   ```bash
   ufw allow OpenSSH
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```
6. Disable root SSH (after confirming deploy user works) :
   ```bash
   sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
   systemctl restart sshd
   ```

---

## 2. Install Docker + Docker Compose

```bash
# Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy
systemctl enable docker

# Verify
docker compose version
```

---

## 3. DNS

Point `arytrano.mg` and `www.arytrano.mg` (A records) to your Contabo IP at your domain registrar.

Add a CNAME `mg.arytrano.mg` → `arytrano.mg` if you want a separate subdomain for the Malagasy language fallback (optional).

Wait ~10 min for DNS propagation (`dig arytrano.mg` to verify).

---

## 4. App directory layout

```bash
ssh deploy@arytrano.mg
sudo mkdir -p /opt/arytrano
sudo chown deploy:deploy /opt/arytrano
cd /opt/arytrano

# Clone the repo
git clone git@github.com:cloudarmelpro/arytrano.git .

# Create env files
mkdir -p /etc/arytrano
sudo cp .env.example /etc/arytrano/app.env
sudo chmod 600 /etc/arytrano/app.env
sudo nano /etc/arytrano/app.env  # fill in real prod values
```

Required env vars in `/etc/arytrano/app.env` :
- `DATABASE_URL=postgresql://arytrano:STRONG_PWD@postgres:5432/arytrano`
- `AUTH_URL=https://arytrano.mg`
- `AUTH_SECRET=` (`openssl rand -base64 32`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (T-056)
- `NEXT_PUBLIC_STADIA_API_KEY` (AUD-008 — see § 9)
- `GMAIL_USER`, `GMAIL_APP_PASSWORD` (or Resend API key)
- OAuth secrets (Google, Facebook)

---

## 5. docker-compose.prod.yml

Already in the repo : `docker-compose.prod.yml` (to create) wraps app + postgres + caddy.

Minimal version :

```yaml
services:
  app:
    image: ghcr.io/cloudarmelpro/arytrano:latest  # or build locally
    env_file: /etc/arytrano/app.env
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks: [internal]

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: arytrano
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: arytrano
    volumes:
      - arytrano_pg:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U arytrano']
      interval: 10s
    networks: [internal]

  caddy:
    image: caddy:2-alpine
    ports: ['80:80', '443:443']
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on: [app]
    restart: unless-stopped
    networks: [internal]

volumes:
  arytrano_pg:
  caddy_data:
  caddy_config:

networks:
  internal:
```

---

## 6. Caddyfile

```caddy
arytrano.mg, www.arytrano.mg {
  encode gzip zstd
  reverse_proxy app:3000

  # Security headers (CSP is set by Next.js middleware, here only the rest)
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options "nosniff"
    Referrer-Policy "strict-origin-when-cross-origin"
    Permissions-Policy "geolocation=(), camera=(), microphone=()"
  }

  # Healthcheck bypass cache
  @health path /api/health
  header @health Cache-Control "no-store"
}

# Redirect www → apex
www.arytrano.mg {
  redir https://arytrano.mg{uri} permanent
}
```

---

## 7. First deploy

```bash
cd /opt/arytrano
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Run Prisma migrations
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Seed (one-time)
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

Watch logs :
```bash
docker compose -f docker-compose.prod.yml logs -f app
```

Verify : `curl https://arytrano.mg/api/health` returns `{"ok":true,"db":"up"}`.

---

## 8. Backup setup (T-055)

### 8.1 Install rclone

```bash
curl https://rclone.org/install.sh | sudo bash
```

### 8.2 Configure Cloudflare R2

1. Create a Cloudflare R2 bucket `arytrano-backups`
2. Generate an API token with R2 read+write scope
3. Configure rclone :
   ```bash
   sudo -u root rclone config
   # Choose: n (new remote)
   # Name: r2
   # Type: s3
   # Provider: Cloudflare
   # Access key, secret: from R2 dashboard
   # Endpoint: https://<account-id>.r2.cloudflarestorage.com
   ```
4. Test :
   ```bash
   sudo rclone lsd r2:
   ```

### 8.3 Backup env

```bash
sudo nano /etc/arytrano/backup.env
```

Content :
```bash
DATABASE_URL=postgresql://arytrano:PWD@localhost:5432/arytrano
BACKUP_S3_BUCKET=arytrano-backups
BACKUP_S3_REMOTE=r2
BACKUP_FRESHNESS_FILE=/var/lib/arytrano/last-backup.txt
BACKUP_RETENTION_DAYS=30
BACKUP_ALERT_WEBHOOK=https://hooks.slack.com/services/...
```

### 8.4 Systemd timer

`/etc/systemd/system/arytrano-backup.service` :
```ini
[Unit]
Description=AryTrano DB backup
After=docker.service

[Service]
Type=oneshot
EnvironmentFile=/etc/arytrano/backup.env
ExecStart=/opt/arytrano/apps/web/scripts/backup-db.sh
User=root
```

`/etc/systemd/system/arytrano-backup.timer` :
```ini
[Unit]
Description=Daily AryTrano backup

[Timer]
OnCalendar=02:00 UTC
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
```

Enable :
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now arytrano-backup.timer
sudo systemctl list-timers | grep arytrano
```

### 8.5 Freshness checker (every 6h)

`/etc/systemd/system/arytrano-backup-check.service` :
```ini
[Unit]
Description=AryTrano backup freshness check

[Service]
Type=oneshot
EnvironmentFile=/etc/arytrano/backup.env
ExecStart=/opt/arytrano/apps/web/scripts/check-backup-freshness.sh
User=root
```

`/etc/systemd/system/arytrano-backup-check.timer` :
```ini
[Unit]
Description=Check backup freshness every 6h

[Timer]
OnCalendar=*-*-* 00,06,12,18:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable :
```bash
sudo systemctl enable --now arytrano-backup-check.timer
```

### 8.6 Test backup manually

```bash
sudo -E /opt/arytrano/apps/web/scripts/backup-db.sh
rclone lsf r2:arytrano-backups/daily/
```

You should see one `arytrano-YYYYMMDD-HHMMSS.sql.gz` file.

---

## 9. Map tiles — Stadia Maps (AUD-008)

The `/quartiers` page and the future `/villes/<slug>/quartiers/<slug>`
pages (E-T11) need a real tile provider. Public `tile.openstreetmap.org`
will rate-limit / block our commercial traffic — we use Stadia Maps
instead (200k tile views/mo free, ~$20/mo above).

### 9.1 Create the Stadia account

1. https://client.stadiamaps.com/signup → free plan
2. Create a property `arytrano-web`
3. **Authentication > Authorized Domains** :
   - `arytrano.mg`
   - `www.arytrano.mg`
   - `localhost:3000` (dev — optional, restrict to a separate key in prod)
4. **Authentication > API Keys** → create one for production
5. Copy the key (~30 char alnum)

### 9.2 Configure the app

Add to `/etc/arytrano/app.env` :
```
NEXT_PUBLIC_STADIA_API_KEY=<your-key>
NEXT_PUBLIC_STADIA_STYLE=alidade_smooth
```

Other style options (cf. https://stadiamaps.com/products/map-tiles/) :
- `alidade_smooth` — clean grey/blue, default (recommended for AryTrano)
- `alidade_smooth_dark` — dark mode
- `outdoors` — terrain + hiking trails
- `osm_bright` — vibrant colors, more "Google Maps" look
- `stamen_terrain` — artistic shaded relief

Rebuild + restart :
```bash
docker compose -f docker-compose.prod.yml up -d
```

Verify : open `/quartiers` in the browser, the map tiles should load
from `tiles.stadiamaps.com` (check DevTools Network).

### 9.3 Monitoring usage

- Dashboard : https://client.stadiamaps.com/dashboard
- Free tier limit : 200k tile views/month
- Estimate v0.5 beta : ~5k views/mo (50 listings × 100 visitors/mo × ~1 map view each)
- Alert : Stadia sends email warnings at 80% / 90% / 100% of quota
- Upgrade path : $20/mo unlocks 500k views

### 9.4 Fallback

If `NEXT_PUBLIC_STADIA_API_KEY` is unset, the app silently falls back
to `tile.openstreetmap.org` apex (current dev behavior). This is fine
for dev but **NOT for production** — OSM apex will block our traffic.

If Stadia is down (rare), the map will show grey tiles. Caddy can
serve a static fallback image but that's overkill — Stadia uptime is
historically > 99.9%.

---

## 10. Monitoring (T-056 — separate runbook)

See `monitoring.md` runbook for Sentry + uptime ping + alerts setup.

---

## 10b. Cron jobs (T-050 review-prompt + future T-049, E-T20)

Cron routes are server endpoints protected by a shared Bearer secret
(`env.CRON_SECRET`). They must be invoked by an external scheduler.

### 10b.1 Set the secret

Add to `/etc/arytrano/app.env` :
```
CRON_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))">
```

Restart the app : `docker compose -f docker-compose.prod.yml restart app`.

### 10b.2 Systemd timer for review-prompt

`/etc/systemd/system/arytrano-cron-prompt-review.service` :
```ini
[Unit]
Description=AryTrano — review prompt cron
After=network-online.target

[Service]
Type=oneshot
EnvironmentFile=/etc/arytrano/app.env
ExecStart=/usr/bin/curl -fsS -H "Authorization: Bearer ${CRON_SECRET}" https://arytrano.mg/api/cron/prompt-review
User=root
```

`/etc/systemd/system/arytrano-cron-prompt-review.timer` :
```ini
[Unit]
Description=Run review-prompt cron daily at 09:00 UTC (12:00 MG)

[Timer]
OnCalendar=09:00 UTC
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
```

Enable :
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now arytrano-cron-prompt-review.timer
sudo systemctl list-timers | grep arytrano-cron
```

### 10b.3 Test manually

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://arytrano.mg/api/cron/prompt-review
# { "ok": true, "candidates": N, "emailed": N, "failed": 0 }
```

### 10b.4 Listing expiration cron (T-049)

`/etc/systemd/system/arytrano-cron-listing-expiration.service` :
```ini
[Unit]
Description=AryTrano — listing expiration cron
After=network-online.target

[Service]
Type=oneshot
EnvironmentFile=/etc/arytrano/app.env
ExecStart=/usr/bin/curl -fsS -H "Authorization: Bearer ${CRON_SECRET}" https://arytrano.mg/api/cron/listing-expiration
User=root
```

`/etc/systemd/system/arytrano-cron-listing-expiration.timer` :
```ini
[Unit]
Description=Run listing-expiration cron daily at 09:30 UTC

[Timer]
# Run 30 min after the review-prompt cron to spread daily volume.
OnCalendar=09:30 UTC
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
```

Enable + verify :
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now arytrano-cron-listing-expiration.timer
curl -H "Authorization: Bearer $CRON_SECRET" https://arytrano.mg/api/cron/listing-expiration
# { "ok": true, "warned": N, "expired": N, "failed": 0 }
```

### 10b.5 Push-receipt polling cron (E-T22)

Polls the Expo Push API every 30 minutes for receipts of recent push
notifications, then clears `User.expoPushToken` for any device whose
receipt comes back as `DeviceNotRegistered` (uninstall). Without this
the column accumulates dead tokens and we waste API calls fanning out
to phones that no longer have the app.

`/etc/systemd/system/arytrano-cron-push-receipts.service` :
```ini
[Unit]
Description=AryTrano — push receipt polling cron
After=network-online.target

[Service]
Type=oneshot
EnvironmentFile=/etc/arytrano/app.env
ExecStart=/usr/bin/curl -fsS -H "Authorization: Bearer ${CRON_SECRET}" https://arytrano.mg/api/cron/push-receipts
User=root
```

`/etc/systemd/system/arytrano-cron-push-receipts.timer` :
```ini
[Unit]
Description=Run push-receipt polling every 30 minutes

[Timer]
# Receipts are available ~15-30 min after send and Expo keeps them
# for 24h, so a 30 min cadence is the sweet spot — we recover every
# receipt even if a single run is skipped.
OnCalendar=*:0/30
Persistent=true
RandomizedDelaySec=60

[Install]
WantedBy=timers.target
```

Enable + verify :
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now arytrano-cron-push-receipts.timer
sudo systemctl list-timers | grep arytrano-cron-push-receipts
# Next run should show up within 30 min.

# Manual test :
curl -H "Authorization: Bearer $CRON_SECRET" https://arytrano.mg/api/cron/push-receipts
# { "ok": true, "polled": N, "delivered": N, "deviceNotRegistered": N,
#   "otherErrors": 0, "staleDeleted": 0 }
```

Watch the first 24h after enabling — `deviceNotRegistered` counts
will spike once dev/staging tokens that pointed at uninstalled
Expo Go sessions get swept. After the initial cleanup the steady-
state count is typically <1% of `polled` (most users keep the app
installed).

For prod observability, the `otherErrors` counter is where
configuration issues surface (e.g. `MismatchSenderId` if FCM creds
get rotated without updating EAS). Sentry catches the cron-level
failures but not the per-receipt ones — those only show in the
Next.js server logs as `[push] receipt non-actionable error <code>`.
Worth tailing for the first deploy.

### 10b.6 Adding new crons

Same pattern : `/api/cron/<name>/route.ts` checks the Bearer secret +
runs an orchestrator, with a matching systemd `.service` + `.timer`
pair on the VPS. Future crons : E-T20 GoalPay reconciliation,
E-T17 subscription renewal.

---

## 11. Deploy a new version

```bash
ssh deploy@arytrano.mg
cd /opt/arytrano
git pull
docker compose -f docker-compose.prod.yml pull   # or build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
docker compose -f docker-compose.prod.yml logs -f app
```

---

## 12. Rollback

```bash
# Identify the previous good image tag
docker images | grep arytrano

# Set the rollback tag in docker-compose.prod.yml or env
APP_IMAGE_TAG=v1.2.3 docker compose -f docker-compose.prod.yml up -d
```

If a migration broke things : restore from backup (see `restore-db.md`).

---

## 13. Known caveats

- **Single-box** : if the VPS crashes, both app and DB are down. Migrate to multi-box (DB on separate VPS) once revenue justifies.
- **No load balancing** : downtime during deploys (~5s while containers swap). Acceptable for v0.5 beta. Use a blue/green or Caddy `health_uri` for zero-downtime later.
- **Backup destination = single R2 bucket** : a region failure of Cloudflare R2 would lose backups. Acceptable risk for v0.5 — consider AWS S3 cross-region replication later.
- **No CDN in front** : direct VPS serves all traffic. Acceptable for < 1k DAU. Add Cloudflare proxy when scaling.

---

## 14. Cost estimate (v0.5 beta)

| Service | Monthly cost |
|---------|--------------|
| Contabo VPS S | €5.89 |
| Cloudflare R2 (~5GB stored, no egress) | $0.08 |
| Domain arytrano.mg | ~€10/year ≈ €0.83/mo |
| Cloudinary (free tier 25GB) | $0 |
| Upstash Redis (free tier 10k commands/day) | $0 |
| Sentry (free tier 5k errors/mo) | $0 |
| Stadia Maps (free tier 200k tile views/mo) | $0 |
| **Total** | **~€6.80/mo** |

Scaling triggers :
- > 1k DAU → add Cloudflare CDN ($0/mo at first)
- > 1GB DB → migrate to Neon or dedicated DB VPS
- > 50GB images → upgrade Cloudinary plan ($89/mo)

---

## Related runbooks

- `restore-db.md` — how to restore a backup
- `monitoring.md` — Sentry + alerting setup (T-056)
- `incident-response.md` — generic incident playbook

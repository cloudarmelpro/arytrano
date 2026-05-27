# Runbook — Incident response

> Playbook général : quoi faire quand quelque chose casse en prod.
> **Last reviewed** : 2026-05-22

---

## Severity matrix

| Niveau | Définition | Réponse |
|--------|-----------|---------|
| **SEV-1** | App down complètement (5xx > 50% sur 5min) ou data loss | Tout drop, intervention immédiate, statut public sur la home |
| **SEV-2** | Feature critique cassée (sign-in, contact, paiement) ou erreur > 5% | < 30 min réponse, communication interne |
| **SEV-3** | Bug isolé sur un flow non-critique, < 1% users impacted | < 4h réponse en heures ouvrées |
| **SEV-4** | Issue mineur cosmétique / typo | Backlog normal |

---

## Phase 1 — Detect

L'incident peut venir de :

1. **Sentry alert Slack `#ops`** (issue created / 5xx spike / p95 high)
2. **UptimeRobot email** (healthcheck fail)
3. **Utilisateur signale** (email, WhatsApp Business, Facebook page)
4. **Backup freshness alert** (`check-backup-freshness.sh`)
5. **Cron failure** (logs systemd)

→ Première chose : **vérifier `/api/health`** :
```bash
curl https://arytrano.com/api/health
```

Si retourne 503 → DB injoignable → **SEV-1**.

---

## Phase 2 — Triage

### 2.1 SSH dans le VPS

```bash
ssh deploy@arytrano.com
```

### 2.2 Status des services Docker

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail 100 app
docker compose -f docker-compose.prod.yml logs --tail 50 postgres
docker compose -f docker-compose.prod.yml logs --tail 30 caddy
```

### 2.3 Ressources système

```bash
df -h           # disque plein ?
free -h         # RAM saturée ?
top -bn1 | head -20  # CPU/process
journalctl -p err --since "10 min ago"  # erreurs noyau / systemd
```

### 2.4 Sentry — identifier le pattern

→ `https://sentry.io` → Issues filtrer par environment=production + dernière heure

Si > 10 issues en 10 min → probable régression du dernier deploy.

---

## Phase 3 — Mitigate

### Cas A : Régression du dernier deploy

```bash
# Trouver le commit précédent
git log --oneline -5

# Rollback côté code
cd /opt/arytrano
git checkout <commit-précédent>
docker compose -f docker-compose.prod.yml up -d app

# Vérifier
curl https://arytrano.com/api/health
```

Communiquer dans Slack `#ops` : « Rollback to commit X en cours, ETA 5 min ».

### Cas B : DB injoignable

```bash
# Postgres tourne-t-il ?
docker compose -f docker-compose.prod.yml ps postgres
# Si stopped :
docker compose -f docker-compose.prod.yml restart postgres

# Si crashloop : voir les logs
docker compose -f docker-compose.prod.yml logs --tail 200 postgres
```

Si volume corrompu → **restore depuis backup** (`restore-db.md`).

### Cas C : Disque plein

```bash
# Identifier ce qui prend de la place
du -sh /var/lib/docker /var/log /opt/arytrano

# Cleanup Docker
docker system prune -af --volumes
docker image prune -af

# Cleanup logs
journalctl --vacuum-size=200M
```

### Cas D : OOM (out of memory)

```bash
# Voir les kills récents
dmesg | grep -i 'killed process'

# Limiter les conteneurs si pas déjà fait dans docker-compose
# (mem_limit + memswap_limit)
```

Si récurrent → upgrade VPS (Contabo a un upgrade live, ~10 min downtime).

### Cas E : Attaque DDoS / scraping

```bash
# Voir les top IPs dans les logs Caddy
docker compose -f docker-compose.prod.yml logs caddy | \
  grep -oE '"remote_ip":"[^"]*"' | sort | uniq -c | sort -rn | head -10

# Block IP via UFW
ufw deny from <ip>
```

Si > 100 IPs → activer Cloudflare proxy devant le domaine (`Settings > DNS > orange cloud`).

---

## Phase 4 — Communicate

### Pendant l'incident

- Slack `#ops` : update toutes les 15 min
- Si SEV-1 dépasse 30 min : tweet/post Facebook « Maintenance en cours »
- Si paiement affecté : email les owners avec transaction in-flight

### Banner site-wide

Pour montrer un message sur le site sans déployer du code, ajouter un fichier
flag :
```bash
# Sur le VPS
echo "Maintenance en cours, retour dans 15 min" > /var/lib/arytrano/banner.txt
```

> ℹ️ Composant Banner à écrire en suivi — lit le fichier et affiche au-dessus
> du header s'il existe. À faire si on a un incident long.

---

## Phase 5 — Resolve & Postmortem

### Resolve

- Vérifier `/api/health` revenu OK
- Vérifier que les utilisateurs peuvent : se connecter, voir une annonce, contacter
- Smoke test des flows critiques (à scripter dans `scripts/smoke-test.sh`)
- Update Slack `#ops` : « Résolu à HH:MM »
- Ferme le banner site-wide

### Postmortem (24h après)

Document `public/docs/postmortems/YYYY-MM-DD-<slug>.md` :
1. **Timeline** : detect / triage / mitigate / resolve avec timestamps
2. **Impact** : combien d'utilisateurs, combien de temps, qu'est-ce qui était cassé
3. **Root cause** : pourquoi c'est arrivé
4. **Resolution** : ce qu'on a fait
5. **Action items** : ce qu'on change pour éviter (ticket par item)

Pas de blame culture — les humains se trompent, le système doit récupérer.

---

## Contacts d'escalation

| Niveau | Qui | Comment |
|--------|-----|---------|
| Tech lead | (toi pour l'instant) | Slack DM + WhatsApp |
| Hosting Contabo support | https://contabo.com/support | Ticket portal, ~4h response |
| Cloudinary | https://support.cloudinary.com | Email |
| Sentry | status.sentry.io | Status page |
| Cloudflare R2 (backups) | community.cloudflare.com | Forum / X |

---

## Outils utiles

```bash
# Tail tous les logs en parallèle
docker compose -f docker-compose.prod.yml logs -f --tail 0

# Stats live (CPU/RAM/network) par container
docker stats

# Voir les requêtes HTTP en cours
ss -tn state established '( sport = :443 or sport = :80 )' | head -20

# Compter les requests/minute sur l'app
docker compose -f docker-compose.prod.yml logs --since 1m caddy | wc -l

# Tester une URL depuis le VPS lui-même
curl -i -H 'User-Agent: ops-test' https://arytrano.com/api/health
```

---

## Related runbooks

- `restore-db.md` — DB restore
- `monitoring.md` — Sentry + alerts setup (T-056)
- `contabo-deployment.md` — full deploy doc

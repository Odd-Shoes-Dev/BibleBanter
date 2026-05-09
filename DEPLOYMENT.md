# Bible Banter — Deployment & Operations Guide

## Architecture

| Layer | Service | Location |
|-------|---------|----------|
| Frontend | Vercel | `https://bible-banter.vercel.app` |
| Backend | Docker on DigitalOcean VPS | `https://178-128-249-159.sslip.io` |
| Database | PostgreSQL (Docker) | Local on VPS |
| Reverse proxy | Nginx + Let's Encrypt SSL | VPS port 80/443 |
| Chat (separate) | Rocket.Chat + MongoDB | `/root/odd-shoes-chat/` on VPS |

---

## VPS Details

- **Provider:** DigitalOcean
- **IP:** `178.128.249.159`
- **OS:** Ubuntu 22.04 LTS
- **Domain:** `178-128-249-159.sslip.io` (free SSL via sslip.io + Let's Encrypt)
- **SSL expires:** 2026-08-07 (auto-renews via certbot)

---

## Project Location on VPS

```
/opt/bible-banter/
├── docker-compose.yml   # backend + postgres services
├── Dockerfile           # backend image
├── .env                 # secrets (never commit this)
└── ...                  # cloned from GitHub
```

---

## Environment Variables (`.env` on VPS)

```env
DATABASE_URL=postgresql://biblebanter:<password>@db:5432/biblebanter
DB_PASSWORD=<postgres password>
JWT_SECRET=<long random secret>
PORT=3001
GEMINI_API_KEY=<gemini key>
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<brevo smtp user>
SMTP_PASS=<brevo smtp pass>
SMTP_FROM=Bible Banter <shadrackssenkaayi21@gmail.com>
BREVO_API_KEY=<brevo api key>
ALLOWED_ORIGINS=https://bible-banter.vercel.app
FRONTEND_URL=https://bible-banter.vercel.app
NODE_ENV=production
```

---

## Deploying Updates

SSH into the VPS, then:

```bash
cd /opt/bible-banter
git pull
docker compose up -d --build
```

- The old container keeps running while the new image builds
- Docker swaps it only after a successful build
- ~1-2 seconds of downtime during the swap

---

## Checking Status

```bash
# Are containers running?
cd /opt/bible-banter && docker compose ps

# Watch live logs
docker compose logs -f

# Quick API health check
curl -s http://localhost:3001/api/sets | head -c 100

# CPU/memory usage
docker stats
```

---

## Restarting Services

```bash
# Bible Banter backend + database
cd /opt/bible-banter && docker compose restart

# Rocket.Chat
cd /root/odd-shoes-chat && docker compose restart

# Nginx
systemctl restart nginx
```

---

## Database

- **Engine:** PostgreSQL 16 (Docker)
- **User:** `biblebanter`
- **Database:** `biblebanter`
- **Data volume:** `bible-banter_postgres_data` (persists across restarts)
- Migrated from Neon on 2026-05-09

### Connect to database directly
```bash
cd /opt/bible-banter
docker compose exec db psql -U biblebanter
```

### Manual backup
```bash
docker compose exec db pg_dump -U biblebanter biblebanter > /opt/bible-banter/backup-$(date +%Y%m%d).sql
```

---

## Disk Management

Docker logs can grow large. Logs are capped at 50MB per container (3 files) via `/etc/docker/daemon.json`.

To manually clear a container's log:
```bash
truncate -s 0 /var/lib/docker/containers/<container-id>/<container-id>-json.log
```

To see disk usage breakdown:
```bash
du -sh /var/lib/docker/*
docker system prune -a   # remove unused images/cache
```

---

## Nginx Config

```
/etc/nginx/sites-available/bible-banter
```

Proxies all traffic on `178-128-249-159.sslip.io` → `localhost:3001`.
SSL managed by certbot (auto-renews).

---

## Frontend (Vercel)

- **Repo:** `github.com/shadrack-ss/BibleBanter` (client/ directory)
- **Env var:** `VITE_BACKEND_URL=https://178-128-249-159.sslip.io`
- Redeploy: push to `main` branch (auto-deploys) or trigger manually in Vercel dashboard

---

## SSL Certificate Renewal

Certbot auto-renews. To manually renew:
```bash
certbot renew
systemctl reload nginx
```

---

## Issues Encountered & Fixes

| Issue | Fix |
|-------|-----|
| `postinstall.js` failing on Node 22 | Added `shell: true` to `spawnSync` |
| Prisma `libssl.so.1.1` missing in Alpine | Switched Dockerfile base to `node:20-slim` |
| `sw.js` returning HTML instead of JS on Vercel | Added explicit pass-through rules in `vercel.json` before the SPA catch-all rewrite |
| All API routes returning 501 | Replaced stub route files with real implementations from original project |
| MongoDB logs filling 5.2GB of disk | Truncated log + added Docker log size limits in `daemon.json` |
| `pg_dump` version mismatch (Neon is PG17) | Used `postgres:17-alpine` Docker image for the dump |
| Neon roles missing on restore | Used `--no-owner --no-privileges` flags on `pg_restore` |

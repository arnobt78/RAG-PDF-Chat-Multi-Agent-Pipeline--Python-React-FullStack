# Backend Subdomain Setup – arnobmahmud.com (Coolify + Traefik + Let’s Encrypt)

**Purpose:** Add a backend under a subdomain of **arnobmahmud.com** (e.g. `hotel-booking-backend.arnobmahmud.com`, `food-ordering-backend.arnobmahmud.com`) on a Hetzner VPS with Coolify, using **two router pairs only**: **sslip.io** (Coolify default/fallback) and **arnobmahmud.com** (production URL). No duckdns or other third-level domains.

**When you attach this file to another project:** Replace placeholders with that project’s values (subdomain name, frontend URL, Coolify sslip hostname, backend port). Use the “Project reference” table and “Container labels (full block)” section as the single source for config.

---

## For AI / New project context

- **Domain:** arnobmahmud.com (IONOS).
- **VPS:** 77.42.71.87 (Hetzner); Coolify runs on this server.
- **Pattern:** One A record per backend subdomain → 77.42.71.87. Coolify runs the app; Traefik (via container labels) serves it on:
  - **sslip.io** (Coolify-generated URL, keep as fallback).
  - **&lt;subdomain&gt;.arnobmahmud.com** (production; Let’s Encrypt HTTPS).
- **Backend env:** BACKEND_URL and FRONTEND_URL in Coolify; app port (e.g. 5000) in Traefik labels.
- **Frontend env:** VITE_API_BASE_URL in Vercel/Netlify = backend production URL.
- **Google OAuth:** Authorized JavaScript origins = frontend URL; Authorized redirect URIs = `https://<backend-subdomain>.arnobmahmud.com/api/auth/callback/google` (or equivalent path).
- **Swagger:** No separate config; it uses BACKEND_URL from the backend.
- **SSL:** Let’s Encrypt via Traefik (`certresolver=letsencrypt`); renewal is automatic before 90 days.

---

## Project reference (hotel-booking, food-ordering, sernitas-care)

| Item | hotel-booking | food-ordering | sernitas-care |
|------|----------------|----------------|----------------|
| **Backend subdomain** | hotel-booking-backend.arnobmahmud.com | food-ordering-backend.arnobmahmud.com | sernitas-care-backend.arnobmahmud.com |
| **IONOS A hostname** | hotel-booking-backend | food-ordering-backend | sernitas-care-backend |
| **Frontend URL (production)** | https://hotel-mern-booking.vercel.app | (Vercel/Netlify URL) | (Netlify URL) |
| **Coolify app port** | 3000 | 3000 | 3000 |
| **Ports Mappings (Coolify)** | 5001:3000 | 5002:3000 | 5000:3000 |
| **Coolify sslip hostname** | gskk40o80o8go0s4s8ooogos | ko4ooo4g0gkwwwcgkw80gwow | fc4gwcsk4s8sggk0kog4kss4 |
| **BACKEND_URL (Coolify)** | https://hotel-booking-backend.arnobmahmud.com | https://food-ordering-backend.arnobmahmud.com | https://sernitas-care-backend.arnobmahmud.com |
| **VITE_API_BASE_URL (Vercel/Netlify)** | https://hotel-booking-backend.arnobmahmud.com | https://food-ordering-backend.arnobmahmud.com | https://sernitas-care-backend.arnobmahmud.com |
| **Google redirect URI** | …/hotel-booking-backend…/callback/google | …/food-ordering-backend…/callback/google | …/sernitas-care-backend…/callback/google |

---

## VRPTW Solver backends (vrptw-api + vrptw-ils)

Same VPS (77.42.71.87) and Coolify; **two** backend apps from the same monorepo (Option A: main API + ILS API).

| Item | vrptw-api (main) | vrptw-ils |
|------|------------------|-----------|
| **Backend subdomain** | vrptw-api.arnobmahmud.com | vrptw-ils.arnobmahmud.com |
| **IONOS A hostname** | vrptw-api | vrptw-ils |
| **Frontend URL (production)** | https://vrptw-solver.vercel.app (or your Vercel URL) | same |
| **Coolify container port** | 3000 (matches read-only "Ports Exposes") | 3000 |
| **Ports Mappings (Coolify)** | 5003:3000 | 5004:3000 |
| **Coolify sslip hostname** | jgskkwggkok0c8g4gcwogg4s | skcok8o0ok0w0wwoo4g0woog |
| **Build args** | `REQUIREMENTS_FILE=requirements.txt`, `BACKEND_ALGOS=hgs,gls,aco,sa` (RAG installed by default) | `REQUIREMENTS_FILE=requirements-ils.txt`, `BACKEND_ALGOS=ils`, `INSTALL_RAG=0` (no RAG; saves image size) |
| **Env (Coolify)** | **PORT=3000**, CORS_ORIGINS, BACKEND_ALGOS=hgs,gls,aco,sa, DATASET_PATH=dataset, DEFAULT_RUNTIME=120, API keys (optional) | Same but **PORT=3000**, BACKEND_ALGOS=ils |
| **CORS_ORIGINS** | Must include `https://vrptw-solver.vercel.app` (no trailing slash) on **both** containers | same |
| **VITE_API_URL (Vercel)** | https://vrptw-api.arnobmahmud.com | — |
| **VITE_ILS_API_URL (Vercel)** | — | https://vrptw-ils.arnobmahmud.com |

**Notes:**

- **Repo:** Same GitHub repo; Base Directory `backend`; one Dockerfile, build args choose main vs ILS image.
- **Port 3000:** Coolify’s "Ports Exposes" is read-only (often 3000). To avoid "PORT mismatch" warnings, set **PORT=3000** in Coolify env, **Ports Mappings** to `5003:3000` / `5004:3000`, and use **3000** in all container labels (loadbalancer.server.port and caddy upstreams). The app reads `PORT` from env (`run_server.py`); no code change.
- **RAG:** Both images install `requirements-rag.txt` (RAG loads in background at startup; index is one-time). Memory: 2048m for main, 1024m for ILS is OK; 2048m for both is safer.
- **Healthcheck:** Disabled in Coolify (avoids false unhealthy; API works).
- **Container labels:** Use the same Traefik/Caddy block as in §2; replace SUBDOMAIN, SSLP_HOST, and **PORT=3000** (see ready-made blocks below for vrptw-api and vrptw-ils).
- **Check:** `curl -s https://vrptw-api.arnobmahmud.com/api/health` and `curl -s https://vrptw-ils.arnobmahmud.com/api/health`.

**Ready-made container labels (port 3000) – vrptw-api:**

```ini
traefik.enable=true
traefik.http.middlewares.gzip.compress=true
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
traefik.http.routers.http-0-jgskkwggkok0c8g4gcwogg4s.entryPoints=http
traefik.http.routers.http-0-jgskkwggkok0c8g4gcwogg4s.middlewares=gzip
traefik.http.routers.http-0-jgskkwggkok0c8g4gcwogg4s.rule=Host(`jgskkwggkok0c8g4gcwogg4s.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.http-0-jgskkwggkok0c8g4gcwogg4s.service=http-0-jgskkwggkok0c8g4gcwogg4s
traefik.http.services.http-0-jgskkwggkok0c8g4gcwogg4s.loadbalancer.server.port=3000
traefik.http.routers.https-0-jgskkwggkok0c8g4gcwogg4s.entryPoints=https
traefik.http.routers.https-0-jgskkwggkok0c8g4gcwogg4s.middlewares=gzip
traefik.http.routers.https-0-jgskkwggkok0c8g4gcwogg4s.rule=Host(`jgskkwggkok0c8g4gcwogg4s.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.https-0-jgskkwggkok0c8g4gcwogg4s.service=http-0-jgskkwggkok0c8g4gcwogg4s
traefik.http.routers.https-0-jgskkwggkok0c8g4gcwogg4s.tls=true
traefik.http.routers.https-0-jgskkwggkok0c8g4gcwogg4s.tls.certresolver=letsencrypt
traefik.http.routers.http-1-vrptw-api-arnob.entryPoints=http
traefik.http.routers.http-1-vrptw-api-arnob.middlewares=gzip
traefik.http.routers.http-1-vrptw-api-arnob.rule=Host(`vrptw-api.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.http-1-vrptw-api-arnob.service=http-1-vrptw-api-arnob
traefik.http.services.http-1-vrptw-api-arnob.loadbalancer.server.port=3000
traefik.http.routers.https-1-vrptw-api-arnob.entryPoints=https
traefik.http.routers.https-1-vrptw-api-arnob.middlewares=gzip
traefik.http.routers.https-1-vrptw-api-arnob.rule=Host(`vrptw-api.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.https-1-vrptw-api-arnob.service=http-1-vrptw-api-arnob
traefik.http.routers.https-1-vrptw-api-arnob.tls=true
traefik.http.routers.https-1-vrptw-api-arnob.tls.certresolver=letsencrypt
caddy_0.encode=zstd gzip
caddy_0.handle_path.0_reverse_proxy={{upstreams 3000}}
caddy_0.handle_path=/*
caddy_0.header=-Server
caddy_0.try_files={path} /index.html /index.php
caddy_0=http://vrptw-api.arnobmahmud.com
caddy_ingress_network=coolify
```

**Ready-made container labels (port 3000) – vrptw-ils:**

```ini
traefik.enable=true
traefik.http.middlewares.gzip.compress=true
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
traefik.http.routers.http-0-skcok8o0ok0w0wwoo4g0woog.entryPoints=http
traefik.http.routers.http-0-skcok8o0ok0w0wwoo4g0woog.middlewares=gzip
traefik.http.routers.http-0-skcok8o0ok0w0wwoo4g0woog.rule=Host(`skcok8o0ok0w0wwoo4g0woog.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.http-0-skcok8o0ok0w0wwoo4g0woog.service=http-0-skcok8o0ok0w0wwoo4g0woog
traefik.http.services.http-0-skcok8o0ok0w0wwoo4g0woog.loadbalancer.server.port=3000
traefik.http.routers.https-0-skcok8o0ok0w0wwoo4g0woog.entryPoints=https
traefik.http.routers.https-0-skcok8o0ok0w0wwoo4g0woog.middlewares=gzip
traefik.http.routers.https-0-skcok8o0ok0w0wwoo4g0woog.rule=Host(`skcok8o0ok0w0wwoo4g0woog.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.https-0-skcok8o0ok0w0wwoo4g0woog.service=http-0-skcok8o0ok0w0wwoo4g0woog
traefik.http.routers.https-0-skcok8o0ok0w0wwoo4g0woog.tls=true
traefik.http.routers.https-0-skcok8o0ok0w0wwoo4g0woog.tls.certresolver=letsencrypt
traefik.http.routers.http-1-vrptw-ils-arnob.entryPoints=http
traefik.http.routers.http-1-vrptw-ils-arnob.middlewares=gzip
traefik.http.routers.http-1-vrptw-ils-arnob.rule=Host(`vrptw-ils.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.http-1-vrptw-ils-arnob.service=http-1-vrptw-ils-arnob
traefik.http.services.http-1-vrptw-ils-arnob.loadbalancer.server.port=3000
traefik.http.routers.https-1-vrptw-ils-arnob.entryPoints=https
traefik.http.routers.https-1-vrptw-ils-arnob.middlewares=gzip
traefik.http.routers.https-1-vrptw-ils-arnob.rule=Host(`vrptw-ils.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.https-1-vrptw-ils-arnob.service=http-1-vrptw-ils-arnob
traefik.http.routers.https-1-vrptw-ils-arnob.tls=true
traefik.http.routers.https-1-vrptw-ils-arnob.tls.certresolver=letsencrypt
caddy_0.encode=zstd gzip
caddy_0.handle_path.0_reverse_proxy={{upstreams 3000}}
caddy_0.handle_path=/*
caddy_0.header=-Server
caddy_0.try_files={path} /index.html /index.php
caddy_0=http://vrptw-ils.arnobmahmud.com
caddy_ingress_network=coolify
```

**Backend implementation (this repo):**

- **404 log noise:** `backend/app/log_config.py` defines `Skip404AccessFilter` so uvicorn access logs drop lines containing `" 404 "` (probes/bots). Server is started via `backend/run_server.py` with `log_config=get_log_config()`; Dockerfile CMD uses `python run_server.py`.
- **RAG:** RAG bootstrap runs in a background thread (`backend/app/main.py`) so startup does not block and cause Bad Gateway. `rag_available()` in `backend/app/services/rag_service.py` uses a non-blocking lock so `/api/ai/rag/status` returns immediately (“RAG is loading…” or `available: true`).

---

## 1. DNS (IONOS)

1. IONOS → **Domains & SSL** → **arnobmahmud.com** → **DNS** tab.
2. **Record hinzufügen** (Add record).
3. **Type:** `A`  
   **Hostname:** `<subdomain>` (e.g. `hotel-booking-backend` or `food-ordering-backend`)  
   **Points to / Value:** `77.42.71.87`  
   **TTL:** e.g. 1 hour.
4. Save.

Check after a few minutes:

```bash
dig +short <subdomain>.arnobmahmud.com
# Expected: 77.42.71.87
```

---

## 2. Coolify – Container labels (Traefik + Caddy)

Use **two router pairs only**: sslip.io (index 0) and arnobmahmud.com (index 1). Replace:

- `SUBDOMAIN` → e.g. `hotel-booking-backend` or `food-ordering-backend`
- `SSLP_HOST` → Coolify’s sslip hostname for this app (e.g. `gskk40o80o8go0s4s8ooogos` or `ko4ooo4g0gkwwwcgkw80gwow`)
- `PORT` → backend port (e.g. `5000`)

**Full block (copy-paste, then replace placeholders):**

```ini
traefik.enable=true
traefik.http.middlewares.gzip.compress=true
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
traefik.http.routers.http-0-SSLP_HOST.entryPoints=http
traefik.http.routers.http-0-SSLP_HOST.middlewares=gzip
traefik.http.routers.http-0-SSLP_HOST.rule=Host(`SSLP_HOST.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.http-0-SSLP_HOST.service=http-0-SSLP_HOST
traefik.http.services.http-0-SSLP_HOST.loadbalancer.server.port=PORT
traefik.http.routers.https-0-SSLP_HOST.entryPoints=https
traefik.http.routers.https-0-SSLP_HOST.middlewares=gzip
traefik.http.routers.https-0-SSLP_HOST.rule=Host(`SSLP_HOST.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.https-0-SSLP_HOST.service=http-0-SSLP_HOST
traefik.http.routers.https-0-SSLP_HOST.tls=true
traefik.http.routers.https-0-SSLP_HOST.tls.certresolver=letsencrypt
traefik.http.routers.http-1-SUBDOMAIN-arnob.entryPoints=http
traefik.http.routers.http-1-SUBDOMAIN-arnob.middlewares=gzip
traefik.http.routers.http-1-SUBDOMAIN-arnob.rule=Host(`SUBDOMAIN.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.http-1-SUBDOMAIN-arnob.service=http-1-SUBDOMAIN-arnob
traefik.http.services.http-1-SUBDOMAIN-arnob.loadbalancer.server.port=PORT
traefik.http.routers.https-1-SUBDOMAIN-arnob.entryPoints=https
traefik.http.routers.https-1-SUBDOMAIN-arnob.middlewares=gzip
traefik.http.routers.https-1-SUBDOMAIN-arnob.rule=Host(`SUBDOMAIN.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.https-1-SUBDOMAIN-arnob.service=http-1-SUBDOMAIN-arnob
traefik.http.routers.https-1-SUBDOMAIN-arnob.tls=true
traefik.http.routers.https-1-SUBDOMAIN-arnob.tls.certresolver=letsencrypt
caddy_0.encode=zstd gzip
caddy_0.handle_path.0_reverse_proxy={{upstreams PORT}}
caddy_0.handle_path=/*
caddy_0.header=-Server
caddy_0.try_files={path} /index.html /index.php
caddy_0=http://SUBDOMAIN.arnobmahmud.com
caddy_ingress_network=coolify
```

**Example – hotel-booking-backend (port 3000; set PORT=3000 and Ports Mappings 5001:3000 in Coolify):**

```ini
traefik.enable=true
traefik.http.middlewares.gzip.compress=true
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
traefik.http.routers.http-0-gskk40o80o8go0s4s8ooogos.entryPoints=http
traefik.http.routers.http-0-gskk40o80o8go0s4s8ooogos.middlewares=gzip
traefik.http.routers.http-0-gskk40o80o8go0s4s8ooogos.rule=Host(`gskk40o80o8go0s4s8ooogos.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.http-0-gskk40o80o8go0s4s8ooogos.service=http-0-gskk40o80o8go0s4s8ooogos
traefik.http.services.http-0-gskk40o80o8go0s4s8ooogos.loadbalancer.server.port=3000
traefik.http.routers.https-0-gskk40o80o8go0s4s8ooogos.entryPoints=https
traefik.http.routers.https-0-gskk40o80o8go0s4s8ooogos.middlewares=gzip
traefik.http.routers.https-0-gskk40o80o8go0s4s8ooogos.rule=Host(`gskk40o80o8go0s4s8ooogos.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.https-0-gskk40o80o8go0s4s8ooogos.service=http-0-gskk40o80o8go0s4s8ooogos
traefik.http.routers.https-0-gskk40o80o8go0s4s8ooogos.tls=true
traefik.http.routers.https-0-gskk40o80o8go0s4s8ooogos.tls.certresolver=letsencrypt
traefik.http.routers.http-1-hotel-booking-arnob.entryPoints=http
traefik.http.routers.http-1-hotel-booking-arnob.middlewares=gzip
traefik.http.routers.http-1-hotel-booking-arnob.rule=Host(`hotel-booking-backend.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.http-1-hotel-booking-arnob.service=http-1-hotel-booking-arnob
traefik.http.services.http-1-hotel-booking-arnob.loadbalancer.server.port=3000
traefik.http.routers.https-1-hotel-booking-arnob.entryPoints=https
traefik.http.routers.https-1-hotel-booking-arnob.middlewares=gzip
traefik.http.routers.https-1-hotel-booking-arnob.rule=Host(`hotel-booking-backend.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.https-1-hotel-booking-arnob.service=http-1-hotel-booking-arnob
traefik.http.routers.https-1-hotel-booking-arnob.tls=true
traefik.http.routers.https-1-hotel-booking-arnob.tls.certresolver=letsencrypt
caddy_0.encode=zstd gzip
caddy_0.handle_path.0_reverse_proxy={{upstreams 3000}}
caddy_0.handle_path=/*
caddy_0.header=-Server
caddy_0.try_files={path} /index.html /index.php
caddy_0=http://hotel-booking-backend.arnobmahmud.com
caddy_ingress_network=coolify
```

**Example – food-ordering-backend (port 3000; set PORT=3000 and Ports Mappings 5002:3000 in Coolify):**

```ini
traefik.enable=true
traefik.http.middlewares.gzip.compress=true
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
traefik.http.routers.http-0-ko4ooo4g0gkwwwcgkw80gwow.entryPoints=http
traefik.http.routers.http-0-ko4ooo4g0gkwwwcgkw80gwow.middlewares=gzip
traefik.http.routers.http-0-ko4ooo4g0gkwwwcgkw80gwow.rule=Host(`ko4ooo4g0gkwwwcgkw80gwow.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.http-0-ko4ooo4g0gkwwwcgkw80gwow.service=http-0-ko4ooo4g0gkwwwcgkw80gwow
traefik.http.services.http-0-ko4ooo4g0gkwwwcgkw80gwow.loadbalancer.server.port=3000
traefik.http.routers.https-0-ko4ooo4g0gkwwwcgkw80gwow.entryPoints=https
traefik.http.routers.https-0-ko4ooo4g0gkwwwcgkw80gwow.middlewares=gzip
traefik.http.routers.https-0-ko4ooo4g0gkwwwcgkw80gwow.rule=Host(`ko4ooo4g0gkwwwcgkw80gwow.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.https-0-ko4ooo4g0gkwwwcgkw80gwow.service=http-0-ko4ooo4g0gkwwwcgkw80gwow
traefik.http.routers.https-0-ko4ooo4g0gkwwwcgkw80gwow.tls=true
traefik.http.routers.https-0-ko4ooo4g0gkwwwcgkw80gwow.tls.certresolver=letsencrypt
traefik.http.routers.http-1-food-ordering-arnob.entryPoints=http
traefik.http.routers.http-1-food-ordering-arnob.middlewares=gzip
traefik.http.routers.http-1-food-ordering-arnob.rule=Host(`food-ordering-backend.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.http-1-food-ordering-arnob.service=http-1-food-ordering-arnob
traefik.http.services.http-1-food-ordering-arnob.loadbalancer.server.port=3000
traefik.http.routers.https-1-food-ordering-arnob.entryPoints=https
traefik.http.routers.https-1-food-ordering-arnob.middlewares=gzip
traefik.http.routers.https-1-food-ordering-arnob.rule=Host(`food-ordering-backend.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.https-1-food-ordering-arnob.service=http-1-food-ordering-arnob
traefik.http.routers.https-1-food-ordering-arnob.tls=true
traefik.http.routers.https-1-food-ordering-arnob.tls.certresolver=letsencrypt
caddy_0.encode=zstd gzip
caddy_0.handle_path.0_reverse_proxy={{upstreams 3000}}
caddy_0.handle_path=/*
caddy_0.header=-Server
caddy_0.try_files={path} /index.html /index.php
caddy_0=http://food-ordering-backend.arnobmahmud.com
caddy_ingress_network=coolify
```

**Example – sernitas-care-backend (port 3000; set PORT=3000 and Ports Mappings 5000:3000 in Coolify):**

```ini
traefik.enable=true
traefik.http.middlewares.gzip.compress=true
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
traefik.http.routers.http-0-fc4gwcsk4s8sggk0kog4kss4.entryPoints=http
traefik.http.routers.http-0-fc4gwcsk4s8sggk0kog4kss4.middlewares=gzip
traefik.http.routers.http-0-fc4gwcsk4s8sggk0kog4kss4.rule=Host(`fc4gwcsk4s8sggk0kog4kss4.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.http-0-fc4gwcsk4s8sggk0kog4kss4.service=http-0-fc4gwcsk4s8sggk0kog4kss4
traefik.http.services.http-0-fc4gwcsk4s8sggk0kog4kss4.loadbalancer.server.port=3000
traefik.http.routers.https-0-fc4gwcsk4s8sggk0kog4kss4.entryPoints=https
traefik.http.routers.https-0-fc4gwcsk4s8sggk0kog4kss4.middlewares=gzip
traefik.http.routers.https-0-fc4gwcsk4s8sggk0kog4kss4.rule=Host(`fc4gwcsk4s8sggk0kog4kss4.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.https-0-fc4gwcsk4s8sggk0kog4kss4.service=http-0-fc4gwcsk4s8sggk0kog4kss4
traefik.http.routers.https-0-fc4gwcsk4s8sggk0kog4kss4.tls=true
traefik.http.routers.https-0-fc4gwcsk4s8sggk0kog4kss4.tls.certresolver=letsencrypt
traefik.http.routers.http-1-sernitas-care-arnob.entryPoints=http
traefik.http.routers.http-1-sernitas-care-arnob.middlewares=gzip
traefik.http.routers.http-1-sernitas-care-arnob.rule=Host(`sernitas-care-backend.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.http-1-sernitas-care-arnob.service=http-1-sernitas-care-arnob
traefik.http.services.http-1-sernitas-care-arnob.loadbalancer.server.port=3000
traefik.http.routers.https-1-sernitas-care-arnob.entryPoints=https
traefik.http.routers.https-1-sernitas-care-arnob.middlewares=gzip
traefik.http.routers.https-1-sernitas-care-arnob.rule=Host(`sernitas-care-backend.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.https-1-sernitas-care-arnob.service=http-1-sernitas-care-arnob
traefik.http.routers.https-1-sernitas-care-arnob.tls=true
traefik.http.routers.https-1-sernitas-care-arnob.tls.certresolver=letsencrypt
caddy_0.encode=zstd gzip
caddy_0.handle_path.0_reverse_proxy={{upstreams 3000}}
caddy_0.handle_path=/*
caddy_0.header=-Server
caddy_0.try_files={path} /index.html /index.php
caddy_0=http://sernitas-care-backend.arnobmahmud.com
caddy_ingress_network=coolify
```

After pasting labels in Coolify, **redeploy** the service so Traefik reloads them.

---

## 3. Coolify – Environment variables (backend)

In the backend application in Coolify → **Configuration** → **Environment Variables** (Production):

| Variable | Value | Notes |
|----------|--------|--------|
| **BACKEND_URL** | `https://<subdomain>.arnobmahmud.com` | No trailing slash. Used by Swagger, OAuth redirects, etc. |
| **FRONTEND_URL** | `https://<your-frontend-domain>` | e.g. Vercel/Netlify URL for CORS and callbacks. |

- **Available at Runtime:** Yes (checked).
- **Available at Buildtime:** Not required for these.
- Set any other env the app needs (DB, JWT, Stripe, Cloudinary, etc.) in the same place.

Redeploy after changing env vars.

---

## 4. Frontend (Vercel / Netlify) – API base URL

- **Variable:** `VITE_API_BASE_URL`
- **Value:** `https://<subdomain>.arnobmahmud.com` (no trailing slash)
- **Environment:** Production (and Preview if you want).

Redeploy the frontend so the new value is baked into the build.

---

## 5. Google Cloud Console (OAuth)

For “Sign in with Google”:

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials** → your OAuth 2.0 Client ID.
2. **Authorized JavaScript origins**
   - Add your frontend URL, e.g. `https://hotel-mern-booking.vercel.app`.
3. **Authorized redirect URIs**
   - Add: `https://<subdomain>.arnobmahmud.com/api/auth/callback/google`  
   - (Replace `<subdomain>` with e.g. `hotel-booking-backend` or `food-ordering-backend`; use the exact path your backend uses for the Google callback.)

Save. No backend redeploy needed; backend already uses BACKEND_URL for redirects.

---

## 6. Swagger / API docs

- No separate Swagger config is needed.
- Swagger UI is served by the backend and uses **BACKEND_URL** (or the request host). As long as BACKEND_URL in Coolify is `https://<subdomain>.arnobmahmud.com`, docs and “Try it out” will use the correct base URL.
- URL: `https://<subdomain>.arnobmahmud.com/api-docs/` (or whatever path your backend exposes).

---

## 7. Let’s Encrypt and SSL renewal

- Traefik uses **certresolver=letsencrypt** in the HTTPS router labels.
- Coolify/Traefik will **renew certificates automatically** before they expire (Let’s Encrypt certs are valid 90 days; renewal typically happens around 30 days before expiry).
- No manual action needed. After first deploy, the first certificate may take a few seconds to be issued.

---

## 8. Verify SSL (Let’s Encrypt)

From your machine:

```bash
# Hotel booking backend
openssl s_client -connect hotel-booking-backend.arnobmahmud.com:443 -servername hotel-booking-backend.arnobmahmud.com </dev/null 2>/dev/null | openssl x509 -noout -text | grep -E "Issuer:|Not Before|Not After"

# Food ordering backend
openssl s_client -connect food-ordering-backend.arnobmahmud.com:443 -servername food-ordering-backend.arnobmahmud.com </dev/null 2>/dev/null | openssl x509 -noout -text | grep -E "Issuer:|Not Before|Not After"
```

Expected: **Issuer: C=US, O=Let's Encrypt, CN=R12** (or similar Let’s Encrypt CA), and **Not After** about 90 days from **Not Before**.

---

## 9. Checklist (new project)

- [ ] IONOS: A record `<subdomain>` → `77.42.71.87`
- [ ] Coolify: Container labels updated (sslip.io + `<subdomain>.arnobmahmud.com` only), PORT correct
- [ ] Coolify: BACKEND_URL and FRONTEND_URL set; redeploy
- [ ] Vercel/Netlify: VITE_API_BASE_URL = `https://<subdomain>.arnobmahmud.com`; redeploy
- [ ] Google Cloud: Authorized JavaScript origins (frontend); Authorized redirect URIs `https://<subdomain>.arnobmahmud.com/.../callback/google`
- [ ] Browser: `https://<subdomain>.arnobmahmud.com` loads, padlock OK; login (email + Google) works
- [ ] Optional: run `openssl s_client` to confirm Let’s Encrypt issuer and expiry

---

## 10. Summary

- **Two router pairs:** sslip.io (Coolify default) + `<subdomain>.arnobmahmud.com` (production).
- **DNS:** One A record per backend subdomain → 77.42.71.87.
- **Backend:** BACKEND_URL + FRONTEND_URL in Coolify; Swagger follows BACKEND_URL.
- **Frontend:** VITE_API_BASE_URL in Vercel/Netlify.
- **Google OAuth:** Frontend origin + backend redirect URI to `https://<subdomain>.arnobmahmud.com`.
- **SSL:** Let’s Encrypt via Traefik; renewal automatic before 90 days.

Attach this file to another project and replace `<subdomain>`, frontend URL, SSLP_HOST, and PORT with that project’s values to replicate the setup.

---

## 11. Blog-to-Audio reference (April 2026)

Use this as a ready-made template for the `blog-to-audio` stack:

- **Backend subdomain (IONOS A record):** `blog-audio-backend` → `77.42.71.87`
- **Backend URL (production):** `https://blog-audio-backend.arnobmahmud.com`
- **Coolify base settings:** Base Directory `/`, Dockerfile Location `/Dockerfile`, container port `3000`, Ports Mappings `5005:3000`
- **Coolify env (minimum):** `PORT=3000`, `CORS_ORIGINS=https://blog-reader-tts.vercel.app`
- **Vercel (frontend):** Root Directory `frontend`, env `VITE_API_BASE_URL=https://blog-audio-backend.arnobmahmud.com` (no trailing slash)

### Known-good container labels (port 3000)

```ini
traefik.enable=true
traefik.http.middlewares.gzip.compress=true
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
traefik.http.routers.http-0-r8440gs8s8s0cg0kks00g4os.entryPoints=http
traefik.http.routers.http-0-r8440gs8s8s0cg0kks00g4os.middlewares=gzip
traefik.http.routers.http-0-r8440gs8s8s0cg0kks00g4os.rule=Host(`r8440gs8s8s0cg0kks00g4os.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.http-0-r8440gs8s8s0cg0kks00g4os.service=http-0-r8440gs8s8s0cg0kks00g4os
traefik.http.services.http-0-r8440gs8s8s0cg0kks00g4os.loadbalancer.server.port=3000
traefik.http.routers.https-0-r8440gs8s8s0cg0kks00g4os.entryPoints=https
traefik.http.routers.https-0-r8440gs8s8s0cg0kks00g4os.middlewares=gzip
traefik.http.routers.https-0-r8440gs8s8s0cg0kks00g4os.rule=Host(`r8440gs8s8s0cg0kks00g4os.77.42.71.87.sslip.io`) && PathPrefix(`/`)
traefik.http.routers.https-0-r8440gs8s8s0cg0kks00g4os.service=http-0-r8440gs8s8s0cg0kks00g4os
traefik.http.routers.https-0-r8440gs8s8s0cg0kks00g4os.tls=true
traefik.http.routers.https-0-r8440gs8s8s0cg0kks00g4os.tls.certresolver=letsencrypt
traefik.http.routers.http-1-blog-audio-backend-arnob.entryPoints=http
traefik.http.routers.http-1-blog-audio-backend-arnob.middlewares=gzip
traefik.http.routers.http-1-blog-audio-backend-arnob.rule=Host(`blog-audio-backend.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.http-1-blog-audio-backend-arnob.service=http-1-blog-audio-backend-arnob
traefik.http.services.http-1-blog-audio-backend-arnob.loadbalancer.server.port=3000
traefik.http.routers.https-1-blog-audio-backend-arnob.entryPoints=https
traefik.http.routers.https-1-blog-audio-backend-arnob.middlewares=gzip
traefik.http.routers.https-1-blog-audio-backend-arnob.rule=Host(`blog-audio-backend.arnobmahmud.com`) && PathPrefix(`/`)
traefik.http.routers.https-1-blog-audio-backend-arnob.service=http-1-blog-audio-backend-arnob
traefik.http.routers.https-1-blog-audio-backend-arnob.tls=true
traefik.http.routers.https-1-blog-audio-backend-arnob.tls.certresolver=letsencrypt
caddy_0.encode=zstd gzip
caddy_0.handle_path.0_reverse_proxy={{upstreams 3000}}
caddy_0.handle_path=/*
caddy_0.header=-Server
caddy_0.try_files={path} /index.html /index.php
caddy_0=http://blog-audio-backend.arnobmahmud.com
caddy_ingress_network=coolify
```

### Observations from this deployment

- If browser shows `TRAEFIK DEFAULT CERT`, cert issuance is still pending or label/domain mismatch exists.
- Verify cert quickly:
  `echo | openssl s_client -connect blog-audio-backend.arnobmahmud.com:443 -servername blog-audio-backend.arnobmahmud.com 2>/dev/null | openssl x509 -noout -issuer -subject -dates`
- A valid result should show `O=Let's Encrypt`.
- If Coolify healthcheck appears flaky, temporarily disable Coolify healthcheck and rely on app endpoint checks until stable.

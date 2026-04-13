# Coolify + custom domain + HTTPS — public template (VPS backend)

Use this in **any** open-source or shared repo where you deploy a **Dockerfile-backed API** to **[Coolify](https://coolify.io/docs)** on a VPS and expose it at **`https://api.yourdomain.com`**.

**Placeholders (replace everywhere):**

| Placeholder | Meaning |
|-------------|---------|
| `YOUR_VPS_PUBLIC_IP` | IPv4 of the server (e.g. from Hetzner, DigitalOcean, etc.) |
| `YOUR_DOMAIN` | Apex domain you own (e.g. `example.com`) |
| `YOUR_API_SUBDOMAIN` | DNS label only (e.g. `api` → `api.example.com`) |
| `YOUR_API_FQDN` | Full host (e.g. `api.example.com`) |
| `YOUR_COOLIFY_SSLIP_HOST` | Coolify’s auto hostname, usually `*.YOUR_VPS_PUBLIC_IP.sslip.io` (copy from Coolify **Domains** for the resource) |
| `YOUR_CONTAINER_PORT` | Port the process listens on inside the container (e.g. `3000`; must match `PORT` env and Traefik `loadbalancer.server.port`) |
| `YOUR_HOST_PORT` | Optional host map in Coolify (e.g. `5005`) — `YOUR_HOST_PORT:YOUR_CONTAINER_PORT` |
| `YOUR_FRONTEND_ORIGIN` | Production SPA URL, no trailing slash (e.g. `https://myapp.vercel.app`) |

**Privacy:** Do not commit private runbooks that list **real** IPs, **database passwords**, **internal Coolify UUIDs**, or **long-lived secrets**. Keep those in a **local-only** or **private** doc; this file is safe to commit.

**Repo-specific layout for *this* project:** [DEPLOYMENT.md](./DEPLOYMENT.md). **Docker hygiene / prune:** [DOCKER_VPS_BACKEND_PLAYBOOK.md](./DOCKER_VPS_BACKEND_PLAYBOOK.md).

---

## 1. DNS (at your registrar)

1. Create an **A** record: hostname = `YOUR_API_SUBDOMAIN` (or `@` if the API lives on the apex), value = `YOUR_VPS_PUBLIC_IP`.
2. Wait for propagation (often minutes; TTL-dependent).

---

## 2. Firewall (conceptual)

- Allow **TCP 80** and **TCP 443** from the internet (HTTP-01 / HTTPS and Traefik).
- Restrict **SSH (22)** and your **Coolify dashboard port** (often **8000**) to **your own IP** when possible (e.g. Hetzner Cloud Firewall).
- Do not expose raw database ports publicly unless you intentionally need remote DB access.

---

## 3. Coolify — new application

1. **New resource → Application** → connect Git, pick branch.
2. **Build pack:** Dockerfile.
3. **Base directory:** repo subfolder that contains the Dockerfile (e.g. `.` or `backend/`).
4. **Dockerfile path:** e.g. `/Dockerfile`.
5. **Ports exposes:** `YOUR_CONTAINER_PORT` (must match what uvicorn/node listens on).
6. **Ports mappings (optional):** `YOUR_HOST_PORT:YOUR_CONTAINER_PORT` to avoid host collisions between apps.
7. **Environment:** at minimum `PORT=YOUR_CONTAINER_PORT` if the app reads `PORT`; add `CORS_ORIGINS=YOUR_FRONTEND_ORIGIN` (comma-separated if several); API keys only via Coolify secrets, never in the image.

---

## 4. Domains in Coolify (General)

Under the application **General → Domains**, add:

- The **sslip** URL Coolify shows (fallback / first deploy smoke test).
- **`https://YOUR_API_FQDN`** for production (HTTPS).

Save and redeploy when labels or domains change.

---

## 5. Container labels (Traefik + Caddy pattern)

Coolify often generates **Traefik** and **Caddy** labels. You need **two router pairs**:

1. **sslip.io** host (Coolify default) — keeps a working URL even before DNS is ready.
2. **Your real FQDN** — Let’s Encrypt certificate via `certresolver=letsencrypt`.

**Naming:** pick a **unique** suffix for router/service names (examples below use `sslip` / `prod` suffixes). They must be **unique per router** on the server.

Replace:

- `` `YOUR_COOLIFY_SSLIP_HOST` `` — exact string from Coolify (no `https://`).
- `` `YOUR_API_FQDN` `` — production API host only.
- **All** occurrences of `REPLACE_SSLIP_TOKEN` with the same token you use in router names (often derived from the sslip hostname without dots, or use Coolify’s generated fragment).

**Template (one block; adjust router names if Coolify regenerates them):**

```ini
traefik.enable=true
traefik.http.middlewares.gzip.compress=true
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https

traefik.http.routers.http-0-REPLACE_SSLIP_TOKEN.entryPoints=http
traefik.http.routers.http-0-REPLACE_SSLIP_TOKEN.middlewares=gzip
traefik.http.routers.http-0-REPLACE_SSLIP_TOKEN.rule=Host(`YOUR_COOLIFY_SSLIP_HOST`) && PathPrefix(`/`)
traefik.http.routers.http-0-REPLACE_SSLIP_TOKEN.service=http-0-REPLACE_SSLIP_TOKEN
traefik.http.services.http-0-REPLACE_SSLIP_TOKEN.loadbalancer.server.port=YOUR_CONTAINER_PORT

traefik.http.routers.https-0-REPLACE_SSLIP_TOKEN.entryPoints=https
traefik.http.routers.https-0-REPLACE_SSLIP_TOKEN.middlewares=gzip
traefik.http.routers.https-0-REPLACE_SSLIP_TOKEN.rule=Host(`YOUR_COOLIFY_SSLIP_HOST`) && PathPrefix(`/`)
traefik.http.routers.https-0-REPLACE_SSLIP_TOKEN.service=http-0-REPLACE_SSLIP_TOKEN
traefik.http.routers.https-0-REPLACE_SSLIP_TOKEN.tls=true
traefik.http.routers.https-0-REPLACE_SSLIP_TOKEN.tls.certresolver=letsencrypt

traefik.http.routers.http-1-prod-api.entryPoints=http
traefik.http.routers.http-1-prod-api.middlewares=gzip
traefik.http.routers.http-1-prod-api.rule=Host(`YOUR_API_FQDN`) && PathPrefix(`/`)
traefik.http.routers.http-1-prod-api.service=http-1-prod-api
traefik.http.services.http-1-prod-api.loadbalancer.server.port=YOUR_CONTAINER_PORT

traefik.http.routers.https-1-prod-api.entryPoints=https
traefik.http.routers.https-1-prod-api.middlewares=gzip
traefik.http.routers.https-1-prod-api.rule=Host(`YOUR_API_FQDN`) && PathPrefix(`/`)
traefik.http.routers.https-1-prod-api.service=http-1-prod-api
traefik.http.routers.https-1-prod-api.tls=true
traefik.http.routers.https-1-prod-api.tls.certresolver=letsencrypt

caddy_0.encode=zstd gzip
caddy_0.handle_path.0_reverse_proxy={{upstreams YOUR_CONTAINER_PORT}}
caddy_0.handle_path=/*
caddy_0.header=-Server
caddy_0.try_files={path} /index.html /index.php
caddy_0=http://YOUR_API_FQDN
caddy_ingress_network=coolify
```

**Important:** the **Host(`...`)** rule for sslip must match Coolify’s string **exactly** (typos → wrong cert or 404).

---

## 6. Verify TLS and API

```bash
# Issuer should mention Let's Encrypt (not a default/self-signed CA name)
echo | openssl s_client -connect YOUR_API_FQDN:443 -servername YOUR_API_FQDN 2>/dev/null | openssl x509 -noout -issuer -subject -dates

curl -sS "https://YOUR_API_FQDN/api/health"
```

If the browser shows **certificate errors** while sslip works, the problem is almost always **DNS, labels, or ACME** — not application code.

---

## 7. Frontend (e.g. Vercel) + CORS

- Set **`VITE_API_BASE_URL=https://YOUR_API_FQDN`** (no trailing slash) and **redeploy** the frontend so the value is baked into the build (Vite).
- Backend: set **`CORS_ORIGINS`** to **`YOUR_FRONTEND_ORIGIN`** (and preview origins only if you need them).

---

## 8. Google OAuth (only if your backend uses it)

In Google Cloud Console → OAuth client:

- **Authorized JavaScript origins:** `YOUR_FRONTEND_ORIGIN`
- **Authorized redirect URIs:** `https://YOUR_API_FQDN/<your-callback-path>` (must match the backend route)

---

## 9. Optional: VPS disk cleanup (after many deploys)

See [DOCKER_VPS_BACKEND_PLAYBOOK.md](./DOCKER_VPS_BACKEND_PLAYBOOK.md) §6 for **`docker … prune`** commands and warnings about **`docker image prune -a`**.

---

## 10. Personal / internal documentation

If you maintain a **private** migration guide (long Hetzner notes, DB container names, internal ports, password patterns), keep it **out of the public repo** (e.g. `.gitignore` those filenames under `docs/`). This **COOLIFY_PUBLIC_BACKEND_GUIDE.md** is the copy-paste template for collaborators and future-you on **any** project.

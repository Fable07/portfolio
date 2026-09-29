# Deployment Runbook

Guide to deploying the Caragay Portfolio stack: **Vercel (frontend)** + **Render (backend)** + **Supabase** + **Cloudinary**.

## Overview

```
     Work on dev (GitHub)              Merge to main (GitHub)              Auto-deploy
   ─────────────────────             ──────────────────────             ───────────────
   frontend/ + backend/     ──────→   frontend/ + backend/      ──────→   Vercel + Render
   CI runs: lint/build/test           CI runs: lint/build/test           (if CI passes)
```

- **Vercel** (frontend): free tier, static SPA. Builds `frontend/` only. Serves `VITE_API_URL` build-time env var.
- **Render** (backend): free tier, Docker. Deploys `backend/` via `render.yaml` Blueprint. Sleeps after 15 min idle (~30–60 s cold start).
- **Supabase**: one Postgres database (session pooler, port 5432). Dev and prod share it (accepted risk).
- **Cloudinary**: stores uploaded images/videos from the admin panel (free tier).

## 1. Git flow

Work on `dev`, release via `main`:

```bash
# Work on dev (both frontend/ and backend/)
git checkout dev
# … make changes …
npm run ci              # frontend: lint + format + build + vitest
php artisan test        # backend: phpunit
git commit && git push
# GitHub Actions runs the same checks (path-filtered CI in .github/workflows/)

# Release: open PR dev → main, let CI pass, merge
git checkout main && git merge --no-ff dev && git push

# Auto-deploy starts (Vercel if frontend/ changed, Render if backend/ changed and CI passes)
```

**Migration rule**: Render runs pending migrations automatically on every deploy (`RUN_MIGRATIONS=true`, see `backend/docker/entrypoint.sh`). If a migration fails, the deploy fails and the previous version keeps serving. Migrations hit the shared database, so keep them additive and review them before pushing to `main`. If a migration creates a table, run the RLS SQL in §1 afterwards.

Don't run `php artisan migrate` locally on `dev` for unreleased migrations: the live database would change before the matching code is deployed.

## 2. Supabase (database)

**Find connection details**:
1. Log in to Supabase → select your project
2. Go to **Project Settings** → **Database**
3. Find **Connection string (URI)**
4. Copy the session pooler URL (port 5432, not 6543 for web—use 5432):
   ```
   postgresql://postgres.<project-ref>:<password>@<region>.pooler.supabase.com:5432/postgres?sslmode=require
   ```

**Enable RLS** (S1 security check):
1. Go to **Advisors** → **Security** → look for "RLS disabled"
2. For each table in the `public` schema, enable RLS:
   ```sql
   ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
   ```
   Or run this once to enable all at once:
   ```sql
   DO $$
   DECLARE
     r RECORD;
   BEGIN
     FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
     LOOP
       EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
     END LOOP;
   END $$;
   ```
3. Laravel connects as the `postgres` role, which bypasses RLS, so the app works fine (RLS protects the public Data API, not the backend).

## 3. Cloudinary (media)

**Sign up**:
1. Go to [cloudinary.com](https://cloudinary.com), create a free account.
2. On the dashboard, note:
   - **Cloud Name** (looks like `abcd1234`)
   - **API Key** (looks like `123456789012345`)
   - **API Secret** (keep safe; used only server-side)

You will set these in Render's dashboard later (never commit them).

## 4. Render (backend deployment)

**Create the service**:
1. Log in to [render.com](https://render.com)
2. Click **New** → **Blueprint**
3. Select repository: **Fable07/portfolio**
4. Render reads `render.yaml` automatically and creates the `portfolio-api` web service
5. Fill in **Sync** = `false` secrets in the Render dashboard:

| Secret | Value | Where to find |
|--------|-------|--------|
| `APP_KEY` | Run locally: `php artisan key:generate --show` | Copy from output |
| `APP_URL` | `https://portfolio-api-XXXXX.onrender.com` | Render assigns this; update after service is created |
| `DB_HOST` | `<region>.pooler.supabase.com` | Supabase connection string |
| `DB_PORT` | `5432` | — |
| `DB_DATABASE` | `postgres` | — |
| `DB_USERNAME` | `postgres.<project-ref>` | Supabase connection string |
| `DB_PASSWORD` | Your Supabase password | — |
| `FRONTEND_URLS` | `https://yourdomain.vercel.app` | Set after Vercel is live (exact origin, no trailing slash) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Cloudinary dashboard (server-side only) |

**After secrets are set**:
- Render auto-deploys when:
  - `backend/` files changed, AND
  - GitHub CI passes (`autoDeployTrigger: checksPass` in render.yaml)
- First deploy may take 2–3 min. Health check endpoint is `/up` (GET).

## 5. Vercel (frontend deployment)

**Create the project**:
1. Log in to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import repository: **Fable07/portfolio**
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
5. Add environment variables (Production):
   - `VITE_API_URL`: `https://portfolio-api-XXXXX.onrender.com/api` (Render's service URL)
6. Deploy

Vercel auto-deploys when:
- `frontend/` files changed, AND
- CI passes (via `ignoreCommand` in `frontend/vercel.json`)

## 6. Wire CORS

**After both Vercel and Render are live**:
1. Copy your Vercel domain: e.g., `https://caragay.vercel.app`
2. Update Render's `FRONTEND_URLS` secret:
   - Go to Render Dashboard → Services → portfolio-api → Environment
   - Edit `FRONTEND_URLS` to your Vercel domain (exact origin, no trailing slash)
   - **Save** (Render redeploys automatically)
3. The backend now allows requests from your frontend origin only (CORS check in `config/cors.php`)

## 7. First admin user

Create the admin once (stored in the shared Supabase):

**Option A** (simplest): Run from your local machine (it connects to the shared Supabase):
```bash
cd backend
php artisan admin:create your.email@example.com --name="Your Name"
```

**Option B**: Run inside the Render container (if you prefer):
```bash
# Copy the command from Render's shell or use the Render dashboard
# (Render → Services → portfolio-api → Shell)
php artisan admin:create your.email@example.com --name="Your Name"
```

The command generates a random 24-char token (printed to console). Save it; you'll use it to log in to `/admin`.

## 8. Smoke test

After deployment, verify the stack works:

- [ ] Site loads: open `https://yourvercel.domain` (should see the portfolio homepage)
- [ ] Icons show: check the project cards and footer icons render correctly
- [ ] API health: curl or browser to `https://your-render-domain.onrender.com/up` → should see `{"status":"up"}`
- [ ] Projects load: open the home page, verify projects display from the database
- [ ] Contact form: fill it out (bot name is optional), submit → message appears in the admin panel
- [ ] Admin login: open `/admin`, paste your 24-char token into the "Verify admin" dialog
- [ ] Upload image: in the admin panel, upload a project image → verify it lands in Cloudinary (check your Cloudinary dashboard)
- [ ] Browser console: press F12, check Console tab for CSP errors (should be none)
- [ ] Rate limits: rapid requests to `/api/login` or `/api/contact` should throttle (status 429 after limit) — verify with curl

## 9. Local development

Run the stack locally for faster iteration:

**Option A**: Direct (no Docker; fastest with hot reload)
```bash
# Terminal 1: backend API on :8000
cd backend && php artisan serve

# Terminal 2: frontend SPA on :5173
cd frontend && npm run dev
```

**Option B**: Docker Compose (identical to Render base image; no PHP/Node on host)
```bash
cd portfolio  # repo root
docker compose -f docker-compose.dev.yml up --build
# API: http://localhost:8000/api
# SPA: http://localhost:5173
```

Source is mounted, so edits hot-reload in both. `node_modules/` and `vendor/` live inside containers (built for Linux).

## 10. Rollback

If a deploy breaks the live site:

**Vercel**:
1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click the three dots → **Promote to Production**

**Render**:
1. Go to Render Dashboard → Services → portfolio-api → Deploys
2. Find the previous working deploy
3. Click → **Redeploy**

**Git**: To roll back the release itself:
```bash
git checkout main
git revert <broken-commit-hash>
git push
# CI runs, auto-deploy starts with the reverted code
```

Migrations do not roll back (they are additive), so undo by reversing the schema change manually if needed.

## Key reminders

- **Dev and prod share one Supabase database** — migrations must be additive, migrations run only from `main`, and media folder must be the same in both.
- **Free tier cold starts** — Render sleeps after 15 min; first request takes 30–60 s. The SPA's loading skeleton hides this.
- **CSP headers** — Vercel serves security headers (`frontend/vercel.json`). `VITE_API_URL` and Cloudinary CDN are whitelisted.
- **CORS** — Render checks `FRONTEND_URLS` against the `Origin` header. Must be exact (scheme + host, no path, no trailing slash).
- **Persistent media** — `MEDIA_DRIVER=cloudinary` on Render (free tier has ephemeral storage). Cloudinary driver already implemented.

## References

- `render.yaml` — Blueprint config (services, env vars, health check)
- `frontend/vercel.json` — Build config, rewrite rules, security headers
- `backend/.env.production.example` — Template for production env vars
- `PLAN.md` § 2, 3 — Architecture, security findings, roadmap

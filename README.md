# Caragay Portfolio

A personal portfolio and admin panel built with modern web technologies. The frontend is a static Vue 3 SPA deployed to Vercel; the backend is a Laravel 12 REST API deployed to Render; both connect to a shared Supabase Postgres database and use Cloudinary for media storage.

## Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vue 3, Vite 7, Pinia, Vue Router, Tailwind CSS v4 |
| **Backend** | Laravel 12, PHP 8.2, Sanctum tokens |
| **Database** | Supabase Postgres (session pooler) |
| **Media** | Cloudinary (images, videos) or local (dev) |
| **Deployment** | Vercel (frontend), Render (backend), auto-deploy on push to `main` |

## Repo layout

```
portfolio/
├── .github/workflows/     CI: lint, test, build (path-filtered for frontend/ and backend/)
├── docs/
│   ├── PLAN.md            Architecture, security findings, roadmap
│   ├── CHECKPOINT.md      Phase status, QA baseline, owner action items
│   └── DEPLOYMENT.md      Click-by-click runbook for Vercel, Render, Supabase, Cloudinary
├── frontend/              Vue 3 SPA (npm, Vite, Vitest, Tailwind)
│   └── src/, public/, vite.config.js, package.json, vercel.json
├── backend/               Laravel 12 API (Composer, Sail, PHPUnit)
│   └── app/, bootstrap/, config/, routes/, storage/, composer.json, Dockerfile, render.yaml
├── docker-compose.dev.yml Dev stack: both services locally with hot reload
└── README.md              This file
```

## Quick start (local development)

### With Docker (recommended — no PHP/Node needed)

```bash
docker compose -f docker-compose.dev.yml up --build
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/api
```

### Without Docker (direct)

```bash
# Terminal 1
cd backend && php artisan serve

# Terminal 2
cd frontend && npm run dev
```

[See docs/DEPLOYMENT.md § 9 for full details.](docs/DEPLOYMENT.md#9-local-development)

## Deployment

The site auto-deploys to Vercel + Render when you push to the `main` branch:
- **Frontend** deploys if `frontend/` changed (Vercel)
- **Backend** deploys if `backend/` changed and CI passes (Render)

[See docs/DEPLOYMENT.md for the full setup runbook.](docs/DEPLOYMENT.md)

## Documentation

- **[PLAN.md](docs/PLAN.md)** — Architecture, stack overview, roadmap, and security findings
- **[CHECKPOINT.md](docs/CHECKPOINT.md)** — Phase status and owner action items
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Deploy to Vercel, Render, Supabase, and Cloudinary (step-by-step)

## Commands

```bash
# Frontend (from frontend/)
npm run dev         # Vite dev server
npm run build       # Production build
npm run test        # Vitest
npm run lint        # oxlint + eslint
npm run format      # Prettier
npm run ci          # All checks: lint:check + format:check + test + build

# Backend (from backend/)
php artisan serve   # Dev API server
php artisan test    # PHPUnit
php artisan migrate # Apply database migrations
php artisan admin:create <email> --name="Your Name"  # Create admin
```

## License

Personal portfolio; all content © 2026.

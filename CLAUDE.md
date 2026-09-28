# Portfolio monorepo

Vue 3 SPA (`frontend/`) + Laravel 12 API (`backend/`) + Supabase Postgres. Deploy target: Vercel (frontend) + Render (backend, Docker) + Cloudinary (admin-uploaded media).

**Start every session by reading `docs/CHECKPOINT.md`** (current state + next step), then `docs/PLAN.md` (findings, roadmap, decisions). Update CHECKPOINT.md at the end of every work session.

Rules:
- Never print or commit `backend/.env` — it holds live Supabase credentials. Dev and prod currently share ONE database: no destructive migrations or seeders against it.
- Supabase RLS is ON for every public table. Any migration that creates a table must be followed by the RLS SQL in docs/DEPLOYMENT.md §1.
- Backend tests run on in-memory SQLite (`phpunit.xml`); never point tests at Supabase.
- `npm run lint` / `npm run format` rewrite files; use `lint:check` / `format:check` for verification.
- Model roles: Opus = PM/architecture/security, Sonnet = implementation/DevOps/QA, Haiku = docs.

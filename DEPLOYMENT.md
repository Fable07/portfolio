# Deployment

How this portfolio goes from a local change to the live site.

```
Caragay_Portfolio/     Vue frontend  (this repo)  → static files served by nginx
portfolio-backend/     Laravel API                → nginx + php-fpm in one container
Supabase               PostgreSQL                 → ONE database, shared by dev and prod
```

Two branches, in both repos:

| Branch | Purpose                                                     | Deployed |
| ------ | ----------------------------------------------------------- | -------- |
| `dev`  | Where features are built and tested. CI runs on every push. | No       |
| `main` | The release branch. What the live site runs.                | Yes      |

## The one thing to remember

**Dev and production share a single Supabase database.** That is fine for a personal
portfolio, but it has three consequences:

1. **Migrations are live changes.** Running `php artisan migrate` from `dev` alters the
   same schema production reads. Keep migrations **additive** — add nullable columns and
   new tables; never rename or drop a column that the deployed `main` still selects.
   Deploy the code that uses a column in the same release as the migration that adds it.
2. **Media lives in one folder.** `MEDIA_FOLDER=portfolio` in both environments, because
   the database stores the path. Changing it in one place makes existing images 404.
3. **Editing content in dev edits the live site.** There is no separate dev data set.
   If that ever becomes a problem, create a second Supabase project and point `DB_URL`
   at it — nothing else in the code has to change.

## Release flow

```bash
# 1. work on dev (both repos)
git checkout dev
# … changes …
npm run ci                    # frontend: lint + format + unit tests + build
php artisan test              # backend
git commit && git push        # GitHub Actions runs the same checks

# 2. release: open a PR from dev → main, let CI pass, merge
git checkout main && git merge --no-ff dev && git push

# 3. deploy main (see below), then go back to dev
git checkout dev
```

A schema change goes out in this order: merge to `main` → run the migration once →
deploy the new images. Because the database is shared, run the migration only from the
branch you are releasing.

## Local development

Two equivalent ways to run the stack:

**Directly on the machine** (fastest, what the repo README describes)

```bash
cd portfolio-backend   && php artisan serve          # http://127.0.0.1:8000
cd Caragay_Portfolio   && npm run dev                # http://localhost:5173
```

**In containers** (identical to production's base images, no PHP/Node needed on the host)

```bash
cd Caragay_Portfolio
docker compose -f docker-compose.dev.yml up --build
# site http://localhost:5173 · API http://localhost:8000/api
```

The dev compose file expects the two repos to be **siblings** and reads the backend's
existing `.env`. Source is mounted, so hot reload works for both services;
`node_modules` and `vendor` stay inside the containers (they are built for Linux).

## Production

### Images

| Image    | Built from                  | Contains                             | Port |
| -------- | --------------------------- | ------------------------------------ | ---- |
| frontend | `Dockerfile` (this repo)    | `dist/` served by nginx, SPA routing | 80   |
| api      | `Dockerfile` (backend repo) | nginx + php-fpm + supervisord        | 80   |

Both are multi-stage builds: no Node, Composer, dev dependencies or source in the
runtime image.

### Running them

```bash
cd portfolio-backend
cp .env.production.example .env.production   # fill it in (APP_KEY, DB_URL, FRONTEND_URLS)

cd ../Caragay_Portfolio
API_URL=https://api.yourdomain.com/api \
  docker compose -f docker-compose.prod.yml up -d --build
# site http://<server>:8080 · API http://<server>:8001
```

Put a TLS terminator in front (Caddy, nginx, or Cloudflare) mapping
`yourdomain.com → :8080` and `api.yourdomain.com → :8001`.

### `VITE_API_URL` is a build-time value

Vite inlines environment variables into the bundle, so the API URL is fixed when the
image is **built**, not when it starts. Changing it means rebuilding the frontend image
(`--build-arg VITE_API_URL=…`, which `API_URL=` in the compose file passes through).

### Uploaded media must survive deploys

With `MEDIA_DRIVER=local`, files live in `storage/app/public` **inside the container** —
a rebuild without a volume deletes every uploaded image. `docker-compose.prod.yml`
mounts a named volume (`media`) for exactly that reason. On a platform with an
ephemeral filesystem (Render, Railway, Fly without a volume), switch to Cloudinary:

```env
MEDIA_DRIVER=cloudinary
CLOUDINARY_CLOUD_NAME=…
CLOUDINARY_API_KEY=…
CLOUDINARY_API_SECRET=…
```

Nothing else changes — the database stores the same JSON either way. (The Cloudinary
driver has not been exercised against real credentials yet; test it on `dev` first.)

### Migrations in production

The container runs migrations only when `RUN_MIGRATIONS=true`. The default is `false`
so a restart can never reshape the shared database by accident. To apply a migration:

```bash
docker compose -f docker-compose.prod.yml exec api php artisan migrate --force
```

### First admin user

Tokens are per-user; create the admin once (it is stored in the shared database, so
this is needed only the first time):

```bash
docker compose -f docker-compose.prod.yml exec api \
  php artisan admin:create you@example.com --name="Your Name"
```

## Hosting without Docker

The pieces are independent, so the split also works on managed platforms:

| Piece    | Option                                       | Notes                                                                                           |
| -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| frontend | Vercel / Netlify / Cloudflare Pages          | Build `npm run build`, publish `dist`, set `VITE_API_URL`, add an SPA rewrite to `/index.html`. |
| API      | Render / Railway / Fly.io (Docker), or a VPS | Deploy the backend `Dockerfile`; set the env vars from `.env.production.example`.               |
| database | Supabase                                     | Already hosted. Use the pooled connection (port 6543) and `sslmode=require`.                    |

## Go-live checklist

- [ ] `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY` set
- [ ] `FRONTEND_URLS` lists the live origin(s) exactly — otherwise CORS blocks the site
- [ ] `VITE_API_URL` points at the public API URL (and the image was rebuilt after changing it)
- [ ] HTTPS on both hosts (Sanctum tokens travel in an `Authorization` header)
- [ ] Media: persistent volume mounted, or `MEDIA_DRIVER=cloudinary`
- [ ] Migrations applied once against Supabase
- [ ] Admin user created, login works, an upload survives a container restart
- [ ] `main` and `dev` are in sync at the release commit

## Rolling back

Images are the artifact, so a rollback is a redeploy of the previous commit:

```bash
git checkout main~1                                      # or the last good tag
docker compose -f docker-compose.prod.yml up -d --build
```

Code rolls back cleanly; **a migration does not** — that is the other reason to keep
them additive.

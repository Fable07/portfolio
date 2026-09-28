# Deploying the API

The full picture (branches, both repos, the shared database) lives in the frontend repo:
`../Caragay_Portfolio/DEPLOYMENT.md`. This file covers only what is specific to the API.

## Images

| File             | Purpose    | Contents                                                       | Port |
| ---------------- | ---------- | -------------------------------------------------------------- | ---- |
| `Dockerfile`     | production | nginx + php-fpm + supervisord, opcache on, no dev dependencies | 80   |
| `Dockerfile.dev` | local dev  | `php artisan serve`, source mounted, errors visible            | 8000 |

Supporting files in `docker/`:

- `nginx.conf` — serves `public/`, passes `.php` to php-fpm, 32 MB upload ceiling
- `php.ini` / `php.dev.ini` — upload limits matching `app/Support/MediaRules.php`, opcache
- `supervisord.conf` — keeps nginx and php-fpm alive, logs to the container output
- `entrypoint.sh` — refuses to start without `APP_KEY`, caches config/routes/views,
  fixes `storage/` ownership, links `public/storage`, and runs migrations **only** if
  `RUN_MIGRATIONS=true`

```bash
cp .env.production.example .env.production      # then fill it in
docker build -t portfolio-api .
docker run -p 8001:80 --env-file .env.production \
  -v portfolio-media:/app/storage/app/public portfolio-api
```

The volume is not optional with `MEDIA_DRIVER=local`: without it, every uploaded image,
video and PDF disappears when the container is replaced.

## Environment

Start from `.env.production.example`. The values that actually break things if wrong:

| Variable         | Why it matters                                                                        |
| ---------------- | ------------------------------------------------------------------------------------- |
| `APP_KEY`        | Missing → the entrypoint exits. Generate with `php artisan key:generate --show`.      |
| `APP_DEBUG`      | Must be `false`; debug pages expose env values, queries and paths.                    |
| `DB_URL`         | Supabase connection string. Pooled port `6543`, `sslmode=require`.                    |
| `FRONTEND_URLS`  | Exact live origins, comma-separated. Wrong value → every browser call fails CORS.     |
| `MEDIA_FOLDER`   | Same value as dev (`portfolio`) — paths are stored in the shared database.            |
| `RUN_MIGRATIONS` | Leave `false`; migrate deliberately, because the database is shared with dev.         |

## Health check

Laravel's built-in endpoint is `GET /up` (configured in `bootstrap/app.php`). Both the
Dockerfile `HEALTHCHECK` and `docker-compose.prod.yml` use it. It boots the framework,
so a broken `APP_KEY` or unreachable database shows up as an unhealthy container.

## After deploying

```bash
php artisan migrate --force                                   # only for a release with new migrations
php artisan admin:create you@example.com --name="Your Name"   # first time only
```

`config:cache` is applied by the entrypoint, so changing an environment variable needs a
container restart to take effect — that is also why the app never calls `env()` outside
`config/`.

## CI

`.github/workflows/ci.yml` runs on pushes and pull requests to `dev` and `main`:
Composer install, `php artisan route:list` (catches boot-time errors), and `php artisan test`.
Tests use in-memory SQLite (`phpunit.xml`), so CI never touches Supabase and needs no secrets.

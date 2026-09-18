# Caragay Portfolio — Backend API

Laravel 12 REST API for the portfolio (frontend: `Caragay_Portfolio`).
PostgreSQL (Supabase) · Sanctum token auth · swappable media storage.

## Setup

```sh
composer install
cp .env.example .env && php artisan key:generate   # then fill in DB_* values
php artisan migrate
php artisan storage:link                            # serves uploaded files from /storage
php artisan admin:create you@example.com --name="Your Name"
php artisan serve                                   # http://127.0.0.1:8000
php artisan test                                    # feature tests (in-memory SQLite)
```

## API overview

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | — | Get a bearer token (5 attempts/min) |
| GET | `/api/auth/me`, POST `/api/auth/logout` | ✔ | Session |
| GET | `/api/profile` | — | Owner profile (name, roles, about, skills, socials); `{}` until saved |
| PUT | `/api/profile` | ✔ | Save the whole profile |
| GET | `/api/projects`, `/api/projects/{id}` | — | Published projects (with `media` gallery) |
| GET | `/api/projects?drafts=1` | ✔ | Include unpublished (draft) items — also on certifications |
| GET | `/api/certifications`, `/api/hobbies`, `/api/timeline`, `/api/resume` | — | Content |
| POST/PUT/DELETE | `/api/{projects,certifications,hobbies,timeline}` | ✔ | Manage content (PUT accepts partial updates) |
| PUT | `/api/{projects,certifications,hobbies,timeline}/reorder` | ✔ | Save display order: `{ order: [3, 1, 2] }` |
| PUT | `/api/resume` | ✔ | `{ pdf_url }` or `{ pdf: MediaItem }` |
| POST | `/api/media` | ✔ | Upload a file (`file`, `collection`) → MediaItem JSON |
| POST | `/api/media/embed` | ✔ | YouTube/Vimeo link → MediaItem JSON |
| DELETE | `/api/media` | ✔ | Delete an upload that was never saved |

## Media storage (images, videos, PDFs)

**Files never go in the database.** A *media driver* stores the file; the database keeps a
small JSON description (a **MediaItem**):

```json
{ "id": "…", "type": "image", "provider": "local", "url": "https://…/storage/portfolio-dev/projects/….png",
  "key": "portfolio-dev/projects/….png", "mime": "image/png", "size": 48213,
  "width": 1280, "height": 720, "name": "screenshot.png", "alt": "Dashboard" }
```

| Column | Shape | Used for |
|---|---|---|
| `projects.media` | array | gallery: images, videos, YouTube/Vimeo embeds |
| `projects.case_study` | object | optional write-up: role, period, problem, approach, outcome, highlights, sections |
| `certifications.badge` | object | badge image |
| `hobbies.image` | object | photo |
| `resume.pdf` | object | uploaded resume |

Flow: the admin uploads to `POST /api/media` → gets a MediaItem → saves it with the content.
The `HasMedia` model trait deletes stored files when items are removed or content is deleted.

Key files: `config/media.php`, `app/Services/Media/*`, `app/Models/Concerns/HasMedia.php`,
`app/Support/MediaRules.php`.

### Switching providers

```env
MEDIA_DRIVER=local          # local disk (storage/app/public) — good for development
MEDIA_DRIVER=cloudinary     # CDN for images/video — recommended for production
CLOUDINARY_CLOUD_NAME=…
CLOUDINARY_API_KEY=…
CLOUDINARY_API_SECRET=…
```

Existing items keep working after a switch — each item remembers its own `provider`.
The Cloudinary driver is written but not yet tested with real credentials: do one test upload
after adding keys.

## Case studies

`projects.case_study` holds an optional write-up rendered on the project's public page.
Every field is optional, so a project can have a one-liner or a full story:

```json
{ "role": "Full-stack developer", "period": "Jan – Mar 2026",
  "problem": "…", "approach": "…", "outcome": "…",
  "highlights": ["Cut load time by 60%"],
  "sections": [{ "heading": "Architecture", "body": "…" }] }
```

Text is stored and displayed as plain text (line breaks preserved) — no HTML or Markdown,
so project content can never inject markup into the page. A `sections` entry must have
both a heading and a body.

## Publishing & ordering

- `is_published` on **projects** and **certifications**: `false` = draft, hidden from visitors.
  A signed-in admin sees drafts by adding `?drafts=1`; a draft project is 404 for visitors.
- `is_featured` on **projects**: shown in "Featured projects" on the home page.
- `order` on every list: saved by the `/reorder` endpoints (the first id gets order 0).

## Profile

One row in the `profile` table holds the owner's details: name, handle (terminal prompt),
email, location, availability badge, roles, about paragraphs, avatar (MediaItem), skill groups
and social links. A skill icon is either a built-in icon file name shipped with the frontend
(`"vue-js.png"`) or an uploaded `icon_media` item. Social links accept `https://` and
`mailto:` only. Until it is saved once, `GET /api/profile` returns `{}` and the frontend
falls back to `src/config/profile.js`.

## Environments: dev and production

One Supabase database serves both, which is deliberate for a personal portfolio: the
admin edits the same content everywhere, and there is no data to keep in sync. Only the
**code** is split.

| | Development | Production |
|---|---|---|
| Git branch | `dev` | `main` (merge `dev` when verified) |
| Database | the same Supabase project | the same Supabase project |
| `MEDIA_FOLDER` | `portfolio` | `portfolio` (shared: paths live in the database) |
| `MEDIA_DRIVER` | `local` | `local` + a persistent volume, or `cloudinary` |
| `APP_ENV` / `APP_DEBUG` | `local` / `true` | `production` / `false` |
| `FRONTEND_URLS` | `http://localhost:5173` | your live domain |
| Runs as | `php artisan serve` or `Dockerfile.dev` | `Dockerfile` (nginx + php-fpm) |

Because the database is shared, **migrations must stay additive** — add nullable columns
and new tables, never rename or drop something the deployed `main` still reads. A
migration run from `dev` changes the live schema immediately.

## Containers, CI and deployment

- `Dockerfile` — production image (nginx + php-fpm + supervisord)
- `Dockerfile.dev` — development image (`php artisan serve`, source mounted)
- `.github/workflows/ci.yml` — Composer install + `php artisan test` on every push/PR
- `DEPLOYMENT.md` — environment variables, media persistence, migrations, health check
- The dev/prod compose files live in the frontend repo, which runs both services together.

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
| GET | `/api/projects`, `/api/projects/{id}` | — | Projects (with `media` gallery) |
| GET | `/api/certifications`, `/api/hobbies`, `/api/timeline`, `/api/resume` | — | Content |
| POST/PUT/DELETE | `/api/{projects,certifications,hobbies,timeline}` | ✔ | Manage content |
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

## Environments: dev and production

Keep the two completely separate so testing never touches the live site:

| | Development | Production |
|---|---|---|
| Git branch | `dev` | `main` (merge `dev` when verified) |
| Database | its own Supabase project | its own Supabase project |
| `MEDIA_FOLDER` | `portfolio-dev` | `portfolio-prod` |
| `MEDIA_DRIVER` | `local` or `cloudinary` | `cloudinary` |
| `APP_ENV` / `APP_DEBUG` | `local` / `true` | `production` / `false` |
| `FRONTEND_URLS` | `http://localhost:5173` | your live domain |

Containers (Docker) for both environments are planned for Phase 5.

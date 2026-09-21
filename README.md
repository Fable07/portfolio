# Caragay Portfolio — Frontend

Personal portfolio built with **Vue 3 + Vite + Tailwind CSS v4 + Pinia + Vue Router**,
backed by a separate Laravel API (`portfolio-backend`).

## Setup

```sh
npm install
npm run dev      # dev server with hot reload
npm run build    # production build → dist/
npm run test     # unit tests (Vitest)
npm run lint     # oxlint + eslint (rewrites files)
npm run format   # prettier
npm run ci       # what CI runs: lint:check + format:check + test + build (never rewrites)
```

## Environment

The API base URL comes from `VITE_API_URL` (see `.env.example`).

- `npm run dev` uses `.env.development` (`http://127.0.0.1:8000/api`).
- For production builds, create `.env.production.local` with the deployed API URL.

## Features

| Feature               | Where                        | Notes                                                                                                                                                                                      |
| --------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Command palette**   | `Ctrl/⌘ + K` or `/`          | Fuzzy search pages, projects, certifications, actions (theme, copy email, resume) and links. Remembers recent commands.                                                                    |
| **Terminal mode**     | `/terminal` or press `` ` `` | `help`, `whoami`, `projects`, `project <name>`, `skills`, `skill <name>`, `journey`, `experience`, `contact`, `open <page>`, `theme`, `exit`… Tab completes, ↑/↓ history.                  |
| **Skill graph**       | `/skills?skill=Vue`          | Pick a skill to see the projects and certifications that use it, drawn as a small graph. Matches spellings ("Vue JS" ↔ a project tagged "vue").                                            |
| **Case studies**      | `/projects/:id`              | Optional write-up per project: role, period, problem, approach, outcome, highlights and custom sections, with jump links.                                                                  |
| **Journey timeline**  | `/journey?type=work`         | Education, work, certifications and projects merged into one timeline, newest first, grouped by year and filterable by kind (the filter lives in the URL). Also `journey` in the terminal. |
| **Contact form**      | `/contact`                   | Sends a message to the admin inbox (no mail server). Honeypot field + API rate limit block bots.                                                                                           |
| **Admin inbox**       | `/admin/messages`            | Unread badge in the sidebar, click a message to read it, mark read/unread, reply via `mailto:`, undo-able delete.                                                                          |
| **Project pages**     | `/projects/:id`              | Gallery of images, videos and YouTube/Vimeo, full-screen viewer (← → Esc).                                                                                                                 |
| **Shareable filters** | `/projects?tag=Vue`          | Filter lives in the URL.                                                                                                                                                                   |
| **Media uploads**     | Admin forms                  | Project gallery, certification badge, hobby photo, resume PDF. Files go to the backend media driver; only JSON is stored.                                                                  |
| **Editable profile**  | `/admin/profile`             | Name, availability badge, roles, about, photo, skill groups (built-in or uploaded icons) and social links. Until saved once, the site uses the defaults in `src/config/profile.js`.        |
| **Drafts & featured** | admin lists                  | Draft items are hidden from visitors; featured projects appear on the home page.                                                                                                           |
| **Ordering**          | admin lists                  | Drag the ⠿ handle (or use ▲▼) to set the public order.                                                                                                                                     |
| **Undo delete**       | admin lists                  | Deleting shows "Undo" for a few seconds before it becomes permanent.                                                                                                                       |
| **Accessibility**     | everywhere                   | Skip link, focus-trapped dialogs/drawer, keyboard navigation, reduced-motion support.                                                                                                      |
| **SEO**               | `@unhead/vue`                | Per-page `<title>` and description from route `meta` (projects set their own).                                                                                                             |

## Admin access

The admin panel lives at `/admin` and signs in against the Laravel API (Sanctum tokens).
Create or reset the admin account from the backend project:

```sh
php artisan admin:create you@example.com --name="Your Name"
```

## Project structure

```
src/
├── main.js              App entry: Pinia, router, head (SEO), theme, loader
├── App.vue              Root: <RouterView />, page title/description, command palette, shortcuts
├── router/index.js      URL → layout → view map, login guard, scroll behaviour
├── layouts/
│   ├── PublicLayout.vue   Sidebar / mobile drawer / footer frame for visitor pages
│   └── AdminLayout.vue    Sidebar (desktop) / tab strip (mobile) frame for /admin pages
├── views/               One component per page (route)
│   ├── public/            ProfileView, ProjectsView, ProjectDetailView, ResumeView, …
│   ├── admin/             AdminDashboardView, AdminProfileView, AdminProjectsView, …
│   └── TerminalView.vue   Terminal mode screen
├── components/
│   ├── layout/            AppSidebar, MobileHeader (drawer), NavLinks, SearchButton, ThemeToggle…
│   ├── common/            PageSection, SkeletonBlock, StateMessage, AppToast, AppBreadcrumbs, MediaLightbox
│   ├── palette/           CommandPalette
│   ├── terminal/          TerminalLine (renders one output line)
│   ├── skills/            SkillConstellation (the skill → work drawing)
│   └── admin/             AdminModal, AdminPageHeader, FormField, ToggleSwitch, SortableList,
│                          MediaUploader, IconPicker, StringListEditor, CaseStudyEditor
├── composables/         Reusable logic (useX functions)
│   ├── useCommandPalette  Palette open state + global keyboard shortcuts
│   ├── usePaletteCommands Everything the palette can search/run
│   ├── useMediaSession    Deletes uploads from cancelled admin forms
│   ├── useCrudEditor      Add / edit form flow shared by admin pages (+ field errors, dirty state)
│   ├── useUndoableDelete  Delete with an Undo window
│   ├── useUnsavedChanges  Dirty tracking + "leave without saving?" guard
│   ├── useTheme           Light/dark theme, saved per visitor
│   ├── useTypewriter · useScrollProgress · useVisitorCount
├── terminal/            Terminal mode logic (framework-free, unit tested)
│   ├── commands.js        Command registry — add a command here
│   ├── parser.js          Tokenising, flags, Tab completion
│   └── output.js          Output line/part helpers
├── utils/               Pure helpers (unit tested): fuzzy.js (search), media.js (media items),
│                        icons.js (built-in icon sets), validation.js (form checks),
│                        skillGraph.js (skill ↔ project/certification matching)
├── stores/              Pinia stores
│   ├── auth.js            Admin session
│   ├── content.js         Public stores (published only) + admin stores (include drafts)
│   ├── profile.js         Owner profile: saved data merged over config defaults
│   └── toast.js           Status messages (with optional action button)
├── api/                 HTTP layer — client.js (fetch + upload with progress), index.js (endpoints)
├── config/              navigation.js (menus), profile.js (name, about, skills, socials)
├── assets/icons/        Bundled images (skills, socials, theme icons)
└── styles/
    └── main.css           Tailwind setup, design tokens, and the btn-primary / btn-secondary /
                           btn-danger / btn-ghost / form-input / chip / kbd utilities
```

### How to add…

- **A public page:** create `src/views/public/SomethingView.vue` → add the route in
  `src/router/index.js` (inside `PublicLayout` children, with `meta.title/description`) →
  add `{ name, label }` to `publicNav` in `src/config/navigation.js`. It appears in the
  sidebar, mobile drawer, command palette and terminal `ls` automatically.
- **A terminal command:** push an object into `commands` in `src/terminal/commands.js`
  (`name`, `summary`, `run`). `help` and Tab completion pick it up.
- **A palette action:** add it to `actions` in `src/composables/usePaletteCommands.js`.
- **A skill spelling that should match:** add it to `SKILL_ALIASES` in `src/utils/skillGraph.js`
  (e.g. `nuxt: 'nuxtjs'`), then the graph, terminal and palette all pick it up.
- **An admin page:** create `src/views/admin/…View.vue` → add the route under the `/admin`
  children in `src/router/index.js` → add it to `adminNav` in `src/config/navigation.js`.
- **A field to an admin form:** add it to that page's `emptyForm`, render a `<FormField>` with
  `:error="fieldError('field')"`, and allow it in the Laravel controller's validation.

### Where the data comes from

Most pages read a Pinia store that wraps one API resource. Two pages build their view from
several resources instead, in a pure helper that is unit tested:

- `src/utils/journey.js` merges timeline entries, certifications and projects into one dated
  list (`buildJourney`). Dates are free text in the admin ("2019", "June 2024", "Present"), so
  `parseLooseDate`/`dateRank` sort them and undated items are grouped last.
- `src/utils/skillGraph.js` links skills to the projects and certifications that use them.

The inbox has its own store (`src/stores/messages.js`) because the API returns an unread count
alongside the list; it exposes the same `detach`/`restore`/`removeRemote` trio as the content
stores so "Undo delete" works there too.

### Admin notes

- The admin is always dark (`data-theme="dark"`), independent of the visitor theme.
- Public pages read only published content; admin pages load drafts too. After an admin change,
  the matching public store is marked stale so visitor pages refetch.
- Files uploaded in a form that you cancel are deleted automatically (`useMediaSession`).

### Styling

Tailwind utilities are the default. Theme colours are CSS variables mapped to Tailwind names
in `src/styles/main.css` — `bg-page`, `bg-card`, `bg-surface`, `border-line`, `text-heading`,
`text-muted`, `text-accent` — so they switch automatically between light and dark.
Repeated patterns are custom utilities: `btn-primary`, `btn-secondary`, `chip`, `kbd`.
Inline `:style` is only used for values that change at runtime (scroll bar, upload progress).

## CI, containers and deployment

| File                       | What it does                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml` | On every push/PR to `dev` or `main`: lint, format check, tests, build.                      |
| `Dockerfile`               | Production image: Node builds `dist/`, nginx serves it (SPA routing, asset caching).        |
| `Dockerfile.dev`           | Development image: Vite dev server with hot reload.                                         |
| `docker-compose.dev.yml`   | Frontend + API together for local work (expects the two repos side by side).                |
| `docker-compose.prod.yml`  | The live stack, with a persistent volume for uploaded media.                                |
| `DEPLOYMENT.md`            | The `dev` → `main` release flow, environment variables, hosting options, go-live checklist. |

Two things worth knowing before deploying:

- **`VITE_API_URL` is baked in at build time.** Changing the API URL means rebuilding the
  frontend image, not restarting it.
- **Dev and production share one Supabase database,** so migrations must stay additive and
  media stays in one `MEDIA_FOLDER`. `DEPLOYMENT.md` explains the consequences.

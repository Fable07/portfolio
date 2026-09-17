# Caragay Portfolio — Frontend

Personal portfolio built with **Vue 3 + Vite + Tailwind CSS v4 + Pinia + Vue Router**,
backed by a separate Laravel API (`portfolio-backend`).

## Setup

```sh
npm install
npm run dev      # dev server with hot reload
npm run build    # production build → dist/
npm run test     # unit tests (Vitest)
npm run lint     # oxlint + eslint
npm run format   # prettier
```

## Environment

The API base URL comes from `VITE_API_URL` (see `.env.example`).

- `npm run dev` uses `.env.development` (`http://127.0.0.1:8000/api`).
- For production builds, create `.env.production.local` with the deployed API URL.

## Features

| Feature | Where | Notes |
|---|---|---|
| **Command palette** | `Ctrl/⌘ + K` or `/` | Fuzzy search pages, projects, certifications, actions (theme, copy email, resume) and links. Remembers recent commands. |
| **Terminal mode** | `/terminal` or press `` ` `` | `help`, `whoami`, `projects`, `project <name>`, `skills`, `experience`, `contact`, `open <page>`, `theme`, `exit`… Tab completes, ↑/↓ history. |
| **Project pages** | `/projects/:id` | Gallery of images, videos and YouTube/Vimeo, full-screen viewer (← → Esc). |
| **Shareable filters** | `/projects?tag=Vue` | Filter lives in the URL. |
| **Media uploads** | Admin forms | Project gallery, certification badge, hobby photo, resume PDF. Files go to the backend media driver; only JSON is stored. |
| **Accessibility** | everywhere | Skip link, focus-trapped dialogs/drawer, keyboard navigation, reduced-motion support. |
| **SEO** | `@unhead/vue` | Per-page `<title>` and description from route `meta` (projects set their own). |

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
│   └── AdminLayout.vue    Header + tabs + toast frame for /admin pages
├── views/               One component per page (route)
│   ├── public/            ProfileView, ProjectsView, ProjectDetailView, ResumeView, …
│   ├── admin/             AdminLoginView, AdminProjectsView, AdminResumeView, …
│   └── TerminalView.vue   Terminal mode screen
├── components/
│   ├── layout/            AppSidebar, MobileHeader (drawer), NavLinks, SearchButton, ThemeToggle…
│   ├── common/            PageSection, SkeletonBlock, StateMessage, AppToast, AppBreadcrumbs, MediaLightbox
│   ├── palette/           CommandPalette
│   ├── terminal/          TerminalLine (renders one output line)
│   └── admin/             AdminModal, ConfirmDeleteDialog, MediaUploader
├── composables/         Reusable logic (useX functions)
│   ├── useCommandPalette  Palette open state + global keyboard shortcuts
│   ├── usePaletteCommands Everything the palette can search/run
│   ├── useMediaSession    Deletes uploads from cancelled admin forms
│   ├── useCrudEditor      Add / edit / delete flow shared by admin pages
│   ├── useTheme           Light/dark theme, saved per visitor
│   ├── useTypewriter · useScrollProgress · useVisitorCount
├── terminal/            Terminal mode logic (framework-free, unit tested)
│   ├── commands.js        Command registry — add a command here
│   ├── parser.js          Tokenising, flags, Tab completion
│   └── output.js          Output line/part helpers
├── utils/               Pure helpers (unit tested): fuzzy.js (search), media.js (media items)
├── stores/              Pinia stores: auth, content (projects, certifications…), toast
├── api/                 HTTP layer — client.js (fetch + upload with progress), index.js (endpoints)
├── config/              navigation.js (menus), profile.js (name, about, skills, socials)
├── assets/icons/        Bundled images (skills, socials, theme icons)
└── styles/
    ├── main.css           Tailwind setup, design tokens, btn-primary/btn-secondary/chip/kbd utilities
    └── admin.css          Admin-only styles (scoped under .admin-shell)
```

### How to add…

- **A public page:** create `src/views/public/SomethingView.vue` → add the route in
  `src/router/index.js` (inside `PublicLayout` children, with `meta.title/description`) →
  add `{ name, label }` to `publicNav` in `src/config/navigation.js`. It appears in the
  sidebar, mobile drawer, command palette and terminal `ls` automatically.
- **A terminal command:** push an object into `commands` in `src/terminal/commands.js`
  (`name`, `summary`, `run`). `help` and Tab completion pick it up.
- **A palette action:** add it to `actions` in `src/composables/usePaletteCommands.js`.

### Styling

Tailwind utilities are the default. Theme colours are CSS variables mapped to Tailwind names
in `src/styles/main.css` — `bg-page`, `bg-card`, `bg-surface`, `border-line`, `text-heading`,
`text-muted`, `text-accent` — so they switch automatically between light and dark.
Repeated patterns are custom utilities: `btn-primary`, `btn-secondary`, `chip`, `kbd`.
Inline `:style` is only used for values that change at runtime (scroll bar, upload progress).

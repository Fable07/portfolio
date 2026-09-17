# Caragay Portfolio — Frontend

Personal portfolio built with **Vue 3 + Vite + Tailwind CSS v4 + Pinia + Vue Router**,
backed by a separate Laravel API (`portfolio-backend`).

## Setup

```sh
npm install
npm run dev      # dev server with hot reload
npm run build    # production build → dist/
npm run lint     # oxlint + eslint
npm run format   # prettier
```

## Environment

The API base URL comes from `VITE_API_URL` (see `.env.example`).

- `npm run dev` uses `.env.development` (`http://127.0.0.1:8000/api`).
- For production builds, create `.env.production.local` with the deployed API URL.

## Admin access

The admin panel lives at `/admin` and signs in against the Laravel API (Sanctum tokens).
Create or reset the admin account from the backend project:

```sh
php artisan admin:create you@example.com --name="Your Name"
```

## Project structure

```
src/
├── main.js              App entry: installs Pinia + router, applies theme, hides loader
├── App.vue              Root — just <RouterView />
├── router/index.js      URL → layout → view map, login guard, page titles
├── layouts/
│   ├── PublicLayout.vue   Sidebar / mobile header / footer frame for visitor pages
│   └── AdminLayout.vue    Header + tabs + toast frame for /admin pages
├── views/               One component per page (route)
│   ├── public/            ProfileView, AboutView, ProjectsView, ResumeView, …
│   └── admin/             AdminLoginView, AdminProjectsView, AdminResumeView, …
├── components/          Reusable pieces used by views/layouts
│   ├── layout/            AppSidebar, MobileHeader, NavLinks, ThemeToggle, …
│   ├── common/            LoadingDots, StateMessage (empty / error + retry)
│   └── admin/             AdminModal, ConfirmDeleteDialog
├── composables/         Reusable logic (useX functions)
│   ├── useTheme           Light/dark theme, saved per visitor
│   ├── useCrudEditor      Add / edit / delete flow shared by admin pages
│   ├── useTypewriter      Rotating role text on the Profile page
│   ├── useScrollProgress  Scroll bar + back-to-top button state
│   └── useVisitorCount    Profile-views counter
├── stores/              Pinia stores (shared, cached state)
│   ├── auth.js            Admin session (token, sign in/out)
│   ├── content.js         Projects, certifications, hobbies, timeline, resume
│   ├── defineCollectionStore.js  Factory behind the list stores
│   └── toast.js           Admin status messages
├── api/                 HTTP layer — the only place that calls fetch()
│   ├── client.js          Base URL, auth header, JSON + error handling
│   └── index.js           Endpoints per resource (projectsApi, authApi, …)
├── config/              Static content & menus — edit these instead of templates
│   ├── navigation.js      Public menu + admin tabs
│   └── profile.js         Name, roles, skills, social links
├── assets/icons/        Bundled images (skills, socials, theme icons)
└── styles/
    ├── main.css           Tailwind setup, design tokens (colors), shared classes
    └── admin.css          Admin-only styles (scoped under .admin-shell)
```

### How to add a public page

1. Create `src/views/public/SomethingView.vue`.
2. Register the route in `src/router/index.js` (inside the `PublicLayout` children).
3. Add `{ name: 'something', label: 'Something' }` to `publicNav` in `src/config/navigation.js`.

### Styling

Tailwind utilities are the default (`bg-card`, `text-accent`, `max-nav:hidden`…).
Theme colors are CSS variables mapped to Tailwind in `src/styles/main.css`, so they
switch automatically between light and dark. Inline `:style` is only used for values
that change at runtime (e.g. the scroll progress bar).

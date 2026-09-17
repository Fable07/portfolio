import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PublicLayout from '@/layouts/PublicLayout.vue'
import ProfileView from '@/views/public/ProfileView.vue'

/**
 * Router — maps URLs to pages.
 *
 * Structure:  URL → layout (page frame) → view (page content)
 *
 *   /                    PublicLayout → ProfileView
 *   /projects …          PublicLayout → ProjectsView …
 *   /projects/:id        PublicLayout → ProjectDetailView
 *   /terminal            TerminalView (full screen, no layout)
 *   /admin/login         AdminLoginView (no layout)
 *   /admin/projects …    AdminLayout  → AdminProjectsView …  (requires login)
 *
 * Route `meta` fields:
 *   title        → browser tab title (applied in App.vue with @unhead/vue)
 *   description  → <meta name="description"> for search engines & link previews
 *   requiresAuth → redirect to /admin/login when not signed in
 *   guestOnly    → redirect signed-in admins away (the login page)
 *
 * `() => import(...)` = lazy loading: that page's code downloads only when visited.
 */

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      // Profile is the landing page, so it's bundled eagerly for the fastest first paint
      {
        path: '',
        name: 'profile',
        component: ProfileView,
        meta: {
          description:
            'Portfolio of Jefferson S. Caragay — aspiring full-stack developer. Projects, skills, certifications and resume.',
        },
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/views/public/AboutView.vue'),
        meta: { title: 'About', description: 'About Jefferson S. Caragay.' },
      },
      {
        path: 'certifications',
        name: 'certifications',
        component: () => import('@/views/public/CertificationsView.vue'),
        meta: { title: 'Certifications', description: 'Certifications and courses completed.' },
      },
      {
        path: 'resume',
        name: 'resume',
        component: () => import('@/views/public/ResumeView.vue'),
        meta: { title: 'Resume', description: 'Resume, education and work experience.' },
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/views/public/ProjectsView.vue'),
        meta: {
          title: 'Projects',
          description: 'Web and mobile projects with screenshots and demos.',
        },
      },
      {
        path: 'projects/:id(\\d+)',
        name: 'project-detail',
        component: () => import('@/views/public/ProjectDetailView.vue'),
        props: true, // passes :id to the view as a prop
        meta: { title: 'Project' },
      },
      {
        path: 'hobbies',
        name: 'hobbies',
        component: () => import('@/views/public/HobbiesView.vue'),
        meta: { title: 'Hobbies', description: 'Hobbies and interests.' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/public/NotFoundView.vue'),
        meta: { title: 'Page not found' },
      },
    ],
  },

  {
    path: '/terminal',
    name: 'terminal',
    component: () => import('@/views/TerminalView.vue'),
    meta: { title: 'Terminal', description: 'Explore the portfolio from a command line.' },
  },

  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/AdminLoginView.vue'),
    meta: { title: 'Admin sign in', guestOnly: true },
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'admin-certifications' } },
      {
        path: 'certifications',
        name: 'admin-certifications',
        component: () => import('@/views/admin/AdminCertificationsView.vue'),
        meta: { title: 'Manage certifications' },
      },
      {
        path: 'projects',
        name: 'admin-projects',
        component: () => import('@/views/admin/AdminProjectsView.vue'),
        meta: { title: 'Manage projects' },
      },
      {
        path: 'resume',
        name: 'admin-resume',
        component: () => import('@/views/admin/AdminResumeView.vue'),
        meta: { title: 'Manage resume' },
      },
      {
        path: 'timeline',
        name: 'admin-timeline',
        component: () => import('@/views/admin/AdminTimelineView.vue'),
        meta: { title: 'Manage timeline' },
      },
      {
        path: 'hobbies',
        name: 'admin-hobbies',
        component: () => import('@/views/admin/AdminHobbiesView.vue'),
        meta: { title: 'Manage hobbies' },
      },
    ],
  },
]

// Old links used "#section" (e.g. yoursite.com/#projects) — send them to the real page
const LEGACY_HASHES = ['about', 'certifications', 'resume', 'projects', 'hobbies']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition // browser back/forward → restore position
    if (to.path === from.path) return false // only the query changed (e.g. ?tag=Vue) → stay put
    return { top: 0 } // new page → start at the top
  },
})

/* ── Navigation guard: runs before every page change ── */
router.beforeEach(async (to) => {
  const legacyHash = to.path === '/' && to.hash.slice(1)
  if (legacyHash && LEGACY_HASHES.includes(legacyHash)) {
    return { name: legacyHash, replace: true }
  }

  const needsAuth = to.matched.some((record) => record.meta.requiresAuth)
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)
  if (!needsAuth && !guestOnly) return true

  const auth = useAuthStore()
  // A token in storage isn't proof of login — confirm it with the API once per visit
  const signedIn = await auth.ensureVerified()

  if (needsAuth && !signedIn) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  if (guestOnly && signedIn) {
    return { name: 'admin-certifications' }
  }
  return true
})

export default router

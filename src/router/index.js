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
 *   /admin/login         AdminLoginView (no layout)
 *   /admin/projects …    AdminLayout  → AdminProjectsView …  (requires login)
 *
 * Route `meta` fields:
 *   title        → browser tab title (see afterEach below)
 *   requiresAuth → redirect to /admin/login when not signed in
 *   guestOnly    → redirect signed-in admins away (the login page)
 *
 * `() => import(...)` = lazy loading: that page's code downloads only when visited.
 */

const SITE_NAME = 'Jefferson S. Caragay'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      // Profile is the landing page, so it's bundled eagerly for the fastest first paint
      { path: '', name: 'profile', component: ProfileView, meta: { title: 'Portfolio' } },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/views/public/AboutView.vue'),
        meta: { title: 'About' },
      },
      {
        path: 'certifications',
        name: 'certifications',
        component: () => import('@/views/public/CertificationsView.vue'),
        meta: { title: 'Certifications' },
      },
      {
        path: 'resume',
        name: 'resume',
        component: () => import('@/views/public/ResumeView.vue'),
        meta: { title: 'Resume' },
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/views/public/ProjectsView.vue'),
        meta: { title: 'Projects' },
      },
      {
        path: 'hobbies',
        name: 'hobbies',
        component: () => import('@/views/public/HobbiesView.vue'),
        meta: { title: 'Hobbies' },
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
  // New page → start at the top; browser back/forward → restore previous scroll position
  scrollBehavior(to, from, savedPosition) {
    return savedPosition ?? { top: 0 }
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

/* ── After every page change: update the browser tab title ── */
router.afterEach((to) => {
  const title = to.meta.title
  document.title =
    title && title !== 'Portfolio' ? `${title} · ${SITE_NAME}` : `${SITE_NAME} - Portfolio`
})

export default router

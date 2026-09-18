/**
 * Navigation config — the single list of links for each menu.
 *
 * Both the desktop sidebar and the mobile menu render `publicNav`, and the admin
 * tabs render `adminNav`. To add a page: create the view, register its route in
 * src/router/index.js, then add an entry here.
 *
 * `name` must match a route name in the router.
 * `exact: true` means "only highlight on this exact URL" (used for the home page,
 * otherwise "/" would match every page).
 */

export const publicNav = [
  { name: 'profile', label: 'Profile', exact: true },
  { name: 'about', label: 'About' },
  { name: 'certifications', label: 'Certifications' },
  { name: 'resume', label: 'Resume' },
  { name: 'projects', label: 'Projects' },
  { name: 'hobbies', label: 'Hobbies' },
]

/** Admin sidebar (AdminLayout). `exact` works like publicNav: only active on that exact URL. */
export const adminNav = [
  { name: 'admin-dashboard', label: 'Dashboard', icon: '📊', exact: true },
  { name: 'admin-profile', label: 'Profile', icon: '👤' },
  { name: 'admin-projects', label: 'Projects', icon: '🚀' },
  { name: 'admin-certifications', label: 'Certifications', icon: '🏅' },
  { name: 'admin-timeline', label: 'Timeline', icon: '🕐' },
  { name: 'admin-hobbies', label: 'Hobbies', icon: '🎯' },
  { name: 'admin-resume', label: 'Resume', icon: '📄' },
]

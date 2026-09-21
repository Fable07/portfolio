import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { publicNav } from '@/config/navigation'
import { useTheme } from '@/composables/useTheme'
import { useToastStore } from '@/stores/toast'
import { useProfileStore } from '@/stores/profile'
import { useCertificationsStore, useProjectsStore, useResumeStore } from '@/stores/content'

/**
 * usePaletteCommands — everything the command palette can search and run.
 *
 * A command:
 *   id        unique key (also used for "Recent")
 *   group     heading it's listed under: Pages, Projects, Certifications, Actions, Links
 *   title     main text (fuzzy-matched and highlighted)
 *   subtitle  secondary text (also searchable)
 *   keywords  extra hidden search words, e.g. 'dark light mode' for Toggle theme
 *   icon      emoji shown on the left
 *   run()     what happens on Enter / click
 *
 * Projects and certifications come from the stores, so new admin content appears automatically.
 * To add an action: push a new object into `actions` below.
 */

const PAGE_ICONS = {
  profile: '🏠',
  skills: '🧩',
  about: '👋',
  certifications: '🏅',
  resume: '📄',
  projects: '🚀',
  journey: '🗺️',
  hobbies: '🎯',
  contact: '✉️',
}

export function usePaletteCommands() {
  const router = useRouter()
  const theme = useTheme()
  const toast = useToastStore()
  const projects = useProjectsStore()
  const certifications = useCertificationsStore()
  const resume = useResumeStore()
  const profileStore = useProfileStore()
  const profile = computed(() => profileStore.profile)

  /** Load searchable data the first time the palette opens (cached afterwards). */
  function loadData() {
    projects.load()
    certifications.load()
    resume.load()
    profileStore.load()
  }

  const pages = publicNav.map((page) => ({
    id: `page:${page.name}`,
    group: 'Pages',
    title: page.label,
    subtitle: 'Go to page',
    icon: PAGE_ICONS[page.name] ?? '📄',
    run: () => router.push({ name: page.name }),
  }))

  const actions = computed(() => [
    {
      id: 'action:terminal',
      group: 'Actions',
      title: 'Open terminal mode',
      subtitle: 'Explore the portfolio from a command line',
      keywords: 'cli shell console command',
      icon: '⌨️',
      run: () => router.push({ name: 'terminal' }),
    },
    {
      id: 'action:theme',
      group: 'Actions',
      title: theme.isDarkMode.value ? 'Switch to light theme' : 'Switch to dark theme',
      subtitle: 'Toggle colour theme',
      keywords: 'dark light mode appearance',
      icon: theme.isDarkMode.value ? '☀️' : '🌙',
      run: () => theme.toggleTheme(),
    },
    ...(profile.value.email
      ? [
          {
            id: 'action:copy-email',
            group: 'Actions',
            title: 'Copy email address',
            subtitle: profile.value.email,
            keywords: 'contact mail hire',
            icon: '📋',
            run: async () => {
              try {
                await navigator.clipboard.writeText(profile.value.email)
                toast.success('Email copied')
              } catch {
                toast.error(`Couldn't copy — ${profile.value.email}`)
              }
            },
          },
        ]
      : []),
    ...(resume.pdfUrl
      ? [
          {
            id: 'action:resume-pdf',
            group: 'Actions',
            title: 'Download resume (PDF)',
            subtitle: 'Opens in a new tab',
            keywords: 'cv',
            icon: '⬇️',
            run: () => window.open(resume.pdfUrl, '_blank', 'noopener'),
          },
        ]
      : []),
  ])

  const projectCommands = computed(() =>
    projects.items.map((project) => ({
      id: `project:${project.id}`,
      group: 'Projects',
      title: project.title,
      subtitle: project.tech_stack || 'Project',
      keywords: project.description?.slice(0, 120),
      icon: '🚀',
      run: () => router.push({ name: 'project-detail', params: { id: project.id } }),
    })),
  )

  const certificationCommands = computed(() =>
    certifications.items.map((cert) => ({
      id: `cert:${cert.id}`,
      group: 'Certifications',
      title: cert.title,
      subtitle: [cert.issuer, cert.date].filter(Boolean).join(' · ') || 'Certification',
      icon: '🏅',
      run: () =>
        cert.credential_url
          ? window.open(cert.credential_url, '_blank', 'noopener')
          : router.push({ name: 'certifications' }),
    })),
  )

  const skillCommands = computed(() =>
    profile.value.skillGroups.flatMap((group) =>
      group.skills.map((skill) => ({
        id: `skill:${skill.name}`,
        group: 'Skills',
        title: skill.name,
        subtitle: `${group.title} — see where it's used`,
        keywords: 'skill graph stack technology',
        iconUrl: skill.iconUrl,
        icon: '🧩',
        run: () => router.push({ name: 'skills', query: { skill: skill.name } }),
      })),
    ),
  )

  const links = computed(() =>
    profile.value.socialLinks.map((social) => ({
      id: `link:${social.label}`,
      group: 'Links',
      title: social.label,
      subtitle: social.href.replace(/^mailto:/, ''),
      keywords: 'social contact',
      iconUrl: social.iconUrl,
      run: () => window.open(social.href, '_blank', 'noopener'),
    })),
  )

  const commands = computed(() => [
    ...pages,
    ...actions.value,
    ...projectCommands.value,
    ...certificationCommands.value,
    ...skillCommands.value,
    ...links.value,
  ])

  return { commands, loadData }
}

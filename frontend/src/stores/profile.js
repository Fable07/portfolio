import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { profileApi } from '@/api'
import { DEFAULT_AVATAR, defaultProfile } from '@/config/profile'
import { resolveIcon } from '@/utils/icons'
import { cloneMedia } from '@/utils/media'

/**
 * Profile store — "about the owner" content (name, roles, skills, socials…).
 *
 *   raw      data in API shape (saved profile, or defaults from config/profile.js)
 *   profile  display-ready version for components (camelCase, icon URLs resolved)
 *
 * Public pages call load() and read `profile`; /admin/profile edits a copy of `raw`
 * and calls save().
 */
export const useProfileStore = defineStore('profile', () => {
  const saved = ref(null) // null until the API returns a saved profile
  const status = ref('idle')
  const error = ref(null)
  let inFlight = null

  const isLoading = computed(() => status.value === 'idle' || status.value === 'loading')
  const isCustomized = computed(() => !!saved.value)

  /** API-shaped data: saved values over defaults (a field saved empty stays empty). */
  const raw = computed(() => ({ ...defaultProfile, ...saved.value }))

  const profile = computed(() => {
    const data = raw.value
    return {
      name: data.name,
      handle: data.handle || 'guest',
      email: data.email || '',
      location: data.location || '',
      availability: data.availability || '',
      roles: data.roles?.length ? data.roles : [''],
      about: data.about ?? [],
      avatarUrl: data.avatar?.url || DEFAULT_AVATAR,
      avatarAlt: data.avatar?.alt || `Photo of ${data.name}`,
      skillGroups: (data.skill_groups ?? []).map((group) => ({
        title: group.title,
        skills: (group.skills ?? []).map((item) => ({
          name: item.name,
          iconUrl: resolveIcon(item.icon, item.icon_media, 'skill'),
        })),
      })),
      socialLinks: (data.social_links ?? []).map((link) => ({
        label: link.label,
        href: link.href,
        iconUrl: resolveIcon(link.icon, null, 'social'),
      })),
    }
  })

  async function load({ force = false } = {}) {
    if (status.value === 'ready' && !force) return
    if (inFlight) return inFlight
    if (status.value !== 'ready') status.value = 'loading'
    error.value = null

    inFlight = profileApi
      .get()
      .then((data) => {
        saved.value = data?.name ? data : null // GET returns {} before the first save
        status.value = 'ready'
      })
      .catch((err) => {
        error.value = err // defaults stay visible, so the site still works offline
        status.value = 'error'
      })
      .finally(() => (inFlight = null))
    return inFlight
  }

  async function save(data) {
    saved.value = await profileApi.update(data)
    status.value = 'ready'
  }

  /** Editable deep copy for the admin form */
  const editableCopy = () => cloneMedia(raw.value)

  return { raw, profile, status, error, isLoading, isCustomized, load, save, editableCopy }
})

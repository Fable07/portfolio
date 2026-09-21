import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { certificationsApi, hobbiesApi, projectsApi, resumeApi, timelineApi } from '@/api'
import { defineCollectionStore } from './defineCollectionStore'

/**
 * Content stores — the portfolio data.
 *
 * Public stores (useProjectsStore…) hold only PUBLISHED items for visitor pages.
 * Admin stores (useAdminProjectsStore…) also include drafts; whenever the admin changes
 * something, the matching public store is marked stale so visitor pages refetch.
 *
 * Usage in a component:
 *   const projects = useProjectsStore()
 *   onMounted(() => projects.load())
 *   projects.items / projects.isLoading / projects.status === 'error'
 */

export const useProjectsStore = defineCollectionStore('projects', projectsApi)
export const useCertificationsStore = defineCollectionStore('certifications', certificationsApi)
export const useHobbiesStore = defineCollectionStore('hobbies', hobbiesApi)
export const useTimelineStore = defineCollectionStore('timeline', timelineApi)

export const useAdminProjectsStore = defineCollectionStore('admin-projects', projectsApi, {
  drafts: true,
  onChange: () => useProjectsStore().markStale(),
})
export const useAdminCertificationsStore = defineCollectionStore(
  'admin-certifications',
  certificationsApi,
  {
    drafts: true,
    onChange: () => useCertificationsStore().markStale(),
  },
)
export const useAdminHobbiesStore = defineCollectionStore('admin-hobbies', hobbiesApi, {
  onChange: () => useHobbiesStore().markStale(),
})
export const useAdminTimelineStore = defineCollectionStore('admin-timeline', timelineApi, {
  onChange: () => useTimelineStore().markStale(),
})

/**
 * Resume — a single record rather than a list, so it has its own store.
 *   pdfUrl  URL shown on /resume (a pasted URL, or the uploaded PDF's URL)
 *   pdf     uploaded PDF media item, or null when a URL was pasted instead
 */
export const useResumeStore = defineStore('resume', () => {
  const pdfUrl = ref('')
  const pdf = ref(null)
  const status = ref('idle')
  const error = ref(null)

  const isLoading = computed(() => status.value === 'idle' || status.value === 'loading')

  function apply(data) {
    pdfUrl.value = data?.pdf_url || data?.pdf?.url || ''
    pdf.value = data?.pdf ?? null
  }

  async function load({ force = false } = {}) {
    if (status.value === 'ready' && !force) return
    status.value = 'loading'
    error.value = null
    try {
      apply(await resumeApi.get())
      status.value = 'ready'
    } catch (err) {
      error.value = err
      status.value = 'error'
    }
  }

  /** @param {{ pdf_url?: string, pdf?: object|null }} data */
  async function save(data) {
    apply(await resumeApi.update(data))
  }

  return { pdfUrl, pdf, status, error, isLoading, load, save }
})

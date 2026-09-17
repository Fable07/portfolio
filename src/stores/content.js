import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { certificationsApi, hobbiesApi, projectsApi, resumeApi, timelineApi } from '@/api'
import { defineCollectionStore } from './defineCollectionStore'

/**
 * Content stores — the portfolio data shown on public pages and edited in the admin.
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

/** Resume — a single record ({ pdf_url }) rather than a list, so it has its own store. */
export const useResumeStore = defineStore('resume', () => {
  const pdfUrl = ref('')
  const status = ref('idle')
  const error = ref(null)

  const isLoading = computed(() => status.value === 'idle' || status.value === 'loading')

  async function load({ force = false } = {}) {
    if (status.value === 'ready' && !force) return
    status.value = 'loading'
    error.value = null
    try {
      const data = await resumeApi.get()
      pdfUrl.value = data?.pdf_url || ''
      status.value = 'ready'
    } catch (err) {
      error.value = err
      status.value = 'error'
    }
  }

  async function save(url) {
    const data = await resumeApi.update(url)
    pdfUrl.value = data?.pdf_url || url
  }

  return { pdfUrl, status, error, isLoading, load, save }
})

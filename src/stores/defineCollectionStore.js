import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Collection store factory — creates a Pinia store for one list-type API resource
 * (projects, certifications, hobbies, timeline).
 *
 * Why a store instead of fetching inside each component?
 *  • Cache: data is fetched once, then reused when you revisit a page.
 *  • Shared: the admin and the public pages read the same list, so an edit in the
 *    admin shows up on the public page without reloading.
 *
 * `status` lifecycle:  'idle' → 'loading' → 'ready' | 'error'
 *
 * @param {string} id   Unique store name (shows up in Vue Devtools)
 * @param {object} api  Endpoints from src/api — { list, create, update, remove }
 */
export function defineCollectionStore(id, api) {
  return defineStore(id, () => {
    const items = ref([])
    const status = ref('idle')
    const error = ref(null)

    // First load (nothing to show yet) — use for spinners
    const isLoading = computed(() => status.value === 'idle' || status.value === 'loading')

    let inFlight = null // shared promise so two components loading at once make one request

    /**
     * Fetch the list. Skips the request if data is already loaded,
     * unless `force` is true (used after create/update/delete and "Retry").
     */
    async function load({ force = false } = {}) {
      if (status.value === 'ready' && !force) return
      if (inFlight) return inFlight

      if (status.value !== 'ready') status.value = 'loading' // keep old items visible on refresh
      error.value = null

      inFlight = api
        .list()
        .then((data) => {
          items.value = data
          status.value = 'ready'
        })
        .catch((err) => {
          error.value = err
          status.value = 'error'
        })
        .finally(() => {
          inFlight = null
        })

      return inFlight
    }

    // Mutations re-fetch afterwards so ordering/computed fields match the server.
    async function create(data) {
      const created = await api.create(data)
      await load({ force: true })
      return created
    }

    async function update(itemId, data) {
      const updated = await api.update(itemId, data)
      await load({ force: true })
      return updated
    }

    async function remove(itemId) {
      await api.remove(itemId)
      items.value = items.value.filter((item) => item.id !== itemId)
    }

    return { items, status, error, isLoading, load, create, update, remove }
  })
}

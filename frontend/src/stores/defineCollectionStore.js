import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Collection store factory — creates a Pinia store for one list-type API resource
 * (projects, certifications, hobbies, timeline).
 *
 * Why a store instead of fetching inside each component?
 *  • Cache: data is fetched once, then reused when you revisit a page.
 *  • Shared: every component reading the same store sees the same list.
 *
 * `status` lifecycle:  'idle' → 'loading' → 'ready' | 'error'
 *
 * @param {string} id   Unique store name (shows up in Vue Devtools)
 * @param {object} api  Endpoints from src/api — { list, create, update, remove, reorder }
 * @param {object} [options]
 *   drafts     true for admin stores: also load unpublished items
 *   onChange   called after any successful change (admin stores use it to mark the
 *              matching public store stale, so the public site refetches)
 */
export function defineCollectionStore(id, api, { drafts = false, onChange = () => {} } = {}) {
  return defineStore(id, () => {
    const items = ref([])
    const status = ref('idle')
    const error = ref(null)
    const stale = ref(false) // data changed elsewhere — refetch on next load()

    // First load (nothing to show yet) — use for spinners/skeletons
    const isLoading = computed(() => status.value === 'idle' || status.value === 'loading')

    let inFlight = null // shared promise so two components loading at once make one request

    /**
     * Fetch the list. Skips the request if data is already loaded and fresh,
     * unless `force` is true (used after create/update and "Retry").
     */
    async function load({ force = false } = {}) {
      if (status.value === 'ready' && !force && !stale.value) return
      if (inFlight) return inFlight

      if (status.value !== 'ready') status.value = 'loading' // keep old items visible on refresh
      error.value = null

      inFlight = api
        .list({ drafts })
        .then((data) => {
          items.value = data
          status.value = 'ready'
          stale.value = false
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

    /** Mark data as outdated; the next load() fetches again. */
    function markStale() {
      stale.value = true
    }

    // Create/update re-fetch afterwards so ordering/computed fields match the server.
    async function create(data) {
      const created = await api.create(data)
      await load({ force: true })
      onChange()
      return created
    }

    async function update(itemId, data) {
      const updated = await api.update(itemId, data)
      await load({ force: true })
      onChange()
      return updated
    }

    /**
     * Optimistic partial update (e.g. toggling "published"): the UI changes instantly
     * and rolls back if the server refuses.
     */
    async function patch(itemId, changes) {
      const item = findById(itemId)
      const previous = item
        ? Object.fromEntries(Object.keys(changes).map((key) => [key, item[key]]))
        : {}
      if (item) Object.assign(item, changes)
      try {
        const updated = await api.update(itemId, changes)
        if (item) Object.assign(item, updated)
        onChange()
      } catch (err) {
        if (item) Object.assign(item, previous)
        throw err
      }
    }

    async function remove(itemId) {
      await api.remove(itemId)
      items.value = items.value.filter((item) => String(item.id) !== String(itemId))
      onChange()
    }

    /* ── Undo-able delete (see useUndoableDelete) ── */

    /** Hide an item locally; returns what's needed to put it back. */
    function detach(itemId) {
      const index = items.value.findIndex((item) => String(item.id) === String(itemId))
      if (index === -1) return null
      const [item] = items.value.splice(index, 1)
      return { item, index }
    }

    /** Put a detached item back where it was. */
    function restore({ item, index }) {
      items.value.splice(Math.min(index, items.value.length), 0, item)
    }

    /** Actually delete on the server (the item is already hidden). */
    async function removeRemote(itemId, { keepalive = false } = {}) {
      await api.remove(itemId, { keepalive })
      // In case a refetch brought it back while the Undo toast was showing
      items.value = items.value.filter((item) => String(item.id) !== String(itemId))
      onChange()
    }

    /**
     * Save a new order. `orderedIds` is the full list of ids in display order.
     * The list is reordered immediately; on failure it reloads from the server.
     */
    async function reorder(orderedIds) {
      const byId = new Map(items.value.map((item) => [String(item.id), item]))
      items.value = orderedIds.map((itemId) => byId.get(String(itemId))).filter(Boolean)
      try {
        await api.reorder(orderedIds)
        onChange()
      } catch (err) {
        await load({ force: true })
        throw err
      }
    }

    /** Find one item by id (ids from the URL are strings, so compare loosely). */
    function findById(itemId) {
      return items.value.find((item) => String(item.id) === String(itemId)) ?? null
    }

    return {
      items,
      status,
      error,
      isLoading,
      load,
      markStale,
      create,
      update,
      patch,
      remove,
      detach,
      restore,
      removeRemote,
      reorder,
      findById,
    }
  })
}

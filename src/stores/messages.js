import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { messagesApi } from '@/api'

/**
 * Messages store — the admin inbox (contact form submissions).
 *
 * Kept separate from the content stores because the API returns an unread count
 * alongside the list, and messages are never shown on the public site.
 */
export const useMessagesStore = defineStore('messages', () => {
  const items = ref([])
  const unread = ref(0)
  const status = ref('idle')
  const error = ref(null)
  let inFlight = null

  const isLoading = computed(() => status.value === 'idle' || status.value === 'loading')

  async function load({ force = false } = {}) {
    if (status.value === 'ready' && !force) return
    if (inFlight) return inFlight
    if (status.value !== 'ready') status.value = 'loading'
    error.value = null

    inFlight = messagesApi
      .list()
      .then((response) => {
        items.value = response.data
        unread.value = response.unread
        status.value = 'ready'
      })
      .catch((err) => {
        error.value = err
        status.value = 'error'
      })
      .finally(() => (inFlight = null))
    return inFlight
  }

  /** Mark read/unread; the row updates immediately and rolls back if the server refuses. */
  async function setRead(id, read) {
    const message = items.value.find((item) => item.id === id)
    if (!message) return
    const previous = message.is_read
    message.is_read = read
    unread.value += read ? -1 : 1
    try {
      const updated = await messagesApi.setRead(id, read)
      Object.assign(message, updated)
    } catch (err) {
      message.is_read = previous
      unread.value += read ? 1 : -1
      throw err
    }
  }

  /* ── Undo-able delete (same shape as the content stores) ── */

  function detach(id) {
    const index = items.value.findIndex((item) => item.id === id)
    if (index === -1) return null
    const [item] = items.value.splice(index, 1)
    if (!item.is_read) unread.value = Math.max(0, unread.value - 1)
    return { item, index }
  }

  function restore({ item, index }) {
    items.value.splice(Math.min(index, items.value.length), 0, item)
    if (!item.is_read) unread.value += 1
  }

  async function removeRemote(id, { keepalive = false } = {}) {
    await messagesApi.remove(id, { keepalive })
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, unread, status, error, isLoading, load, setRead, detach, restore, removeRemote }
})

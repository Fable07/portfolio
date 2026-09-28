import { onBeforeUnmount } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useToastStore } from '@/stores/toast'

/**
 * useUndoableDelete — "Deleted · Undo" instead of an "Are you sure?" dialog.
 *
 * The item disappears immediately, a toast offers Undo for a few seconds, and only then
 * is it deleted on the server (together with its uploaded files).
 * If you leave the page or close the tab first, the delete is sent right away
 * (a keepalive request survives the tab closing).
 *
 *   const { deleteWithUndo } = useUndoableDelete(store, { label: 'Project', nameOf: (p) => p.title })
 *   <button @click="deleteWithUndo(project)">Delete</button>
 *
 * @param store  collection store with detach / restore / removeRemote (defineCollectionStore)
 */
export function useUndoableDelete(store, { label, nameOf = (item) => item.title, delay = 6000 }) {
  const toast = useToastStore()
  const pending = new Map() // id → { detached, timer }

  async function commit(id, { keepalive = false } = {}) {
    const entry = pending.get(id)
    if (!entry) return
    clearTimeout(entry.timer)
    pending.delete(id)
    try {
      await store.removeRemote(id, { keepalive })
    } catch (err) {
      store.restore(entry.detached) // server refused — bring the item back
      toast.error(`Couldn't delete ${label.toLowerCase()}: ${err.message}`)
    }
  }

  function deleteWithUndo(item) {
    const detached = store.detach(item.id)
    if (!detached) return

    const timer = setTimeout(() => commit(item.id), delay)
    pending.set(item.id, { detached, timer })

    toast.withAction(
      `${label} “${nameOf(item)}” deleted`,
      {
        label: 'Undo',
        run: () => {
          const entry = pending.get(item.id)
          if (!entry) return
          clearTimeout(entry.timer)
          pending.delete(item.id)
          store.restore(entry.detached)
        },
      },
      delay,
    )
  }

  function flushAll(options) {
    // snapshot the ids first: commit() removes entries as it goes
    for (const id of Array.from(pending.keys())) commit(id, options)
  }

  // Navigating away inside the app, or closing the tab: finish pending deletes now
  onBeforeUnmount(() => flushAll())
  useEventListener(window, 'pagehide', () => flushAll({ keepalive: true }))

  return { deleteWithUndo }
}

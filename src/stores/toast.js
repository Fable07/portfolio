import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Toast store — short status messages shown at the bottom of the screen.
 *
 * Usage:  const toast = useToastStore()
 *         toast.success('Project saved')
 *         toast.error('Delete failed')
 *         toast.withAction('Project deleted', { label: 'Undo', run: () => … }, 6000)
 */
export const useToastStore = defineStore('toast', () => {
  // { id, message, type: 'success' | 'error', action?: { label, run } } or null
  const current = ref(null)
  let timer = null
  let nextId = 0

  function show(message, type = 'success', duration = 3000, action = null) {
    clearTimeout(timer)
    const id = nextId++
    current.value = { id, message, type, action }
    timer = setTimeout(() => {
      if (current.value?.id === id) current.value = null
    }, duration)
  }

  function dismiss() {
    clearTimeout(timer)
    current.value = null
  }

  /** Run the toast's action button (e.g. Undo) and close the toast */
  function runAction() {
    const action = current.value?.action
    dismiss()
    action?.run()
  }

  return {
    current,
    show,
    dismiss,
    runAction,
    success: (message) => show(`✔ ${message}`, 'success'),
    error: (message) => show(`✘ ${message}`, 'error', 5000),
    withAction: (message, action, duration = 6000) => show(message, 'success', duration, action),
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Toast store — short status messages ("✔ Project saved") shown at the top of the admin.
 *
 * Usage:  const toast = useToastStore()
 *         toast.success('Project saved')   /   toast.error('Delete failed')
 */
export const useToastStore = defineStore('toast', () => {
  const current = ref(null) // { message, type: 'success' | 'error' } or null
  let timer = null

  function show(message, type = 'success', duration = 3000) {
    clearTimeout(timer)
    current.value = { message, type }
    timer = setTimeout(() => (current.value = null), duration)
  }

  return {
    current,
    show,
    success: (message) => show(`✔ ${message}`, 'success'),
    error: (message) => show(`✘ ${message}`, 'error', 5000),
  }
})

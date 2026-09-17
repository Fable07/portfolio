import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'

/**
 * useCommandPalette — open/close state for the command palette (one shared instance).
 *
 *   const palette = useCommandPalette()
 *   palette.open()   /   <button @click="palette.toggle()">Search ⌘K</button>
 */
const isOpen = ref(false)

export function useCommandPalette() {
  return {
    isOpen,
    open: () => (isOpen.value = true),
    close: () => (isOpen.value = false),
    toggle: () => (isOpen.value = !isOpen.value),
  }
}

/** Is the user typing in a field? (Single-key shortcuts must not fire then.) */
function isTyping(event) {
  const el = event.target
  return (
    el instanceof HTMLElement &&
    (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
  )
}

/** Detect Mac so hints can show ⌘ instead of Ctrl. */
export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const modKeyLabel = isMac ? '⌘' : 'Ctrl'

/**
 * useGlobalShortcuts — keyboard shortcuts for the public site. Call ONCE (App.vue).
 *
 *   Ctrl/⌘ + K   toggle command palette (works even while typing)
 *   /            open command palette
 *   `            open terminal mode
 *
 * Shortcuts are disabled on /admin pages.
 */
export function useGlobalShortcuts() {
  const router = useRouter()
  const route = useRoute()

  useEventListener(document, 'keydown', (event) => {
    if (route.path.startsWith('/admin')) return

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      isOpen.value = !isOpen.value
      return
    }
    if (isOpen.value || isTyping(event) || event.ctrlKey || event.metaKey || event.altKey) return

    if (event.key === '/') {
      event.preventDefault()
      isOpen.value = true
    } else if (event.key === '`' && route.name !== 'terminal') {
      event.preventDefault()
      router.push({ name: 'terminal' })
    }
  })
}

import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * useScrollProgress — how far the page is scrolled.
 *
 * @param {number} backToTopAfter  Pixels scrolled before `showBackToTop` turns true
 * @returns {{ progress: Ref<number>, showBackToTop: Ref<boolean>, scrollToTop: () => void }}
 *   progress is 0–100 (percent of the page scrolled)
 */
export function useScrollProgress(backToTopAfter = 300) {
  const progress = ref(0)
  const showBackToTop = ref(false)

  function update() {
    const el = document.documentElement
    const scrolled = el.scrollTop || document.body.scrollTop
    const total = el.scrollHeight - el.clientHeight
    progress.value = total > 0 ? (scrolled / total) * 100 : 0
    showBackToTop.value = scrolled > backToTopAfter
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  onMounted(() => {
    window.addEventListener('scroll', update, { passive: true })
    update()
  })
  onBeforeUnmount(() => window.removeEventListener('scroll', update))

  return { progress, showBackToTop, scrollToTop, update }
}

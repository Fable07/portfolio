import { computed, ref, toValue } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useEventListener } from '@vueuse/core'

/**
 * useDirtyState — knows whether a form differs from its last saved snapshot.
 *
 *   const { isDirty, snapshot } = useDirtyState(() => form.value)
 *   snapshot()          // call after loading or saving
 */
export function useDirtyState(source) {
  const saved = ref('')
  const serialize = () => JSON.stringify(toValue(source) ?? null)

  return {
    isDirty: computed(() => saved.value !== '' && serialize() !== saved.value),
    snapshot: () => (saved.value = serialize()),
  }
}

/**
 * useUnsavedChangesGuard — warn before losing unsaved edits on a full page (not a modal).
 *  • leaving via the app's navigation → confirm dialog
 *  • closing/reloading the tab → the browser's "Leave site?" prompt
 *
 * @param {import('vue').Ref<boolean>|() => boolean} isDirty
 */
export function useUnsavedChangesGuard(isDirty) {
  onBeforeRouteLeave(() => {
    if (!toValue(isDirty)) return true
    return window.confirm('You have unsaved changes. Leave without saving?')
  })

  useEventListener(window, 'beforeunload', (event) => {
    if (!toValue(isDirty)) return
    event.preventDefault()
    event.returnValue = '' // required by some browsers to show the prompt
  })
}

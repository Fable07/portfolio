<!--
  AdminModal — dialog for admin forms.

  <AdminModal :open="editor.open" title="Edit Project" :dirty="isDirty" size="lg" @close="closeEditor">
    …fields…
    <template #aside> …optional right column, e.g. live preview… </template>
    <template #actions> …Cancel / Save… </template>
  </AdminModal>

  • Closes on Escape, backdrop click or the ✕ button — but if `dirty` (unsaved changes)
    it first asks "Discard changes?" instead of closing.
  • Keyboard focus is trapped inside while open; the page behind can't scroll.
  • `error` shows a form-level message above the actions.
-->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        data-theme="dark"
        class="fixed inset-0 z-[1000] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
        @mousedown.self="requestClose"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          class="flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-card text-muted shadow-[0_32px_80px_rgba(0,0,0,0.7)] sm:rounded-2xl"
          :class="SIZES[size]"
        >
          <header class="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 :id="titleId" class="m-0 text-lg font-bold text-heading">{{ title }}</h2>
            <button
              type="button"
              class="btn-ghost px-2.5!"
              aria-label="Close"
              @click="requestClose"
            >
              ✕
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto">
            <div class="grid gap-6 p-5" :class="$slots.aside ? 'lg:grid-cols-[1fr_320px]' : ''">
              <div class="grid content-start gap-4">
                <slot />
              </div>
              <aside v-if="$slots.aside" class="lg:sticky lg:top-0 lg:self-start">
                <slot name="aside" />
              </aside>
            </div>
          </div>

          <footer class="border-t border-line px-5 py-3.5">
            <!-- Unsaved-changes confirmation replaces the normal footer -->
            <div
              v-if="confirmingDiscard"
              class="flex flex-wrap items-center justify-between gap-3"
              role="alert"
            >
              <span class="text-sm font-semibold text-amber-300">Discard unsaved changes?</span>
              <span class="flex gap-2">
                <button type="button" class="btn-ghost" @click="confirmingDiscard = false">
                  Keep editing
                </button>
                <button type="button" class="btn-danger" @click="discard">Discard</button>
              </span>
            </div>
            <template v-else>
              <p
                v-if="error"
                class="m-0 mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300"
                role="alert"
              >
                {{ error }}
              </p>
              <div class="flex flex-wrap justify-end gap-2">
                <slot name="actions" />
              </div>
            </template>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, ref, useId, watch } from 'vue'
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  error: { type: String, default: '' },
  dirty: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
})
const emit = defineEmits(['close'])

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-5xl' }

const titleId = useId()
const panel = ref(null)
const confirmingDiscard = ref(false)

const { activate, deactivate } = useFocusTrap(panel, { immediate: false, allowOutsideClick: true })
const scrollLock = useScrollLock(document.body)

watch(
  () => props.open,
  async (isOpen) => {
    scrollLock.value = isOpen
    confirmingDiscard.value = false
    if (isOpen) {
      await nextTick()
      activate()
    } else deactivate()
  },
)

function requestClose() {
  if (props.dirty) confirmingDiscard.value = true
  else emit('close')
}

function discard() {
  confirmingDiscard.value = false
  emit('close')
}

onKeyStroke('Escape', () => props.open && requestClose())
</script>

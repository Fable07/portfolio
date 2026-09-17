<!--
  AdminModal — popup form dialog used by every admin page for "Add" / "Edit".

  <AdminModal :open="editor.open" title="Add Project" :error="editor.error" @close="closeEditor">
    …form fields…
    <template #actions> …Cancel / Save buttons… </template>
  </AdminModal>

  Closes on backdrop click or the Escape key.
-->
<template>
  <Transition name="modal">
    <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
      <div
        class="modal-card"
        :class="{ 'modal-card--sm': size === 'sm' }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <h3 :id="titleId" class="modal-title">{{ title }}</h3>

        <div class="modal-fields">
          <slot />
        </div>

        <p v-if="error" class="login-error" role="alert">{{ error }}</p>

        <div class="modal-actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useId, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  error: { type: String, default: '' },
  size: { type: String, default: 'md' }, // 'md' | 'sm'
})
const emit = defineEmits(['close'])

const titleId = useId() // unique id linking the dialog to its title for screen readers

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

// Only listen for Escape while the modal is open
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  },
)
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

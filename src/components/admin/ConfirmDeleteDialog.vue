<!--
  ConfirmDeleteDialog — "Delete Project? 'X' will be permanently removed."
  Emits "confirm" or "cancel"; the parent does the actual delete.
-->
<template>
  <AdminModal :open="open" :title="`Delete ${itemType}?`" size="sm" @close="$emit('cancel')">
    <p class="modal-sub">
      "<strong>{{ itemName }}</strong
      >" will be permanently removed.
    </p>

    <template #actions>
      <button type="button" class="btn-ghost" @click="$emit('cancel')">Cancel</button>
      <button type="button" class="btn-danger" :disabled="deleting" @click="$emit('confirm')">
        {{ deleting ? 'Deleting...' : 'Delete' }}
      </button>
    </template>
  </AdminModal>
</template>

<script setup>
import AdminModal from './AdminModal.vue'

defineProps({
  open: { type: Boolean, default: false },
  itemType: { type: String, required: true }, // e.g. "Project"
  itemName: { type: String, default: '' }, // e.g. "Portfolio Website"
  deleting: { type: Boolean, default: false },
})
defineEmits(['confirm', 'cancel'])
</script>

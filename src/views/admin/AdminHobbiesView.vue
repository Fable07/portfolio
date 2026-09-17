<!-- AdminHobbiesView — /admin/hobbies — list, add, edit and delete hobbies -->
<template>
  <section>
    <div class="admin-toolbar">
      <button type="button" class="btn-primary btn--icon" @click="openCreate">
        <span aria-hidden="true">＋</span> Add Hobby
      </button>
      <span class="cert-count">
        {{ store.items.length }} hobb{{ store.items.length !== 1 ? 'ies' : 'y' }}
      </span>
    </div>

    <div v-if="store.isLoading" class="admin-empty"><p>Loading...</p></div>

    <div v-else-if="store.status === 'error'" class="admin-empty">
      <p>Couldn't load hobbies: {{ store.error?.message }}</p>
      <button type="button" class="btn-ghost" @click="store.load({ force: true })">
        Try again
      </button>
    </div>

    <div v-else-if="store.items.length === 0" class="admin-empty">
      <div class="admin-empty__icon" aria-hidden="true">🎯</div>
      <p>No hobbies yet. Add your first one!</p>
    </div>

    <div v-else class="cert-table-wrap">
      <table class="cert-table">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Description</th>
            <th class="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hobby in store.items" :key="hobby.id" class="cert-row">
            <td class="td-muted">{{ hobby.icon || '—' }}</td>
            <td class="td-title">{{ hobby.name }}</td>
            <td class="td-muted td-desc">{{ hobby.description || '—' }}</td>
            <td class="td-actions">
              <button
                type="button"
                class="btn-edit"
                :aria-label="`Edit ${hobby.name}`"
                @click="openEdit(hobby)"
              >
                ✏️
              </button>
              <button
                type="button"
                class="btn-delete"
                :aria-label="`Delete ${hobby.name}`"
                @click="askDelete(hobby)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add / Edit form -->
    <AdminModal
      :open="editor.open"
      :title="editor.isEdit ? 'Edit Hobby' : 'Add Hobby'"
      :error="editor.error"
      @close="closeEditor"
    >
      <div class="field">
        <label class="field__label" for="hobby-name">Name <span class="req">*</span></label>
        <input
          id="hobby-name"
          v-model="editor.form.name"
          class="field__input"
          placeholder="e.g. Photography"
        />
      </div>
      <div class="field">
        <label class="field__label" for="hobby-icon">Icon (Emoji)</label>
        <input
          id="hobby-icon"
          v-model="editor.form.icon"
          class="field__input"
          placeholder="e.g. 📷"
        />
      </div>
      <div class="field">
        <label class="field__label" for="hobby-desc">Description</label>
        <textarea
          id="hobby-desc"
          v-model="editor.form.description"
          class="field__input field__textarea"
          placeholder="Brief description of this hobby..."
        ></textarea>
      </div>

      <template #actions>
        <button type="button" class="btn-ghost" @click="closeEditor">Cancel</button>
        <button type="button" class="btn-primary" :disabled="editor.saving" @click="save">
          {{ editor.saving ? 'Saving...' : editor.isEdit ? 'Save Changes' : 'Add Hobby' }}
        </button>
      </template>
    </AdminModal>

    <ConfirmDeleteDialog
      :open="deletion.open"
      item-type="Hobby"
      :item-name="deleteName"
      :deleting="deletion.deleting"
      @cancel="cancelDelete"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHobbiesStore } from '@/stores/content'
import { useCrudEditor, requiredFields } from '@/composables/useCrudEditor'
import AdminModal from '@/components/admin/AdminModal.vue'
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog.vue'

const store = useHobbiesStore()

const {
  editor,
  openCreate,
  openEdit,
  closeEditor,
  save,
  deletion,
  deleteName,
  askDelete,
  cancelDelete,
  confirmDelete,
} = useCrudEditor(store, {
  label: 'Hobby',
  emptyForm: { name: '', icon: '', description: '' },
  validate: (form) => requiredFields(form, { name: 'Name' }),
  nameOf: (hobby) => hobby.name,
})

onMounted(() => store.load())
</script>

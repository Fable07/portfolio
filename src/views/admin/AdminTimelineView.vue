<!-- AdminTimelineView — /admin/timeline — education & work entries shown on the Resume page -->
<template>
  <section>
    <div class="admin-toolbar">
      <button type="button" class="btn-primary btn--icon" @click="openCreate">
        <span aria-hidden="true">＋</span> Add Entry
      </button>
      <span class="cert-count">
        {{ store.items.length }} entr{{ store.items.length !== 1 ? 'ies' : 'y' }}
      </span>
    </div>

    <div v-if="store.isLoading" class="admin-empty"><p>Loading...</p></div>

    <div v-else-if="store.status === 'error'" class="admin-empty">
      <p>Couldn't load the timeline: {{ store.error?.message }}</p>
      <button type="button" class="btn-ghost" @click="store.load({ force: true })">
        Try again
      </button>
    </div>

    <div v-else-if="store.items.length === 0" class="admin-empty">
      <div class="admin-empty__icon" aria-hidden="true">🕐</div>
      <p>No timeline entries yet. Add your education or work experience!</p>
    </div>

    <div v-else class="cert-table-wrap">
      <table class="cert-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Institution</th>
            <th>Period</th>
            <th>Location</th>
            <th class="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in store.items" :key="entry.id" class="cert-row">
            <td>
              <span :class="entry.type === 'education' ? 'badge-edu' : 'badge-work'">
                {{ entry.type === 'education' ? '🎓 Education' : '💼 Work' }}
              </span>
            </td>
            <td class="td-title">{{ entry.title }}</td>
            <td class="td-muted">{{ entry.institution }}</td>
            <td class="td-muted">{{ entry.start_date }} — {{ entry.end_date || 'Present' }}</td>
            <td class="td-muted">{{ entry.location || '—' }}</td>
            <td class="td-actions">
              <button
                type="button"
                class="btn-edit"
                :aria-label="`Edit ${entry.title}`"
                @click="openEdit(entry)"
              >
                ✏️
              </button>
              <button
                type="button"
                class="btn-delete"
                :aria-label="`Delete ${entry.title}`"
                @click="askDelete(entry)"
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
      :title="editor.isEdit ? 'Edit Entry' : 'Add Timeline Entry'"
      :error="editor.error"
      @close="closeEditor"
    >
      <div class="field">
        <label class="field__label" for="tl-type">Type <span class="req">*</span></label>
        <select id="tl-type" v-model="editor.form.type" class="field__input">
          <option value="education">🎓 Education</option>
          <option value="work">💼 Work Experience</option>
        </select>
      </div>
      <div class="field">
        <label class="field__label" for="tl-title">Title <span class="req">*</span></label>
        <input
          id="tl-title"
          v-model="editor.form.title"
          class="field__input"
          placeholder="e.g. Bachelor of Science in IT"
        />
      </div>
      <div class="field">
        <label class="field__label" for="tl-institution"
          >Institution <span class="req">*</span></label
        >
        <input
          id="tl-institution"
          v-model="editor.form.institution"
          class="field__input"
          placeholder="e.g. Gordon College"
        />
      </div>
      <div class="field">
        <label class="field__label" for="tl-location">Location</label>
        <input
          id="tl-location"
          v-model="editor.form.location"
          class="field__input"
          placeholder="e.g. Olongapo City"
        />
      </div>
      <div class="modal-row">
        <div class="field">
          <label class="field__label" for="tl-start">Start Date <span class="req">*</span></label>
          <input
            id="tl-start"
            v-model="editor.form.start_date"
            class="field__input"
            placeholder="e.g. 2020 or Jun 2020"
          />
        </div>
        <div class="field">
          <label class="field__label" for="tl-end">End Date</label>
          <input
            id="tl-end"
            v-model="editor.form.end_date"
            class="field__input"
            placeholder="Leave empty for Present"
          />
        </div>
      </div>
      <div class="field">
        <label class="field__label" for="tl-desc">Description</label>
        <textarea
          id="tl-desc"
          v-model="editor.form.description"
          class="field__input field__textarea"
          placeholder="Brief description of your role or course..."
        ></textarea>
      </div>

      <template #actions>
        <button type="button" class="btn-ghost" @click="closeEditor">Cancel</button>
        <button type="button" class="btn-primary" :disabled="editor.saving" @click="save">
          {{ editor.saving ? 'Saving...' : editor.isEdit ? 'Save Changes' : 'Add Entry' }}
        </button>
      </template>
    </AdminModal>

    <ConfirmDeleteDialog
      :open="deletion.open"
      item-type="Timeline Entry"
      :item-name="deleteName"
      :deleting="deletion.deleting"
      @cancel="cancelDelete"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTimelineStore } from '@/stores/content'
import { useCrudEditor, requiredFields } from '@/composables/useCrudEditor'
import AdminModal from '@/components/admin/AdminModal.vue'
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog.vue'

const store = useTimelineStore()

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
  label: 'Timeline entry',
  emptyForm: {
    type: 'education',
    title: '',
    institution: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
  },
  validate: (form) =>
    requiredFields(form, { title: 'Title', institution: 'Institution', start_date: 'Start date' }),
})

onMounted(() => store.load())
</script>

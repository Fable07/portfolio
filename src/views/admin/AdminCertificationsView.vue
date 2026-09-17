<!-- AdminCertificationsView — /admin/certifications — list, add, edit and delete certifications -->
<template>
  <section>
    <div class="admin-toolbar">
      <button type="button" class="btn-primary btn--icon" @click="openCreate">
        <span aria-hidden="true">＋</span> Add Certification
      </button>
      <span class="cert-count">
        {{ store.items.length }} certification{{ store.items.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <div v-if="store.isLoading" class="admin-empty"><p>Loading...</p></div>

    <div v-else-if="store.status === 'error'" class="admin-empty">
      <p>Couldn't load certifications: {{ store.error?.message }}</p>
      <button type="button" class="btn-ghost" @click="store.load({ force: true })">
        Try again
      </button>
    </div>

    <div v-else-if="store.items.length === 0" class="admin-empty">
      <div class="admin-empty__icon" aria-hidden="true">📋</div>
      <p>No certifications yet. Add your first one!</p>
    </div>

    <div v-else class="cert-table-wrap">
      <table class="cert-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Issuer</th>
            <th>Date</th>
            <th>Credential URL</th>
            <th>Badge URL</th>
            <th class="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cert in store.items" :key="cert.id" class="cert-row">
            <td class="td-title">{{ cert.title }}</td>
            <td class="td-muted">{{ cert.issuer || '—' }}</td>
            <td class="td-muted">{{ cert.date || '—' }}</td>
            <td class="td-url">
              <a
                v-if="cert.credential_url"
                :href="cert.credential_url"
                target="_blank"
                rel="noopener"
                class="url-link"
                >↗ Link</a
              >
              <span v-else class="td-muted">—</span>
            </td>
            <td class="td-url">
              <img
                v-if="cert.badge?.url || cert.badge_url"
                :src="cert.badge?.url || cert.badge_url"
                alt=""
                class="size-8 rounded object-contain"
              />
              <span v-else class="td-muted">—</span>
            </td>
            <td class="td-actions">
              <button
                type="button"
                class="btn-edit"
                :aria-label="`Edit ${cert.title}`"
                @click="openEdit(cert)"
              >
                ✏️
              </button>
              <button
                type="button"
                class="btn-delete"
                :aria-label="`Delete ${cert.title}`"
                @click="askDelete(cert)"
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
      :title="editor.isEdit ? 'Edit Certification' : 'Add Certification'"
      :error="editor.error"
      @close="closeEditor"
    >
      <div class="field">
        <label class="field__label" for="cert-title">Title <span class="req">*</span></label>
        <input
          id="cert-title"
          v-model="editor.form.title"
          class="field__input"
          placeholder="e.g. AWS Solutions Architect"
        />
      </div>
      <div class="field">
        <label class="field__label" for="cert-issuer">Issuer</label>
        <input
          id="cert-issuer"
          v-model="editor.form.issuer"
          class="field__input"
          placeholder="e.g. Amazon Web Services"
        />
      </div>
      <div class="field">
        <label class="field__label" for="cert-date">Date</label>
        <input
          id="cert-date"
          v-model="editor.form.date"
          class="field__input"
          placeholder="e.g. 2024 or Jan 2025"
        />
      </div>
      <div class="field">
        <label class="field__label" for="cert-credential">Credential URL</label>
        <input
          id="cert-credential"
          v-model="editor.form.credential_url"
          type="url"
          class="field__input"
          placeholder="https://..."
        />
      </div>
      <MediaUploader
        v-model="editor.form.badge"
        collection="certifications"
        label="Badge / certificate image"
        accept="image/jpeg,image/png,image/webp,image/gif"
      />
      <div v-if="!editor.form.badge" class="field">
        <label class="field__label" for="cert-badge">…or badge image URL</label>
        <input
          id="cert-badge"
          v-model="editor.form.badge_url"
          type="url"
          class="field__input"
          placeholder="https://..."
        />
      </div>

      <template #actions>
        <button type="button" class="btn-ghost" @click="closeEditor">Cancel</button>
        <button type="button" class="btn-primary" :disabled="editor.saving" @click="save">
          {{ editor.saving ? 'Saving...' : editor.isEdit ? 'Save Changes' : 'Add Certification' }}
        </button>
      </template>
    </AdminModal>

    <ConfirmDeleteDialog
      :open="deletion.open"
      item-type="Certification"
      :item-name="deleteName"
      :deleting="deletion.deleting"
      @cancel="cancelDelete"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCertificationsStore } from '@/stores/content'
import { useCrudEditor, requiredFields } from '@/composables/useCrudEditor'
import AdminModal from '@/components/admin/AdminModal.vue'
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog.vue'
import MediaUploader from '@/components/admin/MediaUploader.vue'

const store = useCertificationsStore()

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
  label: 'Certification',
  emptyForm: {
    title: '',
    issuer: '',
    date: '',
    credential_url: '',
    badge_url: '',
    badge: null, // uploaded badge image (media item JSON) — takes priority over badge_url
  },
  validate: (form) => requiredFields(form, { title: 'Title' }),
})

onMounted(() => store.load())
</script>

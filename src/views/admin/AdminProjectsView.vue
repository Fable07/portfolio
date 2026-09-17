<!-- AdminProjectsView — /admin/projects — list, add, edit and delete projects -->
<template>
  <section>
    <div class="admin-toolbar">
      <button type="button" class="btn-primary btn--icon" @click="openCreate">
        <span aria-hidden="true">＋</span> Add Project
      </button>
      <span class="cert-count">
        {{ store.items.length }} project{{ store.items.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <div v-if="store.isLoading" class="admin-empty"><p>Loading...</p></div>

    <div v-else-if="store.status === 'error'" class="admin-empty">
      <p>Couldn't load projects: {{ store.error?.message }}</p>
      <button type="button" class="btn-ghost" @click="store.load({ force: true })">
        Try again
      </button>
    </div>

    <div v-else-if="store.items.length === 0" class="admin-empty">
      <div class="admin-empty__icon" aria-hidden="true">🚀</div>
      <p>No projects yet. Add your first one!</p>
    </div>

    <div v-else class="cert-table-wrap">
      <table class="cert-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Tech Stack</th>
            <th>Project URL</th>
            <th>GitHub URL</th>
            <th class="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in store.items" :key="project.id" class="cert-row">
            <td class="td-title">
              <span class="flex items-center gap-2.5">
                <img
                  v-if="projectCover(project)"
                  :src="projectCover(project)"
                  alt=""
                  class="h-9 w-14 shrink-0 rounded object-cover"
                />
                <span>
                  {{ project.title }}
                  <span v-if="mediaCount(project)" class="block text-xs font-normal text-[#9aa4b2]">
                    {{ mediaCount(project) }} media
                  </span>
                </span>
              </span>
            </td>
            <td class="td-muted td-desc">{{ project.description || '—' }}</td>
            <td class="td-muted">{{ project.tech_stack || '—' }}</td>
            <td class="td-url">
              <a
                v-if="project.project_url"
                :href="project.project_url"
                target="_blank"
                rel="noopener"
                class="url-link"
                >↗ Link</a
              >
              <span v-else class="td-muted">—</span>
            </td>
            <td class="td-url">
              <a
                v-if="project.github_url"
                :href="project.github_url"
                target="_blank"
                rel="noopener"
                class="url-link"
                >↗ GitHub</a
              >
              <span v-else class="td-muted">—</span>
            </td>
            <td class="td-actions">
              <button
                type="button"
                class="btn-edit"
                :aria-label="`Edit ${project.title}`"
                @click="openEdit(project)"
              >
                ✏️
              </button>
              <button
                type="button"
                class="btn-delete"
                :aria-label="`Delete ${project.title}`"
                @click="askDelete(project)"
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
      :title="editor.isEdit ? 'Edit Project' : 'Add Project'"
      :error="editor.error"
      @close="closeEditor"
    >
      <div class="field">
        <label class="field__label" for="proj-title">Title <span class="req">*</span></label>
        <input
          id="proj-title"
          v-model="editor.form.title"
          class="field__input"
          placeholder="e.g. Portfolio Website"
        />
      </div>
      <div class="field">
        <label class="field__label" for="proj-desc">Description</label>
        <textarea
          id="proj-desc"
          v-model="editor.form.description"
          class="field__input field__textarea"
          placeholder="Brief description..."
        ></textarea>
      </div>
      <div class="field">
        <label class="field__label" for="proj-stack">Tech Stack</label>
        <input
          id="proj-stack"
          v-model="editor.form.tech_stack"
          class="field__input"
          placeholder="e.g. Vue, Laravel, PostgreSQL"
        />
      </div>
      <div class="field">
        <label class="field__label" for="proj-url">Project URL</label>
        <input
          id="proj-url"
          v-model="editor.form.project_url"
          type="url"
          class="field__input"
          placeholder="https://..."
        />
      </div>
      <div class="field">
        <label class="field__label" for="proj-github">GitHub URL</label>
        <input
          id="proj-github"
          v-model="editor.form.github_url"
          type="url"
          class="field__input"
          placeholder="https://github.com/..."
        />
      </div>
      <!-- Gallery: images, short videos and YouTube/Vimeo links. The first image becomes the card cover. -->
      <MediaUploader
        v-model="editor.form.media"
        collection="projects"
        label="Gallery"
        multiple
        allow-embed
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        hint="Images up to 5 MB · MP4/WebM videos up to 35 MB · first image = cover"
      />
      <div class="field">
        <label class="field__label" for="proj-thumb">Thumbnail URL (optional)</label>
        <input
          id="proj-thumb"
          v-model="editor.form.thumbnail_url"
          type="url"
          class="field__input"
          placeholder="Only used when the gallery has no images"
        />
      </div>

      <template #actions>
        <button type="button" class="btn-ghost" @click="closeEditor">Cancel</button>
        <button type="button" class="btn-primary" :disabled="editor.saving" @click="save">
          {{ editor.saving ? 'Saving...' : editor.isEdit ? 'Save Changes' : 'Add Project' }}
        </button>
      </template>
    </AdminModal>

    <ConfirmDeleteDialog
      :open="deletion.open"
      item-type="Project"
      :item-name="deleteName"
      :deleting="deletion.deleting"
      @cancel="cancelDelete"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProjectsStore } from '@/stores/content'
import { useCrudEditor, requiredFields } from '@/composables/useCrudEditor'
import AdminModal from '@/components/admin/AdminModal.vue'
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog.vue'
import MediaUploader from '@/components/admin/MediaUploader.vue'
import { mediaList, projectCover } from '@/utils/media'

const store = useProjectsStore()
const mediaCount = (project) => mediaList(project.media).length

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
  label: 'Project',
  emptyForm: {
    title: '',
    description: '',
    tech_stack: '',
    project_url: '',
    github_url: '',
    thumbnail_url: '',
    media: [], // gallery — list of media items (JSON), see utils/media.js
  },
  validate: (form) => requiredFields(form, { title: 'Title' }),
})

onMounted(() => store.load())
</script>

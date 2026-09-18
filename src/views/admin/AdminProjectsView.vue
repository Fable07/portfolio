<!--
  AdminProjectsView — /admin/projects
  • Drag ⠿ (or ▲▼) to set the order shown on the public site
  • Quick toggles: Published (draft = hidden from visitors) and ★ Featured (home page)
  • Add/Edit form with gallery uploads and a live preview of the public card
  • Delete shows "Undo" for a few seconds before it's permanent
-->
<template>
  <section>
    <AdminPageHeader
      v-model:search="search"
      title="Projects"
      description="Drag to reorder. Drafts are hidden from visitors; featured projects appear on the home page."
      search-placeholder="Search projects"
    >
      <button type="button" class="btn-primary" @click="openCreate">＋ Add project</button>
    </AdminPageHeader>

    <div v-if="store.isLoading" class="grid gap-2" aria-busy="true">
      <SkeletonBlock v-for="n in 3" :key="n" class="h-20 w-full rounded-xl" />
    </div>

    <StateMessage
      v-else-if="store.status === 'error'"
      type="error"
      :message="`Couldn't load projects: ${store.error?.message}`"
      retry
      @retry="store.load({ force: true })"
    />

    <div
      v-else-if="!store.items.length"
      class="rounded-2xl border border-dashed border-line p-10 text-center"
    >
      <p class="m-0 text-3xl" aria-hidden="true">🚀</p>
      <p class="m-0 mt-2">No projects yet.</p>
      <button type="button" class="btn-primary mt-4" @click="openCreate">
        Add your first project
      </button>
    </div>

    <template v-else>
      <p v-if="search" class="m-0 mb-2 text-xs">
        {{ visible.length }} of {{ store.items.length }} shown · clear the search to reorder
      </p>
      <SortableList :items="visible" :disabled="!!search" @reorder="saveOrder">
        <template #default="{ item: project }">
          <div class="flex flex-wrap items-center gap-3">
            <img
              v-if="projectCover(project)"
              :src="projectCover(project)"
              alt=""
              class="h-12 w-20 shrink-0 rounded-lg object-cover"
            />
            <div
              v-else
              class="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-accent/5 font-mono text-accent/40"
              aria-hidden="true"
            >
              &lt;/&gt;
            </div>

            <div class="min-w-0 flex-1 basis-40">
              <p class="m-0 flex flex-wrap items-center gap-2 font-semibold text-heading">
                <span class="truncate">{{ project.title }}</span>
                <span
                  v-if="!project.is_published"
                  class="rounded bg-amber-400/15 px-1.5 py-0.5 text-[0.65rem] font-bold text-amber-300 uppercase"
                  >Draft</span
                >
                <span
                  v-if="project.is_featured"
                  class="rounded bg-amber-400/15 px-1.5 py-0.5 text-[0.65rem] font-bold text-amber-300 uppercase"
                  >★ Featured</span
                >
              </p>
              <p class="m-0 truncate text-xs">
                {{ project.tech_stack || 'No tech stack' }}
                <template v-if="mediaCount(project)"> · {{ mediaCount(project) }} media</template>
              </p>
            </div>

            <div class="flex items-center gap-1">
              <button
                type="button"
                class="btn-ghost px-2! text-lg"
                :class="project.is_featured ? 'text-amber-300!' : ''"
                :aria-pressed="!!project.is_featured"
                :aria-label="`${project.is_featured ? 'Unfeature' : 'Feature'} ${project.title}`"
                :title="project.is_featured ? 'Featured on home page' : 'Feature on home page'"
                @click="toggle(project, 'is_featured')"
              >
                {{ project.is_featured ? '★' : '☆' }}
              </button>
              <ToggleSwitch
                :model-value="!!project.is_published"
                :label="`Published: ${project.title}`"
                hide-label
                @update:model-value="toggle(project, 'is_published')"
              />
              <button
                type="button"
                class="btn-ghost px-2.5!"
                :aria-label="`Edit ${project.title}`"
                @click="openEdit(project)"
              >
                ✏️
              </button>
              <button
                type="button"
                class="btn-ghost px-2.5! hover:text-red-400!"
                :aria-label="`Delete ${project.title}`"
                @click="deleteWithUndo(project)"
              >
                🗑️
              </button>
            </div>
          </div>
        </template>
      </SortableList>
    </template>

    <!-- ── Add / Edit form ── -->
    <AdminModal
      :open="editor.open"
      :title="editor.isEdit ? 'Edit project' : 'Add project'"
      :error="editor.error"
      :dirty="isDirty"
      size="lg"
      @close="closeEditor"
    >
      <FormField
        v-slot="{ id, describedBy, invalid }"
        label="Title"
        required
        :error="fieldError('title')"
      >
        <input
          :id="id"
          v-model="editor.form.title"
          class="form-input"
          placeholder="e.g. Portfolio Website"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        />
      </FormField>

      <FormField
        v-slot="{ id, describedBy, invalid }"
        label="Description"
        optional
        :error="fieldError('description')"
        :hint="`${editor.form.description.length} / 5000 characters · line breaks are kept`"
      >
        <textarea
          :id="id"
          v-model="editor.form.description"
          rows="5"
          maxlength="5000"
          class="form-input resize-y"
          placeholder="What is it, what problem does it solve, what did you build?"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        ></textarea>
      </FormField>

      <FormField
        v-slot="{ id, describedBy, invalid }"
        label="Tech stack"
        optional
        hint="Comma-separated — each becomes a filter tag"
        :error="fieldError('tech_stack')"
      >
        <input
          :id="id"
          v-model="editor.form.tech_stack"
          class="form-input"
          placeholder="Vue, Laravel, PostgreSQL"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        />
      </FormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="Live URL"
          optional
          :error="fieldError('project_url')"
        >
          <input
            :id="id"
            v-model.trim="editor.form.project_url"
            type="url"
            class="form-input"
            placeholder="https://…"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>
        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="GitHub URL"
          optional
          :error="fieldError('github_url')"
        >
          <input
            :id="id"
            v-model.trim="editor.form.github_url"
            type="url"
            class="form-input"
            placeholder="https://github.com/…"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>
      </div>

      <div class="flex flex-wrap gap-5 rounded-xl border border-line bg-surface px-4 py-3">
        <ToggleSwitch v-model="editor.form.is_published" label="Published (visible to visitors)" />
        <ToggleSwitch v-model="editor.form.is_featured" label="★ Featured on home page" />
      </div>

      <MediaUploader
        v-model="editor.form.media"
        collection="projects"
        label="Gallery"
        multiple
        allow-embed
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        hint="Images up to 5 MB · MP4/WebM videos up to 35 MB · first image = cover"
        :error="fieldError('media')"
      />

      <FormField
        v-slot="{ id, describedBy, invalid }"
        label="Cover image URL"
        optional
        hint="Only used when the gallery has no images"
        :error="fieldError('thumbnail_url')"
      >
        <input
          :id="id"
          v-model.trim="editor.form.thumbnail_url"
          type="url"
          class="form-input"
          placeholder="https://…"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        />
      </FormField>

      <template #aside>
        <p class="m-0 mb-2 text-xs font-semibold tracking-wide uppercase">Live preview</p>
        <ProjectCard :project="editor.form" preview heading-tag="p" />
        <p class="m-0 mt-2 text-xs">This is how the card looks on the Projects page.</p>
      </template>

      <template #actions>
        <button type="button" class="btn-ghost" @click="closeEditor">Cancel</button>
        <button type="button" class="btn-primary" :disabled="editor.saving" @click="save">
          {{ editor.saving ? 'Saving…' : editor.isEdit ? 'Save changes' : 'Add project' }}
        </button>
      </template>
    </AdminModal>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import FormField from '@/components/admin/FormField.vue'
import MediaUploader from '@/components/admin/MediaUploader.vue'
import SortableList from '@/components/admin/SortableList.vue'
import ToggleSwitch from '@/components/admin/ToggleSwitch.vue'
import ProjectCard from '@/components/common/ProjectCard.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'
import { useCrudEditor, requiredFields } from '@/composables/useCrudEditor'
import { useUndoableDelete } from '@/composables/useUndoableDelete'
import { useAdminProjectsStore } from '@/stores/content'
import { useToastStore } from '@/stores/toast'
import { mediaList, projectCover } from '@/utils/media'
import { urlFields } from '@/utils/validation'

const store = useAdminProjectsStore()
const toast = useToastStore()
const search = ref('')

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return store.items
  return store.items.filter((p) =>
    `${p.title} ${p.tech_stack ?? ''} ${p.description ?? ''}`.toLowerCase().includes(q),
  )
})
const mediaCount = (project) => mediaList(project.media).length

const { editor, isDirty, fieldError, openCreate, openEdit, closeEditor, save } = useCrudEditor(
  store,
  {
    label: 'Project',
    emptyForm: {
      title: '',
      description: '',
      tech_stack: '',
      project_url: '',
      github_url: '',
      thumbnail_url: '',
      is_published: true,
      is_featured: false,
      media: [], // gallery — list of media items (JSON), see utils/media.js
    },
    validate: (form) => ({
      ...requiredFields(form, { title: 'Title' }),
      ...urlFields(form, {
        project_url: 'Live URL',
        github_url: 'GitHub URL',
        thumbnail_url: 'Cover image URL',
      }),
    }),
  },
)

const { deleteWithUndo } = useUndoableDelete(store, { label: 'Project' })

async function toggle(project, field) {
  try {
    await store.patch(project.id, { [field]: !project[field] })
  } catch (err) {
    toast.error(`Couldn't update: ${err.message}`)
  }
}

async function saveOrder(ids) {
  try {
    await store.reorder(ids)
    toast.success('Order saved')
  } catch (err) {
    toast.error(`Couldn't save order: ${err.message}`)
  }
}

onMounted(() => store.load())
</script>

<!--
  AdminTimelineView — /admin/timeline
  Education & work entries shown on /resume. Drag to reorder, add/edit, delete with Undo.
-->
<template>
  <section>
    <AdminPageHeader
      v-model:search="search"
      title="Timeline"
      description="Education and work experience shown on the Resume page. Drag to reorder."
      search-placeholder="Search entries"
    >
      <button type="button" class="btn-primary" @click="openCreate">＋ Add entry</button>
    </AdminPageHeader>

    <div v-if="store.isLoading" class="grid gap-2" aria-busy="true">
      <SkeletonBlock v-for="n in 3" :key="n" class="h-16 w-full rounded-xl" />
    </div>

    <StateMessage
      v-else-if="store.status === 'error'"
      type="error"
      :message="`Couldn't load the timeline: ${store.error?.message}`"
      retry
      @retry="store.load({ force: true })"
    />

    <div
      v-else-if="!store.items.length"
      class="rounded-2xl border border-dashed border-line p-10 text-center"
    >
      <p class="m-0 text-3xl" aria-hidden="true">🕐</p>
      <p class="m-0 mt-2">No timeline entries yet.</p>
      <button type="button" class="btn-primary mt-4" @click="openCreate">
        Add education or work experience
      </button>
    </div>

    <template v-else>
      <p v-if="search" class="m-0 mb-2 text-xs">
        {{ visible.length }} of {{ store.items.length }} shown · clear the search to reorder
      </p>
      <SortableList :items="visible" :disabled="!!search" @reorder="saveOrder">
        <template #default="{ item: entry }">
          <div class="flex flex-wrap items-center gap-3">
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-lg"
              aria-hidden="true"
            >
              {{ entry.type === 'education' ? '🎓' : '💼' }}
            </span>
            <div class="min-w-0 flex-1 basis-40">
              <p class="m-0 truncate font-semibold text-heading">{{ entry.title }}</p>
              <p class="m-0 truncate text-xs">
                {{ entry.institution }} · {{ entry.start_date }} — {{ entry.end_date || 'Present' }}
              </p>
            </div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="btn-ghost px-2.5!"
                :aria-label="`Edit ${entry.title}`"
                @click="openEdit(entry)"
              >
                ✏️
              </button>
              <button
                type="button"
                class="btn-ghost px-2.5! hover:text-red-400!"
                :aria-label="`Delete ${entry.title}`"
                @click="deleteWithUndo(entry)"
              >
                🗑️
              </button>
            </div>
          </div>
        </template>
      </SortableList>
    </template>

    <AdminModal
      :open="editor.open"
      :title="editor.isEdit ? 'Edit entry' : 'Add timeline entry'"
      :error="editor.error"
      :dirty="isDirty"
      @close="closeEditor"
    >
      <fieldset class="m-0 border-0 p-0">
        <legend class="mb-1.5 p-0 text-xs font-semibold tracking-wide text-muted uppercase">
          Type
        </legend>
        <div class="flex gap-2">
          <label
            v-for="option in TYPES"
            :key="option.value"
            class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold"
            :class="
              editor.form.type === option.value
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-line text-muted'
            "
          >
            <input
              v-model="editor.form.type"
              type="radio"
              name="timeline-type"
              :value="option.value"
              class="sr-only"
            />
            {{ option.label }}
          </label>
        </div>
      </fieldset>

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
          :placeholder="
            editor.form.type === 'education'
              ? 'e.g. BS Information Technology'
              : 'e.g. Full-stack Developer Intern'
          "
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        />
      </FormField>
      <div class="grid gap-4 sm:grid-cols-2">
        <FormField
          v-slot="{ id, describedBy, invalid }"
          :label="editor.form.type === 'education' ? 'School' : 'Company'"
          required
          :error="fieldError('institution')"
        >
          <input
            :id="id"
            v-model="editor.form.institution"
            class="form-input"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>
        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="Location"
          optional
          :error="fieldError('location')"
        >
          <input
            :id="id"
            v-model="editor.form.location"
            class="form-input"
            placeholder="e.g. Remote"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>
        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="Start"
          required
          :error="fieldError('start_date')"
        >
          <input
            :id="id"
            v-model="editor.form.start_date"
            class="form-input"
            placeholder="e.g. Jun 2021"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>
        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="End"
          optional
          hint="Leave empty for “Present”"
          :error="fieldError('end_date')"
        >
          <input
            :id="id"
            v-model="editor.form.end_date"
            class="form-input"
            placeholder="e.g. 2025"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>
      </div>
      <FormField
        v-slot="{ id, describedBy, invalid }"
        label="Description"
        optional
        :error="fieldError('description')"
      >
        <textarea
          :id="id"
          v-model="editor.form.description"
          rows="4"
          class="form-input resize-y"
          placeholder="Your role, what you learned or achieved…"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        ></textarea>
      </FormField>

      <template #actions>
        <button type="button" class="btn-ghost" @click="closeEditor">Cancel</button>
        <button type="button" class="btn-primary" :disabled="editor.saving" @click="save">
          {{ editor.saving ? 'Saving…' : editor.isEdit ? 'Save changes' : 'Add entry' }}
        </button>
      </template>
    </AdminModal>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import FormField from '@/components/common/FormField.vue'
import SortableList from '@/components/admin/SortableList.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'
import { useCrudEditor, requiredFields } from '@/composables/useCrudEditor'
import { useUndoableDelete } from '@/composables/useUndoableDelete'
import { useAdminTimelineStore } from '@/stores/content'
import { useToastStore } from '@/stores/toast'

const TYPES = [
  { value: 'education', label: '🎓 Education' },
  { value: 'work', label: '💼 Work' },
]

const store = useAdminTimelineStore()
const toast = useToastStore()
const search = ref('')

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q
    ? store.items.filter((e) => `${e.title} ${e.institution}`.toLowerCase().includes(q))
    : store.items
})

const { editor, isDirty, fieldError, openCreate, openEdit, closeEditor, save } = useCrudEditor(
  store,
  {
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
      requiredFields(form, {
        title: 'Title',
        institution: form.type === 'education' ? 'School' : 'Company',
        start_date: 'Start date',
      }),
  },
)

const { deleteWithUndo } = useUndoableDelete(store, { label: 'Timeline entry' })

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

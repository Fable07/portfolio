<!--
  AdminHobbiesView — /admin/hobbies
  Drag to reorder, add/edit with an optional photo, delete with Undo.
-->
<template>
  <section>
    <AdminPageHeader title="Hobbies" description="Shown on the Hobbies page. Drag to reorder.">
      <button type="button" class="btn-primary" @click="openCreate">＋ Add hobby</button>
    </AdminPageHeader>

    <div v-if="store.isLoading" class="grid gap-2" aria-busy="true">
      <SkeletonBlock v-for="n in 3" :key="n" class="h-16 w-full rounded-xl" />
    </div>

    <StateMessage
      v-else-if="store.status === 'error'"
      type="error"
      :message="`Couldn't load hobbies: ${store.error?.message}`"
      retry
      @retry="store.load({ force: true })"
    />

    <div
      v-else-if="!store.items.length"
      class="rounded-2xl border border-dashed border-line p-10 text-center"
    >
      <p class="m-0 text-3xl" aria-hidden="true">🎯</p>
      <p class="m-0 mt-2">No hobbies yet.</p>
      <button type="button" class="btn-primary mt-4" @click="openCreate">
        Add your first hobby
      </button>
    </div>

    <SortableList
      v-else
      :items="store.items"
      :label-of="(hobby) => hobby.name"
      @reorder="saveOrder"
    >
      <template #default="{ item: hobby }">
        <div class="flex flex-wrap items-center gap-3">
          <img
            v-if="hobby.image?.url"
            :src="hobby.image.url"
            alt=""
            class="h-11 w-16 shrink-0 rounded-lg object-cover"
          />
          <span
            v-else
            class="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg bg-surface text-2xl"
            aria-hidden="true"
            >{{ hobby.icon || '🎯' }}</span
          >
          <div class="min-w-0 flex-1 basis-40">
            <p class="m-0 truncate font-semibold text-heading">{{ hobby.name }}</p>
            <p class="m-0 truncate text-xs">{{ hobby.description || '—' }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="btn-ghost px-2.5!"
              :aria-label="`Edit ${hobby.name}`"
              @click="openEdit(hobby)"
            >
              ✏️
            </button>
            <button
              type="button"
              class="btn-ghost px-2.5! hover:text-red-400!"
              :aria-label="`Delete ${hobby.name}`"
              @click="deleteWithUndo(hobby)"
            >
              🗑️
            </button>
          </div>
        </div>
      </template>
    </SortableList>

    <AdminModal
      :open="editor.open"
      :title="editor.isEdit ? 'Edit hobby' : 'Add hobby'"
      :error="editor.error"
      :dirty="isDirty"
      @close="closeEditor"
    >
      <div class="grid gap-4 sm:grid-cols-[1fr_120px]">
        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="Name"
          required
          :error="fieldError('name')"
        >
          <input
            :id="id"
            v-model="editor.form.name"
            class="form-input"
            placeholder="e.g. Photography"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>
        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="Emoji"
          optional
          :error="fieldError('icon')"
        >
          <input
            :id="id"
            v-model="editor.form.icon"
            class="form-input text-center text-lg"
            placeholder="📷"
            maxlength="8"
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
          rows="3"
          class="form-input resize-y"
          placeholder="What you enjoy about it…"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        ></textarea>
      </FormField>
      <MediaUploader
        v-model="editor.form.image"
        collection="hobbies"
        label="Photo (optional)"
        accept="image/jpeg,image/png,image/webp,image/gif"
        :error="fieldError('image')"
      />

      <template #actions>
        <button type="button" class="btn-ghost" @click="closeEditor">Cancel</button>
        <button type="button" class="btn-primary" :disabled="editor.saving" @click="save">
          {{ editor.saving ? 'Saving…' : editor.isEdit ? 'Save changes' : 'Add hobby' }}
        </button>
      </template>
    </AdminModal>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import FormField from '@/components/common/FormField.vue'
import MediaUploader from '@/components/admin/MediaUploader.vue'
import SortableList from '@/components/admin/SortableList.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'
import { useCrudEditor, requiredFields } from '@/composables/useCrudEditor'
import { useUndoableDelete } from '@/composables/useUndoableDelete'
import { useAdminHobbiesStore } from '@/stores/content'
import { useToastStore } from '@/stores/toast'

const store = useAdminHobbiesStore()
const toast = useToastStore()

const { editor, isDirty, fieldError, openCreate, openEdit, closeEditor, save } = useCrudEditor(
  store,
  {
    label: 'Hobby',
    emptyForm: { name: '', icon: '', description: '', image: null }, // image: media item JSON
    validate: (form) => requiredFields(form, { name: 'Name' }),
  },
)

const { deleteWithUndo } = useUndoableDelete(store, {
  label: 'Hobby',
  nameOf: (hobby) => hobby.name,
})

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

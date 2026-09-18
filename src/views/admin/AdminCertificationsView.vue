<!--
  AdminCertificationsView — /admin/certifications
  Reorder by dragging, toggle Published, add/edit with badge upload, delete with Undo.
-->
<template>
  <section>
    <AdminPageHeader
      v-model:search="search"
      title="Certifications"
      description="Drag to reorder. Drafts are hidden from visitors."
      search-placeholder="Search certifications"
    >
      <button type="button" class="btn-primary" @click="openCreate">＋ Add certification</button>
    </AdminPageHeader>

    <div v-if="store.isLoading" class="grid gap-2" aria-busy="true">
      <SkeletonBlock v-for="n in 3" :key="n" class="h-16 w-full rounded-xl" />
    </div>

    <StateMessage
      v-else-if="store.status === 'error'"
      type="error"
      :message="`Couldn't load certifications: ${store.error?.message}`"
      retry
      @retry="store.load({ force: true })"
    />

    <div
      v-else-if="!store.items.length"
      class="rounded-2xl border border-dashed border-line p-10 text-center"
    >
      <p class="m-0 text-3xl" aria-hidden="true">🏅</p>
      <p class="m-0 mt-2">No certifications yet.</p>
      <button type="button" class="btn-primary mt-4" @click="openCreate">
        Add your first certification
      </button>
    </div>

    <template v-else>
      <p v-if="search" class="m-0 mb-2 text-xs">
        {{ visible.length }} of {{ store.items.length }} shown · clear the search to reorder
      </p>
      <SortableList :items="visible" :disabled="!!search" @reorder="saveOrder">
        <template #default="{ item: cert }">
          <div class="flex flex-wrap items-center gap-3">
            <div
              class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent/8"
            >
              <img
                v-if="badgeUrl(cert)"
                :src="badgeUrl(cert)"
                alt=""
                class="size-9 object-contain"
              />
              <span v-else aria-hidden="true">🏅</span>
            </div>
            <div class="min-w-0 flex-1 basis-40">
              <p class="m-0 flex flex-wrap items-center gap-2 font-semibold text-heading">
                <span class="truncate">{{ cert.title }}</span>
                <span
                  v-if="!cert.is_published"
                  class="rounded bg-amber-400/15 px-1.5 py-0.5 text-[0.65rem] font-bold text-amber-300 uppercase"
                  >Draft</span
                >
              </p>
              <p class="m-0 truncate text-xs">
                {{ [cert.issuer, cert.date].filter(Boolean).join(' · ') || '—' }}
              </p>
            </div>
            <div class="flex items-center gap-1">
              <a
                v-if="cert.credential_url"
                :href="cert.credential_url"
                target="_blank"
                rel="noopener"
                class="btn-ghost px-2.5!"
                :aria-label="`Open credential for ${cert.title}`"
                >↗</a
              >
              <ToggleSwitch
                :model-value="!!cert.is_published"
                :label="`Published: ${cert.title}`"
                hide-label
                @update:model-value="togglePublished(cert)"
              />
              <button
                type="button"
                class="btn-ghost px-2.5!"
                :aria-label="`Edit ${cert.title}`"
                @click="openEdit(cert)"
              >
                ✏️
              </button>
              <button
                type="button"
                class="btn-ghost px-2.5! hover:text-red-400!"
                :aria-label="`Delete ${cert.title}`"
                @click="deleteWithUndo(cert)"
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
      :title="editor.isEdit ? 'Edit certification' : 'Add certification'"
      :error="editor.error"
      :dirty="isDirty"
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
          placeholder="e.g. AWS Cloud Practitioner"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        />
      </FormField>
      <div class="grid gap-4 sm:grid-cols-2">
        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="Issuer"
          optional
          :error="fieldError('issuer')"
        >
          <input
            :id="id"
            v-model="editor.form.issuer"
            class="form-input"
            placeholder="e.g. Amazon Web Services"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>
        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="Date"
          optional
          :error="fieldError('date')"
        >
          <input
            :id="id"
            v-model="editor.form.date"
            class="form-input"
            placeholder="e.g. Jan 2025"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>
      </div>
      <FormField
        v-slot="{ id, describedBy, invalid }"
        label="Credential URL"
        optional
        :error="fieldError('credential_url')"
      >
        <input
          :id="id"
          v-model.trim="editor.form.credential_url"
          type="url"
          class="form-input"
          placeholder="https://…"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        />
      </FormField>

      <ToggleSwitch v-model="editor.form.is_published" label="Published (visible to visitors)" />

      <MediaUploader
        v-model="editor.form.badge"
        collection="certifications"
        label="Badge / certificate image"
        accept="image/jpeg,image/png,image/webp,image/gif"
        :error="fieldError('badge')"
      />
      <FormField
        v-if="!editor.form.badge"
        v-slot="{ id, describedBy, invalid }"
        label="…or badge image URL"
        optional
        :error="fieldError('badge_url')"
      >
        <input
          :id="id"
          v-model.trim="editor.form.badge_url"
          type="url"
          class="form-input"
          placeholder="https://…"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        />
      </FormField>

      <template #actions>
        <button type="button" class="btn-ghost" @click="closeEditor">Cancel</button>
        <button type="button" class="btn-primary" :disabled="editor.saving" @click="save">
          {{ editor.saving ? 'Saving…' : editor.isEdit ? 'Save changes' : 'Add certification' }}
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
import MediaUploader from '@/components/admin/MediaUploader.vue'
import SortableList from '@/components/admin/SortableList.vue'
import ToggleSwitch from '@/components/admin/ToggleSwitch.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'
import { useCrudEditor, requiredFields } from '@/composables/useCrudEditor'
import { useUndoableDelete } from '@/composables/useUndoableDelete'
import { useAdminCertificationsStore } from '@/stores/content'
import { useToastStore } from '@/stores/toast'
import { urlFields } from '@/utils/validation'

const store = useAdminCertificationsStore()
const toast = useToastStore()
const search = ref('')

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q
    ? store.items.filter((c) => `${c.title} ${c.issuer ?? ''}`.toLowerCase().includes(q))
    : store.items
})

/** Uploaded badge first, then a pasted badge URL */
const badgeUrl = (cert) => cert.badge?.url || cert.badge_url

const { editor, isDirty, fieldError, openCreate, openEdit, closeEditor, save } = useCrudEditor(
  store,
  {
    label: 'Certification',
    emptyForm: {
      title: '',
      issuer: '',
      date: '',
      credential_url: '',
      badge_url: '',
      is_published: true,
      badge: null, // uploaded badge image (media item JSON) — takes priority over badge_url
    },
    validate: (form) => ({
      ...requiredFields(form, { title: 'Title' }),
      ...urlFields(form, { credential_url: 'Credential URL', badge_url: 'Badge image URL' }),
    }),
  },
)

const { deleteWithUndo } = useUndoableDelete(store, { label: 'Certification' })

async function togglePublished(cert) {
  try {
    await store.patch(cert.id, { is_published: !cert.is_published })
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

<!--
  AdminResumeView — /admin/resume
  Choose the resume PDF shown on /resume: upload a PDF (stored by the media driver)
  or paste a URL. Uploading replaces the URL; pasting a URL removes the uploaded file on save.
  Warns before leaving with unsaved changes.
-->
<template>
  <section>
    <AdminPageHeader
      title="Resume"
      description="The PDF visitors can view and download on the Resume page."
    />

    <SkeletonBlock v-if="store.isLoading" class="h-64 w-full rounded-2xl" />

    <form v-else class="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]" @submit.prevent="save">
      <div class="grid content-start gap-4 rounded-2xl border border-line bg-card p-5">
        <MediaUploader
          v-model="pdf"
          collection="resume"
          label="Upload PDF"
          accept="application/pdf"
          hint="PDF up to 10 MB"
        />

        <FormField
          v-if="!pdf"
          v-slot="{ id, describedBy, invalid }"
          label="…or PDF URL"
          :error="urlError"
          hint="A path like /resume.pdf (public folder) or a full https:// link"
        >
          <input
            :id="id"
            v-model.trim="url"
            class="form-input"
            placeholder="/resume.pdf"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>

        <div class="flex flex-wrap items-center gap-3">
          <button type="submit" class="btn-primary" :disabled="saving || !previewSrc || !isDirty">
            {{ saving ? 'Saving…' : 'Save resume' }}
          </button>
          <span v-if="isDirty" class="text-xs text-amber-300">Unsaved changes</span>
        </div>
      </div>

      <div class="rounded-2xl border border-line bg-card p-5">
        <p class="m-0 mb-2 text-xs font-semibold tracking-wide uppercase">Preview</p>
        <iframe
          v-if="previewSrc"
          :src="previewSrc"
          title="Resume preview"
          class="h-[520px] w-full rounded-xl border border-line bg-white"
        ></iframe>
        <p v-else class="m-0 py-16 text-center text-sm">
          Upload a PDF or enter a URL to preview it.
        </p>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import FormField from '@/components/admin/FormField.vue'
import MediaUploader from '@/components/admin/MediaUploader.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import { apiErrorMessage } from '@/composables/useCrudEditor'
import { provideMediaSession } from '@/composables/useMediaSession'
import { useDirtyState, useUnsavedChangesGuard } from '@/composables/useUnsavedChanges'
import { useResumeStore } from '@/stores/content'
import { useToastStore } from '@/stores/toast'
import { cloneMedia } from '@/utils/media'

const store = useResumeStore()
const toast = useToastStore()
const session = provideMediaSession() // unsaved uploads are deleted when leaving the page

// Local draft — only written to the server on Save
const pdf = ref(null)
const url = ref('')
const saving = ref(false)

const { isDirty, snapshot } = useDirtyState(() => ({
  pdf: pdf.value,
  url: pdf.value ? '' : url.value,
}))
useUnsavedChangesGuard(isDirty)

const previewSrc = computed(() => pdf.value?.url || url.value)
const urlError = computed(() =>
  url.value && !/^(\/|https?:\/\/)\S+$/i.test(url.value)
    ? 'Use a path starting with / or an https:// link'
    : '',
)

function fillFromStore() {
  pdf.value = cloneMedia(store.pdf)
  url.value = store.pdf ? '' : store.pdfUrl
  snapshot()
}

watch(() => [store.pdf, store.pdfUrl, store.status], fillFromStore)

onMounted(async () => {
  await store.load()
  fillFromStore()
})
onBeforeUnmount(() => session.discardAll())

async function save() {
  if (urlError.value) return
  saving.value = true
  try {
    await store.save(
      pdf.value ? { pdf: pdf.value, pdf_url: null } : { pdf_url: url.value, pdf: null },
    )
    session.commit()
    fillFromStore()
    toast.success('Resume saved')
  } catch (err) {
    toast.error(apiErrorMessage(err))
  } finally {
    saving.value = false
  }
}
</script>

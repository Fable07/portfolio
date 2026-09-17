<!--
  AdminResumeView — /admin/resume
  Choose the resume PDF shown on /resume: upload a PDF (stored by the media driver)
  or paste a URL. Uploading replaces the URL; pasting a URL removes the uploaded file on save.
-->
<template>
  <section>
    <div class="admin-toolbar">
      <span class="cert-count">Upload your resume PDF, or link to one hosted elsewhere</span>
    </div>

    <div v-if="store.isLoading" class="admin-empty"><p>Loading...</p></div>

    <form v-else class="resume-panel" @submit.prevent="save">
      <MediaUploader
        v-model="pdf"
        collection="resume"
        label="Resume PDF"
        accept="application/pdf"
        hint="PDF up to 10 MB"
      />

      <div v-if="!pdf" class="field">
        <label class="field__label" for="resume-url">…or resume PDF URL</label>
        <input
          id="resume-url"
          v-model.trim="url"
          class="field__input"
          placeholder="e.g. /resume.pdf or https://..."
          aria-describedby="resume-url-hint"
        />
        <p id="resume-url-hint" class="resume-hint">
          A relative path like <code>/resume.pdf</code> (file in the frontend's public folder) or a
          full URL.
        </p>
      </div>

      <div v-if="previewSrc" class="resume-preview">
        <p class="resume-preview__label">Preview:</p>
        <iframe :src="previewSrc" title="Resume preview" class="resume-preview__frame"></iframe>
        <a :href="previewSrc" target="_blank" rel="noopener" class="url-link">Open in new tab ↗</a>
      </div>

      <div class="resume-actions">
        <button type="submit" class="btn-primary" :disabled="saving || !previewSrc">
          {{ saving ? 'Saving...' : '💾 Save resume' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch, onMounted } from 'vue'
import { useResumeStore } from '@/stores/content'
import { useToastStore } from '@/stores/toast'
import { apiErrorMessage } from '@/composables/useCrudEditor'
import { provideMediaSession } from '@/composables/useMediaSession'
import { cloneMedia } from '@/utils/media'
import MediaUploader from '@/components/admin/MediaUploader.vue'

const store = useResumeStore()
const toast = useToastStore()
const session = provideMediaSession() // unsaved uploads are deleted when leaving the page

// Local draft — only written to the server on Save
const pdf = ref(cloneMedia(store.pdf))
const url = ref(store.pdf ? '' : store.pdfUrl)
const saving = ref(false)

const previewSrc = computed(() => pdf.value?.url || url.value)

// Fill the form once the saved resume arrives from the API
watch(
  () => [store.pdf, store.pdfUrl],
  ([savedPdf, savedUrl]) => {
    pdf.value = cloneMedia(savedPdf)
    url.value = savedPdf ? '' : savedUrl
  },
)

onMounted(() => store.load())
onBeforeUnmount(() => session.discardAll())

async function save() {
  saving.value = true
  try {
    await store.save(
      pdf.value ? { pdf: pdf.value, pdf_url: null } : { pdf_url: url.value, pdf: null },
    )
    session.commit()
    toast.success('Resume saved')
  } catch (err) {
    toast.error(apiErrorMessage(err))
  } finally {
    saving.value = false
  }
}
</script>

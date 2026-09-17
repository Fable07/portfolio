<!-- AdminResumeView — /admin/resume — set the URL of the resume PDF shown on /resume -->
<template>
  <section>
    <div class="admin-toolbar">
      <span class="cert-count">Update your resume PDF URL</span>
    </div>

    <div v-if="store.isLoading" class="admin-empty"><p>Loading...</p></div>

    <form v-else class="resume-panel" @submit.prevent="save">
      <div class="field">
        <label class="field__label" for="resume-url"
          >Resume PDF URL <span class="req">*</span></label
        >
        <input
          id="resume-url"
          v-model.trim="url"
          class="field__input"
          placeholder="e.g. /resume.pdf or https://..."
          aria-describedby="resume-url-hint"
        />
        <p id="resume-url-hint" class="resume-hint">
          Enter a relative path like <code>/resume.pdf</code> or a full URL to your hosted PDF.
        </p>
      </div>

      <div v-if="url" class="resume-preview">
        <p class="resume-preview__label">Preview:</p>
        <iframe :src="url" title="Resume preview" class="resume-preview__frame"></iframe>
        <a :href="url" target="_blank" rel="noopener" class="url-link">Open in new tab ↗</a>
      </div>

      <div class="resume-actions">
        <button type="submit" class="btn-primary" :disabled="saving || !url">
          {{ saving ? 'Saving...' : '💾 Save Resume URL' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useResumeStore } from '@/stores/content'
import { useToastStore } from '@/stores/toast'
import { apiErrorMessage } from '@/composables/useCrudEditor'

const store = useResumeStore()
const toast = useToastStore()

const url = ref(store.pdfUrl) // local draft — only written to the store on Save
const saving = ref(false)

// Fill the input once the saved URL arrives from the API
watch(
  () => store.pdfUrl,
  (saved) => (url.value = saved),
)

onMounted(() => store.load())

async function save() {
  if (!url.value) return
  saving.value = true
  try {
    await store.save(url.value)
    toast.success('Resume URL saved')
  } catch (err) {
    toast.error(apiErrorMessage(err))
  } finally {
    saving.value = false
  }
}
</script>

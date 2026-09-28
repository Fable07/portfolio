<!--
  MediaUploader — pick, upload, preview and manage media for an admin form.

  Gallery (many items):
    <MediaUploader v-model="form.media" multiple allow-embed collection="projects"
                   accept="image/*,video/mp4,video/webm" label="Gallery" />
  Single item:
    <MediaUploader v-model="form.badge" collection="certifications" accept="image/*" label="Badge" />

  How it works:
   1. Files upload immediately to POST /api/media and come back as media items (JSON).
   2. Items are added to v-model; the JSON is saved with the content when you press Save.
   3. YouTube/Vimeo links become "embed" items (no file stored).
   4. Removing a file uploaded in this form deletes it right away (via the media session);
      removing an already-saved file deletes it when the content is saved.
-->
<template>
  <fieldset class="m-0 grid min-w-0 gap-2 border-0 p-0">
    <legend class="mb-1.5 p-0 text-xs font-semibold tracking-wide text-muted uppercase">
      {{ label }}
    </legend>

    <!-- ── Current items (one per row leaves room for the alt-text input) ── -->
    <ul v-if="items.length" class="m-0 grid list-none gap-2 p-0">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        class="flex gap-3 rounded-xl border border-line bg-surface p-2"
      >
        <!-- Preview -->
        <div
          class="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/40"
        >
          <img
            v-if="previewUrl(item)"
            :src="previewUrl(item)"
            alt=""
            class="size-full object-cover"
          />
          <video
            v-else-if="item.type === 'video'"
            :src="item.url"
            preload="metadata"
            muted
            class="size-full object-cover"
          ></video>
          <span v-else class="text-2xl" aria-hidden="true">📄</span>
          <span
            class="absolute bottom-0.5 left-0.5 rounded bg-black/70 px-1 text-[0.6rem] text-white uppercase"
          >
            {{ item.type === 'embed' ? item.provider : item.type }}
          </span>
        </div>

        <!-- Details -->
        <div class="min-w-0 flex-1 text-xs">
          <a
            :href="item.url"
            target="_blank"
            rel="noopener"
            class="block truncate text-heading no-underline hover:underline"
          >
            {{ item.name || item.url }}
          </a>
          <span>{{ formatBytes(item.size) }}</span>
          <input
            v-if="item.type !== 'document'"
            :value="item.alt ?? ''"
            class="form-input mt-1 px-2! py-1! text-xs!"
            placeholder="Describe it (alt text)"
            :aria-label="`Alt text for ${item.name || item.type}`"
            @input="updateItem(index, { alt: $event.target.value })"
          />
        </div>

        <!-- Actions -->
        <div class="flex shrink-0 flex-col gap-0.5">
          <button
            type="button"
            class="btn-ghost px-2! py-1! hover:text-red-400!"
            :aria-label="`Remove ${item.name || item.type}`"
            @click="removeItem(index)"
          >
            ✕
          </button>
          <template v-if="multiple && items.length > 1">
            <button
              type="button"
              class="btn-ghost px-2! py-0.5! text-xs!"
              :disabled="index === 0"
              aria-label="Move earlier"
              @click="move(index, -1)"
            >
              ↑
            </button>
            <button
              type="button"
              class="btn-ghost px-2! py-0.5! text-xs!"
              :disabled="index === items.length - 1"
              aria-label="Move later"
              @click="move(index, 1)"
            >
              ↓
            </button>
          </template>
        </div>
      </li>
    </ul>

    <!-- ── Uploads in progress ── -->
    <ul v-if="uploads.length" class="m-0 grid list-none gap-1.5 p-0" aria-live="polite">
      <li
        v-for="upload in uploads"
        :key="upload.id"
        class="rounded-lg bg-surface px-3 py-2 text-xs"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="truncate text-heading">{{ upload.name }}</span>
          <span v-if="upload.error" class="text-red-400">{{ upload.error }}</span>
          <button
            v-if="upload.error"
            type="button"
            class="btn-ghost px-2! py-0.5! text-xs!"
            aria-label="Dismiss"
            @click="dismiss(upload.id)"
          >
            ✕
          </button>
          <button
            v-else
            type="button"
            class="btn-ghost px-2! py-0.5! text-xs!"
            aria-label="Cancel upload"
            @click="upload.controller.abort()"
          >
            Cancel
          </button>
        </div>
        <div
          v-if="!upload.error"
          class="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          :aria-valuenow="upload.progress"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Uploading ${upload.name}`"
        >
          <!-- Inline width: progress changes continuously -->
          <div
            class="h-full bg-accent transition-[width]"
            :style="{ width: `${upload.progress}%` }"
          ></div>
        </div>
      </li>
    </ul>

    <!-- ── Drop zone ── -->
    <label
      class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center text-xs transition-colors focus-within:border-accent"
      :class="dragging ? 'border-accent bg-accent/10' : 'border-line hover:border-accent/60'"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <span class="text-lg" aria-hidden="true">⬆</span>
      <span class="font-semibold text-heading">
        {{
          multiple
            ? 'Click to upload or drag files here'
            : items.length
              ? 'Replace file'
              : 'Click to upload or drag a file here'
        }}
      </span>
      <span>{{ hint }}</span>
      <input type="file" class="sr-only" :accept="accept" :multiple="multiple" @change="onPick" />
    </label>

    <!-- ── Video link ── -->
    <div v-if="allowEmbed" class="flex gap-2">
      <input
        v-model.trim="embedUrl"
        type="url"
        class="form-input py-2! text-xs!"
        placeholder="…or paste a YouTube / Vimeo link"
        aria-label="YouTube or Vimeo link"
        @keydown.enter.prevent="addEmbed"
      />
      <button
        type="button"
        class="btn-secondary shrink-0 px-3! py-2! text-xs!"
        :disabled="!embedUrl || addingEmbed"
        @click="addEmbed"
      >
        {{ addingEmbed ? 'Adding…' : 'Add video' }}
      </button>
    </div>
    <p v-if="embedError || error" class="m-0 text-xs text-red-400" role="alert">
      {{ embedError || error }}
    </p>
  </fieldset>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { mediaApi } from '@/api'
import { injectMediaSession } from '@/composables/useMediaSession'
import { formatBytes, mediaList, previewUrl } from '@/utils/media'

const props = defineProps({
  collection: { type: String, required: true }, // projects | certifications | hobbies | resume | profile
  multiple: { type: Boolean, default: false },
  allowEmbed: { type: Boolean, default: false },
  accept: { type: String, default: 'image/*' },
  label: { type: String, default: 'Media' },
  hint: { type: String, default: 'JPG, PNG, WebP or GIF — up to 5 MB' },
  /** Server validation message for this field (e.g. media.0.embed_url) */
  error: { type: String, default: '' },
})
const model = defineModel({ type: [Array, Object], default: null })

const session = injectMediaSession()
const items = computed(() => mediaList(model.value))
const uploads = reactive([]) // [{ id, name, progress, error, controller }]
const dragging = ref(false)
const embedUrl = ref('')
const embedError = ref('')
const addingEmbed = ref(false)
let uploadId = 0

/* ── Writing back to v-model (always new arrays/objects, never in-place edits) ── */
function setItems(next) {
  model.value = props.multiple ? next : (next.at(-1) ?? null)
}

function addItem(item) {
  if (!props.multiple && items.value[0]) session?.discard(items.value[0]) // replaced before saving
  setItems(props.multiple ? [...items.value, item] : [item])
}

function updateItem(index, changes) {
  setItems(items.value.map((item, i) => (i === index ? { ...item, ...changes } : item)))
}

function removeItem(index) {
  const [removed] = items.value.slice(index, index + 1)
  setItems(items.value.filter((_, i) => i !== index))
  session?.discard(removed)
}

function move(index, direction) {
  const next = [...items.value]
  const [item] = next.splice(index, 1)
  next.splice(index + direction, 0, item)
  setItems(next)
}

/* ── Uploading ── */
function onPick(event) {
  uploadFiles([...event.target.files])
  event.target.value = '' // allow picking the same file again
}

function onDrop(event) {
  dragging.value = false
  const files = [...event.dataTransfer.files]
  uploadFiles(props.multiple ? files : files.slice(0, 1))
}

async function uploadFiles(files) {
  await Promise.all(files.map(uploadOne))
}

async function uploadOne(file) {
  const upload = reactive({
    id: uploadId++,
    name: file.name,
    progress: 0,
    error: '',
    controller: new AbortController(),
  })
  uploads.push(upload)
  try {
    const item = await mediaApi.upload(file, props.collection, {
      onProgress: (percent) => (upload.progress = percent),
      signal: upload.controller.signal,
    })
    session?.track(item)
    addItem(item)
    dismiss(upload.id)
  } catch (err) {
    if (err.status === 0 && err.message === 'Upload cancelled.') dismiss(upload.id)
    else upload.error = err.message
  }
}

function dismiss(id) {
  const index = uploads.findIndex((upload) => upload.id === id)
  if (index !== -1) uploads.splice(index, 1)
}

/* ── Video links ── */
async function addEmbed() {
  if (!embedUrl.value) return
  addingEmbed.value = true
  embedError.value = ''
  try {
    addItem(await mediaApi.embed(embedUrl.value))
    embedUrl.value = ''
  } catch (err) {
    embedError.value = err.errors?.url?.[0] || err.message
  } finally {
    addingEmbed.value = false
  }
}

// Leaving the form mid-upload: stop the transfers
onBeforeUnmount(() => uploads.forEach((upload) => upload.controller.abort()))
</script>

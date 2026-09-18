<!--
  IconPicker — choose an icon: a built-in one (by file name) or upload your own.

  <IconPicker v-model:icon="skill.icon" v-model:media="skill.icon_media" set="skill" :label="skill.name" />

  • Built-in icons come from src/assets/icons (see utils/icons.js).
  • Uploading stores the image via the media API (collection "profile") and clears `icon`;
    picking a built-in icon clears the uploaded one.
-->
<template>
  <div class="relative">
    <button
      ref="trigger"
      type="button"
      class="flex size-11 cursor-pointer items-center justify-center rounded-lg border border-line bg-surface p-1 hover:border-accent/60"
      :aria-label="`Change icon for ${label || 'item'}`"
      :aria-expanded="open"
      @click="open = !open"
    >
      <img v-if="currentUrl" :src="currentUrl" alt="" class="size-8 object-contain" />
      <span v-else class="text-muted" aria-hidden="true">＋</span>
    </button>

    <div
      v-if="open"
      ref="popover"
      role="dialog"
      :aria-label="`Choose icon for ${label || 'item'}`"
      class="absolute top-12 left-0 z-50 w-[min(90vw,320px)] rounded-xl border border-line bg-card p-3 shadow-2xl"
    >
      <input
        v-model="query"
        type="search"
        class="form-input mb-2 !py-1.5 !text-sm"
        placeholder="Search icons…"
        aria-label="Search icons"
      />
      <ul class="m-0 grid max-h-52 list-none grid-cols-6 gap-1 overflow-y-auto p-0">
        <li v-for="option in filtered" :key="option.key">
          <button
            type="button"
            class="flex size-11 cursor-pointer items-center justify-center rounded-lg border p-1"
            :class="
              option.key === icon && !media
                ? 'border-accent bg-accent/15'
                : 'border-transparent bg-transparent hover:bg-surface'
            "
            :title="option.label"
            :aria-label="option.label"
            :aria-pressed="option.key === icon && !media"
            @click="pick(option.key)"
          >
            <img :src="option.url" alt="" class="size-7 object-contain" loading="lazy" />
          </button>
        </li>
      </ul>
      <p v-if="!filtered.length" class="m-0 py-3 text-center text-xs">No icons match.</p>

      <div class="mt-2 flex flex-wrap items-center gap-2 border-t border-line pt-2">
        <label class="btn-ghost cursor-pointer border border-line !py-1.5 !text-xs">
          {{ uploading ? 'Uploading…' : '⬆ Upload custom' }}
          <input
            type="file"
            class="sr-only"
            accept="image/png,image/jpeg,image/webp,image/gif"
            :disabled="uploading"
            @change="upload"
          />
        </label>
        <button
          v-if="icon || media"
          type="button"
          class="btn-ghost !py-1.5 !text-xs"
          @click="clear"
        >
          Remove icon
        </button>
        <span v-if="uploadError" class="text-xs text-red-400">{{ uploadError }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { mediaApi } from '@/api'
import { injectMediaSession } from '@/composables/useMediaSession'
import { iconOptions, resolveIcon, skillIcons, socialIcons } from '@/utils/icons'

const props = defineProps({
  set: { type: String, default: 'skill' }, // 'skill' | 'social' — which built-in set to list first
  label: { type: String, default: '' },
})
const icon = defineModel('icon', { type: String, default: null })
const media = defineModel('media', { type: Object, default: null })

const session = injectMediaSession()
const open = ref(false)
const query = ref('')
const uploading = ref(false)
const uploadError = ref('')
const popover = ref(null)
const trigger = ref(null)

const options = computed(() => {
  const [first, second] =
    props.set === 'social' ? [socialIcons, skillIcons] : [skillIcons, socialIcons]
  const seen = new Set()
  return [...iconOptions(first), ...iconOptions(second)].filter(
    (option) => !seen.has(option.url) && seen.add(option.url),
  )
})
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? options.value.filter((option) => option.label.includes(q)) : options.value
})
const currentUrl = computed(() => resolveIcon(icon.value, media.value, props.set))

function pick(key) {
  if (media.value) session?.discard(media.value) // uploaded-but-unsaved icon is no longer used
  media.value = null
  icon.value = key
  open.value = false
}

function clear() {
  if (media.value) session?.discard(media.value)
  media.value = null
  icon.value = null
  open.value = false
}

async function upload(event) {
  const [file] = event.target.files
  event.target.value = ''
  if (!file) return
  uploading.value = true
  uploadError.value = ''
  try {
    const item = await mediaApi.upload(file, 'profile')
    session?.track(item)
    if (media.value) session?.discard(media.value)
    media.value = item
    icon.value = null
    open.value = false
  } catch (err) {
    uploadError.value = err.message
  } finally {
    uploading.value = false
  }
}

onClickOutside(popover, () => (open.value = false), { ignore: [trigger] })
onKeyStroke('Escape', (event) => {
  if (!open.value) return
  event.stopImmediatePropagation() // close only the picker, not the surrounding page/modal
  open.value = false
  trigger.value?.focus()
})
</script>

<!--
  MediaLightbox — full-screen viewer for a gallery (images, videos, YouTube/Vimeo embeds).

  <MediaLightbox v-model:index="openIndex" :items="project.media" :title="project.title" />
  `index` null = closed. Keyboard: ← / → to browse, Esc to close.
-->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="current"
        ref="dialog"
        class="fixed inset-0 z-[1200] flex flex-col bg-black/90 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        :aria-label="`${title} — media ${index + 1} of ${items.length}`"
        @click.self="close"
      >
        <!-- Top bar -->
        <div class="flex items-center justify-between gap-3 p-3 text-sm text-white/80 sm:p-4">
          <span class="truncate">
            {{ current.alt || current.name || title }}
            <span class="ml-2 text-white/50">{{ index + 1 }} / {{ items.length }}</span>
          </span>
          <button
            type="button"
            class="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-white hover:bg-white/20"
            aria-label="Close viewer"
            @click="close"
          >
            ✕
          </button>
        </div>

        <!-- Media -->
        <div
          class="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-16"
          @click.self="close"
        >
          <img
            v-if="current.type === 'image'"
            :key="current.id"
            :src="current.url"
            :alt="current.alt || title"
            class="max-h-full max-w-full rounded-lg object-contain"
          />
          <video
            v-else-if="current.type === 'video'"
            :key="current.id"
            :src="current.url"
            :poster="current.thumbnail_url || undefined"
            controls
            autoplay
            class="max-h-full max-w-full rounded-lg"
          ></video>
          <iframe
            v-else-if="current.type === 'embed'"
            :key="current.id"
            :src="current.embed_url"
            :title="current.alt || `${title} video`"
            class="aspect-video w-full max-w-5xl rounded-lg border-0"
            allow="
              accelerometer;
              autoplay;
              encrypted-media;
              gyroscope;
              picture-in-picture;
              fullscreen;
            "
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>

          <template v-if="items.length > 1">
            <button
              type="button"
              class="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/25 sm:left-4"
              aria-label="Previous"
              @click="step(-1)"
            >
              ‹
            </button>
            <button
              type="button"
              class="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/25 sm:right-4"
              aria-label="Next"
              @click="step(1)"
            >
              ›
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

const props = defineProps({
  items: { type: Array, required: true },
  title: { type: String, default: '' },
})
const index = defineModel('index', { type: Number, default: null })

const dialog = ref(null)
const current = computed(() => (index.value == null ? null : props.items[index.value]))

// Keep keyboard focus inside the viewer and stop the page scrolling behind it
const { activate, deactivate } = useFocusTrap(dialog, { immediate: false, allowOutsideClick: true })
const scrollLock = useScrollLock(document.body)

watch(
  () => current.value != null,
  async (open) => {
    scrollLock.value = open
    if (open) {
      await nextTick()
      activate()
    } else deactivate()
  },
)

function close() {
  index.value = null
}
function step(direction) {
  index.value = (index.value + direction + props.items.length) % props.items.length
}

onKeyStroke('Escape', () => current.value && close())
onKeyStroke('ArrowRight', () => current.value && props.items.length > 1 && step(1))
onKeyStroke('ArrowLeft', () => current.value && props.items.length > 1 && step(-1))
</script>

<!--
  HobbiesView — /hobbies — cards with a cover (photo or clip), emoji, name and description.
  A clip cover plays while the card is hovered; clicking the cover opens the hobby's
  gallery (cover photo + photos, clips and YouTube/Vimeo links) in the MediaLightbox.
-->
<template>
  <PageSection
    title="Hobbies"
    eyebrow="Off the keyboard"
    description="What I enjoy when I'm not coding."
  >
    <ul
      v-if="store.isLoading"
      class="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
    >
      <li v-for="n in 3" :key="n" class="rounded-xl border border-line p-4">
        <SkeletonBlock class="mb-3 h-36 w-full" />
        <SkeletonBlock class="h-4 w-1/2" />
      </li>
    </ul>

    <StateMessage
      v-else-if="store.status === 'error'"
      type="error"
      message="Couldn't load hobbies."
      retry
      @retry="store.load({ force: true })"
    />

    <StateMessage v-else-if="store.items.length === 0" message="No hobbies added yet." />

    <ul v-else class="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="hobby in cards"
        :key="hobby.id"
        class="overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40"
        @pointerenter="hoveredId = hobby.id"
        @pointerleave="hoveredId = null"
      >
        <button
          v-if="hobby.cover"
          type="button"
          class="group relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden border-0 bg-black/30 p-0"
          :aria-label="`Open ${hobby.name} gallery (${hobby.items.length} items)`"
          @click="open(hobby)"
        >
          <HoverVideo
            v-if="hobby.cover.type === 'video'"
            :src="hobby.cover.url"
            :poster="hobby.cover.thumbnail_url || ''"
            :alt="hobby.cover.alt || hobby.name"
            :active="hoveredId === hobby.id"
            :width="640"
            preload="none"
            class="pointer-events-none size-full object-cover"
          />
          <img
            v-else-if="previewUrl(hobby.cover)"
            :src="cdnUrl(previewUrl(hobby.cover), { width: 640 })"
            :alt="hobby.cover.alt || hobby.name"
            class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <span v-else class="flex size-full items-center justify-center text-4xl text-white">
            ▶
          </span>
          <span
            v-if="hobby.summary"
            class="absolute right-2 bottom-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs text-white"
            aria-hidden="true"
            >{{ hobby.summary }}</span
          >
        </button>
        <div class="flex items-start gap-3 p-4">
          <span class="text-2xl leading-none" aria-hidden="true">{{ hobby.icon || '🎯' }}</span>
          <div class="min-w-0">
            <h2 class="m-0 text-base font-semibold text-heading">{{ hobby.name }}</h2>
            <p v-if="hobby.description" class="m-0 mt-1 text-sm leading-relaxed">
              {{ hobby.description }}
            </p>
          </div>
        </div>
      </li>
    </ul>

    <MediaLightbox v-model:index="lightboxIndex" :items="openItems" :title="openTitle" />
  </PageSection>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useHobbiesStore } from '@/stores/content'
import HoverVideo from '@/components/common/HoverVideo.vue'
import MediaLightbox from '@/components/common/MediaLightbox.vue'
import PageSection from '@/components/common/PageSection.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'
import { cdnUrl, countByType, hobbyMedia, previewUrl } from '@/utils/media'

const store = useHobbiesStore()
const hoveredId = ref(null)

const cards = computed(() =>
  store.items.map((hobby) => {
    const { items, cover } = hobbyMedia(hobby)
    const counts = countByType(items)
    const clips = counts.video + counts.embed
    // e.g. "📷 3 · ▶ 2" — only when there's more to see than the cover
    const summary =
      items.length > 1
        ? [counts.image && `📷 ${counts.image}`, clips && `▶ ${clips}`].filter(Boolean).join(' · ')
        : ''
    return { ...hobby, items, cover, summary }
  }),
)

/* ── Gallery viewer ── */
const lightboxIndex = ref(null)
const openItems = ref([])
const openTitle = ref('')

function open(hobby) {
  openItems.value = hobby.items
  openTitle.value = hobby.name
  lightboxIndex.value = 0
}

onMounted(() => store.load())
</script>

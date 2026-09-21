<!-- HobbiesView — /hobbies — cards with optional photo, emoji, name and description -->
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
        v-for="hobby in store.items"
        :key="hobby.id"
        class="overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40"
      >
        <img
          v-if="hobby.image?.url"
          :src="hobby.image.url"
          :alt="hobby.image.alt || hobby.name"
          class="aspect-[16/10] w-full object-cover"
          loading="lazy"
        />
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
  </PageSection>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHobbiesStore } from '@/stores/content'
import PageSection from '@/components/common/PageSection.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'

const store = useHobbiesStore()
onMounted(() => store.load())
</script>

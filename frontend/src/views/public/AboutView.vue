<!-- AboutView — /about — introduction paragraphs (edited in /admin/profile) plus quick links -->
<template>
  <PageSection title="About me" eyebrow="Introduction">
    <div class="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div class="space-y-4 text-[1.02rem] leading-relaxed">
        <p v-for="(paragraph, index) in profile.about" :key="index" class="m-0 whitespace-pre-line">
          {{ paragraph }}
        </p>
      </div>

      <aside class="h-fit rounded-xl border border-line bg-surface p-5" aria-label="Quick links">
        <h2 class="m-0 mb-3 text-sm font-semibold tracking-wide text-heading uppercase">Explore</h2>
        <ul class="m-0 grid list-none gap-2 p-0 text-sm">
          <li>
            <RouterLink :to="{ name: 'projects' }" class="text-accent no-underline hover:underline"
              >🚀 Projects</RouterLink
            >
          </li>
          <li>
            <RouterLink :to="{ name: 'resume' }" class="text-accent no-underline hover:underline"
              >📄 Resume & experience</RouterLink
            >
          </li>
          <li>
            <RouterLink
              :to="{ name: 'certifications' }"
              class="text-accent no-underline hover:underline"
              >🏅 Certifications</RouterLink
            >
          </li>
          <li>
            <RouterLink :to="{ name: 'contact' }" class="text-accent no-underline hover:underline"
              >✉️ Send me a message</RouterLink
            >
          </li>
          <li v-if="profile.email">
            <a :href="`mailto:${profile.email}`" class="text-accent no-underline hover:underline"
              >✉️ {{ profile.email }}</a
            >
          </li>
          <li v-if="profile.location">📍 {{ profile.location }}</li>
        </ul>
      </aside>
    </div>
  </PageSection>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import PageSection from '@/components/common/PageSection.vue'
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()
const profile = computed(() => profileStore.profile)

onMounted(() => profileStore.load())
</script>

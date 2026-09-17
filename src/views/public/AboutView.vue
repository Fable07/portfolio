<!-- AboutView — /about — introduction text (from src/config/profile.js) plus quick links -->
<template>
  <PageSection title="About me" eyebrow="Introduction">
    <div class="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div class="space-y-4 text-[1.02rem] leading-relaxed">
        <p v-for="(paragraph, index) in profile.about" :key="index" class="m-0">{{ paragraph }}</p>
      </div>

      <aside class="rounded-xl border border-line bg-surface p-5" aria-label="Quick links">
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
            <a :href="`mailto:${profile.email}`" class="text-accent no-underline hover:underline"
              >✉️ {{ profile.email }}</a
            >
          </li>
        </ul>
      </aside>
    </div>
  </PageSection>
</template>

<script setup>
import PageSection from '@/components/common/PageSection.vue'
import { profile } from '@/config/profile'
</script>

<!--
  ProfileView — / (home page)
  Hero (photo, name, typewriter role, calls to action), skill groups and social links.
  All content comes from src/config/profile.js — edit that file, not this template.
-->
<template>
  <PageSection>
    <template #header>
      <!-- ── Hero ── -->
      <header
        class="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left"
      >
        <img
          :src="profile.avatar"
          :alt="`Photo of ${profile.name}`"
          class="size-32 shrink-0 rounded-2xl border border-line object-cover p-1.5 shadow-[0_8px_30px_rgba(2,6,12,0.45)] sm:size-40 lg:size-44"
          width="176"
          height="176"
        />

        <div class="min-w-0 flex-1">
          <p
            class="m-0 mb-1 font-mono text-xs font-semibold tracking-widest text-accent/80 uppercase"
          >
            Hello, I'm
          </p>
          <h1 class="m-0 text-3xl font-bold text-heading sm:text-4xl">{{ profile.name }}</h1>

          <p class="m-0 mt-2 min-h-[1.6em] text-lg text-muted" aria-hidden="true">
            {{ typedRole }}<span class="ml-px text-accent motion-safe:animate-blink">|</span>
          </p>
          <!-- Screen readers get the full list instead of the animated text -->
          <p class="sr-only">{{ profile.roles.join(', ') }}</p>

          <p class="m-0 mt-3 max-w-xl leading-relaxed">{{ profile.about[0] }}</p>

          <div class="mt-5 flex flex-wrap justify-center gap-2.5 sm:justify-start">
            <RouterLink :to="{ name: 'projects' }" class="btn-primary">View projects →</RouterLink>
            <RouterLink :to="{ name: 'resume' }" class="btn-secondary">Resume</RouterLink>
            <RouterLink :to="{ name: 'terminal' }" class="btn-secondary font-mono"
              >&gt;_ terminal</RouterLink
            >
          </div>
        </div>
      </header>
    </template>

    <!-- ── Skills ── -->
    <section aria-labelledby="skills-heading" class="mt-10">
      <h2 id="skills-heading" class="m-0 mb-4 text-xl font-bold text-heading">Skills & tools</h2>

      <div class="grid gap-6">
        <div v-for="group in skillGroups" :key="group.title">
          <h3
            class="m-0 mb-3 font-mono text-xs font-semibold tracking-widest text-accent uppercase"
          >
            {{ group.title }}
          </h3>
          <ul
            class="m-0 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            <li
              v-for="skill in group.skills"
              :key="skill.name"
              class="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-heading transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50"
            >
              <img :src="skill.icon" alt="" class="size-8 shrink-0 object-contain" loading="lazy" />
              <span class="min-w-0 truncate">{{ skill.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ── Social links ── -->
    <section aria-labelledby="social-heading" class="mt-10 border-t border-line pt-8 text-center">
      <h2 id="social-heading" class="m-0 mb-4 text-lg font-semibold text-heading">Let's connect</h2>
      <ul class="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
        <li v-for="link in socialLinks" :key="link.label">
          <a
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="link.label"
            :title="link.label"
            class="flex size-12 items-center justify-center rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_6px_16px_var(--glow)]"
          >
            <img :src="link.icon" alt="" class="size-7 object-contain" />
          </a>
        </li>
      </ul>
    </section>
  </PageSection>
</template>

<script setup>
import PageSection from '@/components/common/PageSection.vue'
import { profile, skillGroups, socialLinks } from '@/config/profile'
import { useTypewriter } from '@/composables/useTypewriter'

const { text: typedRole } = useTypewriter(profile.roles)
</script>

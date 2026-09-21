<!--
  ProfileView — / (home page)
  Hero (photo, name, availability, typewriter role, calls to action), featured projects,
  skill groups and social links.
  Content comes from the profile store (edited in /admin/profile; defaults in
  src/config/profile.js) and featured projects from the projects store.
-->
<template>
  <PageSection>
    <template #header>
      <!-- ── Hero ── -->
      <header
        class="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left"
      >
        <img
          :src="profile.avatarUrl"
          :alt="profile.avatarAlt"
          class="size-32 shrink-0 rounded-2xl border border-line object-cover p-1.5 shadow-[0_8px_30px_rgba(2,6,12,0.45)] sm:size-40 lg:size-44"
          width="176"
          height="176"
        />

        <div class="min-w-0 flex-1">
          <div class="mb-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <p class="m-0 font-mono text-xs font-semibold tracking-widest text-accent/80 uppercase">
              Hello, I'm
            </p>
            <span
              v-if="profile.availability"
              class="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400"
            >
              <span
                class="size-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"
                aria-hidden="true"
              ></span>
              {{ profile.availability }}
            </span>
          </div>
          <h1 class="m-0 text-3xl font-bold text-heading sm:text-4xl">{{ profile.name }}</h1>

          <p class="m-0 mt-2 min-h-[1.6em] text-lg text-muted" aria-hidden="true">
            {{ typedRole }}<span class="ml-px text-accent motion-safe:animate-blink">|</span>
          </p>
          <!-- Screen readers get the full list instead of the animated text -->
          <p class="sr-only">{{ profile.roles.join(', ') }}</p>

          <p v-if="profile.about[0]" class="m-0 mt-3 max-w-xl leading-relaxed">
            {{ profile.about[0] }}
          </p>
          <p v-if="profile.location" class="m-0 mt-2 text-sm">📍 {{ profile.location }}</p>

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

    <!-- ── Featured projects (only when some are marked featured in the admin) ── -->
    <section v-if="featured.length" aria-labelledby="featured-heading" class="mt-10">
      <div class="mb-4 flex items-end justify-between gap-3">
        <h2 id="featured-heading" class="m-0 text-xl font-bold text-heading">Featured projects</h2>
        <RouterLink
          :to="{ name: 'projects' }"
          class="text-sm font-semibold text-accent no-underline hover:underline"
        >
          All projects →
        </RouterLink>
      </div>
      <ul class="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="project in featured" :key="project.id">
          <ProjectCard
            :project="project"
            heading-tag="h3"
            @tag="(tag) => router.push({ name: 'projects', query: { tag } })"
          />
        </li>
      </ul>
    </section>

    <!-- ── Skills ── -->
    <section v-if="profile.skillGroups.length" aria-labelledby="skills-heading" class="mt-10">
      <h2 id="skills-heading" class="m-0 mb-4 text-xl font-bold text-heading">Skills & tools</h2>

      <div class="grid gap-6">
        <div v-for="group in profile.skillGroups" :key="group.title">
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
              <img
                v-if="skill.iconUrl"
                :src="skill.iconUrl"
                alt=""
                class="size-8 shrink-0 object-contain"
                loading="lazy"
              />
              <span
                v-else
                class="flex size-8 shrink-0 items-center justify-center font-mono text-accent/60"
                aria-hidden="true"
                >•</span
              >
              <span class="min-w-0 truncate">{{ skill.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ── Social links ── -->
    <section
      v-if="profile.socialLinks.length"
      aria-labelledby="social-heading"
      class="mt-10 border-t border-line pt-8 text-center"
    >
      <h2 id="social-heading" class="m-0 mb-4 text-lg font-semibold text-heading">Let's connect</h2>
      <ul class="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
        <li v-for="link in profile.socialLinks" :key="link.label + link.href">
          <a
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="link.label"
            :title="link.label"
            class="flex size-12 items-center justify-center rounded-xl border border-line bg-surface font-bold text-accent no-underline transition-all duration-200 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_6px_16px_var(--glow)]"
          >
            <img v-if="link.iconUrl" :src="link.iconUrl" alt="" class="size-7 object-contain" />
            <span v-else aria-hidden="true">{{ link.label.charAt(0) }}</span>
          </a>
        </li>
      </ul>
    </section>
  </PageSection>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageSection from '@/components/common/PageSection.vue'
import ProjectCard from '@/components/common/ProjectCard.vue'
import { useTypewriter } from '@/composables/useTypewriter'
import { useProjectsStore } from '@/stores/content'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const profileStore = useProfileStore()
const projects = useProjectsStore()

const profile = computed(() => profileStore.profile)
const featured = computed(() => projects.items.filter((project) => project.is_featured).slice(0, 3))

const { text: typedRole } = useTypewriter(() => profile.value.roles)

onMounted(() => {
  profileStore.load()
  projects.load()
})
</script>

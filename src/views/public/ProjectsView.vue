<!--
  ProjectsView — /projects
  Project cards with a tech-stack filter. The active filter lives in the URL
  (/projects?tag=Vue), so a filtered view can be shared and survives refresh/back.
  Clicking a card opens /projects/:id (ProjectDetailView) with the full gallery.
-->
<template>
  <PageSection title="Projects" eyebrow="Work" description="Things I've designed and built.">
    <div v-if="store.isLoading" aria-busy="true">
      <div class="mb-6 flex gap-2">
        <SkeletonBlock v-for="n in 4" :key="n" class="h-8 w-20 rounded-full" />
      </div>
      <ul class="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="n in 3" :key="n" class="rounded-xl border border-line p-4">
          <SkeletonBlock class="mb-4 aspect-video w-full" />
          <SkeletonBlock class="mb-2 h-5 w-2/3" />
          <SkeletonBlock class="h-4 w-full" />
        </li>
      </ul>
    </div>

    <StateMessage
      v-else-if="store.status === 'error'"
      type="error"
      message="Couldn't load projects."
      retry
      @retry="store.load({ force: true })"
    />

    <StateMessage v-else-if="store.items.length === 0" message="No projects added yet." />

    <template v-else>
      <!-- Filter chips -->
      <div
        class="mb-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter projects by technology"
      >
        <button
          v-for="tag in ['All', ...allTags]"
          :key="tag"
          type="button"
          class="cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.82rem] font-semibold transition-colors"
          :class="
            activeTag === tag
              ? 'border-transparent bg-linear-to-r from-accent to-accent-2 text-ink'
              : 'border-line bg-transparent text-muted hover:border-accent hover:text-accent'
          "
          :aria-pressed="activeTag === tag"
          @click="setTag(tag)"
        >
          {{ tag === 'All' ? `All (${store.items.length})` : tag }}
        </button>
      </div>

      <StateMessage v-if="filtered.length === 0" :message="`No projects use “${activeTag}” yet.`" />

      <ul v-else class="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="project in filtered"
          :key="project.id"
          class="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
        >
          <!-- Cover -->
          <div class="relative aspect-video overflow-hidden bg-accent/5">
            <img
              v-if="projectCover(project) && !brokenCovers.has(project.id)"
              :src="projectCover(project)"
              :alt="''"
              class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              @error="brokenCovers.add(project.id)"
            />
            <div
              v-else
              class="flex size-full items-center justify-center font-mono text-3xl text-accent/40"
              aria-hidden="true"
            >
              &lt;/&gt;
            </div>
            <span
              v-if="mediaBadge(project)"
              class="absolute right-2 bottom-2 rounded-md bg-black/65 px-2 py-0.5 text-xs text-white"
            >
              {{ mediaBadge(project) }}
            </span>
          </div>

          <div class="flex flex-1 flex-col p-4">
            <h2 class="m-0 text-lg font-semibold text-heading">
              <!-- The title link covers the whole card (after: pseudo-element), so the card is clickable -->
              <RouterLink
                :to="{ name: 'project-detail', params: { id: project.id } }"
                class="text-inherit no-underline after:absolute after:inset-0 after:content-['']"
              >
                {{ project.title }}
              </RouterLink>
            </h2>
            <p v-if="project.description" class="m-0 mt-2 line-clamp-3 text-sm leading-relaxed">
              {{ project.description }}
            </p>

            <!-- Tags sit above the card link (relative z-10) so they stay clickable -->
            <div v-if="project.tech_stack" class="relative z-10 mt-3 flex flex-wrap gap-1.5">
              <button
                v-for="tag in splitTags(project.tech_stack)"
                :key="tag"
                type="button"
                class="chip cursor-pointer"
                :class="{ 'ring-1 ring-accent': activeTag === tag }"
                :title="`Show ${tag} projects`"
                @click="setTag(tag)"
              >
                {{ tag }}
              </button>
            </div>

            <div class="relative z-10 mt-auto flex flex-wrap gap-3 pt-4 text-sm font-semibold">
              <a
                v-if="project.project_url"
                :href="project.project_url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-accent no-underline hover:underline"
                >Live ↗</a
              >
              <a
                v-if="project.github_url"
                :href="project.github_url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-muted no-underline hover:text-heading hover:underline"
                >GitHub ↗</a
              >
            </div>
          </div>
        </li>
      </ul>
    </template>
  </PageSection>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/content'
import { countByType, projectCover } from '@/utils/media'
import PageSection from '@/components/common/PageSection.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'

const store = useProjectsStore()
const route = useRoute()
const router = useRouter()
const brokenCovers = reactive(new Set()) // project IDs whose cover image failed to load

onMounted(() => store.load())

/** "Vue, Laravel , PostgreSQL" → ['Vue', 'Laravel', 'PostgreSQL'] */
function splitTags(techStack) {
  return (techStack || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

// Active filter comes from ?tag=… in the URL
const activeTag = computed(() => (typeof route.query.tag === 'string' ? route.query.tag : 'All'))

function setTag(tag) {
  router.replace({ query: tag === 'All' ? {} : { tag } })
}

const allTags = computed(() => {
  const tags = new Set(store.items.flatMap((project) => splitTags(project.tech_stack)))
  return [...tags].sort((a, b) => a.localeCompare(b))
})

const filtered = computed(() =>
  activeTag.value === 'All'
    ? store.items
    : store.items.filter((project) => splitTags(project.tech_stack).includes(activeTag.value)),
)

/** "📷 3 · ▶ 1" — how much media a project has */
function mediaBadge(project) {
  const counts = countByType(project.media)
  const videos = counts.video + counts.embed
  return [counts.image && `📷 ${counts.image}`, videos && `▶ ${videos}`].filter(Boolean).join(' · ')
}
</script>

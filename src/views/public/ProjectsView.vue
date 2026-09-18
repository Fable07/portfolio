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

      <ul
        v-else
        class="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="project-grid"
      >
        <li v-for="project in filtered" :key="project.id">
          <ProjectCard :project="project" :active-tag="activeTag" @tag="setTag" />
        </li>
      </ul>
    </template>
  </PageSection>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/content'
import PageSection from '@/components/common/PageSection.vue'
import ProjectCard from '@/components/common/ProjectCard.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'

const store = useProjectsStore()
const route = useRoute()
const router = useRouter()

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
</script>

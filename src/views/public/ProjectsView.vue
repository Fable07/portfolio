<!--
  ProjectsView — /projects
  Project cards with a tech-stack filter: click a filter chip (or a tag on a card)
  to show only projects that use that technology.
-->
<template>
  <section id="projects" class="projects-section section">
    <div class="container2">
      <h2>Projects</h2>

      <LoadingDots v-if="store.isLoading" />

      <StateMessage
        v-else-if="store.status === 'error'"
        type="error"
        message="Couldn't load projects."
        retry
        @retry="store.load({ force: true })"
      />

      <StateMessage v-else-if="store.items.length === 0" message="No projects added yet." />

      <template v-else>
        <!-- Filter chips: "All" + every unique tech tag -->
        <div class="proj-filters" role="group" aria-label="Filter projects by technology">
          <button
            v-for="tag in ['All', ...allTags]"
            :key="tag"
            type="button"
            class="proj-filter-btn"
            :class="{ 'proj-filter-btn--active': activeFilter === tag }"
            :aria-pressed="activeFilter === tag"
            @click="activeFilter = tag"
          >
            {{ tag === 'All' ? `All (${store.items.length})` : tag }}
          </button>
        </div>

        <StateMessage
          v-if="filteredProjects.length === 0"
          :message="`No projects found for &quot;${activeFilter}&quot;.`"
        />

        <ul
          v-else
          class="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"
        >
          <li v-for="project in filteredProjects" :key="project.id" class="proj">
            <img
              v-if="project.thumbnail_url && !brokenThumbnails.has(project.id)"
              :src="project.thumbnail_url"
              :alt="project.title"
              class="proj-thumbnail"
              loading="lazy"
              @error="brokenThumbnails.add(project.id)"
            />

            <h3 class="mt-0 mb-2 text-lg font-semibold sm:text-xl">{{ project.title }}</h3>

            <p v-if="project.description" class="mb-3 text-sm sm:text-base">
              {{ project.description }}
            </p>

            <!-- Tech tags — clicking one filters the list -->
            <div v-if="project.tech_stack" class="proj-tags">
              <button
                v-for="tag in splitTags(project.tech_stack)"
                :key="tag"
                type="button"
                class="proj-tag"
                :class="{ 'proj-tag--active': activeFilter === tag }"
                :title="`Show ${tag} projects`"
                @click="activeFilter = tag"
              >
                {{ tag }}
              </button>
            </div>

            <div class="proj-links">
              <a
                v-if="project.project_url"
                :href="project.project_url"
                target="_blank"
                rel="noopener noreferrer"
                class="proj-link"
                >View Project →</a
              >
              <a
                v-if="project.github_url"
                :href="project.github_url"
                target="_blank"
                rel="noopener noreferrer"
                class="proj-link proj-link--github"
                >GitHub ↗</a
              >
            </div>
          </li>
        </ul>
      </template>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/content'
import LoadingDots from '@/components/common/LoadingDots.vue'
import StateMessage from '@/components/common/StateMessage.vue'

const store = useProjectsStore()
const activeFilter = ref('All')
const brokenThumbnails = reactive(new Set()) // project IDs whose image failed to load

onMounted(() => store.load())

/** "Vue, Laravel , PostgreSQL" → ['Vue', 'Laravel', 'PostgreSQL'] */
function splitTags(techStack) {
  return techStack
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

// Every unique tag across all projects, A → Z
const allTags = computed(() => {
  const tags = new Set(store.items.flatMap((project) => splitTags(project.tech_stack || '')))
  return [...tags].sort()
})

const filteredProjects = computed(() => {
  if (activeFilter.value === 'All') return store.items
  return store.items.filter((project) =>
    splitTags(project.tech_stack || '').includes(activeFilter.value),
  )
})
</script>

<style scoped>
/* ── Filter chips ── */
.proj-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 1.5rem;
}
.proj-filter-btn {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.proj-filter-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.proj-filter-btn--active {
  background: linear-gradient(90deg, var(--accent), #49c19b);
  border-color: transparent;
  color: #01221a;
}

/* ── Card parts ── */
.proj-thumbnail {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}
.proj-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.proj-tag {
  font: inherit;
  font-size: 0.75rem;
  padding: 2px 8px;
  background: rgba(124, 219, 182, 0.08);
  color: var(--accent);
  border-radius: 20px;
  border: 1px solid rgba(124, 219, 182, 0.15);
  cursor: pointer;
  transition: all 0.2s;
}
.proj-tag:hover {
  background: rgba(124, 219, 182, 0.18);
}
.proj-tag--active {
  background: rgba(124, 219, 182, 0.2);
  border-color: var(--accent);
  font-weight: 700;
}
.proj-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.proj-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: opacity 0.2s;
}
.proj-link:hover {
  opacity: 0.75;
  text-decoration: underline;
}
.proj-link--github {
  color: var(--muted);
}
</style>

<template>
  <section id="projects" class="projects-section section">
    <div class="container2">
      <h2>Projects</h2>

      <!-- Loading -->
      <div v-if="loading" class="proj-loading">
        <span class="proj-loading__dot"></span>
        <span class="proj-loading__dot"></span>
        <span class="proj-loading__dot"></span>
      </div>

      <!-- Empty -->
      <p v-else-if="projects.length === 0" class="proj-empty">No projects added yet.</p>

      <template v-else>
        <!-- ── Filter Buttons ── -->
        <div class="proj-filters">
          <button
            class="proj-filter-btn"
            :class="{ 'proj-filter-btn--active': activeFilter === 'All' }"
            @click="activeFilter = 'All'"
          >
            All ({{ projects.length }})
          </button>
          <button
            v-for="tag in allTags"
            :key="tag"
            class="proj-filter-btn"
            :class="{ 'proj-filter-btn--active': activeFilter === tag }"
            @click="activeFilter = tag"
          >
            {{ tag }}
          </button>
        </div>

        <!-- No results after filtering -->
        <p v-if="filteredProjects.length === 0" class="proj-empty">
          No projects found for "{{ activeFilter }}".
        </p>

        <!-- Projects grid -->
        <ul v-else class="projects__list">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div v-for="project in filteredProjects" :key="project.id" class="proj">
              <!-- Thumbnail -->
              <img
                v-if="project.thumbnail_url"
                :src="project.thumbnail_url"
                :alt="project.title"
                class="proj-thumbnail"
                @error="project.thumbnail_url = ''"
              />

              <!-- Title -->
              <h3 class="text-lg sm:text-xl font-semibold mb-2">{{ project.title }}</h3>

              <!-- Description -->
              <p v-if="project.description" class="mb-3 text-sm sm:text-base">
                {{ project.description }}
              </p>

              <!-- Tech stack tags — clickable to filter -->
              <div v-if="project.tech_stack" class="proj-tags">
                <span
                  v-for="tag in project.tech_stack.split(',')"
                  :key="tag"
                  class="proj-tag"
                  :class="{ 'proj-tag--active': activeFilter === tag.trim() }"
                  @click="activeFilter = tag.trim()"
                >
                  {{ tag.trim() }}
                </span>
              </div>

              <!-- Links -->
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
            </div>
          </div>
        </ul>
      </template>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const projects = ref([])
const loading = ref(true)
const activeFilter = ref('All')

onMounted(async () => {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/projects')
    projects.value = await res.json()
  } catch {
    projects.value = []
  } finally {
    loading.value = false
  }
})

// Collect all unique tags across all projects — sorted alphabetically
const allTags = computed(() => {
  const tags = new Set()
  projects.value.forEach((project) => {
    if (project.tech_stack) {
      project.tech_stack.split(',').forEach((tag) => tags.add(tag.trim()))
    }
  })
  return [...tags].sort()
})

// Filter projects by selected tag
const filteredProjects = computed(() => {
  if (activeFilter.value === 'All') return projects.value
  return projects.value.filter((project) => {
    if (!project.tech_stack) return false
    return project.tech_stack
      .split(',')
      .map((t) => t.trim())
      .includes(activeFilter.value)
  })
})
</script>

<style scoped>
/* ── Loading dots ── */
.proj-loading {
  display: flex;
  gap: 6px;
  padding: 1rem 0;
}

.proj-loading__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: projBounce 1.2s ease-in-out infinite both;
}

.proj-loading__dot:nth-child(2) {
  animation-delay: 0.16s;
}
.proj-loading__dot:nth-child(3) {
  animation-delay: 0.32s;
}

@keyframes projBounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ── Empty state ── */
.proj-empty {
  color: var(--muted);
  font-size: 0.9rem;
}

/* ── Filter buttons ── */
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

/* ── Thumbnail ── */
.proj-thumbnail {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

/* ── Tech stack tags ── */
.proj-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.proj-tag {
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

/* Active tag matches current filter */
.proj-tag--active {
  background: rgba(124, 219, 182, 0.2);
  border-color: var(--accent);
  font-weight: 700;
}

/* ── Links ── */
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

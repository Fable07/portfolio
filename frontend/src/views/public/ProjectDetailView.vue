<!--
  ProjectDetailView — /projects/:id
  One project: gallery (images, uploaded videos, YouTube/Vimeo), description,
  tech stack, links, and previous/next navigation. Clicking a gallery item opens
  the full-screen MediaLightbox.
-->
<template>
  <div>
    <AppBreadcrumbs
      :items="[
        { label: 'Projects', to: { name: 'projects' } },
        { label: project?.title || 'Project' },
      ]"
    />

    <!-- Loading -->
    <PageSection v-if="loading" aria-busy="true">
      <template #header>
        <SkeletonBlock class="mb-6 h-8 w-1/2" />
      </template>
      <SkeletonBlock class="mb-4 aspect-video w-full" />
      <SkeletonBlock class="mb-2 h-4 w-full" />
      <SkeletonBlock class="h-4 w-2/3" />
    </PageSection>

    <!-- Not found / error -->
    <PageSection
      v-else-if="!project"
      :title="notFound ? 'Project not found' : 'Something went wrong'"
    >
      <StateMessage
        :type="notFound ? 'empty' : 'error'"
        :message="notFound ? 'This project may have been removed.' : 'Couldn\'t load this project.'"
        :retry="!notFound"
        @retry="load"
      />
      <RouterLink :to="{ name: 'projects' }" class="btn-secondary mt-4">← All projects</RouterLink>
    </PageSection>

    <PageSection v-else :title="project.title" eyebrow="Project">
      <template #actions>
        <a
          v-if="project.project_url"
          :href="project.project_url"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary"
          >Live site ↗</a
        >
        <a
          v-if="project.github_url"
          :href="project.github_url"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary"
          >Source code ↗</a
        >
      </template>

      <!-- ── Gallery ── -->
      <section v-if="gallery.length" aria-label="Gallery" class="mb-8">
        <!-- Featured item -->
        <button
          type="button"
          class="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-line bg-black/30 p-0"
          :aria-label="`Open ${describe(featured)} in full screen`"
          @click="lightboxIndex = featuredIndex"
        >
          <img
            v-if="previewUrl(featured)"
            :src="previewUrl(featured)"
            :alt="featured.alt || project.title"
            class="aspect-video w-full object-contain"
          />
          <video
            v-else-if="featured.type === 'video'"
            :src="featured.url"
            preload="metadata"
            muted
            class="pointer-events-none aspect-video w-full object-contain"
          ></video>
          <span
            v-if="featured.type !== 'image'"
            class="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span
              class="flex size-16 items-center justify-center rounded-full bg-black/60 text-3xl text-white transition-transform group-hover:scale-110"
              >▶</span
            >
          </span>
        </button>

        <!-- Thumbnails -->
        <ul
          v-if="gallery.length > 1"
          class="m-0 mt-3 flex list-none gap-2 overflow-x-auto p-0 pb-1"
        >
          <li v-for="(item, index) in gallery" :key="item.id" class="shrink-0">
            <button
              type="button"
              class="relative block h-16 w-28 cursor-pointer overflow-hidden rounded-lg border-2 bg-black/30 p-0"
              :class="
                index === featuredIndex
                  ? 'border-accent'
                  : 'border-transparent opacity-70 hover:opacity-100'
              "
              :aria-label="`Show ${describe(item)}`"
              :aria-pressed="index === featuredIndex"
              @click="featuredIndex = index"
            >
              <img
                v-if="previewUrl(item)"
                :src="previewUrl(item)"
                alt=""
                class="size-full object-cover"
                loading="lazy"
              />
              <span
                v-else
                class="flex size-full items-center justify-center text-white"
                aria-hidden="true"
                >▶</span
              >
              <span
                v-if="item.type !== 'image'"
                class="absolute right-1 bottom-1 rounded bg-black/70 px-1 text-[0.6rem] text-white"
                aria-hidden="true"
                >▶</span
              >
            </button>
          </li>
        </ul>
      </section>

      <div class="grid gap-8 lg:grid-cols-[1fr_260px]">
        <div class="min-w-0">
          <!-- ── Case study (only the parts that are filled in) ── -->
          <section id="overview" class="scroll-mt-24">
            <h2 class="m-0 mb-3 text-lg font-semibold text-heading">Overview</h2>
            <p v-if="project.description" class="m-0 leading-relaxed whitespace-pre-line">
              {{ project.description }}
            </p>
            <p v-else class="m-0 italic">No description yet.</p>
          </section>

          <ul v-if="caseStudy.highlights?.length" class="m-0 mt-6 grid list-none gap-2 p-0">
            <li
              v-for="(highlight, index) in caseStudy.highlights"
              :key="index"
              class="flex gap-2.5 rounded-xl border border-accent/20 bg-accent/5 px-3.5 py-2.5 text-sm"
            >
              <span aria-hidden="true" class="text-accent">✦</span>
              <span class="text-heading">{{ highlight }}</span>
            </li>
          </ul>

          <section
            v-for="part in storyParts"
            :key="part.id"
            :id="part.id"
            class="mt-8 scroll-mt-24"
          >
            <h2 class="m-0 mb-3 text-lg font-semibold text-heading">{{ part.heading }}</h2>
            <p class="m-0 leading-relaxed whitespace-pre-line">{{ part.body }}</p>
          </section>
        </div>

        <aside class="grid h-fit gap-4 lg:sticky lg:top-4">
          <!-- Jump links appear once there's more than the overview to read -->
          <nav
            v-if="storyParts.length"
            aria-label="On this page"
            class="rounded-xl border border-line bg-surface p-5"
          >
            <h2 class="m-0 mb-2 text-sm font-semibold tracking-wide text-heading uppercase">
              On this page
            </h2>
            <ul class="m-0 grid list-none gap-1.5 p-0 text-sm">
              <li>
                <a href="#overview" class="text-accent no-underline hover:underline">Overview</a>
              </li>
              <li v-for="part in storyParts" :key="part.id">
                <a :href="`#${part.id}`" class="text-accent no-underline hover:underline">{{
                  part.heading
                }}</a>
              </li>
            </ul>
          </nav>

          <div class="rounded-xl border border-line bg-surface p-5">
            <h2 class="m-0 mb-3 text-sm font-semibold tracking-wide text-heading uppercase">
              Tech stack
            </h2>
            <div v-if="tags.length" class="flex flex-wrap gap-1.5">
              <RouterLink
                v-for="tag in tags"
                :key="tag"
                :to="{ name: 'skills', query: { skill: tag } }"
                class="chip no-underline hover:ring-1 hover:ring-accent"
                :title="`See where ${tag} is used`"
              >
                {{ tag }}
              </RouterLink>
            </div>
            <p v-else class="m-0 text-sm">—</p>

            <dl
              v-if="caseStudy.role || caseStudy.period"
              class="m-0 mt-4 grid gap-2 border-t border-line pt-4 text-sm"
            >
              <div v-if="caseStudy.role">
                <dt class="text-xs tracking-wide text-muted uppercase">Role</dt>
                <dd class="m-0 text-heading">{{ caseStudy.role }}</dd>
              </div>
              <div v-if="caseStudy.period">
                <dt class="text-xs tracking-wide text-muted uppercase">When</dt>
                <dd class="m-0 text-heading">{{ caseStudy.period }}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <!-- Previous / next project -->
      <nav
        v-if="siblings.previous || siblings.next"
        aria-label="More projects"
        class="mt-10 flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-sm"
      >
        <RouterLink
          v-if="siblings.previous"
          :to="{ name: 'project-detail', params: { id: siblings.previous.id } }"
          class="max-w-[48%] truncate text-muted no-underline hover:text-accent"
        >
          ← {{ siblings.previous.title }}
        </RouterLink>
        <span v-else />
        <RouterLink
          v-if="siblings.next"
          :to="{ name: 'project-detail', params: { id: siblings.next.id } }"
          class="max-w-[48%] truncate text-right text-muted no-underline hover:text-accent"
        >
          {{ siblings.next.title }} →
        </RouterLink>
      </nav>
    </PageSection>

    <MediaLightbox
      v-if="project"
      v-model:index="lightboxIndex"
      :items="gallery"
      :title="project.title"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { projectsApi } from '@/api'
import { useProjectsStore } from '@/stores/content'
import { mediaList, previewUrl, projectCover } from '@/utils/media'
import AppBreadcrumbs from '@/components/common/AppBreadcrumbs.vue'
import MediaLightbox from '@/components/common/MediaLightbox.vue'
import PageSection from '@/components/common/PageSection.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'

const props = defineProps({
  id: { type: String, required: true }, // from the URL, via `props: true` on the route
})

const store = useProjectsStore()
const project = ref(null)
const loading = ref(true)
const notFound = ref(false)
const featuredIndex = ref(0)
const lightboxIndex = ref(null)

/** Use the cached list when possible; fall back to GET /projects/:id (e.g. direct link). */
async function load() {
  loading.value = true
  notFound.value = false
  featuredIndex.value = 0
  try {
    await store.load()
    project.value = store.findById(props.id) ?? (await projectsApi.get(props.id))
  } catch (err) {
    project.value = null
    notFound.value = err?.status === 404 || store.status === 'ready'
  } finally {
    loading.value = false
  }
}
watch(() => props.id, load, { immediate: true })

const gallery = computed(() =>
  mediaList(project.value?.media).filter((item) => item.type !== 'document'),
)

/**
 * Case study (all fields optional — see the backend's add_case_study migration).
 * `storyParts` is the readable write-up in order: the three standard questions first,
 * then any custom sections the admin added.
 */
const caseStudy = computed(() => project.value?.case_study ?? {})

const storyParts = computed(() => {
  const study = caseStudy.value
  const standard = [
    { id: 'problem', heading: 'The problem', body: study.problem },
    { id: 'approach', heading: 'My approach', body: study.approach },
    { id: 'outcome', heading: 'Outcome', body: study.outcome },
  ]
  const custom = (study.sections ?? []).map((section, index) => ({
    id: `section-${index + 1}`,
    heading: section.heading,
    body: section.body,
  }))
  return [...standard, ...custom].filter((part) => part.body?.trim())
})
const featured = computed(() => gallery.value[featuredIndex.value] ?? gallery.value[0])
const tags = computed(() =>
  (project.value?.tech_stack || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean),
)

const siblings = computed(() => {
  const index = store.items.findIndex((item) => String(item.id) === String(props.id))
  if (index === -1) return {}
  return { previous: store.items[index - 1], next: store.items[index + 1] }
})

const describe = (item) =>
  item?.alt || (item?.type === 'image' ? 'image' : item?.type === 'document' ? 'document' : 'video')

// Page title + social preview (Open Graph) for this project
useHead(() => {
  const cover = project.value ? projectCover(project.value) : ''
  return {
    title: project.value?.title ?? 'Project',
    meta: [
      {
        name: 'description',
        content: project.value?.description?.slice(0, 160) || 'Project details',
      },
      { property: 'og:title', content: project.value?.title ?? 'Project' },
      ...(cover ? [{ property: 'og:image', content: cover }] : []),
    ],
  }
})
</script>

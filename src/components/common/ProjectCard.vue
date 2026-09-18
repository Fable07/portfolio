<!--
  ProjectCard — one project tile: cover image, title, description, tech tags and links.

  Used by the public Projects page, the home page's "Featured projects" and the admin
  project form's live preview — so the preview always matches what visitors see.

  <ProjectCard :project="project" :active-tag="activeTag" @tag="setTag" />
  <ProjectCard :project="draftForm" preview />   ← preview: no navigation link
-->
<template>
  <article
    class="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200"
    :class="
      preview
        ? ''
        : 'hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]'
    "
  >
    <!-- Cover -->
    <div class="relative aspect-video overflow-hidden bg-accent/5">
      <img
        v-if="cover && !brokenCover"
        :src="cover"
        alt=""
        class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="brokenCover = true"
      />
      <div
        v-else
        class="flex size-full items-center justify-center font-mono text-3xl text-accent/40"
        aria-hidden="true"
      >
        &lt;/&gt;
      </div>
      <span
        v-if="project.is_featured"
        class="absolute top-2 left-2 rounded-md bg-amber-400/90 px-2 py-0.5 text-xs font-bold text-amber-950"
      >
        ★ Featured
      </span>
      <span
        v-if="hasCaseStudy"
        class="absolute top-2 right-2 rounded-md bg-sky-400/90 px-2 py-0.5 text-xs font-bold text-sky-950"
        title="This project has a written case study"
      >
        Case study
      </span>
      <span
        v-if="mediaBadge"
        class="absolute right-2 bottom-2 rounded-md bg-black/65 px-2 py-0.5 text-xs text-white"
      >
        {{ mediaBadge }}
      </span>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <component :is="headingTag" class="m-0 text-lg font-semibold text-heading">
        <span v-if="preview">{{ project.title || 'Untitled project' }}</span>
        <!-- The title link covers the whole card (after: pseudo-element), so the card is clickable -->
        <RouterLink
          v-else
          :to="{ name: 'project-detail', params: { id: project.id } }"
          class="text-inherit no-underline after:absolute after:inset-0 after:content-['']"
        >
          {{ project.title }}
        </RouterLink>
      </component>
      <p v-if="project.description" class="m-0 mt-2 line-clamp-3 text-sm leading-relaxed">
        {{ project.description }}
      </p>

      <!-- Tags sit above the card link (relative z-10) so they stay clickable -->
      <div v-if="tags.length" class="relative z-10 mt-3 flex flex-wrap gap-1.5">
        <button
          v-for="tag in tags"
          :key="tag"
          type="button"
          class="chip cursor-pointer"
          :class="{ 'ring-1 ring-accent': activeTag === tag }"
          :title="`Show ${tag} projects`"
          @click="$emit('tag', tag)"
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
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { countByType, projectCover } from '@/utils/media'

const props = defineProps({
  project: { type: Object, required: true },
  activeTag: { type: String, default: '' },
  /** Admin live preview: no link, placeholder title */
  preview: { type: Boolean, default: false },
  headingTag: { type: String, default: 'h2' },
})
defineEmits(['tag'])

const brokenCover = ref(false)
const cover = computed(() => projectCover(props.project))
watch(cover, () => (brokenCover.value = false))

/** "Vue, Laravel , PostgreSQL" → ['Vue', 'Laravel', 'PostgreSQL'] */
const tags = computed(() =>
  (props.project.tech_stack || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean),
)

/** Does the project have any case-study text worth advertising? */
const hasCaseStudy = computed(() => {
  const study = props.project.case_study ?? {}
  return !!(study.problem || study.approach || study.outcome || study.sections?.length)
})

/** "📷 3 · ▶ 1" — how much media a project has */
const mediaBadge = computed(() => {
  const counts = countByType(props.project.media)
  const videos = counts.video + counts.embed
  return [counts.image && `📷 ${counts.image}`, videos && `▶ ${videos}`].filter(Boolean).join(' · ')
})
</script>

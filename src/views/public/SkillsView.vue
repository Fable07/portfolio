<!--
  SkillsView — /skills
  The skill graph: pick a skill to see which projects and certifications use it.
  The selection lives in the URL (/skills?skill=Vue%20JS) so it can be shared.

  Skills come from the profile; links are worked out in src/utils/skillGraph.js, which
  matches "Vue JS" to a project tagged "vue". Project tags that aren't in your skill list
  show up under "From projects".
-->
<template>
  <PageSection
    title="Skill graph"
    eyebrow="Explore"
    description="Every skill, and the work where I actually used it. Pick one to see the connections."
  >
    <div v-if="loading" class="grid gap-4 lg:grid-cols-[1fr_340px]" aria-busy="true">
      <SkeletonBlock class="h-72 w-full" />
      <SkeletonBlock class="h-72 w-full" />
    </div>

    <StateMessage
      v-else-if="failed"
      type="error"
      message="Couldn't load the skill graph."
      retry
      @retry="reload"
    />

    <StateMessage
      v-else-if="!graph.skills.length"
      message="No skills yet — add them in the admin."
    />

    <template v-else>
      <!-- Most connected skills -->
      <div v-if="highlights.length" class="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <span class="text-muted">Most used:</span>
        <button
          v-for="skill in highlights"
          :key="skill.slug"
          type="button"
          class="chip cursor-pointer"
          :class="{ 'ring-1 ring-accent': skill.slug === selected?.slug }"
          @click="select(skill)"
        >
          {{ skill.name }} · {{ skill.linkCount }}
        </button>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <!-- All skills, grouped -->
        <div>
          <div v-for="group in graph.groups" :key="group.title" class="mb-5">
            <h2
              class="m-0 mb-2 font-mono text-xs font-semibold tracking-widest text-accent uppercase"
            >
              {{ group.title }}
            </h2>
            <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
              <li v-for="skill in group.skills" :key="skill.slug">
                <button
                  type="button"
                  class="flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-1.5 text-sm transition-colors"
                  :class="
                    skill.slug === selected?.slug
                      ? 'border-accent bg-accent/12 text-heading'
                      : 'border-line bg-surface text-muted hover:border-accent/50 hover:text-heading'
                  "
                  :aria-pressed="skill.slug === selected?.slug"
                  @click="select(skill)"
                >
                  <img
                    v-if="skill.iconUrl"
                    :src="skill.iconUrl"
                    alt=""
                    class="size-5 object-contain"
                    loading="lazy"
                  />
                  {{ skill.name }}
                  <span
                    class="rounded-full px-1.5 text-xs"
                    :class="
                      skill.linkCount ? 'bg-accent/15 text-accent' : 'bg-muted/10 text-muted/70'
                    "
                    :title="`${skill.linkCount} linked item${skill.linkCount === 1 ? '' : 's'}`"
                  >
                    {{ skill.linkCount }}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Selected skill -->
        <aside v-if="selected" class="lg:sticky lg:top-4 lg:self-start" aria-live="polite">
          <SkillConstellation :skill="selected" :items="items" @select="open" />

          <h2 class="mt-4 mb-1 flex flex-wrap items-center gap-2 text-lg font-bold text-heading">
            <img
              v-if="selected.iconUrl"
              :src="selected.iconUrl"
              alt=""
              class="size-6 object-contain"
            />
            {{ selected.name }}
          </h2>
          <p class="m-0 mb-3 text-sm">
            {{ selected.group }} ·
            {{
              selected.linkCount
                ? `${selected.linkCount} linked item${selected.linkCount === 1 ? '' : 's'}`
                : 'not linked yet'
            }}
          </p>

          <template v-if="selected.projects.length">
            <h3 class="m-0 mb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
              Projects ({{ selected.projects.length }})
            </h3>
            <ul class="m-0 mb-4 grid list-none gap-1.5 p-0">
              <li v-for="project in selected.projects" :key="project.id">
                <RouterLink
                  :to="{ name: 'project-detail', params: { id: project.id } }"
                  class="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-heading no-underline hover:border-accent/50"
                >
                  <span aria-hidden="true">🚀</span>
                  <span class="min-w-0 flex-1 truncate">{{ project.title }}</span>
                  <span aria-hidden="true" class="text-accent">→</span>
                </RouterLink>
              </li>
            </ul>
          </template>

          <template v-if="selected.certifications.length">
            <h3 class="m-0 mb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
              Certifications ({{ selected.certifications.length }})
            </h3>
            <ul class="m-0 mb-4 grid list-none gap-1.5 p-0">
              <li v-for="certification in selected.certifications" :key="certification.id">
                <component
                  :is="certification.credential_url ? 'a' : 'div'"
                  :href="certification.credential_url || undefined"
                  :target="certification.credential_url ? '_blank' : undefined"
                  :rel="certification.credential_url ? 'noopener noreferrer' : undefined"
                  class="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-heading no-underline"
                  :class="certification.credential_url ? 'hover:border-sky-400/50' : ''"
                >
                  <span aria-hidden="true">🏅</span>
                  <span class="min-w-0 flex-1 truncate">{{ certification.title }}</span>
                  <span v-if="certification.credential_url" aria-hidden="true" class="text-sky-400"
                    >↗</span
                  >
                </component>
              </li>
            </ul>
          </template>

          <StateMessage
            v-if="!selected.linkCount"
            :message="`No projects or certifications mention ${selected.name} yet.`"
          />

          <RouterLink
            v-if="selected.projects.length"
            :to="{ name: 'projects', query: { tag: selected.name } }"
            class="text-sm font-semibold text-accent no-underline hover:underline"
          >
            Filter projects by {{ selected.name }} →
          </RouterLink>
        </aside>
      </div>
    </template>
  </PageSection>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import PageSection from '@/components/common/PageSection.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'
import SkillConstellation from '@/components/skills/SkillConstellation.vue'
import { useCertificationsStore, useProjectsStore } from '@/stores/content'
import { useProfileStore } from '@/stores/profile'
import { buildSkillGraph, findSkill, topSkills } from '@/utils/skillGraph'

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const projects = useProjectsStore()
const certifications = useCertificationsStore()

const loading = computed(
  () => profileStore.isLoading || projects.isLoading || certifications.isLoading,
)
const failed = computed(() => [projects.status, certifications.status].includes('error'))

const graph = computed(() =>
  buildSkillGraph({
    skillGroups: profileStore.profile.skillGroups,
    projects: projects.items,
    certifications: certifications.items,
  }),
)

const highlights = computed(() => topSkills(graph.value, 5))

// Selection comes from ?skill=… ; with none, pick the most connected skill
const selected = computed(
  () =>
    findSkill(graph.value, route.query.skill) ??
    highlights.value[0] ??
    graph.value.skills[0] ??
    null,
)

/** Nodes for the constellation drawing */
const items = computed(() => [
  ...(selected.value?.projects ?? []).map((project) => ({
    key: `p${project.id}`,
    label: project.title,
    type: 'project',
    to: { name: 'project-detail', params: { id: project.id } },
  })),
  ...(selected.value?.certifications ?? []).map((certification) => ({
    key: `c${certification.id}`,
    label: certification.title,
    type: 'certification',
    href: certification.credential_url,
  })),
])

function select(skill) {
  router.replace({ query: { skill: skill.name } })
}

/** Clicking a node in the drawing */
function open(item) {
  if (item.to) router.push(item.to)
  else if (item.href) window.open(item.href, '_blank', 'noopener')
}

function reload() {
  projects.load({ force: true })
  certifications.load({ force: true })
}

onMounted(() => {
  profileStore.load()
  projects.load()
  certifications.load()
})

// Keep the page title (and link previews) in step with the selected skill
useHead(() => ({
  title: selected.value ? `${selected.value.name} · Skills` : 'Skills',
  meta: [
    {
      name: 'description',
      content: selected.value
        ? `Projects and certifications where Jefferson S. Caragay used ${selected.value.name}.`
        : 'Skills and the work where they were used.',
    },
  ],
}))
</script>

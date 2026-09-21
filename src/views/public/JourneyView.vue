<!--
  JourneyView — /journey
  Education, work, certifications and projects merged into one timeline, newest first,
  grouped by year. Filter with the chips; the filter lives in the URL (/journey?type=work).
  The merging and date parsing happen in src/utils/journey.js.
-->
<template>
  <PageSection
    title="Journey"
    eyebrow="Everything, in order"
    description="Studies, work, certifications and projects on one timeline."
  >
    <div v-if="loading" class="grid gap-3" aria-busy="true">
      <SkeletonBlock v-for="n in 4" :key="n" class="h-20 w-full" />
    </div>

    <StateMessage
      v-else-if="failed"
      type="error"
      message="Couldn't load the journey."
      retry
      @retry="reload"
    />

    <StateMessage v-else-if="!journey.items.length" message="Nothing on the timeline yet." />

    <template v-else>
      <!-- Filters -->
      <div class="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter the timeline">
        <button
          v-for="filter in filters"
          :key="filter.key"
          type="button"
          class="cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.82rem] font-semibold transition-colors"
          :class="
            activeType === filter.key
              ? 'border-transparent bg-linear-to-r from-accent to-accent-2 text-ink'
              : 'border-line bg-transparent text-muted hover:border-accent hover:text-accent'
          "
          :aria-pressed="activeType === filter.key"
          @click="setType(filter.key)"
        >
          <span aria-hidden="true">{{ filter.icon }}</span> {{ filter.label }} ({{ filter.count }})
        </button>
      </div>

      <StateMessage v-if="!visibleYears.length" message="Nothing of that kind yet." />

      <!-- Timeline -->
      <div v-for="group in visibleYears" :key="group.year" class="mb-8">
        <h2 class="m-0 mb-3 font-mono text-sm font-bold tracking-widest text-accent">
          {{ group.year }}
        </h2>

        <ol class="relative m-0 list-none space-y-3 border-l-2 border-line p-0 pl-7 sm:pl-9">
          <li v-for="item in group.items" :key="item.id" class="relative">
            <span
              class="absolute top-3 -left-[calc(1.75rem+1px)] flex size-9 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-card text-base sm:-left-[calc(2.25rem+1px)]"
              :class="DOT_CLASS[item.kind]"
              aria-hidden="true"
            >
              {{ item.icon }}
            </span>

            <component
              :is="item.to ? 'RouterLink' : item.href ? 'a' : 'article'"
              :to="item.to"
              :href="item.href || undefined"
              :target="item.href ? '_blank' : undefined"
              :rel="item.href ? 'noopener noreferrer' : undefined"
              class="block rounded-xl border border-line bg-surface p-4 no-underline transition-colors"
              :class="item.to || item.href ? 'hover:border-accent/50' : ''"
            >
              <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 class="m-0 text-base font-bold text-heading">
                  {{ item.title }}
                  <span v-if="item.to || item.href" aria-hidden="true" class="text-accent">{{
                    item.href ? '↗' : '→'
                  }}</span>
                </h3>
                <span class="font-mono text-xs text-muted">{{ item.dateLabel }}</span>
              </div>
              <p v-if="item.subtitle" class="m-0 mt-0.5 text-sm font-medium text-accent">
                {{ item.subtitle }}
              </p>
              <p v-if="item.location" class="m-0 mt-1 text-xs">📍 {{ item.location }}</p>
              <p v-if="item.description" class="m-0 mt-2 line-clamp-3 text-sm leading-relaxed">
                {{ item.description }}
              </p>
            </component>
          </li>
        </ol>
      </div>

      <p class="m-0 text-sm">
        Looking for the PDF?
        <RouterLink
          :to="{ name: 'resume' }"
          class="font-semibold text-accent no-underline hover:underline"
        >
          Open my resume →
        </RouterLink>
      </p>
    </template>
  </PageSection>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageSection from '@/components/common/PageSection.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'
import { useCertificationsStore, useProjectsStore, useTimelineStore } from '@/stores/content'
import { buildJourney, JOURNEY_KINDS } from '@/utils/journey'

const DOT_CLASS = {
  education: 'border-sky-400/50',
  work: 'border-accent/50',
  certification: 'border-amber-400/50',
  project: 'border-violet-400/50',
}

const route = useRoute()
const router = useRouter()
const timeline = useTimelineStore()
const certifications = useCertificationsStore()
const projects = useProjectsStore()

const stores = [timeline, certifications, projects]
const loading = computed(() => stores.some((store) => store.isLoading))
const failed = computed(() => stores.some((store) => store.status === 'error'))

const journey = computed(() =>
  buildJourney({
    timeline: timeline.items,
    certifications: certifications.items,
    projects: projects.items,
  }),
)

// Active filter comes from ?type=… in the URL
const activeType = computed(() => {
  const type = route.query.type
  return JOURNEY_KINDS.some((kind) => kind.key === type) ? type : 'all'
})

const filters = computed(() => [
  { key: 'all', label: 'Everything', icon: '✦', count: journey.value.items.length },
  ...JOURNEY_KINDS.map((kind) => ({ ...kind, count: journey.value.counts[kind.key] })),
])

const visibleYears = computed(() =>
  journey.value.years
    .map((group) => ({
      ...group,
      items:
        activeType.value === 'all'
          ? group.items
          : group.items.filter((item) => item.kind === activeType.value),
    }))
    .filter((group) => group.items.length),
)

function setType(type) {
  router.replace({ query: type === 'all' ? {} : { type } })
}

function reload() {
  stores.forEach((store) => store.load({ force: true }))
}

onMounted(() => stores.forEach((store) => store.load()))
</script>

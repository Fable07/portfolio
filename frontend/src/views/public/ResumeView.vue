<!--
  ResumeView — /resume
  Resume PDF (embedded on large screens, open/download buttons everywhere) and the
  Education & Experience timeline.
-->
<template>
  <PageSection title="Resume" eyebrow="Experience" description="My resume and the path so far.">
    <template #actions>
      <template v-if="pdfUrl">
        <a :href="pdfUrl" target="_blank" rel="noopener" class="btn-primary">Open PDF ↗</a>
        <a :href="pdfUrl" download class="btn-secondary">Download</a>
      </template>
    </template>

    <!-- ── PDF ── -->
    <SkeletonBlock v-if="resume.isLoading" class="mb-10 h-[420px] w-full" />
    <div v-else-if="pdfUrl" class="mb-10">
      <!-- Mobile browsers render PDFs in iframes poorly, so the embed is desktop-only -->
      <iframe
        :src="pdfUrl"
        title="Resume PDF"
        class="hidden h-[78vh] max-h-[900px] w-full rounded-xl border border-line bg-white lg:block"
        loading="lazy"
      ></iframe>
      <a
        :href="pdfUrl"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 no-underline lg:hidden"
      >
        <span class="text-3xl" aria-hidden="true">📄</span>
        <span>
          <span class="block font-semibold text-heading">View resume (PDF)</span>
          <span class="block text-sm">Opens in your browser's PDF viewer</span>
        </span>
      </a>
    </div>

    <!-- ── Timeline ── -->
    <section aria-labelledby="timeline-heading">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 id="timeline-heading" class="m-0 text-xl font-bold text-heading">
          Education & experience
        </h2>
        <RouterLink
          :to="{ name: 'journey' }"
          class="text-sm font-semibold text-accent no-underline hover:underline"
        >
          See the full journey →
        </RouterLink>
      </div>

      <div v-if="timeline.isLoading" class="space-y-4" aria-busy="true">
        <SkeletonBlock v-for="n in 2" :key="n" class="h-28 w-full" />
      </div>

      <StateMessage
        v-else-if="timeline.status === 'error'"
        type="error"
        message="Couldn't load the timeline."
        retry
        @retry="timeline.load({ force: true })"
      />

      <StateMessage
        v-else-if="timeline.items.length === 0"
        message="No timeline entries added yet."
      />

      <ol v-else class="relative m-0 list-none space-y-5 border-l-2 border-line p-0 pl-7 sm:pl-9">
        <li v-for="entry in timeline.items" :key="entry.id" class="relative">
          <!-- Dot on the vertical line -->
          <span
            class="absolute top-3 -left-[calc(1.75rem+1px)] flex size-9 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-card text-base sm:-left-[calc(2.25rem+1px)]"
            :class="isEducation(entry) ? 'border-sky-400/50' : 'border-accent/50'"
            aria-hidden="true"
          >
            {{ isEducation(entry) ? '🎓' : '💼' }}
          </span>

          <article
            class="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40 sm:p-5"
          >
            <span
              class="inline-block rounded-full px-2 py-0.5 text-[0.7rem] font-bold tracking-wide uppercase"
              :class="
                isEducation(entry) ? 'bg-sky-400/12 text-sky-400' : 'bg-accent/12 text-accent'
              "
            >
              {{ isEducation(entry) ? 'Education' : 'Work experience' }}
            </span>
            <h3 class="m-0 mt-2 text-base font-bold text-heading">{{ entry.title }}</h3>
            <p class="m-0 mt-0.5 text-sm font-medium text-accent">{{ entry.institution }}</p>
            <p class="m-0 mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span>📅 {{ entry.start_date }} — {{ entry.end_date || 'Present' }}</span>
              <span v-if="entry.location">📍 {{ entry.location }}</span>
            </p>
            <p v-if="entry.description" class="m-0 mt-3 text-sm leading-relaxed">
              {{ entry.description }}
            </p>
          </article>
        </li>
      </ol>
    </section>
  </PageSection>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useResumeStore, useTimelineStore } from '@/stores/content'
import PageSection from '@/components/common/PageSection.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'

const resume = useResumeStore()
const timeline = useTimelineStore()

// If the API is unreachable, fall back to the bundled public/resume.pdf
const pdfUrl = computed(() => (resume.status === 'error' ? '/resume.pdf' : resume.pdfUrl))

const isEducation = (entry) => entry.type === 'education'

onMounted(() => {
  // Both requests run in parallel
  resume.load()
  timeline.load()
})
</script>

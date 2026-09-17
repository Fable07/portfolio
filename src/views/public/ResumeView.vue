<!--
  ResumeView — /resume
  Embedded resume PDF + download button, then the Education & Experience timeline.
-->
<template>
  <section id="resume" class="resume section">
    <div class="container">
      <h2>Resume</h2>

      <!-- ── PDF ── -->
      <LoadingDots v-if="resume.isLoading" />

      <div v-else-if="pdfUrl" class="resume-content">
        <iframe
          :src="pdfUrl"
          title="Resume PDF"
          class="h-[700px] w-full rounded-lg border-0"
        ></iframe>
        <a class="btn self-start" :href="pdfUrl" target="_blank" rel="noopener">
          Download Resume (PDF)
        </a>
      </div>

      <!-- ── Timeline ── -->
      <div class="timeline-section">
        <h3 class="timeline-heading">Education & Experience</h3>

        <LoadingDots v-if="timeline.isLoading" />

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

        <ol v-else class="timeline m-0 list-none p-0">
          <li
            v-for="entry in timeline.items"
            :key="entry.id"
            class="timeline__item"
            :class="isEducation(entry) ? 'timeline__item--edu' : 'timeline__item--work'"
          >
            <!-- Icon dot + connecting line -->
            <div class="timeline__dot-wrap" aria-hidden="true">
              <div class="timeline__dot">{{ isEducation(entry) ? '🎓' : '💼' }}</div>
              <div class="timeline__line"></div>
            </div>

            <div class="timeline__card">
              <span
                class="timeline__badge"
                :class="isEducation(entry) ? 'badge--edu' : 'badge--work'"
              >
                {{ isEducation(entry) ? 'Education' : 'Work Experience' }}
              </span>

              <h4 class="timeline__title">{{ entry.title }}</h4>
              <p class="timeline__institution">{{ entry.institution }}</p>

              <div class="timeline__meta">
                <span class="timeline__date">
                  📅 {{ entry.start_date }} — {{ entry.end_date || 'Present' }}
                </span>
                <span v-if="entry.location" class="timeline__location"
                  >📍 {{ entry.location }}</span
                >
              </div>

              <p v-if="entry.description" class="timeline__desc">{{ entry.description }}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useResumeStore, useTimelineStore } from '@/stores/content'
import LoadingDots from '@/components/common/LoadingDots.vue'
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

<style scoped>
/* ── PDF ── */
.resume-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

/* ── Timeline ── */
.timeline-section {
  margin-top: 2rem;
}
.timeline-heading {
  font-size: 1.1rem;
  color: var(--accent);
  margin: 0 0 1.5rem 0;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.timeline {
  display: flex;
  flex-direction: column;
}
.timeline__item {
  display: flex;
  gap: 16px;
  position: relative;
}

/* Dot and vertical line */
.timeline__dot-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.timeline__dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  z-index: 1;
  flex-shrink: 0;
  border: 2px solid rgba(124, 219, 182, 0.2);
  background: var(--card);
}
.timeline__item--edu .timeline__dot {
  border-color: rgba(99, 179, 237, 0.4);
  background: rgba(99, 179, 237, 0.08);
}
.timeline__item--work .timeline__dot {
  border-color: rgba(124, 219, 182, 0.4);
  background: rgba(124, 219, 182, 0.08);
}
.timeline__line {
  width: 2px;
  flex: 1;
  background: linear-gradient(to bottom, rgba(124, 219, 182, 0.2), transparent);
  margin-top: 4px;
  min-height: 24px;
}
.timeline__item:last-child .timeline__line {
  display: none;
}

/* Card */
.timeline__card {
  flex: 1;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.timeline__card:hover {
  border-color: rgba(124, 219, 182, 0.2);
  background: linear-gradient(135deg, rgba(124, 219, 182, 0.04), rgba(255, 255, 255, 0.02));
  transform: translateX(4px);
}
.timeline__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.badge--edu {
  background: rgba(99, 179, 237, 0.12);
  color: #63b3ed;
}
.badge--work {
  background: rgba(124, 219, 182, 0.12);
  color: var(--accent);
}
.timeline__title {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #e2f5ef;
  line-height: 1.3;
}
.timeline__institution {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  color: var(--accent);
  font-weight: 500;
}
.timeline__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}
.timeline__date,
.timeline__location {
  font-size: 0.78rem;
  color: var(--muted);
}
.timeline__desc {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.6;
}

@media (max-width: 640px) {
  .timeline__card {
    padding: 12px 14px;
  }
  .timeline__dot {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
}
</style>

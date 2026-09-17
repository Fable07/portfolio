<template>
  <section id="resume" class="resume section">
    <div class="container">
      <h2>Resume</h2>

      <!-- ── PDF Section ── -->
      <div v-if="pdfLoading" class="resume-loading">
        <span class="resume-loading__dot"></span>
        <span class="resume-loading__dot"></span>
        <span class="resume-loading__dot"></span>
      </div>

      <div v-else-if="pdfUrl" class="resume-content">
        <iframe :src="pdfUrl" width="900px" height="700px" frameborder="0"></iframe>
        <a class="btn" :href="pdfUrl" target="resume">Download Resume (PDF)</a>
      </div>

      <!-- ── Timeline Section ── -->
      <div class="timeline-section">
        <h3 class="timeline-heading">Education & Experience</h3>

        <!-- Loading state -->
        <div v-if="timelineLoading" class="resume-loading">
          <span class="resume-loading__dot"></span>
          <span class="resume-loading__dot"></span>
          <span class="resume-loading__dot"></span>
        </div>

        <!-- Empty state -->
        <p v-else-if="timeline.length === 0" class="resume-empty">No timeline entries added yet.</p>

        <!-- Timeline entries -->
        <div v-else class="timeline">
          <div
            v-for="entry in timeline"
            :key="entry.id"
            class="timeline__item"
            :class="entry.type === 'education' ? 'timeline__item--edu' : 'timeline__item--work'"
          >
            <!-- Left dot & line -->
            <div class="timeline__dot-wrap">
              <div class="timeline__dot">
                {{ entry.type === 'education' ? '🎓' : '💼' }}
              </div>
              <div class="timeline__line"></div>
            </div>

            <!-- Content card -->
            <div class="timeline__card">
              <!-- Type badge -->
              <span
                class="timeline__badge"
                :class="entry.type === 'education' ? 'badge--edu' : 'badge--work'"
              >
                {{ entry.type === 'education' ? 'Education' : 'Work Experience' }}
              </span>

              <!-- Title & institution -->
              <h4 class="timeline__title">{{ entry.title }}</h4>
              <p class="timeline__institution">{{ entry.institution }}</p>

              <!-- Period & location -->
              <div class="timeline__meta">
                <span class="timeline__date">
                  📅 {{ entry.start_date }} — {{ entry.end_date || 'Present' }}
                </span>
                <span v-if="entry.location" class="timeline__location">
                  📍 {{ entry.location }}
                </span>
              </div>

              <!-- Description -->
              <p v-if="entry.description" class="timeline__desc">
                {{ entry.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const pdfUrl = ref('')
const pdfLoading = ref(true)

const timeline = ref([])
const timelineLoading = ref(true)

onMounted(async () => {
  // Fetch PDF URL and timeline entries in parallel
  await Promise.all([fetchPdf(), fetchTimeline()])
})

// Fetch resume PDF URL from API
async function fetchPdf() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/resume')
    const data = await res.json()
    pdfUrl.value = data.pdf_url || ''
  } catch {
    pdfUrl.value = '/resume.pdf'
  } finally {
    pdfLoading.value = false
  }
}

// Fetch timeline entries from API
async function fetchTimeline() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/timeline')
    timeline.value = await res.json()
  } catch {
    timeline.value = []
  } finally {
    timelineLoading.value = false
  }
}
</script>

<style scoped>
/* ── Loading dots ── */
.resume-loading {
  display: flex;
  gap: 6px;
  padding: 1rem 0;
}

.resume-loading__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: resumeBounce 1.2s ease-in-out infinite both;
}

.resume-loading__dot:nth-child(2) {
  animation-delay: 0.16s;
}
.resume-loading__dot:nth-child(3) {
  animation-delay: 0.32s;
}

@keyframes resumeBounce {
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
.resume-empty {
  color: var(--muted);
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

/* ── PDF content ── */
.resume-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

/* ── Timeline section ── */
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

/* ── Timeline container ── */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Timeline item ── */
.timeline__item {
  display: flex;
  gap: 16px;
  position: relative;
}

/* ── Dot and vertical line ── */
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

/* ── Card ── */
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

/* ── Badge ── */
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

/* ── Title & institution ── */
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

/* ── Meta info ── */
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

/* ── Description ── */
.timeline__desc {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.6;
}

/* ── Responsive ── */
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

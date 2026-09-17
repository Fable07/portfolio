<!-- CertificationsPanel — public view -->
<template>
  <section id="cert" class="certifications-section section">
    <div class="container2">
      <h2>Certifications</h2>

      <!-- Loading state -->
      <div v-if="loading" class="cert-loading">
        <span class="cert-loading__dot"></span>
        <span class="cert-loading__dot"></span>
        <span class="cert-loading__dot"></span>
      </div>

      <!-- Empty state -->
      <p v-else-if="certifications.length === 0" class="cert-empty">No certifications added yet.</p>

      <!-- Certifications grid -->
      <ul v-else class="certifications__list">
        <li v-for="cert in certifications" :key="cert.id" class="certification cert-card">
          <!-- Badge / icon area -->
          <div class="cert-card__icon-wrap">
            <img
              v-if="cert.badge_url"
              :src="cert.badge_url"
              :alt="cert.issuer + ' badge'"
              class="cert-card__badge"
              @error="cert.badge_url = ''"
            />
            <span v-else class="cert-card__icon-fallback">🏅</span>
          </div>

          <div class="cert-card__body">
            <span class="cert-card__title">{{ cert.title }}</span>
            <span v-if="cert.issuer" class="cert-card__issuer">{{ cert.issuer }}</span>
            <span v-if="cert.date" class="cert-card__date">{{ cert.date }}</span>
            <a
              v-if="cert.credential_url"
              :href="cert.credential_url"
              target="_blank"
              rel="noopener noreferrer"
              class="cert-card__link"
            >
              View Credential ↗
            </a>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const certifications = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/certifications')
    certifications.value = await res.json()
  } catch {
    certifications.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ── Loading dots ── */
.cert-loading {
  display: flex;
  gap: 6px;
  padding: 1rem 0;
}
.cert-loading__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: certBounce 1.2s ease-in-out infinite both;
}
.cert-loading__dot:nth-child(2) {
  animation-delay: 0.16s;
}
.cert-loading__dot:nth-child(3) {
  animation-delay: 0.32s;
}
@keyframes certBounce {
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

/* ── Empty ── */
.cert-empty {
  color: var(--muted);
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

/* ── Card ── */
.cert-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(124, 219, 182, 0.04), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(124, 219, 182, 0.1);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  list-style: none;
}
.cert-card:hover {
  border-color: rgba(124, 219, 182, 0.3);
  background: linear-gradient(135deg, rgba(124, 219, 182, 0.08), rgba(255, 255, 255, 0.04));
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.cert-card__icon-wrap {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(124, 219, 182, 0.06);
  border-radius: 10px;
}
.cert-card__badge {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 6px;
}
.cert-card__icon-fallback {
  font-size: 1.3rem;
}

.cert-card__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.cert-card__title {
  color: #e2f5ef;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.3;
}
.cert-card__issuer {
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 500;
}
.cert-card__date {
  color: var(--muted);
  font-size: 0.78rem;
}
.cert-card__link {
  color: var(--accent);
  font-size: 0.78rem;
  text-decoration: none;
  margin-top: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.cert-card__link:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>

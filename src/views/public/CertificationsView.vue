<!-- CertificationsView — /certifications — certificate cards with badge, issuer and credential link -->
<template>
  <section id="certifications" class="certifications-section section">
    <div class="container2">
      <h2>Certifications</h2>

      <LoadingDots v-if="store.isLoading" />

      <StateMessage
        v-else-if="store.status === 'error'"
        type="error"
        message="Couldn't load certifications."
        retry
        @retry="store.load({ force: true })"
      />

      <StateMessage v-else-if="store.items.length === 0" message="No certifications added yet." />

      <ul v-else class="certifications__list">
        <li v-for="cert in store.items" :key="cert.id" class="certification cert-card">
          <!-- Badge image, or a medal emoji if there is none / it fails to load -->
          <div class="cert-card__icon-wrap">
            <img
              v-if="cert.badge_url && !brokenBadges.has(cert.id)"
              :src="cert.badge_url"
              :alt="`${cert.issuer || cert.title} badge`"
              class="cert-card__badge"
              @error="brokenBadges.add(cert.id)"
            />
            <span v-else class="cert-card__icon-fallback" aria-hidden="true">🏅</span>
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
import { onMounted, reactive } from 'vue'
import { useCertificationsStore } from '@/stores/content'
import LoadingDots from '@/components/common/LoadingDots.vue'
import StateMessage from '@/components/common/StateMessage.vue'

const store = useCertificationsStore()

// IDs whose badge image failed to load. Tracked here instead of blanking
// cert.badge_url, so the shared store data isn't modified by the view.
const brokenBadges = reactive(new Set())

onMounted(() => store.load())
</script>

<style scoped>
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

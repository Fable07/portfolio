<!-- CertificationsView — /certifications — certificate cards with badge, issuer and credential link -->
<template>
  <PageSection
    title="Certifications"
    eyebrow="Credentials"
    description="Courses and certificates I've earned."
  >
    <!-- Loading: skeleton cards keep the layout steady -->
    <ul
      v-if="store.isLoading"
      class="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
    >
      <li v-for="n in 6" :key="n" class="flex gap-3 rounded-xl border border-line p-4">
        <SkeletonBlock class="size-12 shrink-0" />
        <div class="flex-1 space-y-2">
          <SkeletonBlock class="h-4 w-4/5" />
          <SkeletonBlock class="h-3 w-1/2" />
        </div>
      </li>
    </ul>

    <StateMessage
      v-else-if="store.status === 'error'"
      type="error"
      message="Couldn't load certifications."
      retry
      @retry="store.load({ force: true })"
    />

    <StateMessage v-else-if="store.items.length === 0" message="No certifications added yet." />

    <ul v-else class="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="cert in store.items"
        :key="cert.id"
        class="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40"
      >
        <div
          class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent/8"
        >
          <img
            v-if="badgeUrl(cert) && !brokenBadges.has(cert.id)"
            :src="badgeUrl(cert)"
            :alt="cert.badge?.alt || `${cert.issuer || cert.title} badge`"
            class="size-10 object-contain"
            loading="lazy"
            @error="brokenBadges.add(cert.id)"
          />
          <span v-else class="text-2xl" aria-hidden="true">🏅</span>
        </div>

        <div class="min-w-0 flex-1">
          <h2 class="m-0 text-[0.95rem] leading-snug font-semibold text-heading">
            {{ cert.title }}
          </h2>
          <p v-if="cert.issuer" class="m-0 mt-0.5 text-sm text-accent">{{ cert.issuer }}</p>
          <p v-if="cert.date" class="m-0 mt-0.5 text-xs">{{ cert.date }}</p>
          <a
            v-if="cert.credential_url"
            :href="cert.credential_url"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2 inline-block text-xs font-semibold text-accent no-underline hover:underline"
          >
            View credential ↗
          </a>
        </div>
      </li>
    </ul>
  </PageSection>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { useCertificationsStore } from '@/stores/content'
import PageSection from '@/components/common/PageSection.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'

const store = useCertificationsStore()

// IDs whose badge image failed to load (tracked here so shared store data isn't modified)
const brokenBadges = reactive(new Set())

/** Uploaded badge first, then a pasted badge URL */
const badgeUrl = (cert) => cert.badge?.url || cert.badge_url

onMounted(() => store.load())
</script>

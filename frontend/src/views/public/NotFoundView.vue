<!-- NotFoundView — shown for any URL that doesn't match a page (catch-all route) -->
<template>
  <PageSection>
    <template #header>
      <div class="py-8 text-center">
        <p class="m-0 font-mono text-6xl font-bold text-accent">404</p>
        <h1 class="m-0 mt-2 text-2xl font-bold text-heading">Page not found</h1>
        <p class="mx-auto mt-3 mb-6 max-w-md">
          <code class="rounded bg-accent/10 px-1.5 py-0.5 text-accent">{{ route.path }}</code>
          doesn't exist. It may have moved.
        </p>
        <div class="flex flex-wrap justify-center gap-2.5">
          <RouterLink :to="{ name: 'profile' }" class="btn-primary">Back to Profile</RouterLink>
          <button type="button" class="btn-secondary" @click="palette.open()">
            Search <kbd class="kbd">{{ modKeyLabel }} K</kbd>
          </button>
        </div>
      </div>
    </template>
  </PageSection>
</template>

<script setup>
import { useRoute } from 'vue-router'
import PageSection from '@/components/common/PageSection.vue'
import { modKeyLabel, useCommandPalette } from '@/composables/useCommandPalette'

const route = useRoute()
const palette = useCommandPalette()
</script>

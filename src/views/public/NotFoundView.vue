<!-- NotFoundView — shown for any URL that doesn't match a page (catch-all route) -->
<template>
  <section class="section text-center">
    <p class="m-0 text-6xl font-bold text-accent">404</p>
    <h2 class="mt-2 mb-3 text-xl text-accent">Page not found</h2>
    <p class="mx-auto mb-6 max-w-md text-muted">
      The page <code class="rounded bg-accent/10 px-1.5 py-0.5 text-accent">{{ route.path }}</code>
      doesn't exist. It may have moved.
    </p>
    <RouterLink :to="{ name: 'profile' }" class="btn">Back to Profile</RouterLink>
  </section>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

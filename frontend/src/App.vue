<!--
  App — root component.
   • renders the matched route (the page frame comes from each route's layout)
   • sets the default page title/description from route meta (views can override with useHead)
   • mounts the command palette and global keyboard shortcuts for the public site
  See src/router/index.js for the route → layout → view mapping.
-->
<template>
  <RouterView />
  <CommandPalette v-if="!isAdmin" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import CommandPalette from '@/components/palette/CommandPalette.vue'
import { useGlobalShortcuts } from '@/composables/useCommandPalette'

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))

useGlobalShortcuts()

// canonical + og:url point at the clean URL (no ?query or #hash) so search engines index one copy
useHead(() => {
  const description = route.meta.description ?? 'Portfolio of Jefferson S. Caragay.'
  const url = window.location.origin + route.path
  return {
    title: route.meta.title,
    link: [{ rel: 'canonical', href: url }],
    meta: [
      { name: 'description', content: description },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      // keep the admin panel and 404 pages out of search results
      ...(isAdmin.value || route.name === 'not-found'
        ? [{ name: 'robots', content: 'noindex, nofollow' }]
        : []),
    ],
  }
})
</script>

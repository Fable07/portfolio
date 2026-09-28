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

useHead(() => ({
  title: route.meta.title,
  meta: [
    {
      name: 'description',
      content: route.meta.description ?? 'Portfolio of Jefferson S. Caragay.',
    },
  ],
}))
</script>

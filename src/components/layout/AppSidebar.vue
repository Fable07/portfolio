<!-- AppSidebar — sticky left navigation card, desktop only (hidden below the "nav" breakpoint) -->
<template>
  <aside
    class="sticky top-6 flex max-h-[calc(100vh-3rem)] w-[180px] shrink-0 flex-col overflow-y-auto rounded-[14px] border border-white/6 bg-card px-4 py-6 shadow-[0_6px_30px_rgba(2,6,12,0.5)] max-nav:hidden"
  >
    <RouterLink
      :to="{ name: 'profile' }"
      class="mb-6 border-b border-white/6 pb-4 text-base font-bold tracking-[0.5px] text-accent no-underline"
    >
      My Portfolio
    </RouterLink>

    <nav class="flex-1" aria-label="Main">
      <NavLinks />
    </nav>

    <div class="mt-4 flex flex-col items-start gap-2.5 border-t border-white/6 pt-4">
      <ThemeToggle />
      <VisitorBadge :count="visitorCount" />
    </div>
  </aside>
</template>

<script setup>
import NavLinks from './NavLinks.vue'
import ThemeToggle from './ThemeToggle.vue'
import VisitorBadge from './VisitorBadge.vue'

defineProps({
  visitorCount: { type: Number, default: 0 },
})
</script>

<!-- AppSidebar — sticky left navigation card, desktop only (hidden below the "nav" breakpoint) -->
<template>
  <aside
    class="sticky top-[15px] flex max-h-[calc(100dvh-30px)] w-[196px] shrink-0 flex-col overflow-y-auto rounded-2xl border border-line bg-card px-4 py-5 shadow-[0_6px_30px_rgba(2,6,12,0.35)] max-nav:hidden"
  >
    <RouterLink
      :to="{ name: 'profile' }"
      class="mb-4 border-b border-line pb-4 text-base font-bold tracking-[0.5px] text-accent no-underline"
    >
      My Portfolio
    </RouterLink>

    <SearchButton class="mb-4" />

    <nav class="flex-1" aria-label="Main">
      <NavLinks />
    </nav>

    <div class="mt-4 flex flex-col gap-3 border-t border-line pt-4">
      <RouterLink
        :to="{ name: 'terminal' }"
        class="flex items-center gap-2 rounded-xl border border-dashed border-accent/40 px-3 py-2 font-mono text-xs text-accent no-underline transition-colors hover:bg-accent/10"
        title="Terminal mode (press `)"
      >
        <span aria-hidden="true">&gt;_</span> terminal
        <kbd class="kbd ml-auto">`</kbd>
      </RouterLink>
      <div class="flex items-center justify-between gap-2">
        <ThemeToggle />
        <VisitorBadge :count="visitorCount" />
      </div>
    </div>
  </aside>
</template>

<script setup>
import NavLinks from './NavLinks.vue'
import SearchButton from './SearchButton.vue'
import ThemeToggle from './ThemeToggle.vue'
import VisitorBadge from './VisitorBadge.vue'

defineProps({
  visitorCount: { type: Number, default: 0 },
})
</script>

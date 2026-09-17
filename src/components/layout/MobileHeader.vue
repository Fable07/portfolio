<!--
  MobileHeader — fixed top bar with brand, theme toggle and a dropdown menu.
  Mobile only (hidden at and above the "nav" breakpoint, where AppSidebar shows).
  The menu closes on link click, route change, or the Escape key.
-->
<template>
  <header
    class="fixed inset-x-0 top-0 z-[100] flex items-center justify-between bg-page px-6 py-3 shadow-[0_2px_20px_rgba(0,0,0,0.3)] backdrop-blur-[10px] nav:hidden"
  >
    <RouterLink :to="{ name: 'profile' }" class="text-xl tracking-[0.6px] text-accent no-underline">
      My Portfolio
    </RouterLink>

    <div class="flex items-center gap-2">
      <ThemeToggle />
      <button
        type="button"
        class="inline-flex cursor-pointer rounded-lg border-0 bg-transparent p-2 text-muted transition-all duration-300 hover:bg-accent/10 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
        :aria-expanded="menuOpen"
        aria-controls="mobile-menu"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">{{ menuOpen ? 'Close' : 'Open' }} navigation menu</span>
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
          <path
            d="M0 1H20M0 6H20M0 11H20"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <!-- Dropdown menu -->
    <nav
      id="mobile-menu"
      aria-label="Main"
      class="absolute top-[60px] right-[18px] w-[180px] rounded-xl border border-accent/15 bg-card p-3 shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-all duration-200"
      :class="
        menuOpen
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-2 opacity-0'
      "
      :inert="!menuOpen"
    >
      <NavLinks @navigate="menuOpen = false" />
    </nav>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import NavLinks from './NavLinks.vue'
import ThemeToggle from './ThemeToggle.vue'

const menuOpen = ref(false)
const route = useRoute()

// Close the menu whenever the page changes (e.g. browser back button)
watch(
  () => route.fullPath,
  () => (menuOpen.value = false),
)

function onKeydown(event) {
  if (event.key === 'Escape') menuOpen.value = false
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

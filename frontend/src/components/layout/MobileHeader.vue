<!--
  MobileHeader — fixed top bar + slide-out navigation drawer. Mobile only
  (hidden at and above the "nav" breakpoint, where AppSidebar shows).

  Drawer behaviour (accessible dialog):
   • keyboard focus is trapped inside while open and returns to the menu button after
   • closes on Escape, backdrop click, link click or any route change
   • the page behind it can't scroll
-->
<template>
  <header
    class="fixed inset-x-0 top-0 z-[100] flex items-center justify-between gap-2 border-b border-line bg-page/90 px-4 py-2.5 backdrop-blur-md nav:hidden"
  >
    <RouterLink
      :to="{ name: 'profile' }"
      class="text-lg font-bold tracking-[0.5px] text-accent no-underline"
    >
      My Portfolio
    </RouterLink>

    <div class="flex items-center gap-1.5">
      <SearchButton compact />
      <ThemeToggle />
      <button
        ref="menuButton"
        type="button"
        class="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface text-heading"
        :aria-expanded="open"
        aria-controls="mobile-drawer"
        @click="open = true"
      >
        <span class="sr-only">Open navigation menu</span>
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
  </header>

  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-[2px] nav:hidden"
        @click="close"
      />
    </Transition>

    <!-- Drawer panel -->
    <Transition
      enter-active-class="transition-transform duration-250 ease-out"
      leave-active-class="transition-transform duration-200 ease-in"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="open"
        id="mobile-drawer"
        ref="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        class="fixed inset-y-0 right-0 z-[1001] flex w-[min(80vw,300px)] flex-col gap-4 border-l border-line bg-card p-5 shadow-2xl nav:hidden"
      >
        <div class="flex items-center justify-between">
          <span class="font-bold text-accent">Menu</span>
          <button
            type="button"
            class="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-surface text-heading"
            aria-label="Close navigation menu"
            @click="close"
          >
            ✕
          </button>
        </div>

        <nav aria-label="Main">
          <NavLinks @navigate="close" />
        </nav>

        <RouterLink
          :to="{ name: 'terminal' }"
          class="flex items-center gap-2 rounded-xl border border-dashed border-accent/40 px-3 py-2.5 font-mono text-sm text-accent no-underline"
          @click="close"
        >
          <span aria-hidden="true">&gt;_</span> terminal mode
        </RouterLink>

        <div class="mt-auto">
          <VisitorBadge :count="visitorCount" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import NavLinks from './NavLinks.vue'
import SearchButton from './SearchButton.vue'
import ThemeToggle from './ThemeToggle.vue'
import VisitorBadge from './VisitorBadge.vue'

defineProps({
  visitorCount: { type: Number, default: 0 },
})

const open = ref(false)
const drawer = ref(null)
const menuButton = ref(null)
const route = useRoute()

const { activate, deactivate } = useFocusTrap(drawer, { immediate: false, allowOutsideClick: true })
const scrollLock = useScrollLock(document.body)

watch(open, async (isOpen) => {
  scrollLock.value = isOpen
  if (isOpen) {
    await nextTick()
    activate()
  } else {
    deactivate()
    menuButton.value?.focus() // return focus to where the user was
  }
})

function close() {
  open.value = false
}

// Close on page change (e.g. browser back button) and on Escape
watch(() => route.fullPath, close)
onKeyStroke('Escape', () => open.value && close())
</script>

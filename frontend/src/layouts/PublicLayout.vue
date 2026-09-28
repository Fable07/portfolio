<!--
  PublicLayout — the frame around every visitor-facing page:
  scroll bar + sidebar (desktop) / top bar + drawer (mobile) + page content + footer.

  The current page renders inside <RouterView>; switching pages plays a short fade.
  Routes using this layout are its children in src/router/index.js.
-->
<template>
  <div>
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-[#022]"
    >
      Skip to content
    </a>

    <ScrollProgressBar :progress="progress" />
    <BackToTopButton :visible="showBackToTop" @click="scrollToTop" />

    <div class="flex w-full items-start gap-5 max-nav:block">
      <AppSidebar :visitor-count="visitorCount" />
      <MobileHeader :visitor-count="visitorCount" />

      <div class="min-w-0 flex-1 max-nav:pt-16">
        <main id="main" class="mx-auto max-w-[1200px] focus:outline-none" tabindex="-1">
          <RouterView v-slot="{ Component, route }">
            <!-- Page transition: fade/slide in, fade out (disabled for reduced-motion users in main.css) -->
            <Transition
              mode="out-in"
              enter-active-class="transition-all duration-300 ease-out"
              leave-active-class="transition-all duration-150 ease-in"
              enter-from-class="translate-y-3 opacity-0"
              leave-to-class="opacity-0"
              @after-enter="updateScroll"
            >
              <component :is="Component" :key="route.path" />
            </Transition>
          </RouterView>
        </main>

        <footer
          class="mt-6 mb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-sm text-muted"
        >
          <p class="m-0">© {{ currentYear }} Jefferson S. Caragay</p>
          <p class="m-0 hidden sm:block">
            Press <kbd class="kbd">{{ modKeyLabel }} K</kbd> to search or
            <kbd class="kbd">`</kbd> for terminal mode
          </p>
        </footer>
      </div>
    </div>

    <AppToast />
  </div>
</template>

<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import MobileHeader from '@/components/layout/MobileHeader.vue'
import ScrollProgressBar from '@/components/layout/ScrollProgressBar.vue'
import BackToTopButton from '@/components/layout/BackToTopButton.vue'
import AppToast from '@/components/common/AppToast.vue'
import { useScrollProgress } from '@/composables/useScrollProgress'
import { useVisitorCount } from '@/composables/useVisitorCount'
import { modKeyLabel } from '@/composables/useCommandPalette'

const { progress, showBackToTop, scrollToTop, update: updateScroll } = useScrollProgress()
const { count: visitorCount } = useVisitorCount()
const currentYear = new Date().getFullYear()
</script>

<!--
  PublicLayout — the frame around every visitor-facing page:
  scroll bar + sidebar (desktop) / top bar (mobile) + page content + footer.

  The current page renders inside <RouterView>; switching pages plays the
  "section fade" transition. Routes using this layout are children of it in
  src/router/index.js.
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

    <div class="flex w-full items-start gap-6 max-nav:block">
      <AppSidebar :visitor-count="visitorCount" />
      <MobileHeader />

      <div class="min-w-0 flex-1 max-nav:pt-16">
        <main id="main" class="mx-auto max-w-[1200px]" tabindex="-1">
          <RouterView v-slot="{ Component, route }">
            <!-- Page transition: fade/slide up in, fade/slide up out -->
            <Transition
              mode="out-in"
              enter-active-class="transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]"
              leave-active-class="transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
              enter-from-class="translate-y-4 opacity-0"
              leave-to-class="-translate-y-2 opacity-0"
              @after-enter="updateScroll"
            >
              <component :is="Component" :key="route.path" />
            </Transition>
          </RouterView>
        </main>

        <footer class="mt-[26px] text-center text-muted">
          <p>© {{ currentYear }} Jefferson S. Caragay</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import MobileHeader from '@/components/layout/MobileHeader.vue'
import ScrollProgressBar from '@/components/layout/ScrollProgressBar.vue'
import BackToTopButton from '@/components/layout/BackToTopButton.vue'
import { useScrollProgress } from '@/composables/useScrollProgress'
import { useVisitorCount } from '@/composables/useVisitorCount'

const { progress, showBackToTop, scrollToTop, update: updateScroll } = useScrollProgress()
const { count: visitorCount } = useVisitorCount()
const currentYear = new Date().getFullYear()
</script>

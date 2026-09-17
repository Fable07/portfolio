<!-- ScrollProgressBar — thin accent bar at the very top that grows as you scroll -->
<template>
  <div
    class="fixed top-0 left-0 z-[9999] h-[3px] w-full origin-left rounded-r-sm bg-linear-to-r from-accent to-accent-2 transition-transform duration-100 ease-linear"
    :style="{ transform: `scaleX(${progress / 100})` }"
    aria-hidden="true"
  ></div>
</template>

<script setup>
// The inline :style is intentional — the bar length changes on every scroll event,
// which a static Tailwind class can't express. scaleX is used instead of width
// because transforms animate without triggering page layout (smoother).
defineProps({
  /** 0–100, percent of the page scrolled */
  progress: { type: Number, default: 0 },
})
</script>

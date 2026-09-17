<!-- LoadingDots — three bouncing dots shown while a page's data is loading -->
<template>
  <div class="flex gap-1.5 py-4" role="status">
    <span
      v-for="delay in ['0s', '0.16s', '0.32s']"
      :key="delay"
      class="loading-dot size-2 rounded-full bg-accent"
      :style="{ animationDelay: delay }"
    ></span>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps({
  /** Screen-reader text */
  label: { type: String, default: 'Loading…' },
})
</script>

<style scoped>
/* Tailwind has no built-in "scale bounce" animation, so it is defined here */
.loading-dot {
  animation: dot-bounce 1.2s ease-in-out infinite both;
}
@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

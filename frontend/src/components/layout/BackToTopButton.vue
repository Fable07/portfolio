<!-- BackToTopButton — floating "↑" button, fades in after scrolling down -->
<template>
  <Transition
    enter-active-class="transition-all duration-300"
    leave-active-class="transition-all duration-300"
    enter-from-class="translate-y-3 opacity-0"
    leave-to-class="translate-y-3 opacity-0"
  >
    <button
      v-if="visible"
      type="button"
      class="fixed right-8 bottom-8 z-[999] size-[42px] cursor-pointer rounded-xl border-0 bg-linear-135 from-accent to-accent-2 text-lg font-bold text-ink shadow-[0_6px_20px_rgba(124,219,182,0.35)] transition-all duration-250 hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(124,219,182,0.45)]"
      aria-label="Back to top"
      @click="$emit('click')"
    >
      ↑
    </button>
  </Transition>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
})
defineEmits(['click'])
</script>

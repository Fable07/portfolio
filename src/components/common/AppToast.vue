<!--
  AppToast — small message at the bottom of the screen ("✔ Email copied").
  Shows whatever is in the toast store: useToastStore().success('…').
-->
<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-6 z-[1100] flex justify-center px-4"
    aria-live="polite"
  >
    <Transition
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-200"
      enter-from-class="translate-y-2 opacity-0"
      leave-to-class="translate-y-2 opacity-0"
    >
      <p
        v-if="toast.current"
        :key="toast.current.message"
        class="pointer-events-auto m-0 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-lg backdrop-blur"
        :class="
          toast.current.type === 'error'
            ? 'border-red-400/30 bg-red-950/80 text-red-200'
            : 'border-accent/30 bg-card/90 text-accent'
        "
        role="status"
      >
        {{ toast.current.message }}
      </p>
    </Transition>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<!--
  AppToast — small message at the bottom of the screen ("✔ Email copied", "Project deleted · Undo").
  Shows whatever is in the toast store: useToastStore().success('…') / withAction('…', { label, run }).
  Used by both the public layout and the admin layout.
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
      <div
        v-if="toast.current"
        :key="toast.current.id"
        class="pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-lg backdrop-blur"
        :class="
          toast.current.type === 'error'
            ? 'border-red-400/30 bg-red-950/85 text-red-200'
            : 'border-accent/30 bg-card/95 text-accent'
        "
        role="status"
      >
        <span>{{ toast.current.message }}</span>
        <button
          v-if="toast.current.action"
          type="button"
          class="cursor-pointer rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 font-bold text-accent hover:bg-accent/20"
          @click="toast.runAction()"
        >
          {{ toast.current.action.label }}
        </button>
        <button
          type="button"
          class="cursor-pointer border-0 bg-transparent p-0 text-current opacity-60 hover:opacity-100"
          aria-label="Dismiss notification"
          @click="toast.dismiss()"
        >
          ✕
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

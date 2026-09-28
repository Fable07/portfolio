<!--
  StateMessage — small text for "nothing here yet" (empty) or "failed to load" (error) states.
  Pass `retry` to show a "Try again" button (emits "retry").

  <StateMessage message="No projects added yet." />
  <StateMessage type="error" message="Couldn't load projects." retry @retry="store.load({ force: true })" />
-->
<template>
  <div
    class="flex flex-wrap items-center gap-3 py-2 text-[0.9rem]"
    :class="type === 'error' ? 'text-red-400' : 'text-muted'"
    :role="type === 'error' ? 'alert' : undefined"
  >
    <p class="m-0">{{ message }}</p>
    <button
      v-if="retry"
      type="button"
      class="cursor-pointer rounded-full border border-accent/40 bg-transparent px-3 py-1 text-[0.8rem] font-semibold text-accent transition-colors hover:bg-accent/10"
      @click="$emit('retry')"
    >
      Try again
    </button>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, required: true },
  type: { type: String, default: 'empty' }, // 'empty' | 'error'
  retry: { type: Boolean, default: false },
})
defineEmits(['retry'])
</script>

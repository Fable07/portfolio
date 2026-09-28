<!--
  ToggleSwitch — accessible on/off switch (role="switch").
  <ToggleSwitch v-model="form.is_published" label="Published" />
  Use `hideLabel` for compact rows (the label stays available to screen readers).
-->
<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-label="hideLabel ? label : undefined"
    :disabled="disabled"
    class="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-sm text-muted disabled:cursor-not-allowed disabled:opacity-50"
    @click="model = !model"
  >
    <span
      class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
      :class="model ? 'bg-accent' : 'bg-white/15'"
      aria-hidden="true"
    >
      <span
        class="inline-block size-4 rounded-full bg-white shadow transition-transform"
        :class="model ? 'translate-x-[18px]' : 'translate-x-0.5'"
      ></span>
    </span>
    <span :class="{ 'sr-only': hideLabel }">{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  hideLabel: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const model = defineModel({ type: Boolean, default: false })
</script>

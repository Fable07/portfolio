<!--
  SearchButton — opens the command palette. Shows the keyboard shortcut (Ctrl K / ⌘ K).
  compact: icon-only version for the mobile header.
-->
<template>
  <button
    type="button"
    class="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface text-muted transition-colors hover:border-accent/60 hover:text-heading"
    :class="compact ? 'size-10 justify-center' : 'w-full px-3 py-2 text-left text-sm'"
    :aria-label="compact ? 'Search (command palette)' : undefined"
    aria-haspopup="dialog"
    @click="palette.open()"
  >
    <span aria-hidden="true">⌕</span>
    <template v-if="!compact">
      <span class="flex-1">Search…</span>
      <kbd class="kbd">{{ modKeyLabel }} K</kbd>
    </template>
  </button>
</template>

<script setup>
import { modKeyLabel, useCommandPalette } from '@/composables/useCommandPalette'

defineProps({
  compact: { type: Boolean, default: false },
})

const palette = useCommandPalette()
</script>

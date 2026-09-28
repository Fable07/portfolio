<!--
  TerminalLine — renders one line of terminal output.
  A line is an array of parts { text, tone?, href?, to? } (see src/terminal/output.js):
    href → external link (new tab), to → in-app RouterLink, tone → colour/weight.
-->
<template>
  <div class="min-h-[1.5em] break-words whitespace-pre-wrap">
    <template v-for="(part, index) in parts" :key="index">
      <a
        v-if="part.href"
        :href="part.href"
        target="_blank"
        rel="noopener noreferrer"
        class="underline decoration-dotted underline-offset-4 hover:decoration-solid"
        :class="TONES[part.tone] ?? TONES.accent"
        >{{ part.text }}</a
      ><RouterLink
        v-else-if="part.to"
        :to="part.to"
        class="underline decoration-dotted underline-offset-4 hover:decoration-solid"
        :class="TONES[part.tone] ?? TONES.accent"
        >{{ part.text }}</RouterLink
      ><span v-else :class="TONES[part.tone]">{{ part.text }}</span>
    </template>
  </div>
</template>

<script setup>
defineProps({
  parts: { type: Array, required: true },
})

// Terminal colour palette (fixed — terminal mode is always dark)
const TONES = {
  accent: 'text-[#7cdbb6]',
  muted: 'text-[#7d8795]',
  error: 'text-[#f87171]',
  success: 'text-[#86efac]',
  warn: 'text-[#fbbf24]',
  bold: 'font-bold text-[#f1f5f9]',
}
</script>

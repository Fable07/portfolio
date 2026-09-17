<!-- VisitorBadge — "👁️ 1,234" profile-views pill; hidden until the count loads -->
<template>
  <div
    v-if="count > 0"
    class="flex items-center gap-[5px] rounded-full border border-accent/15 bg-accent/7 px-2.5 py-[5px] text-[0.78rem] font-semibold tracking-[0.3px] whitespace-nowrap text-muted"
    title="Profile views"
  >
    <span aria-hidden="true">👁️</span>
    <span class="sr-only">Profile views:</span>
    {{ count.toLocaleString() }}
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 0 },
})
</script>

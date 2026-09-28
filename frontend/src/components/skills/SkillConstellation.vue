<!--
  SkillConstellation — the selected skill in the middle, connected to the projects and
  certifications that use it, arranged in a ring.

  <SkillConstellation :skill="skill" :items="items" @select="open" />

  The drawing is decorative (aria-hidden) and clickable with the mouse; the same
  information is listed as real links below it on the page, which is what keyboard and
  screen-reader users get. That avoids duplicate tab stops.
-->
<template>
  <div class="rounded-2xl border border-line bg-surface p-2">
    <svg :viewBox="`0 0 ${W} ${H}`" class="h-auto w-full" aria-hidden="true">
      <!-- Connection lines -->
      <line
        v-for="node in nodes"
        :key="`line-${node.key}`"
        :x1="CX"
        :y1="CY"
        :x2="node.x"
        :y2="node.y"
        :stroke="node.type === 'project' ? 'var(--accent)' : '#63b3ed'"
        stroke-width="1.5"
        stroke-opacity="0.35"
        stroke-dasharray="4 4"
      />

      <!-- Centre: the skill -->
      <circle
        :cx="CX"
        :cy="CY"
        :r="46"
        fill="var(--card)"
        stroke="var(--accent)"
        stroke-width="2"
      />
      <image
        v-if="skill.iconUrl"
        :href="skill.iconUrl"
        :x="CX - 18"
        :y="CY - 26"
        width="36"
        height="36"
      />
      <text
        :x="CX"
        :y="CY + (skill.iconUrl ? 26 : 6)"
        text-anchor="middle"
        class="fill-[var(--heading)] text-[12px] font-bold"
      >
        {{ short(skill.name, 14) }}
      </text>

      <!-- Ring: connected items -->
      <g
        v-for="node in nodes"
        :key="node.key"
        class="cursor-pointer"
        @click="$emit('select', node.item)"
      >
        <circle
          :cx="node.x"
          :cy="node.y"
          r="26"
          fill="var(--card)"
          :stroke="node.type === 'project' ? 'var(--accent)' : '#63b3ed'"
          stroke-width="1.5"
        />
        <text :x="node.x" :y="node.y + 6" text-anchor="middle" class="text-[16px]">
          {{ node.type === 'project' ? '🚀' : '🏅' }}
        </text>
        <text
          :x="node.x"
          :y="node.y + 42"
          text-anchor="middle"
          class="fill-[var(--muted)] text-[10px]"
        >
          {{ short(node.label, 18) }}
        </text>
      </g>

      <text
        v-if="!nodes.length"
        :x="CX"
        :y="CY + 92"
        text-anchor="middle"
        class="fill-[var(--muted)] text-[11px]"
      >
        Not used in any project yet
      </text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** { name, iconUrl } */
  skill: { type: Object, required: true },
  /** [{ key, label, type: 'project' | 'certification', … }] */
  items: { type: Array, default: () => [] },
})
defineEmits(['select'])

const W = 420
const H = 340
const CX = W / 2
const CY = H / 2 - 10

const short = (value, max) => (value.length > max ? `${value.slice(0, max - 1)}…` : value)

// Evenly spaced around a circle. With one or two items the ring starts at the right
// (3 o'clock) so they sit beside the skill instead of stacking above it.
const nodes = computed(() => {
  const count = props.items.length
  const radius = count > 6 ? 130 : 118
  const start = count <= 2 ? 0 : -Math.PI / 2
  return props.items.map((item, index) => {
    const angle = start + (index * 2 * Math.PI) / Math.max(count, 1)
    return {
      key: item.key,
      item,
      label: item.label,
      type: item.type,
      x: CX + radius * Math.cos(angle),
      y: CY + radius * Math.sin(angle) * 0.78, // slightly flattened so labels fit
    }
  })
})
</script>

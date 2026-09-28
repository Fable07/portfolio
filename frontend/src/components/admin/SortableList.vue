<!--
  SortableList — a list you can reorder by dragging the ⠿ handle (mouse or touch),
  or with the ↑ / ↓ buttons (keyboard-friendly).

  <SortableList :items="store.items" :disabled="!!search" @reorder="(ids) => store.reorder(ids)">
    <template #default="{ item, index }"> …row content… </template>
  </SortableList>

  Emits `reorder` with the full list of ids in the new order; the parent saves it.
  `disabled` hides the handles (e.g. while a search filter shows only some items).
-->
<template>
  <VueDraggable
    v-model="local"
    tag="ul"
    handle="[data-drag-handle]"
    :animation="160"
    :disabled="disabled"
    ghost-class="opacity-40"
    class="m-0 grid list-none gap-2 p-0"
    @end="emitOrder"
  >
    <li
      v-for="(item, index) in local"
      :key="item.id"
      class="flex items-center gap-2 rounded-xl border border-line bg-surface p-2.5 transition-colors hover:border-accent/30 sm:gap-3 sm:p-3"
    >
      <div v-if="!disabled" class="flex shrink-0 flex-col items-center">
        <button
          type="button"
          class="btn-ghost p-0.5! text-xs!"
          :disabled="index === 0"
          :aria-label="`Move ${labelOf(item)} up`"
          @click="move(index, -1)"
        >
          ▲
        </button>
        <span
          data-drag-handle
          class="cursor-grab px-1 text-lg leading-none text-muted select-none active:cursor-grabbing"
          title="Drag to reorder"
          aria-hidden="true"
          >⠿</span
        >
        <button
          type="button"
          class="btn-ghost p-0.5! text-xs!"
          :disabled="index === local.length - 1"
          :aria-label="`Move ${labelOf(item)} down`"
          @click="move(index, 1)"
        >
          ▼
        </button>
      </div>
      <div class="min-w-0 flex-1">
        <slot :item="item" :index="index" />
      </div>
    </li>
  </VueDraggable>
</template>

<script setup>
import { ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

const props = defineProps({
  items: { type: Array, required: true },
  disabled: { type: Boolean, default: false },
  /** Text used in the move buttons' screen-reader labels */
  labelOf: { type: Function, default: (item) => item.title ?? item.name ?? `item ${item.id}` },
})
const emit = defineEmits(['reorder'])

// Local copy so dragging feels instant; re-synced whenever the store list changes.
// `.slice()` returns a new array every time, so in-place changes (an item deleted,
// added or reordered by the store) also trigger this watcher.
const local = ref(props.items.slice())
watch(
  () => props.items.slice(),
  (items) => (local.value = items),
)

function emitOrder() {
  const ids = local.value.map((item) => item.id)
  if (ids.join() !== props.items.map((item) => item.id).join()) emit('reorder', ids)
}

function move(index, direction) {
  const next = [...local.value]
  const [item] = next.splice(index, 1)
  next.splice(index + direction, 0, item)
  local.value = next
  emitOrder()
}
</script>

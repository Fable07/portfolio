<!--
  StringListEditor — edit a list of short texts (roles, about paragraphs…):
  add, remove and move items up/down.

  <StringListEditor v-model="form.roles" item-label="Role" placeholder="e.g. Fullstack Developer" :max="6" />
  <StringListEditor v-model="form.about" item-label="Paragraph" multiline />
-->
<template>
  <div class="grid gap-2">
    <div v-for="(value, index) in model" :key="index" class="flex items-start gap-2">
      <span class="mt-2.5 w-5 shrink-0 text-right font-mono text-xs text-muted/70">{{
        index + 1
      }}</span>
      <textarea
        v-if="multiline"
        :value="value"
        rows="3"
        class="form-input min-w-0 flex-1 resize-y"
        :placeholder="placeholder"
        :aria-label="`${itemLabel} ${index + 1}`"
        :aria-invalid="!!errorFor(index)"
        @input="update(index, $event.target.value)"
      ></textarea>
      <input
        v-else
        :value="value"
        class="form-input min-w-0 flex-1"
        :placeholder="placeholder"
        :aria-label="`${itemLabel} ${index + 1}`"
        :aria-invalid="!!errorFor(index)"
        @input="update(index, $event.target.value)"
      />
      <div class="flex shrink-0 gap-0.5">
        <button
          type="button"
          class="btn-ghost px-2!"
          :disabled="index === 0"
          :aria-label="`Move ${itemLabel} ${index + 1} up`"
          @click="move(index, -1)"
        >
          ↑
        </button>
        <button
          type="button"
          class="btn-ghost px-2!"
          :disabled="index === model.length - 1"
          :aria-label="`Move ${itemLabel} ${index + 1} down`"
          @click="move(index, 1)"
        >
          ↓
        </button>
        <button
          type="button"
          class="btn-ghost px-2! hover:text-red-400!"
          :aria-label="`Remove ${itemLabel} ${index + 1}`"
          @click="remove(index)"
        >
          ✕
        </button>
      </div>
    </div>
    <p
      v-for="(message, index) in listErrors"
      :key="`e${index}`"
      class="m-0 text-xs text-red-400"
      role="alert"
    >
      {{ message }}
    </p>
    <button
      v-if="model.length < max"
      type="button"
      class="btn-ghost justify-self-start border border-dashed! border-line!"
      @click="model = [...model, '']"
    >
      ＋ Add {{ itemLabel.toLowerCase() }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  itemLabel: { type: String, default: 'Item' },
  placeholder: { type: String, default: '' },
  multiline: { type: Boolean, default: false },
  max: { type: Number, default: 20 },
  /** Field errors keyed by index, e.g. { 0: 'The roles.0 field is required.' } */
  errors: { type: Object, default: () => ({}) },
})
const model = defineModel({ type: Array, default: () => [] })

const errorFor = (index) => props.errors[index]
const listErrors = computed(() =>
  Object.entries(props.errors).map(([index, message]) => `#${Number(index) + 1}: ${message}`),
)

function update(index, value) {
  model.value = model.value.map((item, i) => (i === index ? value : item))
}
function remove(index) {
  model.value = model.value.filter((_, i) => i !== index)
}
function move(index, direction) {
  const next = [...model.value]
  const [item] = next.splice(index, 1)
  next.splice(index + direction, 0, item)
  model.value = next
}
</script>

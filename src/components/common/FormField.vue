<!--
  FormField — label + control + hint + error message, wired for accessibility.

  <FormField label="Title" required :error="fieldError('title')" v-slot="{ id, describedBy, invalid }">
    <input :id="id" v-model="form.title" class="form-input" :aria-describedby="describedBy" :aria-invalid="invalid" />
  </FormField>

  The slot receives the generated `id` (links label → input), `describedBy` (links the
  hint/error text so screen readers read it) and `invalid` (for aria-invalid).
-->
<template>
  <div class="grid gap-1.5">
    <label v-if="label" :for="id" class="text-xs font-semibold tracking-wide text-muted uppercase">
      {{ label }}
      <span v-if="required" class="text-red-400" aria-hidden="true">*</span>
      <span v-if="optional" class="font-normal tracking-normal normal-case opacity-70"
        >(optional)</span
      >
    </label>

    <slot :id="id" :described-by="describedBy" :invalid="!!error" />

    <p v-if="error" :id="`${id}-error`" class="m-0 text-xs font-medium text-red-400" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="m-0 text-xs text-muted/80">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  optional: { type: Boolean, default: false },
})

const id = useId()
const describedBy = computed(() =>
  props.error ? `${id}-error` : props.hint ? `${id}-hint` : undefined,
)
</script>

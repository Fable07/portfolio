<!--
  CaseStudyEditor — the optional write-up shown on a project's page.

  <CaseStudyEditor v-model="editor.form.case_study" :field-error="fieldError" />

  Everything is optional: fill in only what you want to show. Three standard questions
  (problem / approach / outcome), a list of highlights, and free "sections" for anything
  else (Architecture, What I'd do next…). Text is shown as plain text with line breaks
  preserved — no HTML or Markdown, so nothing can break the page.
-->
<template>
  <details class="rounded-xl border border-line bg-surface" :open="hasContent">
    <summary
      class="cursor-pointer list-none px-4 py-3 text-xs font-semibold tracking-wide text-muted uppercase"
    >
      Case study
      <span
        v-if="filledCount"
        class="ml-1 rounded-full bg-accent/15 px-1.5 text-accent normal-case"
      >
        {{ filledCount }} filled
      </span>
      <span v-else class="ml-1 normal-case opacity-70">(optional)</span>
    </summary>

    <div class="grid gap-4 border-t border-line p-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="Your role"
          optional
          :error="fieldError('case_study.role')"
        >
          <input
            :id="id"
            v-model="model.role"
            class="form-input"
            placeholder="e.g. Full-stack developer"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>
        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="When"
          optional
          :error="fieldError('case_study.period')"
        >
          <input
            :id="id"
            v-model="model.period"
            class="form-input"
            placeholder="e.g. Jan – Mar 2026"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>
      </div>

      <FormField
        v-for="question in QUESTIONS"
        :key="question.field"
        v-slot="{ id, describedBy, invalid }"
        :label="question.label"
        optional
        :hint="question.hint"
        :error="fieldError(`case_study.${question.field}`)"
      >
        <textarea
          :id="id"
          v-model="model[question.field]"
          rows="4"
          maxlength="5000"
          class="form-input resize-y"
          :placeholder="question.placeholder"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
        ></textarea>
      </FormField>

      <div>
        <p class="m-0 mb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
          Highlights <span class="normal-case opacity-70">(optional)</span>
        </p>
        <p class="m-0 mb-2 text-xs">
          Short wins shown as a list near the top, e.g. “Cut load time by 60%”.
        </p>
        <StringListEditor
          v-model="highlights"
          item-label="Highlight"
          placeholder="e.g. Reduced page load from 4s to 1.2s"
          :max="10"
        />
      </div>

      <div>
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="m-0 text-xs font-semibold tracking-wide text-muted uppercase">
              Extra sections
            </p>
            <p class="m-0 text-xs">For anything else: Architecture, Challenges, What's next…</p>
          </div>
          <button type="button" class="btn-secondary !px-3 !py-1.5 !text-xs" @click="addSection">
            ＋ Add section
          </button>
        </div>

        <VueDraggable
          v-model="sections"
          tag="ul"
          handle="[data-drag-handle]"
          :animation="150"
          class="m-0 grid list-none gap-2 p-0"
        >
          <li
            v-for="(section, index) in sections"
            :key="index"
            class="rounded-lg border border-line bg-card p-2"
          >
            <div class="flex items-center gap-2">
              <span
                data-drag-handle
                class="cursor-grab px-1 text-muted select-none"
                title="Drag to reorder"
                aria-hidden="true"
                >⠿</span
              >
              <input
                v-model="section.heading"
                class="form-input !py-1.5 !text-sm"
                placeholder="Section heading"
                :aria-label="`Heading of section ${index + 1}`"
                :aria-invalid="!!fieldError(`case_study.sections.${index}.heading`)"
              />
              <button
                type="button"
                class="btn-ghost !px-2 hover:!text-red-400"
                :aria-label="`Remove section ${index + 1}`"
                @click="sections.splice(index, 1)"
              >
                ✕
              </button>
            </div>
            <textarea
              v-model="section.body"
              rows="3"
              maxlength="5000"
              class="form-input mt-2 resize-y !text-sm"
              placeholder="Section text…"
              :aria-label="`Text of section ${index + 1}`"
              :aria-invalid="!!fieldError(`case_study.sections.${index}.body`)"
            ></textarea>
            <p v-if="sectionError(index)" class="m-0 mt-1 text-xs text-red-400" role="alert">
              {{ sectionError(index) }}
            </p>
          </li>
        </VueDraggable>
      </div>
    </div>
  </details>
</template>

<script setup>
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import FormField from './FormField.vue'
import StringListEditor from './StringListEditor.vue'

const QUESTIONS = [
  {
    field: 'problem',
    label: 'The problem',
    hint: 'What needed solving, and for whom?',
    placeholder: 'Managing portfolio content meant editing code and redeploying…',
  },
  {
    field: 'approach',
    label: 'My approach',
    hint: 'How you built it, and the decisions you made.',
    placeholder: 'Built a Vue front end with a Laravel API, storing media outside the database…',
  },
  {
    field: 'outcome',
    label: 'Outcome',
    hint: 'Results, and what you learned.',
    placeholder: 'Content updates now take seconds; learned how to design an upload pipeline…',
  },
]

const props = defineProps({
  /** (field) => error message, from useCrudEditor */
  fieldError: { type: Function, default: () => '' },
})

const model = defineModel({ type: Object, default: () => ({}) })

/** Nested lists need their own get/set so v-model writes back into case_study */
const listProxy = (key) =>
  computed({
    get: () => model.value[key] ?? [],
    set: (value) => (model.value = { ...model.value, [key]: value }),
  })

const highlights = listProxy('highlights')
const sections = listProxy('sections')

const filledCount = computed(
  () =>
    ['role', 'period', 'problem', 'approach', 'outcome'].filter((key) =>
      String(model.value[key] ?? '').trim(),
    ).length +
    (model.value.highlights?.length ? 1 : 0) +
    (model.value.sections?.length ? 1 : 0),
)
const hasContent = computed(() => filledCount.value > 0)

const addSection = () => (sections.value = [...sections.value, { heading: '', body: '' }])

const sectionError = (index) =>
  props.fieldError(`case_study.sections.${index}.heading`) ||
  props.fieldError(`case_study.sections.${index}.body`)
</script>

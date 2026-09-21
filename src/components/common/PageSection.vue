<!--
  PageSection — the card every public page sits in, with a consistent header.

  <PageSection title="Projects" eyebrow="Work" description="Things I've built.">
    <template #actions> …buttons on the right of the title… </template>
    …page content…
  </PageSection>

  The title is the page's <h1> (one per page, good for accessibility and SEO).
-->
<template>
  <section
    class="rounded-2xl border border-line bg-card p-5 shadow-[0_6px_30px_rgba(2,6,12,0.35)] sm:p-7 lg:p-9"
    :aria-labelledby="headingId"
  >
    <slot name="header">
      <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div class="min-w-0">
          <p
            v-if="eyebrow"
            class="m-0 mb-1 font-mono text-xs font-semibold tracking-widest text-accent/80 uppercase"
          >
            {{ eyebrow }}
          </p>
          <h1 :id="headingId" class="m-0 text-2xl font-bold text-heading sm:text-3xl">
            {{ title }}
          </h1>
          <p v-if="description" class="m-0 mt-2 max-w-2xl text-[0.95rem] leading-relaxed">
            {{ description }}
          </p>
        </div>
        <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
          <slot name="actions" />
        </div>
      </header>
    </slot>

    <slot />
  </section>
</template>

<script setup>
import { useId } from 'vue'

defineProps({
  title: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  description: { type: String, default: '' },
})

const headingId = useId()
</script>

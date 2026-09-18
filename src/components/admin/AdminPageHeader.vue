<!--
  AdminPageHeader — title, short description, optional search box and action buttons
  at the top of every admin page.

  <AdminPageHeader title="Projects" description="…" v-model:search="search" search-placeholder="Search projects">
    <button class="btn-primary">＋ Add project</button>
  </AdminPageHeader>
-->
<template>
  <header class="mb-5 flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0">
      <h1 class="m-0 text-2xl font-bold text-heading">{{ title }}</h1>
      <p v-if="description" class="m-0 mt-1 text-sm">{{ description }}</p>
    </div>
    <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
      <label v-if="search !== undefined" class="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
        <span class="sr-only">{{ searchPlaceholder }}</span>
        <span
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          aria-hidden="true"
          >⌕</span
        >
        <input
          v-model="search"
          type="search"
          class="form-input !pl-8"
          :placeholder="searchPlaceholder"
        />
      </label>
      <slot />
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'Search…' },
})
// Only rendered when the parent binds v-model:search
const search = defineModel('search', { type: String, default: undefined })
</script>

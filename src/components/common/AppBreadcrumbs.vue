<!--
  AppBreadcrumbs — "Home / Projects / Portfolio Website" trail for nested pages.
  <AppBreadcrumbs :items="[{ label: 'Projects', to: { name: 'projects' } }, { label: project.title }]" />
  The last item is the current page (not a link).
-->
<template>
  <nav aria-label="Breadcrumb" class="mb-4">
    <ol class="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm">
      <li class="flex items-center gap-1.5">
        <RouterLink :to="{ name: 'profile' }" class="text-muted no-underline hover:text-accent">
          Home
        </RouterLink>
      </li>
      <li v-for="(item, index) in items" :key="index" class="flex min-w-0 items-center gap-1.5">
        <span aria-hidden="true" class="text-muted/50">/</span>
        <RouterLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="text-muted no-underline hover:text-accent"
        >
          {{ item.label }}
        </RouterLink>
        <span v-else class="truncate font-semibold text-heading" aria-current="page">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  /** [{ label, to? }] — Home is added automatically */
  items: { type: Array, required: true },
})
</script>

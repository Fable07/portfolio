<!--
  NavLinks — the public page links, rendered from src/config/navigation.js.
  Used by both AppSidebar (desktop) and MobileHeader (mobile drawer).
  Emits "navigate" after a link is clicked so the mobile drawer can close itself.
-->
<template>
  <ul class="m-0 flex list-none flex-col gap-1 p-0">
    <li v-for="item in publicNav" :key="item.name">
      <!-- "custom" RouterLink: we render our own <a> to control the active styling -->
      <RouterLink
        v-slot="{ href, navigate, isActive, isExactActive }"
        :to="{ name: item.name }"
        custom
      >
        <a
          :href="href"
          class="block w-full rounded-xl px-3.5 py-2.5 text-left text-[0.9rem] font-semibold no-underline transition-all duration-300"
          :class="
            (item.exact ? isExactActive : isActive)
              ? 'bg-linear-to-r from-accent to-accent-2 text-ink shadow-[0_8px_20px_var(--glow)]'
              : 'text-muted hover:translate-x-1 hover:bg-accent/10 hover:text-heading'
          "
          :aria-current="(item.exact ? isExactActive : isActive) ? 'page' : undefined"
          @click="onClick($event, navigate)"
        >
          {{ item.label }}
        </a>
      </RouterLink>
    </li>
  </ul>
</template>

<script setup>
import { publicNav } from '@/config/navigation'

const emit = defineEmits(['navigate'])

function onClick(event, navigate) {
  navigate(event) // client-side route change (no full page reload)
  emit('navigate')
}
</script>

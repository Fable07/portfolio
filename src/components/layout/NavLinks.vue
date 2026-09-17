<!--
  NavLinks — the public page links, rendered from src/config/navigation.js.
  Used by both AppSidebar (desktop) and MobileHeader (mobile menu).
  Emits "navigate" after a link is clicked so the mobile menu can close itself.
-->
<template>
  <ul class="m-0 flex list-none flex-col gap-1 p-0">
    <li v-for="item in publicNav" :key="item.name">
      <!-- "custom" RouterLink: we render our own <a> to control the active class -->
      <RouterLink
        v-slot="{ href, navigate, isActive, isExactActive }"
        :to="{ name: item.name }"
        custom
      >
        <a
          :href="href"
          class="nav-link w-full text-left text-[0.88rem]"
          :class="{ active: item.exact ? isExactActive : isActive }"
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

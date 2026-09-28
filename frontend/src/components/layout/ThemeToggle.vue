<!-- ThemeToggle — moon/sun button that switches light & dark mode (state lives in useTheme) -->
<template>
  <button
    type="button"
    class="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent p-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/10"
    :aria-label="label"
    :title="label"
    @click="toggleTheme"
  >
    <img :src="isDarkMode ? nightIcon : lightIcon" alt="" class="size-7" />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import nightIcon from '@/assets/icons/theme/night-mode.png'
import lightIcon from '@/assets/icons/theme/light-mode.png'

const { isDarkMode, toggleTheme } = useTheme()
const label = computed(() => (isDarkMode.value ? 'Switch to light theme' : 'Switch to dark theme'))
</script>

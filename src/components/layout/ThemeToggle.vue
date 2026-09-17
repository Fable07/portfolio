<!-- ThemeToggle — moon/sun button that switches light & dark mode (state lives in useTheme) -->
<template>
  <button
    type="button"
    class="flex size-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent p-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/10 hover:shadow-[0_4px_12px_rgba(124,219,182,0.15)] focus-visible:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
    :aria-label="isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggleTheme"
  >
    <img :src="isDarkMode ? nightIcon : lightIcon" alt="" class="size-8" />
  </button>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import nightIcon from '@/assets/icons/theme/night-mode.png'
import lightIcon from '@/assets/icons/theme/light-mode.png'

const { isDarkMode, toggleTheme } = useTheme()
</script>

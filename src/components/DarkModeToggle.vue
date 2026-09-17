<template>
  <button class="darkMode" @click="toggleTheme">
    <span v-if="isDarkMode"><img src="/icons/night-mode.png" alt="Dark Mode" /></span>

    <span v-else><img src="/icons/light-mode.png" alt="Light Mode" /></span>
  </button>
</template>

<script>
import { useTheme } from '../composables/DarkMode'

export default {
  setup() {
    const { isDarkMode, toggleTheme } = useTheme()
    return { isDarkMode, toggleTheme }
  },
}
</script>

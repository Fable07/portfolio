import { ref, onMounted } from 'vue'

export function useTheme() {
  const isDarkMode = ref(false)

  onMounted(() => {
    const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
    document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light'
  })

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    document.documentElement.dataset.theme = isDarkMode.value ? 'dark' : 'light'
  }

  return { isDarkMode, toggleTheme }
}

import { ref, computed } from 'vue'

/**
 * useTheme — light/dark theme switching.
 *
 * The theme lives in ONE shared ref (module scope), so every <ThemeToggle>
 * on the page stays in sync. The choice is saved to localStorage; if the
 * visitor never picked one, their OS preference (prefers-color-scheme) is used.
 *
 * The active theme is written to <html data-theme="dark|light">, which the
 * CSS variables in src/styles/main.css react to.
 */

const STORAGE_KEY = 'portfolio:theme'
const theme = ref('dark')

function readSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : null
  } catch {
    return null // storage blocked (private mode) — fall back to OS preference
  }
}

function applyTheme(value) {
  theme.value = value
  document.documentElement.dataset.theme = value
}

/** Call once before the app mounts (see main.js) to avoid a flash of the wrong theme. */
export function initTheme() {
  const prefersDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
  applyTheme(readSavedTheme() ?? (prefersDark ? 'dark' : 'light'))
}

export function useTheme() {
  const isDarkMode = computed(() => theme.value === 'dark')

  /** Set and remember a theme: setTheme('light') */
  function setTheme(value) {
    applyTheme(value === 'light' ? 'light' : 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, theme.value)
    } catch {
      // not persisted — still switches for this visit
    }
  }

  function toggleTheme() {
    setTheme(isDarkMode.value ? 'light' : 'dark')
  }

  return { theme, isDarkMode, setTheme, toggleTheme }
}

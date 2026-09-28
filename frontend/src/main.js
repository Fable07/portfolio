/**
 * main.js — app entry point.
 * Order matters: Pinia (stores) must be installed before the router,
 * because the router's login guard reads the auth store.
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'
import App from './App.vue'
import router from './router'
import { initTheme } from './composables/useTheme'
import './styles/main.css'

initTheme() // apply saved light/dark theme before first paint

const app = createApp(App)
app.use(createPinia())
app.use(router)
// @unhead/vue manages <title> and <meta> tags; useHead() in any component updates them.
// titleTemplate turns a page title into the full tab title, e.g. "Projects · Jefferson S. Caragay".
app.use(
  createHead({
    init: [
      {
        titleTemplate: (title) =>
          title ? `${title} · Jefferson S. Caragay` : 'Jefferson S. Caragay - Portfolio',
      },
    ],
  }),
)

/**
 * Fade out the #loading-screen from index.html. It is written directly in index.html
 * (with its own small <style>) so it shows instantly, before any JavaScript downloads.
 */
function hideLoadingScreen() {
  const screen = document.getElementById('loading-screen')
  if (!screen) return
  screen.classList.add('hidden')
  screen.addEventListener('transitionend', () => screen.remove(), { once: true })
}

// Wait for the first route (and its lazy page code) to resolve, so the loader
// hands over to a fully rendered page instead of a blank frame.
router
  .isReady()
  .catch((err) => console.error('[router] initial navigation failed', err))
  .finally(() => {
    app.mount('#app')
    hideLoadingScreen()
  })

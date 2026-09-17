<!--
  AdminLayout — frame for every signed-in admin page (/admin/*):
  header (title, "View site", Sign Out) + tabs + toast + the current admin page.

  Tabs come from `adminNav` in src/config/navigation.js.
  The router guard only lets signed-in admins reach this layout.
-->
<template>
  <div class="admin-shell">
    <div class="admin-dashboard">
      <header class="admin-header">
        <div class="admin-header__left">
          <span class="admin-badge">🛡️ Admin</span>
          <h1 class="admin-title">Portfolio Manager</h1>
        </div>
        <div class="flex items-center gap-2">
          <RouterLink :to="{ name: 'profile' }" class="btn-ghost no-underline" target="_blank">
            View site ↗
          </RouterLink>
          <button type="button" class="btn-ghost" @click="signOut">Sign Out</button>
        </div>
      </header>

      <nav class="admin-tabs" aria-label="Admin sections">
        <RouterLink
          v-for="tab in adminNav"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="admin-tab"
          active-class="admin-tab--active"
        >
          <span aria-hidden="true">{{ tab.icon }}</span> {{ tab.label }}
        </RouterLink>
      </nav>

      <!-- Toast: "✔ Project saved" / "✘ Delete failed" (from the toast store) -->
      <Transition name="fade">
        <div
          v-if="toast.current"
          class="save-toast"
          :class="toast.current.type"
          role="status"
          aria-live="polite"
        >
          {{ toast.current.message }}
        </div>
      </Transition>

      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { adminNav } from '@/config/navigation'
import '@/styles/admin.css'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()
const route = useRoute()

let signingOut = false

async function signOut() {
  signingOut = true
  await auth.logout()
  router.push({ name: 'admin-login' })
}

// If the token expires mid-session (API returns 401), the auth store clears it —
// send the admin back to the login page, remembering where they were.
watch(
  () => auth.isAuthenticated,
  (signedIn) => {
    if (!signedIn && !signingOut) {
      router.push({ name: 'admin-login', query: { redirect: route.fullPath } })
    }
  },
)
</script>

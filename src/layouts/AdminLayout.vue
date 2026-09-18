<!--
  AdminLayout — frame for every signed-in admin page (/admin/*).
  Desktop: sticky sidebar (nav, signed-in user, View site, Sign out).
  Mobile: top bar with a horizontally scrollable tab strip.

  The admin is always dark (data-theme="dark"), independent of the public site theme.
  Menu items come from `adminNav` in src/config/navigation.js.
  The router guard only lets signed-in admins reach this layout.
-->
<template>
  <div data-admin data-theme="dark" class="-m-[15px] min-h-dvh bg-[#0b1018] text-muted">
    <div class="mx-auto flex max-w-[1400px] gap-6 p-3 sm:p-5">
      <!-- ── Sidebar (desktop) ── -->
      <aside
        class="sticky top-5 hidden h-[calc(100dvh-40px)] w-56 shrink-0 flex-col rounded-2xl border border-line bg-card p-4 lg:flex"
      >
        <RouterLink
          :to="{ name: 'admin-dashboard' }"
          class="mb-5 flex items-center gap-2 px-2 no-underline"
        >
          <span
            class="flex size-8 items-center justify-center rounded-lg bg-accent/15 text-accent"
            aria-hidden="true"
            >🛡️</span
          >
          <span>
            <span class="block text-sm font-bold text-heading">Portfolio Manager</span>
            <span class="block text-xs">Admin</span>
          </span>
        </RouterLink>

        <nav aria-label="Admin sections" class="flex-1">
          <ul class="m-0 grid list-none gap-1 p-0">
            <li v-for="item in adminNav" :key="item.name">
              <RouterLink
                v-slot="{ href, navigate, isActive, isExactActive }"
                :to="{ name: item.name }"
                custom
              >
                <a
                  :href="href"
                  class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold no-underline transition-colors"
                  :class="
                    (item.exact ? isExactActive : isActive)
                      ? 'bg-accent/15 text-accent'
                      : 'text-muted hover:bg-surface hover:text-heading'
                  "
                  :aria-current="(item.exact ? isExactActive : isActive) ? 'page' : undefined"
                  @click="navigate"
                >
                  <span aria-hidden="true">{{ item.icon }}</span
                  >{{ item.label }}
                </a>
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="grid gap-2 border-t border-line pt-3 text-sm">
          <p v-if="auth.user?.email" class="m-0 truncate px-2 text-xs" :title="auth.user.email">
            Signed in as<br /><span class="text-heading">{{ auth.user.email }}</span>
          </p>
          <RouterLink :to="{ name: 'profile' }" target="_blank" class="btn-ghost justify-start"
            >↗ View site</RouterLink
          >
          <button type="button" class="btn-ghost justify-start" @click="signOut">⎋ Sign out</button>
        </div>
      </aside>

      <div class="min-w-0 flex-1">
        <!-- ── Top bar + tabs (mobile/tablet) ── -->
        <header class="mb-4 rounded-2xl border border-line bg-card lg:hidden">
          <div class="flex items-center justify-between gap-2 px-4 py-3">
            <span class="text-sm font-bold text-heading">🛡️ Portfolio Manager</span>
            <span class="flex gap-1">
              <RouterLink
                :to="{ name: 'profile' }"
                target="_blank"
                class="btn-ghost px-2.5! py-1.5! text-xs!"
                >View site ↗</RouterLink
              >
              <button type="button" class="btn-ghost px-2.5! py-1.5! text-xs!" @click="signOut">
                Sign out
              </button>
            </span>
          </div>
          <nav
            aria-label="Admin sections"
            class="flex gap-1 overflow-x-auto border-t border-line px-2 py-2"
          >
            <RouterLink
              v-for="item in adminNav"
              :key="item.name"
              :to="{ name: item.name }"
              class="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-muted no-underline"
              :exact-active-class="item.exact ? 'bg-accent/15! text-accent!' : ''"
              :active-class="item.exact ? '' : 'bg-accent/15! text-accent!'"
            >
              {{ item.icon }} {{ item.label }}
            </RouterLink>
          </nav>
        </header>

        <main class="min-w-0">
          <RouterView />
        </main>
      </div>
    </div>

    <AppToast />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppToast from '@/components/common/AppToast.vue'
import { adminNav } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
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
    if (!signedIn && !signingOut)
      router.push({ name: 'admin-login', query: { redirect: route.fullPath } })
  },
)
</script>

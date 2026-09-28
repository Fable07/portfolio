import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import { configureAuth } from '@/api/client'

const TOKEN_KEY = 'admin:token'

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeToken(value) {
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, value)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable (private mode) — token stays in memory only
  }
}

/**
 * Auth store — the admin's login session.
 *
 * token          Sanctum bearer token (kept in sessionStorage: cleared when the tab closes)
 * user           The signed-in admin, filled once the token is verified with /auth/me
 * sessionExpired True after the API rejected the token (401) — the login page shows a notice
 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref(readToken())
  const user = ref(null)
  const sessionExpired = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  let verifying = null // shared promise so parallel route checks make one /auth/me call

  function clearSession() {
    token.value = null
    user.value = null
    writeToken(null)
  }

  configureAuth({
    tokenGetter: () => token.value,
    unauthorizedHandler: () => {
      clearSession()
      sessionExpired.value = true
    },
  })

  async function login(email, password) {
    const data = await authApi.login(email, password)
    token.value = data.token
    user.value = data.user
    sessionExpired.value = false
    writeToken(data.token)
  }

  /**
   * Is the admin really signed in? Used by the router guard.
   * Verifies a stored token with the API once, then trusts it for the rest of the visit.
   * (If the token expires later, the API client's 401 handler clears it.)
   */
  async function ensureVerified() {
    if (!token.value) return false
    if (user.value) return true
    verifying ??= authApi
      .me()
      .then((me) => {
        user.value = me
        return true
      })
      .catch(() => false) // 401 → client already cleared the session; network error → retry next time
      .finally(() => {
        verifying = null
      })
    return verifying
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // token may already be invalid — clear locally regardless
    }
    clearSession()
  }

  return { token, user, sessionExpired, isAuthenticated, login, ensureVerified, logout }
})

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

export const useAuthStore = defineStore('auth', () => {
  const token = ref(readToken())
  const user = ref(null)
  const sessionExpired = ref(false)

  const isAuthenticated = computed(() => !!token.value)

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

  /** Confirm a stored token is still valid (called on page load). */
  async function restore() {
    if (!token.value) return false
    try {
      user.value = await authApi.me()
      return true
    } catch {
      clearSession()
      return false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // token may already be invalid — clear locally regardless
    }
    clearSession()
  }

  return { token, user, sessionExpired, isAuthenticated, login, restore, logout }
})

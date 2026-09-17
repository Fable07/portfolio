<!--
  AdminLoginView — /admin/login
  Email + password form. On success, goes to the page the admin originally asked for
  (?redirect=/admin/projects) or the first admin tab.
-->
<template>
  <div class="admin-shell">
    <div class="admin-login">
      <form class="login-card" @submit.prevent="login">
        <div class="login-logo" aria-hidden="true">🔐</div>
        <h1 class="login-title">Admin Access</h1>
        <p class="login-sub">Portfolio Manager</p>

        <div class="field">
          <label class="field__label" for="admin-email">Email</label>
          <input
            id="admin-email"
            v-model.trim="email"
            type="email"
            class="field__input"
            placeholder="you@example.com"
            autocomplete="username"
            required
          />
        </div>

        <div class="field">
          <label class="field__label" for="admin-pass">Password</label>
          <div class="field__input-wrap">
            <input
              id="admin-pass"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="field__input"
              placeholder="Enter admin password"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="field__eye"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <p v-if="error" class="login-error" role="alert">{{ error }}</p>

        <button
          type="submit"
          class="btn-primary justify-center"
          :disabled="!email || !password || submitting"
        >
          {{ submitting ? 'Signing in…' : 'Sign In' }}
        </button>

        <RouterLink
          :to="{ name: 'profile' }"
          class="text-center text-[0.8rem] text-muted no-underline hover:text-accent"
        >
          ← Back to portfolio
        </RouterLink>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import '@/styles/admin.css'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitting = ref(false)
const error = ref(auth.sessionExpired ? 'Your session expired. Please sign in again.' : '')

async function login() {
  submitting.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    password.value = ''
    // Only follow redirects inside the admin — never to an outside URL
    const redirect = String(route.query.redirect || '')
    router.replace(redirect.startsWith('/admin/') ? redirect : { name: 'admin-certifications' })
  } catch (err) {
    error.value = err.errors?.email?.[0] || err.message
  } finally {
    submitting.value = false
  }
}
</script>

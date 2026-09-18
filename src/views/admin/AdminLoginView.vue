<!--
  AdminLoginView — /admin/login
  Email + password form. On success, goes to the page the admin originally asked for
  (?redirect=/admin/projects) or the dashboard.
-->
<template>
  <div
    data-admin
    data-theme="dark"
    class="-m-[15px] flex min-h-dvh items-center justify-center bg-[#0b1018] p-4 text-muted"
  >
    <form
      class="grid w-full max-w-sm gap-4 rounded-2xl border border-line bg-card p-7 shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
      novalidate
      @submit.prevent="login"
    >
      <div class="text-center">
        <div
          class="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-accent/15 text-2xl"
          aria-hidden="true"
        >
          🔐
        </div>
        <h1 class="m-0 text-xl font-bold text-heading">Admin access</h1>
        <p class="m-0 mt-1 text-sm">Portfolio Manager</p>
      </div>

      <p
        v-if="error"
        class="m-0 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300"
        role="alert"
      >
        {{ error }}
      </p>

      <FormField v-slot="{ id }" label="Email">
        <input
          :id="id"
          v-model.trim="email"
          type="email"
          class="form-input"
          placeholder="you@example.com"
          autocomplete="username"
          required
        />
      </FormField>

      <FormField v-slot="{ id }" label="Password">
        <div class="relative">
          <input
            :id="id"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input pr-11!"
            placeholder="Enter your password"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="btn-ghost absolute top-1/2 right-1 -translate-y-1/2 px-2! py-1!"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>
      </FormField>

      <button
        type="submit"
        class="btn-primary w-full"
        :disabled="!email || !password || submitting"
      >
        {{ submitting ? 'Signing in…' : 'Sign in' }}
      </button>

      <RouterLink
        :to="{ name: 'profile' }"
        class="text-center text-xs text-muted no-underline hover:text-accent"
        >← Back to portfolio</RouterLink
      >
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormField from '@/components/admin/FormField.vue'
import { useAuthStore } from '@/stores/auth'

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
    router.replace(
      redirect.startsWith('/admin') && !redirect.startsWith('//')
        ? redirect
        : { name: 'admin-dashboard' },
    )
  } catch (err) {
    error.value = err.errors?.email?.[0] || err.message
  } finally {
    submitting.value = false
  }
}
</script>

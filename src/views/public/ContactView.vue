<!--
  ContactView — /contact
  Sends a message to the admin inbox (POST /api/messages). No email server needed.

  Anti-spam: a hidden "website" field (a honeypot — only bots fill it in) plus a
  rate limit on the API. Field errors from the API are shown next to each field.
-->
<template>
  <PageSection
    title="Get in touch"
    eyebrow="Contact"
    description="Send me a message — it lands straight in my inbox."
  >
    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
      <!-- Sent confirmation replaces the form -->
      <div v-if="sent" class="rounded-xl border border-accent/30 bg-accent/5 p-6" role="status">
        <p class="m-0 text-2xl" aria-hidden="true">✅</p>
        <h2 class="m-0 mt-2 text-lg font-bold text-heading">Message sent</h2>
        <p class="m-0 mt-1 text-sm">
          Thanks, {{ sentName }} — I'll reply to {{ sentEmail }} as soon as I can.
        </p>
        <button type="button" class="btn-secondary mt-4" @click="reset">Send another</button>
      </div>

      <form v-else class="grid gap-4" novalidate @submit.prevent="submit">
        <p
          v-if="formError"
          class="m-0 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {{ formError }}
        </p>

        <div class="grid gap-4 sm:grid-cols-2">
          <FormField
            v-slot="{ id, describedBy, invalid }"
            label="Your name"
            required
            :error="errors.name"
          >
            <input
              :id="id"
              v-model.trim="form.name"
              class="form-input"
              autocomplete="name"
              maxlength="120"
              :aria-describedby="describedBy"
              :aria-invalid="invalid"
            />
          </FormField>
          <FormField
            v-slot="{ id, describedBy, invalid }"
            label="Your email"
            required
            :error="errors.email"
          >
            <input
              :id="id"
              v-model.trim="form.email"
              type="email"
              class="form-input"
              autocomplete="email"
              maxlength="255"
              :aria-describedby="describedBy"
              :aria-invalid="invalid"
            />
          </FormField>
        </div>

        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="Subject"
          optional
          :error="errors.subject"
        >
          <input
            :id="id"
            v-model.trim="form.subject"
            class="form-input"
            maxlength="150"
            placeholder="e.g. Freelance project"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>

        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="Message"
          required
          :error="errors.body"
          :hint="`${form.body.length} / 5000 characters`"
        >
          <textarea
            :id="id"
            v-model="form.body"
            rows="7"
            maxlength="5000"
            class="form-input resize-y"
            placeholder="Tell me about the role, project or question…"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          ></textarea>
        </FormField>

        <!-- Honeypot: hidden from people, tempting to bots. Never filled in by a real visitor. -->
        <div class="sr-only" aria-hidden="true">
          <label for="contact-website">Website (leave empty)</label>
          <input id="contact-website" v-model="form.website" tabindex="-1" autocomplete="off" />
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button type="submit" class="btn-primary" :disabled="sending">
            {{ sending ? 'Sending…' : 'Send message' }}
          </button>
          <span class="text-xs">No account needed. I never share your email.</span>
        </div>
      </form>

      <!-- Other ways to reach me -->
      <aside
        class="h-fit rounded-xl border border-line bg-surface p-5"
        aria-label="Other ways to reach me"
      >
        <h2 class="m-0 mb-3 text-sm font-semibold tracking-wide text-heading uppercase">
          Elsewhere
        </h2>
        <ul class="m-0 grid list-none gap-2 p-0 text-sm">
          <li v-for="link in profile.socialLinks" :key="link.label + link.href">
            <a
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-accent no-underline hover:underline"
            >
              <img v-if="link.iconUrl" :src="link.iconUrl" alt="" class="size-4 object-contain" />
              {{ link.label }}
            </a>
          </li>
        </ul>
        <p v-if="profile.location" class="m-0 mt-4 border-t border-line pt-3 text-sm">
          📍 {{ profile.location }}
        </p>
      </aside>
    </div>
  </PageSection>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { messagesApi } from '@/api'
import FormField from '@/components/common/FormField.vue'
import PageSection from '@/components/common/PageSection.vue'
import { flattenErrors } from '@/composables/useCrudEditor'
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()
const profile = computed(() => profileStore.profile)

const blank = { name: '', email: '', subject: '', body: '', website: '' }
const form = reactive({ ...blank })
const errors = ref({})
const formError = ref('')
const sending = ref(false)
const sent = ref(false)
const sentName = ref('')
const sentEmail = ref('')

onMounted(() => profileStore.load())

/** Quick checks before bothering the server */
function validate() {
  const found = {}
  if (!form.name) found.name = 'Please tell me your name.'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
    found.email = 'Please enter a valid email address.'
  if (form.body.trim().length < 10) found.body = 'Please write at least 10 characters.'
  return found
}

async function submit() {
  errors.value = validate()
  if (Object.keys(errors.value).length) {
    formError.value = 'Please fix the highlighted fields.'
    return
  }

  sending.value = true
  formError.value = ''
  try {
    await messagesApi.send({ ...form })
    sentName.value = form.name
    sentEmail.value = form.email
    sent.value = true
  } catch (err) {
    errors.value = flattenErrors(err.errors)
    formError.value = Object.keys(errors.value).length
      ? 'Please fix the highlighted fields.'
      : err.message || "Couldn't send the message. Please try again."
  } finally {
    sending.value = false
  }
}

function reset() {
  Object.assign(form, blank)
  errors.value = {}
  formError.value = ''
  sent.value = false
}
</script>

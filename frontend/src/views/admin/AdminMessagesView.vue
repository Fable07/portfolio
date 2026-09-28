<!--
  AdminMessagesView — /admin/messages
  Messages from the public contact form. Click one to read it (that marks it read),
  reply by email, or delete it with an Undo window.
-->
<template>
  <section>
    <AdminPageHeader
      v-model:search="search"
      title="Inbox"
      :description="
        store.unread
          ? `${store.unread} unread message${store.unread === 1 ? '' : 's'}`
          : 'Messages from your contact form.'
      "
      search-placeholder="Search messages"
    >
      <button
        type="button"
        class="btn-secondary"
        :disabled="store.isLoading"
        @click="store.load({ force: true })"
      >
        ⟳ Refresh
      </button>
    </AdminPageHeader>

    <div v-if="store.isLoading" class="grid gap-2" aria-busy="true">
      <SkeletonBlock v-for="n in 3" :key="n" class="h-16 w-full rounded-xl" />
    </div>

    <StateMessage
      v-else-if="store.status === 'error'"
      type="error"
      :message="`Couldn't load messages: ${store.error?.message}`"
      retry
      @retry="store.load({ force: true })"
    />

    <div
      v-else-if="!store.items.length"
      class="rounded-2xl border border-dashed border-line p-10 text-center"
    >
      <p class="m-0 text-3xl" aria-hidden="true">📭</p>
      <p class="m-0 mt-2">No messages yet.</p>
      <RouterLink :to="{ name: 'contact' }" target="_blank" class="btn-secondary mt-4"
        >Open the contact form ↗</RouterLink
      >
    </div>

    <template v-else>
      <StateMessage v-if="!visible.length" :message="`No messages match “${search}”.`" />

      <ul class="m-0 grid list-none gap-2 p-0">
        <li
          v-for="message in visible"
          :key="message.id"
          class="rounded-xl border bg-surface transition-colors"
          :class="message.is_read ? 'border-line' : 'border-accent/40 bg-accent/5'"
        >
          <!-- Row: click to expand -->
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent p-3 text-left"
            :aria-expanded="openId === message.id"
            :aria-controls="`message-${message.id}`"
            @click="toggle(message)"
          >
            <span
              class="size-2 shrink-0 rounded-full"
              :class="message.is_read ? 'bg-transparent' : 'bg-accent'"
              :title="message.is_read ? 'Read' : 'Unread'"
              aria-hidden="true"
            ></span>
            <span class="min-w-0 flex-1">
              <span class="flex flex-wrap items-baseline gap-x-2">
                <span
                  class="font-semibold"
                  :class="message.is_read ? 'text-heading' : 'text-accent'"
                >
                  {{ message.name }}
                </span>
                <span class="text-xs">{{ message.email }}</span>
              </span>
              <span class="mt-0.5 block truncate text-sm">
                <span v-if="message.subject" class="text-heading">{{ message.subject }} — </span
                >{{ message.body }}
              </span>
            </span>
            <span class="shrink-0 font-mono text-xs whitespace-nowrap">{{
              formatDate(message.created_at)
            }}</span>
            <span aria-hidden="true" class="shrink-0">{{ openId === message.id ? '▴' : '▾' }}</span>
          </button>

          <!-- Expanded message -->
          <div
            v-if="openId === message.id"
            :id="`message-${message.id}`"
            class="border-t border-line p-4"
          >
            <p class="m-0 leading-relaxed whitespace-pre-line text-heading">{{ message.body }}</p>
            <p class="m-0 mt-3 text-xs">
              Received {{ new Date(message.created_at).toLocaleString() }}
              <template v-if="message.meta?.ip"> · from {{ message.meta.ip }}</template>
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <a :href="replyLink(message)" class="btn-primary">✉ Reply by email</a>
              <button
                type="button"
                class="btn-secondary"
                @click="setRead(message, !message.is_read)"
              >
                {{ message.is_read ? 'Mark unread' : 'Mark read' }}
              </button>
              <button
                type="button"
                class="btn-ghost hover:text-red-400!"
                @click="deleteWithUndo(message)"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import StateMessage from '@/components/common/StateMessage.vue'
import { useUndoableDelete } from '@/composables/useUndoableDelete'
import { useMessagesStore } from '@/stores/messages'
import { useToastStore } from '@/stores/toast'

const store = useMessagesStore()
const toast = useToastStore()
const search = ref('')
const openId = ref(null)

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return store.items
  return store.items.filter((message) =>
    `${message.name} ${message.email} ${message.subject ?? ''} ${message.body}`
      .toLowerCase()
      .includes(q),
  )
})

const { deleteWithUndo } = useUndoableDelete(store, {
  label: 'Message',
  nameOf: (message) => message.name,
})

/** Opening a message marks it read */
function toggle(message) {
  openId.value = openId.value === message.id ? null : message.id
  if (openId.value === message.id && !message.is_read) setRead(message, true)
}

async function setRead(message, read) {
  try {
    await store.setRead(message.id, read)
  } catch (err) {
    toast.error(`Couldn't update: ${err.message}`)
  }
}

/** Pre-filled mailto reply */
function replyLink(message) {
  const subject = message.subject ? `Re: ${message.subject}` : 'Re: your message'
  const body = `\n\n---\nOn ${new Date(message.created_at).toLocaleDateString()}, ${message.name} wrote:\n${message.body}`
  return `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** "18 Sep" for this year, "18 Sep 2025" otherwise */
function formatDate(value) {
  const date = new Date(value)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

onMounted(() => store.load())
</script>

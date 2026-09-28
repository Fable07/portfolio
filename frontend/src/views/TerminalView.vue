<!--
  TerminalView — /terminal — explore the portfolio from a command line.

  Commands live in src/terminal/commands.js (help, projects, skills, open, theme, exit…).
  This view handles the screen: input, output history, keyboard and data wiring.

  Keys:  Enter run · Tab autocomplete · ↑/↓ previous commands · Ctrl+L clear
         Ctrl+C cancel line · Esc (empty line) leave terminal
-->
<template>
  <div
    class="-m-[15px] flex min-h-dvh flex-col bg-terminal font-mono text-[0.9rem] leading-relaxed text-[#cbd5e1] sm:text-[0.95rem]"
    @click="focusInput"
  >
    <!-- Window bar -->
    <header
      class="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-[#0d131c]/95 px-4 py-2.5 backdrop-blur"
    >
      <span class="flex gap-1.5" aria-hidden="true">
        <span class="size-3 rounded-full bg-[#ff5f57]"></span>
        <span class="size-3 rounded-full bg-[#febc2e]"></span>
        <span class="size-3 rounded-full bg-[#28c840]"></span>
      </span>
      <h1 class="m-0 flex-1 truncate text-center text-xs font-normal text-[#7d8795]">
        {{ prompt.user }}@{{ prompt.host }}: ~ — terminal mode
      </h1>
      <RouterLink
        :to="{ name: 'profile' }"
        class="rounded-md border border-white/15 px-2.5 py-1 text-xs text-[#cbd5e1] no-underline hover:border-[#7cdbb6] hover:text-[#7cdbb6]"
      >
        Exit to site
      </RouterLink>
    </header>

    <!-- Output -->
    <main ref="screen" class="flex-1 px-4 py-4 sm:px-8" aria-label="Terminal output">
      <div class="mx-auto max-w-4xl">
        <template v-for="entry in entries" :key="entry.id">
          <!-- Echo of what was typed -->
          <div v-if="entry.kind === 'input'" class="mt-2 break-words whitespace-pre-wrap">
            <PromptLabel :prompt="prompt" /><span class="text-[#f1f5f9]">{{ entry.text }}</span>
          </div>
          <TerminalLine v-else :parts="entry.parts" />
        </template>

        <!-- Input line -->
        <form class="mt-2 flex items-center" @submit.prevent="submit">
          <label for="terminal-input" class="shrink-0"><PromptLabel :prompt="prompt" /></label>
          <input
            id="terminal-input"
            ref="input"
            v-model="line"
            class="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[#f1f5f9] caret-[#7cdbb6] outline-none focus-visible:outline-none"
            :disabled="busy"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            enterkeyhint="send"
            aria-describedby="terminal-help"
            @keydown="onKeydown"
          />
        </form>
        <p v-if="busy" class="m-0 text-[#7d8795]">…</p>
        <p id="terminal-help" class="sr-only">
          Type a command and press Enter. Type help for a list. Tab autocompletes.
        </p>
      </div>
    </main>

    <!-- Quick commands: tap-friendly on phones -->
    <nav
      aria-label="Quick commands"
      class="sticky bottom-0 flex gap-2 overflow-x-auto border-t border-white/10 bg-[#0d131c]/95 px-4 py-2.5 backdrop-blur"
    >
      <button
        v-for="quick in QUICK_COMMANDS"
        :key="quick"
        type="button"
        class="shrink-0 cursor-pointer rounded-md border border-white/15 bg-transparent px-2.5 py-1 font-mono text-xs text-[#cbd5e1] hover:border-[#7cdbb6] hover:text-[#7cdbb6]"
        @click.stop="execute(quick)"
      >
        {{ quick }}
      </button>
    </nav>

    <!-- Screen readers hear the latest output -->
    <div class="sr-only" aria-live="polite">{{ lastOutputText }}</div>
  </div>
</template>

<script setup>
import { computed, h, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import TerminalLine from '@/components/terminal/TerminalLine.vue'
import { publicNav } from '@/config/navigation'
import { useTheme } from '@/composables/useTheme'
import {
  useCertificationsStore,
  useHobbiesStore,
  useProjectsStore,
  useResumeStore,
  useTimelineStore,
} from '@/stores/content'
import { useProfileStore } from '@/stores/profile'
import { commandNames, commands, findCommand, runCommand, welcomeLines } from '@/terminal/commands'
import { complete, tokenize } from '@/terminal/parser'
import { buildJourney } from '@/utils/journey'
import { buildSkillGraph } from '@/utils/skillGraph'
import { line as outputLine, muted, plain } from '@/terminal/output'

useHead({ title: 'Terminal' })

const HISTORY_KEY = 'portfolio:terminal-history'
const QUICK_COMMANDS = [
  'help',
  'whoami',
  'projects',
  'skills',
  'experience',
  'contact',
  'clear',
  'exit',
]

const router = useRouter()
const theme = useTheme()
const stores = {
  projects: useProjectsStore(),
  certifications: useCertificationsStore(),
  hobbies: useHobbiesStore(),
  timeline: useTimelineStore(),
  resume: useResumeStore(),
  profile: useProfileStore(),
}

// Profile content comes from the store (edited in /admin/profile), so it's read live
const profile = computed(() => stores.profile.profile)
const prompt = computed(() => ({ user: profile.value.handle, host: 'portfolio' }))

/** Coloured "jefferson@portfolio:~$ " label (small render-function component). */
const PromptLabel = (props) =>
  h('span', { 'aria-hidden': 'true' }, [
    h('span', { class: 'text-[#7cdbb6]' }, `${props.prompt.user}@${props.prompt.host}`),
    h('span', { class: 'text-[#7d8795]' }, ':'),
    h('span', { class: 'text-[#93c5fd]' }, '~'),
    h('span', { class: 'text-[#7d8795]' }, '$ '),
  ])
PromptLabel.props = ['prompt']

/* ── State ── */
const entries = ref([]) // [{ id, kind: 'input', text } | { id, kind: 'output', parts }]
const line = ref('')
const busy = ref(false)
const input = ref(null)
const screen = ref(null)
const history = ref(readHistory())
let historyCursor = null // index while browsing with ↑/↓
let nextId = 0

const lastOutputText = computed(() => {
  const outputs = entries.value.filter((entry) => entry.kind === 'output').slice(-6)
  return outputs.map((entry) => plain(entry.parts)).join('. ')
})

/* ── Context passed to every command (see src/terminal/commands.js) ── */
async function listFrom(store) {
  await store.load()
  if (store.status === 'error') throw new Error(store.error?.message || 'could not load data')
  return store.items
}

const ctx = {
  // getters: commands always see the latest profile data
  get profile() {
    return profile.value
  },
  get skillGroups() {
    return profile.value.skillGroups
  },
  get socialLinks() {
    return profile.value.socialLinks
  },
  pages: publicNav.map((page) => ({
    name: page.name,
    label: page.label,
    path: router.resolve({ name: page.name }).path.replace(/^\//, ''),
  })),
  data: {
    projects: () => listFrom(stores.projects),
    certifications: () => listFrom(stores.certifications),
    hobbies: () => listFrom(stores.hobbies),
    timeline: () => listFrom(stores.timeline),
    // Merged timeline (same data as the /journey page)
    journey: async () => {
      const [timeline, certifications, projects] = await Promise.all([
        listFrom(stores.timeline),
        listFrom(stores.certifications),
        listFrom(stores.projects),
      ])
      return buildJourney({ timeline, certifications, projects })
    },
    // Skill → projects/certifications links (same data as the /skills page)
    skillGraph: async () => {
      const [projects, certifications] = await Promise.all([
        listFrom(stores.projects),
        listFrom(stores.certifications),
      ])
      return buildSkillGraph({ skillGroups: profile.value.skillGroups, projects, certifications })
    },
    resumeUrl: async () => {
      await stores.resume.load()
      return stores.resume.status === 'error' ? '/resume.pdf' : stores.resume.pdfUrl
    },
  },
  navigate: (to) => router.push(to),
  openUrl: (url) => window.open(url, '_blank', 'noopener'),
  theme: { current: () => theme.theme.value, set: (value) => theme.setTheme(value) },
  history: () => [...history.value],
  clear: () => (entries.value = []),
  exit: () => setTimeout(() => router.push({ name: 'profile' }), 350),
}

/* ── Running commands ── */
function print(lines) {
  for (const parts of lines) entries.value.push({ id: nextId++, kind: 'output', parts })
}

async function execute(text) {
  const trimmed = text.trim()
  entries.value.push({ id: nextId++, kind: 'input', text })
  line.value = ''
  historyCursor = null
  if (!trimmed) return scrollToBottom()

  rememberHistory(trimmed)
  busy.value = true
  try {
    print(await runCommand(trimmed, ctx))
  } finally {
    busy.value = false
    await scrollToBottom()
    focusInput()
  }
}

const submit = () => execute(line.value)

/* ── Keyboard ── */
async function onKeydown(event) {
  if (event.key === 'Tab') {
    event.preventDefault()
    return autocomplete()
  }
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    return browseHistory(event.key === 'ArrowUp' ? -1 : 1)
  }
  if (event.ctrlKey && event.key.toLowerCase() === 'l') {
    event.preventDefault()
    return ctx.clear()
  }
  if (event.ctrlKey && event.key.toLowerCase() === 'c' && !window.getSelection()?.toString()) {
    event.preventDefault()
    entries.value.push({ id: nextId++, kind: 'input', text: `${line.value}^C` })
    line.value = ''
    return scrollToBottom()
  }
  if (event.key === 'Escape' && !line.value) {
    router.push({ name: 'profile' })
  }
}

async function autocomplete() {
  const { value, matches } = await completeAsync(line.value)
  if (matches.length > 1 && value === line.value) {
    // Several options and nothing more to fill in: list them like a real shell
    entries.value.push({ id: nextId++, kind: 'input', text: line.value })
    print([outputLine(muted(matches.join('   ')))])
    await scrollToBottom()
  }
  line.value = value
}

/** Candidate words for the token being completed (command names, then that command's args). */
async function completeAsync(text) {
  const tokens = tokenize(text)
  const argIndex = /\s$/.test(text) || tokens.length === 0 ? tokens.length : tokens.length - 1
  let argWords = []
  if (argIndex > 0) {
    const command = findCommand(tokens[0] ?? '')
    try {
      argWords = (await command?.complete?.(argIndex - 1, ctx)) ?? []
    } catch {
      argWords = []
    }
  }
  return complete(text, (index) => (index === 0 ? commandNames() : argWords))
}

function browseHistory(direction) {
  if (!history.value.length) return
  if (historyCursor === null) historyCursor = history.value.length
  historyCursor = Math.min(Math.max(historyCursor + direction, 0), history.value.length)
  line.value = history.value[historyCursor] ?? ''
  nextTick(() => input.value?.setSelectionRange(line.value.length, line.value.length))
}

/* ── Helpers ── */
async function scrollToBottom() {
  await nextTick()
  window.scrollTo({ top: document.body.scrollHeight })
}

function focusInput() {
  // Don't steal focus when the visitor is selecting text to copy
  if (!window.getSelection()?.toString()) input.value?.focus({ preventScroll: true })
}

function readHistory() {
  try {
    return JSON.parse(sessionStorage.getItem(HISTORY_KEY)) ?? []
  } catch {
    return []
  }
}
function rememberHistory(command) {
  if (history.value.at(-1) !== command) history.value.push(command)
  history.value = history.value.slice(-50)
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
  } catch {
    // storage blocked — history lasts until the page closes
  }
}

onMounted(async () => {
  await stores.profile.load()
  print(welcomeLines(ctx))
  focusInput()
})

// Exposed for tests / Vue Devtools
defineExpose({ execute, commands })
</script>

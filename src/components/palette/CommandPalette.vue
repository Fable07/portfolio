<!--
  CommandPalette — searchable launcher (Ctrl/⌘+K or "/").

  Type to fuzzy-search pages, projects, certifications, actions and links;
  ↑/↓ to move, Enter to run, Esc to close. With an empty search it shows your
  recently used commands first.

  Accessibility: the input is a combobox that controls a listbox of options,
  and aria-activedescendant tells screen readers which option is highlighted.
  Commands come from usePaletteCommands(); open state from useCommandPalette().
-->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150"
      leave-active-class="transition duration-100"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1150] flex items-start justify-center bg-black/55 px-3 pt-[12vh] backdrop-blur-sm"
        @mousedown.self="close"
      >
        <div
          ref="dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          class="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        >
          <!-- Search input -->
          <div class="flex items-center gap-3 border-b border-line px-4">
            <span aria-hidden="true" class="text-muted">⌕</span>
            <input
              ref="input"
              v-model="query"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls="palette-listbox"
              aria-autocomplete="list"
              :aria-activedescendant="activeOptionId"
              placeholder="Search pages, projects, actions…"
              class="h-14 min-w-0 flex-1 border-0 bg-transparent text-base text-heading outline-none placeholder:text-muted/70 focus-visible:outline-none"
              autocomplete="off"
              spellcheck="false"
              @keydown="onKeydown"
            />
            <kbd class="kbd">Esc</kbd>
          </div>

          <!-- Results -->
          <ul
            id="palette-listbox"
            ref="list"
            role="listbox"
            aria-label="Results"
            class="m-0 min-h-0 flex-1 list-none overflow-y-auto p-2"
          >
            <template v-for="section in sections" :key="section.group">
              <li
                role="presentation"
                class="px-3 pt-3 pb-1 font-mono text-[0.68rem] font-semibold tracking-widest text-muted/80 uppercase"
              >
                {{ section.group }}
              </li>
              <li
                v-for="result in section.results"
                :id="optionId(result.index)"
                :key="section.group + result.command.id"
                role="option"
                :aria-selected="result.index === activeIndex"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5"
                :class="result.index === activeIndex ? 'bg-accent/12 text-heading' : 'text-muted'"
                @mousemove="activeIndex = result.index"
                @click="run(result.command)"
              >
                <img
                  v-if="result.command.iconUrl"
                  :src="result.command.iconUrl"
                  alt=""
                  class="size-5 object-contain"
                />
                <span v-else aria-hidden="true" class="w-5 text-center">{{
                  result.command.icon
                }}</span>

                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[0.92rem] font-medium">
                    <template
                      v-for="(part, i) in highlightParts(result.command.title, result.indexes)"
                      :key="i"
                    >
                      <mark v-if="part.match" class="bg-transparent font-bold text-accent">{{
                        part.text
                      }}</mark>
                      <template v-else>{{ part.text }}</template>
                    </template>
                  </span>
                  <span v-if="result.command.subtitle" class="block truncate text-xs text-muted/80">
                    {{ result.command.subtitle }}
                  </span>
                </span>

                <span v-if="result.index === activeIndex" aria-hidden="true" class="kbd">↵</span>
              </li>
            </template>

            <li
              v-if="!flatResults.length"
              role="presentation"
              class="px-3 py-10 text-center text-sm"
            >
              No results for “{{ query }}”. Try
              <button
                type="button"
                class="cursor-pointer border-0 bg-transparent p-0 font-semibold text-accent underline"
                @click="openTerminal"
              >
                terminal mode</button
              >.
            </li>
          </ul>

          <!-- Footer hints -->
          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-2 text-xs text-muted/80"
          >
            <span><kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> navigate</span>
            <span><kbd class="kbd">↵</kbd> open</span>
            <span class="ml-auto"><kbd class="kbd">`</kbd> terminal</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useScrollLock } from '@vueuse/core'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { usePaletteCommands } from '@/composables/usePaletteCommands'
import { fuzzyFilter, highlightParts } from '@/utils/fuzzy'

const RECENT_KEY = 'portfolio:recent-commands'
const MAX_RECENT = 5
const MAX_PER_GROUP = 6
const GROUP_ORDER = ['Recent', 'Pages', 'Actions', 'Projects', 'Certifications', 'Links']

const router = useRouter()
const { isOpen, close } = useCommandPalette()
const { commands, loadData } = usePaletteCommands()

const query = ref('')
const activeIndex = ref(0)
const input = ref(null)
const dialog = ref(null)
const list = ref(null)
const recentIds = ref(readRecent())

/* ── Focus + scroll handling while open ── */
const { activate, deactivate } = useFocusTrap(dialog, { immediate: false, allowOutsideClick: true })
const scrollLock = useScrollLock(document.body)

watch(isOpen, async (open) => {
  scrollLock.value = open
  if (open) {
    query.value = ''
    activeIndex.value = 0
    loadData()
    await nextTick()
    activate()
    input.value?.focus()
  } else {
    deactivate()
  }
})

/* ── Search ── */
// Results grouped by section; each result also gets a running `index` for keyboard navigation
const sections = computed(() => {
  const matched = fuzzyFilter(query.value, commands.value, (command) => [
    command.title,
    command.subtitle,
    command.keywords,
    command.group,
  ])

  const groups = new Map()
  if (!query.value.trim()) {
    const recent = recentIds.value
      .map((id) => commands.value.find((command) => command.id === id))
      .filter(Boolean)
      .map((command) => ({ command, indexes: [] }))
    if (recent.length) groups.set('Recent', recent)
  }
  for (const { item, indexes } of matched) {
    const bucket = groups.get(item.group) ?? []
    if (bucket.length < MAX_PER_GROUP) bucket.push({ command: item, indexes })
    groups.set(item.group, bucket)
  }

  // With a search query, the group containing the best match comes first
  const order = query.value.trim()
    ? [...new Set(matched.map((result) => result.item.group))]
    : GROUP_ORDER

  let index = 0
  return order
    .filter((group) => groups.has(group))
    .map((group) => ({
      group,
      results: groups.get(group).map((result) => ({ ...result, index: index++ })),
    }))
})

const flatResults = computed(() => sections.value.flatMap((section) => section.results))
watch(query, () => (activeIndex.value = 0))

const optionId = (index) => `palette-option-${index}`
const activeOptionId = computed(() =>
  flatResults.value.length ? optionId(activeIndex.value) : undefined,
)

/* ── Keyboard ── */
function onKeydown(event) {
  const count = flatResults.value.length
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(count ? (activeIndex.value + 1) % count : 0)
      break
    case 'ArrowUp':
      event.preventDefault()
      move(count ? (activeIndex.value - 1 + count) % count : 0)
      break
    case 'Home':
      event.preventDefault()
      move(0)
      break
    case 'End':
      event.preventDefault()
      move(Math.max(count - 1, 0))
      break
    case 'Enter': {
      event.preventDefault()
      const result = flatResults.value[activeIndex.value]
      if (result) run(result.command)
      break
    }
    case 'Escape':
      event.preventDefault()
      close()
      break
  }
}

async function move(index) {
  activeIndex.value = index
  await nextTick()
  document.getElementById(optionId(index))?.scrollIntoView({ block: 'nearest' })
}

/* ── Run + remember ── */
function run(command) {
  close()
  rememberRecent(command.id)
  command.run()
}

function openTerminal() {
  close()
  router.push({ name: 'terminal' })
}

function readRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) ?? []
  } catch {
    return []
  }
}
function rememberRecent(id) {
  recentIds.value = [id, ...recentIds.value.filter((existing) => existing !== id)].slice(
    0,
    MAX_RECENT,
  )
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds.value))
  } catch {
    // storage blocked — recent list lasts for this visit only
  }
}
</script>

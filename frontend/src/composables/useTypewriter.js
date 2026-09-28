import { ref, onMounted, onBeforeUnmount, toValue } from 'vue'

/**
 * useTypewriter — types a word, pauses, deletes it, then moves to the next word.
 * Used for the rotating role under your name on the Profile page.
 *
 * @param {string[] | import('vue').Ref<string[]> | () => string[]} words
 *        Phrases to cycle through. Can be reactive — e.g. roles that arrive from the API.
 * @param {object} timing  Milliseconds for typing, deleting and the pauses
 * @returns {{ text: import('vue').Ref<string> }}  The currently visible text
 */
export function useTypewriter(
  words,
  { typeSpeed = 100, deleteSpeed = 60, holdDelay = 1800, nextWordDelay = 400 } = {},
) {
  const text = ref('')
  let wordIndex = 0
  let charIndex = 0
  let isDeleting = false
  let timer = null

  function tick() {
    const list = (toValue(words) ?? []).filter(Boolean)
    if (!list.length) {
      text.value = ''
      timer = setTimeout(tick, 500) // wait for words to arrive
      return
    }
    const word = list[wordIndex % list.length]
    charIndex = Math.min(charIndex, word.length) // the word list may have changed
    charIndex += isDeleting ? -1 : 1
    text.value = word.substring(0, charIndex)

    let delay = isDeleting ? deleteSpeed : typeSpeed

    if (!isDeleting && charIndex >= word.length) {
      isDeleting = true // finished typing — hold, then start deleting
      delay = holdDelay
    } else if (isDeleting && charIndex <= 0) {
      isDeleting = false // finished deleting — move to next word
      wordIndex = (wordIndex + 1) % list.length
      delay = nextWordDelay
    }

    timer = setTimeout(tick, delay)
  }

  onMounted(tick)
  onBeforeUnmount(() => clearTimeout(timer))

  return { text }
}

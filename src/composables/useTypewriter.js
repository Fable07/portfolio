import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * useTypewriter — types a word, pauses, deletes it, then moves to the next word.
 * Used for the rotating role under your name on the Profile page.
 *
 * @param {string[]} words   Phrases to cycle through
 * @param {object}  timing  Milliseconds for typing, deleting and the pauses
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
    const word = words[wordIndex]
    charIndex += isDeleting ? -1 : 1
    text.value = word.substring(0, charIndex)

    let delay = isDeleting ? deleteSpeed : typeSpeed

    if (!isDeleting && charIndex === word.length) {
      isDeleting = true // finished typing — hold, then start deleting
      delay = holdDelay
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false // finished deleting — move to next word
      wordIndex = (wordIndex + 1) % words.length
      delay = nextWordDelay
    }

    timer = setTimeout(tick, delay)
  }

  onMounted(() => {
    if (words.length) tick()
  })
  onBeforeUnmount(() => clearTimeout(timer))

  return { text }
}

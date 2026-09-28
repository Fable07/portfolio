import { ref, onMounted } from 'vue'
import { visitorsApi } from '@/api'

const VISITOR_ID_KEY = 'portfolio:visitor_id'

/**
 * Anonymous visitor ID — a random UUID saved in the browser so the backend
 * counts each visitor once instead of once per page load.
 */
function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_ID_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID() // storage blocked — counted per visit instead
  }
}

/**
 * useVisitorCount — registers this visit and returns the total "profile views".
 * `count` stays 0 if the API is unreachable (the badge hides itself at 0).
 */
export function useVisitorCount() {
  const count = ref(0)

  onMounted(async () => {
    try {
      const data = await visitorsApi.increment(getVisitorId())
      count.value = data.count
    } catch {
      count.value = 0
    }
  })

  return { count }
}

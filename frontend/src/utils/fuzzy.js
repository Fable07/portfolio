/**
 * fuzzy.js — small fuzzy matcher used by the command palette (and terminal autocomplete).
 *
 * "Fuzzy" means the letters you type must appear in order, but not next to each other:
 *   "prj" matches "Projects", "gh" matches "GitHub".
 *
 * Scoring rewards (higher = better match):
 *   • exact prefix               "pro" → "Projects"
 *   • consecutive letters        "proj" beats "p-r-o-j" spread out
 *   • letters at word starts     "dr" → "Download Resume"
 * and lightly penalises long gaps.
 */

/**
 * @param {string} query  What the user typed
 * @param {string} text   Text to test
 * @returns {{ score: number, indexes: number[] } | null}  null when it doesn't match;
 *          `indexes` are the matched character positions (for highlighting)
 */
export function fuzzyMatch(query, text) {
  const q = query.trim().toLowerCase()
  const t = text.toLowerCase()
  if (!q) return { score: 0, indexes: [] }

  const indexes = []
  let score = 0
  let searchFrom = 0
  let previous = -2

  for (const char of q) {
    if (char === ' ') continue
    const found = t.indexOf(char, searchFrom)
    if (found === -1) return null

    const atWordStart = found === 0 || /[\s\-_/.]/.test(t[found - 1])
    score += 1
    if (found === previous + 1) score += 3 // consecutive
    if (atWordStart) score += 2
    score -= Math.min(found - searchFrom, 5) * 0.1 // gap penalty

    indexes.push(found)
    previous = found
    searchFrom = found + 1
  }

  if (t.startsWith(q)) score += 5
  return { score, indexes }
}

/**
 * Filter and sort items by best match across several text fields.
 *
 * @param {string} query
 * @param {object[]} items
 * @param {(item) => string[]} fields  Texts to match per item; the FIRST one is the
 *        display title, so its match indexes are returned for highlighting.
 * @returns {{ item, score, indexes }[]}
 */
export function fuzzyFilter(query, items, fields) {
  if (!query.trim()) return items.map((item) => ({ item, score: 0, indexes: [] }))

  const results = []
  for (const item of items) {
    const [title, ...rest] = fields(item)
    const titleMatch = fuzzyMatch(query, title)
    let best = titleMatch ? { score: titleMatch.score + 1, indexes: titleMatch.indexes } : null

    for (const extra of rest) {
      if (!extra) continue
      const match = fuzzyMatch(query, extra)
      if (match && (!best || match.score > best.score)) best = { score: match.score, indexes: [] }
    }
    if (best) results.push({ item, ...best })
  }
  return results.sort((a, b) => b.score - a.score)
}

/**
 * Split text into [{ text, match }] parts so matched letters can be highlighted.
 * highlightParts('Projects', [0, 1]) → [{text:'Pr', match:true}, {text:'ojects', match:false}]
 */
export function highlightParts(text, indexes) {
  if (!indexes?.length) return [{ text, match: false }]
  const set = new Set(indexes)
  const parts = []
  for (let i = 0; i < text.length; i++) {
    const match = set.has(i)
    const last = parts.at(-1)
    if (last && last.match === match) last.text += text[i]
    else parts.push({ text: text[i], match })
  }
  return parts
}

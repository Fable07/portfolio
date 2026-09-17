/**
 * output.js — building blocks for terminal output.
 *
 * Commands return an array of LINES; each line is an array of PARTS:
 *   { text, tone?, href?, to? }
 *     tone  'accent' | 'muted' | 'error' | 'success' | 'warn' | 'bold' (colour/weight)
 *     href  external link (opens in a new tab)
 *     to    in-app route, e.g. { name: 'projects' } (router link)
 *
 * Plain data (no HTML strings) keeps output safe to render and easy to unit test.
 */

export const text = (value, tone) => ({ text: String(value), tone })
export const accent = (value) => text(value, 'accent')
export const muted = (value) => text(value, 'muted')
export const bold = (value) => text(value, 'bold')
export const link = (value, href) => ({ text: String(value), href, tone: 'accent' })
export const routeLink = (value, to) => ({ text: String(value), to, tone: 'accent' })

/** One line made of parts; strings become plain text parts. */
export const line = (...parts) =>
  parts.map((part) => (typeof part === 'string' ? text(part) : part))

export const blank = () => line('')
export const error = (message) => [line(text(message, 'error'))]
export const success = (message) => [line(text(message, 'success'))]

/** Two-column list: rows of [left, right] with the left side padded to align. */
export function columns(rows, { gap = 2, leftTone = 'accent' } = {}) {
  const width = Math.max(0, ...rows.map(([left]) => String(left).length)) + gap
  return rows.map(([left, ...right]) =>
    line(
      text(String(left).padEnd(width), leftTone),
      ...right.map((r) => (typeof r === 'string' ? text(r) : r)),
    ),
  )
}

/** Plain text of a line — used by tests and the screen-reader live region. */
export const plain = (lineParts) => lineParts.map((part) => part.text).join('')

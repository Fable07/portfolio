/**
 * parser.js — turns a typed terminal line into a command name + arguments.
 *
 *   parseLine('project "Inventory App" --open')
 *   → { name: 'project', args: ['Inventory App'], flags: { open: true }, raw: '…' }
 *
 * Supports "double" / 'single' quotes and --flag or --flag=value.
 */
export function parseLine(line) {
  const tokens = tokenize(line)
  const [name = '', ...rest] = tokens
  const args = []
  const flags = {}

  for (const token of rest) {
    const flag = token.match(/^--([\w-]+)(?:=(.*))?$/)
    if (flag) flags[flag[1]] = flag[2] ?? true
    else args.push(token)
  }

  return { name: name.toLowerCase(), args, flags, raw: line }
}

/** Split on spaces, keeping quoted text together. */
export function tokenize(line) {
  const tokens = []
  let current = ''
  let quote = null
  let hasToken = false

  for (const char of line.trim()) {
    if (quote) {
      if (char === quote) quote = null
      else current += char
    } else if (char === '"' || char === "'") {
      quote = char
      hasToken = true
    } else if (/\s/.test(char)) {
      if (hasToken) tokens.push(current)
      current = ''
      hasToken = false
    } else {
      current += char
      hasToken = true
    }
  }
  if (hasToken) tokens.push(current)
  return tokens
}

/**
 * Tab completion: given the current input and candidate words, return the completed
 * input (longest common prefix) and the list of matches to show.
 *
 * @param {string} input
 * @param {(tokenIndex: number, tokens: string[]) => string[]} candidatesFor
 * @returns {{ value: string, matches: string[] }}
 */
export function complete(input, candidatesFor) {
  const endsWithSpace = /\s$/.test(input)
  const tokens = tokenize(input)
  if (endsWithSpace || tokens.length === 0) tokens.push('')

  const index = tokens.length - 1
  const partial = tokens[index].toLowerCase()
  const matches = candidatesFor(index, tokens).filter((word) =>
    word.toLowerCase().startsWith(partial),
  )
  if (matches.length === 0) return { value: input, matches }

  const prefix = commonPrefix(matches)
  const completedWord = matches.length === 1 ? matches[0] : prefix
  if (completedWord.length < partial.length) return { value: input, matches }

  const needsQuotes = /\s/.test(completedWord)
  const word = needsQuotes ? `"${completedWord}${matches.length === 1 ? '"' : ''}` : completedWord
  const before = tokens.slice(0, index).map((t) => (/\s/.test(t) ? `"${t}"` : t))
  const value = [...before, word].join(' ') + (matches.length === 1 ? ' ' : '')
  return { value, matches }
}

function commonPrefix(words) {
  let prefix = words[0]
  for (const word of words.slice(1)) {
    while (!word.toLowerCase().startsWith(prefix.toLowerCase())) prefix = prefix.slice(0, -1)
  }
  return prefix
}

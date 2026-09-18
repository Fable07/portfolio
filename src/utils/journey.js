/**
 * journey.js — merges education, work, certifications and projects into one timeline.
 *
 * Dates in this project are free text ("2025", "Jun 2020", "Jan – Mar 2026", "Present"),
 * so they're parsed loosely into { year, month } for sorting and grouping. Anything
 * unparseable is kept but sorted last, never dropped.
 *
 * Used by the /journey page and the terminal's `journey` command.
 */

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

/**
 * "Jun 2020" → { year: 2020, month: 6 } · "2025" → { year: 2025, month: null }
 * "Present" → { present: true } · unknown → null
 */
export function parseLooseDate(value) {
  const text = String(value ?? '')
    .trim()
    .toLowerCase()
  if (!text) return null
  if (/^(present|now|current|ongoing)$/.test(text))
    return { year: null, month: null, present: true }

  const year = text.match(/(19|20)\d{2}/)?.[0]
  if (!year) return null

  // Month name (jan, june…) or a numeric form like 2025-03 / 03/2025
  const monthName = MONTHS.findIndex((name) => new RegExp(`\\b${name.slice(0, 3)}`).test(text)) + 1
  const numeric = text.match(
    /(?:^|[^\d])(0?[1-9]|1[0-2])[/-](?:19|20)\d{2}|(?:19|20)\d{2}[/-](0?[1-9]|1[0-2])/,
  )
  const month = monthName || Number(numeric?.[1] ?? numeric?.[2]) || null

  return { year: Number(year), month, present: false }
}

/** Sortable number for a parsed date — "Present" sorts newest, unknown sorts oldest. */
export function dateRank(parsed) {
  if (!parsed) return -1
  if (parsed.present) return Number.MAX_SAFE_INTEGER
  return parsed.year * 100 + (parsed.month ?? 0)
}

export const JOURNEY_KINDS = [
  { key: 'education', label: 'Education', icon: '🎓' },
  { key: 'work', label: 'Work', icon: '💼' },
  { key: 'certification', label: 'Certifications', icon: '🏅' },
  { key: 'project', label: 'Projects', icon: '🚀' },
]

/** A project's date: the case study period if given, otherwise when it was created. */
function projectDate(project) {
  return project.case_study?.period || project.created_at || ''
}

/**
 * Build the journey.
 *
 * @param {object} input  { timeline, certifications, projects }  (published items)
 * @returns {{ items: Array, years: Array, counts: object }}
 *   item: { id, kind, icon, title, subtitle, dateLabel, rank, year, description, to, href }
 *   years: [{ year, items }] newest first ('Undated' last)
 */
export function buildJourney({ timeline = [], certifications = [], projects = [] } = {}) {
  const items = [
    ...timeline.map((entry) => {
      const start = parseLooseDate(entry.start_date)
      const kind = entry.type === 'education' ? 'education' : 'work'
      return {
        id: `t${entry.id}`,
        kind,
        icon: kind === 'education' ? '🎓' : '💼',
        title: entry.title,
        subtitle: entry.institution,
        dateLabel: `${entry.start_date}${entry.end_date || entry.end_date === '' ? ` — ${entry.end_date || 'Present'}` : ''}`,
        description: entry.description,
        location: entry.location,
        rank: dateRank(start),
        year: start?.year ?? null,
      }
    }),
    ...certifications.map((certification) => {
      const date = parseLooseDate(certification.date)
      return {
        id: `c${certification.id}`,
        kind: 'certification',
        icon: '🏅',
        title: certification.title,
        subtitle: certification.issuer,
        dateLabel: certification.date || '',
        href: certification.credential_url,
        rank: dateRank(date),
        year: date?.year ?? null,
      }
    }),
    ...projects.map((project) => {
      const date = parseLooseDate(projectDate(project))
      return {
        id: `p${project.id}`,
        kind: 'project',
        icon: '🚀',
        title: project.title,
        subtitle: project.tech_stack,
        dateLabel: project.case_study?.period || (date?.year ? String(date.year) : ''),
        description: project.description,
        to: { name: 'project-detail', params: { id: project.id } },
        rank: dateRank(date),
        year: date?.year ?? null,
      }
    }),
  ].sort((a, b) => b.rank - a.rank || a.title.localeCompare(b.title))

  // Group by year, newest first; undated items go last
  const byYear = new Map()
  for (const item of items) {
    const key = item.year ?? 'Undated'
    if (!byYear.has(key)) byYear.set(key, [])
    byYear.get(key).push(item)
  }
  const years = [...byYear.entries()]
    .sort(([a], [b]) => (a === 'Undated' ? 1 : b === 'Undated' ? -1 : b - a))
    .map(([year, yearItems]) => ({ year, items: yearItems }))

  const counts = Object.fromEntries(
    JOURNEY_KINDS.map(({ key }) => [key, items.filter((item) => item.kind === key).length]),
  )

  return { items, years, counts }
}

import { describe, expect, it } from 'vitest'
import { buildJourney, dateRank, parseLooseDate } from '../journey'

describe('parseLooseDate', () => {
  it('reads years, month names and numeric forms', () => {
    expect(parseLooseDate('2025')).toMatchObject({ year: 2025, month: null })
    expect(parseLooseDate('Jun 2020')).toMatchObject({ year: 2020, month: 6 })
    expect(parseLooseDate('January 2025')).toMatchObject({ year: 2025, month: 1 })
    expect(parseLooseDate('2025-03')).toMatchObject({ year: 2025, month: 3 })
  })

  it('handles "Present" and unknown text', () => {
    expect(parseLooseDate('Present')).toMatchObject({ present: true })
    expect(parseLooseDate('someday')).toBeNull()
    expect(parseLooseDate('')).toBeNull()
  })

  it('ranks newest first, with Present on top and unknown last', () => {
    expect(dateRank(parseLooseDate('Present'))).toBeGreaterThan(
      dateRank(parseLooseDate('Dec 2025')),
    )
    expect(dateRank(parseLooseDate('Jun 2025'))).toBeGreaterThan(dateRank(parseLooseDate('2025')))
    expect(dateRank(parseLooseDate('nope'))).toBe(-1)
  })
})

describe('buildJourney', () => {
  const journey = buildJourney({
    timeline: [
      {
        id: 1,
        type: 'education',
        title: 'BS IT',
        institution: 'New Era University',
        start_date: '2019',
        end_date: '2025',
      },
      {
        id: 2,
        type: 'work',
        title: 'Intern',
        institution: 'Simplevia',
        start_date: 'Nov 2024',
        end_date: 'Feb 2025',
      },
    ],
    certifications: [
      {
        id: 3,
        title: 'AWS Practitioner',
        issuer: 'AWS',
        date: 'Mar 2025',
        credential_url: 'https://aws',
      },
    ],
    projects: [
      { id: 4, title: 'Portfolio', tech_stack: 'Vue', case_study: { period: 'Jan – Mar 2026' } },
      { id: 5, title: 'Older app', tech_stack: 'Flutter', created_at: '2023-07-01T00:00:00Z' },
    ],
  })

  it('merges every source into one list', () => {
    expect(journey.items).toHaveLength(5)
    expect(journey.counts).toEqual({ education: 1, work: 1, certification: 1, project: 2 })
  })

  it('sorts newest first', () => {
    expect(journey.items.map((item) => item.title)).toEqual([
      'Portfolio', // Jan 2026
      'AWS Practitioner', // Mar 2025
      'Intern', // Nov 2024
      'Older app', // 2023 (from created_at)
      'BS IT', // 2019
    ])
  })

  it('groups by year, newest year first', () => {
    expect(journey.years.map((group) => group.year)).toEqual([2026, 2025, 2024, 2023, 2019])
    expect(journey.years[0].items[0].title).toBe('Portfolio')
  })

  it('keeps links and labels for each kind', () => {
    const [project, certification] = journey.items
    expect(project.to).toEqual({ name: 'project-detail', params: { id: 4 } })
    expect(project.dateLabel).toBe('Jan – Mar 2026')
    expect(certification.href).toBe('https://aws')
    expect(journey.items.at(-1).dateLabel).toBe('2019 — 2025')
  })

  it('keeps undated items instead of dropping them', () => {
    const { items, years } = buildJourney({ projects: [{ id: 9, title: 'No date' }] })
    expect(items).toHaveLength(1)
    expect(years[0].year).toBe('Undated')
  })

  it('handles empty input', () => {
    expect(buildJourney().items).toEqual([])
  })
})

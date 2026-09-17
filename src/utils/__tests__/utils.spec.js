import { describe, expect, it } from 'vitest'
import { fuzzyFilter, fuzzyMatch, highlightParts } from '../fuzzy'
import { countByType, formatBytes, mediaList, projectCover } from '../media'

describe('fuzzy', () => {
  it('matches letters in order', () => {
    expect(fuzzyMatch('prj', 'Projects')).not.toBeNull()
    expect(fuzzyMatch('jrp', 'Projects')).toBeNull()
  })

  it('ranks prefixes and word starts higher', () => {
    const results = fuzzyFilter('dr', ['Address Book', 'Download Resume'], (title) => [title])
    expect(results[0].item).toBe('Download Resume')
  })

  it('matches secondary keywords without highlighting the title', () => {
    const items = [{ title: 'Toggle theme', keywords: 'dark light mode' }]
    const [result] = fuzzyFilter('dark', items, (item) => [item.title, item.keywords])
    expect(result.item.title).toBe('Toggle theme')
    expect(result.indexes).toEqual([])
  })

  it('splits highlight parts', () => {
    expect(highlightParts('Projects', [0, 1])).toEqual([
      { text: 'Pr', match: true },
      { text: 'ojects', match: false },
    ])
  })
})

describe('media helpers', () => {
  const gallery = [
    { type: 'embed', thumbnail_url: 'https://i.ytimg.com/x.jpg' },
    { type: 'image', url: 'https://cdn/x.png' },
    { type: 'video', url: 'https://cdn/x.mp4' },
  ]

  it('normalises single items, arrays and null', () => {
    expect(mediaList(null)).toEqual([])
    expect(mediaList({ type: 'image' })).toHaveLength(1)
    expect(mediaList(gallery)).toHaveLength(3)
  })

  it('picks the first image as project cover, with fallbacks', () => {
    expect(projectCover({ media: gallery })).toBe('https://cdn/x.png')
    expect(projectCover({ media: [gallery[0]] })).toBe('https://i.ytimg.com/x.jpg')
    expect(projectCover({ media: null, thumbnail_url: '/old.png' })).toBe('/old.png')
  })

  it('counts and formats', () => {
    expect(countByType(gallery)).toEqual({ image: 1, video: 1, embed: 1, document: 0 })
    expect(formatBytes(48213)).toBe('47.1 KB')
    expect(formatBytes(0)).toBe('')
  })
})

import { describe, expect, it } from 'vitest'
import {
  buildSkillGraph,
  findSkill,
  normalizeSkill,
  tagMatchesSkill,
  topSkills,
} from '../skillGraph'

const input = {
  skillGroups: [
    {
      title: 'Frameworks',
      skills: [
        { name: 'Vue JS', iconUrl: '/vue.png' },
        { name: 'React', iconUrl: '/react.png' },
        { name: 'React Native', iconUrl: '/rn.png' },
        { name: 'Laravel', iconUrl: '/laravel.png' },
      ],
    },
    { title: 'Languages', skills: [{ name: 'C++' }, { name: 'Javascript' }] },
  ],
  projects: [
    { id: 1, title: 'Portfolio', tech_stack: 'vue, Laravel, PostgreSQL' },
    { id: 2, title: 'Mobile app', tech_stack: 'React Native, Firebase' },
    { id: 3, title: 'Game', tech_stack: 'C++' },
    { id: 4, title: 'No stack', tech_stack: '' },
  ],
  certifications: [
    { id: 10, title: 'Vue.js Developer', issuer: 'Vue School' },
    { id: 11, title: 'Cloud Practitioner', issuer: 'AWS' },
  ],
}

describe('normalizeSkill', () => {
  it('ignores case, spaces, dots and symbols', () => {
    expect(normalizeSkill('Node JS')).toBe(normalizeSkill('node.js'))
    expect(normalizeSkill('C++')).toBe('cpp')
    expect(normalizeSkill('C#')).toBe('csharp')
  })

  it('maps known aliases but keeps different skills apart', () => {
    expect(normalizeSkill('vue')).toBe(normalizeSkill('Vue JS'))
    expect(normalizeSkill('JS')).toBe(normalizeSkill('Javascript'))
    expect(normalizeSkill('React Native')).not.toBe(normalizeSkill('React'))
  })

  it('compares tags to skills', () => {
    expect(tagMatchesSkill('postgres', 'PostgreSQL')).toBe(true)
    expect(tagMatchesSkill('Flutter', 'React')).toBe(false)
  })
})

describe('buildSkillGraph', () => {
  const graph = buildSkillGraph(input)
  const skill = (name) => findSkill(graph, name)

  it('links projects through spelling differences', () => {
    expect(skill('Vue JS').projects.map((p) => p.title)).toEqual(['Portfolio'])
    expect(skill('C++').projects.map((p) => p.id)).toEqual([3])
  })

  it('does not confuse React with React Native', () => {
    expect(skill('React').projects).toHaveLength(0)
    expect(skill('React Native').projects.map((p) => p.id)).toEqual([2])
  })

  it('matches certifications by title and issuer text', () => {
    expect(skill('Vue JS').certifications.map((c) => c.id)).toEqual([10])
    expect(skill('Laravel').certifications).toHaveLength(0)
  })

  it('adds project tags that are not listed as skills', () => {
    const extras = graph.groups.at(-1)
    expect(extras.title).toBe('From projects')
    expect(extras.skills.map((s) => s.name)).toEqual(['Firebase', 'PostgreSQL'])
  })

  it('counts links and ranks the most connected skills', () => {
    expect(skill('Vue JS').linkCount).toBe(2) // 1 project + 1 certification
    expect(topSkills(graph, 2).map((s) => s.name)).toEqual(['Vue JS', 'C++'])
    expect(graph.totalLinks).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const empty = buildSkillGraph()
    expect(empty.skills).toEqual([])
    expect(findSkill(empty, 'Vue')).toBeNull()
  })
})

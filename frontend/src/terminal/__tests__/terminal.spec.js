import { describe, expect, it, vi } from 'vitest'
import { complete, parseLine, tokenize } from '../parser'
import { findCommand, runCommand } from '../commands'
import { plain } from '../output'
import { buildSkillGraph } from '@/utils/skillGraph'

/** Fake ctx — the same shape TerminalView passes to commands. */
function makeCtx(overrides = {}) {
  let theme = 'dark'
  return {
    profile: {
      name: 'Jefferson S. Caragay',
      roles: ['Aspiring Fullstack Developer'],
      about: ['I build modern web experiences.'],
    },
    skillGroups: [
      { title: 'Programming Languages', skills: [{ name: 'Java' }, { name: 'PHP' }] },
      { title: 'Frameworks', skills: [{ name: 'Vue JS' }] },
    ],
    socialLinks: [
      { label: 'GitHub', href: 'https://github.com/Fable07' },
      { label: 'Email', href: 'mailto:me@example.com' },
    ],
    pages: [
      { name: 'profile', path: '', label: 'Profile' },
      { name: 'projects', path: 'projects', label: 'Projects' },
    ],
    data: {
      projects: async () => [
        {
          id: 7,
          title: 'Portfolio Website',
          tech_stack: 'Vue, Laravel',
          media: [{ type: 'image' }],
        },
        { id: 9, title: 'Inventory App', tech_stack: 'Flutter' },
      ],
      certifications: async () => [],
      hobbies: async () => [],
      timeline: async () => [],
      resumeUrl: async () => '/resume.pdf',
      skillGraph: async () =>
        buildSkillGraph({
          skillGroups: [{ title: 'Frameworks', skills: [{ name: 'Vue JS' }, { name: 'Flutter' }] }],
          projects: [
            { id: 7, title: 'Portfolio Website', tech_stack: 'Vue, Laravel' },
            { id: 9, title: 'Inventory App', tech_stack: 'Flutter' },
          ],
          certifications: [{ id: 3, title: 'Vue.js Developer', issuer: 'Vue School' }],
        }),
    },
    navigate: vi.fn(),
    openUrl: vi.fn(),
    theme: { current: () => theme, set: (value) => (theme = value) },
    history: () => ['whoami'],
    clear: vi.fn(),
    exit: vi.fn(),
    ...overrides,
  }
}

const textOf = (lines) => lines.map(plain).join('\n')

describe('parser', () => {
  it('splits arguments, quotes and flags', () => {
    expect(parseLine('Project "Inventory App" --open --tag=Vue')).toEqual({
      name: 'project',
      args: ['Inventory App'],
      flags: { open: true, tag: 'Vue' },
      raw: 'Project "Inventory App" --open --tag=Vue',
    })
    expect(tokenize("echo 'a b'  c")).toEqual(['echo', 'a b', 'c'])
    expect(tokenize('echo ""')).toEqual(['echo', ''])
  })

  it('completes to the longest common prefix', () => {
    const words = () => ['projects', 'project', 'profile']
    expect(complete('pro', words)).toEqual({ value: 'pro', matches: words() })
    expect(complete('projec', () => ['projects', 'project'])).toMatchObject({ value: 'project' })
    expect(complete('whoa', () => ['whoami'])).toEqual({ value: 'whoami ', matches: ['whoami'] })
    expect(complete('project Inv', (i) => (i === 1 ? ['Inventory App'] : []))).toMatchObject({
      value: 'project "Inventory App" ',
    })
  })
})

describe('commands', () => {
  it('whoami prints the name and roles', async () => {
    expect(textOf(await runCommand('whoami', makeCtx()))).toContain('Jefferson S. Caragay')
  })

  it('finds commands by alias', () => {
    expect(findCommand('cv').name).toBe('resume')
    expect(findCommand('GUI').name).toBe('exit')
  })

  it('suggests a command on typos', async () => {
    const output = textOf(await runCommand('whoamii', makeCtx()))
    expect(output).toContain('command not found: whoamii')
    expect(output).toContain('Did you mean `whoami`?')
  })

  it('lists projects with route links and filters by tag', async () => {
    const lines = await runCommand('projects --tag=flutter', makeCtx())
    expect(textOf(lines)).toContain('Inventory App')
    expect(textOf(lines)).not.toContain('Portfolio Website')
    const linkPart = lines[0].find((part) => part.to)
    expect(linkPart.to).toEqual({ name: 'project-detail', params: { id: 9 } })
  })

  it('project resolves by number and by fuzzy name', async () => {
    expect(textOf(await runCommand('project 1', makeCtx()))).toContain('Portfolio Website')
    const byName = textOf(await runCommand('project inventory', makeCtx()))
    expect(byName).toContain('Inventory App')
    expect(textOf(await runCommand('project 1', makeCtx()))).toContain('1 image')
    expect(textOf(await runCommand('project zzz', makeCtx()))).toContain('nothing matches')
  })

  it('open navigates to pages and opens social links', async () => {
    const ctx = makeCtx()
    await runCommand('open projects', ctx)
    expect(ctx.navigate).toHaveBeenCalledWith({ name: 'projects' })
    await runCommand('cd github', ctx)
    expect(ctx.openUrl).toHaveBeenCalledWith('https://github.com/Fable07')
  })

  it('theme switches and validates', async () => {
    const ctx = makeCtx()
    await runCommand('theme light', ctx)
    expect(ctx.theme.current()).toBe('light')
    expect(textOf(await runCommand('theme purple', ctx))).toContain('usage')
  })

  it('ls <section> delegates to that command', async () => {
    expect(textOf(await runCommand('ls skills', makeCtx()))).toContain('Vue JS')
  })

  it('clear and exit call the ctx hooks', async () => {
    const ctx = makeCtx()
    await runCommand('clear', ctx)
    await runCommand('exit', ctx)
    expect(ctx.clear).toHaveBeenCalled()
    expect(ctx.exit).toHaveBeenCalled()
  })

  it('turns thrown errors into output instead of crashing', async () => {
    const ctx = makeCtx({
      data: { ...makeCtx().data, projects: () => Promise.reject(new Error('offline')) },
    })
    expect(textOf(await runCommand('projects', ctx))).toBe('projects: offline')
  })
})

describe('skill command', () => {
  it('lists the projects and certifications behind a skill', async () => {
    const output = textOf(await runCommand('skill vue', makeCtx()))
    expect(output).toContain('Vue JS')
    expect(output).toContain('Portfolio Website') // tagged "Vue", matched through the alias
    expect(output).toContain('Vue.js Developer') // certification matched by title
    expect(output).toContain('/skills?skill=Vue JS')
  })

  it('says so when a skill is not used yet, and suggests close matches', async () => {
    expect(textOf(await runCommand('skill flutter', makeCtx()))).toContain('Inventory App')
    expect(textOf(await runCommand('skill fluttr', makeCtx()))).toContain('Inventory App')
    expect(textOf(await runCommand('skill zzz', makeCtx()))).toContain('nothing matches')
  })

  it('requires a name', async () => {
    expect(textOf(await runCommand('skill', makeCtx()))).toContain('usage: skill <name>')
  })
})

import { fuzzyMatch } from '@/utils/fuzzy'
import { countByType } from '@/utils/media'
import { findSkill } from '@/utils/skillGraph'
import { parseLine } from './parser'
import {
  accent,
  blank,
  bold,
  columns,
  error,
  line,
  link,
  muted,
  routeLink,
  success,
  text,
} from './output'

/**
 * Terminal command registry.
 *
 * Each command:
 *   name      what you type
 *   aliases   other names that run it
 *   summary   one line for `help`
 *   usage     argument hint for `help <command>`
 *   complete  (argIndex, ctx) => string[]   Tab-completion words for arguments
 *   run       (parsed, ctx) => lines | Promise<lines>
 *
 * `ctx` is everything a command may use, passed in by TerminalView (so commands
 * can be unit tested with a fake ctx):
 *   profile, skillGroups, socialLinks, pages,
 *   data.{projects, certifications, hobbies, timeline, resumeUrl, skillGraph, journey}()  → Promise
 *   navigate(to), openUrl(url), theme.{current(), set(name)}, history(), clear(), exit()
 *
 * To add a command: push an object into `commands` below — help and Tab completion
 * pick it up automatically.
 */

const splitTags = (stack) =>
  (stack || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

/** Closest skill by name when the exact/alias lookup finds nothing. */
function bestSkillMatch(graph, query) {
  let best = null
  for (const skill of graph.skills) {
    const match = fuzzyMatch(query, skill.name)
    if (match && (!best || match.score > best.score)) best = { skill, score: match.score }
  }
  return best?.skill ?? null
}

/** Find a project by list number ("2") or (fuzzy) name ("inventory"). */
function findProject(projects, query) {
  const number = Number(query)
  if (Number.isInteger(number) && number >= 1) return projects[number - 1] ?? null

  let best = null
  for (const project of projects) {
    const match = fuzzyMatch(query, project.title)
    if (match && (!best || match.score > best.score)) best = { project, score: match.score }
  }
  return best?.project ?? null
}

export const commands = [
  {
    name: 'help',
    aliases: ['?', 'commands'],
    summary: 'List commands, or explain one: help <command>',
    usage: '[command]',
    complete: () => commands.map((command) => command.name),
    run({ args }) {
      if (args[0]) {
        const command = findCommand(args[0])
        if (!command) return error(`help: no such command "${args[0]}"`)
        return [
          line(bold(command.name), muted(command.usage ? ` ${command.usage}` : '')),
          line('  ', command.summary),
          ...(command.aliases?.length
            ? [line('  ', muted(`aliases: ${command.aliases.join(', ')}`))]
            : []),
        ]
      }
      return [
        line(muted('Available commands (Tab completes, ↑/↓ browses history):')),
        blank(),
        ...columns(commands.map((command) => [command.name, command.summary])),
      ]
    },
  },
  {
    name: 'whoami',
    summary: 'Who is behind this portfolio',
    run: (_, { profile }) => [
      line(bold(profile.name)),
      ...profile.roles.map((role) => line(accent('› '), role)),
    ],
  },
  {
    name: 'about',
    summary: 'A short introduction',
    run: (_, { profile }) => profile.about.map((paragraph) => line(paragraph)),
  },
  {
    name: 'ls',
    aliases: ['pages'],
    summary: 'List pages (ls projects | certs | hobbies | skills also work)',
    usage: '[section]',
    complete: () => ['projects', 'certs', 'hobbies', 'skills', 'experience'],
    run(parsed, ctx) {
      const section = parsed.args[0]
      if (section) {
        const target = findCommand(section === 'certifications' ? 'certs' : section)
        if (!target || target.name === 'ls') return error(`ls: cannot access '${section}'`)
        return target.run({ ...parsed, args: parsed.args.slice(1) }, ctx)
      }
      return columns(
        ctx.pages.map((page) => [page.name, routeLink(`/${page.path}`, { name: page.name })]),
      )
    },
  },
  {
    name: 'skills',
    aliases: ['stack'],
    summary: 'Languages, frameworks and tools',
    usage: '[group]',
    complete: (_, { skillGroups }) =>
      skillGroups.map((group) => group.title.split(' ')[0].toLowerCase()),
    run({ args }, { skillGroups }) {
      const groups = args[0]
        ? skillGroups.filter((group) => group.title.toLowerCase().startsWith(args[0].toLowerCase()))
        : skillGroups
      if (!groups.length) return error(`skills: no group "${args[0]}"`)
      return groups.flatMap((group) => [
        line(bold(group.title)),
        line(muted('  '), group.skills.map((skill) => skill.name).join(' · ')),
      ])
    },
  },
  {
    name: 'skill',
    summary: 'Where one skill was used: skill vue',
    usage: '<name>',
    async complete(_, { data }) {
      return (await data.skillGraph()).skills.map((skill) => skill.name)
    },
    async run({ args }, { data }) {
      if (!args.length) return error('usage: skill <name>   (try `skills` for the full list)')

      const query = args.join(' ')
      const graph = await data.skillGraph()
      const skill = findSkill(graph, query) ?? bestSkillMatch(graph, query)
      if (!skill) return error(`skill: nothing matches "${query}" — try \`skills\``)

      return [
        line(bold(skill.name), muted(`  ${skill.group}`)),
        blank(),
        ...(skill.projects.length
          ? skill.projects.map((project) =>
              line(
                accent(' 🚀 '),
                routeLink(project.title, { name: 'project-detail', params: { id: project.id } }),
              ),
            )
          : [line(muted(' No projects use it yet.'))]),
        ...skill.certifications.map((certification) =>
          line(
            accent(' 🏅 '),
            certification.credential_url
              ? link(certification.title, certification.credential_url)
              : text(certification.title),
          ),
        ),
        blank(),
        line(
          muted('Graph: '),
          routeLink(`/skills?skill=${skill.name}`, {
            name: 'skills',
            query: { skill: skill.name },
          }),
        ),
      ]
    },
  },
  {
    name: 'projects',
    summary: 'List projects (filter: projects --tag=Vue)',
    usage: '[--tag=<tech>]',
    async run({ flags }, { data }) {
      let projects = await data.projects()
      if (typeof flags.tag === 'string') {
        const tag = flags.tag.toLowerCase()
        projects = projects.filter((p) =>
          splitTags(p.tech_stack).some((t) => t.toLowerCase() === tag),
        )
      }
      if (!projects.length) return [line(muted('No projects found.'))]
      return [
        ...projects.map((project, index) =>
          line(
            accent(`${String(index + 1).padStart(2)}. `),
            routeLink(project.title, { name: 'project-detail', params: { id: project.id } }),
            muted(project.tech_stack ? `  — ${project.tech_stack}` : ''),
          ),
        ),
        blank(),
        line(muted('Details: project <number|name>')),
      ]
    },
  },
  {
    name: 'project',
    summary: 'Show one project: project 1  or  project inventory',
    usage: '<number|name>',
    async complete(_, { data }) {
      return (await data.projects()).map((project) => project.title)
    },
    async run({ args }, { data }) {
      if (!args.length) return error('usage: project <number|name>')
      const project = findProject(await data.projects(), args.join(' '))
      if (!project) return error(`project: nothing matches "${args.join(' ')}" — try \`projects\``)

      const media = countByType(project.media)
      const mediaSummary = [
        media.image && `${media.image} image${media.image > 1 ? 's' : ''}`,
        media.video + media.embed &&
          `${media.video + media.embed} video${media.video + media.embed > 1 ? 's' : ''}`,
      ].filter(Boolean)

      return [
        line(bold(project.title)),
        ...(project.description ? [line(project.description)] : []),
        blank(),
        ...columns(
          [
            project.tech_stack && ['stack', project.tech_stack],
            mediaSummary.length && ['media', mediaSummary.join(', ')],
            project.project_url && ['live', link(project.project_url, project.project_url)],
            project.github_url && ['code', link(project.github_url, project.github_url)],
            [
              'page',
              routeLink(`/projects/${project.id}`, {
                name: 'project-detail',
                params: { id: project.id },
              }),
            ],
          ].filter(Boolean),
        ),
      ]
    },
  },
  {
    name: 'certs',
    aliases: ['certifications'],
    summary: 'Certifications',
    async run(_, { data }) {
      const certs = await data.certifications()
      if (!certs.length) return [line(muted('No certifications yet.'))]
      return certs.map((cert) =>
        line(
          accent('✔ '),
          cert.credential_url ? link(cert.title, cert.credential_url) : bold(cert.title),
          muted(
            [cert.issuer, cert.date]
              .filter(Boolean)
              .map((v) => `  ${v}`)
              .join(' ·'),
          ),
        ),
      )
    },
  },
  {
    name: 'experience',
    aliases: ['timeline', 'education'],
    summary: 'Education & work timeline',
    async run(_, { data }) {
      const entries = await data.timeline()
      if (!entries.length) return [line(muted('No timeline entries yet.'))]
      return entries.flatMap((entry) => [
        line(
          accent(entry.type === 'education' ? '🎓 ' : '💼 '),
          bold(entry.title),
          muted(` @ ${entry.institution}`),
        ),
        line(
          muted(
            `   ${entry.start_date} — ${entry.end_date || 'Present'}${entry.location ? ` · ${entry.location}` : ''}`,
          ),
        ),
      ])
    },
  },
  {
    name: 'journey',
    aliases: ['history-of-me'],
    summary: 'Everything in order: studies, work, certifications, projects',
    usage: '[education|work|certification|project]',
    complete: () => ['education', 'work', 'certification', 'project'],
    async run({ args }, { data }) {
      const journey = await data.journey()
      const kind = args[0]?.toLowerCase().replace(/s$/, '')
      const years = journey.years
        .map((group) => ({
          ...group,
          items: kind ? group.items.filter((item) => item.kind === kind) : group.items,
        }))
        .filter((group) => group.items.length)

      if (!years.length)
        return [line(muted(kind ? `Nothing of kind "${kind}" yet.` : 'Timeline is empty.'))]

      return [
        ...years.flatMap((group) => [
          line(bold(String(group.year))),
          ...group.items.map((item) =>
            line(
              text(` ${item.icon} `),
              item.to
                ? routeLink(item.title, item.to)
                : item.href
                  ? link(item.title, item.href)
                  : text(item.title),
              muted(item.subtitle ? `  ${item.subtitle}` : ''),
              muted(item.dateLabel ? `  (${item.dateLabel})` : ''),
            ),
          ),
          blank(),
        ]),
        line(muted('Full page: '), routeLink('/journey', { name: 'journey' })),
      ]
    },
  },
  {
    name: 'hobbies',
    summary: 'What I do for fun',
    async run(_, { data }) {
      const hobbies = await data.hobbies()
      if (!hobbies.length) return [line(muted('No hobbies yet.'))]
      return hobbies.map((hobby) =>
        line(
          text(`${hobby.icon || '🎯'} `),
          bold(hobby.name),
          muted(hobby.description ? `  ${hobby.description}` : ''),
        ),
      )
    },
  },
  {
    name: 'resume',
    aliases: ['cv'],
    summary: 'Get my resume (PDF)',
    async run(_, { data }) {
      const url = await data.resumeUrl()
      return [
        line('📄 ', url ? link('Open resume PDF', url) : muted('Resume not available.')),
        line(muted('Full page: '), routeLink('/resume', { name: 'resume' })),
      ]
    },
  },
  {
    name: 'contact',
    aliases: ['socials', 'social'],
    summary: 'Email and social links',
    run: (_, { socialLinks }) => [
      line(
        muted('Message me straight from the site: '),
        routeLink('/contact', { name: 'contact' }),
      ),
      blank(),
      ...columns(
        socialLinks.map((social) => [
          social.label.toLowerCase(),
          link(social.href.replace(/^mailto:/, ''), social.href),
        ]),
      ),
    ],
  },
  {
    name: 'open',
    aliases: ['cd', 'goto'],
    summary: 'Open a page or link: open projects | open github',
    usage: '<page|social|resume>',
    complete: (_, { pages, socialLinks }) => [
      ...pages.map((page) => page.name),
      ...socialLinks.map((social) => social.label.toLowerCase()),
      'resume-pdf',
      '~',
    ],
    async run({ args }, ctx) {
      const target = (args[0] || '').toLowerCase()
      if (!target) return error('usage: open <page|social>')

      if (target === '~' || target === 'home' || target === '/') {
        ctx.navigate({ name: 'profile' })
        return success('→ Profile')
      }
      const page = ctx.pages.find((p) => p.name === target || p.path === target.replace(/^\//, ''))
      if (page) {
        ctx.navigate({ name: page.name })
        return success(`→ ${page.label}`)
      }
      const social = ctx.socialLinks.find((s) => s.label.toLowerCase() === target)
      if (social) {
        ctx.openUrl(social.href)
        return success(`Opening ${social.label}…`)
      }
      if (target === 'resume-pdf') {
        const url = await ctx.data.resumeUrl()
        if (!url) return error('Resume not available.')
        ctx.openUrl(url)
        return success('Opening resume PDF…')
      }
      return error(`open: unknown target "${target}" — try \`ls\` or \`contact\``)
    },
  },
  {
    name: 'theme',
    summary: 'Switch colour theme: theme dark | light',
    usage: '[dark|light]',
    complete: () => ['dark', 'light'],
    run({ args }, { theme }) {
      const wanted = args[0]?.toLowerCase()
      if (!wanted) return [line('Current theme: ', accent(theme.current()))]
      if (!['dark', 'light'].includes(wanted)) return error('usage: theme dark | light')
      theme.set(wanted)
      return success(`Theme set to ${wanted}.`)
    },
  },
  {
    name: 'history',
    summary: 'Commands you ran this session',
    run: (_, { history }) => {
      const items = history()
      return items.length
        ? items.map((entry, index) => line(muted(String(index + 1).padStart(3) + '  '), entry))
        : [line(muted('No history yet.'))]
    },
  },
  {
    name: 'echo',
    summary: 'Print text',
    usage: '<text>',
    run: ({ args }) => [line(args.join(' '))],
  },
  {
    name: 'date',
    summary: 'Current date and time',
    run: () => [line(new Date().toString())],
  },
  {
    name: 'banner',
    aliases: ['neofetch'],
    summary: 'Show the welcome banner',
    run: (_, ctx) => welcomeLines(ctx),
  },
  {
    name: 'sudo',
    summary: 'Try it',
    run: ({ raw }) =>
      /hire/i.test(raw)
        ? [
            line(text('Permission granted. ', 'success'), 'Let’s talk → '),
            line(muted('run `contact`')),
          ]
        : error('Nice try. This incident will be reported. 🙂'),
  },
  {
    name: 'clear',
    aliases: ['cls'],
    summary: 'Clear the screen (Ctrl+L)',
    run: (_, { clear }) => {
      clear()
      return []
    },
  },
  {
    name: 'exit',
    aliases: ['gui', 'quit', 'q'],
    summary: 'Leave terminal mode and return to the site',
    run: (_, { exit }) => {
      exit()
      return success('Bye! 👋')
    },
  },
]

/** Look up a command by name or alias. */
export function findCommand(name) {
  const lower = name.toLowerCase()
  return (
    commands.find((command) => command.name === lower || command.aliases?.includes(lower)) ?? null
  )
}

/** Every name + alias, for "did you mean" and Tab completion. */
export const commandNames = () =>
  commands.flatMap((command) => [command.name, ...(command.aliases ?? [])])

/** Parse and run one input line. Never throws — errors become red output lines. */
export async function runCommand(input, ctx) {
  const parsed = parseLine(input)
  if (!parsed.name) return []

  const command = findCommand(parsed.name)
  if (!command) {
    // Closest name by edit distance (handles extra, missing and swapped letters)
    const suggestion = commandNames()
      .map((name) => ({ name, distance: editDistance(parsed.name, name) }))
      .filter((entry) => entry.distance <= 2)
      .sort((a, b) => a.distance - b.distance)[0]
    return [
      line(text(`command not found: ${parsed.name}`, 'error')),
      line(
        muted(suggestion ? `Did you mean \`${suggestion.name}\`? ` : ''),
        muted('Type `help` for a list.'),
      ),
    ]
  }

  try {
    return await command.run(parsed, ctx)
  } catch (err) {
    return error(`${command.name}: ${err?.message || 'something went wrong'}`)
  }
}

/** Levenshtein distance: how many single-letter edits turn `a` into `b`. */
function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const above = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1))
      diagonal = above
    }
  }
  return row[b.length]
}

/** Banner shown when the terminal opens. */
export function welcomeLines({ profile }) {
  return [
    line(accent('   ╭─────────────────────────────────────────╮')),
    line(accent('   │  '), bold(profile.name.padEnd(39)), accent('│')),
    line(accent('   │  '), muted(profile.roles[0].padEnd(39)), accent('│')),
    line(accent('   ╰─────────────────────────────────────────╯')),
    blank(),
    line(
      'Welcome to terminal mode. Type ',
      accent('help'),
      ' to see commands, ',
      accent('exit'),
      ' to go back.',
    ),
    line(muted('Try: whoami · projects · skills · contact · sudo hire')),
    blank(),
  ]
}

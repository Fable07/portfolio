/**
 * skillGraph.js — connects your skills to the projects and certifications that use them.
 *
 * Projects store their stack as free text ("Vue, Laravel , PostgreSQL"), and skills are
 * named separately in the profile ("Vue JS"). Matching is done on a normalised KEY so
 * small differences still match:
 *
 *   "Vue JS" · "vue" · "Vue.js"      → vuejs
 *   "Node JS" · "node" · "Node.js"   → nodejs
 *   "C++"                            → cpp
 *
 * Used by the /skills page, the terminal's `skill` command and the command palette.
 */

/** Different spellings that mean the same skill (left → canonical key). */
export const SKILL_ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  vue: 'vuejs',
  vue3: 'vuejs',
  nuxt: 'nuxtjs',
  react: 'react',
  reactjs: 'react',
  node: 'nodejs',
  express: 'expressjs',
  postgres: 'postgresql',
  psql: 'postgresql',
  pg: 'postgresql',
  mysqldb: 'mysql',
  mongo: 'mongodb',
  tailwindcss: 'tailwind',
  bootstrap5: 'bootstrap',
  golang: 'go',
  dotnet: 'csharp',
  py: 'python',
  vscode: 'visualstudiocode',
  firebase: 'googlefirebase',
  gh: 'github',
}

/**
 * Turn any skill or tag name into a comparable key.
 * "React Native" → reactnative (stays different from "React" → react)
 */
export function normalizeSkill(name) {
  const key = String(name ?? '')
    .toLowerCase()
    .replaceAll('+', 'p') // c++ → cpp
    .replaceAll('#', 'sharp') // c# → csharp
    .replace(/[^a-z0-9]/g, '')
  return SKILL_ALIASES[key] ?? key
}

/** "Vue, Laravel , PostgreSQL" → ['Vue', 'Laravel', 'PostgreSQL'] */
export function splitTags(techStack) {
  return String(techStack ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

/** Does a project's tech-stack tag refer to this skill? */
export const tagMatchesSkill = (tag, skillName) => normalizeSkill(tag) === normalizeSkill(skillName)

/** Certifications have no tags, so look for the skill name inside the title + issuer. */
function certificationMentions(certification, skillKey) {
  if (skillKey.length < 3) return false // too short to match safely ("go", "r")
  return normalizeSkill(`${certification.title ?? ''} ${certification.issuer ?? ''}`).includes(
    skillKey,
  )
}

/**
 * Build the graph.
 *
 * @param {object} input
 *   skillGroups     from the profile store: [{ title, skills: [{ name, iconUrl }] }]
 *   projects        published projects
 *   certifications  published certifications
 * @returns {{ groups: Array, skills: Array, bySlug: Map, totalLinks: number }}
 *   Each skill: { name, slug, key, group, iconUrl, projects[], certifications[], linkCount }
 *   `groups` keeps the profile's grouping and adds "From projects" for tags that aren't
 *   listed as skills yet, so nothing is hidden.
 */
export function buildSkillGraph({ skillGroups = [], projects = [], certifications = [] } = {}) {
  const make = (name, group, iconUrl = '') => {
    const key = normalizeSkill(name)
    return {
      name,
      key,
      slug: name,
      group,
      iconUrl,
      projects: projects.filter((project) =>
        splitTags(project.tech_stack).some((tag) => normalizeSkill(tag) === key),
      ),
      certifications: certifications.filter((certification) =>
        certificationMentions(certification, key),
      ),
    }
  }

  const groups = skillGroups
    .map((group) => ({
      title: group.title,
      skills: (group.skills ?? []).map((skill) => make(skill.name, group.title, skill.iconUrl)),
    }))
    .filter((group) => group.skills.length)

  // Tags used by projects that aren't in the profile's skill list
  const known = new Set(groups.flatMap((group) => group.skills.map((skill) => skill.key)))
  const extras = new Map()
  for (const project of projects) {
    for (const tag of splitTags(project.tech_stack)) {
      const key = normalizeSkill(tag)
      if (!known.has(key) && !extras.has(key)) extras.set(key, make(tag, 'From projects'))
    }
  }
  if (extras.size) {
    groups.push({
      title: 'From projects',
      skills: [...extras.values()].sort((a, b) => a.name.localeCompare(b.name)),
    })
  }

  const skills = groups.flatMap((group) => group.skills)
  for (const skill of skills) skill.linkCount = skill.projects.length + skill.certifications.length

  return {
    groups,
    skills,
    bySlug: new Map(skills.map((skill) => [skill.slug.toLowerCase(), skill])),
    totalLinks: skills.reduce((sum, skill) => sum + skill.linkCount, 0),
  }
}

/** Look up a skill by name (any spelling), e.g. from the ?skill= URL or a terminal argument. */
export function findSkill(graph, query) {
  if (!query) return null
  const exact = graph.bySlug.get(String(query).toLowerCase())
  if (exact) return exact
  const key = normalizeSkill(query)
  return graph.skills.find((skill) => skill.key === key) ?? null
}

/** Most connected skills first — used as the default selection and for "top skills". */
export function topSkills(graph, limit = 5) {
  return [...graph.skills]
    .filter((skill) => skill.linkCount > 0)
    .sort((a, b) => b.linkCount - a.linkCount || a.name.localeCompare(b.name))
    .slice(0, limit)
}

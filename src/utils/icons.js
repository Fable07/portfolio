/**
 * icons.js — built-in icons that ship with the frontend (src/assets/icons).
 *
 * Profile data refers to icons by FILE NAME ("vue-js.png") instead of a URL, because
 * Vite gives bundled files hashed URLs that change between builds. resolveIcon()
 * turns a file name into the current URL.
 *
 * Admins can pick any of these in /admin/profile, or upload a custom icon (stored as
 * a media item in `icon_media`, which wins over `icon`).
 */

// import.meta.glob is a Vite feature: it bundles matching files and returns their final URLs.
const skillFiles = import.meta.glob('@/assets/icons/skills/*.{png,svg}', {
  eager: true,
  import: 'default',
})
const socialFiles = import.meta.glob('@/assets/icons/socials/*.png', {
  eager: true,
  import: 'default',
})

/** { 'java.png': '/assets/java-abc123.png', … } */
function byFileName(files) {
  return Object.fromEntries(
    Object.entries(files).map(([path, url]) => [path.split('/').pop(), url]),
  )
}

export const skillIcons = byFileName(skillFiles)
export const socialIcons = byFileName(socialFiles)

/** Picker options: [{ key: 'vue-js.png', label: 'vue js', url }] sorted by label */
export function iconOptions(set) {
  return Object.entries(set)
    .map(([key, url]) => ({
      key,
      url,
      label: key.replace(/\.(png|svg)$/, '').replaceAll('-', ' '),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * URL for an icon: uploaded media first, then a built-in file name, else ''.
 * Both sets contain e.g. "github.png", so `prefer` says which set to check first.
 * @param {string|null} key     built-in file name, e.g. 'github.png'
 * @param {object|null} media   uploaded media item ({ url })
 * @param {'skill'|'social'} prefer
 */
export function resolveIcon(key, media = null, prefer = 'skill') {
  const [first, second] =
    prefer === 'social' ? [socialIcons, skillIcons] : [skillIcons, socialIcons]
  return media?.url || first[key] || second[key] || ''
}

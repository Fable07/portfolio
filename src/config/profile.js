/**
 * Profile config — static content shown on the Profile page.
 *
 * Edit this file to change your name, rotating roles, skills or social links.
 * (Phase 3 moves this into the admin panel so it can be edited without code.)
 *
 * Skill icons live in src/assets/icons/skills/ and are referenced by file name.
 * Social icons live in src/assets/icons/socials/.
 */

// Build a { 'java.png': '/assets/java-abc123.png', … } lookup of every icon file.
// import.meta.glob is a Vite feature: it bundles matching files and gives back their final URLs.
const skillIconFiles = import.meta.glob('@/assets/icons/skills/*.{png,svg}', {
  eager: true,
  import: 'default',
})
const socialIconFiles = import.meta.glob('@/assets/icons/socials/*.png', {
  eager: true,
  import: 'default',
})

/** Find an icon URL by its file name, e.g. iconUrl(skillIconFiles, 'java.png'). */
function iconUrl(files, fileName) {
  const match = Object.keys(files).find((path) => path.endsWith(`/${fileName}`))
  if (!match && import.meta.env.DEV) console.warn(`[profile config] Missing icon: ${fileName}`)
  return match ? files[match] : ''
}

/** Shorthand for a skill entry: skill('Vue JS', 'vue-js.png') */
const skill = (name, icon) => ({ name, icon: iconUrl(skillIconFiles, icon) })

export const profile = {
  name: 'Jefferson S. Caragay',
  // Short handle used as the terminal prompt user, e.g. "jefferson@portfolio:~$"
  handle: 'jefferson',
  avatar: '/profile.jpg',
  email: 'caragayjefferson2@gmail.com',
  // Roles cycle in the typewriter effect under your name
  roles: ['Aspiring Fullstack Developer', 'Aspiring DevOps Engineer'],
  // Shown on /about and by the terminal's `about` command
  about: [
    'I build modern web experiences using Vue.js and related technologies.',
    'I focus on clean, accessible interfaces and performant front-end code.',
  ],
}

/** Skill groups — each group renders as a titled row of skill chips. */
export const skillGroups = [
  {
    title: 'Programming Languages',
    skills: [
      skill('Java', 'java.png'),
      skill('Python', 'python.png'),
      skill('SQL', 'sql.png'),
      skill('Kotlin', 'kotlin.png'),
      skill('Javascript', 'javascript.png'),
      skill('PHP', 'php.png'),
      skill('C++', 'cpp.png'),
      skill('Dart', 'dart.png'),
      skill('Bash', 'bash.png'),
      skill('Shell', 'shell.png'),
    ],
  },
  {
    title: 'Frameworks',
    skills: [
      skill('Vue JS', 'vue-js.png'),
      skill('Tailwind', 'tailwind.png'),
      skill('Laravel', 'laravel.png'),
      skill('Bootstrap', 'bootstrap.png'),
      skill('Flutter', 'flutter.png'),
      skill('React', 'react.png'),
      skill('React Native', 'react-native.png'),
    ],
  },
  {
    title: 'Tools',
    skills: [
      skill('Google Firebase', 'google-firebase.png'),
      skill('Vite', 'vite.png'),
      skill('Postman', 'postman.png'),
      skill('Github', 'github.png'),
      skill('Git', 'git.png'),
      skill('Node JS', 'node-js.png'),
      skill('Vercel', 'vercel.png'),
      skill('XAMPP', 'xampp.png'),
      skill('Figma', 'figma.png'),
      skill('Lucidchart', 'lucidchart.png'),
    ],
  },
  {
    title: "IDE's",
    skills: [
      skill('Visual Studio Code', 'visual-studio-code.png'),
      skill('Pycharm', 'pycharm.png'),
      skill('Eclipse', 'eclipse.png'),
      skill('Android Studio', 'android-studio.png'),
      skill('IntelliJ', 'intellij.png'),
      skill('Arduino IDE', 'arduino-ide.svg'),
    ],
  },
]

/** Social links — shown as icon buttons at the bottom of the Profile page. */
export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/Fable07', icon: 'github.png' },
  { label: 'Discord', href: 'https://discord.com/channels/@fablemor', icon: 'discord.png' },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/jefferson-caragay-5b7489215',
    icon: 'linkedin.png',
  },
  { label: 'Telegram', href: 'https://t.me/JeffersonCaragay', icon: 'telegram.png' },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/caragay.sanje.jefferson',
    icon: 'facebook.png',
  },
  {
    label: 'Messenger',
    href: 'https://www.messenger.com/t/114207408203767/',
    icon: 'messenger.png',
  },
  { label: 'Email', href: 'mailto:caragayjefferson2@gmail.com', icon: 'gmail.png' },
].map((link) => ({ ...link, icon: iconUrl(socialIconFiles, link.icon) }))

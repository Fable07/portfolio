/**
 * Default profile — used until a profile is saved in /admin/profile
 * (and as a fallback when the API is unreachable).
 *
 * The shape matches the API (GET /api/profile), so the admin editor can start from it:
 *   skill icon / social icon   built-in file name from src/assets/icons (see utils/icons.js)
 *   icon_media / avatar        uploaded media items (null here)
 *
 * Components don't import this directly — they read useProfileStore().profile,
 * which merges saved data over these defaults and resolves icon URLs.
 */

const skill = (name, icon) => ({ name, icon, icon_media: null })

export const defaultProfile = {
  name: 'Jefferson S. Caragay',
  // Short handle used as the terminal prompt user, e.g. "jefferson@portfolio:~$"
  handle: 'jefferson',
  email: 'caragayjefferson2@gmail.com',
  location: '',
  // Small badge on the home page, e.g. "Open to work" (empty = hidden)
  availability: '',
  // Roles cycle in the typewriter effect under your name
  roles: ['Aspiring Fullstack Developer', 'Aspiring DevOps Engineer'],
  // Paragraphs shown on /about and by the terminal's `about` command
  about: [
    'I build modern web experiences using Vue.js and related technologies.',
    'I focus on clean, accessible interfaces and performant front-end code.',
  ],
  avatar: null, // uploaded photo; falls back to public/profile.jpg

  skill_groups: [
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
  ],

  social_links: [
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
  ],
}

/** Fallback photo when no avatar has been uploaded */
export const DEFAULT_AVATAR = '/profile.jpg'

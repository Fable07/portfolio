<!--
  ProfileView — / (home page)
  Avatar, name, typewriter role, skill groups and social links.
  All content comes from src/config/profile.js — edit that file, not this template.
-->
<template>
  <section id="profile" class="section">
    <div class="profile__inner">
      <img class="avatar" :src="profile.avatar" :alt="`Photo of ${profile.name}`" />

      <div class="info">
        <h1 class="m-0 text-xl leading-snug text-accent">{{ profile.name }}</h1>
        <p class="role">
          <span>{{ typedRole }}</span
          ><span class="typing-cursor" aria-hidden="true">|</span>
          <!-- Screen readers get the full list instead of the animated text -->
          <span class="sr-only">{{ profile.roles.join(', ') }}</span>
        </p>

        <!-- Skill groups: Programming Languages, Frameworks, Tools, IDE's -->
        <ul v-for="group in skillGroups" :key="group.title">
          <li>
            <strong>{{ group.title }}</strong>
            <ul class="horizontal-list">
              <li v-for="skill in group.skills" :key="skill.name">
                <img :src="skill.icon" alt="" class="small-icon" loading="lazy" />
                {{ skill.name }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <!-- Social links -->
    <div class="links mt-6">
      <h2 class="m-0 mb-3 text-lg font-semibold text-accent">Social Media Accounts</h2>
      <div class="socmed">
        <a
          v-for="link in socialLinks"
          :key="link.label"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="link.label"
          :title="link.label"
        >
          <img :src="link.icon" alt="" class="social-icon" />
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { profile, skillGroups, socialLinks } from '@/config/profile'
import { useTypewriter } from '@/composables/useTypewriter'

const { text: typedRole } = useTypewriter(profile.roles)
</script>

<style scoped>
/* Blinking "|" cursor after the typewriter text */
.typing-cursor {
  display: inline-block;
  color: var(--accent);
  font-weight: 300;
  animation: blink 0.7s step-end infinite;
  margin-left: 1px;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>

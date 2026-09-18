<!--
  AdminDashboardView — /admin
  At-a-glance counts, drafts waiting to be published, profile status and quick links.
-->
<template>
  <section>
    <AdminPageHeader
      :title="`Welcome back${firstName ? `, ${firstName}` : ''}`"
      description="Here's the state of your portfolio."
    >
      <RouterLink :to="{ name: 'profile' }" target="_blank" class="btn-secondary"
        >View site ↗</RouterLink
      >
    </AdminPageHeader>

    <!-- Counts -->
    <ul class="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4">
      <li v-for="card in cards" :key="card.label">
        <RouterLink
          :to="{ name: card.route }"
          class="block rounded-2xl border border-line bg-card p-4 no-underline transition-colors hover:border-accent/40"
        >
          <span class="text-2xl" aria-hidden="true">{{ card.icon }}</span>
          <span class="mt-2 block text-3xl font-bold text-heading">
            <SkeletonBlock v-if="card.loading" class="h-9 w-12" />
            <template v-else>{{ card.count }}</template>
          </span>
          <span class="block text-sm">{{ card.label }}</span>
          <span v-if="card.note" class="mt-1 block text-xs text-amber-300">{{ card.note }}</span>
        </RouterLink>
      </li>
    </ul>

    <div class="mt-5 grid gap-4 lg:grid-cols-2">
      <!-- Drafts -->
      <section class="rounded-2xl border border-line bg-card p-5" aria-labelledby="drafts-heading">
        <h2 id="drafts-heading" class="m-0 mb-3 text-base font-bold text-heading">Drafts</h2>
        <ul v-if="drafts.length" class="m-0 grid list-none gap-2 p-0">
          <li
            v-for="draft in drafts"
            :key="draft.key"
            class="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2 text-sm"
          >
            <span class="min-w-0 truncate"
              ><span aria-hidden="true">{{ draft.icon }}</span> {{ draft.title }}</span
            >
            <RouterLink
              :to="{ name: draft.route }"
              class="shrink-0 text-xs font-semibold text-accent no-underline hover:underline"
              >Review →</RouterLink
            >
          </li>
        </ul>
        <p v-else class="m-0 text-sm">No drafts — everything is published. ✨</p>
      </section>

      <!-- Profile & shortcuts -->
      <section class="rounded-2xl border border-line bg-card p-5" aria-labelledby="profile-heading">
        <h2 id="profile-heading" class="m-0 mb-3 text-base font-bold text-heading">Profile</h2>
        <p class="m-0 text-sm">
          <template v-if="profile.isCustomized">Your profile is saved in the database.</template>
          <template v-else>
            The site is showing the <strong class="text-heading">default profile</strong> from
            <code class="text-accent">config/profile.js</code>. Save it once in the editor to manage
            it here.
          </template>
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <RouterLink :to="{ name: 'admin-profile' }" class="btn-primary">Edit profile</RouterLink>
          <RouterLink :to="{ name: 'admin-projects' }" class="btn-secondary"
            >＋ New project</RouterLink
          >
          <RouterLink :to="{ name: 'admin-resume' }" class="btn-secondary"
            >Update resume</RouterLink
          >
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import { useAuthStore } from '@/stores/auth'
import {
  useAdminCertificationsStore,
  useAdminHobbiesStore,
  useAdminProjectsStore,
  useAdminTimelineStore,
} from '@/stores/content'
import { useProfileStore } from '@/stores/profile'

const auth = useAuthStore()
const profile = useProfileStore()
const projects = useAdminProjectsStore()
const certifications = useAdminCertificationsStore()
const timeline = useAdminTimelineStore()
const hobbies = useAdminHobbiesStore()

const firstName = computed(() => (auth.user?.name ?? '').split(' ')[0])

const draftCount = (store) => store.items.filter((item) => item.is_published === false).length

const cards = computed(() =>
  [
    { label: 'Projects', icon: '🚀', route: 'admin-projects', store: projects },
    { label: 'Certifications', icon: '🏅', route: 'admin-certifications', store: certifications },
    { label: 'Timeline entries', icon: '🕐', route: 'admin-timeline', store: timeline },
    { label: 'Hobbies', icon: '🎯', route: 'admin-hobbies', store: hobbies },
  ].map((card) => {
    const drafts = draftCount(card.store)
    return {
      ...card,
      loading: card.store.isLoading,
      count: card.store.items.length,
      note: drafts ? `${drafts} draft${drafts > 1 ? 's' : ''}` : '',
    }
  }),
)

const drafts = computed(() => [
  ...projects.items
    .filter((item) => item.is_published === false)
    .map((item) => ({
      key: `p${item.id}`,
      icon: '🚀',
      title: item.title,
      route: 'admin-projects',
    })),
  ...certifications.items
    .filter((item) => item.is_published === false)
    .map((item) => ({
      key: `c${item.id}`,
      icon: '🏅',
      title: item.title,
      route: 'admin-certifications',
    })),
])

onMounted(() => {
  profile.load()
  ;[projects, certifications, timeline, hobbies].forEach((store) => store.load())
})
</script>

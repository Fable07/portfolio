<!--
  AdminProfileView — /admin/profile
  Edit everything "about you" shown across the site: name, availability badge, rotating
  roles, about paragraphs, photo, skill groups (with icons) and social links.

  • Starts from the saved profile — or the defaults in src/config/profile.js the first time.
  • One Save button stores the whole profile (PUT /api/profile).
  • Warns before leaving with unsaved changes; uploads from an unsaved session are deleted.
-->
<template>
  <section>
    <AdminPageHeader
      title="Profile"
      description="Your name, photo, skills and links — shown on the home page, About, the terminal and search."
    >
      <span v-if="isDirty" class="text-xs text-amber-300">Unsaved changes</span>
      <button type="button" class="btn-secondary" :disabled="!isDirty || saving" @click="resetForm">
        Reset
      </button>
      <button type="button" class="btn-primary" :disabled="!isDirty || saving" @click="save">
        {{ saving ? 'Saving…' : 'Save profile' }}
      </button>
    </AdminPageHeader>

    <p
      v-if="!store.isCustomized && store.status !== 'loading'"
      class="m-0 mb-4 rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm text-sky-200"
    >
      You're editing the <strong>default profile</strong> from <code>config/profile.js</code>.
      Saving stores it in the database.
    </p>
    <p
      v-if="formError"
      class="m-0 mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300"
      role="alert"
    >
      {{ formError }}
    </p>

    <SkeletonBlock v-if="!form" class="h-96 w-full rounded-2xl" />

    <form v-else class="grid gap-5 xl:grid-cols-2" novalidate @submit.prevent="save">
      <!-- ── Basics ── -->
      <fieldset class="m-0 grid content-start gap-4 rounded-2xl border border-line bg-card p-5">
        <legend class="sr-only">Basics</legend>
        <h2 class="m-0 text-base font-bold text-heading">Basics</h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <FormField
            v-slot="{ id, describedBy, invalid }"
            label="Full name"
            required
            :error="errorFor('name')"
          >
            <input
              :id="id"
              v-model="form.name"
              class="form-input"
              :aria-describedby="describedBy"
              :aria-invalid="invalid"
            />
          </FormField>
          <FormField
            v-slot="{ id, describedBy, invalid }"
            label="Terminal handle"
            optional
            hint="Lowercase — shown as handle@portfolio"
            :error="errorFor('handle')"
          >
            <input
              :id="id"
              v-model.trim="form.handle"
              class="form-input font-mono"
              placeholder="jefferson"
              :aria-describedby="describedBy"
              :aria-invalid="invalid"
            />
          </FormField>
          <FormField
            v-slot="{ id, describedBy, invalid }"
            label="Email"
            optional
            :error="errorFor('email')"
          >
            <input
              :id="id"
              v-model.trim="form.email"
              type="email"
              class="form-input"
              :aria-describedby="describedBy"
              :aria-invalid="invalid"
            />
          </FormField>
          <FormField
            v-slot="{ id, describedBy, invalid }"
            label="Location"
            optional
            :error="errorFor('location')"
          >
            <input
              :id="id"
              v-model="form.location"
              class="form-input"
              placeholder="e.g. Bataan, Philippines"
              :aria-describedby="describedBy"
              :aria-invalid="invalid"
            />
          </FormField>
        </div>

        <FormField
          v-slot="{ id, describedBy, invalid }"
          label="Availability badge"
          optional
          hint="e.g. “Open to work” — leave empty to hide the badge"
          :error="errorFor('availability')"
        >
          <input
            :id="id"
            v-model="form.availability"
            class="form-input"
            maxlength="80"
            :aria-describedby="describedBy"
            :aria-invalid="invalid"
          />
        </FormField>

        <MediaUploader
          v-model="form.avatar"
          collection="profile"
          label="Photo"
          accept="image/jpeg,image/png,image/webp"
          hint="Square image works best · falls back to public/profile.jpg"
          :error="errorFor('avatar')"
        />
      </fieldset>

      <!-- ── Roles & about ── -->
      <fieldset class="m-0 grid content-start gap-5 rounded-2xl border border-line bg-card p-5">
        <legend class="sr-only">Roles and about</legend>
        <div>
          <h2 class="m-0 text-base font-bold text-heading">Roles</h2>
          <p class="m-0 mt-1 mb-3 text-xs">Typed one after another under your name.</p>
          <StringListEditor
            v-model="form.roles"
            item-label="Role"
            placeholder="e.g. Aspiring Fullstack Developer"
            :max="6"
            :errors="indexedErrors('roles')"
          />
        </div>
        <div>
          <h2 class="m-0 text-base font-bold text-heading">About</h2>
          <p class="m-0 mt-1 mb-3 text-xs">The first paragraph also appears on the home page.</p>
          <StringListEditor
            v-model="form.about"
            item-label="Paragraph"
            multiline
            :max="10"
            :errors="indexedErrors('about')"
          />
        </div>
      </fieldset>

      <!-- ── Skills ── -->
      <fieldset
        class="m-0 grid content-start gap-4 rounded-2xl border border-line bg-card p-5 xl:col-span-2"
      >
        <legend class="sr-only">Skills</legend>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="m-0 text-base font-bold text-heading">Skills & tools</h2>
            <p class="m-0 mt-1 text-xs">
              Groups of skills. Click an icon to pick a built-in one or upload your own.
            </p>
          </div>
          <button type="button" class="btn-secondary" @click="addGroup">＋ Add group</button>
        </div>

        <div
          v-for="(group, groupIndex) in form.skill_groups"
          :key="groupIndex"
          class="rounded-xl border border-line bg-surface p-4"
        >
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <input
              v-model="group.title"
              class="form-input min-w-0 flex-1 font-semibold!"
              placeholder="Group title, e.g. Frameworks"
              :aria-label="`Title of skill group ${groupIndex + 1}`"
              :aria-invalid="!!errorFor(`skill_groups.${groupIndex}.title`)"
            />
            <button
              type="button"
              class="btn-ghost px-2!"
              :disabled="groupIndex === 0"
              :aria-label="`Move group ${group.title || groupIndex + 1} up`"
              @click="moveIn(form.skill_groups, groupIndex, -1)"
            >
              ↑
            </button>
            <button
              type="button"
              class="btn-ghost px-2!"
              :disabled="groupIndex === form.skill_groups.length - 1"
              :aria-label="`Move group ${group.title || groupIndex + 1} down`"
              @click="moveIn(form.skill_groups, groupIndex, 1)"
            >
              ↓
            </button>
            <button
              type="button"
              class="btn-ghost px-2! hover:text-red-400!"
              :aria-label="`Remove group ${group.title || groupIndex + 1}`"
              @click="removeGroup(groupIndex)"
            >
              ✕
            </button>
          </div>
          <p v-if="groupErrors(groupIndex)" class="m-0 mb-2 text-xs text-red-400" role="alert">
            {{ groupErrors(groupIndex) }}
          </p>

          <VueDraggable
            v-model="group.skills"
            tag="ul"
            handle="[data-drag-handle]"
            :animation="150"
            class="m-0 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3"
          >
            <li
              v-for="(skill, skillIndex) in group.skills"
              :key="skillIndex"
              class="flex items-center gap-2 rounded-lg border border-line bg-card p-1.5"
            >
              <span
                data-drag-handle
                class="cursor-grab px-1 text-muted select-none"
                title="Drag to reorder"
                aria-hidden="true"
                >⠿</span
              >
              <IconPicker
                v-model:icon="skill.icon"
                v-model:media="skill.icon_media"
                set="skill"
                :label="skill.name"
              />
              <input
                v-model="skill.name"
                class="form-input min-w-0 flex-1 py-1.5! text-sm!"
                placeholder="Skill name"
                :aria-label="`Skill ${skillIndex + 1} in ${group.title || 'group'}`"
                :aria-invalid="!!errorFor(`skill_groups.${groupIndex}.skills.${skillIndex}.name`)"
              />
              <button
                type="button"
                class="btn-ghost px-2! hover:text-red-400!"
                :aria-label="`Remove ${skill.name || 'skill'}`"
                @click="removeSkill(group, skillIndex)"
              >
                ✕
              </button>
            </li>
          </VueDraggable>
          <button
            type="button"
            class="btn-ghost mt-2 border border-dashed! border-line!"
            @click="group.skills.push({ name: '', icon: null, icon_media: null })"
          >
            ＋ Add skill
          </button>
        </div>
      </fieldset>

      <!-- ── Social links ── -->
      <fieldset
        class="m-0 grid content-start gap-3 rounded-2xl border border-line bg-card p-5 xl:col-span-2"
      >
        <legend class="sr-only">Social links</legend>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="m-0 text-base font-bold text-heading">Social links</h2>
            <p class="m-0 mt-1 text-xs">Web links (https://) or email (mailto:you@example.com).</p>
          </div>
          <button
            type="button"
            class="btn-secondary"
            @click="form.social_links.push({ label: '', href: '', icon: null })"
          >
            ＋ Add link
          </button>
        </div>

        <VueDraggable
          v-model="form.social_links"
          tag="ul"
          handle="[data-drag-handle]"
          :animation="150"
          class="m-0 grid list-none gap-2 p-0"
        >
          <li
            v-for="(link, index) in form.social_links"
            :key="index"
            class="grid gap-2 rounded-lg border border-line bg-surface p-2 sm:grid-cols-[auto_auto_160px_1fr_auto] sm:items-center"
          >
            <span
              data-drag-handle
              class="hidden cursor-grab px-1 text-muted select-none sm:inline"
              title="Drag to reorder"
              aria-hidden="true"
              >⠿</span
            >
            <IconPicker v-model:icon="link.icon" set="social" :label="link.label" />
            <input
              v-model="link.label"
              class="form-input py-1.5! text-sm!"
              placeholder="Label, e.g. GitHub"
              :aria-label="`Label of link ${index + 1}`"
              :aria-invalid="!!errorFor(`social_links.${index}.label`)"
            />
            <input
              v-model.trim="link.href"
              class="form-input py-1.5! text-sm!"
              placeholder="https://github.com/you"
              :aria-label="`URL of link ${index + 1}`"
              :aria-invalid="!!linkError(link, index)"
            />
            <button
              type="button"
              class="btn-ghost px-2! hover:text-red-400!"
              :aria-label="`Remove link ${link.label || index + 1}`"
              @click="form.social_links.splice(index, 1)"
            >
              ✕
            </button>
            <p
              v-if="linkError(link, index)"
              class="m-0 text-xs text-red-400 sm:col-span-5"
              role="alert"
            >
              {{ linkError(link, index) }}
            </p>
          </li>
        </VueDraggable>
      </fieldset>
    </form>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import AdminPageHeader from '@/components/admin/AdminPageHeader.vue'
import FormField from '@/components/common/FormField.vue'
import IconPicker from '@/components/admin/IconPicker.vue'
import MediaUploader from '@/components/admin/MediaUploader.vue'
import StringListEditor from '@/components/admin/StringListEditor.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import { findFieldError, flattenErrors } from '@/composables/useCrudEditor'
import { provideMediaSession } from '@/composables/useMediaSession'
import { useDirtyState, useUnsavedChangesGuard } from '@/composables/useUnsavedChanges'
import { useProfileStore } from '@/stores/profile'
import { useToastStore } from '@/stores/toast'
import { isSafeLink } from '@/utils/validation'

const store = useProfileStore()
const toast = useToastStore()
const session = provideMediaSession()

const form = ref(null)
const saving = ref(false)
const errors = ref({}) // flattened field errors: { 'skill_groups.0.title': '…' }
const formError = ref('')

const { isDirty, snapshot } = useDirtyState(() => form.value)
useUnsavedChangesGuard(isDirty)

/* ── Loading / resetting ── */
function resetForm() {
  session.discardAll()
  form.value = normalize(store.editableCopy())
  errors.value = {}
  formError.value = ''
  snapshot()
}

/** Make sure every list exists so the editors can bind to it */
function normalize(data) {
  return {
    ...data,
    handle: data.handle ?? '',
    email: data.email ?? '',
    location: data.location ?? '',
    availability: data.availability ?? '',
    roles: data.roles ?? [],
    about: data.about ?? [],
    skill_groups: (data.skill_groups ?? []).map((group) => ({
      title: group.title ?? '',
      skills: (group.skills ?? []).map((skill) => ({
        name: skill.name ?? '',
        icon: skill.icon ?? null,
        icon_media: skill.icon_media ?? null,
      })),
    })),
    social_links: (data.social_links ?? []).map((link) => ({
      label: link.label ?? '',
      href: link.href ?? '',
      icon: link.icon ?? null,
    })),
  }
}

onMounted(async () => {
  await store.load()
  resetForm()
})
onBeforeUnmount(() => session.discardAll())

/* ── Editing helpers ── */
function moveIn(list, index, direction) {
  const [item] = list.splice(index, 1)
  list.splice(index + direction, 0, item)
}

function addGroup() {
  form.value.skill_groups.push({ title: '', skills: [{ name: '', icon: null, icon_media: null }] })
}

function removeGroup(index) {
  const [group] = form.value.skill_groups.splice(index, 1)
  group.skills.forEach((skill) => skill.icon_media && session.discard(skill.icon_media))
}

function removeSkill(group, index) {
  const [skill] = group.skills.splice(index, 1)
  if (skill.icon_media) session.discard(skill.icon_media)
}

/* ── Errors ── */
const errorFor = (field) => findFieldError(errors.value, field)

/** { 0: 'message' } for list fields like roles.0 */
function indexedErrors(field) {
  return Object.fromEntries(
    Object.entries(errors.value)
      .map(([key, message]) => [key.match(new RegExp(`^${field}\\.(\\d+)$`))?.[1], message])
      .filter(([index]) => index !== undefined),
  )
}

function groupErrors(groupIndex) {
  return Object.entries(errors.value)
    .filter(([key]) => key.startsWith(`skill_groups.${groupIndex}.`))
    .map(([, message]) => message)[0]
}

function linkError(link, index) {
  if (link.href && !isSafeLink(link.href))
    return 'Link must start with https://, http:// or mailto:'
  return errorFor(`social_links.${index}.href`) || errorFor(`social_links.${index}.label`)
}

/* ── Save ── */
function clientValidate() {
  const found = {}
  if (!form.value.name.trim()) found.name = 'Name is required.'
  form.value.roles.forEach(
    (role, i) => !role.trim() && (found[`roles.${i}`] = 'Role is empty — fill it in or remove it.'),
  )
  form.value.about.forEach(
    (text, i) =>
      !text.trim() && (found[`about.${i}`] = 'Paragraph is empty — fill it in or remove it.'),
  )
  form.value.skill_groups.forEach((group, g) => {
    if (!group.title.trim()) found[`skill_groups.${g}.title`] = 'Group title is required.'
    group.skills.forEach(
      (skill, s) =>
        !skill.name.trim() &&
        (found[`skill_groups.${g}.skills.${s}.name`] = 'Every skill needs a name.'),
    )
  })
  form.value.social_links.forEach((link, i) => {
    if (!link.label.trim()) found[`social_links.${i}.label`] = 'Label is required.'
    if (!isSafeLink(link.href))
      found[`social_links.${i}.href`] = 'Link must start with https://, http:// or mailto:'
  })
  return found
}

async function save() {
  errors.value = clientValidate()
  if (Object.keys(errors.value).length) {
    formError.value = 'Please fix the highlighted fields.'
    return
  }

  saving.value = true
  formError.value = ''
  try {
    await store.save({ ...form.value, handle: form.value.handle || null })
    session.commit()
    resetForm()
    toast.success('Profile saved')
  } catch (err) {
    errors.value = flattenErrors(err.errors)
    formError.value = Object.keys(errors.value).length
      ? 'Please fix the highlighted fields.'
      : err.message
  } finally {
    saving.value = false
  }
}
</script>

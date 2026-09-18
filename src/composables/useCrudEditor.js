import { computed, reactive } from 'vue'
import { useToastStore } from '@/stores/toast'
import { provideMediaSession } from '@/composables/useMediaSession'
import { useDirtyState } from '@/composables/useUnsavedChanges'
import { cloneMedia } from '@/utils/media'

/**
 * useCrudEditor — shared "Add / Edit" form logic for admin list pages.
 *
 * Every admin list (projects, certifications, hobbies, timeline) works the same way:
 * open a modal with an empty or pre-filled form → validate → save through the store
 * → show a toast. This composable holds that flow so each page only defines its fields.
 * (Deleting is handled by useUndoableDelete.)
 *
 * @param store    An admin collection store from src/stores/content.js
 * @param options
 *   label      Singular name for messages, e.g. 'Project'
 *   emptyForm  Field defaults for a new item, e.g. { title: '', description: '' }
 *   validate   (form) => { field: 'message' } — empty object when valid
 *
 * @returns
 *   editor         state for <AdminModal>: open, isEdit, saving, error, form, fieldErrors
 *   isDirty        true when the form has unsaved changes (AdminModal asks before closing)
 *   fieldError(f)  first error message for a field (also matches nested keys like media.0.url)
 *   openCreate / openEdit(item) / closeEditor / save
 */
export function useCrudEditor(store, { label, emptyForm, validate = () => ({}) }) {
  const toast = useToastStore()
  // Tracks files uploaded inside this form, so cancelled uploads get deleted (see useMediaSession)
  const mediaSession = provideMediaSession()

  const editor = reactive({
    open: false,
    isEdit: false,
    saving: false,
    error: '', // form-level message
    fieldErrors: {}, // { title: 'Title is required.', 'media.0.embed_url': '…' }
    editingId: null,
    form: cloneMedia(emptyForm),
  })

  const { isDirty, snapshot } = useDirtyState(() => editor.form)

  function reset(changes) {
    Object.assign(editor, { saving: false, error: '', fieldErrors: {}, ...changes })
  }

  function openCreate() {
    reset({ open: true, isEdit: false, editingId: null })
    editor.form = cloneMedia(emptyForm)
    snapshot()
  }

  function openEdit(item) {
    reset({ open: true, isEdit: true, editingId: item.id })
    // Copy only the form's fields; null from the API becomes the default ('' for text inputs).
    // Deep copy, so editing (e.g. media alt text) never changes the list behind the modal.
    editor.form = cloneMedia(
      Object.fromEntries(Object.keys(emptyForm).map((key) => [key, item[key] ?? emptyForm[key]])),
    )
    snapshot()
  }

  /** Close the form and delete any files uploaded in it (AdminModal confirms first if dirty) */
  function closeEditor() {
    editor.open = false
    mediaSession.discardAll()
  }

  async function save() {
    editor.fieldErrors = validate(editor.form)
    if (Object.keys(editor.fieldErrors).length) {
      editor.error = 'Please fix the highlighted fields.'
      return
    }

    editor.saving = true
    editor.error = ''
    try {
      if (editor.isEdit) await store.update(editor.editingId, editor.form)
      else await store.create(editor.form)
      mediaSession.commit() // uploads are now part of saved content
      editor.open = false
      toast.success(`${label} saved`)
    } catch (err) {
      editor.fieldErrors = flattenErrors(err.errors)
      editor.error = Object.keys(editor.fieldErrors).length
        ? 'Please fix the highlighted fields.'
        : err.message || 'Saving failed. Try again.'
    } finally {
      editor.saving = false
    }
  }

  const fieldError = (field) => findFieldError(editor.fieldErrors, field)

  return {
    editor,
    isDirty: computed(() => isDirty.value),
    fieldError,
    openCreate,
    openEdit,
    closeEditor,
    save,
  }
}

/** Laravel sends { field: ['message', …] } — keep the first message per field. */
export function flattenErrors(errors) {
  return Object.fromEntries(
    Object.entries(errors ?? {}).map(([key, messages]) => [key, [].concat(messages)[0]]),
  )
}

/** Error for `field` itself, or for anything nested under it (field.0.url). */
export function findFieldError(errors, field) {
  if (errors[field]) return errors[field]
  const nested = Object.keys(errors).find((key) => key.startsWith(`${field}.`))
  return nested ? errors[nested] : ''
}

/** Prefer the first Laravel validation message ("The title field is required.") over a generic one. */
export function apiErrorMessage(err) {
  const firstFieldError = err?.errors && Object.values(err.errors)[0]?.[0]
  return firstFieldError || err?.message || 'Something went wrong. Try again.'
}

/** Validator helper: requiredFields(form, { title: 'Title' }) → { title: 'Title is required.' } */
export function requiredFields(form, fields) {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([key]) => !String(form[key] ?? '').trim())
      .map(([key, name]) => [key, `${name} is required.`]),
  )
}

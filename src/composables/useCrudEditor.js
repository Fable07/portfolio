import { reactive, computed } from 'vue'
import { useToastStore } from '@/stores/toast'

/**
 * useCrudEditor — shared "Add / Edit / Delete" logic for admin list pages.
 *
 * Every admin page (projects, certifications, hobbies, timeline) works the same way:
 * open a modal with an empty or pre-filled form → validate → save through the store
 * → show a toast. This composable holds that flow so each page only defines its fields.
 *
 * @param store    A collection store from src/stores/content.js
 * @param options
 *   label      Singular name for messages, e.g. 'Project'
 *   emptyForm  Field defaults for a new item, e.g. { title: '', description: '' }
 *   validate   (form) => error message string, or '' when valid
 *   nameOf     (item) => text shown in the delete confirmation (defaults to item.title)
 *
 * @returns
 *   editor      → state for <AdminModal>: open, isEdit, saving, error, form
 *   openCreate / openEdit(item) / closeEditor / save
 *   deletion    → state for <ConfirmDeleteDialog>: open, item, deleting
 *   deleteName  → computed display name of the item being deleted
 *   askDelete(item) / cancelDelete / confirmDelete
 */
export function useCrudEditor(store, { label, emptyForm, validate = () => '', nameOf }) {
  const toast = useToastStore()

  /* ── Add / Edit modal ── */
  const editor = reactive({
    open: false,
    isEdit: false,
    saving: false,
    error: '',
    editingId: null,
    form: { ...emptyForm },
  })

  function openCreate() {
    Object.assign(editor, { open: true, isEdit: false, saving: false, error: '', editingId: null })
    editor.form = { ...emptyForm }
  }

  function openEdit(item) {
    Object.assign(editor, {
      open: true,
      isEdit: true,
      saving: false,
      error: '',
      editingId: item.id,
    })
    // Copy only the form's fields; null from the API becomes the default ('' for text inputs)
    editor.form = Object.fromEntries(
      Object.keys(emptyForm).map((key) => [key, item[key] ?? emptyForm[key]]),
    )
  }

  function closeEditor() {
    editor.open = false
  }

  async function save() {
    editor.error = validate(editor.form)
    if (editor.error) return

    editor.saving = true
    try {
      if (editor.isEdit) await store.update(editor.editingId, editor.form)
      else await store.create(editor.form)
      editor.open = false
      toast.success(`${label} saved`)
    } catch (err) {
      editor.error = apiErrorMessage(err)
    } finally {
      editor.saving = false
    }
  }

  /* ── Delete confirmation ── */
  const deletion = reactive({ open: false, item: null, deleting: false })

  function askDelete(item) {
    Object.assign(deletion, { open: true, item, deleting: false })
  }

  function cancelDelete() {
    deletion.open = false
  }

  async function confirmDelete() {
    deletion.deleting = true
    try {
      await store.remove(deletion.item.id)
      deletion.open = false
      toast.success(`${label} deleted`)
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`)
    } finally {
      deletion.deleting = false
    }
  }

  // Text shown in the confirmation ("'Portfolio Website' will be permanently removed")
  const getName = nameOf ?? ((item) => item.title)
  const deleteName = computed(() => (deletion.item ? getName(deletion.item) : ''))

  return {
    editor,
    openCreate,
    openEdit,
    closeEditor,
    save,
    deletion,
    deleteName,
    askDelete,
    cancelDelete,
    confirmDelete,
  }
}

/** Prefer the first Laravel validation message ("The title field is required.") over a generic one. */
export function apiErrorMessage(err) {
  const firstFieldError = err?.errors && Object.values(err.errors)[0]?.[0]
  return firstFieldError || err?.message || 'Something went wrong. Try again.'
}

/** Small validator helper: requiredFields(form, { title: 'Title' }) → 'Title is required.' or '' */
export function requiredFields(form, fields) {
  const missing = Object.entries(fields).find(([key]) => !String(form[key] ?? '').trim())
  return missing ? `${missing[1]} is required.` : ''
}

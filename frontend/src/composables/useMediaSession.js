import { inject, provide } from 'vue'
import { mediaApi } from '@/api'

/**
 * useMediaSession — tracks files uploaded while an admin form is open.
 *
 * Why: files are uploaded as soon as they're picked (so you see a preview), but the
 * content isn't saved until you press Save. If you cancel the form or remove a
 * just-uploaded file, it would stay in storage forever as an orphan. A session
 * remembers those uploads and deletes them unless the form is saved.
 *
 *   const session = provideMediaSession()   // in the form owner (useCrudEditor, AdminResumeView)
 *   session.commit()                        // after a successful save → keep files
 *   session.discardAll()                    // on cancel → delete unsaved uploads
 *
 * MediaUploader injects the nearest session automatically (injectMediaSession()).
 */

const MEDIA_SESSION = Symbol('media-session')

export function createMediaSession() {
  const pending = new Map() // storage key → media item uploaded but not yet saved

  return {
    /** Remember a fresh upload */
    track(item) {
      if (item?.key) pending.set(item.key, item)
    },
    /** Delete a fresh upload that was removed before saving (no-op for saved items) */
    async discard(item) {
      if (!item?.key || !pending.has(item.key)) return
      pending.delete(item.key)
      await mediaApi.discard(item).catch(() => {}) // best effort — never block the UI
    },
    /** Form cancelled: delete every unsaved upload */
    async discardAll() {
      const items = [...pending.values()]
      pending.clear()
      await Promise.all(items.map((item) => mediaApi.discard(item).catch(() => {})))
    },
    /** Form saved: the uploads are now referenced by content, keep them */
    commit() {
      pending.clear()
    },
  }
}

export function provideMediaSession() {
  const session = createMediaSession()
  provide(MEDIA_SESSION, session)
  return session
}

export function injectMediaSession() {
  return inject(MEDIA_SESSION, null)
}

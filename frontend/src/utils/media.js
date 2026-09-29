/**
 * media.js — helpers for media items returned by the API.
 *
 * A media item is the JSON the backend stores for every image / video / PDF / embed:
 *   { id, type: 'image'|'video'|'document'|'embed', provider, url, key, mime, size,
 *     width, height, name, alt, thumbnail_url, embed_url }
 * See portfolio-backend/app/Services/Media/MediaItem.php for the full description.
 */

/** Normalise a column value (array, single item, or null) into an array of items. */
export function mediaList(value) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

/** Best preview image for an item: the image itself, or a video/embed/PDF thumbnail. */
export function previewUrl(item) {
  if (!item) return ''
  return item.type === 'image' ? item.url : item.thumbnail_url || ''
}

/**
 * Ask Cloudinary for an optimised copy: modern format (AVIF/WebP), automatic quality,
 * and no wider than `width` px. Other URLs (local uploads, /public files) pass through.
 *   cdnUrl(item.url, { width: 800 })            image
 *   cdnUrl(item.url, { width: 720, video: true }) video (quality + size only)
 */
export function cdnUrl(url, { width, video = false } = {}) {
  const match = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/)(.+)$/.exec(
    url || '',
  )
  if (!match) return url || ''

  const steps = [video ? 'q_auto' : 'f_auto,q_auto', width && `c_limit,w_${width}`]
  const transform = steps.filter(Boolean).join(',')
  // Add our step after any existing ones (e.g. a video poster's so_0) and before the version
  const parts = match[2].split('/')
  const versionAt = parts.findIndex((part) => /^v\d+$/.test(part))
  parts.splice(versionAt === -1 ? parts.length - 1 : versionAt, 0, transform)
  return match[1] + parts.join('/')
}

/** Cover image for a project card: first image in the gallery, else any thumbnail, else the legacy URL. */
export function projectCover(project) {
  const items = mediaList(project?.media)
  const image = items.find((item) => item.type === 'image')
  return image?.url || items.map(previewUrl).find(Boolean) || project?.thumbnail_url || ''
}

/** Certification badge image: uploaded badge (or a certificate PDF's preview), then a pasted URL. */
export function badgeImage(cert) {
  return previewUrl(cert?.badge) || cert?.badge_url || ''
}

/** The certificate PDF, when the badge upload is a document. */
export function certificatePdf(cert) {
  return cert?.badge?.type === 'document' ? cert.badge.url : ''
}

/**
 * Hobby card media: the cover photo plus the gallery, in viewing order.
 * `cover` is the item shown on the card — the cover photo, else the first gallery item.
 */
export function hobbyMedia(hobby) {
  const items = [...mediaList(hobby?.image), ...mediaList(hobby?.media)]
  return { items, cover: items[0] ?? null }
}

/** Count items per type, e.g. { image: 3, video: 1, embed: 1, document: 0 } */
export function countByType(value) {
  const counts = { image: 0, video: 0, embed: 0, document: 0 }
  for (const item of mediaList(value)) counts[item.type] = (counts[item.type] ?? 0) + 1
  return counts
}

/** 48213 → "47.1 KB" */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`
}

/** Deep copy so editing a form never mutates data shown elsewhere (store items). */
export function cloneMedia(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value))
}

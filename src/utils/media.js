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

/** Best preview image for an item: the image itself, or a video/embed thumbnail. */
export function previewUrl(item) {
  if (!item) return ''
  return item.type === 'image' ? item.url : item.thumbnail_url || ''
}

/** Cover image for a project card: first image in the gallery, else any thumbnail, else the legacy URL. */
export function projectCover(project) {
  const items = mediaList(project?.media)
  const image = items.find((item) => item.type === 'image')
  return image?.url || items.map(previewUrl).find(Boolean) || project?.thumbnail_url || ''
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

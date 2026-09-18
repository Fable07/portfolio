import { http, upload } from './client'

/**
 * Standard endpoints for a Laravel resource controller.
 *   list({ drafts: true })   admin only — include unpublished items
 *   update(id, partial)      partial updates are fine, e.g. { is_featured: true }
 *   reorder([3, 1, 2])       save display order
 */
function resource(name) {
  return {
    list: ({ drafts = false } = {}) => http.get(`/${name}${drafts ? '?drafts=1' : ''}`),
    create: (data) => http.post(`/${name}`, data),
    update: (id, data) => http.put(`/${name}/${id}`, data),
    remove: (id, { keepalive = false } = {}) =>
      http.delete(`/${name}/${id}`, undefined, { keepalive }),
    reorder: (ids) => http.put(`/${name}/reorder`, { order: ids }),
  }
}

export const authApi = {
  login: (email, password) => http.post('/auth/login', { email, password }),
  me: () => http.get('/auth/me'),
  logout: () => http.post('/auth/logout'),
}

export const projectsApi = {
  ...resource('projects'),
  get: (id) => http.get(`/projects/${id}`),
}

/** Site owner's profile (single record). get() returns {} until saved once. */
export const profileApi = {
  get: () => http.get('/profile'),
  update: (data) => http.put('/profile', data),
}
export const certificationsApi = resource('certifications')
export const hobbiesApi = resource('hobbies')
export const timelineApi = resource('timeline')

export const resumeApi = {
  get: () => http.get('/resume'),
  /** @param {{ pdf_url?: string, pdf?: object|null }} data */
  update: (data) => http.put('/resume', data),
}

/**
 * Media — files are uploaded first, then the returned JSON item is saved with the content.
 * collection: 'projects' | 'certifications' | 'hobbies' | 'resume'
 */
export const mediaApi = {
  upload(file, collection, { onProgress, signal } = {}) {
    const form = new FormData()
    form.append('file', file)
    form.append('collection', collection)
    return upload('/media', form, { onProgress, signal })
  },
  /** YouTube / Vimeo link → embed item (nothing is stored) */
  embed: (url) => http.post('/media/embed', { url }),
  /** Delete an uploaded file that was never saved to content */
  discard: (item) =>
    http.delete('/media', {
      provider: item.provider,
      key: item.key,
      resource_type: item.resource_type ?? null,
    }),
}

export const visitorsApi = {
  increment: (visitorId) => http.post('/visitors/increment', { visitor_id: visitorId }),
}

export { ApiError } from './client'

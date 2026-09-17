import { http, upload } from './client'

/** Standard CRUD endpoints for a Laravel resource controller. */
function resource(name) {
  return {
    list: () => http.get(`/${name}`),
    create: (data) => http.post(`/${name}`, data),
    update: (id, data) => http.put(`/${name}/${id}`, data),
    remove: (id) => http.delete(`/${name}/${id}`),
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
  reorder: (ids) => http.put('/projects/reorder', { order: ids }),
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

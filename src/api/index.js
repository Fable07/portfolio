import { http } from './client'

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
  reorder: (ids) => http.put('/projects/reorder', { order: ids }),
}
export const certificationsApi = resource('certifications')
export const hobbiesApi = resource('hobbies')
export const timelineApi = resource('timeline')

export const resumeApi = {
  get: () => http.get('/resume'),
  update: (pdfUrl) => http.put('/resume', { pdf_url: pdfUrl }),
}

export const visitorsApi = {
  increment: (visitorId) => http.post('/visitors/increment', { visitor_id: visitorId }),
}

export { ApiError } from './client'

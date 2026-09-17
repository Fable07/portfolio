const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

if (!BASE_URL) {
  throw new Error('VITE_API_URL is not set. Copy .env.example to .env.local and set it.')
}

export class ApiError extends Error {
  constructor(message, { status = 0, errors = {} } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors // Laravel validation errors: { field: [messages] }
  }
}

let getToken = () => null
let onUnauthorized = () => {}

/** Wire auth into the client without importing the store (avoids circular imports). */
export function configureAuth({ tokenGetter, unauthorizedHandler }) {
  getToken = tokenGetter
  onUnauthorized = unauthorizedHandler
}

export async function request(method, path, body) {
  const options = { method, headers: { Accept: 'application/json' } }
  const token = getToken()
  if (token) options.headers.Authorization = `Bearer ${token}`
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, options)
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.')
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized()
    const message =
      res.status === 429
        ? 'Too many attempts. Please wait a minute and try again.'
        : data?.message || `Request failed (${res.status})`
    throw new ApiError(message, { status: res.status, errors: data?.errors })
  }

  return data
}

export const http = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body ?? {}),
  delete: (path) => request('DELETE', path),
}

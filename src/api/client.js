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

/**
 * Upload a file (multipart/form-data) with progress reporting.
 * Uses XMLHttpRequest because fetch() can't report upload progress.
 *
 * @param {string} path
 * @param {FormData} formData
 * @param {{ onProgress?: (percent: number) => void, signal?: AbortSignal }} options
 */
export function upload(path, formData, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE_URL}${path}`)
    xhr.setRequestHeader('Accept', 'application/json')
    const token = getToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    xhr.onload = () => {
      let data = null
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        // non-JSON error page (e.g. PHP upload limit exceeded)
      }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(data)
      if (xhr.status === 401 && token) onUnauthorized()
      const message =
        xhr.status === 413
          ? 'File is too large for the server.'
          : data?.errors?.file?.[0] || data?.message || `Upload failed (${xhr.status})`
      reject(new ApiError(message, { status: xhr.status, errors: data?.errors }))
    }
    xhr.onerror = () => reject(new ApiError('Upload failed — cannot reach the server.'))
    xhr.onabort = () => reject(new ApiError('Upload cancelled.', { status: 0 }))
    signal?.addEventListener('abort', () => xhr.abort())

    xhr.send(formData)
  })
}

export const http = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body ?? {}),
  delete: (path, body) => request('DELETE', path, body),
}

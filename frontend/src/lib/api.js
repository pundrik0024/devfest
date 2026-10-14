const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || 'https://devfest-6hhn.onrender.com')
    .replace(/\/$/, '')

export function apiFetch(path, options) {
  const url = path.startsWith('/api/') ? `${API_BASE_URL}${path}` : path
  return fetch(url, options)
}

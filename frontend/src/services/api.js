
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export const TOKEN_KEY = 'ruangdegup_token'
export const USER_KEY = 'ruangdegup_user'

/**
 * Resolves storage URLs from backend, fixing localhost references in production
 */
export function getStorageUrl(path) {
  if (!path) return null
  if (path.startsWith('blob:') || path.startsWith('data:')) return path

  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '')

  // Fix localhost / 127.0.0.1 domain coming from server
  if (path.includes('localhost') || path.includes('127.0.0.1')) {
    const storagePath = path.replace(/^https?:\/\/[^/]+/, '')
    return `${apiOrigin}${storagePath.startsWith('/') ? '' : '/'}${storagePath}`
  }

  if (path.startsWith('/storage/')) {
    return `${apiOrigin}${path}`
  }

  if (path.startsWith('storage/')) {
    return `${apiOrigin}/${path}`
  }

  if (path.startsWith('profiles/') || path.startsWith('books/')) {
    return `${apiOrigin}/storage/${path}`
  }

  if (path.startsWith('/')) {
    return `${apiOrigin}${path}`
  }

  return path
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch (e) {
    console.error('Failed to store token:', e)
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  } catch (e) {
    console.error('Failed to store user:', e)
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch (e) {
    console.error('Failed to clear auth:', e)
  }
}

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  const token = getStoredToken()
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let body = options.body
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      body,
    })

    if (res.status === 204) {
      return null
    }

    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await res.json() : await res.text()

    if (!res.ok) {
      const error = new Error(
        (data && data.message) || `Request failed with status ${res.status}`
      )
      error.status = res.status
      error.data = data
      error.errors = data && data.errors ? data.errors : null
      throw error
    }

    return data
  } catch (error) {
    if (!error.status) {
      const netError = new Error(
        'Gagal terhubung ke server perpustakaan. Pastikan server backend sedang aktif.'
      )
      netError.status = 0
      netError.isNetworkError = true
      throw netError
    }
    throw error
  }
}

/* ==========================================================================
   PUBLIC CATALOG
   ========================================================================== */

export async function fetchCatalog(params = {}) {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.kategori) query.append('kategori', params.kategori)
  if (params.page) query.append('page', params.page)

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return apiRequest(`/catalog${queryString}`)
}

/* ==========================================================================
   AUTH
   ========================================================================== */

export async function loginUser(credentials) {
  const data = await apiRequest('/login', {
    method: 'POST',
    body: credentials,
  })
  if (data.token) {
    setStoredToken(data.token)
  }
  if (data.user) {
    setStoredUser(data.user)
  }
  return data
}

export async function registerUser(payload) {
  const data = await apiRequest('/register', {
    method: 'POST',
    body: payload,
  })
  if (data.token) {
    setStoredToken(data.token)
  }
  if (data.user) {
    setStoredUser(data.user)
  }
  return data
}

export async function logoutUser() {
  try {
    await apiRequest('/logout', { method: 'POST' })
  } finally {
    clearAuth()
  }
}

export async function getMe() {
  return apiRequest('/member/me')
}

/* ==========================================================================
   MEMBER SERVICES
   ========================================================================== */

export async function getMemberDashboard() {
  return apiRequest('/member/dashboard')
}

export async function getMemberProfile() {
  return apiRequest('/member/profile')
}

export async function updateMemberProfile(formData) {
  return apiRequest('/member/profile', {
    method: 'POST',
    body: formData, // FormData
  })
}

export async function deleteMemberPhoto() {
  return apiRequest('/member/profile/photo', { method: 'DELETE' })
}

export async function deleteMemberBackground() {
  return apiRequest('/member/profile/background', { method: 'DELETE' })
}

export async function updateMemberPassword(payload) {
  return apiRequest('/member/profile/password', {
    method: 'POST',
    body: payload,
  })
}

export async function getMemberBorrowings() {
  return apiRequest('/member/borrowings')
}

export async function borrowBook(bookId) {
  return apiRequest('/member/borrowings', {
    method: 'POST',
    body: { book_id: bookId },
  })
}

export async function returnMemberBorrowing(id) {
  return apiRequest(`/member/borrowings/${id}/return`, { method: 'POST' })
}

export async function getMemberFavorites() {
  return apiRequest('/member/favorites')
}

export async function addFavorite(bookId) {
  return apiRequest('/member/favorites', {
    method: 'POST',
    body: { book_id: bookId },
  })
}

export async function removeFavorite(bookId) {
  return apiRequest(`/member/favorites/${bookId}`, {
    method: 'DELETE',
  })
}

export async function getMemberReviews() {
  return apiRequest('/member/reviews')
}

export async function createReview({ book_id, rating, ulasan }) {
  return apiRequest('/member/reviews', {
    method: 'POST',
    body: { book_id, rating, ulasan },
  })
}

export async function updateReview(reviewId, { rating, ulasan }) {
  return apiRequest(`/member/reviews/${reviewId}`, {
    method: 'PUT',
    body: { rating, ulasan },
  })
}

export async function deleteReview(reviewId) {
  return apiRequest(`/member/reviews/${reviewId}`, {
    method: 'DELETE',
  })
}

/* ==========================================================================
   ADMIN SERVICES
   ========================================================================== */

export async function getAdminDashboard() {
  return apiRequest('/dashboard')
}

export async function getAdminCategories() {
  return apiRequest('/categories')
}

export async function createAdminCategory(data) {
  return apiRequest('/categories', { method: 'POST', body: data })
}

export async function updateAdminCategory(id, data) {
  return apiRequest(`/categories/${id}`, { method: 'PUT', body: data })
}

export async function deleteAdminCategory(id) {
  return apiRequest(`/categories/${id}`, { method: 'DELETE' })
}

export async function getAdminBooks() {
  return apiRequest('/books')
}

export function createAdminBook(data) {
  return apiRequest('/books', { method: 'POST', body: data })
}

export function updateAdminBook(id, data) {
  if (data instanceof FormData) {
    if (!data.has('_method')) {
      data.append('_method', 'PUT')
    }
    return apiRequest(`/books/${id}`, { method: 'POST', body: data })
  }
  return apiRequest(`/books/${id}`, { method: 'PUT', body: data })
}

export async function deleteAdminBook(id) {
  return apiRequest(`/books/${id}`, { method: 'DELETE' })
}

export async function getAdminMembers() {
  return apiRequest('/members')
}

export async function createAdminMember(data) {
  return apiRequest('/members', { method: 'POST', body: data })
}

export async function updateAdminMember(id, data) {
  return apiRequest(`/members/${id}`, { method: 'PUT', body: data })
}

export async function deleteAdminMember(id) {
  return apiRequest(`/members/${id}`, { method: 'DELETE' })
}

export async function getAdminBorrowings() {
  return apiRequest('/borrowings')
}

export async function createAdminBorrowing(data) {
  return apiRequest('/borrowings', { method: 'POST', body: data })
}

export async function returnAdminBorrowing(id, tanggalKembali) {
  return apiRequest(`/borrowings/${id}`, {
    method: 'PUT',
    body: { tanggal_kembali: tanggalKembali },
  })
}

export async function getBorrowingReports(status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiRequest(`/reports/borrowings${query}`)
}

export async function downloadBorrowingReportPdf(status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  const token = getStoredToken()
  const url = `${API_BASE_URL}/reports/borrowings/pdf${query}`

  const res = await fetch(url, {
    headers: {
      Accept: 'application/pdf',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) {
    throw new Error('Gagal mengunduh laporan PDF')
  }

  const blob = await res.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = 'laporan-peminjaman.pdf'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(downloadUrl)
}

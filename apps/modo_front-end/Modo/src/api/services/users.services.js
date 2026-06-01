/*
  Purpose: Service layer for user CRUD API calls.
  Matches the routes defined in users.routes.js:
    POST   /users                     (admin only)
    GET    /users                     (admin only)
    GET    /users/:userId             (owner or admin)
    PATCH  /users/:userId             (owner or admin)
    DELETE /users/:userId             (owner or admin)
    POST   /users/:userId/habits      (owner or admin)

  NOTE: POST /users requires authenticateUser + authorizeAdmin on the
  backend, so self-registration through this endpoint is NOT possible.
  You must add a public register route on the backend if you want
  open sign-up, or use an existing admin token when calling createUser.
*/

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ── helpers ──────────────────────────────────────────────────────────────────

function bearerHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function handleResponse(res) {
  // 204 No Content has no body
  if (res.status === 204) return { success: true }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data?.description || data?.message || `Error ${res.status}`)
    err.status = res.status
    err.errors = data?.errors || {}
    throw err
  }
  return data
}

// ── user calls ───────────────────────────────────────────────────────────────

/**
 * POST /users
 * Admin only (authenticateUser + authorizeAdmin + validateCreateUser).
 * Body fields (from model): nome, email, password, tipo_utilizador,
 *   pontos, nivel, data_criacao, imagem_utilizador (optional file).
 * Returns: { token, id_utilizador, nome, email, tipo_utilizador,
 *            pontos, nivel, data_criacao_conta, imagem_utilizador,
 *            links, message }
 */
export async function createUser(userData, token, imageFile = null) {
  // If an image is included, send as multipart/form-data
  if (imageFile) {
    const form = new FormData()
    Object.entries(userData).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v)
    })
    form.append('imagem_utilizador', imageFile)
    const headers = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      // Do NOT set Content-Type here; the browser sets the multipart boundary
      headers,
      body: form,
    })
    return handleResponse(res)
  }

  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify(userData),
  })
  return handleResponse(res)
}

/**
 * GET /users
 * Admin only. Supports query params: page, limit, role, sort, order, q
 * Returns: { meta: { total, page, limit, pages }, data: [...users] }
 */
export async function getAllUsers(token, params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v)
  })
  const query = qs.toString() ? `?${qs.toString()}` : ''

  const res = await fetch(`${BASE_URL}/users${query}`, {
    method: 'GET',
    headers: bearerHeaders(token),
  })
  return handleResponse(res)
}

/**
 * GET /users/:userId
 * Requires auth. Owner or admin only (enforced by controller).
 * Returns: { id_utilizador, nome, email, tipo_utilizador,
 *            pontos, nivel, data_criacao_conta, imagem_utilizador, links }
 */
export async function getUserById(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'GET',
    credentials: 'include',
  })
  return handleResponse(res)
}

/**
 * PATCH /users/:userId
 * Requires auth. Owner or admin only (enforced by controller).
 * Updatable body fields: nome, email, password, imagem_utilizador (file).
 * Returns: { id_utilizador, nome, email, ..., links }
 */
export async function updateUser(userId, updates, token, imageFile = null) {
  const isForm = imageFile != null
  const opts = {
    method: 'PATCH',
    credentials: 'include',
  }
  if (isForm) {
    const fd = new FormData()
    Object.keys(updates).forEach((k) => fd.append(k, updates[k]))
    fd.append('imagem_utilizador', imageFile)
    opts.body = fd
  } else {
    opts.headers = { 'Content-Type': 'application/json' }
    opts.body = JSON.stringify(updates)
  }
  const res = await fetch(`${BASE_URL}/users/${userId}`, opts)
  return handleResponse(res)
}

/**
 * DELETE /users/:userId
 * Requires auth. Owner or admin only (authorizeOwnerOrAdmin middleware).
 * Returns 204 No Content on success → { success: true }
 */
export async function deleteUser(userId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: bearerHeaders(token),
  })
  return handleResponse(res)
}

/**
 * POST /users/:userId/habits
 * Requires auth. Owner or admin only.
 * Body: { habitId }  (controller also accepts id_habito)
 * Returns: { id_utilizador, nome, ..., links }
 */
export async function assignHabitToUser(userId, habitId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/habits`, {
    method: 'POST',
    headers: bearerHeaders(token),
    body: JSON.stringify({ habitId }),
  })
  return handleResponse(res)
}

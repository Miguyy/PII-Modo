/*
  Purpose: Service layer for authentication-related API calls.
  Covers login, logout, forgot-password and reset-password,
  matching the routes defined in users.routes.js:
    POST /users/login
    POST /users/logout          (requires Bearer token)
    POST /users/forgot-password
    POST /users/forgot-password/:token
    POST /users/reset-password
*/

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ── helpers ──────────────────────────────────────────────────────────────────

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data?.description || data?.message || `Error ${res.status}`)
    err.status = res.status
    err.errors = data?.errors || {}
    throw err
  }
  return data
}

// ── auth calls ───────────────────────────────────────────────────────────────

/**
 * POST /users/login
 * Body: { email, password }
 * Returns: { message, token, role }
 *   - token: JWT signed with { id, tipo_utilizador }
 *   - role:  'admin' | 'client'
 */
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // <-- send/receive cookies
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(res) // server should return id and role (no token required)
}

/**
 * POST /users/logout
 * Requires Authorization: Bearer <token>
 * Stateless on the backend — client must discard its token.
 * Returns: { message }
 */
export async function logout() {
  const res = await fetch(`${BASE_URL}/users/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  return handleResponse(res)
}

/**
 * POST /users/forgot-password
 * Body: { email }
 * Returns: { message } — always 200 to avoid leaking whether email exists.
 * In dev the response also includes { token } for testing.
 */
export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return handleResponse(res)
}

/**
 * POST /users/reset-password
 * Body: { token, password }
 * Returns: { message }
 */
export async function resetPassword(token, password) {
  const res = await fetch(`${BASE_URL}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })
  return handleResponse(res)
}

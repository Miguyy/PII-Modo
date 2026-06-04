/*
  Purpose: Service layer for authentication-related API calls.
*/

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: typeof email === 'string' ? email.trim().toLowerCase() : email,
      password,
    }),
  })
  return handleResponse(res)
}

export async function logout() {
  const res = await fetch(`${BASE_URL}/users/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return handleResponse(res)
}

export async function resetPassword(token, password) {
  const res = await fetch(`${BASE_URL}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })
  return handleResponse(res)
}
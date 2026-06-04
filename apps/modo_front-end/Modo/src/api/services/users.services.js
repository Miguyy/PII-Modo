/*
  Purpose: Service layer for user CRUD API calls.
*/

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function bearerHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse(res) {
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

export async function createUser(userData, token, imageFile = null) {
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
      credentials: 'include',
      headers,
      body: form,
    })
    return handleResponse(res)
  }

  const headers = { 'Content-Type': 'application/json', ...bearerHeaders(token) }
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(userData),
  })
  return handleResponse(res)
}

export async function getAllUsers(token, params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v)
  })
  const query = qs.toString() ? `?${qs.toString()}` : ''

  const res = await fetch(`${BASE_URL}/users${query}`, {
    method: 'GET',
    credentials: 'include',
    headers: bearerHeaders(token),
  })
  return handleResponse(res)
}

export async function getUserById(userId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: bearerHeaders(token),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function updateUser(userId, updates, token, imageFile = null) {
  const isForm = imageFile != null
  const opts = {
    method: 'PATCH',
    credentials: 'include',
  }
  if (isForm) {
    const fd = new FormData()
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v)
    })
    fd.append('imagem_utilizador', imageFile)
    opts.body = fd
    if (token) opts.headers = { Authorization: `Bearer ${token}` }
  } else {
    opts.headers = { 'Content-Type': 'application/json', ...bearerHeaders(token) }
    opts.body = JSON.stringify(updates)
  }
  const res = await fetch(`${BASE_URL}/users/${userId}`, opts)
  return handleResponse(res)
}

export async function deleteUser(userId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: bearerHeaders(token),
  })
  return handleResponse(res)
}

export async function assignHabitToUser(userId, habitId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/habits`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...bearerHeaders(token) },
    body: JSON.stringify({ habitId }),
  })
  return handleResponse(res)
}
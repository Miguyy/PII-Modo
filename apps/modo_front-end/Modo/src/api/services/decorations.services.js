/*
  Purpose: Service layer for Decoration CRUD API calls.
*/

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function handleResponse(res) {
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    throw data || { message: res.statusText }
  }
  return data
}

function bearerHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getAllDecorations(params = {}, token) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v)
  })
  const query = qs.toString() ? `?${qs.toString()}` : ''
  const res = await fetch(`${BASE_URL}/avatar-decorations${query}`, {
    credentials: 'include',
    headers: {
      ...bearerHeaders(token),
    },
  })
  return handleResponse(res)
}

export async function createDecoration(formData, token) {
  const res = await fetch(`${BASE_URL}/avatar-decorations`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...bearerHeaders(token),
    },
    body: formData,
  })
  return handleResponse(res)
}

export async function updateDecoration(id, formData, token) {
  const res = await fetch(`${BASE_URL}/avatar-decorations/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      ...bearerHeaders(token),
    },
    body: formData,
  })
  return handleResponse(res)
}

export async function deleteDecoration(id, token) {
  const res = await fetch(`${BASE_URL}/avatar-decorations/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      ...bearerHeaders(token),
    },
  })
  return handleResponse(res)
}

export default {
  getAllDecorations,
  createDecoration,
  updateDecoration,
  deleteDecoration,
}
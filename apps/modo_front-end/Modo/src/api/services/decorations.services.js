/*
  Purpose: Service layer for Decoration CRUD API calls.
  This module provides functions to handle creating, reading, updating, and deleting avatar decorations.
  Each function makes a fetch request to the appropriate endpoint and processes the response, throwing errors with detailed messages when necessary.
*/

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/* 
  Helper function to process fetch responses.
  It attempts to parse the response as JSON, but falls back to text if parsing fails.
  If the response is not OK, it throws an error with the parsed data or a default message.
*/

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

/*
  Helper function to construct headers with an optional Bearer token.
  If a token is provided, it returns an object with the Authorization header set.
  Otherwise, it returns an empty object.
*/

function bearerHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/* 
  Fetches a list of avatar decorations from the API, with optional query parameters for filtering.
  It constructs a query string from the provided parameters and includes the Bearer token in the headers if available.
  The response is processed using the handleResponse function, which will throw an error if the request fails.
*/

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

/* 
  Creates a new avatar decoration by sending a POST request with the provided form data.
  The Bearer token is included in the headers if available.
  The response is processed using the handleResponse function, which will throw an error if the request fails.
*/

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

/* 
  Updates an existing avatar decoration by sending a PATCH request with the provided form data and decoration ID.
  The Bearer token is included in the headers if available.
  The response is processed using the handleResponse function, which will throw an error if the request fails.
*/

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

/* 
  Deletes an existing avatar decoration by sending a DELETE request with the decoration ID.
  The Bearer token is included in the headers if available.
  The response is processed using the handleResponse function, which will throw an error if the request fails.
*/

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

/*
  Exporting all service functions as an object for easy import in other parts of the application.
*/

export default {
  getAllDecorations,
  createDecoration,
  updateDecoration,
  deleteDecoration,
}

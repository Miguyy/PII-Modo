/*
  Purpose: Service layer for user CRUD API calls.
*/

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/*
  Helper function to handle API responses. It checks if the response is OK and parses the JSON data. If the response is not OK, it throws an error with the message from the response or the status text.
*/

function bearerHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/*
  Helper function to handle API responses. It checks if the response is OK and parses the JSON data. If the response is not OK, it throws an error with the message from the response or the status text.
*/

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

/*
  Create a new user with the provided data. If an image file is included, it sends a multipart/form-data request; otherwise, it sends a JSON request.
*/

export async function createUser(userData, token, imageFile = null) {
  /*
    If an image file is provided, we need to use FormData to send the request as multipart/form-data. We append all user data fields and the image file to the FormData object. If a token is provided, we include it in the Authorization header.
  */
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

  /*
    If no image file is provided, we can send the user data as JSON. We set the Content-Type header to application/json and include the Bearer token if provided.
  */

  const headers = { 'Content-Type': 'application/json', ...bearerHeaders(token) }
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(userData),
  })
  return handleResponse(res)
}

/*
  Get a list of all users, optionally filtered by query parameters. The params object can include any valid query parameters supported by the API, such as search, page, limit, etc. The function constructs the query string from the params object and includes the Bearer token in the headers if provided.
*/

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

/*
  Get a user by their ID. The function sends a GET request to the /users/:userId endpoint, including the Bearer token in the headers if provided.
*/

export async function getUserById(userId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: bearerHeaders(token),
    credentials: 'include',
  })
  return handleResponse(res)
}

/*
  Update a user's information. The function can handle both JSON updates and multipart/form-data updates if an image file is included. It sends a PATCH request to the /users/:userId endpoint with the appropriate headers and body based on whether an image file is provided.
*/

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

/*
  Delete a user by their ID. The function sends a DELETE request to the /users/:userId endpoint, including the Bearer token in the headers if provided.
*/

export async function deleteUser(userId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: bearerHeaders(token),
  })
  return handleResponse(res)
}

/*  
  Assign a habit to a user. The function sends a POST request to the /users/:userId/habits endpoint with the habit ID in the request body. It includes the Bearer token in the headers if provided.
*/

export async function assignHabitToUser(userId, habitId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/habits`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...bearerHeaders(token) },
    body: JSON.stringify({ habitId }),
  })
  return handleResponse(res)
}

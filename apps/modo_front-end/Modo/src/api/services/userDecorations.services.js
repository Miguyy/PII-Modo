const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/*
  Helper function to handle API responses. It checks if the response is OK and parses the JSON data. If the response is not OK, it throws an error with the message from the response or the status text.
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
  Helper function to create headers with Bearer token if provided.
*/

function bearerHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * POST /users/:userId/avatar-decorations
 * Unlock / assign a decoration to a user
 */
export async function assignDecorationToUser(userId, formData, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/avatar-decorations`, {
    method: 'POST',
    headers: {
      ...bearerHeaders(token),
    },
    body: formData,
  })

  return handleResponse(res)
}

/**
 * GET /users/:userId/avatar-decorations
 * Get all decorations owned by a user
 */
export async function getUserDecorations(userId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/avatar-decorations`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * PATCH /users/:userId/avatar-decorations/:decorationId
 * Activate / switch a specific decoration
 */
export async function activateUserDecoration(userId, decorationId, payload, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/avatar-decorations/${decorationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...bearerHeaders(token),
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}

/*
  Export all service functions as a default object for easy imports in other modules.
*/

export default {
  assignDecorationToUser,
  getUserDecorations,
  activateUserDecoration,
}

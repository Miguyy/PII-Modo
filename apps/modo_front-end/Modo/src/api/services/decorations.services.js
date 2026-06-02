/*
  Purpose: Service layer for Decoration CRUD API calls.

  Matches the routes defined in decorations.routes.js:

    GET    /avatar-decorations         (authenticated users)
    POST   /avatar-decorations         (admin only)
    PATCH  /avatar-decorations/:id     (admin only)
    DELETE /avatar-decorations/:id     (admin only)

  Notes:
  - All endpoints require authentication.
  - POST and PATCH expect FormData because decoration images
    are uploaded using multer (`uploadReport.single("caminho_decoracao")`).
  - Do NOT manually set the Content-Type header when sending
    FormData; the browser will generate the multipart boundary.
  - GET returns paginated decoration data from the backend.
*/

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Parses API responses and throws backend errors when present.
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

/**
 * Returns Authorization header when a token is available.
 */
function bearerHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * getAllDecorations(token)
 *
 * Retrieves all available decorations.
 *
 * Backend:
 *   GET /avatar-decorations
 *
 * Authentication:
 *   Required
 */
export async function getAllDecorations(token) {
  const res = await fetch(`${BASE_URL}/avatar-decorations`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * createDecoration(formData, token)
 *
 * Creates a new decoration.
 *
 * Backend:
 *   POST /avatar-decorations
 *
 * Authentication:
 *   Admin only
 */
export async function createDecoration(formData, token) {
  const res = await fetch(`${BASE_URL}/avatar-decorations`, {
    method: 'POST',
    headers: {
      ...bearerHeaders(token),
    },
    body: formData,
  })

  return handleResponse(res)
}

/**
 * updateDecoration(id, formData, token)
 *
 * Updates an existing decoration.
 *
 * Backend:
 *   PATCH /avatar-decorations/:id
 *
 * Authentication:
 *   Admin only
 */
export async function updateDecoration(id, formData, token) {
  const res = await fetch(`${BASE_URL}/avatar-decorations/${id}`, {
    method: 'PATCH',
    headers: {
      ...bearerHeaders(token),
    },
    body: formData,
  })

  return handleResponse(res)
}

/**
 * deleteDecoration(id, token)
 *
 * Deletes a decoration.
 *
 * Backend:
 *   DELETE /avatar-decorations/:id
 *
 * Authentication:
 *   Admin only
 */
export async function deleteDecoration(id, token) {
  const res = await fetch(`${BASE_URL}/avatar-decorations/${id}`, {
    method: 'DELETE',
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

/*
  Purpose: Service layer for User Location API calls.

  Matches the routes defined in locations.routes.js:

    POST   /users/:userId/location     (owner or admin)
    GET    /users/:userId/location     (authenticated user)
    PATCH  /users/:userId/location     (owner or admin)
    DELETE /users/:userId/location     (admin only)
    GET    /locations                  (admin only, all locations)

  Notes:
  - All endpoints require authentication.
  - POST and PATCH are restricted to owner or admin users.
  - DELETE and GET /locations are admin-only.
  - Payload is sent as JSON (no file uploads).
  - Location data includes latitude, longitude, cidade, and pais.
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
 * getAllLocations(token)
 *
 * Retrieves all user locations (admin only).
 *
 * Backend:
 *   GET /locations
 *
 * Authentication:
 *   Admin only
 */
export async function getAllLocations(token) {
  const res = await fetch(`${BASE_URL}/locations`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * createLocation(userId, payload, token)
 *
 * Creates a location for a user.
 *
 * Backend:
 *   POST /users/:userId/location
 *
 * Authentication:
 *   Owner or Admin
 */
export async function createLocation(userId, payload, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...bearerHeaders(token),
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}

/**
 * getLocation(userId, token)
 *
 * Retrieves a user's location.
 *
 * Backend:
 *   GET /users/:userId/location
 */
export async function getLocation(userId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/location`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * updateLocation(userId, payload, token)
 *
 * Updates a user location.
 *
 * Backend:
 *   PATCH /users/:userId/location
 */
export async function updateLocation(userId, payload, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/location`, {
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
  getAllLocations,
  createLocation,
  getLocation,
  updateLocation,
}

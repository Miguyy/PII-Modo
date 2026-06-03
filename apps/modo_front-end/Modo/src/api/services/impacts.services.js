/*
  Purpose: Service layer for Impact CRUD API calls.

  Matches the routes defined in impacts.routes.js:

    GET    /impacts                (authenticated users)
    POST   /impacts                (admin only)
    DELETE /impacts/:impactId      (admin only)

  Notes:
  - All endpoints require authentication.
  - GET returns all impacts (no pagination currently implemented).
  - POST and DELETE are restricted to admin users.
  - POST expects a JSON payload with impact data.
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
 * getAllImpacts(token)
 *
 * Retrieves all impacts.
 *
 * Backend:
 *   GET /impacts
 *
 * Authentication:
 *   Required
 */
export async function getAllImpacts(token) {
  const res = await fetch(`${BASE_URL}/impacts`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * createImpact(payload, token)
 *
 * Creates a new impact.
 *
 * Backend:
 *   POST /impacts
 *
 * Authentication:
 *   Admin only
 *
 * Expected payload:
 *   - tipo_impacto (string: Water | Energy | Residuals | Mobility | Emissions)
 *   - valor_por_unidade (number > 0)
 *   - unidade (string: Litters | kWh | kg | km | kg CO2e)
 */
export async function createImpact(payload, token, taskId) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/impacts`, {
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
 * deleteImpact(impactId, token)
 *
 * Deletes an impact by ID.
 *
 * Backend:
 *   DELETE /impacts/:impactId
 *
 * Authentication:
 *   Admin only
 */
export async function deleteImpact(impactId, token) {
  const res = await fetch(`${BASE_URL}/impacts/${impactId}`, {
    method: 'DELETE',
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * getTaskImpacts(taskId, token)
 * * Retrieves all impact entries associated with a specific task ID.
 * Backend route: GET /tasks/:taskId/impacts
 */
export async function getTaskImpacts(taskId, token) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/impacts`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

export default {
  getAllImpacts,
  createImpact,
  deleteImpact,
  getTaskImpacts,
}

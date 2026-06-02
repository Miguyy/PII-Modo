/*
  Purpose: Service layer for Habit CRUD API calls.

  Matches the routes defined in habits.routes.js:

    GET    /habits               (authenticated users)
    GET    /habits/:habitId      (authenticated users)
    POST   /habits               (admin only)
    PATCH  /habits/:habitId      (admin only)
    DELETE /habits/:habitId      (admin only)

  Notes:
  - All endpoints require authentication.
  - POST, PATCH, and DELETE are restricted to admin users.
  - POST and PATCH send JSON payloads (not FormData).
  - Payload fields are validated on backend via validateCreateHabit middleware.
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
 * getAllHabits(token)
 *
 * Retrieves all habits.
 *
 * Backend:
 *   GET /habits
 *
 * Authentication:
 *   Required
 */
export async function getAllHabits(token) {
  const res = await fetch(`${BASE_URL}/habits`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * getHabitById(habitId, token)
 *
 * Retrieves a single habit by its ID.
 *
 * Backend:
 *   GET /habits/:habitId
 *
 * Authentication:
 *   Required
 */
export async function getHabitById(habitId, token) {
  const res = await fetch(`${BASE_URL}/habits/${habitId}`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * createHabit(payload, token)
 *
 * Creates a new habit.
 *
 * Backend:
 *   POST /habits
 *
 * Authentication:
 *   Admin only
 *
 * Expected payload:
 *   - nome OR nome_habito (string)
 *   - descricao_habito (string)
 *   - categoria (string)
 */
export async function createHabit(payload, token) {
  const res = await fetch(`${BASE_URL}/habits`, {
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
 * updateHabit(habitId, payload, token)
 *
 * Updates an existing habit.
 *
 * Backend:
 *   PATCH /habits/:habitId
 *
 * Authentication:
 *   Admin only
 *
 * Expected payload:
 *   - nome OR nome_habito (optional)
 *   - descricao_habito (optional)
 *   - categoria (optional)
 */
export async function updateHabit(habitId, payload, token) {
  const res = await fetch(`${BASE_URL}/habits/${habitId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...bearerHeaders(token),
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}

/**
 * deleteHabit(habitId, token)
 *
 * Deletes a habit.
 *
 * Backend:
 *   DELETE /habits/:habitId
 *
 * Authentication:
 *   Admin only
 */
export async function deleteHabit(habitId, token) {
  const res = await fetch(`${BASE_URL}/habits/${habitId}`, {
    method: 'DELETE',
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

export default {
  getAllHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
}

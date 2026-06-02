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

/**
 * GET /users/:userId/tasks
 * Retrieves all tasks assigned to a user
 */
export async function getUserTasks(userId, token, params = {}) {
  const qs = new URLSearchParams(params).toString()

  const url = `${BASE_URL}/users/${userId}/tasks${qs ? `?${qs}` : ''}`

  const res = await fetch(url, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * POST /users/:userId/tasks
 * Assign a task to a user
 */
export async function assignTaskToUser(userId, payload, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/tasks`, {
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
 * POST /users/:userId/habits
 * Assign all tasks from a habit to a user
 */
export async function assignHabitTasksToUser(userId, payload, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/habits`, {
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
 * GET /users/:userId/tasks/:taskId
 * Get a specific user task
 */
export async function getUserTaskById(userId, taskId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/tasks/${taskId}`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * PATCH /users/:userId/tasks/:taskId/progress
 * Update task progress
 */
export async function updateUserTask(userId, taskId, payload, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/tasks/${taskId}/progress`, {
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
 * POST /users/:userId/tasks/:taskId/complete
 * Mark task as completed
 */
export async function completeUserTask(userId, taskId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * DELETE /users/:userId/tasks/:taskId
 * Remove a task from a user
 */
export async function deleteUserTask(userId, taskId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

export default {
  getUserTasks,
  assignTaskToUser,
  assignHabitTasksToUser,
  getUserTaskById,
  updateUserTask,
  completeUserTask,
  deleteUserTask,
}

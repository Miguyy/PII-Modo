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
    const err = data || { message: res.statusText }
    throw err
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
 * getAllTasks(token)
 *
 * Retrieves all tasks.
 *
 * Backend:
 *   GET /tasks
 *
 * Authentication:
 *   Required (admin + users allowed by backend)
 */
export async function getAllTasks(token) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * getTaskById(taskId, token)
 *
 * Retrieves a specific task.
 *
 * Backend:
 *   GET /tasks/:taskId
 *
 * Authentication:
 *   Required
 */
export async function getTaskById(taskId, token) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * createTask(payload, token)
 *
 * Creates a new task.
 *
 * Backend:
 *   POST /tasks
 *
 * Authentication:
 *   Admin only
 *
 * Expected payload:
 *   - id_habito (optional)
 *   - nome_tarefa or nome (required)
 *   - pontos_tarefa
 *   - tipo_tarefa ("Check" | "Count" | "Timer")
 *   - localizacao_tarefa ("Inside" | "Outside")
 *   - prioridade_tarefa ("Low" | "Medium" | "High")
 *   - duracao_temporizador (optional)
 *   - quantidade_necessaria (optional)
 */
export async function createTask(payload, token) {
  const res = await fetch(`${BASE_URL}/tasks`, {
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
 * updateTask(taskId, payload, token)
 *
 * Updates a task.
 *
 * Backend:
 *   PATCH /tasks/:taskId
 *
 * Authentication:
 *   Admin only
 */
export async function updateTask(taskId, payload, token) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
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
 * deleteTask(taskId, token)
 *
 * Deletes a task.
 *
 * Backend:
 *   DELETE /tasks/:taskId
 *
 * Authentication:
 *   Admin only
 */
export async function deleteTask(taskId, token) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * getTaskImpacts(taskId, token)
 *
 * Retrieves impacts associated with a task.
 *
 * Backend:
 *   GET /tasks/:taskId/impacts
 *
 * Authentication:
 *   Required
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
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskImpacts,
}

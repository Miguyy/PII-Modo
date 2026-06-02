/*
  Purpose: Service layer for Notification API calls.

  Matches backend routes:

    GET    /notifications                           (admin only)
    GET    /users/:userId/notifications             (authenticated users)
    POST   /users/:userId/notifications             (admin only)
    GET    /notifications/:notificationId           (authenticated users)
    PATCH  /notifications/:notificationId           (authenticated users)
    DELETE /notifications/:notificationId           (admin only)

  Notes:
  - All endpoints require authentication.
  - Admin-only permissions are enforced on the backend.
  - PATCH is mainly used to mark notifications as read (lida).
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
 * getAllNotifications(token)
 *
 * Admin-only: retrieves all notifications.
 *
 * Backend:
 *   GET /notifications
 */
export async function getAllNotifications(token) {
  const res = await fetch(`${BASE_URL}/notifications`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * getUserNotifications(userId, token)
 *
 * Retrieves notifications for a specific user.
 *
 * Backend:
 *   GET /users/:userId/notifications
 */
export async function getUserNotifications(userId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/notifications`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * createNotification(userId, payload, token)
 *
 * Admin-only: creates a notification for a user.
 *
 * Backend:
 *   POST /users/:userId/notifications
 */
export async function createNotification(userId, payload, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/notifications`, {
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
 * getNotificationById(notificationId, token)
 *
 * Retrieves a single notification.
 *
 * Backend:
 *   GET /notifications/:notificationId
 */
export async function getNotificationById(notificationId, token) {
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * updateNotification(notificationId, payload, token)
 *
 * Updates a notification (usually marking as read).
 *
 * Backend:
 *   PATCH /notifications/:notificationId
 *
 * Expected payload:
 *   - lida (boolean)
 */
export async function updateNotification(notificationId, payload, token) {
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
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
 * deleteNotification(notificationId, token)
 *
 * Admin-only: deletes a notification.
 *
 * Backend:
 *   DELETE /notifications/:notificationId
 */
export async function deleteNotification(notificationId, token) {
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

export default {
  getAllNotifications,
  getUserNotifications,
  createNotification,
  getNotificationById,
  updateNotification,
  deleteNotification,
}

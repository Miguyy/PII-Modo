/*
  Purpose: Service layer for Notification API calls.
*/

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

export async function getAllNotifications(token) {
  const res = await fetch(`${BASE_URL}/notifications`, {
    credentials: 'include',
    headers: {
      ...bearerHeaders(token),
    },
  })
  return handleResponse(res)
}

export async function getUserNotifications(userId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/notifications`, {
    credentials: 'include',
    headers: {
      ...bearerHeaders(token),
    },
  })
  return handleResponse(res)
}

export async function createNotification(userId, payload, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/notifications`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...bearerHeaders(token),
    },
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function broadcastNotification(payload, token) {
  const res = await fetch(`${BASE_URL}/notifications/broadcast`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...bearerHeaders(token),
    },
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function getNotificationById(notificationId, token) {
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
    credentials: 'include',
    headers: {
      ...bearerHeaders(token),
    },
  })
  return handleResponse(res)
}

export async function updateNotification(notificationId, payload, token) {
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...bearerHeaders(token),
    },
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function deleteNotification(notificationId, token) {
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    credentials: 'include',
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
  broadcastNotification,
}
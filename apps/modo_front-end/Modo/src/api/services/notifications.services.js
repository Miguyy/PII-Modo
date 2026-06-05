/*
  Purpose: Service layer for Notification API calls.
*/

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

/*
  Service functions for Notifications API endpoints. Each function corresponds to a specific API endpoint and HTTP method, handling the request and response accordingly.
*/

export async function getAllNotifications(token) {
  const res = await fetch(`${BASE_URL}/notifications`, {
    credentials: 'include',
    headers: {
      ...bearerHeaders(token),
    },
  })
  return handleResponse(res)
}

/*
  Get notifications for a specific user by their ID. This endpoint is useful for fetching notifications that are relevant to a particular user, such as messages, alerts, or updates.
*/

export async function getUserNotifications(userId, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/notifications`, {
    credentials: 'include',
    headers: {
      ...bearerHeaders(token),
    },
  })
  return handleResponse(res)
}

/*
  Create a new notification for a specific user. The payload should contain the necessary information for the notification, such as the message, type, and any relevant metadata. This endpoint allows you to send notifications to users based on certain events or actions within the application.
*/

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

/*
  Broadcast a notification to all users. This endpoint is useful for sending announcements, updates, or alerts that are relevant to the entire user base. The payload should contain the necessary information for the notification, such as the message, type, and any relevant metadata.
*/

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

/*
  Get a specific notification by its ID. This endpoint allows you to retrieve detailed information about a particular notification, such as its content, status, and any associated metadata. This can be useful for displaying the notification details in the user interface or for processing the notification in some way.
*/

export async function getNotificationById(notificationId, token) {
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
    credentials: 'include',
    headers: {
      ...bearerHeaders(token),
    },
  })
  return handleResponse(res)
}

/*
  Update a specific notification by its ID. This endpoint allows you to modify the content, status, or any other relevant information of an existing notification. The payload should contain the fields that you want to update. This can be useful for marking a notification as read, changing its message, or updating any associated metadata.
*/

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

/*
  Delete a specific notification by its ID. This endpoint allows you to remove a notification from the system, which can be useful for cleaning up old or irrelevant notifications. Once deleted, the notification will no longer be retrievable or visible to users.
*/

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

/*
  Export all service functions as a default object for easy imports in other modules.
*/

export default {
  getAllNotifications,
  getUserNotifications,
  createNotification,
  getNotificationById,
  updateNotification,
  deleteNotification,
  broadcastNotification,
}

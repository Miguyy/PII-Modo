/*
  Purpose: Service layer for Report API calls.

  Matches backend routes:

    GET    /reports                              (admin only, optional ?userId filter)
    GET    /reports/:reportId                    (authenticated users)
    POST   /users/:userId/reports               (authenticated users)
    DELETE /reports/:reportId                   (admin only)

  Notes:
  - All endpoints require authentication.
  - Admin-only rules are enforced by backend.
  - POST supports file upload via multipart/form-data (caminho_relatorio).
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
 * getAllReports(token, userId?)
 *
 * Retrieves all reports (admin-only).
 * Can optionally filter by userId (?userId=X).
 *
 * Backend:
 *   GET /reports
 */
export async function getAllReports(token, userId) {
  const url = userId ? `${BASE_URL}/reports?userId=${userId}` : `${BASE_URL}/reports`

  const res = await fetch(url, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * getReportById(reportId, token)
 *
 * Retrieves a single report.
 *
 * Backend:
 *   GET /reports/:reportId
 */
export async function getReportById(reportId, token) {
  const res = await fetch(`${BASE_URL}/reports/${reportId}`, {
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

/**
 * createReportForUser(userId, payload, token)
 *
 * Creates a report for a user.
 *
 * Backend:
 *   POST /users/:userId/reports
 *
 * IMPORTANT:
 * - Must use FormData if uploading file (caminho_relatorio)
 * - Do NOT set Content-Type manually
 */
export async function createReportForUser(userId, formData, token) {
  const res = await fetch(`${BASE_URL}/users/${userId}/reports`, {
    method: 'POST',
    headers: {
      ...bearerHeaders(token),
    },
    body: formData,
  })

  return handleResponse(res)
}

/**
 * deleteReport(reportId, token)
 *
 * Deletes a report.
 *
 * Backend:
 *   DELETE /reports/:reportId
 */
export async function deleteReport(reportId, token) {
  const res = await fetch(`${BASE_URL}/reports/${reportId}`, {
    method: 'DELETE',
    headers: {
      ...bearerHeaders(token),
    },
  })

  return handleResponse(res)
}

export default {
  getAllReports,
  getReportById,
  createReportForUser,
  deleteReport,
}

/*
  Purpose: Service layer for authentication-related API calls.
  This module provides functions to handle user login, logout, password reset, and forgot password flows.
  Each function makes a fetch request to the appropriate endpoint and processes the response, throwing errors with detailed messages when necessary.
*/

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/*
  handleResponse(res)

  Parses the API response and throws an error if the response is not ok.
  The error includes the status code and any message or description provided by the backend.
*/

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data?.description || data?.message || `Error ${res.status}`)
    err.status = res.status
    err.errors = data?.errors || {}
    throw err
  }
  return data
}

/*
  login(email, password)

  Logs in a user with the provided email and password.
  The email is trimmed and converted to lowercase before being sent to the backend.
  On success, returns the user data and authentication token.
*/

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: typeof email === 'string' ? email.trim().toLowerCase() : email,
      password,
    }),
  })
  return handleResponse(res)
}

/* 
  logout()

  Logs out the current user by making a POST request to the logout endpoint.
  On success, returns a confirmation message.
*/

export async function logout() {
  const res = await fetch(`${BASE_URL}/users/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  return handleResponse(res)
}

/* 
  forgotPassword(email)

  Initiates the forgot password flow by sending the user's email to the backend.
  On success, returns a confirmation message that a reset link has been sent if the email exists.
*/

export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return handleResponse(res)
}

/*
  resetPassword(token, password)

  Resets the user's password using the provided reset token and new password.
  On success, returns a confirmation message that the password has been reset.
*/

export async function resetPassword(token, password) {
  const res = await fetch(`${BASE_URL}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })
  return handleResponse(res)
}

const BASE_URL = 'http://localhost:3000'

async function request(endpoint, options = {}) {
  const { method = 'GET', body = null } = options

  const config = { method }

  if (body) {
    config.headers = { 'Content-Type': 'application/json' }
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return method === 'DELETE' ? response.ok : await response.json()
}

function get(endpoint) {
  return request(endpoint, { method: 'GET' })
}

function post(endpoint, data) {
  return request(endpoint, { method: 'POST', body: data })
}

function put(endpoint, data) {
  return request(endpoint, { method: 'PUT', body: data })
}

function del(endpoint) {
  return request(endpoint, { method: 'DELETE' })
}

function usersList() {
  return get('/users')
}

function createUser(userData) {
  return post('/users', userData)
}

function updateUser(id, userData) {
  return put(`/users/${id}`, userData)
}

function deleteUser(id) {
  return del(`/users/${id}`)
}

function habitsList() {
  return get('/habits')
}

function createHabit(habitData) {
  return post('/habits', habitData)
}

function updateHabit(id, habitData) {
  return put(`/habits/${id}`, habitData)
}

function deleteHabit(id) {
  return del(`/habits/${id}`)
}

function patch(endpoint, data) {
  return request(endpoint, { method: 'PATCH', body: data })
}

export {
  usersList,
  createUser,
  updateUser,
  deleteUser,
  habitsList,
  createHabit,
  updateHabit,
  deleteHabit,
  patch,
}

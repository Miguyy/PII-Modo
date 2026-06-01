/*
  Purpose: Pinia store for user state.
  Uses auth.services.js and users.services.js to talk to the real API.
  Token is kept in sessionStorage so it survives a page refresh but is
  cleared when the browser tab is closed.
*/

import { defineStore } from 'pinia'
import { login, logout as logoutApi } from '../api/services/auth.services'
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../api/services/users.services'

const TOKEN_KEY = 'modo_token'
const STORAGE_KEY = 'modo_user'

export const useUserStore = defineStore('user', {
  state: () => ({
    // Full user object from GET /users/:userId
    currentUser: null,

    // JWT string
    token: null,

    // 'admin' | 'client' | null — comes from the login response
    role: null,

    // Admin: list of all users from GET /users
    users: [],

    // Pagination meta from GET /users
    usersMeta: { total: 0, page: 1, limit: 5, pages: 1 },

    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    isAdmin: (state) => (state.currentUser?.tipo_utilizador || '').toLowerCase() === 'admin',
  },

  actions: {
    // ── internal helpers ──────────────────────────────────────────────────

    _saveToken(token, role) {
      this.token = token
      this.role = role
      sessionStorage.setItem(TOKEN_KEY, token)
    },

    _clearSession() {
      this.token = null
      this.role = null
      this.currentUser = null
      sessionStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(STORAGE_KEY)
    },

    // Decode the JWT payload without a library — we only need the `id`
    _decodeToken(token) {
      try {
        return JSON.parse(atob(token.split('.')[1]))
      } catch {
        return null
      }
    },

    async loadFromLocalStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        this.currentUser = parsed.currentUser || null
        this.nome =
          parsed.nome ||
          (parsed.currentUser && (parsed.currentUser.nome || parsed.currentUser.name)) ||
          null
        this.role = parsed.role || (parsed.currentUser && parsed.currentUser.role) || null
      } catch (err) {
        console.error('Failed loading user from localStorage', err)
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    saveToLocalStorage() {
      try {
        const payload = {
          currentUser: this.currentUser,
          nome: this.nome,
          role: this.role,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch (err) {
        console.error('Failed saving user to localStorage', err)
      }
    },

    clearLocalStorage() {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {}
    },
    // ── auth ──────────────────────────────────────────────────────────────

    /**
     * Login with email + password.
     * On success stores token, role and fetches the full user profile.
     * Throws on failure so the view can catch and show a message.
     */
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const data = await login(email, password) // auth.services.login
        // server sets HttpOnly cookie; response returns id and role
        this.role = data.tipo_utilizador || data.role
        // fetch full profile; server will read cookie automatically
        await this.fetchCurrentUser(data.id_utilizador || data.id)
        this.saveToLocalStorage()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Logout — calls POST /users/logout then clears local state.
     */
    async logout() {
      try {
        await logoutApi() // auth.services.logout with credentials: 'include'
      } finally {
        this._clearSession() // remove currentUser and role
        this.clearLocalStorage()
      }
    },

    // ── current user ──────────────────────────────────────────────────────

    /**
     * GET /users/:userId
     * Loads the full profile and stores it as currentUser.
     */
    async fetchCurrentUser(userId) {
      try {
        // Returns { id_utilizador, nome, email, tipo_utilizador,
        //           pontos, nivel, data_criacao_conta, imagem_utilizador, links }
        const data = await getUserById(userId, this.token)
        this.currentUser = data
        // Keep role in sync with the DB value
        if (data.tipo_utilizador) {
          this.role = data.tipo_utilizador.toLowerCase()
        }
        this.saveToLocalStorage()
      } catch (err) {
        // Can't load the profile → force logout to avoid a broken state
        this._clearSession()
        throw err
      }
    },

    /**
     * PATCH /users/:userId
     * Updates the current user's own profile.
     */
    async updateCurrentUser(updates, imageFile = null) {
      if (!this.currentUser) throw new Error('Not authenticated')
      this.loading = true
      this.error = null
      try {
        const data = await updateUser(
          this.currentUser.id_utilizador,
          updates,
          this.token,
          imageFile,
        )
        this.currentUser = data
        this.saveToLocalStorage()
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // ── admin: user list ──────────────────────────────────────────────────

    /**
     * GET /users  (admin only)
     * params: { page, limit, role, sort, order, q }
     */
    async fetchUsers(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await getAllUsers(this.token, params)
        // { meta: { total, page, limit, pages }, data: [...] }
        this.users = data.data || []
        this.usersMeta = data.meta || this.usersMeta
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * POST /users  (admin only)
     * Creates a user and pushes it into the local list.
     */
    async addUser(userData, imageFile = null) {
      this.loading = true
      this.error = null
      try {
        const data = await createUser(userData, this.token, imageFile)
        this.users.push(data)
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * DELETE /users/:userId  (owner or admin)
     */
    async deleteUser(userId) {
      this.loading = true
      this.error = null
      try {
        await deleteUser(userId, this.token)
        this.users = this.users.filter((u) => Number(u.id_utilizador) !== Number(userId))
        // If the user deleted their own account, clear the session
        if (Number(this.currentUser?.id_utilizador) === Number(userId)) {
          this._clearSession()
        }
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})

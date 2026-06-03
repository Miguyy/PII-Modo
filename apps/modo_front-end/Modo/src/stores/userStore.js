/*
  Purpose: Pinia store for user state.
*/

import { defineStore } from 'pinia'
import { login, logout as logoutApi } from '../api/services/auth.services.js'
import { getUserById, updateUser, getAllUsers, createUser, deleteUser } from '../api/services/users.services.js'
import { getAllDecorations } from '../api/services/decorations.services.js'
import { getUserNotifications, updateNotification } from '../api/services/notifications.services.js'

const STORAGE_KEY = 'modo_user'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    role: null,
    users: [],
    notifications: [],
    decorations: [],
    usersMeta: { total: 0, page: 1, limit: 5, pages: 1 },
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    isAdmin: (state) => (state.currentUser?.tipo_utilizador || '').toLowerCase() === 'admin',
  },

  actions: {
    _normalizeUser(user) {
      if (!user) return null

      const id = user.id_utilizador ?? user.id
      const nome = user.nome ?? user.name ?? ''
      const avatar = user.imagem_utilizador ?? user.avatar ?? null
      const avatarDecorationName = user.avatarDecorationName ?? user.nome_decoracao ?? null
      const avatarDecorationSource = user.avatarDecoration ?? user.caminho_decoracao ?? null
      const avatarDecoration = this._resolveDecorationAsset(avatarDecorationName, avatarDecorationSource)
      const points = user.pontos ?? user.points ?? 0
      const priority = user.nivel ?? user.priority ?? 1

      return {
        ...user,
        id,
        id_utilizador: id,
        name: nome,
        nome,
        email: user.email ?? '',
        avatar,
        imagem_utilizador: avatar,
        avatarDecorationName,
        avatarDecoration,
        pontos: points,
        points,
        nivel: priority,
        priority,
      }
    },

    _normalizeDecoration(decoration) {
      if (!decoration) return null
      const name = decoration.nome_decoracao ?? decoration.name ?? ''
      return {
        ...decoration,
        id: decoration.id_decoracao ?? decoration.id,
        id_decoracao: decoration.id_decoracao ?? decoration.id,
        name,
        nome_decoracao: name,
        src: this._resolveDecorationAsset(name, decoration.caminho_decoracao || decoration.src),
      }
    },

    _normalizeNotification(notification) {
      if (!notification) return null
      const date = notification.date ?? notification.data ?? notification.createdAt ?? null
      return {
        ...notification,
        id: notification.id_notificacao ?? notification.id,
        id_notificacao: notification.id_notificacao ?? notification.id,
        message: notification.message ?? notification.mensagem ?? '',
        mensagem: notification.message ?? notification.mensagem ?? '',
        date,
        data: date,
      }
    },

    _syncUsersList(updatedUser) {
      const normalized = this._normalizeUser(updatedUser)
      if (!normalized) return null
      const id = Number(normalized.id_utilizador)
      const index = this.users.findIndex((user) => Number(user.id_utilizador ?? user.id) === id)
      if (index >= 0) {
        this.users[index] = { ...this.users[index], ...normalized }
      } else {
        this.users.push(normalized)
      }
      return normalized
    },

    _buildLocalDecorationPath(name) {
      if (!name) return null
      return new URL(`../images/avatar_decoration/${name}.png`, import.meta.url).href
    },

    _resolveDecorationAsset(name, remoteSrc) {
      const localPath = this._buildLocalDecorationPath(name)
      if (localPath) return localPath
      return remoteSrc || null
    },

    _clearSession() {
      this.role = null
      this.currentUser = null
      localStorage.removeItem(STORAGE_KEY)
    },

    async loadFromLocalStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        this.currentUser = this._normalizeUser(parsed.currentUser || null)
        this.role = parsed.role || null
        const savedUserId = this.currentUser?.id_utilizador ?? this.currentUser?.id
        if (savedUserId) {
          await this.fetchCurrentUser(savedUserId)
        }
      } catch (err) {
        console.error('Failed loading user from localStorage', err)
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    saveToLocalStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentUser: this.currentUser,
          role: this.role,
        }))
      } catch (err) {
        console.error('Failed saving user to localStorage', err)
      }
    },

    clearLocalStorage() {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {}
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const data = await login(email, password)
        this.role = data.tipo_utilizador || data.role
        const userId = data.id_utilizador ?? data.id
        if (!userId) throw new Error(`Login response missing user ID: ${JSON.stringify(data)}`)
        await this.fetchCurrentUser(userId)
        this.saveToLocalStorage()
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await logoutApi()
      } finally {
        this._clearSession()
      }
    },

    async fetchCurrentUser(userId) {
      try {
        const data = await getUserById(userId)
        this.currentUser = this._normalizeUser(data)
        if (data.tipo_utilizador) {
          this.role = data.tipo_utilizador.toLowerCase()
        }
        this.saveToLocalStorage()
      } catch (err) {
        this._clearSession()
        throw err
      }
    },

    async updateCurrentUser(updates, imageFile = null) {
      return this.updateUserProfile(updates, imageFile)
    },

    async updateUserProfile(updates = {}, imageFile = null) {
      if (!this.currentUser) throw new Error('Not authenticated')
      this.loading = true
      this.error = null
      try {
        const payload = {}
        if (Object.prototype.hasOwnProperty.call(updates, 'name')) payload.nome = updates.name
        if (Object.prototype.hasOwnProperty.call(updates, 'nome')) payload.nome = updates.nome
        if (Object.prototype.hasOwnProperty.call(updates, 'email')) payload.email = updates.email
        if (Object.prototype.hasOwnProperty.call(updates, 'password')) payload.password = updates.password
        if (Object.prototype.hasOwnProperty.call(updates, 'avatar')) payload.avatar = updates.avatar
        if (Object.prototype.hasOwnProperty.call(updates, 'imagem_utilizador')) {
          payload.imagem_utilizador = updates.imagem_utilizador
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'avatarDecoration')) {
          payload.avatarDecoration = updates.avatarDecoration
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'id_decoracao')) {
          payload.id_decoracao = updates.id_decoracao
        }

        // FIXED: Passing null for the token slot so imageFile lands correctly
        const data = await updateUser(this.currentUser.id_utilizador, payload, null, imageFile)
        const normalized = this._normalizeUser(data)
        this.currentUser = { ...this.currentUser, ...normalized }
        this._syncUsersList(this.currentUser)
        this.saveToLocalStorage()
        return this.currentUser
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    getUserById(userId) {
      return (
        this.users.find((user) => Number(user.id_utilizador ?? user.id) === Number(userId)) ||
        (Number(this.currentUser?.id_utilizador ?? this.currentUser?.id) === Number(userId)
          ? this.currentUser
          : null)
      )
    },

    async loadNotifications() {
      if (!this.currentUser) return []
      const data = await getUserNotifications(this.currentUser.id_utilizador)
      const list = data?.notifications || data || []
      this.notifications = list.map((n) => this._normalizeNotification(n))
      return this.notifications
    },

    async markNotificationAsRead(notificationId) {
      const notification = this.notifications.find(
        (entry) => Number(entry.id_notificacao ?? entry.id) === Number(notificationId),
      )
      if (!notification) return null

      const updated = await updateNotification(notificationId, { lida: true })
      const normalized = this._normalizeNotification(updated)
      this.notifications = this.notifications.map((entry) =>
        Number(entry.id_notificacao ?? entry.id) === Number(notificationId) ? normalized : entry,
      )
      return normalized
    },

    removeNotification(notificationId) {
      this.notifications = this.notifications.filter(
        (entry) => Number(entry.id_notificacao ?? entry.id) !== Number(notificationId),
      )
    },

    clearAllNotifications() {
      this.notifications = []
    },

    async loadDecorations() {
      const data = await getAllDecorations()
      const list = data?.data || data || []
      this.decorations = list.map((d) => this._normalizeDecoration(d))
      return this.decorations
    },

    async updateAvatarDecoration(decoration) {
      if (!this.currentUser) throw new Error('Not authenticated')
      const decorationValue =
        decoration?.id_decoracao ?? decoration?.id ?? decoration?.src ?? decoration ?? null
      return this.updateUserProfile({ avatarDecoration: decorationValue })
    },

    async fetchUsers(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await getAllUsers(params)
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

    async addUser(userData, imageFile = null) {
      this.loading = true
      this.error = null
      try {
        const data = await createUser(userData, null, imageFile)
        this.users.push(data)
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteUser(userId) {
      this.loading = true
      this.error = null
      try {
        await deleteUser(userId)
        this.users = this.users.filter((u) => Number(u.id_utilizador) !== Number(userId))
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
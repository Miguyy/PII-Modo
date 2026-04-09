import { defineStore } from 'pinia'
import User from '../models/userModel'
import {
  usersList,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser,
} from '../api/modoApi'

export const useUserStore = defineStore('userStore', {
  state: () => ({
    users: [],
    loggedUserId: null,
    nextId: 0,
  }),

  getters: {
    /* currentUser: (state) => state.users.find((u) => u.id === state.loggedUserId), */
    currentUser: (state) => state.users.find((u) => String(u.id) === String(state.loggedUserId)),
    isAdmin: (state) => {
      const user = state.users.find((u) => String(u.id) === String(state.loggedUserId))
      return user?.priority === 2
    },
  },

  actions: {
    async fetchUsers() {
      try {
        const res = await usersList()
        
        // Load existing localStorage data to preserve local-only fields like avatarDecoration
        const localRaw = localStorage.getItem('users')
        let localUsersMap = {}
        if (localRaw) {
          try {
            const localArr = JSON.parse(localRaw)
            localUsersMap = localArr.reduce((map, u) => {
              map[String(u.id)] = u
              return map
            }, {})
          } catch (e) {
            console.warn('Failed to parse local users for merge', e)
          }
        }
        
        // Merge API data with local-only fields (avatar, avatarDecoration)
        this.users = res.map((apiUser) => {
          const localUser = localUsersMap[String(apiUser.id)]
          if (localUser) {
            // Preserve local-only fields
            return new User({
              ...apiUser,
              avatar: localUser.avatar || apiUser.avatar,
              avatarDecoration: localUser.avatarDecoration || apiUser.avatarDecoration,
            })
          }
          return new User(apiUser)
        })
        
        const numericIds = this.users.map((u) => Number(u.id)).filter((n) => !Number.isNaN(n))
        this.nextId = numericIds.length ? Math.max(...numericIds) + 1 : 0
        this.saveToLocalStorage()
      } catch (e) {
        console.warn('Failed to fetch users from API, keeping local data:', e)
      }
    },

    saveToLocalStorage() {
      const serial = JSON.stringify(this.users.map((u) => (u.toJSON ? u.toJSON() : u)))
      localStorage.setItem('users', serial)
    },

    loadFromLocalStorage() {
      const raw = localStorage.getItem('users')
      if (!raw) return
      try {
        const arr = JSON.parse(raw)
        this.users = arr.map((u) => new User(u))
        const numericIds = this.users.map((u) => Number(u.id)).filter((n) => !Number.isNaN(n))
        this.nextId = numericIds.length ? Math.max(...numericIds) + 1 : this.nextId
      } catch (e) {
        console.warn('Failed to load users from localStorage', e)
      }
      const storedLogged = localStorage.getItem('loggedUserId')
      if (storedLogged != null) {
        this.loggedUserId = storedLogged
      }
    },

    async addUser(userData) {
      try {
        const payload = {
          ...userData,
          createdAt: new Date().toISOString(),
          points: userData.points ?? 0,
          priority: userData.priority ?? 1,
          habits: userData.habits ?? [],
        }
        const created = await apiCreateUser(payload)
        const newUser = new User(created)
        this.users.push(newUser)
        const idNum = Number(created.id)
        if (!Number.isNaN(idNum)) this.nextId = Math.max(this.nextId, idNum + 1)
        this.saveToLocalStorage()
        return newUser
      } catch (e) {
        console.warn('API create failed, falling back to local add:', e)
        const newUser = new User({
          id: this.nextId,
          ...userData,
          createdAt: new Date().toISOString(),
          habits: userData.habits ?? [],
        })
        this.users.push(newUser)
        this.nextId++
        this.saveToLocalStorage()
        return newUser
      }
    },

    async loginByEmail(email, password) {
      try {
        await this.fetchUsers()
      } catch (e) {
        console.warn('fetchUsers failed', e)
      }

      if (!this.users || this.users.length === 0) {
        const stored = localStorage.getItem('users')
        if (stored) {
          try {
            this.users = JSON.parse(stored).map((u) => new User(u))
          } catch (e) {
            console.warn('Failed to parse users from localStorage', e)
          }
        }
      }

      const user = this.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      )

      if (!user) return false

      this.loggedUserId = user.id
      localStorage.setItem('loggedUserId', String(this.loggedUserId))
      return true
    },

    getUserById(id) {
      return this.users.find((u) => String(u.id) === String(id))
    },

    logout() {
      this.loggedUserId = null
      localStorage.removeItem('loggedUserId')
    },

    async updateUserProfile(updates) {
      if (!this.loggedUserId) throw new Error('No logged-in user to update')
      const user = this.getUserById(this.loggedUserId)
      if (!user) throw new Error('User not found')

      Object.assign(user, updates)

      try {
        const payload = user.toJSON ? user.toJSON() : { ...user }
        await apiUpdateUser(user.id, payload)
      } catch (e) {
        console.warn('API update failed, changes kept locally:', e)
      }

      this.saveToLocalStorage()
      return user
    },

    async deleteAccount(id = this.loggedUserId) {
      if (id == null) throw new Error('No user id provided for deletion')
      const targetId = String(id)
      this.users = this.users.filter((u) => String(u.id) !== targetId)

      try {
        await apiDeleteUser(id)
      } catch (e) {
        console.warn('API delete failed, removed locally only:', e)
      }

      if (String(this.loggedUserId) === targetId) {
        this.logout()
      }

      this.saveToLocalStorage()
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        key: 'userStore',
      },
    ],
  },
})

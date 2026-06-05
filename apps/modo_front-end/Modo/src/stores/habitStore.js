/*
  Purpose: User's habits management: CRUD, progress tracking, and gamification points.
  - Stores user's habits locally and syncs with API when possible.
  - Supports three habit types: check (boolean), count (incremental), and time (timer-based).
  - Awards points based on habit priority when completed, and triggers level-up notifications.
  - Provides admin fetching for habits and tasks with pagination support.
  Note: This store focuses on the user's own habits. Global catalog and admin-specific data are fetched but not deeply managed here.
*/

import { defineStore } from 'pinia'
import Habit from '../models/habitModel'
import { useUserStore } from '@/stores/userStore'
import {
  createHabit as apiCreateHabit,
  deleteHabit as apiDeleteHabit,
  patch as apiPatch,
} from '@/api/modoApi'
import { createNotification } from '@/api/services/notifications.services'

const LOCAL_KEY = 'habits_v1'

// Gamification points based on habit priority
export const PRIORITY_POINTS = {
  low: 5,
  medium: 10,
  high: 15,
}

export const useHabitStore = defineStore('habitStore', {
  state: () => ({
    habits: [],
    catalogHabits: [],
    catalogTasks: [],
    catalogTasksByHabitId: {},
    adminHabits: [],
    adminHabitsMeta: { page: 1, limit: 5, total: 0, pages: 1 },
    adminTasks: [],
    adminTasksMeta: { page: 1, limit: 5, total: 0, pages: 1 },
  }),

  getters: {
    getHabitsByUser: (state) => (user_id) =>
      state.habits.filter((h) => String(h.user_id) === String(user_id)),

    getHabitById: (state) => (id) => state.habits.find((h) => String(h.id) === String(id)),
  },

  actions: {
    async fetchHabitsAndTasks(filters = {}) {
      try {
        const { getAllHabits } = await import('@/api/services/habits.services')
        const { getAllTasks } = await import('@/api/services/tasks.services')

        // Extract modo_user token if missing from sessionStorage
        let token = sessionStorage.getItem('modo_token')
        if (!token) {
          try {
            const raw = localStorage.getItem('modo_user')
            if (raw) {
              const parsed = JSON.parse(raw)
              if (parsed.token) token = parsed.token
            }
          } catch (e) {}
        }

        // Ensure filters are appropriately passed
        const habitParams = filters.q ? { q: filters.q, limit: 1000 } : { limit: 1000 }
        const tasksParams = { ...filters, limit: 1000 }
        const [habitsData, tasksData] = await Promise.all([
          getAllHabits(token, habitParams).catch(() => []),
          getAllTasks(token, tasksParams).catch(() => []),
        ])

        this.catalogHabits = Array.isArray(habitsData) ? habitsData : habitsData?.data || []
        this.catalogTasks = Array.isArray(tasksData) ? tasksData : tasksData?.data || []

        const tasksByHabit = {}
        this.catalogTasks.forEach((task) => {
          if (!tasksByHabit[task.id_habito]) {
            tasksByHabit[task.id_habito] = []
          }
          tasksByHabit[task.id_habito].push(task)
        })
        this.catalogTasksByHabitId = tasksByHabit
      } catch (err) {
        console.error('Error fetching global catalog for explore page:', err)
      }
    },

    async fetchAdminHabits(params = {}) {
      try {
        const { getAllHabits } = await import('@/api/services/habits.services')
        let token = sessionStorage.getItem('modo_token')
        if (!token) {
          try {
            const raw = localStorage.getItem('modo_user')
            if (raw) {
              const parsed = JSON.parse(raw)
              if (parsed.token) token = parsed.token
            }
          } catch (e) {}
        }
        const data = await getAllHabits(token, params)
        if (data && Array.isArray(data.data)) {
          this.adminHabits = data.data
          if (data.meta) this.adminHabitsMeta = data.meta
        } else if (Array.isArray(data)) {
          this.adminHabits = data
        }
      } catch (err) {
        console.error('Failed to fetch admin habits:', err)
      }
    },

    async fetchAdminTasks(params = {}) {
      try {
        const { getAllTasks } = await import('@/api/services/tasks.services')
        let token = sessionStorage.getItem('modo_token')
        if (!token) {
          try {
            const raw = localStorage.getItem('modo_user')
            if (raw) {
              const parsed = JSON.parse(raw)
              if (parsed.token) token = parsed.token
            }
          } catch (e) {}
        }
        const data = await getAllTasks(token, params)
        if (data && Array.isArray(data.data)) {
          this.adminTasks = data.data
          if (data.meta) this.adminTasksMeta = data.meta
        } else if (Array.isArray(data)) {
          this.adminTasks = data
        }
      } catch (err) {
        console.error('Failed to fetch admin tasks:', err)
      }
    },

    // Persistence
    loadFromLocalStorage() {
      const raw = localStorage.getItem(LOCAL_KEY)
      if (!raw) return
      try {
        const arr = JSON.parse(raw)
        this.habits = arr.map((o) => new Habit(o))
      } catch (e) {
        console.error('Failed to load habits:', e)
      }
    },

    saveToLocalStorage() {
      // Convert Habit instances to plain objects if they have toJSON, otherwise store as is
      const serial = JSON.stringify(this.habits.map((h) => (h.toJSON ? h.toJSON() : h)))
      localStorage.setItem(LOCAL_KEY, serial)
    },

    // ----- CRUD -----
    async addHabit(habitData) {
      const userStore = useUserStore()

      try {
        const payload = {
          ...habitData,
          created_at: new Date().toISOString(),
          remaining_seconds:
            habitData.remaining_seconds ??
            (habitData.target_minutes ? habitData.target_minutes * 60 : null),
          current_progress: habitData.current_progress ?? undefined,
        }

        // create on API (json-server will update db.json)
        const created = await apiCreateHabit(payload)

        // push habit to local store
        const h = new Habit(created)
        this.habits.push(h)
        this.saveToLocalStorage()

        // add habit id to user.habits and try to persist the user
        // after creating habit on server and pushing local Habit instance:
        const user = userStore.getUserById(created.user_id)
        if (user) {
          const newHabits = [...(user.habits || []), created.id]
          user.habits = newHabits

          // persist partial update to server (PATCH /users/:id)
          try {
            await apiPatch(`/users/${user.id}`, { habits: newHabits })
          } catch (err) {
            console.warn('Failed to patch user.habits on API:', err)
          }

          // ensure reactivity + persist locally
          userStore.$patch({ users: [...userStore.users] })
          if (userStore.saveToLocalStorage) userStore.saveToLocalStorage()
        }

        return h
      } catch (e) {
        console.warn('API create failed, falling back to local add:', e)

        // local fallback
        const h = new Habit({
          id: Date.now(),
          ...habitData,
          created_at: new Date().toISOString(),
        })
        this.habits.push(h)

        // attach to local user
        const user = userStore.getUserById(h.user_id)
        if (user) {
          user.habits = user.habits || []
          user.habits.push(h.id)
          if (userStore.saveToLocalStorage) userStore.saveToLocalStorage()
        }

        this.saveToLocalStorage()
        return h
      }
    },

    updateHabit(id, updatedData) {
      const index = this.habits.findIndex((h) => String(h.id) === String(id))
      if (index === -1) return null
      // merge then reconstruct
      const merged = { ...this.habits[index], ...updatedData }
      this.habits[index] = new Habit(merged)
      this.saveToLocalStorage()
      return this.habits[index]
    },

    async deleteHabit(id) {
      const habit = this.getHabitById(id)
      if (!habit) return

      try {
        await apiDeleteHabit(id)
      } catch (err) {
        console.warn('API delete failed, continuing with local deletion:', err)
      }

      this.habits = this.habits.filter((h) => String(h.id) !== String(id))
      this.saveToLocalStorage()

      try {
        const userStore = useUserStore()
        const user = userStore.getUserById(habit.user_id)
        if (user) {
          user.habits = (user.habits || []).filter((hid) => String(hid) !== String(id))

          try {
            await apiPatch(`/users/${user.id}`, { habits: user.habits })
          } catch (err) {
            console.warn('Failed to patch user.habits on API after delete:', err)
          }

          userStore.$patch({ users: [...userStore.users] })
          if (userStore.saveToLocalStorage) userStore.saveToLocalStorage()
        }
      } catch (e) {
        console.error('Error updating user after habit delete:', e)
      }
    },

    // ----- Tracking / Progress -----
    // CHECK
    toggleCheck(id) {
      const habit = this.getHabitById(id)
      if (!habit || habit.type !== 'check') return
      habit.current_progress.checked = !habit.current_progress.checked
      habit.completed = !!habit.current_progress.checked
      this.saveToLocalStorage()

      if (habit.completed) this._awardPointsFor(habit)
    },

    // COUNT
    incrementCount(id) {
      const habit = this.getHabitById(id)
      if (!habit || habit.type !== 'count') return
      habit.current_progress.count += habit.increment_value
      if (habit.target_count && habit.current_progress.count >= habit.target_count) {
        habit.current_progress.count = habit.target_count
        habit.completed = true
        this._awardPointsFor(habit)
      }
      this.saveToLocalStorage()
    },

    decrementCount(id) {
      const habit = this.getHabitById(id)
      if (!habit || habit.type !== 'count') return
      habit.current_progress.count -= habit.increment_value
      if (habit.current_progress.count <= 0) habit.current_progress.count = 0
      // if previously completed, uncomplete if below target
      if (habit.target_count && habit.current_progress.count < habit.target_count) {
        habit.completed = false
      }
      this.saveToLocalStorage()
    },

    // TIME: start timer — guarda timestamp do início
    startTimer(id) {
      const habit = this.getHabitById(id)
      if (!habit || habit.type !== 'time') return
      // se já completado não começar
      if (habit.completed) return
      habit.timer_last_started_at = Date.now()
      // if remaining_seconds is undefined but target exists, ensure it's set
      if (habit.remaining_seconds == null && habit.target_minutes != null) {
        habit.remaining_seconds = habit.target_minutes * 60
      }
      this.saveToLocalStorage()
    },

    // pause timer — save the remaining seconds directly from UI
    pauseTimer(id, remainingSeconds = null) {
      const habit = this.getHabitById(id)
      if (!habit || habit.type !== 'time') return

      // If we have exact remaining seconds from UI, use that
      if (remainingSeconds !== null) {
        habit.remaining_seconds = remainingSeconds
        const totalTargetSeconds = (habit.target_minutes ?? 0) * 60
        const elapsedSeconds = totalTargetSeconds - remainingSeconds
        habit.current_progress.seconds = elapsedSeconds

        if (remainingSeconds <= 0) {
          habit.remaining_seconds = 0
          habit.current_progress.seconds = totalTargetSeconds
          habit.completed = true
          this._awardPointsFor(habit)
        }
      } else if (habit.timer_last_started_at) {
        // Fallback to timestamp-based calculation
        const now = Date.now()
        const elapsedMs = now - habit.timer_last_started_at
        const elapsedSec = Math.floor(elapsedMs / 1000)
        const currentRemaining = habit.remaining_seconds ?? habit.target_minutes * 60
        habit.remaining_seconds = Math.max(0, currentRemaining - elapsedSec)
        habit.current_progress.seconds = habit.target_minutes * 60 - habit.remaining_seconds

        if (habit.remaining_seconds <= 0) {
          habit.remaining_seconds = 0
          habit.completed = true
          this._awardPointsFor(habit)
        }
      }

      // clear last started timestamp
      habit.timer_last_started_at = null
      this.saveToLocalStorage()
    },

    // resumeTimer just sets timer_last_started_at again (startTimer covers)
    resumeTimer(id) {
      this.startTimer(id)
    },

    // if user closes app while timer running, call this to reconcile on load
    reconcileRunningTimers() {
      const now = Date.now()
      this.habits.forEach((habit) => {
        if (habit.type === 'time' && habit.timer_last_started_at) {
          const elapsedMs = now - habit.timer_last_started_at
          const elapsedSec = Math.floor(elapsedMs / 1000)
          const currentRemaining = habit.remaining_seconds ?? habit.target_minutes * 60
          habit.remaining_seconds = Math.max(0, currentRemaining - elapsedSec)
          habit.current_progress.seconds = habit.target_minutes * 60 - habit.remaining_seconds

          if (habit.remaining_seconds <= 0) {
            habit.remaining_seconds = 0
            habit.completed = true
            this._awardPointsFor(habit)
          } else {
            // adjust timer_last_started_at so next reconcile counts from now
            habit.timer_last_started_at = now
          }
        }
      })
      this.saveToLocalStorage()
    },

    resetDailyForUser(user_id) {
      const list = this.getHabitsByUser(user_id)
      list.forEach((h) => {
        h.current_progress = h.defaultProgress()
        h.completed = false
        if (h.type === 'time') h.remaining_seconds = h.target_minutes * 60
        h.timer_last_started_at = null
      })
      this.saveToLocalStorage()
    },

    _awardPointsFor(habit) {
      try {
        if (!habit || habit.points_awarded) return

        const userStore = useUserStore()
        const uid = String(habit.user_id)
        const user = userStore.getUserById
          ? userStore.getUserById(uid)
          : userStore.users.find((u) => String(u.id) === uid)
        if (!user) return

        const points = PRIORITY_POINTS[habit.priority] ?? PRIORITY_POINTS.low
        const oldPoints = Number(user.points) || 0
        const oldLevel = Math.floor(oldPoints / 100)

        user.points = oldPoints + points
        const newLevel = Math.floor(user.points / 100)

        habit.points_awarded = true

        this.saveToLocalStorage()
        if (userStore.saveToLocalStorage) userStore.saveToLocalStorage()

        apiPatch(`/users/${user.id}`, { points: user.points }).catch((err) =>
          console.warn('Failed to patch user points on API:', err),
        )
        apiPatch(`/habits/${habit.id}`, { points_awarded: true }).catch((err) =>
          console.warn('Failed to patch habit.points_awarded on API:', err),
        )

        // Trigger Level Up Notification if level increases
        if (newLevel > oldLevel) {
          const payload = {
            mensagem: `Congratulations! You leveled up to Level ${newLevel}!`,
            tipo_notificacao: 'Level',
          }
          createNotification(user.id, payload)
            .then((newNotif) => {
              if (
                userStore.notifications &&
                typeof userStore._normalizeNotification === 'function'
              ) {
                const notifData = newNotif.notification || newNotif
                userStore.notifications.unshift(userStore._normalizeNotification(notifData))
              }
            })
            .catch((err) => console.warn('Failed to create level up notification:', err))
        }
      } catch (e) {
        console.error('Error awarding points:', e)
      }
    },

    completeHabit(id) {
      const habit = this.getHabitById(id)
      if (!habit) return
      habit.completed = true
      if (habit.type === 'count' && habit.target_count) {
        habit.current_progress.count = habit.target_count
      }
      if (habit.type === 'time' && habit.target_minutes) {
        habit.current_progress.seconds = habit.target_minutes * 60
        habit.remaining_seconds = 0
        habit.timer_last_started_at = null
      }
      this.saveToLocalStorage()
      this._awardPointsFor(habit)
    },
  },
})

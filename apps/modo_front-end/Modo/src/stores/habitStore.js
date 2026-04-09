import { defineStore } from 'pinia'
import Habit from '../Models/habitModel'
import { useUserStore } from '@/stores/userStore'
import {
  createHabit as apiCreateHabit,
  deleteHabit as apiDeleteHabit,
  patch as apiPatch,
} from '@/api/modoApi'

const LOCAL_KEY = 'habits_v1'

// pontos por prioridade (gamificação)
export const PRIORITY_POINTS = {
  low: 5,
  medium: 10,
  high: 15,
}

export const useHabitStore = defineStore('habitStore', {
  state: () => ({
    habits: [],
  }),

  getters: {
    getHabitsByUser: (state) => (user_id) =>
      state.habits.filter((h) => String(h.user_id) === String(user_id)),

    getHabitById: (state) => (id) => state.habits.find((h) => String(h.id) === String(id)),
  },

  actions: {
    // ----- Persistência -----
    loadFromLocalStorage() {
      const raw = localStorage.getItem(LOCAL_KEY)
      if (!raw) return
      try {
        const arr = JSON.parse(raw)
        // reconstruir instâncias Habit
        this.habits = arr.map((o) => new Habit(o))
      } catch (e) {
        console.error('Failed to load habits:', e)
      }
    },

    saveToLocalStorage() {
      // converte em JSON (habit.toJSON trata created_at)
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
          remaining_seconds: habitData.remaining_seconds ?? (habitData.target_minutes ? habitData.target_minutes * 60 : null),
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
        const currentRemaining = habit.remaining_seconds ?? (habit.target_minutes * 60)
        habit.remaining_seconds = Math.max(0, currentRemaining - elapsedSec)
        habit.current_progress.seconds = (habit.target_minutes * 60) - habit.remaining_seconds
        
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
          const currentRemaining = habit.remaining_seconds ?? (habit.target_minutes * 60)
          habit.remaining_seconds = Math.max(0, currentRemaining - elapsedSec)
          habit.current_progress.seconds = (habit.target_minutes * 60) - habit.remaining_seconds
          
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

    // Reset diário para todos (chamada manual ou ao iniciar novo dia)
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

    // ----- Gamificação: quando um hábito é completado -----

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
        user.points = (Number(user.points) || 0) + points

        habit.points_awarded = true

        this.saveToLocalStorage()
        if (userStore.saveToLocalStorage) userStore.saveToLocalStorage()

        apiPatch(`/users/${user.id}`, { points: user.points }).catch((err) =>
          console.warn('Failed to patch user points on API:', err),
        )
        apiPatch(`/habits/${habit.id}`, { points_awarded: true }).catch((err) =>
          console.warn('Failed to patch habit.points_awarded on API:', err),
        )
      } catch (e) {
        console.error('Error awarding points:', e)
      }
    },

    // explicit completion (marca e dá pontos)
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

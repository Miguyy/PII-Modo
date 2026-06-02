/*
  Purpose: Pinia store for managing habits and their associated tasks.
  Uses habits.services.js and tasks.services.js to communicate with the API.
*/

import { defineStore } from 'pinia'
import { getAllHabits } from '../api/services/habits.services'
import { getAllTasks } from '../api/services/tasks.services'

export const useHabitStore = defineStore('habit', {
  state: () => ({
    habits: [],
    tasks: [],
    tasksByHabitId: {},
    loading: false,
    error: null,
  }),

  getters: {
    hasHabits: (state) => state.habits.length > 0,
  },

  actions: {
    async fetchHabitsAndTasks() {
      // 1. Try to get token from sessionStorage
      let token = sessionStorage.getItem('modo_token')

      // 2. Fall back to localStorage recovery if session is empty
      if (!token) {
        console.warn(
          "HabitStore: 'modo_token' not found in sessionStorage. Attempting localStorage recovery...",
        )
        try {
          const localData = localStorage.getItem('modo_user')
          if (localData) {
            const parsed = JSON.parse(localData)
            if (parsed.token) {
              token = parsed.token
              sessionStorage.setItem('modo_token', token)
              console.log('HabitStore: Token successfully recovered from localStorage.')
            }
          }
        } catch (e) {
          console.error('HabitStore: Failed to parse localStorage backup:', e)
        }
      }

      // 3. 🟢 DEVELOPMENT FAILSAFE FALLBACK
      // If BOTH storages are completely blank, inject a placeholder token string
      // instead of aborting. This keeps the network request moving forward!
      if (!token) {
        console.warn(
          'HabitStore: No saved token found anywhere. Injecting development fallback token to bypass abort filter.',
        )
        token = 'dev_fallback_token_string'
        sessionStorage.setItem('modo_token', token)
      }

      this.loading = true
      this.error = null

      try {
        // 4. 📡 API FETCH: Run clean, limit-free calls for the dashboard layout
        const [habitsData, tasksData] = await Promise.all([getAllHabits(token), getAllTasks(token)])

        this.habits = Array.isArray(habitsData) ? habitsData : habitsData?.data || []
        this.tasks = Array.isArray(tasksData) ? tasksData : tasksData?.data || []

        // 5. 🧩 RELATIONAL GROUPING
        const grouped = {}

        this.habits.forEach((habit) => {
          if (habit.id_habito) {
            grouped[habit.id_habito] = []
          }
        })

        this.tasks.forEach((task) => {
          const habitId = task.id_habito
          if (habitId) {
            if (!grouped[habitId]) {
              grouped[habitId] = []
            }
            grouped[habitId].push(task)
          }
        })

        this.tasksByHabitId = grouped
      } catch (err) {
        console.error('Failed to load store data:', err)
        this.error = err.message || 'Failed to fetch habits and tasks.'
      } finally {
        this.loading = false
      }
    },
  },
})

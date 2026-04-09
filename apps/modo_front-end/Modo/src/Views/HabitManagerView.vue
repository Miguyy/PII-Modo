<template>
  <NavBar />
  <div class="containerBox">
    <div class="page-title">
      <h2>HABITS MANAGER</h2>
    </div>
    <!-- Main Content Container -->
    <div class="content row mt-2 g-4 align-items-stretch">
      <div class="col-12 col-md-4 col-lg-4">
        <div class="weather-box shadow p-3 h-100">
          <!-- Weather Component Box -->
          <Weather />
        </div>
      </div>
      <div class="col-12 col-md-4 col-lg-4">
        <div class="charts-box p-3 h-100">
          <!-- Habit Stats Chart Box -->
          <HabitStatsChart />
        </div>
      </div>
      <div class="col-12 col-md-4 col-lg-4">
        <div class="profile-card p-3 h-100">
          <div class="profile-card-content">
            <div class="avatar-wrapper">
              <img
                v-if="currentUser?.avatar"
                :src="currentUser.avatar"
                alt="Profile"
                class="avatar-img"
              />
              <div v-else class="avatar-fallback">{{ userInitials }}</div>
              <img
                v-if="currentUser?.avatarDecoration"
                :src="currentUser.avatarDecoration"
                class="avatar-decoration"
                alt=""
              />
            </div>

            <h2 class="user-name">{{ currentUser?.name || 'Guest' }}</h2>

            <div class="user-stats">
              <span class="badge bg-success-soft">Points: {{ currentUser?.points ?? 0 }}</span>
              <span class="badge bg-primary-soft">Level: {{ userLevel }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-4 add-habit">
      <div class="col-12">
        <!-- Add Habit Form -->
        <div class="card p-3 mb-0">
          <form @submit.prevent="handleAdd">
            <!-- Prevent default form submission -->
            <div class="row g-2">
              <div class="col-md-5">
                <label>Description</label>
                <input v-model="form.description" class="form-control" required />
              </div>
              <div class="col-md-2">
                <label>Priority</label>
                <select v-model="form.priority" class="form-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div class="col-md-2">
                <label>Type</label>
                <select v-model="form.type" class="form-select">
                  <option value="check">Check</option>
                  <option value="count">Count</option>
                  <option value="time">Time</option>
                </select>
              </div>

              <div class="col-md-2">
                <label>Location</label>
                <select v-model="form.location" class="form-select">
                  <option value="inside">Inside</option>
                  <option value="outside">Outside</option>
                </select>
              </div>

              <!-- COUNT EXTRA FIELDS -->
              <div v-if="form.type === 'count'" class="col-12 mt-2">
                <div class="row g-2">
                  <div class="col-md-2">
                    <label>Target</label>
                    <input type="number" v-model.number="form.target_count" class="form-control" />
                  </div>
                  <div class="col-md-2">
                    <label>Increment</label>
                    <input
                      type="number"
                      v-model.number="form.increment_value"
                      class="form-control"
                    />
                  </div>
                </div>
              </div>

              <!-- TIME EXTRA FIELDS -->
              <div v-if="form.type === 'time'" class="col-12 mt-2">
                <div class="row g-2">
                  <div class="col-md-6">
                    <label>Target Minutes</label>
                    <input
                      type="number"
                      v-model.number="form.target_minutes"
                      class="form-control"
                    />
                  </div>
                </div>
              </div>

              <!-- CREATE BUTTON - Always at the bottom -->
              <div class="col-12 mt-3">
                <button class="btn btn-primary w-100" type="submit">
                  <FontAwesomeIcon icon="plus" /> Create new habit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <br />
    <div class="row">
      <div class="col-12">
        <hr class="my-4" style="border: dotted 1px; color: #355d4c" />
      </div>
    </div>

    <!-- Filters and Sorting Toolbar (moved below divider) -->
    <div class="row mt-2">
      <div class="col-12">
        <div class="card p-3 mb-0 filters-card">
          <div class="row g-2 align-items-end">
            <div class="col-md-2">
              <label>Type</label>
              <select v-model="filters.type" class="form-select">
                <option value="all">All</option>
                <option value="check">Check</option>
                <option value="count">Count</option>
                <option value="time">Time</option>
              </select>
            </div>
            <div class="col-md-2">
              <label>Priority</label>
              <select v-model="filters.priority" class="form-select">
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="col-md-2">
              <label>Location</label>
              <select v-model="filters.location" class="form-select">
                <option value="all">All</option>
                <option value="inside">Inside</option>
                <option value="outside">Outside</option>
              </select>
            </div>
            <div class="col-md-2">
              <label>Sort By</label>
              <select v-model="filters.sortBy" class="form-select">
                <option value="priority">Priority</option>
                <option value="created_at">Created At</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
            <div class="col-md-2">
              <label>Order</label>
              <select v-model="filters.sortOrder" class="form-select">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div class="col-md-1 d-flex justify-content-end">
              <button class="btn btn-md btn-outline-danger" @click="resetFilters">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Habits list: CSS Grid to avoid gaps -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="habits-grid">
          <div v-for="habit in displayHabits" :key="habit.id" class="habit-item">
            <div class="card p-3 h-100 d-flex flex-column">
              <div class="card-header-custom">
                <div class="habit-title-section">
                  <strong class="habit-title">{{ habit.description }}</strong>
                  <div class="habit-badges">
                    <span class="badge badge-priority" :class="'priority-' + habit.priority">
                      {{ habit.priority.toUpperCase() }}
                    </span>
                    <span class="badge badge-type" :class="'type-' + habit.type">
                      <FontAwesomeIcon :icon="getHabitIcon(habit.type)" /> {{ habit.type }}
                    </span>
                  </div>
                </div>
                <small class="location-info">
                  <FontAwesomeIcon icon="map-pin" /> {{ habit.location }}
                </small>
              </div>

              <!-- CHECK TYPE -->
              <div
                v-if="habit.type === 'check'"
                class="habit-content flex-grow-1 d-flex flex-column"
              >
                <div class="check-indicator">
                  <div
                    class="check-status"
                    :class="{ 'check-completed': habit.current_progress.checked }"
                    @click="toggleCheck(habit.id)"
                  >
                    <FontAwesomeIcon
                      icon="check-circle"
                      class="check-icon"
                    />
                  </div>
                  <div class="check-text">
                    <span v-if="habit.current_progress.checked" class="badge bg-success"
                      >Completed</span
                    >
                    <span v-else class="badge bg-secondary">Pending</span>
                  </div>
                </div>

                <div class="check-actions d-flex gap-2 mt-auto">
                  <button 
                    v-if="habit.current_progress.checked" 
                    class="btn btn-sm btn-success flex-fill" 
                    @click="completeAndRemoveHabit(habit.id)"
                  >
                    <FontAwesomeIcon icon="trophy" />
                    Complete & Earn Points
                  </button>
                  <button 
                    v-else
                    class="btn btn-sm btn-outline-success flex-fill" 
                    @click="toggleCheck(habit.id)"
                  >
                    <FontAwesomeIcon icon="check" />
                    Mark Done
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteHabit(habit.id)"
                  >
                    <FontAwesomeIcon icon="trash" />
                  </button>
                </div>
              </div>

              <!-- COUNT TYPE -->
              <div
                v-if="habit.type === 'count'"
                class="habit-content flex-grow-1 d-flex flex-column"
              >
                <div class="progress-section">
                  <div class="progress-header">
                    <span>Progress</span>
                    <span class="progress-value"
                      >{{ habit.current_progress.count }} / {{ habit.target_count }}</span
                    >
                  </div>
                  <div class="progress">
                    <div
                      class="progress-bar"
                      role="progressbar"
                      :style="{ width: countPercent(habit) + '%' }"
                      :class="progressClass(countPercent(habit))"
                    >
                      {{ countPercent(habit) }}%
                    </div>
                  </div>
                </div>

                <div class="counter-controls">
                  <button class="btn btn-sm btn-danger" @click="decrement(habit.id)">
                    <FontAwesomeIcon icon="arrow-left" />
                  </button>
                  <span class="counter-value">{{ habit.current_progress.count }}</span>
                  <button class="btn btn-sm btn-success" @click="increment(habit.id)">
                    <FontAwesomeIcon icon="arrow-right" />
                  </button>
                </div>

                <div class="d-flex gap-2 mt-auto">
                  <button 
                    v-if="countPercent(habit) >= 100"
                    class="btn btn-sm btn-success flex-fill" 
                    @click="completeAndRemoveHabit(habit.id)"
                  >
                    <FontAwesomeIcon icon="trophy" /> Complete & Earn Points
                  </button>
                  <button 
                    v-else
                    class="btn btn-sm btn-outline-success flex-fill" 
                    @click="complete(habit.id)"
                  >
                    <FontAwesomeIcon icon="check" /> Mark Complete
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteHabit(habit.id)"
                  >
                    <FontAwesomeIcon icon="trash" />
                  </button>
                </div>
              </div>
              <div
                v-if="habit.type === 'time'"
                class="habit-content flex-grow-1 d-flex flex-column"
              >
                <div class="progress-section">
                  <div class="progress-header">
                    <span>Time Progress</span>
                    <span class="progress-value"
                      >{{ formatSecondsToMinSec(habit.current_progress.seconds || 0) }} /
                      {{ habit.target_minutes }} min</span
                    >
                  </div>
                  <div class="progress">
                    <div
                      class="progress-bar"
                      role="progressbar"
                      :style="{ width: timePercent(habit) + '%' }"
                      :class="progressClass(timePercent(habit))"
                    >
                      {{ timePercent(habit) }}%
                    </div>
                  </div>
                </div>

                <div class="time-remaining">
                  <span class="time-label">Time Remaining:</span>
                  <span class="time-value"
                    >{{ formatSecondsToMinSec(habit.remaining_seconds ?? (habit.target_minutes * 60) ?? 0) }}</span
                  >
                </div>

                <div class="d-flex gap-2 mt-auto">
                  <button
                    class="btn btn-sm btn-outline-primary flex-fill"
                    @click="openTimer(habit.id)"
                  >
                    <FontAwesomeIcon icon="clock" /> Timer
                  </button>
                  <button 
                    v-if="timePercent(habit) >= 100"
                    class="btn btn-sm btn-success flex-fill" 
                    @click="completeAndRemoveHabit(habit.id)"
                  >
                    <FontAwesomeIcon icon="trophy" /> Complete & Earn Points
                  </button>
                  <button 
                    v-else
                    class="btn btn-sm btn-outline-success flex-fill" 
                    @click="complete(habit.id)"
                  >
                    <FontAwesomeIcon icon="check" /> Mark Complete
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteHabit(habit.id)"
                  >
                    <FontAwesomeIcon icon="trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TIMER MODAL (kept as-is) -->
    <div class="modal fade" id="timerModal" tabindex="-1" ref="timerModalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ activeTimerHabit?.description }}</h5>
            <button class="btn-close" data-bs-dismiss="modal" @click="onCloseTimerModal"></button>
          </div>
          <div class="modal-body text-center">
            <div class="timer-display mb-3">
              <span class="timer-value" :class="{ 'timer-running': timerIsRunning }">{{ formattedTime }}</span>
            </div>
            <p class="text-muted mb-3">
              <span v-if="timerIsRunning" class="badge bg-success">Running</span>
              <span v-else class="badge bg-secondary">Paused</span>
            </p>

            <div class="d-flex gap-2 justify-content-center">
              <button class="btn btn-primary" @click="startTimerButton" :disabled="timerIsRunning">
                <FontAwesomeIcon icon="play" /> {{ timerIsRunning ? 'Running...' : 'Start' }}
              </button>
              <button class="btn btn-secondary" @click="pauseTimerButton" :disabled="!timerIsRunning">
                <FontAwesomeIcon icon="pause" /> Pause
              </button>
              <button class="btn btn-success" @click="completeTimerHabit">
                <FontAwesomeIcon icon="trophy" /> Complete & Earn Points
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast notification -->
  <Transition name="toast-slide">
    <div v-if="toast.visible" class="toast-notification">
      <div
        class="toast-icon"
        :style="{ color: toast.title === 'Habit deleted' ? '#b4554d' : '#00cc66' }"
      >
        {{ toast.title === 'Habit deleted' ? '🗑️' : '✅' }}
      </div>
      <div class="toast-content">
        <strong>{{ toast.title }}</strong>
        <small>{{ toast.message }}</small>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Pinia stores
import { useHabitStore } from '@/stores/habitStore'
import { useUserStore } from '@/stores/userStore'
import { useOpenWeatherApiStore } from '@/stores/openWeatherApiStore'

// Bootstrap JS helpers (Modal/Toast)
import * as bootstrap from 'bootstrap'

// Local components used in this view
import NavBar from '../Components/NavBar.vue'
import Weather from '@/Components/Weather.vue'
import HabitStatsChart from '@/Components/HabitStatsChart.vue'

// Initialize stores
const habitStore = useHabitStore()
const userStore = useUserStore()
const weatherStore = useOpenWeatherApiStore()

// Form reactive state for the add-habit form
const form = ref({
  description: '',
  type: 'check',
  location: 'inside',
  priority: 'low',
  target_count: 1,
  increment_value: 1,
  target_minutes: 15,
})

// Simple UI toast state used for quick feedback (create/delete)
const toast = ref({
  visible: false,
  title: '',
  message: '',
  timeout: null,
})

// Helper to show the toast message
function showToast(title, message, duration = 3000) {
  toast.value.title = title
  toast.value.message = message
  toast.value.visible = true

  if (toast.value.timeout) clearTimeout(toast.value.timeout)

  toast.value.timeout = setTimeout(() => {
    toast.value.visible = false
  }, duration)
}

// Lifecycle hook: restore persisted state and reconcile timers
onMounted(() => {
  habitStore.loadFromLocalStorage()
  habitStore.reconcileRunningTimers()
  if (userStore.loadFromLocalStorage) userStore.loadFromLocalStorage()
})

const currentUser = computed(() => userStore.currentUser)
const userLevel = computed(() => {
  if (!currentUser.value || Number.isNaN(Number(currentUser.value.points))) return 0
  return Math.round((currentUser.value.points || 0) / 100)
})
const userInitials = computed(() => {
  const name = currentUser.value?.name || ''
  const initials = name
    .split(' ')
    .filter((n) => n)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
  return initials ? initials.toUpperCase() : '?'
})
const userHabits = computed(() => {
  if (!currentUser.value) return []
  return habitStore.getHabitsByUser(currentUser.value.id)
})

// Filters + Sorting state
const filters = ref({
  search: '',
  type: 'all',
  priority: 'all',
  location: 'all',
  sortBy: 'created_at', // 'priority' | 'created_at' | 'alphabetical'
  sortOrder: 'desc', // 'asc' | 'desc'
})

const priorityWeight = { low: 1, medium: 2, high: 3 }

const displayHabits = computed(() => {
  const list = [...userHabits.value]

  // Filtering
  const filtered = list.filter((h) => {
    const matchesSearch = filters.value.search
      ? h.description.toLowerCase().includes(filters.value.search.toLowerCase())
      : true

    const matchesType = filters.value.type === 'all' ? true : h.type === filters.value.type
    const matchesPriority =
      filters.value.priority === 'all' ? true : h.priority === filters.value.priority
    const matchesLocation =
      filters.value.location === 'all' ? true : h.location === filters.value.location

    return matchesSearch && matchesType && matchesPriority && matchesLocation
  })

  // Sorting
  const { sortBy, sortOrder } = filters.value
  const dir = sortOrder === 'asc' ? 1 : -1

  filtered.sort((a, b) => {
    if (sortBy === 'priority') {
      const pa = priorityWeight[a.priority] || 0
      const pb = priorityWeight[b.priority] || 0
      return (pa - pb) * dir
    }
    if (sortBy === 'created_at') {
      const ta =
        a.created_at instanceof Date ? a.created_at.getTime() : new Date(a.created_at).getTime()
      const tb =
        b.created_at instanceof Date ? b.created_at.getTime() : new Date(b.created_at).getTime()
      return (ta - tb) * dir
    }
    // alphabetical by description
    const da = (a.description || '').toLowerCase()
    const db = (b.description || '').toLowerCase()
    if (da < db) return -1 * dir
    if (da > db) return 1 * dir
    return 0
  })

  return filtered
})

// Watch for weather changes to alert user about outside habits when raining
watch(
  () => weatherStore.weatherData,
  (newWeather) => {
    if (!newWeather) return

    // Check if it's raining
    const condition = newWeather.weather[0].main.toLowerCase()
    if (condition.includes('rain')) {
      // Find outside habits
      const outsideHabits = displayHabits.value.filter((h) => h.location === 'outside')
      if (outsideHabits.length) {
        showToast(
          'Weather Alert',
          `It's raining! You might want to postpone your outside tasks.`,
          10000,
        )
      }
    }
  },
  { immediate: true },
)

// Reset filters to their default values
function resetFilters() {
  filters.value = {
    search: '',
    type: 'all',
    priority: 'all',
    location: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  }
}

function resetForm() {
  form.value = {
    description: '',
    type: 'check',
    location: 'inside',
    priority: 'low',
    target_count: 1,
    increment_value: 1,
    target_minutes: 15,
  }
}

// Handle submission of the add-habit form
function handleAdd() {
  if (!currentUser.value) return alert('Please log in first')

  habitStore.addHabit({
    user_id: currentUser.value.id,
    description: form.value.description,
    type: form.value.type,
    priority: form.value.priority,
    location: form.value.location,
    target_count: form.value.type === 'count' ? form.value.target_count : null,
    increment_value: form.value.type === 'count' ? form.value.increment_value : 1,
    target_minutes: form.value.type === 'time' ? form.value.target_minutes : null,
  })

  // Provide immediate feedback
  showToast(
    'Habit created',
    `${form.value.description} · ${form.value.priority} · ${form.value.location}`,
  )

  // reset form inputs
  form.value.description = ''
  form.value.location = 'inside'

  resetForm()
}

// Delete a habit after confirmation and show a toast
function deleteHabit(id) {
  if (confirm('Delete habit?')) {
    const habit = habitStore.getHabitById(id)
    habitStore.deleteHabit(id)
    showToast('Habit deleted', `${habit.description} · ${habit.priority} · ${habit.location}`)
  }
}

// Action helpers that delegate to the habit store
function increment(id) {
  habitStore.incrementCount(id)
}
function decrement(id) {
  habitStore.decrementCount(id)
}
function toggleCheck(id) {
  habitStore.toggleCheck(id)
}
function complete(id) {
  habitStore.completeHabit(id)
}
function completeAndRemoveHabit(id) {
  // Increment completed count in localStorage
  const userId = userStore.currentUser?.id
  if (userId) {
    const key = `completedHabits_${userId}`
    const current = parseInt(localStorage.getItem(key) || '0', 10)
    localStorage.setItem(key, String(current + 1))
  }
  
  habitStore.completeHabit(id)
  habitStore.deleteHabit(id)
  showToast('Success', 'Habit completed! Points awarded.', 'success')
  
  // Dispatch event for chart update
  window.dispatchEvent(new Event('habitCompleted'))
}

function completeTimerHabit() {
  if (activeTimerHabit.value) {
    const id = activeTimerHabit.value.id
    pauseTimerButton()
    timerInstance.value?.hide()
    
    // Increment completed count in localStorage
    const userId = userStore.currentUser?.id
    if (userId) {
      const key = `completedHabits_${userId}`
      const current = parseInt(localStorage.getItem(key) || '0', 10)
      localStorage.setItem(key, String(current + 1))
    }
    
    habitStore.completeHabit(id)
    habitStore.deleteHabit(id)
    showToast('Success', 'Habit completed! Points awarded.', 'success')
    
    // Dispatch event for chart update
    window.dispatchEvent(new Event('habitCompleted'))
  }
}

// Compute percent complete for time-based habits (using seconds)
function timePercent(h) {
  if (!h.target_minutes) return 0
  const targetSeconds = h.target_minutes * 60
  const progressSeconds = h.current_progress.seconds || 0
  return Math.round((progressSeconds / targetSeconds) * 100)
}

// Format seconds to MM:SS string
function formatSecondsToMinSec(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

// Compute percent complete for count-based habits
function countPercent(h) {
  if (!h.target_count) return 0
  return Math.round(((h.current_progress.count || 0) / h.target_count) * 100)
}

// Return the FontAwesome icon name for a habit type
function getHabitIcon(type) {
  switch (type) {
    case 'check':
      return 'check-circle'
    case 'count':
      return 'chart-bar'
    case 'time':
      return 'hourglass'
    default:
      return 'circle'
  }
}

// Map progress percent to a CSS class used by the progress bar
function progressClass(percent) {
  if (percent < 33) return 'progress-low'
  if (percent < 66) return 'progress-mid'
  return 'progress-high'
}

/* TIMER MODAL */
const timerModalEl = ref(null)
const timerInstance = ref(null)
const activeTimerHabit = ref(null)
const remainingSeconds = ref(0)
const timerIsRunning = ref(false)
const timerIntervalId = ref(null)

// Format time as MM:SS
const formattedTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

// Clean up timer interval on component unmount
onUnmounted(() => {
  if (timerIntervalId.value) {
    clearInterval(timerIntervalId.value)
  }
})

function openTimer(id) {
  const habit = habitStore.getHabitById(id)
  activeTimerHabit.value = habit
  
  // Get remaining seconds from habit (or calculate from target_minutes)
  const targetSeconds = (habit.target_minutes ?? 0) * 60
  remainingSeconds.value = habit.remaining_seconds ?? targetSeconds
  timerIsRunning.value = !!habit.timer_last_started_at
  
  // If timer was already running, calculate current remaining time
  if (habit.timer_last_started_at) {
    const elapsed = Date.now() - habit.timer_last_started_at
    const elapsedSec = Math.floor(elapsed / 1000)
    remainingSeconds.value = Math.max(0, remainingSeconds.value - elapsedSec)
    
    if (remainingSeconds.value > 0) {
      startCountdown()
    }
  }
  
  if (!timerInstance.value && timerModalEl.value) {
    timerInstance.value = new bootstrap.Modal(timerModalEl.value)
  }
  timerInstance.value.show()
}

function startCountdown() {
  // Clear any existing interval
  if (timerIntervalId.value) {
    clearInterval(timerIntervalId.value)
  }
  
  timerIntervalId.value = setInterval(() => {
    if (remainingSeconds.value <= 0) {
      // Timer completed
      clearInterval(timerIntervalId.value)
      timerIntervalId.value = null
      timerIsRunning.value = false
      remainingSeconds.value = 0
      
      // Auto-complete the habit
      if (activeTimerHabit.value) {
        habitStore.completeHabit(activeTimerHabit.value.id)
        showToast('Timer Complete!', `${activeTimerHabit.value.description} has been completed!`)
      }
      return
    }
    
    // Decrement by 1 second
    remainingSeconds.value--
    
    // Update habit progress in real-time for the progress bar
    if (activeTimerHabit.value) {
      const habit = habitStore.getHabitById(activeTimerHabit.value.id)
      if (habit) {
        habit.remaining_seconds = remainingSeconds.value
        habit.current_progress.seconds = (habit.target_minutes * 60) - remainingSeconds.value
      }
    }
  }, 1000)
}

function stopCountdown() {
  if (timerIntervalId.value) {
    clearInterval(timerIntervalId.value)
    timerIntervalId.value = null
  }
}

function startTimerButton() {
  if (!activeTimerHabit.value) return
  habitStore.startTimer(activeTimerHabit.value.id)
  
  // If remainingSeconds is 0, reset to full time
  if (remainingSeconds.value <= 0) {
    const h = habitStore.getHabitById(activeTimerHabit.value.id)
    const targetSeconds = (h.target_minutes ?? 0) * 60
    remainingSeconds.value = h.remaining_seconds ?? targetSeconds
  }
  
  timerIsRunning.value = true
  startCountdown()
}

function pauseTimerButton() {
  if (!activeTimerHabit.value) return
  stopCountdown()
  // Pass current remaining seconds to store
  habitStore.pauseTimer(activeTimerHabit.value.id, remainingSeconds.value)
  timerIsRunning.value = false
}

function onCloseTimerModal() {
  stopCountdown()
  if (activeTimerHabit.value && timerIsRunning.value) {
    // Save current state when closing modal while running
    habitStore.pauseTimer(activeTimerHabit.value.id, remainingSeconds.value)
  }
  activeTimerHabit.value = null
  timerIsRunning.value = false
}
</script>
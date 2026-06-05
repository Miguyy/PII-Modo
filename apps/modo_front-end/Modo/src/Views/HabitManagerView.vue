<template>
  <NavBar />
  <div class="containerBox">
    <div class="page-title">
      <h4>HABITS MANAGER</h4>
      <h1>&#x2022;</h1>
    </div>
    <!-- Main Content Container -->
    <div class="content row mt-2 g-4 align-items-stretch">
      <div class="col-12 col-md-4 col-lg-4">
        <div class="weather-box shadow p-3 h-100">
          <!-- Weather Component Box -->
          <Weather @refresh="fetchLocationAndWeather" />
        </div>
      </div>
      <div class="col-12 col-md-4 col-lg-4">
        <div class="charts-box p-3 h-100">
          <!-- Habit Stats Chart Box -->
          <HabitStatsChart :tasks="userHabits" :rawTasks="apiUserTasks" />
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
    <!-- <div class="row mt-4 add-habit">
      <div class="col-12">
        <div class="card p-3 mb-0">
          <form @submit.prevent="handleAdd">
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

              <div class="col-12 mt-3">
                <button class="btn btn-primary w-100" type="submit">
                  <FontAwesomeIcon icon="plus" /> Create new custom task
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div> -->
    <br />
    <div class="row">
      <div class="col-12">
        <hr class="my-4" style="border: dotted 1px; color: #355d4c" />
      </div>
    </div>

    <!-- Filters and Sorting Toolbar -->
    <div class="row mt-2">
      <div class="col-12">
        <div class="card p-3 mb-0 filters-card">
          <div class="row g-2 align-items-end">
            <div class="col-md-2">
              <label style="font-size: 16px">Type</label>
              <select v-model="filters.type" class="form-select">
                <option value="all">All</option>
                <option value="check">Check</option>
                <option value="count">Count</option>
                <option value="time">Time</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Priority</label>
              <select v-model="filters.priority" class="form-select">
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Location</label>
              <select v-model="filters.location" class="form-select">
                <option value="all">All</option>
                <option value="inside">Inside</option>
                <option value="outside">Outside</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Sort By</label>
              <select v-model="filters.sortBy" class="form-select">
                <option value="priority">Priority</option>
                <option value="created_at">Created At</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Order</label>
              <select v-model="filters.sortOrder" class="form-select">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div class="col-md-1 d-flex justify-content-end">
              <button class="btn btn-md btn-reset" @click="resetFilters" aria-label="Reset filters">
                <FontAwesomeIcon icon="trash" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Habits list-->
    <div class="row mt-4">
      <div class="col-12">
        <div class="habits-grid">
          <div v-for="habit in displayHabits" :key="habit.id" class="habit-item">
            <div class="card p-3 h-100 d-flex flex-column">
              <div class="card-header-custom">
                <div class="habit-title-section">
                  <strong class="habit-title">{{ habit.description }}</strong>
                  <div class="habit-category">Category: {{ habit.category || '' }}</div>
                </div>

                <!-- NEW ROW -->
                <div class="habit-meta-row">
                  <small class="location-info">
                    <FontAwesomeIcon icon="map-pin" /> {{ habit.location }}
                  </small>

                  <div class="priority-right">
                    {{ habit.priority.toUpperCase() }}
                  </div>
                </div>
              </div>
              <div class="habit-divider" aria-hidden="true"></div>

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
                    <FontAwesomeIcon icon="check-circle" class="check-icon" />
                  </div>
                  <div class="check-text">
                    <span v-if="habit.current_progress.checked" class="status-completed"
                      >Completed</span
                    >
                    <span v-else class="status-pending">
                      <span class="pending-text">Pending</span>
                      <span class="pending-dots" aria-hidden="true">
                        <span class="dot">.</span>
                        <span class="dot">.</span>
                        <span class="dot">.</span>
                      </span>
                    </span>
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
                  <button class="btn btn-sm btn-outline-danger" @click="deleteHabit(habit.id)">
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
                    @click="markProgressComplete(habit)"
                  >
                    <FontAwesomeIcon icon="check" /> Mark Complete
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteHabit(habit.id)">
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
                  <span class="time-value">{{
                    formatSecondsToMinSec(habit.remaining_seconds ?? habit.target_minutes * 60 ?? 0)
                  }}</span>
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
                    @click="markProgressComplete(habit)"
                  >
                    <FontAwesomeIcon icon="check" /> Mark Complete
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteHabit(habit.id)">
                    <FontAwesomeIcon icon="trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TIMER MODAL  -->
    <div class="modal fade" id="timerModal" tabindex="-1" ref="timerModalEl">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content custom-timer-modal">
          <div class="modal-header border-0 p-4 d-flex align-items-center">
            <div style="width: 32px;"></div> <!-- Spacer to perfectly center the title -->
            <h5 class="modal-title text-center fw-bold m-0 flex-grow-1" style="color: var(--primary-color);">
              {{ activeTimerHabit?.description }}
            </h5>
            <button class="btn-close m-0" data-bs-dismiss="modal" @click="onCloseTimerModal" style="width: 32px; padding: 0;"></button>
          </div>
          <div class="modal-body text-center pt-4 pb-4">
            <div class="timer-display-wrapper mb-4 d-flex justify-content-center align-items-center">
              <div 
                class="timer-rectangle" 
                :style="timerIsRunning ? 'border: 4px solid var(--primary-color); box-shadow: 0 0 15px rgba(53, 93, 76, 0.2);' : 'border: 4px solid var(--primary-color);'"
                style="padding: 2rem 3rem; width: 100%; max-width: 320px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(79, 111, 95, 0.08), rgba(212, 237, 218, 0.1)); transition: all 0.3s ease;"
              >
                <span class="timer-value fw-bold m-0" style="color: var(--primary-color); font-family: 'Outfit', sans-serif; font-size: 4.5rem; line-height: 1;">
                  {{ formattedTime }}
                </span>
              </div>
            </div>
            
            <p class="text-muted mb-4">
              <span v-if="timerIsRunning" class="badge rounded-pill px-3 py-2" style="background-color: var(--primary-color); color: white;">
                <FontAwesomeIcon icon="circle-notch" spin class="me-1" /> Running
              </span>
              <span v-else class="badge rounded-pill px-3 py-2" style="background-color: var(--secondary-color); color: var(--primary-color);">
                Paused
              </span>
            </p>

            <div class="d-flex gap-3 justify-content-center px-3">
              <button 
                class="btn flex-fill fw-bold py-2 custom-action-btn" 
                @click="timerIsRunning ? pauseTimerButton() : startTimerButton()"
                :style="!timerIsRunning ? 'background-color: var(--primary-color); color: white; border: none;' : 'border: 1px solid var(--primary-color); color: var(--primary-color); background-color: transparent;'"
              >
                <FontAwesomeIcon :icon="timerIsRunning ? 'pause' : 'play'" class="me-1" /> 
                {{ timerIsRunning ? 'Pause' : 'Start' }}
              </button>
              
              <button 
                class="btn flex-fill fw-bold py-2 custom-complete-btn" 
                style="background-color: var(--orange); color: white; border: none;" 
                @click="completeTimerHabit"
              >
                <FontAwesomeIcon icon="trophy" class="me-1" /> Complete
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
        <FontAwesomeIcon :icon="toast.title === 'Habit deleted' ? 'trash' : 'check-circle'" />
      </div>
      <div class="toast-content">
        <strong>{{ toast.title }}</strong>
        <small>{{ toast.message }}</small>
      </div>
    </div>
  </Transition>
  <footer class="modo-footer">
    <img src="../images/footer.svg" alt="Modo Footer" class="footer-content" />
  </footer>
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
import { getLocation, createLocation, updateLocation } from '@/api/services/locations.services'
import {
  getUserTasks,
  deleteUserTask,
  completeUserTask,
  updateUserTask,
  assignTaskToUser,
} from '@/api/services/userTasks.services'

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

// Track the geolocation watch ID for cleanup
const geoWatchId = ref(null)
// Track the last saved coordinates to avoid unnecessary DB updates
const lastSavedCoords = ref(null)

onMounted(async () => {
  habitStore.loadFromLocalStorage()
  habitStore.reconcileRunningTimers()
  if (userStore.loadFromLocalStorage) await userStore.loadFromLocalStorage()

  await fetchLocationAndWeather()
  await fetchUserTasks()
})

const apiUserTasks = ref([])

async function fetchUserTasks() {
  if (!currentUser.value) return
  const userId = currentUser.value.id_utilizador || currentUser.value.id
  try {
    const res = await getUserTasks(userId, userStore.token, { limit: 100 })
    apiUserTasks.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error('Failed to fetch user tasks', e)
  }
}

async function fetchLocationAndWeather() {
  const token = userStore.token
  const userId = currentUser.value?.id_utilizador || currentUser.value?.id
  if (!userId || !token) return

  try {
    const locRes = await getLocation(userId, token)
    if (locRes && locRes.latitude) {
      // Load weather from existing DB location
      weatherStore.fetchCurrentWeatherByLocation(locRes.latitude, locRes.longitude)
      lastSavedCoords.value = { latitude: locRes.latitude, longitude: locRes.longitude }
      // Start watching for position changes to keep DB up-to-date
      startLocationWatch(userId, token, 'PATCH')
    } else {
      // No DB location yet — request browser permission and POST if granted
      startLocationWatch(userId, token, 'POST')
    }
  } catch (err) {
    if (
      err.status === 404 ||
      err.statusCode === 404 ||
      (err.description && String(err.description).toLowerCase().includes('not found')) ||
      (err.message && String(err.message).toLowerCase().includes('not found'))
    ) {
      // No location in DB → try to create one if user grants permission
      startLocationWatch(userId, token, 'POST')
    } else {
      console.error('Failed to get location:', err)
      weatherStore.fetchCurrentWeather('Vila do Conde', 'PT')
    }
  }
}

/**
 * Start a geolocation watchPosition.
 * - If the user DENIES permission: do NOT save anything to the DB, just use weather fallback.
 * - If the user GRANTS permission: save/update location in DB and update weather.
 * - On subsequent position changes: PATCH the DB if coordinates moved by >0.001 degrees.
 */
function startLocationWatch(userId, token, initialMethod = 'POST') {
  if (!navigator.geolocation) {
    // Browser does not support geolocation — no location saved, fallback weather
    weatherStore.fetchCurrentWeather('Vila do Conde', 'PT')
    return
  }

  // Clear any existing watch
  if (geoWatchId.value !== null) {
    navigator.geolocation.clearWatch(geoWatchId.value)
    geoWatchId.value = null
  }

  let method = initialMethod

  geoWatchId.value = navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords

      // Check if coordinates changed enough to warrant a DB update (>0.001° ≈ 110m)
      const prev = lastSavedCoords.value
      const moved =
        !prev ||
        Math.abs(latitude - prev.latitude) > 0.001 ||
        Math.abs(longitude - prev.longitude) > 0.001

      // Always update weather in real time
      weatherStore.fetchCurrentWeatherByLocation(latitude, longitude)

      if (!moved) return // No significant movement — skip DB update

      lastSavedCoords.value = { latitude, longitude }

      try {
        let city = 'Unknown'
        let country = 'Unknown'

        try {
          // Nominatim requires a custom User-Agent to avoid blocking
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'User-Agent': 'ModoApp/1.0',
                Accept: 'application/json',
              },
            },
          )
          if (res.ok) {
            const data = await res.json()
            city = data.address?.city || data.address?.town || data.address?.village || 'Unknown'
            country = data.address?.country_code?.toUpperCase() || 'Unknown'
          }
        } catch (geomErr) {
          console.warn('Reverse geocoding failed, falling back to Unknown:', geomErr)
        }

        const payload = { latitude, longitude, cidade: city, pais: country }

        if (method === 'POST') {
          await createLocation(userId, payload, token)
          method = 'PATCH' // Subsequent updates are PATCHes
        } else {
          await updateLocation(userId, payload, token)
        }
      } catch (e) {
        console.error('Saving location to database failed:', e)
      }
    },
    (err) => {
      // User denied permission or error occurred — do NOT save anything to DB
      console.warn('Location permission denied or unavailable:', err)
      // Only show weather fallback, no DB entry created
      weatherStore.fetchCurrentWeather('Vila do Conde', 'PT')
    },
    {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000, // Accept cached position up to 1 minute old
    },
  )
}

const currentUser = computed(() => userStore.currentUser)
const userLevel = computed(() => {
  if (!currentUser.value || Number.isNaN(Number(currentUser.value.points))) return 0
  return Math.floor((currentUser.value.points || 0) / 100)
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
  return apiUserTasks.value.map((t) => {
    const taskData = t.task || {}
    const isCompleted =
      t.estado_tarefa === 'Completed' ||
      t.progresso >= 100 ||
      (taskData.tipo_tarefa === 'Check' && t.progresso > 0)

    return {
      id: t.id_tarefa,
      estado_tarefa: t.estado_tarefa,
      description: taskData.nome_tarefa || 'Unknown Task',
      category: taskData.categoria || '',
      location: (taskData.localizacao_tarefa || 'inside').toLowerCase(),
      priority: (taskData.prioridade_tarefa || 'low').toLowerCase(),
      type:
        (taskData.tipo_tarefa || 'check').toLowerCase() === 'timer'
          ? 'time'
          : (taskData.tipo_tarefa || 'check').toLowerCase(),
      current_progress: {
        checked: isCompleted,
        count: t.progresso || 0,
        seconds: t.progresso || 0 // Progress is saved in seconds for timers
      },
      target_count: taskData.quantidade_necessaria || 1,
      target_seconds: taskData.duracao_temporizador || 900,
      target_minutes: Math.ceil((taskData.duracao_temporizador || 900) / 60),
      created_at: t.created_at || new Date(),
      remaining_seconds: Math.max(0, (taskData.duracao_temporizador || 900) - (t.progresso || 0)),
      timer_last_started_at: null,
      concluido: isCompleted ? 1 : 0,
    }
  })
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
    // Hide tasks that are already fully completed via the backend endpoint
    if (h.estado_tarefa === 'Completed') return false

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
async function handleAdd() {
  if (!currentUser.value) return showToast('Error', 'Please log in first')

  const userId = currentUser.value.id_utilizador || currentUser.value.id

  // Map frontend form values to backend expected enums
  const backendTypeMap = { check: 'Check', count: 'Count', time: 'Timer', timer: 'Timer' }
  const backendPriorityMap = { low: 'Low', medium: 'Medium', high: 'High' }
  const backendLocationMap = { inside: 'Inside', outside: 'Outside' }

  const payload = {
    nome_tarefa: form.value.description,
    tipo_tarefa: backendTypeMap[form.value.type] || 'Check',
    prioridade_tarefa: backendPriorityMap[form.value.priority] || 'Low',
    localizacao_tarefa: backendLocationMap[form.value.location] || 'Inside',
    quantidade_necessaria: form.value.type === 'count' ? form.value.target_count : null,
    duracao_temporizador: form.value.type === 'time' ? form.value.target_minutes * 60 : null,
    pontos_tarefa: 15, // Base points for a new custom task
  }

  try {
    await assignTaskToUser(userId, payload, userStore.token)

    // Provide immediate feedback
    showToast(
      'Task created!',
      `${form.value.description} · ${payload.prioridade_tarefa} · ${payload.localizacao_tarefa}`,
      'success',
    )

    resetForm()
    await fetchUserTasks() // refresh from backend
  } catch (e) {
    console.error('Failed to create task:', e)
    showToast('Error', 'Failed to create task. Check your inputs.', 'error')
  }
}

// Delete a habit after confirmation and show a toast
async function deleteHabit(id) {
  if (confirm('Delete task?')) {
    const userId = currentUser.value?.id_utilizador || currentUser.value?.id
    try {
      await deleteUserTask(userId, id, userStore.token)
      showToast('Task deleted', 'Removed from your list')
      await fetchUserTasks()
    } catch (e) {
      console.error(e)
    }
  }
}

async function increment(id) {
  const userId = currentUser.value?.id_utilizador || currentUser.value?.id
  const userTask = apiUserTasks.value.find((t) => t.id_tarefa === id)
  if (!userTask) return
  const maxCount = userTask.task?.quantidade_necessaria || 1
  if (userTask.progresso >= maxCount) return
  
  userTask.progresso = (userTask.progresso || 0) + 1
  try {
    await updateUserTask(userId, id, { progresso: userTask.progresso }, userStore.token)
  } catch (e) {
    userTask.progresso -= 1 // rollback
    console.error(e)
  }
}

async function decrement(id) {
  const userId = currentUser.value?.id_utilizador || currentUser.value?.id
  const userTask = apiUserTasks.value.find((t) => t.id_tarefa === id)
  if (!userTask || (userTask.progresso || 0) <= 0) return
  // Optimistic update
  userTask.progresso = (userTask.progresso || 0) - 1
  try {
    await updateUserTask(userId, id, { progresso: userTask.progresso }, userStore.token)
  } catch (e) {
    userTask.progresso += 1 // rollback
    console.error(e)
  }
}

async function toggleCheck(id) {
  const userId = currentUser.value?.id_utilizador || currentUser.value?.id
  const userTask = apiUserTasks.value.find((t) => t.id_tarefa === id)
  if (!userTask) return
  const prev = userTask.progresso || 0
  const newProgress = prev > 0 ? 0 : 100
  // Optimistic update
  userTask.progresso = newProgress
  try {
    await updateUserTask(userId, id, { progresso: newProgress }, userStore.token)
  } catch (e) {
    userTask.progresso = prev // rollback
    console.error(e)
  }
}

async function markProgressComplete(habit) {
  const userId = currentUser.value?.id_utilizador || currentUser.value?.id
  const userTask = apiUserTasks.value.find((t) => t.id_tarefa === habit.id)
  if (!userTask) return
  
  const prev = userTask.progresso || 0
  const target = habit.type === 'count' ? habit.target_count : habit.target_seconds
  userTask.progresso = target
  
  try {
    await updateUserTask(userId, habit.id, { progresso: target }, userStore.token)
  } catch (e) {
    userTask.progresso = prev
    console.error(e)
  }
}

async function completeAndRemoveHabit(id) {
  const userId = currentUser.value?.id_utilizador || currentUser.value?.id

  // Optimistic: instantly set to Completed so the UI updates immediately
  const task = apiUserTasks.value.find((t) => t.id_tarefa === id)
  if (task) task.estado_tarefa = 'Completed'

  showToast('Success', 'Task completed! Points awarded.')
  window.dispatchEvent(new Event('habitCompleted'))

  try {
    await completeUserTask(userId, id, userStore.token)
    // Refresh user points in the background — don't block UI
    userStore.fetchCurrentUser(userId).catch((err) => console.warn('fetchCurrentUser failed:', err))
  } catch (e) {
    console.error('Failed to complete task:', e)
    // Rollback: restore the task if API call failed
    if (task) task.estado_tarefa = 'Pending'
    showToast('Error', 'Failed to complete task. Please try again.')
  }
}

async function completeTimerHabit() {
  if (activeTimerHabit.value) {
    const id = activeTimerHabit.value.id
    stopCountdown()
    timerInstance.value?.hide()

    const userId = userStore.currentUser?.id_utilizador || userStore.currentUser?.id

    // Optimistic: set to Completed immediately
    const task = apiUserTasks.value.find((t) => t.id_tarefa === id)
    if (task) task.estado_tarefa = 'Completed'

    showToast('Success', 'Task completed! Points awarded.')
    window.dispatchEvent(new Event('habitCompleted'))

    try {
      await completeUserTask(userId, id, userStore.token)
      userStore
        .fetchCurrentUser(userId)
        .catch((err) => console.warn('fetchCurrentUser failed:', err))
    } catch (e) {
      console.error('Failed to complete timer task:', e)
      // Rollback
      if (task) task.estado_tarefa = 'Pending'
      showToast('Error', 'Failed to complete task. Please try again.')
    }
  }
}

// Compute percent complete for time-based habits (using seconds)
function timePercent(h) {
  if (!h.target_seconds) return 0
  const targetSeconds = h.target_seconds
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

// Clean up timer interval and geolocation watch on component unmount
onUnmounted(() => {
  if (timerIntervalId.value) {
    clearInterval(timerIntervalId.value)
  }
  if (geoWatchId.value !== null) {
    navigator.geolocation.clearWatch(geoWatchId.value)
    geoWatchId.value = null
  }
})

function openTimer(id) {
  const habit = userHabits.value.find((h) => h.id === id)
  activeTimerHabit.value = habit

  // Get remaining seconds from habit
  remainingSeconds.value = habit.remaining_seconds
  timerIsRunning.value = false

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
        completeTimerHabit()
      }
      return
    }

    // Decrement by 1 second
    remainingSeconds.value--

    // Real-time update local display variable (so progress bar moves)
    if (activeTimerHabit.value) {
      const task = apiUserTasks.value.find((t) => t.id_tarefa === activeTimerHabit.value.id)
      if (task) {
        // We only update the reactive array temporarily here
        // The API call happens on pause or close
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

  if (remainingSeconds.value <= 0) {
    const h = activeTimerHabit.value
    remainingSeconds.value = h.target_seconds ?? 900
  }

  timerIsRunning.value = true
  startCountdown()
}

async function pauseTimerButton() {
  if (!activeTimerHabit.value) return
  stopCountdown()
  timerIsRunning.value = false
  await saveTimerProgress()
}

async function onCloseTimerModal() {
  stopCountdown()
  if (activeTimerHabit.value) {
    await saveTimerProgress()
  }
  activeTimerHabit.value = null
  timerIsRunning.value = false
}

async function saveTimerProgress() {
  const userId = currentUser.value?.id_utilizador || currentUser.value?.id
  const task = apiUserTasks.value.find((t) => t.id_tarefa === activeTimerHabit.value.id)
  if (!task || !userId) return
  // Progress is stored in seconds
  const targetSeconds = task.task?.duracao_temporizador || 900
  const elapsedSeconds = Math.max(0, targetSeconds - remainingSeconds.value)

  try {
    await updateUserTask(userId, task.id_tarefa, { progresso: elapsedSeconds }, userStore.token)
    await fetchUserTasks()
  } catch (e) {
    console.error('Failed to save timer progress', e)
  }
}
</script>
<style scoped>
.custom-timer-modal {
  border-radius: 20px;
  border: none;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
}

.timer-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: #f8f9fa;
  border: 8px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin: 0 auto;
}

.timer-running-glow {
  border-color: #97dbb4;
  box-shadow: 0 0 25px rgba(151, 219, 180, 0.5);
  transform: scale(1.05);
}

.custom-action-btn, .custom-complete-btn {
  border-radius: 12px;
  transition: all 0.2s ease;
}

.custom-action-btn:hover, .custom-complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.modo-footer {
  width: 100%;
  background: #3f6b56; /* green rectangle */
  padding: 40px 0;
  margin-top: 160px;
  display: flex;
  justify-content: center;
}

.footer-content {
  width: 60%;
  max-width: 1100px;
  height: auto;
  display: block;
}
</style>

<template>
  <div class="stats-wrapper">
    <div class="stats-header d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">
        <FontAwesomeIcon icon="chart-pie" class="text-warning me-2" />
        Habit Statistics
      </h5>
      <div class="btn-group" role="group">
        <button
          type="button"
          class="btn btn-sm btn-outline"
          :class="{ active: chartType === 'doughnut' }"
          @click="chartType = 'doughnut'"
          title="Doughnut Chart"
        >
          <FontAwesomeIcon icon="circle-notch" />
        </button>
        <button
          type="button"
          class="btn btn-sm btn-outline"
          :class="{ active: chartType === 'bar' }"
          @click="chartType = 'bar'"
          title="Bar Chart"
        >
          <FontAwesomeIcon icon="bars" />
        </button>
      </div>
    </div>
    <div class="chart-area">
      <canvas ref="canvas"></canvas>
    </div>
    <div class="stats-summary mt-2 text-center">
      <small class="text-muted">
        <span class="me-3">🎯 Active: {{ activeHabits }}</span>
        <span>✅ Completed: {{ completedCount }}</span>
      </small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'
import { useHabitStore } from '@/stores/habitStore'
import { useUserStore } from '@/stores/userStore'

const canvas = ref(null)
let chart = null
const habitStore = useHabitStore()
const userStore = useUserStore()
const chartType = ref('doughnut')

// Get completed count from localStorage
function getCompletedCount() {
  const userId = userStore.currentUser?.id
  if (!userId) return 0
  const key = `completedHabits_${userId}`
  return parseInt(localStorage.getItem(key) || '0', 10)
}

const completedCount = ref(getCompletedCount())

const activeHabits = computed(() => {
  const user = userStore.currentUser
  if (!user) return 0
  return (habitStore.getHabitsByUser(user.id) || []).length
})

function counts() {
  return [activeHabits.value, completedCount.value]
}

function getChartConfig() {
  const data = counts()
  const baseConfig = {
    data: {
      labels: ['Active Habits', 'Completed'],
      datasets: [
        {
          data,
          backgroundColor: ['#FCAB92', '#A4BD84'],
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType.value === 'doughnut',
          position: 'bottom',
        },
      },
    },
  }

  if (chartType.value === 'bar') {
    baseConfig.options.scales = {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    }
  }

  return { type: chartType.value, ...baseConfig }
}

function createChart() {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  const config = getChartConfig()
  chart = new Chart(ctx, config)
}

function updateChartType() {
  if (chart) {
    chart.destroy()
    createChart()
  }
}

// update when chart type changes
watch(chartType, () => {
  updateChartType()
})

// update when habits or currentUser change
watch(
  () => [userStore.currentUser, habitStore.habits.length],
  () => {
    completedCount.value = getCompletedCount()
    const data = counts()
    if (chart) {
      chart.data.datasets[0].data = data
      chart.update()
    }
  },
  { deep: true },
)

// Also listen for localStorage changes (for completed count updates)
function handleStorageChange() {
  completedCount.value = getCompletedCount()
  const data = counts()
  if (chart) {
    chart.data.datasets[0].data = data
    chart.update()
  }
}

onMounted(() => {
  createChart()
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('habitCompleted', handleStorageChange)
})

onBeforeUnmount(() => {
  if (chart) chart.destroy()
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('habitCompleted', handleStorageChange)
})
</script>

<template>
  <div class="stats-wrapper">
    <div class="stats-header d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">
        <FontAwesomeIcon icon="chart-pie" class="pie-color me-2" />
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
        <!-- inside the existing btn-group (next to the chart buttons) -->
        <button
          type="button"
          class="btn btn-sm btn-outline"
          :class="{ active: showDownloadOptions }"
          @click="toggleDownloadOptions"
          title="Download Report"
        >
          <FontAwesomeIcon icon="download" />
        </button>
      </div>
    </div>
    <!-- Download options panel -->
    <div
      v-if="showDownloadOptions"
      class="card p-3 mb-0 filters-card mt-3"
      style="max-width: 420px; margin: 0 auto"
    >
      <div class="row g-2 justify-content-center">
        <!-- MONTH -->
        <div class="col-6">
          <label style="font-size: 16px; justify-content: center">Month</label>
          <select v-model="selectedMonth" class="form-select">
            <option v-for="m in months" :key="m.value" :value="m.value">
              {{ m.label }}
            </option>
          </select>
        </div>

        <!-- WEEK -->
        <div class="col-6">
          <label style="font-size: 16px; justify-content: center">Week</label>
          <select v-model="selectedWeek" class="form-select">
            <option v-for="w in weeks" :key="w" :value="w">Week {{ w }}</option>
          </select>
        </div>

        <!-- BUTTON CENTERED -->
        <div class="col-12 mt-2 d-flex justify-content-center">
          <button
            type="button"
            :class="['btn', isDownloading ? 'btn-preparing' : 'btn-primary']"
            :disabled="isDownloading"
            @click="startDownloadReport"
          >
            <span v-if="!isDownloading"> <FontAwesomeIcon icon="file-pdf" /> Download Report </span>
            <span v-else> Preparing... {{ downloadProgress }}% </span>
          </button>
        </div>

        <!-- PROGRESS -->
        <div v-if="isDownloading" class="col-12 mt-2">
          <div class="progress" style="height: 10px">
            <div class="progress-bar" :style="{ width: downloadProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="!showDownloadOptions" class="chart-area">
      <canvas ref="canvas"></canvas>
    </div>
    <div v-show="!showDownloadOptions" class="stats-summary mt-2 text-center">
      <small class="text-muted">
        <span class="me-3">🎯 Active: {{ activeTasks }}</span>
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

// Add this import at top:
import { jsPDF } from 'jspdf' // requires installing jspdf

// Add reactive state
const showDownloadOptions = ref(false)
const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Month ${i + 1}` }))
const weeks = [1, 2, 3, 4, 5]
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedWeek = ref(1)

const isDownloading = ref(false)
const downloadProgress = ref(0)
let downloadInterval = null

function toggleDownloadOptions() {
  showDownloadOptions.value = !showDownloadOptions.value
  /* if (showDownloadOptions.value) {
    // opening panel: destroy chart so it doesn't reappear
    if (chart) {
      chart.destroy()
      chart = null
    }
  } else {
    // closing panel: recreate chart after DOM updates
    setTimeout(() => {
      createChart()
    }, 50)
  } */
}

// This simulates the countdown/progress and then generates a PDF
function startDownloadReport() {
  if (isDownloading.value) return
  isDownloading.value = true
  downloadProgress.value = 0

  // Simulate progress (adjust duration as you like)
  const totalDuration = 1500 // ms to reach 100%
  const stepMs = 50
  const steps = Math.ceil(totalDuration / stepMs)
  const stepInc = Math.ceil(100 / steps)

  downloadInterval = setInterval(() => {
    downloadProgress.value = Math.min(100, downloadProgress.value + stepInc)
    if (downloadProgress.value >= 100) {
      clearInterval(downloadInterval)
      downloadInterval = null
      // After short delay, generate the PDF and reset UI
      setTimeout(() => {
        generatePdfReport()
        isDownloading.value = false
        downloadProgress.value = 0
        showDownloadOptions.value = false
      }, 300)
    }
  }, stepMs)
}

// Create a simple PDF with user stats (customize layout/content as needed)
function generatePdfReport() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const user = userStore.currentUser || { name: 'Unknown', id: 'N/A', points: 0 }
  const now = new Date()
  const title = `User Report - ${user.name}`
  const subtitle = `Month ${selectedMonth.value} · Week ${selectedWeek.value} · Generated ${now.toLocaleString()}`

  doc.setFontSize(18)
  doc.text(title, 40, 60)
  doc.setFontSize(12)
  doc.text(subtitle, 40, 85)

  // Basic stats
  doc.setFontSize(14)
  doc.text(`User ID: ${user.id}`, 40, 120)
  doc.text(`Name: ${user.name}`, 40, 140)
  doc.text(`Points: ${user.points ?? 0}`, 40, 160)
  doc.text(`Active Habits: ${activeTasks.value}`, 40, 180)
  doc.text(`Completed Habits: ${completedCount.value}`, 40, 200)

  // Optionally add more details here (tables, charts as images, etc.)
  const filename = `report_${user.id || 'user'}_m${selectedMonth.value}_w${selectedWeek.value}.pdf`
  doc.save(filename)
}

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

const activeTasks = computed(() => {
  const user = userStore.currentUser
  if (!user) return 0
  return (habitStore.getHabitsByUser(user.id) || []).length
})

function counts() {
  return [activeTasks.value, completedCount.value]
}

function getChartConfig() {
  const data = counts()
  const baseConfig = {
    data: {
      labels: ['Active Tasks', 'Completed'],
      datasets: [
        {
          data,
          backgroundColor: ['#EBAC70', 'rgba(53, 93, 76, 0.70)'],
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
  // If a chart exists, destroy it before creating a new one
  if (chart) {
    chart.destroy()
    chart = null
  }
  const ctx = canvas.value.getContext('2d')
  const config = getChartConfig()
  chart = new Chart(ctx, config)
}

function updateChartType() {
  if (!chart) {
    createChart()
    return
  }
  const config = getChartConfig()
  chart.config.type = config.type
  chart.config.data = config.data
  chart.config.options = config.options
  chart.update()
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

// also listen for localStorage changes (for completed count updates)
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
  window.addEventListener('taskCompleted', handleStorageChange)
})

onBeforeUnmount(() => {
  if (chart) chart.destroy()
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('taskCompleted', handleStorageChange)
  // inside onBeforeUnmount or onUnmounted section
  if (downloadInterval) {
    clearInterval(downloadInterval)
    downloadInterval = null
  }
})
</script>

<style scoped></style>

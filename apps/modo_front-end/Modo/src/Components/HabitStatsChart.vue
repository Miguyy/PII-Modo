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
        <span class="me-3">🎯 Active: {{ activeTasksCount }}</span>
        <span>✅ Completed: {{ completedCount }}</span>
      </small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'
import { useUserStore } from '@/stores/userStore'
import { createReportForUser } from '@/api/services/reports.services'

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

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

async function startDownloadReport() {
  if (isDownloading.value) return
  isDownloading.value = true
  downloadProgress.value = 10 // Start progress

  const userId = userStore.currentUser?.id_utilizador || userStore.currentUser?.id
  const token = userStore.token
  
  if (!userId || !token) {
    isDownloading.value = false
    alert('User not logged in.')
    return
  }

  // Simulate progress while waiting for backend
  const progressInterval = setInterval(() => {
    if (downloadProgress.value < 90) {
      downloadProgress.value += 5
    }
  }, 500)

  try {
    const formData = new FormData()
    formData.append('mes', selectedMonth.value)
    formData.append('semana', selectedWeek.value)

    const res = await createReportForUser(userId, formData, token)
    clearInterval(progressInterval)
    downloadProgress.value = 100

    setTimeout(() => {
      isDownloading.value = false
      showDownloadOptions.value = false
      downloadProgress.value = 0
      
      if (res && res.caminho_relatorio) {
        window.open(res.caminho_relatorio, '_blank')
      } else {
        alert('Report generated but no file link was returned.')
      }
    }, 500)
  } catch(e) {
    clearInterval(progressInterval)
    isDownloading.value = false
    alert('Failed to generate report.')
    console.error(e)
  }
}

const canvas = ref(null)
let chart = null
const chartType = ref('doughnut')

const activeTasksCount = computed(() => {
  if (!props.tasks) return 0
  return props.tasks.filter(t => t.estado_tarefa !== 'Completed').length
})

const completedCount = computed(() => {
  if (!props.tasks) return 0
  return props.tasks.filter(t => t.estado_tarefa === 'Completed').length
})

function counts() {
  return [activeTasksCount.value, completedCount.value]
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
  () => [props.tasks],
  () => {
    if (chart) {
      chart.data.datasets[0].data = counts()
      chart.update()
    }
  },
  { deep: true },
)

// also listen for localStorage changes (for completed count updates)
function handleStorageChange() {
  if (chart) {
    chart.data.datasets[0].data = counts()
    chart.update()
  }
}

onMounted(() => {
  createChart()
  window.addEventListener('habitCompleted', handleStorageChange)
})

onBeforeUnmount(() => {
  if (chart) chart.destroy()
  window.removeEventListener('habitCompleted', handleStorageChange)
  // inside onBeforeUnmount or onUnmounted section
  if (downloadInterval) {
    clearInterval(downloadInterval)
    downloadInterval = null
  }
})
</script>

<style scoped></style>

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
        <!-- Reports panel toggle -->
        <button
          type="button"
          class="btn btn-sm btn-outline"
          :class="{ active: showDownloadOptions }"
          @click="toggleDownloadOptions"
          title="Generate Report"
        >
          <FontAwesomeIcon icon="download" />
        </button>
      </div>
    </div>

    <!-- Report generation panel -->
    <div v-if="showDownloadOptions" class="report-panel mt-3">
      <div class="report-period-info d-flex flex-wrap align-items-center gap-2 mb-3">
        <span class="period-badge text-nowrap">
          <FontAwesomeIcon icon="calendar" class="me-1" v-if="false" /> Month {{ currentMes }} — Week {{ currentSemana }}
        </span>
        <span class="completed-badge text-nowrap">
          <FontAwesomeIcon icon="check-circle" class="me-1" /> {{ completedThisPeriod.length }} completed
        </span>
      </div>

      <div class="row g-2 justify-content-center">
        <!-- MONTH -->
        <div class="col-6">
          <label style="font-size: 14px">Month</label>
          <select v-model="selectedMonth" class="form-select form-select-sm">
            <option v-for="m in months" :key="m.value" :value="m.value">
              {{ m.label }}
            </option>
          </select>
        </div>

        <!-- WEEK -->
        <div class="col-6">
          <label style="font-size: 14px">Week</label>
          <select v-model="selectedWeek" class="form-select form-select-sm">
            <option v-for="w in weeks" :key="w" :value="w">Week {{ w }}</option>
          </select>
        </div>

        <!-- GENERATE BUTTON -->
        <div class="col-12 mt-2 d-flex justify-content-center">
          <button
            type="button"
            class="btn btn-generate w-100"
            :disabled="isGenerating"
            @click="generateReport"
          >
            <FontAwesomeIcon
              :icon="isGenerating ? 'circle-notch' : 'download'"
              :spin="isGenerating"
              class="me-1"
            />
            <span v-if="!isGenerating">Generate &amp; Save Report</span>
            <span v-else>Generating... {{ generateProgress }}%</span>
          </button>
        </div>

        <!-- PROGRESS BAR -->
        <div v-if="isGenerating" class="col-12 mt-1">
          <div class="progress" style="height: 6px; border-radius: 4px">
            <div
              class="progress-bar progress-bar-striped progress-bar-animated"
              :style="{ width: generateProgress + '%' }"
            ></div>
          </div>
        </div>

        <!-- SUCCESS MSG -->
        <div v-if="lastReportUrl" class="col-12 mt-2 text-center">
          <small class="text-success fw-semibold">
            <FontAwesomeIcon icon="check-circle" class="me-1" /> Report saved and download started!
          </small>
        </div>
      </div>
    </div>

    <!-- Chart area -->
    <div v-show="!showDownloadOptions" class="chart-area">
      <canvas ref="canvas"></canvas>
    </div>
    <div v-show="!showDownloadOptions" class="stats-summary mt-2 text-center">
      <small class="text-muted">
        <span class="me-3">Active: {{ activeTasksCount }}</span>
        <span><FontAwesomeIcon icon="check-circle" class="me-1" /> Completed: {{ completedCount }}</span>
      </small>
    </div>
  </div>

  <!-- Toast notification -->
  <Transition name="toast-slide">
    <div v-if="toast.visible" class="toast-notification" :class="toast.type">
      <div class="toast-icon">
        <FontAwesomeIcon :icon="toast.type === 'error' ? 'times-circle' : toast.type === 'warning' ? 'exclamation-triangle' : 'check-circle'" />
      </div>
      <div class="toast-content">
        <strong>{{ toast.title }}</strong>
        <small>{{ toast.message }}</small>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'
import { jsPDF } from 'jspdf'
import { useUserStore } from '@/stores/userStore'
import { createReportForUser } from '@/api/services/reports.services'

const props = defineProps({
  /** Raw API userTasks array (for chart counts and report content) */
  tasks: {
    type: Array,
    default: () => []
  },
  /** Alias accepted for backward compat */
  rawTasks: {
    type: Array,
    default: null
  }
})

const userStore = useUserStore()

const toast = ref({
  visible: false,
  title: '',
  message: '',
  type: 'success', // 'success', 'error', 'warning'
  timeout: null,
})

function showToast(title, message, type = 'success', duration = 3000) {
  toast.value.title = title
  toast.value.message = message
  toast.value.type = type
  toast.value.visible = true

  if (toast.value.timeout) clearTimeout(toast.value.timeout)

  toast.value.timeout = setTimeout(() => {
    toast.value.visible = false
  }, duration)
}


/* ─── Report panel state ─── */
const showDownloadOptions = ref(false)
const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Month ${i + 1}` }))
const weeks = [1, 2, 3, 4, 5]
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedWeek = ref(Math.ceil(new Date().getDate() / 7))

const isGenerating = ref(false)
const generateProgress = ref(0)
const lastReportUrl = ref(null)
let progressInterval = null

/** Current month (1-12) */
const currentMes = computed(() => new Date().getMonth() + 1)

/** Current week-of-month: day 1-7 = 1, 8-14 = 2, etc. */
const currentSemana = computed(() => Math.ceil(new Date().getDate() / 7))

/** Effective tasks list — prefers rawTasks if provided */
const effectiveTasks = computed(() => props.rawTasks ?? props.tasks)

/**
 * Tasks completed during selectedMonth / selectedWeek period.
 */
const completedThisPeriod = computed(() => {
  const mes = selectedMonth.value
  const semana = selectedWeek.value
  const now = new Date()
  const year = now.getFullYear()
  const month = mes - 1 // 0-indexed
  const weekStart = (semana - 1) * 7 + 1
  const weekEnd = Math.min(semana * 7, new Date(year, month + 1, 0).getDate())
  const start = new Date(year, month, weekStart)
  const end = new Date(year, month, weekEnd, 23, 59, 59)

  return effectiveTasks.value.filter(t => {
    if (t.estado_tarefa !== 'Completed') return false
    if (!t.data_conclusao) return true // no date — include by default
    const d = new Date(t.data_conclusao)
    return d >= start && d <= end
  })
})

function toggleDownloadOptions() {
  showDownloadOptions.value = !showDownloadOptions.value
  lastReportUrl.value = null
}

/**
 * Generates a full text report, uploads it to Cloudinary via the backend
 * and opens the Cloudinary URL on success.
 */
async function generateReport() {
  if (isGenerating.value) return

  const userId = userStore.currentUser?.id_utilizador || userStore.currentUser?.id
  const token = userStore.token

  if (!userId || !token) {
    showToast('Not Logged In', 'You must be logged in to generate a report.', 'error')
    return
  }

  isGenerating.value = true
  generateProgress.value = 10
  lastReportUrl.value = null

  // Animate progress while waiting for the network
  progressInterval = setInterval(() => {
    if (generateProgress.value < 85) generateProgress.value += 5
  }, 400)

  try {
    const mes = selectedMonth.value
    const semana = selectedWeek.value
    const now = new Date()
    const completed = completedThisPeriod.value
    const allTasks = effectiveTasks.value
    const user = userStore.currentUser

    const lines = [
      `Generated: ${now.toLocaleString()}`,
      `Period: Month ${mes}, Week ${semana}`,
      `User: ${user?.name || user?.nome || 'Unknown'}`,
      `Total Points: ${user?.pontos ?? user?.points ?? 0}`,
      ``,
      `--- Tasks Completed This Period (${completed.length}) ---`,
    ]

    completed.forEach((t, i) => {
      const task = t.task || {}
      lines.push(
        `${i + 1}. ${task.nome_tarefa || 'Task #' + t.id_tarefa}` +
        ` | Category: ${task.categoria || 'N/A'}` +
        ` | Points: ${task.pontos_tarefa ?? 0}` +
        ` | Completed: ${t.data_conclusao ? new Date(t.data_conclusao).toLocaleDateString() : 'N/A'}`
      )
    })

    lines.push(``)
    lines.push(`--- All Tasks (${allTasks.length}) ---`)
    allTasks.forEach((t, i) => {
      const task = t.task || {}
      lines.push(
        `${i + 1}. ${task.nome_tarefa || 'Task #' + t.id_tarefa}` +
        ` | Status: ${t.estado_tarefa}` +
        ` | Progress: ${t.progresso ?? 0}%`
      )
    })

    const conteudo = lines.join('\n')

    // Generate PDF using jsPDF
    const doc = new jsPDF()
    let y = 10
    
    // Title
    doc.setFontSize(16)
    doc.text('MODO — Habit Report', 10, y)
    y += 10
    
    // Body
    doc.setFontSize(11)
    lines.forEach(line => {
      // Split text to fit within page width (190mm)
      const splitLines = doc.splitTextToSize(line, 190)
      splitLines.forEach(splitLine => {
        if (y > 280) {
          doc.addPage()
          y = 10
        }
        doc.text(splitLine, 10, y)
        y += 7
      })
    })

    // Output as Blob
    const blob = doc.output('blob')
    const filename = `report_user${userId}_m${mes}_w${semana}_${Date.now()}.pdf`
    const file = new File([blob], filename, { type: 'application/pdf' })

    const formData = new FormData()
    formData.append('mes', String(mes))
    formData.append('semana', String(semana))
    formData.append('conteudo', conteudo) // Still save plain text content in DB if needed
    formData.append('caminho_relatorio', file)

    const res = await createReportForUser(userId, formData, token)

    clearInterval(progressInterval)
    generateProgress.value = 100

    setTimeout(() => {
      isGenerating.value = false
      generateProgress.value = 0

      if (res?.caminho_relatorio) {
        lastReportUrl.value = res.caminho_relatorio
        
        // Trigger the local file download directly from the generated jsPDF instance 
        // exactly like it was before the Cloudinary integration.
        doc.save(filename)
      } else {
        showToast('Warning', 'Report saved but no Cloudinary URL was returned.', 'warning')
      }
    }, 500)
  } catch (err) {
    clearInterval(progressInterval)
    isGenerating.value = false
    generateProgress.value = 0
    console.error('Failed to generate report:', err)
    const msg = err.response?.data?.message || err.message || 'Failed to generate report'
    showToast('Error', msg, 'error')
  }
}

/* ─── Chart ─── */
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
  if (chart) { chart.destroy(); chart = null }
  const ctx = canvas.value.getContext('2d')
  chart = new Chart(ctx, getChartConfig())
}

function updateChartType() {
  if (!chart) { createChart(); return }
  const config = getChartConfig()
  chart.config.type = config.type
  chart.config.data = config.data
  chart.config.options = config.options
  chart.update()
}

watch(chartType, () => updateChartType())

watch(
  () => [props.tasks],
  () => {
    if (chart) {
      chart.data.datasets[0].data = counts()
      chart.update()
    }
  },
  { deep: true }
)

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
  if (progressInterval) { clearInterval(progressInterval); progressInterval = null }
})
</script>

<style scoped>
.report-panel {
  background: linear-gradient(135deg, rgba(53, 93, 76, 0.08) 0%, rgba(53, 93, 76, 0.02) 100%);
  border: 1px solid rgba(53, 93, 76, 0.2);
  border-radius: 10px;
  padding: 1rem;
}

.period-badge {
  font-size: 0.75rem;
  background: rgba(53, 93, 76, 0.12);
  color: #355d4c;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
}

.completed-badge {
  font-size: 0.75rem;
  background: rgba(0, 150, 80, 0.12);
  color: #009650;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
}

.btn-generate {
  background: linear-gradient(135deg, #355d4c 0%, #4a7c63 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.45rem 1rem;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-generate:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
  color: #fff;
}

.btn-generate:disabled {
  opacity: 0.65;
  color: #fff;
}
</style>

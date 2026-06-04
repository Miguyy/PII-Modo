<template>
  <NavBar />
  <div class="containerBox">
    <div class="page-title">
      <h4>EXPLORE HABITS</h4>
      <h1>&#x2022;</h1>
    </div>

    <div class="row mt-2">
      <div class="col-12">
        <div class="card p-3 mb-0 filters-card">
          <input
            id="search_habit"
            class="search_habit"
            type="search"
            v-model="searchQuery"
            placeholder="Search for habits..."
          />

          <div class="row g-2 align-items-end">
            <div class="col-md-2">
              <label style="font-size: 16px">Type</label>
              <select class="form-select" v-model="selectedType">
                <option value="all">All</option>
                <option value="check">Check</option>
                <option value="count">Count</option>
                <option value="time">Time</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Priority</label>
              <select class="form-select" v-model="selectedPriority">
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Location</label>
              <select class="form-select" v-model="selectedLocation">
                <option value="all">All</option>
                <option value="inside">Inside</option>
                <option value="outside">Outside</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Sort By</label>
              <select class="form-select" v-model="sortBy">
                <option value="priority">Priority</option>
                <option value="location">Location</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Order</label>
              <select class="form-select" v-model="sortOrder">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div class="col-md-1 d-flex justify-content-end">
              <button class="btn btn-md btn-reset" @click="resetFilters" aria-label="Reset filters">
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-title" style="margin-top: 60px">
      <h4>MODO RECOMMENDATIONS</h4>
      <h1>&#x2022;</h1>
    </div>

    <div class="row mt-4 mb-5">
      <div class="col-12">
        <div class="habits-grid">
          <div
            class="habit-card"
            v-for="habit in recommendedHabits"
            :key="'rec-' + habit.id_habito"
            @click="viewTasks(habit)"
          >
            <div class="habit-header">
              <font-awesome-icon :icon="getIcon(habit.categoria)" class="habit-icon" />
              <h3>{{ habit.categoria }}</h3>
            </div>
            <div class="habit-body">
              <p>
                {{
                  habit.descricao_habito ||
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
                }}
              </p>
            </div>
            <div class="habit-footer">
              <span class="task-count">
                <font-awesome-icon icon="fa-solid fa-list-check" />
                {{ getTaskCount(habit.categoria) }} Tasks available
              </span>
              <span class="read-more">Read more</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-title">
      <h4>ALL HABITS</h4>
      <h1>&#x2022;</h1>
    </div>

    <div class="row mt-4 mb-5">
      <div class="col-12">
        <div class="habits-grid">
          <div
            class="habit-card"
            v-for="habit in uniqueHabits"
            :key="habit.id_habito"
            @click="viewTasks(habit)"
          >
            <div class="habit-header">
              <font-awesome-icon :icon="getIcon(habit.categoria)" class="habit-icon" />
              <h3>{{ habit.categoria }}</h3>
            </div>
            <div class="habit-body">
              <p>
                {{
                  habit.descricao_habito ||
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
                }}
              </p>
            </div>
            <div class="habit-footer">
              <span class="task-count">
                <font-awesome-icon icon="fa-solid fa-list-check" />
                {{ getTaskCount(habit.categoria) }} Tasks available
              </span>
              <span class="read-more">Read more</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="custom-modal-overlay" @click.self="closeModal">
      <div class="custom-modal-container">
        <div class="custom-modal-header">
          <h2 class="modal-main-title">{{ activeHabit?.categoria }}</h2>
          <button class="btn-add-habit" @click="addHabit(activeHabit)">
            <font-awesome-icon icon="fa-solid fa-plus" /> Add habit
          </button>
          <button class="custom-modal-close" @click="closeModal">&times;</button>
        </div>

        <div class="modal-tasks-list">
          <div v-if="activeTasks.length === 0" class="no-tasks-fallback text-center py-3">
            No active tasks match the selected criteria under this category.
          </div>
          <div v-else v-for="task in activeTasks" :key="task.id_tarefa" class="task-row-item">
            <span class="task-name-label">{{ task.nome_tarefa }}</span>

            <span class="meta-tag-badge">
              <font-awesome-icon icon="fa-solid fa-location-dot" />
              {{ task.localizacao_tarefa || 'Outside' }}
            </span>

            <span class="meta-tag-badge capitalize text-secondary">
              {{ task.tipo_tarefa || 'Check' }}
            </span>

            <span class="meta-tag-badge capitalize">
              {{ task.prioridade_tarefa || 'Medium' }}
            </span>

            <button class="btn-add-task" @click="addTask(task)">
              <font-awesome-icon icon="fa-solid fa-plus" /> Add task
            </button>
          </div>
        </div>

        <div class="modal-split-panels mt-3">
          <div class="panel-box description-panel">
            <h4>Description</h4>
            <div class="panel-inner-content">
              <p>
                In this habit, you can get up to {{ activeTasks.length }} tasks match your current
                choices. Each task can be completed dynamically to help make the surrounding world
                more lively, interactive, and ecological.
              </p>
            </div>
          </div>

          <div class="panel-box impacts-panel">
            <h4>Impacts</h4>
            <div class="panel-inner-content">
              <div v-if="isLoadingImpacts" class="text-center py-2 text-muted">
                Loading impact metrics...
              </div>
              <div v-else-if="activeImpacts.length === 0" class="text-muted">
                No impact data mapped for this category.
              </div>
              <ul v-else>
                <li v-for="impact in activeImpacts" :key="impact.id_impacto">
                  {{ impact.tipo_impacto }} - {{ impact.valor_por_unidade }} {{ impact.unidade }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import NavBar from '@/Components/NavBar.vue'
import { useUserStore } from '../stores/userStore'
import { useHabitStore } from '../stores/habitStore'
import { getTaskImpacts } from '../api/services/impacts.services.js'
import { assignHabitTasksToUser, assignTaskToUser } from '../api/services/userTasks.services.js'

export default {
  name: 'ExploreHabitsView',
  components: { NavBar },
  setup() {
    if (!sessionStorage.getItem('modo_token')) {
      try {
        const localData = localStorage.getItem('modo_user')
        if (localData) {
          const parsed = JSON.parse(localData)
          if (parsed.token) {
            sessionStorage.setItem('modo_token', parsed.token)
          }
        }
      } catch (e) {
        console.error('Failsafe initialization step intercepted an error:', e)
      }
    }

    const userStore = useUserStore()
    const habitStore = useHabitStore()

    const isModalOpen = ref(false)
    const activeHabit = ref(null)
    const activeImpacts = ref([])
    const isLoadingImpacts = ref(false)

    // Filter properties connected via v-model
    const searchQuery = ref('')
    const selectedType = ref('all')
    const selectedPriority = ref('all')
    const selectedLocation = ref('all')
    const sortBy = ref('priority')
    const sortOrder = ref('desc')

    const fetchFilteredData = async () => {
      const filters = {
        q: searchQuery.value || undefined,
        type: selectedType.value === 'all' ? undefined : selectedType.value,
        priority: selectedPriority.value === 'all' ? undefined : selectedPriority.value,
        location: selectedLocation.value === 'all' ? undefined : selectedLocation.value,
      }
      await habitStore.fetchHabitsAndTasks(filters)
    }

    watch([searchQuery, selectedType, selectedPriority, selectedLocation], () => {
      fetchFilteredData()
    })

    onMounted(async () => {
      if (typeof userStore.loadFromLocalStorage === 'function') {
        await userStore.loadFromLocalStorage()
      }
      if (typeof habitStore.fetchHabitsAndTasks === 'function') {
        await fetchFilteredData()
      }
    })

    const getIcon = (category) => {
      const name = String(category || '').toLowerCase()
      if (name.includes('garden') || name.includes('plant') || name.includes('biodiv'))
        return 'fa-solid fa-seedling'
      if (name.includes('energ')) return 'fa-solid fa-bolt'
      if (name.includes('mobil') || name.includes('walk')) return 'fa-solid fa-person-walking'
      if (name.includes('recycl')) return 'fa-solid fa-recycle'
      if (name.includes('wat')) return 'fa-solid fa-water'
      if (name.includes('digit')) return 'fa-solid fa-desktop'
      if (name.includes('food') || name.includes('comida') || name.includes('eat'))
        return 'fa-solid fa-utensils'
      return 'fa-solid fa-star'
    }

    const getTaskCount = (category) => {
      if (!category || !habitStore.catalogHabits) return 0

      const normCategory = String(category).trim().toLowerCase()
      const matchingHabitIds = habitStore.catalogHabits
        .filter((h) => String(h.categoria).trim().toLowerCase() === normCategory)
        .map((h) => h.id_habito)

      const flatTasksArray = habitStore.catalogTasks || []
      return flatTasksArray.filter((task) => matchingHabitIds.includes(task.id_habito)).length
    }

    // Habits are strictly filtered ONLY by text search queries
    const uniqueHabits = computed(() => {
      const rawList = habitStore.catalogHabits || []
      const trackingMap = new Map()

      rawList.forEach((item) => {
        const normCategory = String(item.categoria || '')
          .trim()
          .toLowerCase()
        if (!normCategory) return

        if (!trackingMap.has(normCategory)) {
          trackingMap.set(normCategory, item)
        } else if (!trackingMap.get(normCategory).descricao_habito && item.descricao_habito) {
          trackingMap.set(normCategory, item)
        }
      })

      let list = Array.from(trackingMap.values())

      // Note: we don't need to filter searchQuery locally anymore because the backend does it, 
      // but leaving it as a safe fallback just in case backend ignores it.
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        list = list.filter(
          (h) =>
            h.categoria?.toLowerCase().includes(query) ||
            h.descricao_habito?.toLowerCase().includes(query),
        )
      }

      // Hide habits that have 0 tasks based on the current active server-side filters
      list = list.filter((h) => getTaskCount(h.categoria) > 0)

      return list
    })

    const recommendedHabits = computed(() => {
      return [...uniqueHabits.value]
        .sort((a, b) => getTaskCount(b.categoria) - getTaskCount(a.categoria))
        .slice(0, 3)
    })

    // Dropdown filters and sorting are applied exclusively to Tasks
    const activeTasks = computed(() => {
      if (!activeHabit.value) return []

      const normCategory = String(activeHabit.value.categoria).trim().toLowerCase()
      const matchingHabitIds = (habitStore.catalogHabits || [])
        .filter((h) => String(h.categoria).trim().toLowerCase() === normCategory)
        .map((h) => h.id_habito)

      let tasks = []
      const flatTasksArray = habitStore.catalogTasks || []
      tasks = flatTasksArray.filter((task) => matchingHabitIds.includes(task.id_habito))

      // 1. Sort Remaining Tasks
      tasks.sort((a, b) => {
        let valA = ''
        let valB = ''

        if (sortBy.value === 'priority') {
          valA = String(a.prioridade_tarefa || 'medium').toLowerCase()
          valB = String(b.prioridade_tarefa || 'medium').toLowerCase()
        } else {
          valA = String(a.localizacao_tarefa || 'outside').toLowerCase()
          valB = String(b.localizacao_tarefa || 'outside').toLowerCase()
        }

        return sortOrder.value === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
      })

      return tasks
    })

    // Fetches metrics whenever a habit is selected
    const fetchImpactMetrics = async () => {
      if (!activeHabit.value) return
      isLoadingImpacts.value = true
      activeImpacts.value = []

      try {
        const token = sessionStorage.getItem('modo_token') || userStore.token
        const tasksList = activeTasks.value

        if (tasksList && tasksList.length > 0) {
          const promises = tasksList.map((task) =>
            getTaskImpacts(task.id_tarefa, token).catch(() => []),
          )

          const results = await Promise.all(promises)
          const allImpacts = results.flat()

          const aggregated = new Map()
          allImpacts.forEach((imp) => {
            if (!imp || !imp.tipo_impacto) return
            const key = imp.tipo_impacto.trim().toLowerCase()
            if (!aggregated.has(key)) {
              aggregated.set(key, { ...imp })
            } else {
              const current = aggregated.get(key)
              current.valor_por_unidade =
                Number(current.valor_por_unidade || 0) + Number(imp.valor_por_unidade || 0)
            }
          })

          activeImpacts.value = Array.from(aggregated.values())
        }
      } catch (err) {
        console.error('Failed to parse task impact lists:', err)
      } finally {
        isLoadingImpacts.value = false
      }
    }

    const viewTasks = (habit) => {
      activeHabit.value = habit
      isModalOpen.value = true
    }

    // Dynamic Watcher: Updates impact panels reactively when user alternates task filters on-the-fly
    watch(
      [activeHabit, activeTasks],
      () => {
        if (isModalOpen.value) {
          fetchImpactMetrics()
        }
      },
      { deep: false },
    )

    const closeModal = () => {
      isModalOpen.value = false
      activeHabit.value = null
      activeImpacts.value = []
    }

    const resetFilters = () => {
      searchQuery.value = ''
      selectedType.value = 'all'
      selectedPriority.value = 'all'
      selectedLocation.value = 'all'
      sortBy.value = 'priority'
      sortOrder.value = 'desc'
    }

    const addHabit = async (habit) => {
      if (!habit) return
      try {
        const token = sessionStorage.getItem('modo_token') || userStore.token
        const userId = userStore.currentUser?.id_utilizador || userStore.currentUser?.id
        if (!userId) {
          alert('You must be logged in to add habits.')
          return
        }
        await assignHabitTasksToUser(userId, { id_habito: habit.id_habito }, token)
        alert(`Successfully added all tasks from ${habit.categoria} to your habits!`)
      } catch(e) {
        console.error(e)
        alert('Failed to add habit.')
      }
    }

    const addTask = async (task) => {
      if (!task) return
      try {
        const token = sessionStorage.getItem('modo_token') || userStore.token
        const userId = userStore.currentUser?.id_utilizador || userStore.currentUser?.id
        if (!userId) {
          alert('You must be logged in to add tasks.')
          return
        }
        await assignTaskToUser(userId, { taskId: task.id_tarefa }, token)
        alert(`Successfully added task "${task.nome_tarefa}" to your habits!`)
      } catch(e) {
        console.error(e)
        alert('Failed to add task.')
      }
    }

    return {
      habitStore,
      isModalOpen,
      activeHabit,
      activeTasks,
      activeImpacts,
      isLoadingImpacts,
      searchQuery,
      selectedType,
      selectedPriority,
      selectedLocation,
      sortBy,
      sortOrder,
      uniqueHabits,
      recommendedHabits,
      getIcon,
      getTaskCount,
      viewTasks,
      closeModal,
      resetFilters,
      addHabit,
      addTask,
    }
  },
}
</script>

<style scoped>
/* Page Titles Overrides */
.page-title h4 {
  color: #2b4033 !important;
  font-weight: 700;
  letter-spacing: 1.8px;
  margin: 0;
}

/* Grid Container Setup */
.habits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* Default state card layout structure */
.habit-card {
  background-color: #dbdfde;
  border-radius: 16px;
  padding: 20px;
  color: #1a2b20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition:
    transform 0.25s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease,
    color 0.25s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
}

/* Hover active animation tracking styles block */
.habit-card:hover {
  background-color: #6d897d;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.habit-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.habit-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.habit-icon {
  font-size: 18px;
}

.habit-body p {
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  opacity: 0.9;
}

.habit-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(26, 43, 32, 0.15);
  padding-top: 12px;
  font-size: 13px;
  font-weight: 500;
}

.task-count {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.8;
}

/* Smooth opacity reveal system configuration */
.read-more {
  font-weight: 700;
  text-decoration: none;
  opacity: 0;
  transform: translateX(4px);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.habit-card:hover .read-more {
  opacity: 1;
  transform: translateX(0);
}

/* Layout Split Modal Windows Styles */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.custom-modal-container {
  background: #f4f6f5;
  width: 90%;
  max-width: 750px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.custom-modal-header {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  margin-bottom: 20px;
}

.modal-main-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1a2b20;
}

.btn-add-habit {
  background: #84968c;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 4px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.custom-modal-close {
  background: none;
  border: none;
  font-size: 28px;
  position: absolute;
  right: 0;
  top: -5px;
  cursor: pointer;
  color: #666;
}

/* Task Rows Container */
.modal-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 5px;
}

.task-row-item {
  display: flex;
  align-items: center;
  background: #e2e7e4;
  padding: 8px 16px;
  border-radius: 8px;
  gap: 12px;
}

.task-name-label {
  flex-grow: 1;
  font-weight: 500;
  color: #2c3e35;
  font-size: 14px;
}

.meta-tag-badge {
  background: #d2dad6;
  color: #55665c;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.capitalize {
  text-transform: capitalize;
}

.btn-add-task {
  background: #84968c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

/* Bottom Columns Structural Block Split Layout */
.modal-split-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.panel-box h4 {
  background: #6e8276;
  color: #ffffff;
  margin: 0;
  padding: 8px 16px;
  font-size: 15px;
  font-weight: 600;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.panel-inner-content {
  background: #ffffff;
  padding: 16px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #44554a;
  min-height: 110px;
}

.panel-inner-content ul {
  margin: 0;
  padding-left: 16px;
}

.panel-inner-content li {
  margin-bottom: 6px;
}
</style>

<template>
  <div class="admin-panel">
    <NavBar />

    <div class="container mt-4">
      <div class="page-title">
        <h4>ADMIN PANEL</h4>
        <h1>&#x2022;</h1>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!--  USERS TABLE                                                    -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="container mb-5">
      <div
        class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3"
      >
        <div class="d-flex gap-2 w-100 w-md-auto">
          <div class="input-group input-group-sm search-group me-2">
            <span class="input-group-text bg-white border-end-0 search-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#355D4C"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                />
              </svg>
            </span>
            <input
              v-model="search"
              class="form-control form-control-sm border-start-0 search-input"
              placeholder="Search users..."
              @input="handleSearch"
            />
          </div>
          <div class="total-badge align-self-center">
            Total: <strong>{{ userStore.usersMeta.total }}</strong>
          </div>
        </div>
      </div>

      <div class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 admin-table">
            <thead>
              <tr>
                <th style="width: 90px" class="sortable" @click="toggleSort('id')">
                  ID
                  <span class="sort-indicator" v-if="sortKey === 'id'">{{
                    sortDir === 'asc' ? '▲' : '▼'
                  }}</span>
                </th>
                <th class="sortable" @click="toggleSort('name')">
                  Name
                  <span class="sort-indicator" v-if="sortKey === 'name'">{{
                    sortDir === 'asc' ? '▲' : '▼'
                  }}</span>
                </th>
                <th style="width: 90px" class="sortable" @click="toggleSort('points')">
                  Points
                  <span class="sort-indicator" v-if="sortKey === 'points'">{{
                    sortDir === 'asc' ? '▲' : '▼'
                  }}</span>
                </th>
                <th style="width: 110px" class="sortable" @click="toggleSort('priority')">
                  Priority
                  <span class="sort-indicator" v-if="sortKey === 'priority'">{{
                    sortDir === 'asc' ? '▲' : '▼'
                  }}</span>
                </th>
                <th style="width: 140px" class="sortable" @click="toggleSort('email')">
                  Email
                  <span class="sort-indicator" v-if="sortKey === 'email'">{{
                    sortDir === 'asc' ? '▲' : '▼'
                  }}</span>
                </th>
                <th style="width: 180px" class="sortable" @click="toggleSort('createdAt')">
                  Date Created
                  <span class="sort-indicator" v-if="sortKey === 'createdAt'">{{
                    sortDir === 'asc' ? '▲' : '▼'
                  }}</span>
                </th>
                <th style="width: 120px">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in pagedUsers" :key="user.id">
                <td class="text-muted">{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.points ?? '-' }}</td>
                <td>{{ user.priority }}</td>
                <td class="text-truncate" style="max-width: 140px" :title="user.email">
                  {{ user.email }}
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <button
                    class="action-icon action-edit me-2"
                    @click="openEditModal(user)"
                    title="Edit"
                  >
                    <i class="bi bi-pencil" aria-hidden="true"></i>
                  </button>
                  <button
                    class="action-icon action-delete"
                    @click="deleteUser(user.id)"
                    title="Delete"
                  >
                    <i><FontAwesomeIcon icon="trash" class="bi bi-trash" /></i>
                  </button>
                </td>
              </tr>
              <tr v-if="pagedUsers.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">No users found.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center footer-clean">
          <div class="page-label">Page {{ pageLabel }}</div>
          <nav aria-label="Pagination">
            <ul class="pagination pagination-sm mb-0 d-flex gap-2">
              <li>
                <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
                  Previous
                </button>
              </li>
              <li>
                <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!--  DECORATIONS TABLE                                              -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="container mb-5">
      <div class="d-flex flex-row gap-3 align-items-center mb-3">
        <div class="input-group input-group-sm search-group flex-grow-1">
          <span class="input-group-text bg-white border-end-0 search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#355D4C"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
              />
            </svg>
          </span>
          <input
            v-model="decorationSearch"
            class="form-control form-control-sm border-start-0 search-input"
            placeholder="Search decorations..."
            @input="handleDecorationSearch"
          />
        </div>
        <div class="total-badge flex-shrink-0 align-self-center">
          Total: <strong>{{ decorationTotal }}</strong>
        </div>
        <button class="btn btn-add-decoration flex-shrink-0" @click="openAddDecorationModal">
          <i class="bi bi-plus-lg me-1"></i>Add
        </button>
      </div>

      <div class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 admin-table">
            <thead>
              <tr>
                <th style="width: 80px">Preview</th>
                <th class="sortable" @click="toggleDecorationSort('name')">
                  Name
                  <span class="sort-indicator" v-if="decorationSortKey === 'nome_decoracao'">{{
                    decorationSortDir === 'asc' ? '▲' : '▼'
                  }}</span>
                </th>
                <th
                  style="width: 130px"
                  class="sortable"
                  @click="toggleDecorationSort('requiredLevel')"
                >
                  Req. Level
                  <span class="sort-indicator" v-if="decorationSortKey === 'nivel_necessario'">{{
                    decorationSortDir === 'asc' ? '▲' : '▼'
                  }}</span>
                </th>
                <th style="width: 250px">Path / URL</th>
                <th style="width: 120px">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="decoration in pagedDecorations" :key="decoration.id">
                <td>
                  <img :src="decoration.src" :alt="decoration.name" class="decoration-preview" />
                </td>
                <td class="fw-medium">{{ decoration.name }}</td>
                <td>
                  <span class="level-badge">Lv. {{ decoration.requiredLevel ?? 0 }}</span>
                </td>
                <td
                  class="text-muted text-truncate"
                  style="max-width: 250px"
                  :title="decoration.src"
                >
                  {{ decoration.src }}
                </td>
                <td>
                  <button
                    class="action-icon action-edit me-2"
                    @click="editDecoration(decoration)"
                    title="Edit"
                  >
                    <i class="bi bi-pencil" aria-hidden="true"></i>
                  </button>
                  <button
                    class="action-icon action-delete"
                    @click="deleteDecorationHandler(decoration.id, decoration.name)"
                    title="Delete"
                  >
                    <i><FontAwesomeIcon icon="trash" class="bi bi-trash" /></i>
                  </button>
                </td>
              </tr>
              <tr v-if="pagedDecorations.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">
                  No decorations found matching criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center footer-clean">
          <div class="page-label">Page {{ decorationPageLabel }}</div>
          <nav aria-label="Decoration Pagination">
            <ul class="pagination pagination-sm mb-0 d-flex gap-2">
              <li>
                <button
                  class="page-btn"
                  :disabled="decorationCurrentPage === 1"
                  @click="prevDecorationPage"
                >
                  Previous
                </button>
              </li>
              <li>
                <button
                  class="page-btn"
                  :disabled="decorationCurrentPage === decorationTotalPages"
                  @click="nextDecorationPage"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!--  HABITS TABLE                                                   -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="container mb-5">
      <section id="habit-management">
        <div class="d-flex flex-row gap-3 align-items-center mb-3">
          <div class="input-group input-group-sm search-group flex-grow-1">
            <span class="input-group-text bg-white border-end-0 search-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#355D4C"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                />
              </svg>
            </span>
            <input
              v-model="habitSearch"
              class="form-control form-control-sm border-start-0 search-input"
              placeholder="Search habits..."
              @input="handleHabitSearch"
            />
          </div>
          <div class="total-badge flex-shrink-0 align-self-center">
            Total: <strong>{{ totalHabitCount }}</strong>
          </div>
          <button class="btn btn-add-decoration flex-shrink-0" @click="openAddHabitModal">
            <i class="bi bi-plus-lg me-1"></i>Add
          </button>
        </div>

        <div class="card shadow-sm border-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 admin-table">
              <thead>
                <tr>
                  <th style="width: 80px" class="sortable" @click="toggleHabitSort('id')">
                    ID
                    <span class="sort-indicator" v-if="habitSortKey === 'id'">{{
                      habitSortDir === 'asc' ? '▲' : '▼'
                    }}</span>
                  </th>
                  <th class="sortable" @click="toggleHabitSort('title')">
                    Title
                    <span class="sort-indicator" v-if="habitSortKey === 'title'">{{
                      habitSortDir === 'asc' ? '▲' : '▼'
                    }}</span>
                  </th>
                  <th class="sortable" @click="toggleHabitSort('category')">
                    Category
                    <span class="sort-indicator" v-if="habitSortKey === 'category'">{{
                      habitSortDir === 'asc' ? '▲' : '▼'
                    }}</span>
                  </th>
                  <th style="width: 120px">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="habit in paginatedHabitsList" :key="habit.id">
                  <td class="text-muted small">{{ habit.id }}</td>
                  <td>
                    <span class="d-block fw-semibold">{{ habit.title }}</span>
                    <small
                      class="text-muted text-truncate d-block"
                      style="max-width: 200px"
                      :title="habit.description"
                    >
                      {{ habit.description || 'No description provided' }}
                    </small>
                  </td>
                  <td>
                    <span v-if="habit.category" class="badge bg-light text-secondary border">{{
                      habit.category
                    }}</span>
                    <span v-else class="text-muted small">-</span>
                  </td>
                  <td>
                    <button
                      class="action-icon action-edit me-2"
                      @click="openEditHabitModal(habit)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil" aria-hidden="true"></i>
                    </button>
                    <button
                      class="action-icon action-delete"
                      @click="handleDeleteHabit(habit.id, habit.title)"
                      title="Delete"
                    >
                      <i><FontAwesomeIcon icon="trash" class="bi bi-trash" /></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="paginatedHabitsList.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted">
                    No habits registered in the system.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center footer-clean">
            <div class="page-label">Page {{ habitPageLabel }}</div>
            <nav aria-label="Habit Pagination">
              <ul class="pagination pagination-sm mb-0 d-flex gap-2">
                <li>
                  <button
                    class="page-btn"
                    :disabled="habitCurrentPage === 1"
                    @click="prevHabitPage"
                  >
                    Previous
                  </button>
                </li>
                <li>
                  <button
                    class="page-btn"
                    :disabled="habitCurrentPage === habitTotalPages"
                    @click="nextHabitPage"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </section>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!--  TASKS TABLE                                                    -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="container mb-5">
      <section id="task-management">
        <div class="d-flex flex-row gap-3 align-items-center mb-3">
          <div class="input-group input-group-sm search-group flex-grow-1">
            <span class="input-group-text bg-white border-end-0 search-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#355D4C"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                />
              </svg>
            </span>
            <input
              v-model="taskSearch"
              class="form-control form-control-sm border-start-0 search-input"
              placeholder="Search tasks..."
              @input="handleTaskSearch"
            />
          </div>
          <div class="total-badge flex-shrink-0 align-self-center">
            Total: <strong>{{ totalTaskCount }}</strong>
          </div>
          <button class="btn btn-add-decoration flex-shrink-0" @click="openAddTaskModal">
            <i class="bi bi-plus-lg me-1"></i>Add
          </button>
        </div>

        <div class="card shadow-sm border-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 admin-table">
              <thead>
                <tr>
                  <th style="width: 70px" class="sortable" @click="toggleTaskSort('id')">
                    ID
                    <span class="sort-indicator" v-if="taskSortKey === 'id'">{{
                      taskSortDir === 'asc' ? '▲' : '▼'
                    }}</span>
                  </th>
                  <th class="sortable" @click="toggleTaskSort('title')">
                    Title
                    <span class="sort-indicator" v-if="taskSortKey === 'title'">{{
                      taskSortDir === 'asc' ? '▲' : '▼'
                    }}</span>
                  </th>
                  <th style="width: 90px" class="sortable" @click="toggleTaskSort('points')">
                    Points
                    <span class="sort-indicator" v-if="taskSortKey === 'points'">{{
                      taskSortDir === 'asc' ? '▲' : '▼'
                    }}</span>
                  </th>
                  <th style="width: 90px" class="sortable" @click="toggleTaskSort('type')">
                    Type
                    <span class="sort-indicator" v-if="taskSortKey === 'type'">{{
                      taskSortDir === 'asc' ? '▲' : '▼'
                    }}</span>
                  </th>
                  <th style="width: 95px" class="sortable" @click="toggleTaskSort('priority')">
                    Priority
                    <span class="sort-indicator" v-if="taskSortKey === 'priority'">{{
                      taskSortDir === 'asc' ? '▲' : '▼'
                    }}</span>
                  </th>
                  <th style="width: 120px">Task Details</th>
                  <th style="width: 90px">Location</th>
                  <!-- NEW: Impacts column -->
                  <th style="width: 200px">Impacts</th>
                  <th style="width: 120px">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in paginatedTasksList" :key="task.id">
                  <td class="text-muted small">{{ task.id }}</td>
                  <td>
                    <span class="d-block fw-semibold">{{ task.title }}</span>
                  </td>
                  <td>{{ task.points ?? 0 }} pts</td>
                  <td>
                    <span class="badge bg-light text-dark border text-capitalize">{{
                      task.type || '-'
                    }}</span>
                  </td>
                  <td>
                    <span
                      :class="{
                        'badge bg-success-subtle text-success text-capitalize':
                          task.priority === 'Low',
                        'badge bg-warning-subtle text-warning-emphasis text-capitalize':
                          task.priority === 'Medium',
                        'badge bg-danger-subtle text-danger text-capitalize':
                          task.priority === 'High',
                      }"
                      >{{ task.priority || '-' }}</span
                    >
                  </td>
                  <td>
                    <span
                      v-if="task.type === 'Timer' && task.duracao_temporizador"
                      class="text-muted small"
                      >⏱ {{ task.duracao_temporizador }}s</span
                    >
                    <span
                      v-else-if="task.type === 'Count' && task.quantidade_necessaria"
                      class="text-muted small"
                      >🔢 {{ task.quantidade_necessaria }}x</span
                    >
                    <span v-else-if="task.type === 'Check'" class="text-muted small">✔ Check</span>
                    <span v-else class="text-muted small">-</span>
                  </td>
                  <td>
                    <span
                      v-if="task.location"
                      :class="{
                        'badge bg-info-subtle text-info border': task.location === 'Inside',
                        'badge bg-secondary-subtle text-secondary border':
                          task.location === 'Outside',
                      }"
                      >{{ task.location }}</span
                    >
                    <span v-else class="text-muted small">-</span>
                  </td>
                  <!-- Impacts cell: shows badges for each impact type -->
                  <td>
                    <template v-if="impactsByTask[task.id] && impactsByTask[task.id].length">
                      <span
                        v-for="imp in impactsByTask[task.id]"
                        :key="imp.id_impacto"
                        class="badge me-1 mb-1 impact-badge"
                        :class="impactBadgeClass(imp.tipo_impacto)"
                        :title="`${imp.valor_por_unidade} ${imp.unidade}`"
                      >
                        {{ impactIcon(imp.tipo_impacto) }} {{ imp.tipo_impacto }}
                      </span>
                    </template>
                    <span v-else class="text-muted small">-</span>
                  </td>
                  <td>
                    <button
                      class="action-icon action-edit me-2"
                      @click="openEditTaskModal(task)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil" aria-hidden="true"></i>
                    </button>
                    <button
                      class="action-icon action-delete"
                      @click="handleDeleteTask(task.id, task.title)"
                      title="Delete"
                    >
                      <i><FontAwesomeIcon icon="trash" class="bi bi-trash" /></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="paginatedTasksList.length === 0">
                  <td colspan="9" class="text-center py-4 text-muted">
                    No tasks registered in the system.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center footer-clean">
            <div class="page-label">Page {{ taskPageLabel }}</div>
            <nav aria-label="Task Pagination">
              <ul class="pagination pagination-sm mb-0 d-flex gap-2">
                <li>
                  <button class="page-btn" :disabled="taskCurrentPage === 1" @click="prevTaskPage">
                    Previous
                  </button>
                </li>
                <li>
                  <button
                    class="page-btn"
                    :disabled="taskCurrentPage === taskTotalPages"
                    @click="nextTaskPage"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </section>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!--  USER EDIT MODAL                                               -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div v-if="modalVisible" class="custom-modal-backdrop">
    <div class="modal-panel">
      <h5 class="mb-3">Edit user</h5>
      <div class="mb-2">
        <label class="form-label">Name</label>
        <input v-model="editingUser.name" class="form-control" />
      </div>
      <div class="mb-2">
        <label class="form-label">Email</label>
        <input v-model="editingUser.email" class="form-control" />
      </div>
      <div class="row">
        <div class="col">
          <label class="form-label">Points</label>
          <input type="number" v-model.number="editingUser.points" class="form-control" />
        </div>
        <div class="col">
          <label class="form-label">Priority</label>
          <select v-model="editingUser.priority" class="form-select">
            <option value="Client">Client</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      </div>
      <div class="d-flex justify-content-end gap-2 mt-3">
        <button class="btn btn-outline-secondary" @click="cancelEdit">Cancel</button>
        <button class="btn btn-success" @click="confirmEdit">Save</button>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!--  DECORATION MODAL                                              -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div v-if="decorationModalVisible" class="custom-modal-backdrop">
    <div class="modal-panel">
      <h5 class="mb-3">{{ isNewDecoration ? 'Add Decoration' : 'Edit Decoration' }}</h5>
      <div class="mb-3">
        <label class="form-label">Name</label>
        <input v-model="editingDecoration.name" class="form-control" placeholder="e.g., rainbow" />
      </div>
      <div class="mb-3">
        <label class="form-label">Required Level</label>
        <input
          type="number"
          v-model.number="editingDecoration.requiredLevel"
          class="form-control"
          min="0"
          step="5"
          placeholder="0"
        />
        <small class="text-muted">Users need this level to equip the decoration.</small>
      </div>
      <div class="mb-3">
        <label class="form-label">Choose Image File</label>
        <input
          type="file"
          ref="decorationFileInput"
          accept="image/*"
          class="form-control"
          @change="handleDecorationFileUpload"
        />
        <small class="text-muted mt-1 d-block" v-if="!selectedFile && editingDecoration.src"
          >Current URL: {{ editingDecoration.src }}</small
        >
        <small class="text-muted mt-1 d-block" v-else-if="selectedFile"
          >Selected: {{ selectedFile.name }}</small
        >
      </div>
      <div v-if="imagePreviewUrl" class="mb-3 text-center">
        <label class="form-label d-block">Preview</label>
        <img
          :src="imagePreviewUrl"
          :alt="editingDecoration.name"
          style="max-width: 120px; max-height: 120px; object-fit: contain"
        />
      </div>
      <div class="d-flex justify-content-end gap-2 mt-3">
        <button class="btn btn-outline-secondary" @click="cancelDecorationEdit">Cancel</button>
        <button class="btn btn-success" @click="saveDecoration">
          {{ isNewDecoration ? 'Add' : 'Save' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!--  HABIT MODAL                                                    -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div v-if="habitModalVisible" class="custom-modal-backdrop">
    <div class="modal-panel" style="max-width: 500px; width: 100%">
      <h5 class="mb-3 fw-bold" style="color: #355d4c">
        {{ isNewHabit ? 'Create New Habit' : 'Edit Habit Settings' }}
      </h5>
      <div class="mb-3">
        <label class="form-label">Habit Title</label>
        <input
          v-model="editingHabit.title"
          class="form-control"
          placeholder="e.g., Exercise, Read books..."
        />
      </div>
      <div class="row mb-3">
        <div class="col">
          <label class="form-label">Category</label>
          <input
            v-model="editingHabit.category"
            class="form-control"
            placeholder="e.g., Health, Mind"
          />
        </div>
        <div class="col">
          <label class="form-label">Description</label>
          <input
            v-model="editingHabit.description"
            class="form-control"
            placeholder="Optional details..."
          />
        </div>
      </div>
      <div class="d-flex justify-content-end gap-2 mt-4">
        <button class="btn btn-outline-secondary" @click="habitModalVisible = false">Cancel</button>
        <button
          class="btn btn-success"
          @click="saveHabit"
          style="background-color: #355d4c; border-color: #355d4c"
        >
          {{ isNewHabit ? 'Create Habit' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!--  TASK MODAL                                                     -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div v-if="taskModalVisible" class="custom-modal-backdrop">
    <div class="modal-panel" style="max-width: 600px; width: 100%">
      <h5 class="mb-3 fw-bold" style="color: #355d4c">
        {{ isNewTask ? 'Create New Task' : 'Edit Task Settings' }}
      </h5>

      <div class="mb-3">
        <label class="form-label">Task Title <span class="text-danger">*</span></label>
        <input
          v-model="editingTask.title"
          class="form-control"
          placeholder="e.g., Morning Run..."
        />
      </div>

      <div class="row mb-3">
        <div class="col">
          <!-- AUTO-POINTS: selecting priority fills in the default points value -->
          <label class="form-label">Priority <span class="text-danger">*</span></label>
          <select v-model="editingTask.priority" class="form-select" @change="applyDefaultPoints">
            <option value="">-- Select --</option>
            <option value="Low">Low (5 pts)</option>
            <option value="Medium">Medium (10 pts)</option>
            <option value="High">High (15 pts)</option>
          </select>
        </div>
        <div class="col">
          <label class="form-label"
            >Task Points <small class="text-muted">(auto-set by priority)</small></label
          >
          <input type="number" v-model.number="editingTask.points" class="form-control" min="0" />
        </div>
      </div>

      <div class="row mb-3">
        <div class="col">
          <label class="form-label">Task Details <span class="text-danger">*</span></label>
          <select v-model="editingTask.tipo_tarefa" class="form-select">
            <option value="">-- Select --</option>
            <option value="Check">Check</option>
            <option value="Timer">Timer</option>
            <option value="Count">Count</option>
          </select>
        </div>
        <div class="col">
          <label class="form-label">Location <span class="text-danger">*</span></label>
          <select v-model="editingTask.localizacao_tarefa" class="form-select">
            <option value="">-- Select --</option>
            <option value="Inside">Inside</option>
            <option value="Outside">Outside</option>
          </select>
        </div>
      </div>

      <div class="mb-3" v-if="editingTask.tipo_tarefa === 'Timer'">
        <label class="form-label"
          >Timer Duration (seconds) <span class="text-danger">*</span></label
        >
        <input
          type="number"
          v-model.number="editingTask.duracao_temporizador"
          class="form-control"
          min="1"
          placeholder="e.g., 300"
        />
      </div>

      <div class="mb-3" v-if="editingTask.tipo_tarefa === 'Count'">
        <label class="form-label">Required Count <span class="text-danger">*</span></label>
        <input
          type="number"
          v-model.number="editingTask.quantidade_necessaria"
          class="form-control"
          min="1"
          placeholder="e.g., 10"
        />
      </div>

      <div class="mb-3">
        <label class="form-label"
          >Assign to Habit <span class="text-muted small">(optional)</span></label
        >
        <select v-model="editingTask.id_habito" class="form-select">
          <option :value="null">-- None --</option>
          <option
            v-for="habit in habitStore.habits"
            :key="habit.id_habito"
            :value="habit.id_habito"
          >
            {{ habit.nome_habito || habit.title }}
          </option>
        </select>
      </div>

      <!-- ── IMPACTS SECTION (only shown when editing an existing task) ── -->
      <div v-if="!isNewTask" class="mb-3">
        <hr class="my-3" />
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label mb-0 fw-semibold">Impacts</label>
          <button
            class="btn btn-sm btn-outline-success"
            style="font-size: 0.75rem"
            @click="showAddImpact = !showAddImpact"
          >
            <i class="bi bi-plus-lg me-1"></i>{{ showAddImpact ? 'Cancel' : 'Add Impact' }}
          </button>
        </div>

        <!-- Add impact inline form -->
        <div
          v-if="showAddImpact"
          class="impact-form p-3 rounded mb-3"
          style="background: #f8fffe; border: 1px solid #d4edda"
        >
          <div class="row g-2 mb-2">
            <div class="col">
              <label class="form-label form-label-sm"
                >Type <span class="text-danger">*</span></label
              >
              <select v-model="newImpact.tipo_impacto" class="form-select form-select-sm">
                <option value="">-- Select --</option>
                <option value="Water">💧 Water</option>
                <option value="Energy">⚡ Energy</option>
                <option value="Residuals">♻️ Residuals</option>
                <option value="Mobility">🚗 Mobility</option>
                <option value="Emissions">🌫️ Emissions</option>
              </select>
            </div>
            <div class="col">
              <label class="form-label form-label-sm"
                >Value <span class="text-danger">*</span></label
              >
              <input
                type="number"
                v-model.number="newImpact.valor_por_unidade"
                class="form-control form-control-sm"
                min="0.01"
                step="0.01"
                placeholder="e.g., 2.5"
              />
            </div>
            <div class="col">
              <label class="form-label form-label-sm"
                >Unit <span class="text-danger">*</span></label
              >
              <select v-model="newImpact.unidade" class="form-select form-select-sm">
                <option value="">-- Select --</option>
                <option value="Litters">Litters</option>
                <option value="kWh">kWh</option>
                <option value="kg">kg</option>
                <option value="km">km</option>
                <option value="kg CO2e">kg CO2e</option>
              </select>
            </div>
          </div>
          <button
            class="btn btn-sm btn-success w-100"
            @click="addImpactToTask"
            :disabled="impactSaving"
            style="background-color: #355d4c; border-color: #355d4c"
          >
            {{ impactSaving ? 'Saving...' : 'Save Impact' }}
          </button>
        </div>

        <!-- Current impacts list -->
        <div v-if="taskImpactsEditing.length">
          <div
            v-for="imp in taskImpactsEditing"
            :key="imp.id_impacto"
            class="d-flex justify-content-between align-items-center py-1 px-2 rounded mb-1"
            style="background: #f8f9fa; border: 1px solid #e9ecef"
          >
            <span>
              <span class="badge me-2 impact-badge" :class="impactBadgeClass(imp.tipo_impacto)"
                >{{ impactIcon(imp.tipo_impacto) }} {{ imp.tipo_impacto }}</span
              >
              <span class="text-muted small">{{ imp.valor_por_unidade }} {{ imp.unidade }}</span>
            </span>
            <button
              class="btn btn-sm btn-link text-danger p-0"
              @click="removeImpactFromTask(imp.id_impacto)"
              title="Delete impact"
            >
              <i><FontAwesomeIcon icon="trash" /></i>
            </button>
          </div>
        </div>
        <div v-else class="text-muted small fst-italic">No impacts assigned to this task yet.</div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-4">
        <button class="btn btn-outline-secondary" @click="closeTaskModal">Cancel</button>
        <button
          class="btn btn-success"
          @click="saveTask"
          style="background-color: #355d4c; border-color: #355d4c"
        >
          {{ isNewTask ? 'Create Task' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!--  TOAST                                                          -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <Transition name="toast-slide">
    <div v-if="toast.visible" class="toast-notification">
      <div
        class="toast-icon"
        :style="{
          color: toast.title.includes('deleted') || toast.title === 'Error' ? '#b4554d' : '#00cc66',
        }"
      >
        {{ toast.title.includes('deleted') || toast.title === 'Error' ? '🗑️' : '✅' }}
      </div>
      <div class="toast-content">
        <strong>{{ toast.title }}</strong>
        <small>{{ toast.message }}</small>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavBar from '../Components/NavBar.vue'
import { useUserStore } from '@/stores/userStore'
import { useHabitStore } from '@/stores/habitStore'
import { updateUser as apiUpdateUser } from '../api/services/users.services.js'
import {
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
} from '../api/services/habits.services.js'
import {
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '../api/services/tasks.services.js'
import {
  getAllImpacts,
  createImpact as apiCreateImpact,
  deleteImpact as apiDeleteImpact,
} from '../api/services/impacts.services.js'
import {
  getAllDecorations,
  createDecoration,
  updateDecoration,
  deleteDecoration,
} from '../api/services/decorations.services.js'

const userStore = useUserStore()
const habitStore = useHabitStore()

const search = ref('')
const decorationSearch = ref('')
const habitSearch = ref('')
const taskSearch = ref('')

const perPage = ref(5)
let debounceTimer = null
let decorationDebounceTimer = null
let habitDebounceTimer = null
let taskDebounceTimer = null

// ═══════════════════════════════════════════════════════════════════════
//  IMPACTS — global lookup map { taskId → [impacts] }
// ═══════════════════════════════════════════════════════════════════════
// Fetched once on mount via GET /impacts (returns all), then grouped.
const allImpacts = ref([])

const impactsByTask = computed(() => {
  const map = {}
  for (const imp of allImpacts.value) {
    const tid = imp.id_tarefa
    if (!map[tid]) map[tid] = []
    map[tid].push(imp)
  }
  return map
})

async function syncImpacts() {
  try {
    const raw = await getAllImpacts(userStore.token)
    allImpacts.value = Array.isArray(raw) ? raw : raw?.data || []
  } catch (err) {
    console.error('Failed to load impacts:', err)
  }
}

function impactBadgeClass(tipo) {
  return {
    'bg-primary-subtle text-primary': tipo === 'Water',
    'bg-warning-subtle text-warning-emphasis': tipo === 'Energy',
    'bg-success-subtle text-success': tipo === 'Residuals',
    'bg-info-subtle text-info': tipo === 'Mobility',
    'bg-secondary-subtle text-secondary': tipo === 'Emissions',
  }
}

function impactIcon(tipo) {
  const icons = { Water: '💧', Energy: '⚡', Residuals: '♻️', Mobility: '🚗', Emissions: '🌫️' }
  return icons[tipo] || '•'
}

// ═══════════════════════════════════════════════════════════════════════
//  USERS ENGINE
// ═══════════════════════════════════════════════════════════════════════
const sortKey = ref('id')
const sortDir = ref('asc')
const backendFieldMap = {
  id: 'id_utilizador',
  name: 'nome',
  points: 'pontos',
  priority: 'tipo_utilizador',
  email: 'email',
  createdAt: 'data_criacao_conta',
}

async function syncUsers() {
  try {
    await userStore.fetchUsers({
      page: userStore.usersMeta.page,
      limit: perPage.value,
      sort: backendFieldMap[sortKey.value] || 'id_utilizador',
      order: sortDir.value.toUpperCase(),
      q: search.value.trim() || undefined,
    })
  } catch (err) {
    console.error('Failed to sync users:', err)
  }
}

function handleSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    userStore.usersMeta.page = 1
    syncUsers()
  }, 300)
}

const currentPage = computed(() => userStore.usersMeta.page)
const totalPages = computed(() => userStore.usersMeta.pages || 1)
const pageLabel = computed(
  () =>
    `${String(currentPage.value).padStart(2, '0')} of ${String(totalPages.value).padStart(2, '0')}`,
)

const pagedUsers = computed(() =>
  (userStore.users || []).map((u) => ({
    id: u.id_utilizador,
    name: u.nome,
    points: u.pontos,
    priority: u.tipo_utilizador || 'Client',
    email: u.email,
    createdAt: u.data_criacao_conta,
  })),
)

function prevPage() {
  if (currentPage.value > 1) {
    userStore.usersMeta.page--
    syncUsers()
  }
}
function nextPage() {
  if (currentPage.value < totalPages.value) {
    userStore.usersMeta.page++
    syncUsers()
  }
}
function toggleSort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
  userStore.usersMeta.page = 1
  syncUsers()
}

const modalVisible = ref(false)
const editingUser = ref(null)

function openEditModal(user) {
  editingUser.value = { ...user }
  modalVisible.value = true
}
function cancelEdit() {
  modalVisible.value = false
  editingUser.value = null
  showToast('Operation cancelled', 'User edit was cancelled')
}

async function confirmEdit() {
  if (!editingUser.value) return
  const userId = editingUser.value.id
  if (!userId) return
  try {
    const payload = {
      nome: editingUser.value.name,
      email: editingUser.value.email,
      pontos: editingUser.value.points,
      tipo_utilizador: editingUser.value.priority,
    }
    await apiUpdateUser(userId, payload, userStore.token)
    const idx = userStore.users.findIndex((u) => String(u.id_utilizador) === String(userId))
    if (idx !== -1) {
      userStore.users[idx] = {
        ...userStore.users[idx],
        nome: payload.nome,
        email: payload.email,
        pontos: payload.pontos,
        tipo_utilizador: payload.tipo_utilizador,
      }
      if (userStore.saveToLocalStorage) userStore.saveToLocalStorage()
    }
    await syncUsers()
    showToast('User modified', `${payload.nome} was modified successfully`)
  } catch (e) {
    console.error(e)
    showToast('Error', e.message || 'Could not update user record on database')
  } finally {
    modalVisible.value = false
    editingUser.value = null
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user?')) return
  const target = userStore.users.find((u) => Number(u.id_utilizador) === Number(id))
  const label = target ? `${target.nome || '-'} · ${target.email || '-'}` : String(id)
  try {
    await userStore.deleteUser(id)
    if (userStore.users.length === 0 && currentPage.value > 1) userStore.usersMeta.page--
    showToast('User deleted', label)
    syncUsers()
  } catch (e) {
    console.error(e)
    showToast('Error', e.message || 'Could not delete user')
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  DECORATIONS ENGINE
// ═══════════════════════════════════════════════════════════════════════
const decorationsList = ref([])
const decorationTotal = ref(0)
const decorationCurrentPage = ref(1)
const decorationLimit = ref(10)
const decorationTotalPages = ref(1)
const decorationSortKey = ref('id_decoracao')
const decorationSortDir = ref('asc')
const decorationModalVisible = ref(false)
const editingDecoration = ref(null)
const isNewDecoration = ref(false)
const decorationFileInput = ref(null)
const selectedFile = ref(null)
const imagePreviewUrl = ref('')

async function syncDecorations() {
  try {
    const response = await getAllDecorations(userStore.token || null, {
      page: decorationCurrentPage.value,
      limit: decorationLimit.value,
      sort: decorationSortKey.value || 'id_decoracao',
      order: decorationSortDir.value.toUpperCase(),
      q: (decorationSearch.value || '').trim() || undefined,
    })
    if (response && response.data) {
      decorationsList.value = response.data
      decorationTotal.value = response.meta.total
      decorationTotalPages.value = response.meta.pages
    }
  } catch (err) {
    console.error('Failed to sync decorations:', err)
    showToast('Error', err.message || 'Could not load decorations')
  }
}

function handleDecorationSearch() {
  clearTimeout(decorationDebounceTimer)
  decorationDebounceTimer = setTimeout(() => {
    decorationCurrentPage.value = 1
    syncDecorations()
  }, 300)
}

const pagedDecorations = computed(() => {
  const query = (decorationSearch.value || '').trim().toLowerCase()
  let list = (decorationsList.value || []).map((d) => ({
    id: d.id_decoracao || d.id,
    name: d.nome_decoracao || d.name || '',
    requiredLevel: d.nivel_necessario !== undefined ? d.nivel_necessario : (d.requiredLevel ?? 0),
    src: d.caminho_decoracao || d.src || '',
  }))
  if (query) list = list.filter((d) => d.name.toLowerCase().includes(query))
  return list
})

const decorationPageLabel = computed(
  () =>
    `${String(decorationCurrentPage.value).padStart(2, '0')} of ${String(decorationTotalPages.value).padStart(2, '0')}`,
)

function prevDecorationPage() {
  if (decorationCurrentPage.value > 1) {
    decorationCurrentPage.value--
    syncDecorations()
  }
}
function nextDecorationPage() {
  if (decorationCurrentPage.value < decorationTotalPages.value) {
    decorationCurrentPage.value++
    syncDecorations()
  }
}
function toggleDecorationSort(key) {
  const schemaMap = {
    id: 'id_decoracao',
    name: 'nome_decoracao',
    requiredLevel: 'nivel_necessario',
  }
  const targetField = schemaMap[key] || 'id_decoracao'
  if (decorationSortKey.value === targetField)
    decorationSortDir.value = decorationSortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    decorationSortKey.value = targetField
    decorationSortDir.value = 'asc'
  }
  decorationCurrentPage.value = 1
  syncDecorations()
}

function openAddDecorationModal() {
  editingDecoration.value = { id: null, name: '', src: '', requiredLevel: 0 }
  selectedFile.value = null
  imagePreviewUrl.value = ''
  isNewDecoration.value = true
  decorationModalVisible.value = true
}
function editDecoration(decoration) {
  editingDecoration.value = {
    ...decoration,
    id_decoracao: decoration.id,
    nome_decoracao: decoration.name,
    nivel_necessario: decoration.requiredLevel,
    caminho_decoracao: decoration.src,
  }
  selectedFile.value = null
  imagePreviewUrl.value = decoration.src
  isNewDecoration.value = false
  decorationModalVisible.value = true
}
function cancelDecorationEdit() {
  decorationModalVisible.value = false
  editingDecoration.value = null
  selectedFile.value = null
  imagePreviewUrl.value = ''
  if (decorationFileInput.value) decorationFileInput.value.value = ''
}
function handleDecorationFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    showToast('Invalid file', 'Please select an image file')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('File too large', 'Max 5MB')
    return
  }
  selectedFile.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
}
async function saveDecoration() {
  if (!editingDecoration.value.name) {
    showToast('Error', 'Decoration name is mandatory.')
    return
  }
  if (isNewDecoration.value && !selectedFile.value) {
    showToast('Error', 'Image file is mandatory.')
    return
  }
  try {
    const formData = new FormData()
    formData.append('nome_decoracao', editingDecoration.value.name)
    formData.append('nivel_necessario', String(editingDecoration.value.requiredLevel ?? 0))
    if (selectedFile.value) formData.append('caminho_decoracao', selectedFile.value)
    else formData.append('caminho_decoracao', editingDecoration.value.src || '')
    if (isNewDecoration.value) {
      await createDecoration(formData, userStore.token || null)
      showToast('Decoration added', `"${editingDecoration.value.name}" was created successfully.`)
    } else {
      await updateDecoration(editingDecoration.value.id, formData, userStore.token || null)
      showToast('Decoration updated', `"${editingDecoration.value.name}" was updated successfully.`)
    }
    syncDecorations()
    decorationModalVisible.value = false
    editingDecoration.value = null
    selectedFile.value = null
    imagePreviewUrl.value = ''
  } catch (err) {
    showToast('Error', err.errors?.nome_decoracao?.[0] || err.message || 'Validation failed.')
  }
}
async function deleteDecorationHandler(id, name) {
  if (!confirm(`Are you sure you want to delete the "${name}" decoration?`)) return
  try {
    await deleteDecoration(id, userStore.token || null)
    showToast('Decoration deleted', `"${name}" was successfully removed.`)
    if (decorationsList.value.length === 1 && decorationCurrentPage.value > 1)
      decorationCurrentPage.value--
    syncDecorations()
  } catch (err) {
    showToast('Error', err.message || 'Could not delete decoration.')
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  HABITS ENGINE
// ═══════════════════════════════════════════════════════════════════════
const habitSortKey = ref('id')
const habitSortDir = ref('asc')
const habitCurrentPage = ref(1)
const habitLimit = ref(5)
const habitModalVisible = ref(false)
const isNewHabit = ref(true)
const editingHabit = ref({ id: null, title: '', description: '', category: '' })

function toggleHabitSort(key) {
  if (habitSortKey.value === key) habitSortDir.value = habitSortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    habitSortKey.value = key
    habitSortDir.value = 'asc'
  }
}

const filteredHabits = computed(() => {
  const q = (habitSearch.value || '').trim().toLowerCase()
  let list = (habitStore.habits || []).map((h) => ({
    id: h.id_habito ?? h.id,
    title: h.nome_habito ?? h.titulo ?? h.name ?? h.title ?? '',
    description: h.descricao_habito ?? h.descricao ?? h.description ?? '',
    category: h.categoria ?? h.category ?? '',
  }))
  if (q)
    list = list.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q),
    )
  const key = habitSortKey.value
  const dir = habitSortDir.value === 'asc' ? 1 : -1
  list.sort((a, b) => {
    if (key === 'id') return (Number(a.id || 0) - Number(b.id || 0)) * dir
    return (
      String(a[key] || '')
        .toLowerCase()
        .localeCompare(String(b[key] || '').toLowerCase()) * dir
    )
  })
  return list
})

const totalHabitCount = computed(() => filteredHabits.value.length)
const habitTotalPages = computed(() => Math.ceil(totalHabitCount.value / habitLimit.value) || 1)
const paginatedHabitsList = computed(() => {
  const start = (habitCurrentPage.value - 1) * habitLimit.value
  return filteredHabits.value.slice(start, start + habitLimit.value)
})
const habitPageLabel = computed(
  () =>
    `${String(habitCurrentPage.value).padStart(2, '0')} of ${String(habitTotalPages.value).padStart(2, '0')}`,
)

function prevHabitPage() {
  if (habitCurrentPage.value > 1) habitCurrentPage.value--
}
function nextHabitPage() {
  if (habitCurrentPage.value < habitTotalPages.value) habitCurrentPage.value++
}
function handleHabitSearch() {
  clearTimeout(habitDebounceTimer)
  habitDebounceTimer = setTimeout(() => {
    habitCurrentPage.value = 1
  }, 300)
}
function openAddHabitModal() {
  editingHabit.value = { id: null, title: '', description: '', category: '' }
  isNewHabit.value = true
  habitModalVisible.value = true
}
function openEditHabitModal(habit) {
  editingHabit.value = { ...habit }
  isNewHabit.value = false
  habitModalVisible.value = true
}

async function saveHabit() {
  if (!editingHabit.value.title?.trim()) {
    showToast('Error', 'Title is required')
    return
  }
  try {
    const token = userStore.token
    const payload = {
      nome_habito: editingHabit.value.title.trim(),
      descricao_habito: editingHabit.value.description || '',
      categoria: editingHabit.value.category || '',
    }
    if (isNewHabit.value) {
      const created = await apiCreateHabit(payload, token)
      habitStore.habits.push(created)
      showToast('Habit added', `"${payload.nome_habito}" was created successfully`)
    } else {
      await apiUpdateHabit(editingHabit.value.id, payload, token)
      const idx = habitStore.habits.findIndex(
        (h) => (h.id_habito ?? h.id) === editingHabit.value.id,
      )
      if (idx !== -1) habitStore.habits[idx] = { ...habitStore.habits[idx], ...payload }
      showToast('Habit updated', `"${payload.nome_habito}" was updated`)
    }
  } catch (error) {
    const msg = error?.errors
      ? Object.values(error.errors).flat().join(', ')
      : error?.message || 'An error occurred while saving the habit'
    showToast('Error', msg)
  } finally {
    habitModalVisible.value = false
  }
}

async function handleDeleteHabit(id, title) {
  if (!confirm(`Are you sure you want to delete the habit "${title}"?`)) return
  try {
    await apiDeleteHabit(id, userStore.token)
    const idx = habitStore.habits.findIndex((h) => (h.id_habito ?? h.id) === id)
    if (idx !== -1) habitStore.habits.splice(idx, 1)
    showToast('Habit deleted', `"${title}" was removed`)
    if (paginatedHabitsList.value.length === 0 && habitCurrentPage.value > 1)
      habitCurrentPage.value--
  } catch (error) {
    showToast('Error', error?.message || 'Failed to delete habit')
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  TASKS ENGINE
// ═══════════════════════════════════════════════════════════════════════

// Priority → default points map
const PRIORITY_POINTS = { Low: 5, Medium: 10, High: 15 }

const taskSortKey = ref('id')
const taskSortDir = ref('asc')
const taskCurrentPage = ref(1)
const taskLimit = ref(5)
const taskModalVisible = ref(false)
const isNewTask = ref(true)

const editingTask = ref({
  id: null,
  title: '',
  points: 0,
  priority: '',
  tipo_tarefa: '',
  localizacao_tarefa: '',
  duracao_temporizador: null,
  quantidade_necessaria: null,
  id_habito: null,
})

// Impacts within the task edit modal
const taskImpactsEditing = ref([]) // impacts for the task currently being edited
const showAddImpact = ref(false)
const impactSaving = ref(false)
const newImpact = ref({ tipo_impacto: '', valor_por_unidade: null, unidade: '' })

// Called when the Priority dropdown changes — sets default points but
// allows the admin to manually override the value afterwards.
function applyDefaultPoints() {
  const p = editingTask.value.priority
  if (p && PRIORITY_POINTS[p] !== undefined) {
    editingTask.value.points = PRIORITY_POINTS[p]
  }
}

function toggleTaskSort(key) {
  if (taskSortKey.value === key) taskSortDir.value = taskSortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    taskSortKey.value = key
    taskSortDir.value = 'asc'
  }
}

const filteredTasks = computed(() => {
  const q = (taskSearch.value || '').trim().toLowerCase()
  let list = (habitStore.tasks || []).map((t) => ({
    id: t.id_tarefa ?? t.id,
    title: t.nome_tarefa ?? t.title ?? 'Untitled Task',
    points: t.pontos_tarefa ?? t.points ?? 0,
    type: t.tipo_tarefa ?? t.type ?? '',
    priority: t.prioridade_tarefa ?? t.priority ?? '',
    location: t.localizacao_tarefa ?? t.location ?? '',
    duracao_temporizador: t.duracao_temporizador ?? null,
    quantidade_necessaria: t.quantidade_necessaria ?? null,
    id_habito: t.id_habito ?? null,
  }))
  if (q) list = list.filter((t) => t.title.toLowerCase().includes(q))
  const key = taskSortKey.value
  const dir = taskSortDir.value === 'asc' ? 1 : -1
  list.sort((a, b) => {
    if (key === 'id' || key === 'points') return (Number(a[key] || 0) - Number(b[key] || 0)) * dir
    return (
      String(a[key] || '')
        .toLowerCase()
        .localeCompare(String(b[key] || '').toLowerCase()) * dir
    )
  })
  return list
})

const totalTaskCount = computed(() => filteredTasks.value.length)
const taskTotalPages = computed(() => Math.ceil(totalTaskCount.value / taskLimit.value) || 1)
const paginatedTasksList = computed(() => {
  const start = (taskCurrentPage.value - 1) * taskLimit.value
  return filteredTasks.value.slice(start, start + taskLimit.value)
})
const taskPageLabel = computed(
  () =>
    `${String(taskCurrentPage.value).padStart(2, '0')} of ${String(taskTotalPages.value).padStart(2, '0')}`,
)

function prevTaskPage() {
  if (taskCurrentPage.value > 1) taskCurrentPage.value--
}
function nextTaskPage() {
  if (taskCurrentPage.value < taskTotalPages.value) taskCurrentPage.value++
}
function handleTaskSearch() {
  clearTimeout(taskDebounceTimer)
  taskDebounceTimer = setTimeout(() => {
    taskCurrentPage.value = 1
  }, 300)
}

function openAddTaskModal() {
  editingTask.value = {
    id: null,
    title: '',
    points: 0,
    priority: '',
    tipo_tarefa: '',
    localizacao_tarefa: '',
    duracao_temporizador: null,
    quantidade_necessaria: null,
    id_habito: null,
  }
  taskImpactsEditing.value = []
  showAddImpact.value = false
  newImpact.value = { tipo_impacto: '', valor_por_unidade: null, unidade: '' }
  isNewTask.value = true
  taskModalVisible.value = true
}

function openEditTaskModal(task) {
  editingTask.value = {
    id: task.id,
    title: task.title,
    points: task.points,
    priority: task.priority,
    tipo_tarefa: task.type,
    localizacao_tarefa: task.location,
    duracao_temporizador: task.duracao_temporizador,
    quantidade_necessaria: task.quantidade_necessaria,
    id_habito: task.id_habito,
  }
  // Load the impacts for this specific task into the modal editing list
  taskImpactsEditing.value = [...(impactsByTask.value[task.id] || [])]
  showAddImpact.value = false
  newImpact.value = { tipo_impacto: '', valor_por_unidade: null, unidade: '' }
  isNewTask.value = false
  taskModalVisible.value = true
}

function closeTaskModal() {
  taskModalVisible.value = false
  showAddImpact.value = false
  newImpact.value = { tipo_impacto: '', valor_por_unidade: null, unidade: '' }
}

async function saveTask() {
  if (!editingTask.value.title?.trim()) {
    showToast('Error', 'Title is mandatory')
    return
  }
  if (!editingTask.value.tipo_tarefa) {
    showToast('Error', 'Task Details (type) is required')
    return
  }
  if (!editingTask.value.localizacao_tarefa) {
    showToast('Error', 'Location is required')
    return
  }
  if (editingTask.value.tipo_tarefa === 'Timer' && !(editingTask.value.duracao_temporizador > 0)) {
    showToast('Error', 'Timer duration must be a positive number')
    return
  }
  if (editingTask.value.tipo_tarefa === 'Count' && !(editingTask.value.quantidade_necessaria > 0)) {
    showToast('Error', 'Required count must be a positive number')
    return
  }

  const payload = {
    nome_tarefa: editingTask.value.title.trim(),
    pontos_tarefa: editingTask.value.points ?? 0,
    prioridade_tarefa: editingTask.value.priority,
    tipo_tarefa: editingTask.value.tipo_tarefa,
    localizacao_tarefa: editingTask.value.localizacao_tarefa,
    duracao_temporizador:
      editingTask.value.tipo_tarefa === 'Timer' ? editingTask.value.duracao_temporizador : null,
    quantidade_necessaria:
      editingTask.value.tipo_tarefa === 'Count' ? editingTask.value.quantidade_necessaria : null,
    id_habito: editingTask.value.id_habito || null,
  }

  try {
    const token = userStore.token
    if (isNewTask.value) {
      const created = await apiCreateTask(payload, token)
      habitStore.tasks.push(created)
      showToast('Task added', `"${payload.nome_tarefa}" was created`)
    } else {
      await apiUpdateTask(editingTask.value.id, payload, token)
      const idx = habitStore.tasks.findIndex((t) => (t.id_tarefa ?? t.id) === editingTask.value.id)
      if (idx !== -1) habitStore.tasks[idx] = { ...habitStore.tasks[idx], ...payload }
      showToast('Task updated', `"${payload.nome_tarefa}" was updated`)
    }
  } catch (error) {
    const msg = error?.errors
      ? Object.values(error.errors).flat().join(', ')
      : error?.message || 'An error occurred while saving the task'
    showToast('Error', msg)
    return // keep modal open on error
  }
  closeTaskModal()
}

async function handleDeleteTask(id, title) {
  if (!confirm(`Are you sure you want to delete the task "${title}"?`)) return
  try {
    await apiDeleteTask(id, userStore.token)
    const idx = habitStore.tasks.findIndex((t) => (t.id_tarefa ?? t.id) === id)
    if (idx !== -1) habitStore.tasks.splice(idx, 1)
    // Also remove impacts for this task from local cache
    allImpacts.value = allImpacts.value.filter((imp) => imp.id_tarefa !== id)
    showToast('Task deleted', `"${title}" was removed`)
    if (paginatedTasksList.value.length === 0 && taskCurrentPage.value > 1) taskCurrentPage.value--
  } catch (error) {
    showToast('Error', error?.message || 'Failed to delete task')
  }
}

// ── Impact management inside the task modal ─────────────────────────
async function addImpactToTask() {
  if (!newImpact.value.tipo_impacto) {
    showToast('Error', 'Impact type is required')
    return
  }
  if (!(newImpact.value.valor_por_unidade > 0)) {
    showToast('Error', 'Value must be a positive number')
    return
  }
  if (!newImpact.value.unidade) {
    showToast('Error', 'Unit is required')
    return
  }

  impactSaving.value = true
  try {
    // POST /tasks/:taskId/impacts
    const created = await apiCreateImpact(
      {
        tipo_impacto: newImpact.value.tipo_impacto,
        valor_por_unidade: newImpact.value.valor_por_unidade,
        unidade: newImpact.value.unidade,
      },
      userStore.token,
      editingTask.value.id, // taskId passed separately; service routes to /tasks/:taskId/impacts
    )
    // Update both the global list and the modal's local list
    allImpacts.value.push(created)
    taskImpactsEditing.value.push(created)
    newImpact.value = { tipo_impacto: '', valor_por_unidade: null, unidade: '' }
    showAddImpact.value = false
    showToast('Impact added', `${created.tipo_impacto} impact was added`)
  } catch (error) {
    const msg = error?.errors
      ? Object.values(error.errors).flat().join(', ')
      : error?.message || 'Failed to add impact'
    showToast('Error', msg)
  } finally {
    impactSaving.value = false
  }
}

async function removeImpactFromTask(impactId) {
  if (!confirm('Delete this impact?')) return
  try {
    await apiDeleteImpact(impactId, userStore.token)
    allImpacts.value = allImpacts.value.filter((i) => i.id_impacto !== impactId)
    taskImpactsEditing.value = taskImpactsEditing.value.filter((i) => i.id_impacto !== impactId)
    showToast('Impact deleted', 'Impact was removed')
  } catch (error) {
    showToast('Error', error?.message || 'Failed to delete impact')
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════════════
const toast = ref({ visible: false, title: '', message: '', timeout: null })

function showToast(title, message, duration = 3000) {
  toast.value.title = title
  toast.value.message = message
  toast.value.visible = true
  if (toast.value.timeout) clearTimeout(toast.value.timeout)
  toast.value.timeout = setTimeout(() => {
    toast.value.visible = false
  }, duration)
}

function formatDate(value) {
  if (!value) return '-'
  try {
    const d = value instanceof Date ? value : new Date(value)
    return d.toLocaleString()
  } catch {
    return value
  }
}

onMounted(async () => {
  if (userStore.loadFromLocalStorage) userStore.loadFromLocalStorage()
  syncUsers()
  syncDecorations()
  syncImpacts()
  try {
    await habitStore.fetchHabitsAndTasks()
  } catch (err) {
    console.error('Failed to initialize admin dashboard panels:', err)
  }
})
</script>

<style scoped>
.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-panel {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  max-width: 440px;
  width: 90%;
  animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 90vh;
  overflow-y: auto;
}
@keyframes modalFadeIn {
  from {
    transform: scale(0.96);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.sortable {
  cursor: pointer;
  user-select: none;
}
.sortable:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
.sort-indicator {
  font-size: 0.75rem;
  margin-left: 4px;
  color: #355d4c;
}
.decoration-preview {
  width: 38px;
  height: 38px;
  object-fit: contain;
  border-radius: 6px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}
.impact-badge {
  font-size: 0.7rem;
}
.impact-form {
  transition: all 0.15s ease;
}
</style>

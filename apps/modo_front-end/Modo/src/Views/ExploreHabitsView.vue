<template>
  <NavBar />
  <div class="containerBox">
    <div class="page-title">
      <h4>EXPLORE HABITS</h4>
    </div>

    <div class="row mt-2">
      <div class="col-12">
        <div class="card p-3 mb-0 filters-card">
          <input
            id="search_habit"
            class="search_habit"
            type="search"
            placeholder="Search habits..."
          />

          <div class="row g-2 align-items-end">
            <div class="col-md-2">
              <label style="font-size: 16px">Type</label>
              <select class="form-select">
                <option value="all">All</option>
                <option value="check">Check</option>
                <option value="count">Count</option>
                <option value="time">Time</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Priority</label>
              <select class="form-select">
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Location</label>
              <select class="form-select">
                <option value="all">All</option>
                <option value="inside">Inside</option>
                <option value="outside">Outside</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Sort By</label>
              <select class="form-select">
                <option value="priority">Priority</option>
                <option value="created_at" selected>Created At</option>
              </select>
            </div>
            <div class="col-md-2">
              <label style="font-size: 16px">Order</label>
              <select class="form-select">
                <option value="asc">Ascending</option>
                <option value="desc" selected>Descending</option>
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

    <div class="page-title">
      <h4>MODO RECOMMENDATIONS</h4>
    </div>

    <div class="row mt-4 mb-5">
      <div class="col-12">
        <div class="habits-grid">
          <div class="habit-item" id="habit-item">
            <div class="card h-100">
              <div class="card-header-custom">
                <div class="habit-title-section">
                  <div class="habit-title">
                    <font-awesome-icon icon="fa-solid fa-seedling" />
                    <h3>Gardening</h3>
                  </div>
                </div>
              </div>

              <div class="habit-content">
                <div class="habit-category-description mt-2">
                  <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas, suscipit sunt!
                    Distinctio dolore iure aspernatur explicabo tempore amet? Aperiam officia ipsam
                    qui, et iure reprehenderit quod ea fuga repudiandae labore!
                  </p>
                </div>
                <hr style="margin: 5px" />
                <button class="habit-details d-flex align-items-center gap-3">
                  <font-awesome-icon icon="fa-solid fa-list-check" />
                  <p>2 Tasks available</p>
                </button>
              </div>
            </div>
          </div>

          <div class="habit-item">
            <div class="card h-100">
              <div class="card-header-custom">
                <div class="habit-title-section">
                  <div class="habit-title">
                    <font-awesome-icon icon="fa-solid fa-bolt-lightning" />
                    <h3>Energy</h3>
                  </div>
                </div>
              </div>

              <div class="habit-content">
                <div class="habit-category-description mt-2">
                  <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas, suscipit sunt!
                    Distinctio dolore iure aspernatur explicabo tempore amet? Aperiam officia ipsam
                    qui, et iure reprehenderit quod ea fuga repudiandae labore!
                  </p>
                </div>
                <hr style="margin: 5px" />
                <button class="habit-details d-flex align-items-center gap-3">
                  <font-awesome-icon icon="fa-solid fa-list-check" />
                  <p>2 Tasks available</p>
                </button>
              </div>
            </div>
          </div>

          <div class="habit-item">
            <div class="card h-100">
              <div class="card-header-custom">
                <div class="habit-title-section">
                  <div class="habit-title">
                    <font-awesome-icon icon="fa-solid fa-person-walking" />
                    <h3>Sustainable Mobility</h3>
                  </div>
                </div>
              </div>

              <div class="habit-content">
                <div class="habit-category-description mt-2">
                  <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas, suscipit sunt!
                    Distinctio dolore iure aspernatur explicabo tempore amet? Aperiam officia ipsam
                    qui, et iure reprehenderit quod ea fuga repudiandae labore!
                  </p>
                </div>
                <hr style="margin: 5px" />
                <button class="habit-details d-flex align-items-center gap-3">
                  <font-awesome-icon icon="fa-solid fa-list-check" />
                  <p>2 Tasks available</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-title">
      <h4>ALL HABITS</h4>
    </div>

    <div class="row mt-4 mb-5">
      <div class="col-12" style="gap: 10px">
        <div class="habits-grid">
          <div class="habit-item">
            <div class="card h-100">
              <div class="card-header-custom">
                <div class="habit-title-section">
                  <div class="habit-title">
                    <font-awesome-icon icon="fa-solid fa-seedling" />
                    <h3>Gardening</h3>
                  </div>
                </div>
              </div>

              <div class="habit-content">
                <div class="habit-category-description mt-2">
                  <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas, suscipit sunt!
                    Distinctio dolore iure aspernatur explicabo tempore amet? Aperiam officia ipsam
                    qui, et iure reprehenderit quod ea fuga repudiandae labore!
                  </p>
                </div>
                <hr style="margin: 5px" />
                <button class="habit-details d-flex align-items-center gap-3">
                  <font-awesome-icon icon="fa-solid fa-list-check" />
                  <p>2 Tasks available</p>
                </button>
              </div>
            </div>
          </div>

          <div class="habit-item">
            <div class="card h-100">
              <div class="card-header-custom">
                <div class="habit-title-section">
                  <div class="habit-title">
                    <font-awesome-icon icon="fa-solid fa-bolt-lightning" />
                    <h3>Energy</h3>
                  </div>
                </div>
              </div>

              <div class="habit-content">
                <div class="habit-category-description mt-2">
                  <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas, suscipit sunt!
                    Distinctio dolore iure aspernatur explicabo tempore amet? Aperiam officia ipsam
                    qui, et iure reprehenderit quod ea fuga repudiandae labore!
                  </p>
                </div>
                <hr style="margin: 5px" />
                <button class="habit-details d-flex align-items-center gap-3">
                  <font-awesome-icon icon="fa-solid fa-list-check" />
                  <p>2 Tasks available</p>
                </button>
              </div>
            </div>
          </div>

          <div class="habit-item">
            <div class="card h-100">
              <div class="card-header-custom">
                <div class="habit-title-section">
                  <div class="habit-title">
                    <font-awesome-icon icon="fa-solid fa-person-walking" />
                    <h3>Sustainable Mobility</h3>
                  </div>
                </div>
              </div>

              <div class="habit-content">
                <div class="habit-category-description mt-2">
                  <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas, suscipit sunt!
                    Distinctio dolore iure aspernatur explicabo tempore amet? Aperiam officia ipsam
                    qui, et iure reprehenderit quod ea fuga repudiandae labore!
                  </p>
                </div>
                <hr style="margin: 5px" />
                <button class="habit-details d-flex align-items-center gap-3">
                  <font-awesome-icon icon="fa-solid fa-list-check" />
                  <p>2 Tasks available</p>
                </button>
              </div>
            </div>
          </div>

          <div class="habit-item">
            <div class="card h-100">
              <div class="card-header-custom">
                <div class="habit-title-section">
                  <div class="habit-title">
                    <font-awesome-icon icon="fa-solid fa-recycle" />
                    <h3>Recycling</h3>
                  </div>
                </div>
              </div>

              <div class="habit-content">
                <div class="habit-category-description mt-2">
                  <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas, suscipit sunt!
                    Distinctio dolore iure aspernatur explicabo tempore amet? Aperiam officia ipsam
                    qui, et iure reprehenderit quod ea fuga repudiandae labore!
                  </p>
                </div>
                <hr style="margin: 5px" />
                <button class="habit-details d-flex align-items-center gap-3">
                  <font-awesome-icon icon="fa-solid fa-list-check" />
                  <p>2 Tasks available</p>
                </button>
              </div>
            </div>
          </div>

          <div class="habit-item">
            <div class="card h-100">
              <div class="card-header-custom">
                <div class="habit-title-section">
                  <div class="habit-title">
                    <font-awesome-icon icon="fa-solid fa-water" />
                    <h3>Water</h3>
                  </div>
                </div>
              </div>

              <div class="habit-content">
                <div class="habit-category-description mt-2">
                  <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas, suscipit sunt!
                    Distinctio dolore iure aspernatur explicabo tempore amet? Aperiam officia ipsam
                    qui, et iure reprehenderit quod ea fuga repudiandae labore!
                  </p>
                </div>
                <hr style="margin: 5px" />
                <button class="habit-details d-flex align-items-center gap-3">
                  <font-awesome-icon icon="fa-solid fa-list-check" />
                  <p>2 Tasks available</p>
                </button>
              </div>
            </div>
          </div>

          <div class="habit-item">
            <div class="card h-100">
              <div class="card-header-custom">
                <div class="habit-title-section">
                  <div class="habit-title">
                    <font-awesome-icon icon="fa-solid fa-desktop" />
                    <h3>Digital Footprint</h3>
                  </div>
                </div>
              </div>

              <div class="habit-content">
                <div class="habit-category-description mt-2">
                  <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas, suscipit sunt!
                    Distinctio dolore iure aspernatur explicabo tempore amet? Aperiam officia ipsam
                    qui, et iure reprehenderit quod ea fuga repudiandae labore!
                  </p>
                </div>
                <hr style="margin: 5px" />
                <button class="habit-details d-flex align-items-center gap-3">
                  <font-awesome-icon icon="fa-solid fa-list-check" />
                  <p>2 Tasks available</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/Components/NavBar.vue'
export default { name: 'ExploreHabitsView', components: { NavBar } }

/* Basic structure of habit card to create a habit component in the future, for the id "habit-item".
  For now, we will keep it simple and static, but in the future we can make it dynamic and reusable.

>> There´s a duplicate on "AdminPanelView.vue" that we can also use as a reference to create the habit component.

<div class="habit-item" id="habit-item">
  <div class="card h-100">
    <div class="card-header-custom">
      <div class="habit-title-section">
        <div class="habit-title">
          <font-awesome-icon :icon="['fas', habit.iconName]" />
          <h3>{{ habit.name }}</h3>
        </div>
      </div>
    </div>

    <div class="habit-content">
      <div class="habit-category-description mt-2">
        <p>{{ habit.description }}</p>
      </div>
      <hr style="margin: 5px;">
      <button class="habit-details d-flex align-items-center gap-3">
        <font-awesome-icon icon="fa-solid fa-list-check" />
        <p>2 Tasks available</p>
      </button>
    </div>
  </div>
</div>
<template>

<script>
export default {
  props: ['habit']
} /script>
*/
</script>

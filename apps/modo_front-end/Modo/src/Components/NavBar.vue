<script setup>
/* Imports */
import { useUserStore } from '../stores/userStore'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

/* Logic */
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const user = computed(() => userStore.currentUser)
const isAdmin = computed(() => user.value && user.value.priority === 2)

const scrollToSection = (hash) => {
  if (route.path === '/') {
    const el = document.querySelector(hash)
    if (el) {
      const offset = 85
      const elementPosition = el.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  } else {
    router.push({ path: '/', hash: hash })
  }
}

/* Logout function, just if we want to test it */
/* const logout = () => {
  userStore.logout()
  router.push('/login')
} */
</script>

<template>
  <!-- Navbar component with conditional links based on user authentication and role. 
  Displays user name and avatar when logged in, and a login link when not authenticated. 
  Includes smooth scrolling to sections on the homepage. -->
  <div class="navbar-wrapper">
    <nav class="navbar navbar-expand-lg custom-navbar px-3">
      <a class="navbar-brand" href="/">
        <img src="../images/modoLogoNavbar.png" alt="Logo" class="navbar-logo" />
      </a>

      <div class="navbar-center" v-if="!user">
        <a
          href="#case_studies"
          @click.prevent="scrollToSection('#case_studies')"
          class="nav-link-custom"
        >
          Case Studies
        </a>
        <a href="#about" @click.prevent="scrollToSection('#about')" class="nav-link-custom">
          About
        </a>
        <a href="#faq" @click.prevent="scrollToSection('#faq')" class="nav-link-custom">
          Information
        </a>
      </div>

      <div class="ms-auto d-flex align-items-center" v-if="user">
        <div class="navbar-center">
          <RouterLink
            to="/habitsmanager"
            class="nav-link-custom me-3"
            title="Habits Manager"
            aria-label="Habits Manager"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="nav-icon"
              style="
                width: 1.5em;
                height: 1.5em;
                vertical-align: middle;
                fill: currentColor;
                overflow: hidden;
              "
              viewBox="0 0 1000 1000"
              version="1.1"
            >
              <path
                d="M337.066667 430.933333l-59.733334 59.733334L469.333333 682.666667 896 256l-59.733333-59.733333-366.933334 366.933333-132.266666-132.266667zM810.666667 810.666667H213.333333V213.333333h426.666667V128H213.333333c-46.933333 0-85.333333 38.4-85.333333 85.333333v597.333334c0 46.933333 38.4 85.333333 85.333333 85.333333h597.333334c46.933333 0 85.333333-38.4 85.333333-85.333333v-341.333334h-85.333333v341.333334z"
              />
            </svg>
          </RouterLink>

          <RouterLink
            to="/settings"
            class="nav-link-custom me-3"
            title="Settings"
            aria-label="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="nav-icon"
              style="
                width: 1.5em;
                height: 1.5em;
                vertical-align: middle;
                fill: currentColor;
                overflow: hidden;
              "
              viewBox="0 0 1000 1000"
              version="1.1"
            >
              <path
                d="M658.285714 512q0-60.571429-42.857143-103.428571t-103.428571-42.857143-103.428571 42.857143-42.857143 103.428571 42.857143 103.428571 103.428571 42.857143 103.428571-42.857143 42.857143-103.428571zm292.571429-62.285714l0 126.857143q0 6.857143-4.571429 13.142857t-11.428571 7.428571l-105.714286 16q-10.857143 30.857143-22.285714 52 20 28.571429 61.142857 78.857143 5.714286 6.857143 5.714286 14.285714t-5.142857 13.142857q-15.428571 21.142857-56.571429 61.714286t-53.714286 40.571429q-6.857143 0-14.857143-5.142857l-78.857143-61.714286q-25.142857 13.142857-52 21.714286-9.142857 77.714286-16.571429 106.285714-4 16-20.571429 16l-126.857143 0q-8 0-14-4.857143t-6.571429-12.285714l-16-105.142857q-28-9.142857-51.428571-21.142857l-80.571429 61.142857q-5.714286 5.142857-14.285714 5.142857-8 0-14.285714-6.285714-72-65.142857-94.285714-96-4-5.714286-4-13.142857 0-6.857143 4.571429-13.142857 8.571429-12 29.142857-38t30.857143-40.285714q-15.428571-28.571429-23.428571-56.571429l-104.571429-15.428571q-7.428571-1.142857-12-7.142857t-4.571429-13.428571l0-126.857143q0-6.857143 4.571429-13.142857t10.857143-7.428571l106.285714-16q8-26.285714 22.285714-52.571429-22.857143-32.571429-61.142857-78.857143-5.714286-6.857143-5.714286-13.714286 0-5.714286 5.142857-13.142857 14.857143-20.571429 56.285714-61.428571t54-40.857143q7.428571 0 14.857143 5.714286l78.857143 61.142857q25.142857-13.142857 52-21.714286 9.142857-77.714286 16.571429-106.285714 4-16 20.571429-16l126.857143 0q8 0 14 4.857143t6.571429 12.285714l16 105.142857q28 9.142857 51.428571 21.142857l81.142857-61.142857q5.142857-5.142857 13.714286-5.142857 7.428571 0 14.285714 5.714286 73.714286 68 94.285714 97.142857 4 4.571429 4 12.571429 0 6.857143-4.571429 13.142857-8.571429 12-29.142857 38t-30.857143 40.285714q14.857143 28.571429 23.428571 56l104.571429 16q7.428571 1.142857 12 7.142857t4.571429 13.428571z"
              />
            </svg>
          </RouterLink>
          <!-- If the user is an admin, show the admin panel link -->
          <RouterLink
            v-if="isAdmin"
            class="nav-link-custom me-3"
            to="/adminpanel"
            data-title="Admin Panel"
            aria-label="Admin Panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="nav-icon"
              style="
                width: 1.5em;
                height: 1.5em;
                vertical-align: middle;
                fill: currentColor;
                overflow: hidden;
              "
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
            >
              <path
                d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 20.201 4.665 24 6 15.596 0 9.748l8.332-1.730z"
              />
            </svg>
          </RouterLink>
        </div>

        <span class="me-3 bold" style="color: #ededed">{{ user.name }}</span>
        <RouterLink to="/settings">
          <img
            v-if="user.avatar"
            :src="user.avatar"
            alt="avatar"
            class="rounded-circle me-2"
            style="width: 40px; height: 40px; object-fit: cover"
          />
        </RouterLink>

        <!-- Logout button, currently for testing purposes -->
        <!-- <button class="fa logout-btn" @click="logout">&#xf08b;</button> -->
      </div>

      <!--Login Button-->
      <div v-else class="ms-auto">
        <RouterLink class="login-btn" to="/login"> Login </RouterLink>
      </div>
    </nav>
  </div>
</template>

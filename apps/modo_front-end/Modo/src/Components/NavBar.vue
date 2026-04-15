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
            to="/explorehabits"
            class="nav-link-custom me-3"
            title="Explore Habits"
            aria-label="Explore Habits"
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
              viewBox="0 0 36 36"
              role="img"
              aria-hidden="true"
            >
              <path
                d="M12.5625 24.375L20.1375 22.2C20.6375 22.05 21.069 21.7935 21.432 21.4305C21.795 21.0675 22.051 20.6365 22.2 20.1375L24.375 12.5625C24.45 12.2875 24.3815 12.0435 24.1695 11.8305C23.9575 11.6175 23.7135 11.549 23.4375 11.625L15.8625 13.8C15.3625 13.95 14.9315 14.2065 14.5695 14.5695C14.2075 14.9325 13.951 15.3635 13.8 15.8625L11.625 23.4375C11.55 23.7125 11.619 23.9565 11.832 24.1695C12.045 24.3825 12.2885 24.451 12.5625 24.375ZM18 20.25C17.375 20.25 16.844 20.0315 16.407 19.5945C15.97 19.1575 15.751 18.626 15.75 18C15.749 17.374 15.968 16.843 16.407 16.407C16.846 15.971 17.377 15.752 18 15.75C18.623 15.748 19.1545 15.967 19.5945 16.407C20.0345 16.847 20.253 17.378 20.25 18C20.247 18.622 20.0285 19.1535 19.5945 19.5945C19.1605 20.0355 18.629 20.254 18 20.25ZM18 33C15.925 33 13.975 32.606 12.15 31.818C10.325 31.03 8.7375 29.9615 7.3875 28.6125C6.0375 27.2635 4.969 25.676 4.182 23.85C3.395 22.024 3.001 20.074 3 18C2.999 15.926 3.393 13.976 4.182 12.15C4.971 10.324 6.0395 8.7365 7.3875 7.3875C8.7355 6.0385 10.323 4.97 12.15 4.182C13.977 3.394 15.927 3 18 3C20.073 3 22.023 3.394 23.85 4.182C25.677 4.97 27.2645 6.0385 28.6125 7.3875C29.9605 8.7365 31.0295 10.324 31.8195 12.15C32.6095 13.976 33.003 15.926 33 18C32.997 20.074 32.603 22.024 31.818 23.85C31.033 25.676 29.9645 27.2635 28.6125 28.6125C27.2605 29.9615 25.673 31.0305 23.85 31.8195C22.027 32.6085 20.077 33.002 18 33Z"
                fill="currentColor"
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

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/userStore'

const isDark = ref(false)
const route = useRoute()

const lightOnlyRoutes = ['/', '/login', '/signin']

function toggleTheme() {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  localStorage.setItem('modo_theme', theme)
  applyTheme(theme)
}

function applyTheme(theme) {
  if (lightOnlyRoutes.includes(route.path)) {
    document.documentElement.setAttribute('data-bs-theme', 'light')
  } else {
    document.documentElement.setAttribute('data-bs-theme', theme)
  }
}

watch(() => route.path, () => {
  const savedTheme = localStorage.getItem('modo_theme') || 'light'
  applyTheme(savedTheme)
})

onMounted(async () => {
  const savedTheme = localStorage.getItem('modo_theme') || 'light'
  isDark.value = savedTheme === 'dark'
  
  setTimeout(() => applyTheme(savedTheme), 0)

  const userStore = useUserStore()
  await userStore.loadFromLocalStorage().catch(() => {})
})
</script>

<template>
  <main>
    <router-view></router-view>
  </main>
  <button v-if="!lightOnlyRoutes.includes(route.path)" class="custom-theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
    <FontAwesomeIcon :icon="isDark ? 'sun' : 'moon'" />
  </button>
</template>

<style>
.custom-theme-toggle {
  position: fixed;
  bottom: 64px;
  right: 32px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background-color: #355d4c;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.custom-theme-toggle:hover {
  transform: scale(1.1);
  background-color: #2f5444;
}

[data-bs-theme="dark"] .custom-theme-toggle {
  background-color: #fff;
  color: #355d4c;
}
[data-bs-theme="dark"] .custom-theme-toggle:hover {
  background-color: #f0f0f0;
}
</style>

<template>
  <div class="weather">
    <button class="refresh-btn" @click="loadWeather" aria-label="Refresh weather">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0114.13-3.36L23 10"></path>
        <path d="M20.49 15a9 9 0 01-14.13 3.36L1 14"></path>
      </svg>
    </button>

    <p v-if="weatherStore.loading">Loading...</p>
    <p v-if="weatherStore.error">{{ weatherStore.error }}</p>

    <div v-if="weatherStore.weatherData" style="text-align: center">
      <h3>{{ weatherStore.weatherData.name }}</h3>
      <img :src="iconUrl" alt="weather icon" />
      <p>{{ weatherStore.weatherData.weather[0].description }} — {{ isDay ? 'Day' : 'Night' }}</p>
      <p>🌡 {{ weatherStore.weatherData.main.temp }} °C</p>
      <p>💨 {{ weatherStore.weatherData.wind.speed }} m/s</p>
    </div>
  </div>
</template>

<script setup>
import { useOpenWeatherApiStore } from '@/stores/openWeatherApiStore'
import { computed } from 'vue'

const weatherStore = useOpenWeatherApiStore()

const isDay = computed(() => {
  if (!weatherStore.weatherData) return false
  return weatherStore.weatherData.weather[0].icon.endsWith('d')
})

const iconUrl = computed(() => {
  if (!weatherStore.weatherData) return ''
  const icon = weatherStore.weatherData.weather[0].icon
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
})

// To allow manual refresh, emit an event or just do nothing since weather doesn't change rapidly
const emit = defineEmits(['refresh'])
function loadWeather() {
  emit('refresh')
}
</script>

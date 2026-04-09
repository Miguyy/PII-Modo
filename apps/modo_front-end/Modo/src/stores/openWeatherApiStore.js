import { defineStore } from 'pinia'
import { getCurrentWeather, getCurrentWeatherByCoords } from '@/api/openWeatherApi'

export const useOpenWeatherApiStore = defineStore('weather', {
  state: () => ({
    weatherData: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCurrentWeather(city, country) {
      this.loading = true
      this.error = null
      try {
        this.weatherData = await getCurrentWeather(city, country)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentWeatherByLocation(lat, lon) {
      this.loading = true
      this.error = null
      try {
        this.weatherData = await getCurrentWeatherByCoords(lat, lon)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
  },
})

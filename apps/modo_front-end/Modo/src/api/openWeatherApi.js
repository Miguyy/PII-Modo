const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

/*
 * Fetches current weather data for a given city and country.
 * @param {string} city - The name of the city.
 * @param {string} country - The country code (e.g., 'US' for the United States).
 * @returns {Promise<Object>} - A promise that resolves to the weather data object.
 * @throws {Error} - Throws an error if the HTTP request fails.
 */

export async function getCurrentWeather(city, country) {
  const url = `${BASE_URL}?q=${city},${country}&appid=${API_KEY}&units=metric`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

/*
 * Fetches current weather data for given latitude and longitude coordinates.
 * @param {number} lat - The latitude of the location.
 * @param {number} lon - The longitude of the location.
 * @returns {Promise<Object>} - A promise that resolves to the weather data object.
 * @throws {Error} - Throws an error if the HTTP request fails.
 */

export async function getCurrentWeatherByCoords(lat, lon) {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

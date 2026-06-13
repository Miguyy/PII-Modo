import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// ─── matchMedia (required by Bootstrap dark-mode) ─────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// ─── ResizeObserver (used by Chart.js) ────────────────────────────────────────
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// ─── HTMLCanvasElement.getContext (jsdom doesn't implement canvas) ─────────────
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  fillText: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  canvas: { width: 300, height: 150, style: {} },
})

// ─── Chart.js — prevent real chart instantiation in jsdom ────────────────────
vi.mock('chart.js', () => {
  const Chart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    data: { datasets: [] },
  }))
  Chart.register = vi.fn()
  return {
    Chart,
    registerables: [],
    ArcElement: vi.fn(),
    LineElement: vi.fn(),
    BarElement: vi.fn(),
    PointElement: vi.fn(),
    BarController: vi.fn(),
    BubbleController: vi.fn(),
    DoughnutController: vi.fn(),
    LineController: vi.fn(),
    PieController: vi.fn(),
    PolarAreaController: vi.fn(),
    RadarController: vi.fn(),
    ScatterController: vi.fn(),
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    LogarithmicScale: vi.fn(),
    RadialLinearScale: vi.fn(),
    TimeScale: vi.fn(),
    TimeSeriesScale: vi.fn(),
    Decimation: vi.fn(),
    Filler: vi.fn(),
    Legend: vi.fn(),
    Title: vi.fn(),
    Tooltip: vi.fn(),
    SubTitle: vi.fn(),
  }
})

// ─── Global fetch mock ────────────────────────────────────────────────────────
const mockFetch = vi.fn(() =>
  Promise.resolve({
    status: 200,
    ok: true,
    json: () => Promise.resolve({ id: 1, name: 'Test User' }),
    text: () => Promise.resolve(''),
  })
)
global.fetch = mockFetch
globalThis.fetch = mockFetch
if (typeof window !== 'undefined') window.fetch = mockFetch

// ─── FontAwesomeIcon stub (globally registered) ───────────────────────────────
config.global.components = {
  FontAwesomeIcon: {
    template: '<span class="fa-icon-mock"></span>',
  },
}

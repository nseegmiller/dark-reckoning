import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock localStorage with value tracking
const localStorageStore = {}
const localStorageMock = {
  getItem: vi.fn((key) => localStorageStore[key] ?? null),
  setItem: vi.fn((key, value) => { localStorageStore[key] = value }),
  removeItem: vi.fn((key) => { delete localStorageStore[key] }),
  clear: vi.fn(() => { Object.keys(localStorageStore).forEach(key => delete localStorageStore[key]) }),
}
global.localStorage = localStorageMock

// Mock crypto.randomUUID with proper UUID format
let uuidCounter = 0
global.crypto = {
  randomUUID: () => `test-uuid-${++uuidCounter}-${Date.now()}`,
}

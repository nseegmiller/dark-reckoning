import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock localStorage with value tracking
const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key] }),
  clear: vi.fn(() => { Object.keys(localStorageStore).forEach(key => delete localStorageStore[key]) }),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock crypto.randomUUID with proper UUID format
let uuidCounter = 0

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${++uuidCounter}-${Date.now()}`,
  },
  writable: true
})

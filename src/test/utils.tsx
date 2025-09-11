/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { vi } from 'vitest'

// Mock Prisma client for tests
export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  // Add other models as needed
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options })

export * from '@testing-library/react'
export { customRender as render }

// Common test helpers
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
})

export const createMockTeam = (overrides = {}) => ({
  id: 'team-1',
  name: 'Test Team',
  ...overrides,
})

export const waitFor = async (fn: () => void | Promise<void>, timeout = 1000) => {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      await fn()
      return
    } catch {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }
  await fn() // Final attempt that will throw if it fails
}
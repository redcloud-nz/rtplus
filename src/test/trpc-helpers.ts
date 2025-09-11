/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { beforeEach, vi } from 'vitest'
import { PrismockClient } from 'prismock'

// Create a fresh instance for each test
export const createMockContext = () => {
  return {
    auth: null,
    getClerkClient: () => { 
      throw new Error("Not implemented in test") 
    },
    getTeamById: vi.fn().mockResolvedValue(null),
    prisma: new PrismockClient(),
  }
}

export const createAuthenticatedMockContext = (overrides = {}) => {
  return {
    auth: {
      userId: 'user_test123',
      personId: 'PID_test123',
      activeTeam: {
        orgId: 'org_test123',
        slug: 'test-team',
        role: 'org:member' as const,
      },
      ...overrides,
    },
    getClerkClient: () => { 
      throw new Error("Not implemented in test") 
    },
    getTeamById: vi.fn().mockResolvedValue({
      id: 'team_test123',
      name: 'Test Team',
      slug: 'test-team',
    }),
    prisma: new PrismockClient(),
  }
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
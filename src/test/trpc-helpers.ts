/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { beforeEach, vi } from 'vitest'

import type { Team as TeamRecord } from '@prisma/client'

import { createInnerTRPCContext } from '@/trpc/init'
import { UserId } from '@/lib/schemas/user'
import { OrganizationId } from '@/lib/schemas/organization'


// Create a fresh instance for each test
export const createMockContext = () => {
    return {
        auth: null,
        getClerkClient: () => { 
            throw new Error("Not implemented in test") 
        },
        getTeamById: vi.fn().mockResolvedValue(null),
    }
}

interface CreateAuthenticatedMockContextOverrides {
    activeTeam?: {
        orgId: OrganizationId,
        role: 'org:admin' | 'org:member'
    } | null
    userId?: UserId
    
    getClerkClient?: () => ReturnType<typeof import('@clerk/nextjs/server').createClerkClient>
    getTeamById?: (teamId: string) => Promise<TeamRecord | null>
    teams?: Array<TeamRecord>
}

export const createAuthenticatedMockContext = ({ activeTeam, ...overrides }: CreateAuthenticatedMockContextOverrides) => {
    return createInnerTRPCContext({
        auth: {
            userId: UserId.schema.parse('user_test123'),
            activeOrg: activeTeam ?? {
                orgId: OrganizationId.schema.parse('org_test123'),
                role: 'org:member' as const,
            },
        },
        getClerkClient: () => { 
            throw new Error("Not implemented in test") 
        },
        ...overrides
    })
}

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks()
})
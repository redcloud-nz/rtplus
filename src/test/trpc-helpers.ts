/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { beforeEach, vi } from 'vitest'

import type { Team as TeamRecord } from '@prisma/client'

import { createInnerTRPCContext } from '@/trpc/init'
import { SampleTeams } from './sample-teams'


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
    personId: string
    activeTeam?: {
        orgId: string,
        slug: string,
        role: 'org:admin' | 'org:member'
    } | null
    userId?: string
    
    getClerkClient?: () => ReturnType<typeof import('@clerk/nextjs/server').createClerkClient>
    getTeamById?: (teamId: string) => Promise<TeamRecord | null>
    teams?: Array<TeamRecord>
}

export const createAuthenticatedMockContext = ({ personId, activeTeam, teams = [SampleTeams.TeamAlpha], ...overrides }: CreateAuthenticatedMockContextOverrides) => {
    return createInnerTRPCContext({
        auth: {
            userId: 'user_test123',
            personId: personId,
            activeTeam: activeTeam ?? {
                orgId: 'org_test123',
                slug: 'test-team',
                role: 'org:member' as const,
            },
        },
        getClerkClient: () => { 
            throw new Error("Not implemented in test") 
        },
        getTeamById: vi.fn().mockResolvedValue({
            id: 'team_test123',
            name: 'Test Team',
            slug: 'test-team',
        }),
        ...overrides
    })
}

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks()
})
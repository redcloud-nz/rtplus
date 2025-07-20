/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pick } from 'remeda'

import { OrganizationMembershipRole } from '@clerk/nextjs/server'
import type * as Prisma from '@prisma/client'

export * from '@/lib/schemas/person'
export * from '@/lib/schemas/team'
export * from '@/lib/schemas/team-membership'

export type DeleteType = 'Soft' | 'Hard'

export class FieldConflictError extends Error {
    constructor(fieldName: string) {
        super(fieldName)
        this.name = 'FieldConflictError'
    }
}

export interface OrganizationData {
    id: string
    name: string
    slug: string | null
}

export interface OrgInvitationData {
    id: string
    email: string
    role: OrganizationMembershipRole
    createdAt: number
}

export interface OrgMembershipData {
    id: string
    role: OrganizationMembershipRole
    user: UserData
    organization: OrganizationData
    createdAt: number
    updatedAt: number
}

export interface PersonAccess {

}

export type SkillCheckSessionWithCounts = WithCounts<Prisma.SkillCheckSession, 'assessees' | 'checks' | 'skills'>



export interface UserData {
    id: string
    identifier: string
    name: string
}


export type WithCounts<T, S extends string> = T & { _count: Record<S, number> }
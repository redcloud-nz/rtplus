/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Team as TeamRecord } from '@prisma/client'

import { nanoId8 } from '../id'
import { zodColor, zodSlug } from '../validation'


export type TeamId = string & z.BRAND<'TeamId'>

export const TeamId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Team ID expected.").brand<'TeamId'>(),

    create: () => nanoId8() as TeamId,

    EMPTY: '' as TeamId,

    SYSTEM: 'RTSYSTEM' as TeamId,
} as const


export function isSystemTeam(teamId: string) {
    return teamId === TeamId.SYSTEM
}

export function isSandboxTeam(teamId: string) {
    return teamId.startsWith('SANDBOX')
}

export function isSpecialTeam(teamId: string) {
    return isSystemTeam(teamId) || isSandboxTeam(teamId)
}

export const teamSchema = z.object({
    teamId: TeamId.schema,
    name: z.string().min(5).max(100),
    shortName: z.string().max(20),
    slug: zodSlug,
    color: z.union([zodColor, z.literal('')]),
    type: z.enum(['Normal', 'Sandbox', 'System']),
    status: z.enum(['Active', 'Inactive']),
})

export type TeamData = z.infer<typeof teamSchema>

export function toTeamData(record: TeamRecord): TeamData {
    return teamSchema.parse({
        teamId: record.id,
        name: record.name,
        shortName: record.shortName,
        slug: record.slug,
        color: record.color,
        type: record.type,
        status: record.status,
    })
}

export const teamRefSchema = teamSchema.pick({ teamId: true, name: true, slug: true })

export type TeamRef = z.infer<typeof teamRefSchema>

export function toTeamRef(record: Pick<TeamRecord, 'id' | 'name' | 'slug'>): TeamRef {
    return teamRefSchema.parse({
        teamId: record.id,
        name: record.name,
        slug: record.slug,
    })
}
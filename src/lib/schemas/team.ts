/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Team as TeamRecord } from '@prisma/client'

import { zodColor, zodNanoId8, zodSlug } from '../validation'

export const zodTeamId = z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Team ID expected.").brand<'TeamId'>()
export type TeamId = z.infer<typeof zodTeamId>

export const SYSTEM_TEAM_ID = zodTeamId.parse('RTSYSTEM')

export function isSystemTeam(teamId: string) {
    return teamId === SYSTEM_TEAM_ID
}

export function isSandboxTeam(teamId: string) {
    return teamId.startsWith('SANDBOX')
}

export function isSpecialTeam(teamId: string) {
    return isSystemTeam(teamId) || isSandboxTeam(teamId)
}

export const teamSchema = z.object({
    teamId: zodNanoId8,
    name: z.string().min(5).max(100),
    shortName: z.string().max(20),
    slug: zodSlug,
    color: z.union([zodColor, z.literal('')]),
    type: z.enum(['Normal', 'Sandbox', 'System']),
    status: z.enum(['Active', 'Inactive']),
})

export type TeamData = z.infer<typeof teamSchema>

export function toTeamData(record: TeamRecord): TeamData {
    return {
        teamId: record.id,
        name: record.name,
        shortName: record.shortName,
        slug: record.slug,
        color: record.color,
        type: record.type,
        status: record.status,
    }
}
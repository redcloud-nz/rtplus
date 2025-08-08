/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Team as TeamRecord } from '@prisma/client'

import { zodColor, zodNanoId8, zodSlug } from '../validation'

export const teamSchema = z.object({
    teamId: zodNanoId8,
    name: z.string().min(5).max(100),
    shortName: z.string().max(20),
    slug: zodSlug,
    color: z.union([zodColor, z.literal('')]),
    status: z.enum(['Active', 'Inactive'])
})

export type TeamData = z.infer<typeof teamSchema>

export function toTeamData(record: TeamRecord): TeamData {
    return {
        teamId: record.id,
        name: record.name,
        shortName: record.shortName,
        slug: record.slug,
        color: record.color,
        status: record.status
    }
}
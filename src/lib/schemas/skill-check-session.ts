/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillCheckSession as SkillCheckSessionRecord, Team as TeamRecord } from '@prisma/client'

import { zodNanoId8 } from '../validation'
import { formatISO } from 'date-fns'
import { teamSchema, toTeamData } from './team'

export const skillCheckSessionSchema = z.object({
    sessionId: zodNanoId8,
    teamId: zodNanoId8,
    name: z.string().nonempty().max(100),
    notes: z.string().max(1000),
    date: z.string().date(),
    sessionStatus: z.enum(['Draft', 'Complete', 'Discard']),
    
     _count: z.object({
        skills: z.number(),
        assessees: z.number(),
        assessors: z.number(),
        checks: z.number()
    }),
    team: teamSchema
})

export type SkillCheckSessionData = z.infer<typeof skillCheckSessionSchema>


export function toSkillCheckSessionData(record: SkillCheckSessionRecord & { _count: SkillCheckSessionData['_count'], team: TeamRecord} ): SkillCheckSessionData {
    return {
        sessionId: record.id,
        teamId: record.teamId,
        name: record.name,
        notes: record.notes,
        date: formatISO(record.date, { representation: 'date' }),
        sessionStatus: record.sessionStatus,
        _count: record._count,
        team: toTeamData(record.team)
    }
}
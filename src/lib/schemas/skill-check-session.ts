/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { formatISO } from 'date-fns'
import { z } from 'zod'

import { SkillCheckSession as SkillCheckSessionRecord } from '@prisma/client'

import { zodNanoId8 } from '../validation'


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
})

export type SkillCheckSessionData = z.infer<typeof skillCheckSessionSchema>

export function toSkillCheckSessionData(record: SkillCheckSessionRecord & { _count: SkillCheckSessionData['_count'] } ): SkillCheckSessionData {
    return {
        sessionId: record.id,
        teamId: record.teamId,
        name: record.name,
        notes: record.notes,
        date: formatISO(record.date, { representation: 'date' }),
        sessionStatus: record.sessionStatus,
        _count: record._count,   
    }
}

export const skillCheckSessionRefSchema = z.object({
    sessionId: zodNanoId8,
    name: z.string().nonempty().max(100),
})

export type SkillCheckSessionRef = z.infer<typeof skillCheckSessionRefSchema>

export function toSkillCheckSessionRef(record: Pick<SkillCheckSessionRecord, 'id' | 'name'>): SkillCheckSessionRef {
    return {
        sessionId: record.id,
        name: record.name,
    }
}
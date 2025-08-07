/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillCheckSession as SkillCheckSessionRecord } from '@prisma/client'

import { zodNanoId8 } from '../validation'

export const skillCheckSessionSchema = z.object({
    sessionId: zodNanoId8,
    name: z.string().nonempty().max(100),
    date: z.string().date(),
    sessionStatus: z.enum(['Draft', 'Complete', 'Discard']),
    
     _count: z.object({
        skills: z.number(),
        assessees: z.number(),
        assessors: z.number(),
        checks: z.number()
    })
})

export type SkillCheckSessionData = z.infer<typeof skillCheckSessionSchema>


export function createSkillCheckSessionData(data: SkillCheckSessionRecord & Pick<SkillCheckSessionData, '_count'>): SkillCheckSessionData {
    return {
        sessionId: data.id,
        name: data.name,
        date: data.date.toISOString(),
        sessionStatus: data.sessionStatus,
        _count: data._count
    }
}
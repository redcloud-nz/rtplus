/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillCheck as SkillCheckRecord } from '@prisma/client'

import { zodNanoId16, zodNanoId8 } from '@/lib/validation'


export const skillCheckSchema = z.object({
    skillCheckId: zodNanoId16,
    sessionId: zodNanoId8.nullable(),
    skillId: zodNanoId8,
    teamId: zodNanoId8,
    assesseeId: zodNanoId8,
    assessorId: zodNanoId8,
    passed: z.boolean(),
    result: z.string().nonempty(),
    notes: z.string().max(1000),
    date: z.string().date(),
    timestamp: z.string().datetime()
})

export type SkillCheckData = z.infer<typeof skillCheckSchema>

export function toSkillCheckData(record: SkillCheckRecord): SkillCheckData {
    return {
        skillCheckId: record.id,
        sessionId: record.sessionId,
        skillId: record.skillId,
        teamId: record.teamId,
        assesseeId: record.assesseeId,
        assessorId: record.assessorId,
        passed: record.passed,
        result: record.result,
        notes: record.notes,
        date: record.date,
        timestamp: record.timestamp.toISOString(),
    }
}
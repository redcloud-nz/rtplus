/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillCheck as SkillCheckRecord } from '@prisma/client'
import { nanoId16, nanoId8 } from '../id'
import { zodNanoId16, zodNanoId8 } from '../validation'

export const skillCheckSchema = z.object({
    skillCheckId: zodNanoId16,
    sessionId: zodNanoId8.nullable(),
    skillId: zodNanoId8,
    assesseeId: zodNanoId8,
    assessorId: zodNanoId8,
    result: z.string().max(100),
    notes: z.string().max(500),
    timestamp: z.string().datetime(),
})

export type SkillCheckData = z.infer<typeof skillCheckSchema>

export function createSkillCheckData(data: SkillCheckRecord): SkillCheckData {
    return {
        skillCheckId: data.id,
        sessionId: data.sessionId,
        skillId: data.skillId,
        assesseeId: data.assesseeId,
        assessorId: data.assessorId,
        result: data.result,
        notes: data.notes,
        timestamp: data.timestamp.toISOString(),
    }
}
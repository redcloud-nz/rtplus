/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillCheckSession as SkillCheckSessionRecord } from '@prisma/client'

import { zodNanoId8 } from '../validation'

export type SkillCheckSessionId = string & z.BRAND<'SkillCheckSessionId'>

export const SkillCheckSessionId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Skill Check Session ID expected.").brand<'SkillCheckSessionId'>(),

    create: () => zodNanoId8.parse(zodNanoId8) as SkillCheckSessionId,
} as const

export const skillCheckSessionSchema = z.object({
    sessionId: SkillCheckSessionId.schema,
    name: z.string().nonempty().max(100),
    notes: z.string().max(1000),
    date: z.string().date(),
    sessionStatus: z.enum(['Draft', 'Complete', 'Discard']),
})

export type SkillCheckSessionData = z.infer<typeof skillCheckSessionSchema>

export function toSkillCheckSessionData(record: SkillCheckSessionRecord ): SkillCheckSessionData {
    return skillCheckSessionSchema.parse(record)
}
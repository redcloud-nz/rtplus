/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillCheckSession as SkillCheckSessionRecord } from '@prisma/client'

import { nanoId8 } from '../id'

export type SkillCheckSessionId = string & z.BRAND<'SkillCheckSessionId'>

export const SkillCheckSessionId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Skill Check Session ID expected.").brand<'SkillCheckSessionId'>(),

    create: () => SkillCheckSessionId.schema.parse(nanoId8()),
} as const

export const skillCheckSessionSchema = z.object({
    sessionId: SkillCheckSessionId.schema,
    name: z.string().nonempty().max(100),
    notes: z.string().max(1000),
    date: z.string().date(),
    sessionStatus: z.enum(['Draft', 'Include', 'Exclude']),
})

export type SkillCheckSessionData = z.infer<typeof skillCheckSessionSchema>

export function toSkillCheckSessionData(record: SkillCheckSessionRecord ): SkillCheckSessionData {
    return skillCheckSessionSchema.parse(record)
}
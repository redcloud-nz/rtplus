/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillCheck as SkillCheckRecord } from '@prisma/client'

import { zodNanoId16 } from '@/lib/validation'

import { PersonId } from './person'
import { SkillId } from './skill'
import { SkillCheckSessionId } from './skill-check-session'


export type SkillCheckId = string & z.BRAND<'SkillCheckId'>

export const SkillCheckId = {
    schema: z.string().length(16).regex(/^[a-zA-Z0-9]+$/, "16 character Skill Check ID expected.").brand<'SkillCheckId'>(),

    create: () => SkillCheckId.schema.parse(zodNanoId16),
} as const


export const skillCheckSchema = z.object({
    skillCheckId: SkillCheckId.schema,
    sessionId: SkillCheckSessionId.schema.optional(),
    skillId: SkillId.schema,
    assesseeId: PersonId.schema,
    assessorId: PersonId.schema,
    passed: z.boolean(),
    result: z.string().nonempty(),
    notes: z.string().max(1000),
    date: z.string().date(),
    timestamp: z.string().datetime()
})

export type SkillCheckData = z.infer<typeof skillCheckSchema>

export function toSkillCheckData(record: SkillCheckRecord): SkillCheckData {
    return skillCheckSchema.parse(record)
}
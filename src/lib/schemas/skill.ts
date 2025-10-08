/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Skill as SkillRecord } from '@prisma/client'

import { propertiesSchema, recordStatusSchema, zodNanoId8 } from '../validation'
import { SkillGroupId } from './skill-group'
import { SkillPackageId } from './skill-package'

export type SkillId = string

export const SkillId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Skill ID expected.").brand<'SkillId'>(),

    create: () => zodNanoId8.parse(zodNanoId8),
}

export const skillSchema = z.object({
    skillId: SkillId.schema,
    skillGroupId: SkillGroupId.schema,
    skillPackageId: SkillPackageId.schema,
    name: z.string().nonempty().max(100),
    description: z.string().max(500),
    properties: propertiesSchema,
    sequence: z.number(),
    status: recordStatusSchema
})

export type SkillData = z.infer<typeof skillSchema>

export function toSkillData(data: SkillRecord): SkillData {
    return skillSchema.parse(data)
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillGroup as SkillGroupRecord } from '@prisma/client'

import { propertiesSchema, recordStatusSchema, tagsSchema } from '../validation'
import { nanoId8 } from '../id'
import { SkillPackageId } from './skill-package'


export type SkillGroupId = string & z.BRAND<'SkillGroupId'>

export const SkillGroupId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Skill Group ID expected.").brand<'SkillGroupId'>(),

    create: () => nanoId8() as SkillGroupId,
}

export const skillGroupSchema = z.object({
    skillGroupId: SkillGroupId.schema,
    skillPackageId: SkillPackageId.schema,
    parentId: z.union([SkillGroupId.schema, z.null()]),
    name: z.string().nonempty().max(100),
    description: z.string().max(500),
    tags: tagsSchema,
    properties: propertiesSchema,
    status: recordStatusSchema,
    sequence: z.number()
})

export type SkillGroupData = z.infer<typeof skillGroupSchema>

export function toSkillGroupData(data: SkillGroupRecord): SkillGroupData {
    return skillGroupSchema.parse(data)
}
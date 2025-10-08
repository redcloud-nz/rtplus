/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillPackage as SkillPackageRecord } from '@prisma/client'

import { propertiesSchema, recordStatusSchema, zodNanoId8 } from '../validation'

export type SkillPackageId = string & z.BRAND<'SkillPackageId'>

export const SkillPackageId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Skill Package ID expected.").brand<'SkillPackageId'>(),

    create: () => zodNanoId8.parse(zodNanoId8) as SkillPackageId,
} as const

export const skillPackageSchema = z.object({
    skillPackageId: SkillPackageId.schema,
    name: z.string().nonempty().max(100),
    description: z.string().max(500),
    tags: z.array(z.string()),
    properties: propertiesSchema,
    status: recordStatusSchema,
})

export type SkillPackageData = z.infer<typeof skillPackageSchema>

export function toSkillPackageData(data: SkillPackageRecord): SkillPackageData {
    return skillPackageSchema.parse(data)
}
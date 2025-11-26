/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillPackage as SkillPackageRecord } from '@prisma/client'

import { nanoId8 } from '../id'
import { propertiesSchema, recordStatusSchema, tagsSchema } from '../validation'

import { OrganizationId } from './organization'


export type SkillPackageId = string & z.BRAND<'SkillPackageId'>

export const SkillPackageId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Skill Package ID expected.").brand<'SkillPackageId'>(),

    create: () => SkillPackageId.schema.parse(nanoId8()),

    parse: (value: string) => SkillPackageId.schema.parse(value),
} as const

export const skillPackageSchema = z.object({
    skillPackageId: SkillPackageId.schema,
    ownerOrgId: OrganizationId.schema,
    name: z.string().nonempty().max(100),
    description: z.string().max(500),
    tags: tagsSchema,
    properties: propertiesSchema,
    status: recordStatusSchema,
    published: z.boolean(),
})

export type SkillPackageData = z.infer<typeof skillPackageSchema>

export function toSkillPackageData(data: SkillPackageRecord): SkillPackageData {
    return skillPackageSchema.parse(data)
}

export const skillPackageRefSchema = z.object({
    skillPackageId: SkillPackageId.schema,
    name: z.string().nonempty().max(100),
    status: recordStatusSchema,
})

export type SkillPackageRef = z.infer<typeof skillPackageRefSchema>

export function toSkillPackageRef(data: Pick<SkillPackageRecord, 'skillPackageId' | 'name' | 'status'>): SkillPackageRef {
    return skillPackageRefSchema.parse({
        skillPackageId: data.skillPackageId,
        name: data.name,
        status: data.status,
    })
}
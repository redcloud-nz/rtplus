/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillGroup as SkillGroupRecord } from '@prisma/client'

import { zodNanoId8 } from '../validation'

export const skillGroupSchema = z.object({
    skillGroupId: zodNanoId8,
    skillPackageId: zodNanoId8,
    parentId: z.union([zodNanoId8, z.null()]),
    name: z.string().nonempty().max(100),
    description: z.string().max(500),
    status: z.enum(['Active', 'Inactive']),
    sequence: z.number()
})

export type SkillGroupData = z.infer<typeof skillGroupSchema>

export function toSkillGroupData(data: SkillGroupRecord): SkillGroupData {
    return {
        skillGroupId: data.id,
        skillPackageId: data.skillPackageId,
        parentId: data.parentId,
        name: data.name,
        description: data.description,
        status: data.status,
        sequence: data.sequence
    }
}
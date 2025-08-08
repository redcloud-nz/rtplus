/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Skill as SkillRecord } from '@prisma/client'

import { zodNanoId8 } from '../validation'

export const skillSchema = z.object({
    skillId: zodNanoId8,
    skillGroupId: zodNanoId8,
    skillPackageId: zodNanoId8,
    name: z.string().nonempty().max(100),
    description: z.string().max(500),
    frequency: z.string(),
    optional: z.boolean().default(false),
    sequence: z.number(),
    status: z.enum(['Active', 'Inactive'])
})

export type SkillData = z.infer<typeof skillSchema>

export function toSkillData(data: SkillRecord): SkillData {
    return {
        skillId: data.id,
        skillGroupId: data.skillGroupId,
        skillPackageId: data.skillPackageId,
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        optional: data.optional,
        sequence: data.sequence,
        status: data.status
    }
}
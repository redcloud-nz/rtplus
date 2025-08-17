/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillPackage as SkillPackageRecord } from '@prisma/client'

import { zodNanoId8 } from '../validation'

export const skillPackageSchema = z.object({
    skillPackageId: zodNanoId8,
    name: z.string().nonempty().max(100),
    description: z.string().max(500),
    status: z.enum(['Active', 'Inactive']),
})

export type SkillPackageData = z.infer<typeof skillPackageSchema>

export function toSkillPackageData(data: SkillPackageRecord): SkillPackageData {
    return {
        skillPackageId: data.id,
        name: data.name,
        description: data.description,
        status: data.status
    }
}
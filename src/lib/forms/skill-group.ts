/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { zodNanoId8 } from '../validation'

export const skillGroupFormSchema = z.object({
    skillGroupId: zodNanoId8,
    skillPackageId: zodNanoId8,
    parentId: z.union([zodNanoId8, z.null()]),
    name: z.string().min(5).max(100),
    status: z.enum(['Active', 'Inactive'])
})

export type SkillGroupFormData = z.infer<typeof skillGroupFormSchema>
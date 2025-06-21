/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { zodNanoId8 } from '../validation'

export const skillFormSchema = z.object({
    skillId: zodNanoId8,
    skillGroupId: zodNanoId8,
    skillPackageId: zodNanoId8,
    name: z.string().nonempty().max(100),
    description: z.string().max(500),
    frequency: z.string(),
    optional: z.boolean().default(false),
    status: z.enum(['Active', 'Inactive'])
})

export type SkillFormData = z.infer<typeof skillFormSchema>
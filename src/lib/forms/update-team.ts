/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'
import { zodColor, zodSlug } from '../validation'

export const updateTeamFormSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(5).max(100),
    shortName: z.string().max(20),
    slug: zodSlug,
    color: z.union([zodColor, z.literal('')]),
    // d4hTeamId: z.union([z.number().int("Must be an integer."), z.literal('')]),
    // d4hApiUrl: z.union([z.string().url(), z.literal('')]),
    // d4hWebUrl: z.union([z.string().url(), z.literal('')]),
})

export type UpdateTeamFormData = z.infer<typeof updateTeamFormSchema>
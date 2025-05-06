/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'
import { zodColor, zodShortId, zodSlug } from '../validation'

export const teamFormSchema = z.object({
    teamId: zodShortId,
    name: z.string().min(5).max(100),
    shortName: z.string().max(20),
    slug: zodSlug,
    color: z.union([zodColor, z.literal('')]),
})

export type TeamFormData = z.infer<typeof teamFormSchema>
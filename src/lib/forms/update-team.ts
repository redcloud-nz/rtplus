/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

export const updateTeamFormSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(5).max(100),
    shortName: z.string().max(20),
    slug: z.string().max(100).regex(/^[a-z0-9-]+$/, "Must be lowercase alphanumeric with hyphens."),
    color: z.union([z.string().regex(/^#[0-9A-F]{6}$/, "Must be a colour in RGB Hex format (eg #4682B4)"), z.literal('')]),
    d4hTeamId: z.union([z.number().int("Must be an integer."), z.literal('')]),
    d4hApiUrl: z.union([z.string().url(), z.literal('')]),
    d4hWebUrl: z.union([z.string().url(), z.literal('')]),
})

export type UpdateTeamFormData = z.infer<typeof updateTeamFormSchema>
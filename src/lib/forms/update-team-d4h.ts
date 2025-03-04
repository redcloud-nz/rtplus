/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

export const updateTeamD4hFormSchema = z.object({
    teamId: z.string().uuid(),
    d4hTeamId: z.union([z.number().int("Must be an integer."), z.literal('')]).transform(value => value === '' ? 0 : value),
    d4hApiUrl: z.union([z.string().url(), z.literal('')]),
    d4hWebUrl: z.union([z.string().url(), z.literal('')]),
})

export type UpdateTeamD4hFormData = z.infer<typeof updateTeamD4hFormSchema>
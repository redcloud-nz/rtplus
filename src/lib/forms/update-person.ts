/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'
import { zodSlug } from '../validation'

export const updatePersonFormSchema = z.object({
    id: z.string().uuid(),
    slug: zodSlug,
    name: z.string().min(5).max(100),
    email: z.string().email(),
})

export type UpdatePersonFormData = z.infer<typeof updatePersonFormSchema>
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'
import { zodNanoId8 } from '../validation'

export const systemPersonFormSchema = z.object({
    personId: zodNanoId8,
    name: z.string().min(5).max(100),
    email: z.string().email(),
    status: z.enum(['Active', 'Inactive', 'Deleted'])
})

export type SystemPersonFormData = z.infer<typeof systemPersonFormSchema>
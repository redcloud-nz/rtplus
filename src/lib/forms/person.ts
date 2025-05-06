/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'
import { zodShortId } from '../validation'

export const personFormSchema = z.object({
    personId: zodShortId,
    name: z.string().min(5).max(100),
    email: z.string().email(),
})

export type PersonFormData = z.infer<typeof personFormSchema>
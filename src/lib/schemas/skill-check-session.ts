/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'
import { zodNanoId8 } from '../validation'

export const skillCheckSessionFormSchema = z.object({
    sessionId: zodNanoId8,
    name: z.string().nonempty().max(100),
    date: z.string().date(),
    sessionStatus: z.enum(['Draft', 'Complete', 'Discard']),
    
})

export type SkillCheckSessionFormData = z.infer<typeof skillCheckSessionFormSchema>
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { zodShortId } from '../validation'


export const teamMembershipFormSchema = z.object({
    teamId: zodShortId,
    personId: zodShortId,
    role: z.enum(['Admin', 'Member', 'None'])
})

export type TeamMembershipFormData = z.infer<typeof teamMembershipFormSchema>
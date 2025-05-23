/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { zodNanoId8 } from '../validation'


export const teamMembershipFormSchema = z.object({
    teamId: zodNanoId8,
    personId: zodNanoId8,
    role: z.enum(['Admin', 'Member', 'None']),
    status: z.enum(['Active', 'Inactive', 'Deleted']).optional().default('Active'),
})

export type TeamMembershipFormData = z.infer<typeof teamMembershipFormSchema>
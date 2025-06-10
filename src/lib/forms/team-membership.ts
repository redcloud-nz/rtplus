/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { zodNanoId8 } from '../validation'


export const systemTeamMembershipFormSchema = z.object({
    teamId: zodNanoId8,
    personId: zodNanoId8,
    tags: z.array(z.string()),
    status: z.enum(['Active', 'Inactive']),
})

export type SystemTeamMembershipFormData = z.infer<typeof systemTeamMembershipFormSchema>

export const teamMembershipFormSchema = z.object({
    personId: zodNanoId8,
    tags: z.array(z.string()),
    status: z.enum(['Active', 'Inactive']),
})

export type TeamMembershipFormData = z.infer<typeof teamMembershipFormSchema>
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TeamMembership as TeamMembershipRecord } from '@prisma/client'

import { zodNanoId8 } from '../validation'



export const teamMembershipSchema = z.object({
    teamId: zodNanoId8,
    personId: zodNanoId8,
    tags: z.array(z.string()),
    status: z.enum(['Active', 'Inactive']),
})

export type TeamMembershipData = z.infer<typeof teamMembershipSchema>



export function toTeamMembershipData(data: TeamMembershipRecord): TeamMembershipData {
    return {
        teamId: data.teamId,
        personId: data.personId,
        tags: data.tags,
        status: data.status
    }
}

// export const addTeamMemberFormSchema = z.object({
//     personId: zodNanoId8.nullable(),
//     name: z.string().min(1, 'Name is required'),
//     email: z.string().email('Invalid email address'),
//     tags: z.array(z.string()),
// })
// export type AddTeamMemberFormData = z.infer<typeof addTeamMemberFormSchema>
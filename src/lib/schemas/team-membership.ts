/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TeamMembership as TeamMembershipRecord } from '@prisma/client'

import { PersonId } from './person'
import { TeamId } from './team'


export const teamMembershipSchema = z.object({
    teamId: TeamId.schema,
    personId: PersonId.schema,
    properties: z.record(z.string(), z.any()),
    tags: z.array(z.string()),
    status: z.enum(['Active', 'Inactive']),
})

export type TeamMembershipData = z.infer<typeof teamMembershipSchema>



export function toTeamMembershipData(data: TeamMembershipRecord): TeamMembershipData {
    return teamMembershipSchema.parse({
        teamId: data.teamId,
        personId: data.personId,
        tags: data.tags,
        status: data.status
    })
}
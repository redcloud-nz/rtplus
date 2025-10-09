/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TeamMembership as TeamMembershipRecord } from '@prisma/client'

import { propertiesSchema, recordStatusSchema, tagsSchema } from '../validation'
import { PersonId } from './person'
import { TeamId } from './team'



export const teamMembershipSchema = z.object({
    teamId: TeamId.schema,
    personId: PersonId.schema,
    properties: propertiesSchema,
    tags: tagsSchema,
    status: recordStatusSchema,
})

export type TeamMembershipData = z.infer<typeof teamMembershipSchema>



export function toTeamMembershipData(record: TeamMembershipRecord): TeamMembershipData {
    return teamMembershipSchema.parse(record)
}
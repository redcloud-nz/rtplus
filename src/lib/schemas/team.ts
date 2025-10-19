/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Team as TeamRecord } from '@prisma/client'

import { nanoId8 } from '../id'
import { propertiesSchema, recordStatusSchema, tagsSchema, zodColor } from '../validation'


export type TeamId = string & z.BRAND<'TeamId'>

export const TeamId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Team ID expected.").brand<'TeamId'>(),

    create: () => TeamId.schema.parse(nanoId8()),
} as const


export const teamSchema = z.object({
    teamId: TeamId.schema,
    name: z.string().min(5).max(100),
    color: z.union([zodColor, z.literal('')]),
    tags: tagsSchema,
    properties: propertiesSchema,
    status: recordStatusSchema,
})

export type TeamData = z.infer<typeof teamSchema>

export function toTeamData(record: TeamRecord): TeamData {
    return teamSchema.parse(record)
}

export const teamRefSchema = z.object({
    teamId: TeamId.schema,
    name: z.string().min(5).max(100),
    status: recordStatusSchema,
})

export type TeamRef = z.infer<typeof teamRefSchema>

export function toTeamRef(record: TeamRecord): TeamRef {
    return teamRefSchema.parse(record)
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Person as PersonRecord } from '@prisma/client'

import { zodNanoId8 } from '../validation'

export const personSchema = z.object({
    personId: zodNanoId8,
    name: z.string().min(5).max(100),
    email: z.string().email(),
    owningTeamId: zodNanoId8.nullable(),
    status: z.enum(['Active', 'Inactive'])
})

export type PersonData = z.infer<typeof personSchema>

export function toPersonData(record: PersonRecord): PersonData {
    return {
        personId: record.id,
        name: record.name,
        email: record.email,
        owningTeamId: record.owningTeamId,
        status: record.status
    }
}
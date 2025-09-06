/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Person as PersonRecord } from '@prisma/client'

import { nanoId8 } from '../id'
import { zodNanoId8 } from '../validation'

export const zodPersonId = z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Person ID expected.").brand<'PersonId'>()

export type PersonId = string & z.BRAND<'PersonId'>

export const PersonId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Person ID expected.").brand<'PersonId'>(),

    create: () => nanoId8() as PersonId,

    EMPTY: '' as PersonId,
} as const

export const EMPTY_PERSON_ID = '' as PersonId


export const personSchema = z.object({
    personId: PersonId.schema,
    name: z.string().min(5).max(100),
    email: z.string().email(),
    owningTeamId: zodNanoId8.nullable(),
    type: z.enum(['Normal', 'Sandbox']),
    status: z.enum(['Active', 'Inactive']),
})

export type PersonData = z.infer<typeof personSchema>

export function toPersonData(record: PersonRecord): PersonData {
    return personSchema.parse({
        personId: record.id,
        name: record.name,
        email: record.email,
        owningTeamId: record.owningTeamId,
        type: record.type,
        status: record.status,
    })
}

export const personRefSchema = z.object({
    personId: PersonId.schema,
    name: z.string().min(5).max(100),
    email: z.string().email(),
})

export type PersonRef = z.infer<typeof personRefSchema>

export function toPersonRef(record: Pick<PersonRecord, 'id' | 'name' | 'email'>): PersonRef {
    return personRefSchema.parse({
        personId: record.id,
        name: record.name,
        email: record.email,
    })
}
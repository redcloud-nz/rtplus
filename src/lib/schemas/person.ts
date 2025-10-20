/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Person as PersonRecord } from '@prisma/client'

import { nanoId8 } from '../id'
import { propertiesSchema, recordStatusSchema, tagsSchema } from '../validation'

import { UserId } from './user'

export type PersonId = string & z.BRAND<'PersonId'>

export const PersonId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Person ID expected.").brand<'PersonId'>(),

    create: () => PersonId.schema.parse(nanoId8()),
} as const


export const personSchema = z.object({
    personId: PersonId.schema,
    userId: UserId.schema.nullable(),
    name: z.string().min(5).max(100),
    email: z.string().email(),
    tags: tagsSchema,
    properties: propertiesSchema,
    status: recordStatusSchema
})

export type PersonData = z.infer<typeof personSchema>

export function toPersonData(record: PersonRecord): PersonData {
    return personSchema.parse(record)
}


export const personRefSchema = z.object({
    personId: PersonId.schema,
    name: z.string().min(5).max(100),
    email: z.string().email(),
    status: recordStatusSchema
})

export type PersonRef = z.infer<typeof personRefSchema>

export function toPersonRef(record: Pick<PersonRecord, 'personId' | 'name' | 'email' | 'status'>): PersonRef {
    return personRefSchema.parse(record)
}
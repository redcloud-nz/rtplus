/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Note as NoteRecord } from '@prisma/client'

import { nanoId8 } from '../id'
import { propertiesSchema, tagsSchema } from '../validation'


export type NoteId = string & z.BRAND<'NoteId'>

export const NoteId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Note ID expected.").brand<'NoteId'>(),

    create: () => NoteId.schema.parse(nanoId8()),
} as const

export const noteSchema = z.object({
    noteId: NoteId.schema,
    title: z.string().nonempty().max(100), // Reasonable limit for note title
    content: z.string().max(10000), // Reasonable limit for note content
    tags: tagsSchema,
    properties: propertiesSchema,
    status: z.enum(['Draft', 'Published', 'Deleted']),
})


export type NoteData = z.infer<typeof noteSchema>

export function toNoteData(record: NoteRecord): NoteData {
    return noteSchema.parse(record)
}
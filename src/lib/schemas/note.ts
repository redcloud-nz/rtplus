/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Note as NoteRecord } from '@prisma/client'

import { propertiesSchema, tagsSchema, zodNanoId8 } from '../validation'

export type NoteId = string & z.BRAND<'NoteId'>

export const NoteId = {
    schema: z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "8 character Note ID expected.").brand<'NoteId'>(),

    create: () => zodNanoId8.parse(zodNanoId8) as NoteId,
} as const

export const noteSchema = z.object({
    noteId: NoteId.schema,
    title: z.string().min(1).max(100), // Reasonable limit for note title
    content: z.string().min(1).max(10000), // Reasonable limit for note content
    date: z.string().length(10), // Fixed length for date (YYYY-MM-DD)
    tags: tagsSchema,
    properties: propertiesSchema,
})


export type NoteData = z.infer<typeof noteSchema>

export function toNoteData(record: NoteRecord): NoteData {
    return noteSchema.parse(record)
}

/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Note as NoteRecord } from '@prisma/client'

import { zodNanoId8 } from '../validation'

export const noteSchema = z.object({
    noteId: zodNanoId8,
    personId: zodNanoId8.nullable(),
    teamId: zodNanoId8.nullable(),
    title: z.string().min(1).max(100), // Reasonable limit for note title
    content: z.string().min(1).max(10000), // Reasonable limit for note content
    date: z.string().length(10), // Fixed length for date (YYYY-MM-DD)
})


export type NoteData = z.infer<typeof noteSchema>

export function toNoteData(record: NoteRecord): NoteData {
    return {
        noteId: record.id,
        personId: record.personId,
        teamId: record.teamId,
        title: record.title,
        content: record.content,
        date: record.date,
    }
}

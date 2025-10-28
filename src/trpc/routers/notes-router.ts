/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { diffLines } from 'diff'
import { z } from 'zod'

import { Note as NoteRecord } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { NoteData, NoteId, noteSchema, toNoteData } from '@/lib/schemas/note'

import { toUserRef } from '@/lib/schemas/user'
import { updateMetaSchema } from '@/lib/schemas/update-meta'

import {  AuthenticatedOrgContext, createTRPCRouter, orgProcedure } from '../init'
import { Messages } from '../messages'


/**
 * TRPC router for notes management.
 */
export const notesRouter = createTRPCRouter({

    /**
     * Create a new note.
     * @param input - Note data
     * @returns The created note.
     */
    createNote: orgProcedure
        .input(noteSchema)
        .output(noteSchema)
        .mutation(async ({ ctx, input }) => {

            const changes = diffLines("---\n---\n", toDiffableFormat(input))

            const createdNote = await ctx.prisma.note.create({
                data: {
                    noteId: input.noteId,
                    orgId: ctx.auth.activeOrg.orgId,
                    title: input.title,
                    content: input.content,
                    tags: input.tags,
                    properties: input.properties,
                    status: input.status,
                    changeLogs: {
                        create: {
                            userId: ctx.auth.userId,
                            event: 'Create',
                            changes: changes as object[],
                        }
                    }
                }
            })

            return toNoteData(createdNote)
        }),

    /**
     * Mark a note as deleted.
     * @param input - The ID of the note to delete.
     * @returns The deleted note.
     * @throws TRPCError(NOT_FOUND) - If the note does not exist.
     */
    deleteNote: orgProcedure
        .input(z.object({
            noteId: NoteId.schema,
        }))
        .output(noteSchema)
        .mutation(async ({ input, ctx }) => {

            const note = toNoteData(await getNoteById(ctx, input.noteId))

            const noteWithStatusDeleted: NoteData = { ...note, status: 'Deleted' }

            const changes = diffLines(toDiffableFormat(note), toDiffableFormat(noteWithStatusDeleted))

            if(!note) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.noteNotFound(input.noteId) })

            await ctx.prisma.note.update({
                where: {
                    orgId: ctx.auth.activeOrg.orgId,
                    noteId: input.noteId,
                },
                data: {
                    status: 'Deleted',
                    changeLogs: {
                        create: {
                            userId: ctx.auth.userId,
                            event: 'Delete',
                            changes: changes as object[],
                        }
                    }
                },

            })
            return noteWithStatusDeleted
        }),

    /**
     * Get a note by ID.
     * @param input - The ID of the note to retrieve.
     * @returns The requested note.
     * @throws TRPCError(NOT_FOUND) - If the note does not exist.
     */
    getNote: orgProcedure
        .input(z.object({
            noteId: NoteId.schema,
        }))
        .output(noteSchema)
        .query(async ({ input, ctx }) => {
            const note = await getNoteById(ctx, input.noteId)

            if(!note) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.noteNotFound(input.noteId) })

            return toNoteData(note)
        }),

    /**
     * Get all notes for the organization.
     * @returns An array of notes.
     */
    getNotes: orgProcedure
        .output(z.array(noteSchema
            .pick({ noteId: true, title: true, status: true })
            .merge(updateMetaSchema)
        ))
        .query(async ({ ctx }) => {
            const notes = await ctx.prisma.note.findMany({
                where: {
                    orgId: ctx.auth.activeOrg.orgId,
                    status: { not: 'Deleted' },
                },
                include: {
                    changeLogs: {
                        include: {
                            user: {
                                select: { userId: true, name: true }
                            }
                        },
                        orderBy: { timestamp: 'desc' },
                    },
                }
            })
            return notes.map(note => {
                const createLog = note.changeLogs.find(log => log.event === 'Create')
                const updateLog = note.changeLogs.find(log => log.event === 'Update') ?? createLog

                return {
                    ...toNoteData(note),
                    createdAt: createLog ? createLog.timestamp.toISOString() : null,
                    updatedAt: updateLog ? updateLog.timestamp.toISOString() : null,
                    createdBy: createLog?.user ? toUserRef(createLog.user) : null,
                    updatedBy: updateLog?.user ? toUserRef(updateLog.user) : null,
                }
            })
        }),

    /**
     * Update an existing note.
     * @param input - The updated note data.
     * @returns The updated note.
     * @throws TRPCError(NOT_FOUND) - If the note does not exist.
     */
    updateNote: orgProcedure
        .input(noteSchema.pick({ noteId: true, title: true, content: true, properties: true, tags: true, status: true }))
        .output(noteSchema)
        .mutation(async ({ input, ctx }) => {
            const note = toNoteData(await getNoteById(ctx, input.noteId))

            if(!note) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.noteNotFound(input.noteId) })

            const changes = diffLines(toDiffableFormat(note), toDiffableFormat({ ...note, ...input }))

            const updatedNote = await ctx.prisma.note.update({
                where: {
                    orgId: ctx.auth.activeOrg.orgId,
                    noteId: input.noteId,
                },
                data: {
                    title: input.title,
                    content: input.content,
                    properties: input.properties,
                    tags: input.tags,
                    status: input.status,
                    changeLogs: {
                        create: {
                            userId: ctx.auth.userId,
                            event: 'Update',
                            changes: changes as object[],
                        }
                    }
                }
            })

            return toNoteData(updatedNote)
        }),
})


/**
 * Get a note by it's ID.
 * @param ctx The authenticated context.
 * @param noteId The ID of the note to retrieve.
 * @returns The requested note if found.
 * @throws TRPCError if the note is not found.
 */
export async function getNoteById(ctx: AuthenticatedOrgContext, noteId: NoteId): Promise<NoteRecord> {
    const note = await ctx.prisma.note.findUnique({ 
        where: { noteId, orgId: ctx.auth.activeOrg.orgId },
    })
    if(!note) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.noteNotFound(noteId) })
    return note
}


function toDiffableFormat(note: NoteData): string {
    let result = "---\n"

    result += `title: ${note.title}\n`

    result += `status: ${note.status}\n`

    if(note.tags.length > 0) {
        result += `tags:\n`
        for(const tag of note.tags) {
            result += ` - ${tag}\n`
        }
    }
    
    const propEntries = Object.entries(note.properties)
    if(propEntries.length > 0) {

        result += `properties:\n`
        for(const [key, value] of propEntries) {
            result += ` ${key}: ${value}\n`
        }
    }

    result += "---\n\n"
    result += note.content
    return result
}
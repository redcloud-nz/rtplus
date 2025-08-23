/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { noteSchema, toNoteData } from '@/lib/schemas/note'
import { nanoId16 } from '@/lib/id'
import { zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, teamAdminProcedure, teamProcedure } from '../init'


/**
 * Get a note by ID and verify access permissions
 */
async function getNoteById(ctx: AuthenticatedContext, noteId: string) {
    const note = await ctx.prisma.note.findUnique({
        where: { id: noteId },
        include: {
            person: true,
            team: true
        }
    })

    if (!note) throw new TRPCError({ code: 'NOT_FOUND', message: `Note with ID ${noteId} not found.` })

    // Check access permissions
    if (note.personId) {
        // Person note - only accessible by the owner
        if (note.personId !== ctx.personId) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only access your own personal notes.' })
        }
    } else if (note.teamId && note.team) {
        // Team note - accessible by team members
        ctx.requireTeamAccess(note.team.clerkOrgId)
    } else {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Note must be associated with either a person or a team.' })
    }

    return note
}

/**
 * TRPC router for notes management.
 */
export const notesRouter = createTRPCRouter({

    createNote: authenticatedProcedure
        .input(noteSchema.refine(data => !data.personId || !data.teamId, {
            message: 'Note cannot be associated with both a person and a team.'
        }))
        .output(noteSchema)
        .mutation(async ({ input, ctx }) => {
            if (input.personId) {
                // Personal note - only allow creating for oneself
                if (input.personId !== ctx.personId) {
                    throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only create notes for yourself.' })
                }
            } else if (input.teamId) {
                // Team note - requires team admin permission
                const team = await ctx.prisma.team.findUnique({
                    where: { id: input.teamId }
                })
                
                if (!team) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: `Team with ID ${input.teamId} not found.` })
                }
                
                ctx.requireTeamAdmin(team.clerkOrgId)
            } else {
                // If neither personId nor teamId is provided, this is a personal note for the current user
                input = { ...input, personId: ctx.personId }
            }

            const note = await ctx.prisma.note.create({
                data: {
                    id: input.noteId,
                    personId: input.personId || ctx.personId,
                    teamId: input.teamId,
                    content: input.content,
                }
            })

            return toNoteData(note)
        }),

    updateNote: authenticatedProcedure
        .input(noteSchema.pick({ noteId: true, content: true }))
        .output(noteSchema)
        .mutation(async ({ input, ctx }) => {
            const existingNote = await getNoteById(ctx, input.noteId)

            // Check update permissions
            if (existingNote.personId) {
                // Person note - only owner can update
                if (existingNote.personId !== ctx.personId) {
                    throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only update your own personal notes.' })
                }
            } else if (existingNote.teamId && existingNote.team) {
                // Team note - only team admin can update
                ctx.requireTeamAdmin(existingNote.team.clerkOrgId)
            }

            const updatedNote = await ctx.prisma.note.update({
                where: { id: input.noteId },
                data: {
                    content: input.content,
                }
            })

            return toNoteData(updatedNote)
        }),

    deleteNote: authenticatedProcedure
        .input(z.object({
            noteId: zodNanoId8,
        }))
        .output(noteSchema)
        .mutation(async ({ input, ctx }) => {
            const existingNote = await getNoteById(ctx, input.noteId)

            // Check delete permissions
            if (existingNote.personId) {
                // Person note - only owner can delete
                if (existingNote.personId !== ctx.personId) {
                    throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own personal notes.' })
                }
            } else if (existingNote.teamId && existingNote.team) {
                // Team note - only team admin can delete
                ctx.requireTeamAdmin(existingNote.team.clerkOrgId)
            }

            const deletedNote = await ctx.prisma.note.delete({
                where: { id: input.noteId }
            })

            return toNoteData(deletedNote)
        }),

    getNote: authenticatedProcedure
        .input(z.object({
            noteId: zodNanoId8,
        }))
        .output(noteSchema)
        .query(async ({ input, ctx }) => {
            const note = await getNoteById(ctx, input.noteId)
            return toNoteData(note)
        }),

    getPersonalNotes: authenticatedProcedure
        .output(z.array(noteSchema))
        .query(async ({ ctx }) => {
            const notes = await ctx.prisma.note.findMany({
                where: { personId: ctx.personId },
                orderBy: { id: 'desc' } // Most recent first
            })

            return notes.map(toNoteData)
        }),

    getTeamNotes: teamProcedure
        .input(z.object({
            teamId: zodNanoId8,
        }))
        .output(z.array(noteSchema))
        .query(async ({ input, ctx }) => {
            

            const notes = await ctx.prisma.note.findMany({
                where: { teamId: input.teamId },
                orderBy: { id: 'desc' } // Most recent first
            })

            return notes.map(toNoteData)
        }),
})
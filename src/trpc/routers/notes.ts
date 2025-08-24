/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { noteSchema, toNoteData } from '@/lib/schemas/note'
import { zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, teamProcedure } from '../init'


/**
 * TRPC router for notes management.
 */
export const notesRouter = createTRPCRouter({

    /**
     * Create a new note.
     * @param input - Note data including personId or teamId.
     * @returns The created note.
     * @throws TRPCError(BAD_REQUEST) - If both personId and teamId are provided.
     * @throws TRPCError(FORBIDDEN) - If the user does not have permission to create the note.
     */
    createNote: authenticatedProcedure
        .input(noteSchema)
        .output(noteSchema)
        .mutation(async ({ ctx, input }) => {

            if(input.personId && input.teamId) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Note cannot be associated with both a person and a team.' })
            } else if (input.personId) {
                // Personal note - only allow creating for oneself
                if (input.personId !== ctx.session.personId) {
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
                input = { ...input, personId: ctx.session.personId }
            }

            const note = await ctx.prisma.note.create({
                data: {
                    id: input.noteId,
                    personId: input.personId || ctx.session.personId,
                    teamId: input.teamId,
                    title: input.title,
                    content: input.content,
                    date: input.date,
                }
            })

            return toNoteData(note)
        }),

    /**
     * Delete an existing note.
     * @param input - The ID of the note to delete.
     * @returns The deleted note.
     * @throws TRPCError(NOT_FOUND) - If the note does not exist.
     * @throws TRPCError(FORBIDDEN) - If the user does not have permission to delete the note.
     */
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
                if (existingNote.personId !== ctx.session.personId) {
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

    /**
     * Get a note by ID.
     * @param input - The ID of the note to retrieve.
     * @returns The requested note.
     * @throws TRPCError(NOT_FOUND) - If the note does not exist.
     */
    getNote: authenticatedProcedure
        .input(z.object({
            noteId: zodNanoId8,
            personId: zodNanoId8.optional(),
            teamId: zodNanoId8.optional(),
        }))
        .output(noteSchema)
        .query(async ({ input, ctx }) => {
            const note = await getNoteById(ctx, input.noteId, {
                personId: input.personId,
                teamId: input.teamId
            })
            return toNoteData(note)
        }),

    /**
     * Get personal notes for the current user.
     * @returns An array of personal notes.
     */
    getPersonalNotes: authenticatedProcedure
        .output(z.array(noteSchema))
        .query(async ({ ctx }) => {
            const notes = await ctx.prisma.note.findMany({
                where: { personId: ctx.session.personId },
                orderBy: { date: 'desc' } // Most recent first
            })

            return notes.map(toNoteData)
        }),

    /**
     * Get team notes for a specific team.
     * @param input - The ID of the team to retrieve notes for.
     * @returns An array of team notes.
     */
    getTeamNotes: teamProcedure
        .input(z.object({
            teamId: zodNanoId8,
        }))
        .output(z.array(noteSchema))
        .query(async ({ input, ctx }) => {
            
            const notes = await ctx.prisma.note.findMany({
                where: { teamId: input.teamId },
                orderBy: { date: 'desc' } // Most recent first
            })

            return notes.map(toNoteData)
        }),

    /**
     * Update an existing note.
     * @param input - The updated note data.
     * @returns The updated note.
     * @throws TRPCError(NOT_FOUND) - If the note does not exist.
     * @throws TRPCError(FORBIDDEN) - If the user does not have permission to update the note.
     */
    updateNote: authenticatedProcedure
        .input(noteSchema.pick({ noteId: true, title: true, content: true, date: true }))
        .output(noteSchema)
        .mutation(async ({ input, ctx }) => {
            const existingNote = await getNoteById(ctx, input.noteId)

            // Check update permissions
            if (existingNote.personId) {
                // Person note - only owner can update
                if (existingNote.personId !== ctx.session.personId) {
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
})


/**
 * Get a note by ID and verify access permissions
 */
async function getNoteById(ctx: AuthenticatedContext, noteId: string, filters: { personId?: string; teamId?: string } = {}) {
    const note = await ctx.prisma.note.findUnique({
        where: { id: noteId, ...filters },
        include: {
            person: true,
            team: true
        }
    })

    if (!note) throw new TRPCError({ code: 'NOT_FOUND', message: `Note with ID ${noteId} not found.` })

    // Check access permissions
    if (note.personId) {
        // Person note - only accessible by the owner
        if (note.personId !== ctx.session.personId) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only access your own personal notes.' })
        }
    } else if (note.teamId && note.team) {
        // Team note - accessible by team members
        ctx.hasTeamAccess(note.team.clerkOrgId)
    } else {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Note must be associated with either a person or a team.' })
    }

    return note
}
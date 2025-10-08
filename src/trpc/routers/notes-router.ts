/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { noteSchema } from '@/lib/schemas/note'
import { zodNanoId8 } from '@/lib/validation'

import {  authenticatedProcedure, createTRPCRouter, orgProcedure } from '../init'


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

            throw new TRPCError({ code: 'SERVICE_UNAVAILABLE', message: 'Notes feature is not available yet.' })
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

            throw new TRPCError({ code: 'SERVICE_UNAVAILABLE', message: 'Notes feature is not available yet.' })

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
            throw new TRPCError({ code: 'SERVICE_UNAVAILABLE', message: 'Notes feature is not available yet.' })
        }),

    /**
     * Get personal notes for the current user.
     * @returns An array of personal notes.
     */
    getPersonalNotes: authenticatedProcedure
        .output(z.array(noteSchema))
        .query(async ({ ctx }) => {
            throw new TRPCError({ code: 'SERVICE_UNAVAILABLE', message: 'Notes feature is not available yet.' })
        }),

    /**
     * Get team notes for a specific team.
     * @param input - The ID of the team to retrieve notes for.
     * @returns An array of team notes.
     */
    getTeamNotes: orgProcedure
        .output(z.array(noteSchema))
        .query(async ({ input, ctx }) => {
            
            throw new TRPCError({ code: 'SERVICE_UNAVAILABLE', message: 'Notes feature is not available yet.' })
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
            throw new TRPCError({ code: 'SERVICE_UNAVAILABLE', message: 'Notes feature is not available yet.' })
        }),
})



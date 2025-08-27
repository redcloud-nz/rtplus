/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { Person as PersonRecord, Team as TeamRecord } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { personSchema, toPersonData } from '@/lib/schemas/person'
import { nanoId16 } from '@/lib/id'
import { sandboxEmailOf } from '@/lib/sandbox'
import { zodRecordStatus, zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, teamAdminProcedure } from '../init'
import { Messages } from '../messages'
import { FieldConflictError } from '../types'
import { getActiveTeam } from './teams'



/**
 * TRPC router for personnel management.
 */
export const personnelRouter = createTRPCRouter({

    /**
     * Creates a new person in the system.
     * If the user is not a system admin, the owning team ID is set to the active team.
     * @param ctx The authenticated context.
     * @param input The input object containing the person data.
     * @returns The created person object.
     * @throws TRPCError(CONFLICT) if a person with the same email already exists.
     */
    createPerson: teamAdminProcedure
        .input(personSchema)
        .output(personSchema)
        .mutation(async ({ ctx, input: { personId, ...input } }) => {

            // Set the owning team (if applicable)
            if(!ctx.isSystemAdmin) {
                const team = await getActiveTeam(ctx)
                input.owningTeamId = team.id
            }

            if(input.type == 'Sandbox') {
                input.email = `${input.name.replace(/\s+/g, '.').toLowerCase()}@example.com`
            }

            // Check if a person with the same email already exists
            const emailConflict = await ctx.prisma.person.findFirst({ where: { email: input.email } })
            if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists.', cause: new FieldConflictError('email') })

            const created = await ctx.prisma.person.create({
                data: {
                    id: personId,
                    ...input,
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            actorId: ctx.session.personId,
                            event: 'Create',
                            fields: { ...input }
                        }
                    }
                }
            })
            
            return toPersonData(created)
        }),

    /**
     * Delete a person from the system.
     * @param ctx The authenticated context.
     * @param input The input object containing the personId.
     * @returns The deleted person object.
     * @throws TRPCError(NOT_FOUND) if the person is not found.
     * @throws TRPCError(FORBIDDEN) if the user does not have permission to delete the person.
     */
    deletePerson: teamAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
        }))
        .output(personSchema)
        .mutation(async ({ ctx, input: { personId }  }) => {
            
            const person = await getPersonById(ctx, personId)
            if(person == null) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.personNotFound(personId) })

            if(person.owningTeam) {
                if(!ctx.hasTeamAdmin(person.owningTeam)) throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this person.' })
            } else {
                if(!ctx.isSystemAdmin) throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this person.' })
            }
            
            const deleted = await ctx.prisma.person.delete({ where: { id: person.id } })

            if(deleted.clerkUserId) {
                // Delete the associated Clerk user
                await ctx.clerkClient.users.deleteUser(deleted.clerkUserId)
            }
            
            return toPersonData(deleted)
        }),

    /**
     * Retrieves a person by their ID or email.
     * @param ctx The authenticated context.
     * @param input The input object containing either personId or email.
     * @returns The person object if found.
     * @throws TRPCError(NOT_FOUND) if the person is not found.
     */
    getPerson: authenticatedProcedure
        .input(z.object({ 
            personId: zodNanoId8.optional(),
            email: z.string().email().optional(),
        }).refine(data => data.personId || data.email, {
            message: 'Either personId or email must be provided.'
        }))
        .output(personSchema)
        .query(async ({ ctx, input: { personId, email} }) => {

            if(personId) {
                const person = await getPersonById(ctx, personId)
                if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.personNotFound(personId) })
                return toPersonData(person)

            } else if(email) {
                const person = await ctx.prisma.person.findUnique({ 
                    where: { email: email }, 
                    include: { owningTeam: true }
                })

                if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person with email ${email} not found.` })
                return toPersonData(person)

            } else {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' })
            }
        }),

    getPersonnel: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus,
            isUser: z.boolean().optional(),
            type: z.array(z.enum(['Normal', 'Sandbox'])).optional().default(['Normal']),
        }))
        .output(z.array(personSchema))
        .query(async ({ ctx, input }) => {
            const found = await ctx.prisma.person.findMany({
                where: { 
                    status: { in: input.status },
                    clerkUserId: input.isUser ? { not: null } : undefined,
                    type: input.type.length > 0 ? { in: input.type } : undefined
                },
                orderBy: { name: 'asc' }
            })
            return found.map(toPersonData)
        }),

    /**
     * Updates an existing person.
     * @param ctx The authenticated context.
     * @param input The data to update the person with.
     * @returns The updated person object.
     * @throws TRPCError(CONFLICT) If a person with the new email already exists.
     * @throws TRPCError(NOT_FOUND) If the person to update is not found.
     */
    updatePerson: teamAdminProcedure
        .input(personSchema.omit({ type: true }))
        .output(personSchema)
        .mutation(async ({ ctx, input: { personId, ...update } }) => {

            const person = await getPersonById(ctx, personId)
            if(person == null) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.personNotFound(personId) })

            if(person.owningTeam) {
                if(!ctx.hasTeamAdmin(person.owningTeam)) throw new TRPCError({ code: 'FORBIDDEN', message: `You do not have permission to update Person(${personId}).` })
            } else {
                if(!ctx.isSystemAdmin) throw new TRPCError({ code: 'FORBIDDEN', message: `You do not have permission to update Person(${personId}).` })
            }

            if(person.type == 'Sandbox') {
                // Sandbox personnel have fake email addresses derived from their name
                update.email = sandboxEmailOf(update.name)
            }

            if(update.email != person.email) {
                // Check if a person with the new email already exists
                const emailConflict = await ctx.prisma.person.findFirst({ where: { email: update.email } })
                if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists.', cause: new FieldConflictError('email') })
            }
            
            // Pick only the fields that have changed
            const changedFields = pickBy(update, (value, key) => value != person[key])

            const updated = await ctx.prisma.person.update({
                where: { id: personId },
                data: {
                    ...update,
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            actorId: ctx.session.personId,
                            event: 'Update',
                            fields: changedFields
                        }
                    }
                }
            })

            return toPersonData(updated)
        }),
        
})


/**
 * Retrieves a person by their ID.
 * @param ctx The authenticated context.
 * @param personId The ID of the person to retrieve.
 * @returns The person object if found.
 */
export async function getPersonById(ctx: AuthenticatedContext, personId: string): Promise<PersonRecord & { owningTeam: TeamRecord | null } | null> {
    const person = await ctx.prisma.person.findUnique({ 
        where: { id: personId },
        include: { owningTeam: true }
    })
    return person
}
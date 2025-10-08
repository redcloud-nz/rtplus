/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pick, pickBy, pipe } from 'remeda'
import { z } from 'zod'

import { Person as PersonRecord } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { personSchema, toPersonData } from '@/lib/schemas/person'
import { nanoId16 } from '@/lib/id'
import { zodRecordStatus, zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, AuthenticatedOrgContext, createTRPCRouter, orgAdminProcedure, orgProcedure } from '../init'
import { Messages } from '../messages'
import { FieldConflictError } from '../types'



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
    createPerson: orgAdminProcedure
        .input(personSchema)
        .output(personSchema)
        .mutation(async ({ ctx, input: { personId, ...fields } }) => {

            // Check for conflicts
            const [personIdConflict, emailConflict] = await Promise.all([
                ctx.prisma.person.findUnique({ where: { personId } }),
                ctx.prisma.person.findFirst({ where: { orgId: ctx.auth.activeOrg.orgId, email: fields.email } })
            ])

            if(personIdConflict) throw new TRPCError({ code: 'CONFLICT', message: `A person with ID ${personId} already exists.`, cause: new FieldConflictError('personId') })
            
            if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists in this organisation.', cause: new FieldConflictError('email') })

            const created = await ctx.prisma.person.create({
                data: {
                    personId,
                    orgId: ctx.auth.activeOrg.orgId,
                    ...fields,
                    changeLogs: {
                        create: {
                            actorId: ctx.auth.userId,
                            event: 'Create',
                            fields: { ...fields }
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
    deletePerson: orgAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
        }))
        .output(personSchema)
        .mutation(async ({ ctx, input: { personId }  }) => {
            
            const person = await getPersonById(ctx, personId)
            if(person == null) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.personNotFound(personId) })

            
            const deleted = await ctx.prisma.person.delete({ where: { personId } })
            
            console.log(`Person deleted by ${ctx.auth.userId}:`, pick(deleted, ['personId', 'name', 'email']))
            return toPersonData(deleted)
        }),

    /**
     * Retrieves a person by their ID
     * @param ctx The authenticated context.
     * @param input The input object containing either personId or email.
     * @returns The person object if found.
     * @throws TRPCError(NOT_FOUND) if the person is not found.
     */
    getPerson: orgProcedure
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
                const person = await ctx.prisma.person.findFirst({ 
                    where: { email: email, orgId: ctx.auth.activeOrg.orgId },
                })

                if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person with email ${email} not found.` })
                return toPersonData(person)

            } else {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' })
            }
        }),

    /**
     * Get all personnel in the active organization with the specified status.
     * @param ctx The authenticated context.
     * @param input The input object containing the status filter.
     * @returns An array of person objects.
     */
    getPersonnel: orgProcedure
        .input(z.object({
            status: zodRecordStatus,
        }))
        .output(z.array(personSchema))
        .query(async ({ ctx, input }) => {
            const found = await ctx.prisma.person.findMany({
                where: { 
                    orgId: ctx.auth.activeOrg.orgId,
                    status: { in: input.status },
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
    updatePerson: orgAdminProcedure
        .input(personSchema)
        .output(personSchema)
        .mutation(async ({ ctx, input: { personId, ...fields} }) => {

            const person = await getPersonById(ctx, personId)
            if(person == null) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.personNotFound(personId) })


            if(fields.email != person.email) {
                // Check if a person with the new email already exists
                const emailConflict = await ctx.prisma.person.findFirst({ where: { email: fields.email, orgId: ctx.auth.activeOrg.orgId } })
                if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists in this organisation.', cause: new FieldConflictError('email') })
            }
            
            // Pick only the fields that have changed
            const changedFields = pipe(fields, pick(['name', 'email', 'status']), pickBy((value, key) => value != person[key]))

            const updated = await ctx.prisma.person.update({
                where: { personId },
                data: {
                    ...fields,
                    changeLogs: {
                        create: {
                            actorId: ctx.auth.userId,
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
export async function getPersonById(ctx: AuthenticatedOrgContext, personId: string): Promise<PersonRecord | null> {
    const person = await ctx.prisma.person.findUnique({ 
        where: { personId, orgId: ctx.auth.activeOrg.orgId },
    })
    return person
}
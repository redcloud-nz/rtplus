/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pick } from 'remeda'
import { z } from 'zod'

import { Person as PersonRecord } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { diffObject } from '@/lib/diff'
import { PersonId, personSchema, toPersonData } from '@/lib/schemas/person'
import { UserId } from '@/lib/schemas/user'
import { recordStatusParameterSchema } from '@/lib/validation'
import { revalidatePerson } from '@/server/person'

import { AuthenticatedOrgContext, createTRPCRouter, orgAdminProcedure, orgProcedure } from '../init'
import { Messages } from '../messages'
import { FieldConflictError } from '../types'





/**
 * TRPC router for personnel management.
 */
export const personnelRouter = createTRPCRouter({

    /**
     * Creates a new person in the organization.
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
            const [personIdConflict, emailConflict, userIdConflict] = await Promise.all([
                ctx.prisma.person.findFirst({ where: { personId } }),
                ctx.prisma.person.findFirst({ where: { orgId: ctx.auth.activeOrg.orgId, email: fields.email } }),
                ctx.prisma.person.findFirst({ where: { orgId: ctx.auth.activeOrg.orgId, userId: fields.userId } })
            ])

            if(personIdConflict) throw new TRPCError({ code: 'CONFLICT', message: `A person with ID ${personId} already exists.`, cause: new FieldConflictError('personId') })

            if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists in this organization.', cause: new FieldConflictError('email') })

            if(fields.userId && userIdConflict) throw new TRPCError({ code: 'CONFLICT', message: `A person with user ID ${fields.userId} already exists in this organization.`, cause: new FieldConflictError('userId') })

            const changes = diffObject({ tags: [], properties: [], status: 'Active' }, fields)

            const created = await ctx.prisma.person.create({
                data: {
                    personId,
                    ...fields,
                    changeLogs: {
                        create: {
                            userId: ctx.auth.userId,
                            event: 'Create',
                            changes: changes as object[]
                        }
                    }
                }
            })
            
            return toPersonData(created)
        }),

    /**
     * Delete a person from the organization.
     * @param ctx The authenticated context.
     * @param input The input object containing the personId.
     * @returns The deleted person object.
     * @throws TRPCError(NOT_FOUND) if the person is not found.
     * @throws TRPCError(FORBIDDEN) if the user does not have permission to delete the person.
     */
    deletePerson: orgAdminProcedure
        .input(z.object({
            personId: PersonId.schema,
        }))
        .output(personSchema)
        .mutation(async ({ ctx, input: { personId }  }) => {
            
            // Ensure the person exists and belongs to the organization
            await getPersonById(ctx, personId)

            const deleted = await ctx.prisma.person.delete({ where: { orgId: ctx.auth.activeOrg.orgId, personId } })

            console.log(`Person deleted by ${ctx.auth.userId}:`, pick(deleted, ['personId', 'name', 'email']))
            return toPersonData(deleted)
        }),

    /**
     * Get the person record for the current authenticated user.
     * @param ctx The authenticated context.
     * @returns The person object for the current user or null if there is no person associated with the current user.
     */
    getCurrentPerson: orgProcedure
        .output(personSchema.nullable())
        .query(async ({ ctx }) => {
            const person = await ctx.prisma.person.findFirst({
                where: {
                    orgId: ctx.auth.activeOrg.orgId,
                    userId: ctx.auth.userId,
                }
            })
            return person ? toPersonData(person) : null
        }),

    /**
     * Retrieves a person by their personId, email, or userId.
     * @param ctx The authenticated context.
     * @param input The input object containing either personId, email, or userId.
     * @returns The person object if found.
     * @throws TRPCError(NOT_FOUND) if the person is not found.
     */
    getPerson: orgProcedure
        .input(z.object({ 
            personId: PersonId.schema.optional(),
            email: z.string().email().optional(),
            userId: UserId.schema.optional(),
        }).refine(data => data.personId || data.email || data.userId, {
            message: 'One of personId, email, or userId must be provided.'
        }))
        .output(personSchema)
        .query(async ({ ctx, input: { personId, email, userId } }) => {

            if(personId) {
                const person = await getPersonById(ctx, personId)
                return toPersonData(person)

            } else if(email) {
                const person = await ctx.prisma.person.findFirst({ 
                    where: { email: email, orgId: ctx.auth.activeOrg.orgId },
                })

                if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person with email ${email} not found.` })
                return toPersonData(person)

            } else if(userId) {
                const person = await ctx.prisma.person.findFirst({ 
                    where: { userId: userId, orgId: ctx.auth.activeOrg.orgId },
                })

                if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person with user ID ${userId} not found.` })
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
            status: recordStatusParameterSchema,
            isUser: z.boolean().optional(),
        }))
        .output(z.array(personSchema))
        .query(async ({ ctx, input }) => {
            const found = await ctx.prisma.person.findMany({
                where: { 
                    orgId: ctx.auth.activeOrg.orgId,
                    status: { in: input.status },
                    userId: input.isUser ? { not: null } : undefined,
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

            const existing = await getPersonById(ctx, personId)

            if(fields.email != existing.email) {
                // Check if a person with the new email already exists
                const emailConflict = await ctx.prisma.person.findFirst({ where: { email: fields.email, orgId: ctx.auth.activeOrg.orgId } })
                if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists in this organisation.', cause: new FieldConflictError('email') })
            }

            if(fields.userId && fields.userId != existing.userId) {
                // Check if a person with the new userId already exists
                const userIdConflict = await ctx.prisma.person.findFirst({ where: { userId: fields.userId, orgId: ctx.auth.activeOrg.orgId } })
                if(userIdConflict) throw new TRPCError({ code: 'CONFLICT', message: `A person with user ID ${fields.userId} already exists in this organization.`, cause: new FieldConflictError('userId') })
            }

            const changes = diffObject(personSchema.omit({ personId: true }).parse(existing), fields)

            if(changes.length == 0) return toPersonData(existing) // No changes
            const updated = await ctx.prisma.person.update({
                where: { orgId: ctx.auth.activeOrg.orgId,personId },
                data: {
                    ...fields,
                    changeLogs: {
                        create: {
                            userId: ctx.auth.userId,
                            event: 'Update',
                            changes: changes as object[]
                        }
                    }
                }
            })

            revalidatePerson(personId)

            return toPersonData(updated)
        }),
        
})


/**
 * Retrieves a person by their ID.
 * @param ctx The authenticated context.
 * @param personId The ID of the person to retrieve.
 * @returns The person object if found.
 */
export async function getPersonById(ctx: AuthenticatedOrgContext, personId: PersonId): Promise<PersonRecord> {
    const person = await ctx.prisma.person.findUnique({ 
        where: { personId, orgId: ctx.auth.activeOrg.orgId },
    })
    if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.personNotFound(personId) })
    return person
}
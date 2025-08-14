/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { Person as PersonRecord, Team as TeamRecord } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { PersonData, personSchema } from '@/lib/schemas/person'
import { nanoId16 } from '@/lib/id'
import { zodRecordStatus, zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, systemAdminProcedure } from '../init'
import { FieldConflictError } from '../types'


/**
 * TRPC router for personnel management.
 */
export const personnelRouter = createTRPCRouter({

    createPerson: systemAdminProcedure
        .input(personSchema)
        .output(personSchema)
        .mutation(async ({ input, ctx }) => {

            const person = await createPerson(ctx, input)
            
            return { personId: person.id, ...person }
        }),

    deletePerson: systemAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
        }))
        .output(personSchema)
        .mutation(async ({ input, ctx }) => {
            
            const person = await getPersonById(ctx, input.personId)
            if(person?.owningTeam) {
                ctx.requireTeamAdmin(person.owningTeam.clerkOrgId)
            } else ctx.requireSystemAdmin()
            
            const deleted = await deletePerson(ctx, person)
            return { personId: person.id, ...deleted }
        }),

    getPerson: systemAdminProcedure
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
                return { personId: person.id, ...person }

            } else if(email) {
                const person = await ctx.prisma.person.findUnique({ 
                    where: { email: email }, 
                    include: { owningTeam: true }
                })

                if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person with email ${email} not found.` })
                return { personId: person.id, ...person }

            } else {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' })
            }
        }),

    getPersonnel: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus
        }))
        .output(z.array(personSchema))
        .query(async ({ ctx, input }) => {
            const found = await ctx.prisma.person.findMany({ 
                where: { status: { in: input.status } },
                select: { id: true, name: true, email: true, owningTeamId: true, status: true },
                orderBy: { name: 'asc' }
            })
            return found.map(person => ({ personId: person.id, ...person, }))
        }),

    updatePerson: systemAdminProcedure
        .input(personSchema)
        .output(personSchema)
        .mutation(async ({ input, ctx }) => {

            const person = await getPersonById(ctx, input.personId)

            const updatedPerson = await updatePerson(ctx, person, input)
            return { personId: person.id, ...updatedPerson }
        }),
        
})


/**
 * Retrieves a person by their ID.
 * @param ctx The authenticated context.
 * @param personId The ID of the person to retrieve.
 * @returns The person object if found.
 * @throws TRPCError if the person is not found.
 */
export async function getPersonById(ctx: AuthenticatedContext, personId: string): Promise<PersonRecord & { owningTeam: TeamRecord | null }> {
    const person = await ctx.prisma.person.findUnique({ 
        where: { id: personId },
        include: { owningTeam: true }
    })
    if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person with ID ${personId} not found.` })
    return person
}

/**
 * Creates a new person in the system.
 * @param ctx The authenticated context.
 * @param input The input data for the new person.
 * @returns The created person object.
 * @throws TRPCError if a person with the same email already exists.
 */
export async function createPerson(ctx: AuthenticatedContext, {personId, ...input }: PersonData): Promise<PersonRecord> {
    
    // Check if a person with the same email already exists
    const emailConflict = await ctx.prisma.person.findFirst({ where: { email: input.email } })
    if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists.', cause: new FieldConflictError('email') })

    return ctx.prisma.person.create({
        data: {
            id: personId,
            ...input,
            changeLogs: {
                create: {
                    id: nanoId16(),
                    actorId: ctx.personId,
                    event: 'Create',
                    fields: { ...input }
                }
            }
        }
    })
}

/**
 * Updates an existing person in the system.
 * @param ctx The authenticated context.
 * @param person The person object to update.
 * @param update The data to update the person with.
 * @returns The updated person object.
 * @throws TRPCError If a person with the new email already exists.
 */
export async function updatePerson(ctx: AuthenticatedContext, person: PersonRecord, { personId, ...update }: PersonData): Promise<PersonRecord> {

    if(update.email != person.email) {
        // Check if a person with the new email already exists
        const emailConflict = await ctx.prisma.person.findFirst({ where: { email: update.email } })
        if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists.', cause: new FieldConflictError('email') })
    }

    // Pick only the fields that have changed
    const changedFields = pickBy(update, (value, key) => value != person[key])

    return ctx.prisma.person.update({
        where: { id: personId },
        data: {
            ...update,
            changeLogs: {
                create: {
                    id: nanoId16(),
                    actorId: ctx.personId,
                    event: 'Update',
                    fields: changedFields
                }
            }
        }
    })
}

/**
 * Deletes a person from the system.
 * @param ctx The authenticated context.
 * @param person The person object to delete.
 * @returns The deleted person object.
 * @throws TRPCError if the person is not found.
 */
export async function deletePerson(ctx: AuthenticatedContext, person: PersonRecord): Promise<PersonRecord> {

    const deleted = await ctx.prisma.person.delete({ where: { id: person.id } })

    if(deleted.clerkUserId) {
        // Delete the associated Clerk user
        await ctx.clerkClient.users.deleteUser(deleted.clerkUserId)
    }

    return deleted
}
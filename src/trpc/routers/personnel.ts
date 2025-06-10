/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pick, pickBy } from 'remeda'
import { z } from 'zod'

import { Person } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { personFormSchema, SystemPersonFormData, systemPersonFormSchema } from '@/lib/forms/person'
import { nanoId16 } from '@/lib/id'
import { zodRecordStatus, zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, systemAdminProcedure, teamAdminProcedure } from '../init'
import { FieldConflictError, PersonBasic } from '../types'
import { getActiveTeam } from './teams'


/**
 * TRPC router for personnel management.
 */
export const personnelRouter = createTRPCRouter({
    access: {
        byId: systemAdminProcedure
            .input(z.object({ personId: zodNanoId8 }))
            .query(async ({ input, ctx }) => {
                const person = await ctx.prisma.person.findUnique({ where: { id: input.personId } })
                if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person(${input.personId}) not found.` })

                return {
                    id: person.id,
                    clerkInvitationId: person.clerkInvitationId,
                    clerkUserId: person.clerkUserId,
                    inviteStatus: person.inviteStatus,
                }
            }),

        invite: systemAdminProcedure
            .input(z.object({ personId: zodNanoId8, resend: z.boolean().optional().default(false) }))
            .mutation(async ({ input, ctx }) => {
                const person = await getPersonById(ctx, input.personId)

                if(person.inviteStatus != 'None') throw new TRPCError({ code: 'BAD_REQUEST', message: `Person(${input.personId}) has already been invited to Clerk.` })

                const invitation = await ctx.clerkClient.invitations.createInvitation({
                    emailAddress: person.email,
                    publicMetadata: {
                        person_id: person.id,
                        onboarding_status: 'Invited'
                    },
                    notify: true,
                    ignoreExisting: input.resend,
                })

                await ctx.prisma.person.update({ 
                    where: { id: input.personId },
                    data: {
                        clerkInvitationId: invitation.id, 
                        inviteStatus: 'Invited'
                    }
                })
            }),
    },
    all: systemAdminProcedure
        .input(z.object({
            status: zodRecordStatus
        }).optional().default({}))
        .query(async ({ ctx, input }): Promise<PersonBasic[]> => {
            return ctx.prisma.person.findMany({ 
                where: { status: { in: input.status } },
                select: { id: true, name: true, email: true, status: true },
                orderBy: { name: 'asc' }
            })
        }),

    byId: authenticatedProcedure
        .input(z.object({ 
            personId: zodNanoId8
        }))
        .query(async ({ input, ctx }): Promise<PersonBasic> => {
            const person = await ctx.prisma.person.findUnique({ 
                where: { id: input.personId },
                select: { id: true, name: true, email: true, status: true },
            })

            if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person(${input.personId}) not found.` })
            return person
        }),

    byEmail: authenticatedProcedure
        .input(z.object({ email: z.string().email() }))
        .query(async ({ input, ctx }) => {
            return ctx.prisma.person.findUnique({
                where: { email: input.email },
                select: { id: true, name: true, email: true, status: true }
            })
        }),

    sys_create: systemAdminProcedure
        .input(systemPersonFormSchema)
        .mutation(async ({ input, ctx }): Promise<PersonBasic> => {
            const createdPerson = await createPerson(ctx, input)
            
            return pick(createdPerson, ['id', 'name', 'email', 'status'])
        }),
    create: teamAdminProcedure
        .input(personFormSchema)
        .mutation(async ({ input, ctx }): Promise<PersonBasic> => {

            const team = await getActiveTeam(ctx)

            // Create the person
            const createdPerson = await createPerson(ctx, { ...input, owningTeamId: team.id })

            return pick(createdPerson, ['id', 'name', 'email', 'status'])
        }),

    sys_delete: systemAdminProcedure
        .input(z.object({ 
            personId: zodNanoId8,
        }))
        .mutation(async ({ input, ctx }): Promise<PersonBasic> => {
           
            const deletedPerson = await deletePerson(ctx, input.personId)

            return pick(deletedPerson, ['id', 'name', 'email', 'status'])
        }),
    delete: teamAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
        }))
        .mutation(async ({ input, ctx }): Promise<PersonBasic> => {
            
            const [person, team] = await Promise.all([
                getPersonById(ctx, input.personId),
                getActiveTeam(ctx)
            ])
            
            if(person.owningTeamId != team.id) {
                throw new TRPCError({ code: 'FORBIDDEN', message: `Person(${input.personId}) is owned by another team.` })
            }
            const deletedPerson = await deletePerson(ctx, input.personId)
            return pick(deletedPerson, ['id', 'name', 'email', 'status'])
        }),

    sys_update: systemAdminProcedure
        .input(systemPersonFormSchema)
        .mutation(async ({ input, ctx, }): Promise<PersonBasic> => {

            const updatedPerson = await updatePerson(ctx, input)
            return pick(updatedPerson, ['id', 'name', 'email', 'status'])
        }),

    update: teamAdminProcedure
        .input(personFormSchema)
        .mutation(async ({ input, ctx }): Promise<PersonBasic> => {

            const [person, team] = await Promise.all([
                getPersonById(ctx, input.personId),
                getActiveTeam(ctx)
            ])

            if(person.owningTeamId != team.id) {
                throw new TRPCError({ code: 'FORBIDDEN', message: `Person(${input.personId}) is owned by another team.` })
            }

            const updatedPerson = await updatePerson(ctx, input)
            return pick(updatedPerson, ['id', 'name', 'email', 'status'])
        }),
        
})


/**
 * Retrieves a person by their ID.
 * @param ctx The authenticated context.
 * @param personId The ID of the person to retrieve.
 * @returns The person object if found.
 * @throws TRPCError if the person is not found.
 */
export async function getPersonById(ctx: AuthenticatedContext, personId: string): Promise<Person> {
    const person = await ctx.prisma.person.findUnique({ where: { id: personId } })
    if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person(${personId}) not found.` })
    return person
}

/**
 * Creates a new person in the system.
 * @param ctx The authenticated context.
 * @param input The input data for the new person.
 * @returns The created person object.
 * @throws TRPCError if a person with the same email already exists.
 */
export async function createPerson(ctx: AuthenticatedContext, {personId, ...input }: SystemPersonFormData): Promise<Person> {
    
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
 * @param personId The ID of the person to update.
 * @param input The data to update the person with.
 * @returns The updated person object.
 * @throws TRPCError if the person is not found or if a person with the new email already exists.
 */
export async function updatePerson(ctx: AuthenticatedContext, { personId, ...input }: SystemPersonFormData): Promise<Person> {
    const existing = await getPersonById(ctx, personId)

    if(input.email != existing.email) {
        // Check if a person with the new email already exists
        const emailConflict = await ctx.prisma.person.findFirst({ where: { email: input.email } })
        if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists.', cause: new FieldConflictError('email') })
    }

    // Pick only the fields that have changed
    const changedFields = pickBy(input, (value, key) => value != existing[key])

    return ctx.prisma.person.update({
        where: { id: personId },
        data: {
            ...input,
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
 * @param personId The ID of the person to delete.
 * @returns The deleted person object.
 * @throws TRPCError if the person is not found.
 */
export async function deletePerson(ctx: AuthenticatedContext, personId: string): Promise<Person> {
    const existing = await getPersonById(ctx, personId)

    await ctx.prisma.person.delete({ where: { id: personId } })

    if(existing.clerkUserId) {
        // Delete the associated Clerk user
        await ctx.clerkClient.users.deleteUser(existing.clerkUserId)
    }

    return existing
}
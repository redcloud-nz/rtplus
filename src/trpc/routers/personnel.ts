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

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, systemAdminProcedure, teamAdminProcedure } from '../init'
import { FieldConflictError } from '../types'
import { getTeamById } from './teams'


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
    all: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus
        }))
        .output(z.array(personSchema,))
        .query(async ({ ctx, input }) => {
            const found = await ctx.prisma.person.findMany({ 
                where: { status: { in: input.status } },
                select: { id: true, name: true, email: true, owningTeamId: true, status: true },
                orderBy: { name: 'asc' }
            })
            return found.map(person => ({ personId: person.id, ...person, }))
        }),

    byId: authenticatedProcedure
        .input(z.object({ 
            personId: zodNanoId8
        }))
        .output(personSchema)
        .query(async ({ input: { personId }, ctx }) => {
            const person = await getPersonById(ctx, personId)
            return { personId, ...person }
        }),

    byEmail: authenticatedProcedure
        .input(z.object({ 
            email: z.string().email() 
        }))
        .output(z.union([personSchema, z.null()]))
        .query(async ({ input, ctx }) => {
            const person = await ctx.prisma.person.findUnique({
                where: { email: input.email },
                select: { id: true, name: true, email: true, owningTeamId: true, status: true }
            })

            return person ? { personId: person.id, ...person } : null
        }),

    create: authenticatedProcedure
        .input(personSchema)
        .output(personSchema)
        .mutation(async ({ input, ctx }) => {
            if(input.owningTeamId) {
                const team = await getTeamById(ctx, input.owningTeamId)
                ctx.requireTeamAdmin(team.clerkOrgId)
            } else ctx.requireSystemAdmin()

            const person = await createPerson(ctx, input)
            
            return { personId: person.id, ...person }
        }),

    delete: authenticatedProcedure
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
            return { personId: person.id, ...deleted}
        }),

    update: authenticatedProcedure
        .input(personSchema)
        .output(personSchema)
        .mutation(async ({ input, ctx }) => {

            const person = await getPersonById(ctx, input.personId)
            if(person?.owningTeam) {
                ctx.requireTeamAdmin(person.owningTeam.clerkOrgId)
            } else ctx.requireSystemAdmin()

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
export async function updatePerson(ctx: AuthenticatedContext, person: PersonRecord, update: Omit<PersonData, 'personId'>): Promise<PersonRecord> {

    if(update.email != person.email) {
        // Check if a person with the new email already exists
        const emailConflict = await ctx.prisma.person.findFirst({ where: { email: update.email } })
        if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists.', cause: new FieldConflictError('email') })
    }

    // Pick only the fields that have changed
    const changedFields = pickBy(update, (value, key) => value != person[key])

    return ctx.prisma.person.update({
        where: { id: person.id },
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
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import * as R from 'remeda'
import { match } from 'ts-pattern'
import { z } from 'zod'

import { clerkClient } from '@clerk/nextjs/server'
import { Person } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { personFormSchema } from '@/lib/forms/person'
import { shortId } from '@/lib/id'
import { zodDeleteType, zodRecordStatus, zodShortId } from '@/lib/validation'

import { createTRPCRouter, systemAdminProcedure } from '../init'
import { FieldConflictError } from '../types'


/**
 * TRPC router for personnel management.
 */
export const personnelRouter = createTRPCRouter({
    all: systemAdminProcedure
        .input(z.object({
            status: zodRecordStatus
        }).optional().default({}))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.person.findMany({ 
                where: { status: { in: input.status } },
                select: { id: true, name: true, email: true, status: true },
                orderBy: { name: 'asc' }
            })
        }),

    byId: systemAdminProcedure
        .input(z.object({ 
            personId: zodShortId
        }))
        .query(async ({ input, ctx }) => {
            return ctx.prisma.person.findUnique({ 
                where: { id: input.personId },
                select: { id: true, name: true, email: true, status: true }
            })
        }),

    byEmail: systemAdminProcedure
        .input(z.object({ email: z.string().email() }))
        .query(async ({ input, ctx }) => {
            return ctx.prisma.person.findUnique({
                where: { email: input.email },
                select: { id: true, name: true, email: true, status: true }
            })
        }),

    create: systemAdminProcedure
        .input(personFormSchema.omit({ personId: true }))
        .mutation(async ({ input, ctx }): Promise<Person> => {
                
            const emailConflict = await ctx.prisma.person.findFirst({ where: { email: input.email } })
            if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists.', cause: new FieldConflictError('email') })

            const newPerson = await ctx.prisma.person.create({ 
                data: { 
                    id: shortId(),
                    ...input,
                    changeLogs: { 
                        create: {
                            actorId: ctx.personId,
                            event: 'Create',
                            fields: input
                        }
                    }
                } 
            })

            return newPerson
        }),

    delete: systemAdminProcedure
        .input(z.object({ 
            personId: zodShortId,
            deleteType: zodDeleteType
        }))
        .mutation(async ({ input, ctx }) => {
        
            const existingPerson = await ctx.prisma.person.findUnique({ where: { id: input.personId } })
            if(!existingPerson) throw new TRPCError({ code: 'NOT_FOUND', message: 'Person not found.' })

            const clerk = await clerkClient()

            await match(input.deleteType)
                .with('Hard', async () => {
                    await ctx.prisma.$transaction([
                        ctx.prisma.person.delete({ where: { id: input.personId } }),
                        ctx.prisma.personChangeLog.deleteMany({ where: { personId: input.personId } })
                    ])

                    if(existingPerson.clerkUserId) {
                        // Delete the associated Clerk user
                        await clerk.users.deleteUser(existingPerson.clerkUserId)
                    }
                })
                .with('Soft', async () => {
                    await ctx.prisma.$transaction([
                        ctx.prisma.person.update({ 
                            where: { id: input.personId },
                            data: { status: 'Deleted' }
                        }),
                        ctx.prisma.personChangeLog.create({ 
                            data: { 
                                actorId: ctx.personId,
                                personId: input.personId,
                                event: 'Delete',
                                fields: { status: 'Deleted' }
                            }
                        })
                    ])

                    if(existingPerson.clerkUserId) {
                        // Lock the Clerk user account
                        await clerk.users.lockUser(existingPerson.clerkUserId)
                    }
                })
                .exhaustive()

            return existingPerson
        }),

    update: systemAdminProcedure
        .input(personFormSchema)
        .mutation(async ({ input, ctx, }) => {

            const existing = await ctx.prisma.person.findUnique({ where: { id: input.personId } })
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Person not found.' })

            if(input.email != existing?.email) {
                const emailConflict = await ctx.prisma.person.findFirst({ where: { email: input.email } })
                if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists.', cause: new FieldConflictError('email') })
            }

            const { personId, ...data } = input

            const changedFields = R.pickBy(data, (value, key) => value != existing[key])

            const updatedPerson = await ctx.prisma.person.update({ 
                where: { id: input.personId },
                data: { 
                    ...input,
                    changeLogs: { 
                        create: { 
                            actorId: ctx.personId,
                            event: 'Update',
                            fields: changedFields
                        }
                    }
                } 
            })
            return updatedPerson
        })
})
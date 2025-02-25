/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import * as R from 'remeda'
import { z } from 'zod'

import { User } from '@prisma/client'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter } from '../init'
import { TRPCError } from '@trpc/server'
import { RTPlusLogger } from '@/lib/logger'

const logger = new RTPlusLogger('trpc/users')

/**
 * TRPC router for user management.
 */
export const usersRouter = createTRPCRouter({
    all: authenticatedProcedure
        .input(z.object({
            status: z.enum(['Active', 'Inactive']).optional().default('Active')
        }).optional().default({}))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.user.findMany({ 
                where: { status: input.status },
                select: { id: true, name: true, email: true, status: true },
                orderBy: { name: 'asc' }
            })
        }),
    byId: authenticatedProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            return ctx.prisma.user.findUnique({ 
                where: { id: input.userId },
                select: { id: true, name: true, email: true, status: true }
            })
        }),
    byPersonId: authenticatedProcedure
        .input(z.object({ personId: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            return ctx.prisma.user.findUnique({
                where: { personId: input.personId },
                select: { id: true, name: true, email: true, onboardingStatus: true, status: true }
            })
        }),
    create: authenticatedProcedure
        .input(z.object({}))
        .mutation(async ({ input, ctx }) => {
            // TODO
        }),
    createForPerson: authenticatedProcedure
        .input(z.object({ personId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            
            const person = await ctx.prisma.person.findUnique({ where: { id: input.personId }})
            if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Missing person record for personId=${input.personId}` })
            
            const existingUser = await ctx.prisma.user.findUnique({ where: { personId: input.personId }})
            if(existingUser) throw new TRPCError({ code: 'CONFLICT', message: `User already exists for personId=${input.personId}` })

            const createdUser = await createUser(ctx, { personId: input.personId, name: person.name, email: person.email })
            logger.debug('User created for person', { userId: createdUser.id, personId: input.personId })

            return R.pick(createdUser, ['id', 'name', 'email', 'status'])
        })
})




async function createUser(ctx: AuthenticatedContext, { name, email, personId }: Pick<User, 'name' | 'email' | 'personId'>): Promise<User> {
    const fields = {
        name,
        email,
        personId,
        onboardingStatus: 'NotStarted',
    } as const

    const createdUser = await ctx.prisma.user.create({
        data: {
            ...fields,
            changeLogs: {
                create: {
                    actorId: ctx.userId,
                    event: 'Create',
                    fields: fields
                }
            }
        }
    })

    return createdUser
}
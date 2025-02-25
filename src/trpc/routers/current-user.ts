/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Person } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { createUUID } from '@/lib/id'
import { RTPlusLogger } from '@/lib/logger'

import { authenticatedProcedure, createTRPCRouter } from '../init'

import { getUserPermissions } from './permissions'


const logger = new RTPlusLogger('trpc/current-user')

export const currentUserRouter = createTRPCRouter({
    
    /**
     * Get the permissions associated with the current user, in compact form.
     */
    compactPermissions: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.permissions
        }),

    /**
     * Create a person record for the current user.
     * 
     * @throw NOT_FOUND if the user record is missing
     * @throw CONFLICT if the person record already exists
     */
    createPerson: authenticatedProcedure
        .mutation(async ({ ctx }) => {
            
            const user = await ctx.prisma.user.findUnique({ where: { id: ctx.userId }})
            if(!user) throw new TRPCError({ code: 'NOT_FOUND', message: `Missing user record for userId=${ctx.userId}` })
            if(user?.personId) throw new TRPCError({ code: 'CONFLICT' , message: 'Person record already exists' })

            const personId = createUUID()
            await ctx.prisma.$transaction([
                ctx.prisma.person.create({
                    data: {
                        id: personId,
                        name: user.name,
                        email: user.email,
                        slug: personId,
                        changeLogs: {
                            create: {
                                actorId: ctx.userId,
                                event: 'Create',
                                fields: { name: user.name, email: user.email, slug: personId }
                            }
                        }
                    }
                }),
                ctx.prisma.user.update({
                    where: { id: ctx.userId },
                    data: { personId }
                })
            ])
            
            logger.debug('Person created for user', { userId: user.id, personId })
        }),

    /**
     * Get the permissions associated with the current user.
     */
    permissions: authenticatedProcedure
        .query(({ ctx }) => {
            return getUserPermissions(ctx, ctx.userId)
        }),

    /**
     * Get the person associated with the current user.
     */
    person: authenticatedProcedure
        .query(async ({ ctx }): Promise<Person | null> => {
            const user = await ctx.prisma.user.findUnique({ 
                where: { id: ctx.userId },
                include: { person: true }
            })
            return user?.person ?? null
        }),


    // D4H Access Key

    d4hAccessKeys: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.prisma.d4hAccessKey.findMany({ 
                where: { userId: ctx.userId },
                include: { team: true }
            })
        }),

    addD4hAccessKey: authenticatedProcedure
        .input(z.object({
            accessKey: z.string(),
            teamId: z.string().uuid(),
            d4hTeamId: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            const team = await ctx.prisma.team.findFirst({
                where: { id: input.teamId }
            })
            if(!team) throw new TRPCError({ code: 'NOT_FOUND', message: `Missing team record for teamId=${input.teamId}` })

            // Create the access key
            await ctx.prisma.d4hAccessKey.create({
                data: {
                    userId: ctx.userId, 
                    key: input.accessKey, 
                    teamId: input.teamId, 
                    enabled: true
                }
            })
        }),

    deleteD4hAccessKey: authenticatedProcedure
        .input(z.object({
            accessKeyId: z.string().uuid()
        }))
        .mutation(async ({ ctx, input }) => {

            await ctx.prisma.d4hAccessKey.delete({
                where: { id: input.accessKeyId, userId: ctx.userId }
            })
        }),

    updateD4hAccessKey: authenticatedProcedure
        .input(z.object({
            accessKeyId: z.string().uuid(),
            enabled: z.boolean()
        }))
        .mutation(async ({ ctx, input }) => {

            await ctx.prisma.d4hAccessKey.update({
                where: { id: input.accessKeyId, userId: ctx.userId },
                data: { enabled: input.enabled }
            })
        })
    
})
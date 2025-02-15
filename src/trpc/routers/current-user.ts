/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { assertNonNull } from '@/lib/utils'

import { authenticatedProcedure, createTRPCRouter } from '../init'

import { getUserPermissions } from './permissions'


export const currentUserRouter = createTRPCRouter({
    
    compactPermissions: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.permissions
        }),

    permissions: authenticatedProcedure
        .query(({ ctx }) => {
            return getUserPermissions(ctx, ctx.userId)
        }),

    person: authenticatedProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.prisma.user.findUnique({ 
                where: { id: ctx.userId },
                include: { person: true }
            })
            return user?.person
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
            assertNonNull(team, `Missing team record for teamId=${input.teamId}`)

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
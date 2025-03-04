/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { authenticatedProcedure, createTRPCRouter } from '../init'
import { RTPlusLogger } from '@/lib/logger'


const logger = new RTPlusLogger('trpc/d4h-access-keys')

export const d4hAccessKeysRouter = createTRPCRouter({

    myAccessKeys: authenticatedProcedure
        .query(async ({ ctx }) => {
            const keys = await ctx.prisma.d4hAccessKey.findMany({ 
                where: { userId: ctx.userId },
                include: { team: {
                    include: {
                        d4hInfo: true
                    }
                } }
            })

            return keys.map(({ team: { d4hInfo, ...team }, ...key }) => ({ ...key, team, d4hInfo: d4hInfo! }))
        }),

    addAccessKey: authenticatedProcedure
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
            const createdKey = await ctx.prisma.d4hAccessKey.create({
                data: {
                    userId: ctx.userId, 
                    key: input.accessKey, 
                    teamId: input.teamId, 
                    enabled: true
                }
            })

            return { id: createdKey.id, teamId: team.id, teamName: team.name }
        }),

    deleteAccessKey: authenticatedProcedure
        .input(z.object({
            accessKeyId: z.string().uuid()
        }))
        .mutation(async ({ ctx, input }) => {

            await ctx.prisma.d4hAccessKey.delete({
                where: { id: input.accessKeyId, userId: ctx.userId }
            })
        }),

    updateAccessKey: authenticatedProcedure
        .input(z.object({
            accessKeyId: z.string().uuid(),
            enabled: z.boolean()
        }))
        .mutation(async ({ ctx, input }) => {

            await ctx.prisma.d4hAccessKey.update({
                where: { id: input.accessKeyId, userId: ctx.userId },
                data: { enabled: input.enabled }
            })
        }),
})
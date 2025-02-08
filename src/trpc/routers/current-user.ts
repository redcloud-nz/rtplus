/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { assertNonNull } from '@/lib/utils'

import { authenticatedProcedure, createTRPCRouter } from '../init'

import { getPersonPermissions } from './permissions'


export const currentUserRouter = createTRPCRouter({
    
    compactPermissions: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.permissions
        }),

    permissions: authenticatedProcedure
        .query(({ ctx }) => {
            return getPersonPermissions(ctx, ctx.userPersonId)
        }),

    person: authenticatedProcedure
    .query(async ({ ctx }) => {
        return ctx.prisma.person.findUnique({ 
            where: { id: ctx.userPersonId }
        })
    }),


    // D4H Access Key

    d4hAccessKeys: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.prisma.d4hAccessKey.findMany({ 
                where: { ownerId: ctx.userPersonId },
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
                    ownerId: ctx.userPersonId, 
                    key: input.accessKey, 
                    teamId: input.teamId, 
                    enabled: true
                }
            })

            if(team.d4hTeamId == 0) {
                // Update the D4H Team ID
                await ctx.prisma.team.update({
                    where: { id: input.teamId },
                    data: { d4hTeamId: input.d4hTeamId }
                })
            }
        }),

    deleteD4hAccessKey: authenticatedProcedure
        .input(z.object({
            accessKeyId: z.string().uuid()
        }))
        .mutation(async ({ ctx, input }) => {

            await ctx.prisma.d4hAccessKey.delete({
                where: { id: input.accessKeyId, ownerId: ctx.userPersonId }
            })
        }),

    updateD4hAccessKey: authenticatedProcedure
        .input(z.object({
            accessKeyId: z.string().uuid(),
            enabled: z.boolean()
        }))
        .mutation(async ({ ctx, input }) => {

            await ctx.prisma.d4hAccessKey.update({
                where: { id: input.accessKeyId, ownerId: ctx.userPersonId },
                data: { enabled: input.enabled }
            })
        })
    
})
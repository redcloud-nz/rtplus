/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { Team } from '@prisma/client'

import { authenticatedProcedure, createTRPCRouter } from '../init'


export const teamsRouter = createTRPCRouter({

    byId: authenticatedProcedure
        .input(z.object({ 
            teamId: z.string().uuid() 
        }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.team.findUnique({ where: { id: input.teamId } })
        }),

    list: authenticatedProcedure
        .input(z.object({
            permission: 
                z.enum(['team:assess', 'team:read', 'team:write']).optional()
                .describe("Filter by the user's permission level (with respect to the team)")
        }).optional())
        .query(async ({ ctx, input = {} }): Promise<Team[]> => {
            if(input.permission) {
                const permissions = await ctx.prisma.teamPermission.findMany({ 
                    where: {
                        personId: ctx.userPersonId,
                        permissions: { has: input.permission }
                    },
                    include: {
                        team: true
                    }
                 })
                 return permissions
                    .filter(({ team }) => team.status === 'Active')
                    .map(({ team }) => team)
            } else {
                return ctx.prisma.team.findMany({ where: { status: 'Active' } })
            }
        }),

    listWithMembers: authenticatedProcedure
        .input(z.object({
            permission: 
                z.enum(['team:assess', 'team:read', 'team:write']).optional()
                .describe("Filter by the user's permission level (with respect to the team)")
        }).optional())
        .query(async ({ ctx, input = {} }) => {
            if(input.permission) {
                const permissions = await ctx.prisma.teamPermission.findMany({ 
                    where: {
                        personId: ctx.userPersonId,
                        permissions: { has: input.permission }
                    },
                    include: {
                        team: { 
                            include: { 
                                teamMemberships: {
                                    include: {
                                        person: true
                                    }
                                }
                            }
                        }
                    }
                 })
                 return permissions
                    .filter(({ team }) => team.status === 'Active')
                    .map(({ team }) => team)
            } else {
                return ctx.prisma.team.findMany({ 
                    where: { status: 'Active' },
                    include: {
                        teamMemberships: {
                            include: {
                                person: true,
                            }
                        }
                    }
                })
            }
        }),

    members: authenticatedProcedure
        .input(z.object({
            teamId: z.string().uuid()
        }))
        .query(async ({ ctx, input }) => {

            return await ctx.prisma.teamMembership.findMany({
                include: {
                    person: true,
                    d4hInfo: true
                },
                where: { teamId: input.teamId },
                orderBy: {
                    person: { name: 'asc' }
                }
            })
        })
})
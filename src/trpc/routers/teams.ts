/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { clerkClient } from '@clerk/nextjs/server'
import { Team } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { createTeamFormSchema } from '@/lib/forms/create-team'
import { createUUID } from '@/lib/id'

import { authenticatedProcedure, createTRPCRouter } from '../init'
import { FieldConflictError } from '../types'
import { updateTeamFormSchema } from '@/lib/forms/update-team'


export const teamsRouter = createTRPCRouter({

    byId: authenticatedProcedure
        .input(z.object({ 
            teamId: z.string().uuid()
        }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.team.findUnique({ where: { id: input.teamId } })
        }),
    bySlug: authenticatedProcedure
        .input(z.object({
            slug: z.string().regex(/^[a-z0-9-]+$/, "Must be lowercase alphanumeric with hyphens.")
        }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.team.findUnique({ where: { slug: input.slug } })
        }),

    createTeam: authenticatedProcedure
        .input(createTeamFormSchema)
        .mutation(async ({ ctx, input }) => {
            if(!ctx.hasPermission('system:manage-teams')) 
                throw new TRPCError({ code: 'FORBIDDEN', message: 'system:manage-teams permission is required to create a team.' })

            const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
            if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })

            const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
            if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })

            const slugConflict = await ctx.prisma.team.findFirst({ where: { slug: input.slug } })
            if(slugConflict) throw new TRPCError({ code: 'CONFLICT', cause:new FieldConflictError('slug') })
            
            const clerk = await clerkClient()

            const teamId = createUUID()

            const organization = await clerk.organizations.createOrganization({
                name: input.name,
                slug: input.slug,
                publicMetadata: { teamId }
            })

            return await ctx.prisma.team.create({ 
                data: { ...input, id: teamId, d4hTeamId: input.d4hTeamId || 0, clerkOrgId: organization.id } 
            })
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
                return await ctx.prisma.team.findMany({ where: { status: 'Active' } })
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

    membersById: authenticatedProcedure
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
        }),
    membersBySlug: authenticatedProcedure
        .input(z.object({
            slug: z.string().regex(/^[a-z0-9-]+$/, "Must be lowercase alphanumeric with hyphens.")
        }))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.teamMembership.findMany({
                include: {
                    person: { select: { id: true, name: true } },
                    d4hInfo: { select: { position: true } }
                },
                where: { team: { slug: input.slug } },
                orderBy: {
                    person: { name: 'asc' }
                }
            })
        }),

    updateTeam: authenticatedProcedure
        .input(updateTeamFormSchema)
        .mutation(async ({ ctx, input }) => {
            if(!(ctx.hasPermission('system:manage-teams') || ctx.hasPermission("team:write", input.id))) throw new TRPCError({ code: 'FORBIDDEN', message: 'system:manage-teams or team:write permission is required to update a team.' })
        
            const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
            if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })

            const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
            if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })

            const slugConflict = await ctx.prisma.team.findFirst({ where: { slug: input.slug } })
            if(slugConflict) throw new TRPCError({ code: 'CONFLICT', cause:new FieldConflictError('slug') })
            

            return await ctx.prisma.team.update({ 
                where: { id: input.id },
                data: { ...input, d4hTeamId: input.d4hTeamId || 0 } 
            })
        }),
})
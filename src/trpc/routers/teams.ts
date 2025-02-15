/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import * as R from 'remeda'
import { z } from 'zod'

import { clerkClient } from '@clerk/nextjs/server'
import { Prisma, Team } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { createTeamFormSchema } from '@/lib/forms/create-team'
import { createUUID } from '@/lib/id'

import { authenticatedProcedure, createTRPCRouter } from '../init'
import { FieldConflictError } from '../types'
import { updateTeamFormSchema } from '@/lib/forms/update-team'


export const teamsRouter = createTRPCRouter({
    all: authenticatedProcedure
        .input(z.object({
            permission: 
                z.enum(['team:assess', 'team:read', 'team:write']).optional()
                .describe("Filter by the user's permission level (with respect to the team)")
        }).optional())
        .query(async ({ ctx, input = {} }): Promise<Team[]> => {
            if(input.permission) {
                const permissions = await ctx.prisma.teamPermission.findMany({ 
                    where: {
                        userId: ctx.userId,
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

    create: authenticatedProcedure
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
                data: { 
                    ...input, id: teamId, clerkOrgId: organization.id,
                    changeLogs: { 
                        create: { 
                            userId: ctx.userId,
                            event: 'Create',
                            fields: input
                        }
                    }
                }
            })
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
                        userId: ctx.userId,
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
        
            const existing = await ctx.prisma.team.findUnique({ where: { id: input.id } })
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })

            if(input.name != existing.name) {
                const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
                if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })
            }

            if(input.shortName != existing.shortName) {
                const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
                if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })
            }
            
            if(input.slug != existing.slug) {
                const slugConflict = await ctx.prisma.team.findFirst({ where: { slug: input.slug } })
                if(slugConflict) throw new TRPCError({ code: 'CONFLICT', cause:new FieldConflictError('slug') })
            }

            const { id, ...data } = input

            R.keys(data).forEach(key => {
                if(data[key] === existing[key]) delete data[key]
            })

            return await ctx.prisma.team.update({ 
                where: { id },
                data: { 
                    ...data,
                    changeLogs: { 
                        create: { 
                            userId: ctx.userId,
                            event: 'Update',
                            fields: data
                        }
                    }
                } 
            })
        }),
})
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import * as R from 'remeda'
import { z } from 'zod'

import { clerkClient } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'

import { teamFormSchema } from '@/lib/forms/team'
import { createUUID } from '@/lib/id'
import { RTPlusLogger } from '@/lib/logger'
import { zodSlug } from '@/lib/validation'

import { authenticatedProcedure, createTRPCRouter, systemAdminProcedure } from '../init'
import { FieldConflictError } from '../types'

const logger = new RTPlusLogger('trpc/teams')

export const teamsRouter = createTRPCRouter({

    all: authenticatedProcedure
        .input(z.object({
            includeD4hInfo: z.boolean().optional().default(false)
        }).optional().default({}))
        .query(async ({ ctx, input = {} }) => {
            return await ctx.prisma.team.findMany({ 
                where: { status: 'Active' },
                include: {
                    ... (input.includeD4hInfo ? { d4hInfo: true } : {}),
                    _count: {
                        select: { teamMemberships: true }
                    }
                },
            })
        }),

    allLinkedToD4h: authenticatedProcedure
        .query(async ({ ctx }) => {
            const teams = await ctx.prisma.team.findMany({
                where: { status: 'Active' },
                include: { d4hInfo: true }
            })
            return teams.filter(team => team.d4hInfo != null )
        }),

        byId: authenticatedProcedure
        .input(z.object({ 
            teamId: z.string().uuid()
        }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.team.findUnique({ 
                where: { id: input.teamId },
                include: { d4hInfo: true }
            })
        }),

    bySlug: authenticatedProcedure
        .input(z.object({
            slug: zodSlug
        }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.team.findUnique({ 
                where: { slug: input.slug },
                include: { d4hInfo: true }
            })
        }),

    create: systemAdminProcedure
        .input(teamFormSchema)
        .mutation(async ({ ctx, input }) => {

            const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
            if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })

            const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
            if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })

            const slugConflict = await ctx.prisma.team.findFirst({ where: { slug: input.slug } })
            if(slugConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('slug') })
            
            const teamId = createUUID()

            const clerk = await clerkClient()

            const organization = await clerk.organizations.createOrganization({
                name: input.name,
                slug: input.slug,
                publicMetadata: { teamId }
            })

            const createdTeam = await ctx.prisma.team.create({ 
                data: { 
                    ...input, id: teamId, clerkOrgId: organization.id,
                    changeLogs: { 
                        create: { 
                            actorId: ctx.personId,
                            event: 'Create',
                            fields: input
                        }
                    }
                }
            })

            logger.debug(`Created team ${createdTeam.name} with ID ${createdTeam.id}`)

            return createdTeam
        }),

    delete: systemAdminProcedure
        .input(z.object({ 
            teamId: z.string().uuid(),
            hard: z.boolean().optional().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.prisma.team.findUnique({ where: { id: input.teamId, status: 'Active' }})
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })

            if(input.hard) {
                // Hard delete
            } else {
                // Soft delete
                return await ctx.prisma.team.update({ 
                    where: { id: input.teamId },
                    data: { status: 'Deleted' }
                })
            }
        }),
            

    update: systemAdminProcedure
        .input(teamFormSchema.merge(z.object({ teamId: z.string().uuid() })))
        .mutation(async ({ ctx, input }) => {
            
            const existing = await ctx.prisma.team.findUnique({ where: { id: input.teamId }})
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

            const { teamId, ...data } = input

            const changedFields = R.pickBy(data, (value, key) => value != existing[key])
            
            return await ctx.prisma.team.update({ 
                where: { id: teamId },
                data: { 
                    ...data,
                    changeLogs: { 
                        create: { 
                            actorId: ctx.personId,
                            event: 'Update',
                            fields: { changedFields }
                        }
                    }
                } 
            })
        }),

    updateTeamD4h: systemAdminProcedure
        .input(z.object({
            teamId: z.string().uuid(),
            d4hTeamId: z.number(),
            serverCode: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { teamId, ...data } = input

            logger.info(`Updating D4H info for team ${teamId}`, input)

            const existing = await ctx.prisma.team.findUnique({ where: { id: teamId }})
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })

            await ctx.prisma.team.update({
                where: { id: teamId },
                data: { 
                    d4hInfo: {
                        upsert: {
                            create: data,
                            update: data
                        }
                    }
                }
            })
        }),
})

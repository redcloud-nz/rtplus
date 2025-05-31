/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import * as R from 'remeda'
import { z } from 'zod'

import { clerkClient } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'

import { systemTeamFormSchema } from '@/lib/forms/system-team'
import { nanoId16 } from '@/lib/id'
import { RTPlusLogger } from '@/lib/logger'
import { zodNanoId8, zodSlug } from '@/lib/validation'

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
        teamId: zodNanoId8
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
        .input(systemTeamFormSchema)
        .mutation(async ({ ctx, input }) => {
            const { teamId, ...data } = input

            const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
            if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })

            const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
            if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })

            const clerk = await clerkClient()

            const organization = await clerk.organizations.createOrganization({
                name: input.name,
                slug: input.slug,
                publicMetadata: { teamId }
            })

            const createdTeam = await ctx.prisma.team.create({ 
                data: { 
                    ...data, 
                    id: teamId, 
                    clerkOrgId: organization.id,
                    changeLogs: { 
                        create: { 
                            id: nanoId16(),
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
            teamId: zodNanoId8,
            hard: z.boolean().optional().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.prisma.team.findUnique({ where: { id: input.teamId, status: 'Active' }})
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })

            if(input.hard) {
                // Hard delete
                // TODO : Implement hard delete logic
                logger.warn(`Hard delete requested for team ${input.teamId}, but hard delete is not implemented yet.`)
                throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Hard delete is not implemented yet.' })
            } else {
                // Soft delete
                return await ctx.prisma.team.update({ 
                    where: { id: input.teamId },
                    data: { status: 'Deleted' }
                })
            }
        }),
            

    update: systemAdminProcedure
        .input(systemTeamFormSchema)
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
                            id: nanoId16(),
                            actorId: ctx.personId,
                            event: 'Update',
                            fields: changedFields
                        }
                    }
                } 
            })
        }),

    updateTeamD4h: systemAdminProcedure
        .input(z.object({
            teamId: zodNanoId8,
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

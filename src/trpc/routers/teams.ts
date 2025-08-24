/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { Team as TeamRecord } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { teamSchema, toTeamData } from '@/lib/schemas/team'
import { nanoId16 } from '@/lib/id'
import { RTPlusLogger } from '@/lib/logger'
import { zodNanoId8, zodRecordStatus } from '@/lib/validation'
import { revalidateTeamsCache } from '@/server/data/team'

import { AuthenticatedContext, authenticatedProcedure, AuthenticatedTeamContext, createTRPCRouter, systemAdminProcedure, teamAdminProcedure } from '../init'
import { FieldConflictError } from '../types'



const logger = new RTPlusLogger('trpc/teams')

export const teamsRouter = createTRPCRouter({

    createTeam: systemAdminProcedure
        .input(teamSchema)
        .output(teamSchema)
        .mutation(async ({ ctx, input }) => {
            
            const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
            if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })

            const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
            if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })

            const clerkOrgCreateParams = {
                name: input.name,
                createdBy: ctx.session.userId,
                slug: input.slug,
                publicMetadata: { teamId: input.teamId }
            } as const

            let clerkOrgId: string
            try {
                const organization = await ctx.clerkClient.organizations.createOrganization(clerkOrgCreateParams)
                clerkOrgId = organization.id
            } catch (error) {
                logger.error(`Failed to create Clerk organization for team ${input.teamId}:`, clerkOrgCreateParams, error)
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to create Clerk organization for team ${input.teamId}.` })
            }

            const createdTeam = await ctx.prisma.team.create({ 
                data: { 
                    id: input.teamId, 
                    ...input, 
                    clerkOrgId,
                    changeLogs: { 
                        create: { 
                            id: nanoId16(),
                            actorId: ctx.session.personId,
                            event: 'Create',
                            fields: input
                        }
                    }
                }
            })

            logger.info(`Team ${input.teamId} created successfully with Clerk organization ID ${clerkOrgId}.`)

            // Invalidate the cache for the team
            revalidateTeamsCache()

            return toTeamData(createdTeam)
        }),

    deleteTeam: systemAdminProcedure
        .input(z.object({ 
            teamId: zodNanoId8,
        }))
        .output(teamSchema)
        .mutation(async ({ ctx, input: { teamId } }) => {

            const team = await getTeamById(ctx, teamId)

            const deleted = await ctx.prisma.team.delete({ where: { id: team.id } })

            await ctx.clerkClient.organizations.deleteOrganization(deleted.clerkOrgId)

            logger.info(`Team ${team.id} deleted successfully.`)
            revalidateTeamsCache()

            return toTeamData(deleted)
        }),

    getTeam: authenticatedProcedure
        .input(z.object({ 
            teamId: zodNanoId8.optional(),
            teamSlug: z.string().optional(),
        }).refine(data => data.teamId || data.teamSlug, {
            message: 'Either teamId or teamSlug must be provided.'
        }))
        .output(teamSchema)
        .query(async ({ ctx, input: { teamId, teamSlug } }) => {

            if(teamId) {
                const team = await getTeamById(ctx, teamId)
                return toTeamData(team)
            } else if(teamSlug) {
                const team = await ctx.prisma.team.findUnique({ where: { slug: teamSlug } })

                if(!team) throw new TRPCError({ code: 'NOT_FOUND', message: `Team with slug ${teamSlug} not found.` })
                return toTeamData(team)

            } else {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' })
            }
        }),

    getTeams: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus
        }).optional().default({}))
        .output(z.array(teamSchema.extend({
            _count: z.object({
                teamMemberships: z.number()
            })
        })))
        .query(async ({ ctx, input }) => {
            const teams = await ctx.prisma.team.findMany({ 
                where: { status: { in: input.status} },
                include: {
                    _count: {
                        select: { teamMemberships: true }
                    }
                },
                orderBy: { name: 'asc' }
            })
            return teams.map(team => ({ teamId: team.id, ...team }))
        }),
            

    updateTeam: teamAdminProcedure
        .input(teamSchema)
        .output(teamSchema)
        .mutation(async ({ ctx, input: { teamId, ...update } }) => {

            const team = await getTeamById(ctx, teamId)
            
            if(update.name != team.name) {
                const nameConflict = await ctx.prisma.team.findFirst({ where: { name: update.name } })
                if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })
            }

            if(update.shortName != team.shortName) {
                const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: update.shortName } })
                if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })
            }

            if(update.slug != team.slug) {
                const slugConflict = await ctx.prisma.team.findFirst({ where: { slug: update.slug } })
                if(slugConflict) throw new TRPCError({ code: 'CONFLICT', cause:new FieldConflictError('slug') })
            }

            if(update.name != team.name || update.slug != team.slug) {
                // Update the Clerk organization name and slug if they have changed
                await ctx.clerkClient.organizations.updateOrganization(team.clerkOrgId, {
                    name: update.name,
                    slug: update.slug,
                    publicMetadata: { teamId: team.id }
                })
                logger.info(`Updated Clerk organization for team ${team.id} with new name '${update.name}' and slug '${update.slug}'.`)
            }

            // Pick only the fields that have changed
            const changedFields = pickBy(update, (value, key) => value != team[key])

            if(Object.keys(changedFields).length > 0) {
                const updated = await ctx.prisma.team.update({
                    where: { id: team.id },
                    data: { 
                        ...changedFields,
                        changeLogs: { 
                            create: { 
                                id: nanoId16(),
                                actorId: ctx.session.personId,
                                event: 'Update',
                                fields: changedFields
                            }
                        }
                    }
                })
                logger.info(`Team ${team.id} updated successfully.`, changedFields)

                // Invalidate the cache for the team
                revalidateTeamsCache()

                return toTeamData(updated)
            } else {
                return toTeamData(team)
            }
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


/**
 * Get the current active team based on the authenticated team context.
 * @param ctx The authenticated team context containing the team slug.
 * @returns The active team object.
 * @throws TRPCError(NOT_FOUND) If the active team is not found.
 */
export async function getActiveTeam(ctx: AuthenticatedTeamContext): Promise<TeamRecord> {
    const team = await ctx.prisma.team.findUnique({ 
        where: { clerkOrgId: ctx.session.activeTeam.orgId },
    })
    if(team == null) throw new TRPCError({ code: 'NOT_FOUND' , message: `Active team not found.` })
    return team
}

/**
 * Gets a team by its ID.
 * @param ctx The authenticated context.
 * @param teamId The ID of the team to retrieve.
 * @returns The team object if found.
 * @throws TRPCError if the team is not found.
 */
export async function getTeamById(ctx: AuthenticatedContext, teamId: string): Promise<TeamRecord> {
    const team = await ctx.prisma.team.findUnique({ where: { id: teamId } })
    if(!team) throw new TRPCError({ code: 'NOT_FOUND', message: `Team with ID '${teamId}' not found.` })
    return team
}
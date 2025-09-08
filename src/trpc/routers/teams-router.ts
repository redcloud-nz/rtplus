/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pick, pickBy, pipe } from 'remeda'
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

    createTeam: authenticatedProcedure
        .input(teamSchema)
        .output(teamSchema)
        .mutation(async ({ ctx, input: { teamId, ...input } }) => {

            const clerkClient = ctx.getClerkClient()

            // Ensure that the user has permission to create a team
            const user = await clerkClient.users.getUser(ctx.auth.userId)
            if(!user.createOrganizationEnabled) {
                throw new TRPCError({ code: 'FORBIDDEN', message: "You do not have permission to create a new team." })
            }
            
            const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
            if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })

            const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
            if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })

            const clerkOrgCreateParams = {
                name: input.name,
                createdBy: ctx.auth.userId,
                slug: input.slug,
                publicMetadata: {teamId, type: input.type }
            } as const

            let clerkOrgId: string
            try {
                const organization = await clerkClient.organizations.createOrganization(clerkOrgCreateParams)
                clerkOrgId = organization.id
            } catch (error) {
                logger.error(`Failed to create Clerk organization for team ${teamId}:`, clerkOrgCreateParams, error)
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to create Clerk organization for Team(${teamId}).` })
            }

            const createdTeam = await ctx.prisma.team.create({ 
                data: { 
                    id: teamId, 
                    ...input, 
                    clerkOrgId,
                    changeLogs: { 
                        create: { 
                            id: nanoId16(),
                            actorId: ctx.auth.personId,
                            event: 'Create',
                            fields: input
                        }
                    }
                }
            })

            logger.info(`Team(${teamId}) created successfully with Clerk organization ID ${clerkOrgId}.`)

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

            await ctx.getClerkClient().organizations.deleteOrganization(deleted.clerkOrgId)

            logger.info(`Team(${team.id}) deleted successfully.`)
            revalidateTeamsCache()

            return toTeamData(deleted)
        }),

    getActiveTeam: authenticatedProcedure
        .output(z.union([teamSchema, z.null()]))
        .query(async ({ ctx }) => {
            if(ctx.auth.activeTeam == null) return null

            const team = await ctx.prisma.team.findUnique({ 
                where: { clerkOrgId: ctx.auth.activeTeam.orgId },
            })
            if(team == null) throw new TRPCError({ code: 'NOT_FOUND', message: `Team with orgId ${ctx.auth.activeTeam.orgId} not found.` })
            return toTeamData(team)
        }),

    getTeam: authenticatedProcedure
        .input(z.object({ 
            teamId: zodNanoId8.optional(),
            teamSlug: z.string().optional(),
            orgId: z.string().optional(),
        }).refine(data => data.teamId || data.teamSlug || data.orgId, {
            message: 'One of teamId, teamSlug, or orgId must be provided.'
        }))
        .output(teamSchema)
        .query(async ({ ctx, input: { teamId, teamSlug, orgId } }) => {

            if(teamId) {
                const team = await getTeamById(ctx, teamId)
                return toTeamData(team)
            } else if(teamSlug) {
                const team = await ctx.prisma.team.findUnique({ where: { slug: teamSlug } })

                if(!team) throw new TRPCError({ code: 'NOT_FOUND', message: `Team with slug ${teamSlug} not found.` })
                return toTeamData(team)

            } else if(orgId) {
                const team = await ctx.prisma.team.findUnique({ where: { clerkOrgId: orgId } })

                if(!team) throw new TRPCError({ code: 'NOT_FOUND', message: `Team with orgId ${orgId} not found.` })
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
                where: { 
                    status: { in: input.status, },
                    id: { not: 'RTSYSTEM' }
                },
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
        .input(teamSchema.omit({ type: true }))
        .output(teamSchema)
        .mutation(async ({ ctx, input }) => {
            const { team } = ctx
            
            if(input.name != team.name) {
                const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
                if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })
            }

            if(input.shortName != team.shortName) {
                const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
                if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })
            }

            if(input.slug != team.slug) {
                const slugConflict = await ctx.prisma.team.findFirst({ where: { slug: input.slug } })
                if(slugConflict) throw new TRPCError({ code: 'CONFLICT', cause:new FieldConflictError('slug') })
            }

            if(input.name != team.name || input.slug != team.slug) {
                // Update the Clerk organization name and slug if they have changed
                await ctx.getClerkClient().organizations.updateOrganization(team.clerkOrgId, {
                    name: input.name,
                    slug: input.slug,
                    publicMetadata: { teamId: team.id, type: team.type }
                })
                logger.info(`Updated Clerk organization for team ${team.id} with new name '${input.name}' and slug '${input.slug}'.`)
            }

            // Pick only the fields that have changed
            const changedFields = pipe(input, pick(['color', 'name', 'status', 'slug', 'shortName']), pickBy((value, key) => value != team[key]))

            if(Object.keys(changedFields).length > 0) {
                const updated = await ctx.prisma.team.update({
                    where: { id: team.id },
                    data: { 
                        ...changedFields,
                        changeLogs: { 
                            create: { 
                                id: nanoId16(),
                                actorId: ctx.auth.personId,
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
        where: { clerkOrgId: ctx.auth.activeTeam.orgId },
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
    const team = await ctx.prisma.team.findUnique({ 
        where: { id: teamId },
        include: { teamMemberships: { 
            where: { status: 'Active'},
            include: {person: true }
        }}
    })
    if(!team) throw new TRPCError({ code: 'NOT_FOUND', message: `Team with ID '${teamId}' not found.` })
    return team
}
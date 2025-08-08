/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { Team as TeamRecord } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { TeamData, teamSchema, toTeamData } from '@/lib/schemas/team'
import { nanoId16 } from '@/lib/id'
import { RTPlusLogger } from '@/lib/logger'
import { zodNanoId8, zodRecordStatus } from '@/lib/validation'

import { AuthenticatedContext, authenticatedProcedure, AuthenticatedTeamContext, createTRPCRouter, systemAdminProcedure, teamAdminProcedure } from '../init'
import { FieldConflictError } from '../types'


const logger = new RTPlusLogger('trpc/teams')

export const teamsRouter = createTRPCRouter({

    createTeam: systemAdminProcedure
        .input(teamSchema)
        .output(teamSchema)
        .mutation(async ({ ctx, input }) => {
            const team = await createTeam(ctx, input)
            return toTeamData(team)
        }),

    deleteTeam: systemAdminProcedure
        .input(z.object({ 
            teamId: zodNanoId8,
        }))
        .output(teamSchema)
        .mutation(async ({ ctx, input: { teamId } }) => {

            const team = await getTeamById(ctx, teamId)

            const deleted = await deleteTeam(ctx, team)
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
            
            const updated = await updateTeam(ctx, team, update)
            return toTeamData(updated)
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
        where: { clerkOrgId: ctx.orgId },
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

/**
 * Gets a team by its slug.
 * @param ctx The authenticated context.
 * @param teamSLug The Slug of the team to retrieve.
 * @returns The team object if found.
 * @throws TRPCError if the team is not found.
 */
export async function getTeamBySlug(ctx: AuthenticatedContext, teamSlug: string): Promise<TeamRecord> {
    const team = await ctx.prisma.team.findUnique({ where: { slug: teamSlug } })
    if(!team) throw new TRPCError({ code: 'NOT_FOUND', message: `Team with slug '${teamSlug}' not found.` })
    return team
}

/**
 * Creates a new team in the system.
 * @param ctx The authenticated context.
 * @param input The input data for the new team.
 * @returns The created team object.
 * @throws TRPCError if a team with the same name or shortName already exists.
 */
export async function createTeam(ctx: AuthenticatedContext, { teamId, ...input }: TeamData): Promise<TeamRecord> {

    const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
    if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })

    const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
    if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })

    const clerkOrgCreateParams = {
        name: input.name,
        createdBy: ctx.auth.userId!,
        slug: input.slug,
        publicMetadata: { teamId }
    } as const

    let clerkOrgId: string
    try {
        const organization = await ctx.clerkClient.organizations.createOrganization(clerkOrgCreateParams)
        clerkOrgId = organization.id
    } catch (error) {
        logger.error(`Failed to create Clerk organization for team ${teamId}:`, clerkOrgCreateParams, error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to create Clerk organization for team ${teamId}.` })
    }

    const createdTeam = await ctx.prisma.team.create({ 
        data: { 
            id: teamId, 
            ...input, 
            clerkOrgId,
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

    logger.info(`Team ${teamId} created successfully with Clerk organization ID ${clerkOrgId}.`)

    return createdTeam
}
    
/**
 * Updates an existing team in the system.
 * @param ctx The authenticated context.
 * @param teamId The ID of the team to update.
 * @param input The data to update the team with.
 * @returns The updated team object.
 * @throws TRPCError if the team is not found or if a team with the new name, shortName, or slug already exists.
 */
export async function updateTeam(ctx: AuthenticatedContext, team: TeamRecord, update: Omit<TeamData, 'teamId'>): Promise<TeamRecord> {

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
                        actorId: ctx.personId,
                        event: 'Update',
                        fields: changedFields
                    }
                }
            }
        })
        logger.info(`Team ${team.id} updated successfully.`, changedFields)
        return updated
    } else {
        return team // No changes, return the original team
    }
}

/**
 * Deletes a team from the system.
 * @param ctx The authenticated context.
 * @param team The team object to delete.
 * @returns The deleted team object.
 * @throws TRPCError if the team is not found..
 */
export async function deleteTeam(ctx: AuthenticatedContext, team: TeamRecord): Promise<TeamRecord> {
    const deleted = await ctx.prisma.team.delete({ where: { id: team.id } })

    await ctx.clerkClient.organizations.deleteOrganization(deleted.clerkOrgId)

    logger.info(`Team ${team.id} deleted successfully.`)

    return deleted
}
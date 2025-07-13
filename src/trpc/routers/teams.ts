/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pick, pickBy } from 'remeda'
import { z } from 'zod'

import { Team } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { TeamFormData, teamFormSchema } from '@/lib/forms/team'
import { nanoId16 } from '@/lib/id'
import { RTPlusLogger } from '@/lib/logger'
import { zodNanoId8, zodRecordStatus, zodSlug } from '@/lib/validation'

import { AuthenticatedContext, authenticatedProcedure, AuthenticatedTeamContext, createTRPCRouter, systemAdminProcedure } from '../init'
import { FieldConflictError, TeamBasic } from '../types'
import { Organization } from '@clerk/nextjs/server'


const logger = new RTPlusLogger('trpc/teams')

export const teamsRouter = createTRPCRouter({

    all: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus
        }).optional().default({}))
        .query(async ({ ctx, input }): Promise<(TeamBasic & { memberCount: number })[]> => {
            const teams = await ctx.prisma.team.findMany({ 
                where: { status: { in: input.status} },
                include: {
                    _count: {
                        select: { teamMemberships: true }
                    }
                },
                orderBy: { name: 'asc' }
            })
            return teams.map(team => ({
                id: team.id,
                name: team.name,
                slug: team.slug,
                shortName: team.shortName,
                color: team.color,
                status: team.status,
                memberCount: team._count.teamMemberships
            }))
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
        .query(async ({ ctx, input }): Promise<TeamBasic> => {
            
            const team = await getTeamById(ctx, input.teamId)
            return pick(team, ['id', 'name', 'shortName', 'slug', 'color', 'status'])
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

    sys_create: systemAdminProcedure
        .input(teamFormSchema)
        .mutation(async ({ ctx, input }): Promise<TeamBasic> => {
            const team = await createTeam(ctx, input)
            return pick(team, ['id', 'name', 'shortName', 'slug', 'color', 'status'])
        }),

    sys_delete: systemAdminProcedure
        .input(z.object({ 
            teamId: zodNanoId8,
        }))
        .mutation(async ({ ctx, input }): Promise<TeamBasic> => {

            const deletedTeam = await deleteTeam(ctx, input.teamId)
            return pick(deletedTeam, ['id', 'name', 'shortName', 'slug', 'color', 'status'])
        }),
            

    sys_update: systemAdminProcedure
        .input(teamFormSchema)
        .mutation(async ({ ctx, input }): Promise<TeamBasic> => {
            
            const updatedTeam = await updateTeam(ctx, input)
            return pick(updatedTeam, ['id', 'name', 'shortName', 'slug', 'color', 'status'])
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
 * @throws Error if the active team is not found.
 */
export async function getActiveTeam(ctx: AuthenticatedTeamContext): Promise<Team> {
    const team = await ctx.prisma.team.findUnique({ 
        where: { slug: ctx.teamSlug }
    })
    if(team == null) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' , message: `Missing active team for teamSlug='${ctx.teamSlug}'` })
    return team
}

/**
 * Gets a team by its ID.
 * @param ctx The authenticated context.
 * @param teamId The ID of the team to retrieve.
 * @returns The team object if found.
 * @throws TRPCError if the team is not found.
 */
export async function getTeamById(ctx: AuthenticatedContext, teamId: string): Promise<Team> {
    const team = await ctx.prisma.team.findUnique({ where: { id: teamId } })
    if(!team) throw new TRPCError({ code: 'NOT_FOUND', message: `Team(${teamId}) not found.` })
    return team
}

/**
 * Creates a new team in the system.
 * @param ctx The authenticated context.
 * @param input The input data for the new team.
 * @returns The created team object.
 * @throws TRPCError if a team with the same name or shortName already exists.
 */
export async function createTeam(ctx: AuthenticatedContext, { teamId, ...input }: TeamFormData): Promise<Team> {

    const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
    if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })

    const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
    if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })

    let clerkOrgId: string
    try {
        const organization = await ctx.clerkClient.organizations.createOrganization({
            name: input.name,
            slug: input.slug,
            publicMetadata: { teamId }
        })
        clerkOrgId = organization.id
    } catch (error) {
        logger.error(`Failed to create Clerk organization for team ${teamId}:`, error)
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
export async function updateTeam(ctx: AuthenticatedContext, { teamId, ...input }: TeamFormData): Promise<Team> {
    const existing = await getTeamById(ctx, teamId)

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

    // Pick only the fields that have changed
    const changedFields = pickBy(input, (value, key) => value != existing[key])

    return ctx.prisma.team.update({
        where: { id: teamId },
        data: { 
            ...input,
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
}

/**
 * Deletes a team from the system.
 * @param ctx The authenticated context.
 * @param teamId The ID of the team to delete.
 * @returns The deleted team object.
 * @throws TRPCError if the team is not found..
 */
export async function deleteTeam(ctx: AuthenticatedContext, teamId: string): Promise<Team> {
    const existing = await getTeamById(ctx, teamId)

    await ctx.prisma.team.delete({ where: { id: teamId } })

    await ctx.clerkClient.organizations.deleteOrganization(existing.clerkOrgId)

    logger.info(`Team ${teamId} deleted successfully.`)

    return existing
}
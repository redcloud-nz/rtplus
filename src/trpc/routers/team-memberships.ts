/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pick, pickBy } from 'remeda'
import { z } from 'zod'

import { TeamMembership } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { SystemTeamMembershipFormData, systemTeamMembershipFormSchema, teamMembershipFormSchema } from '@/lib/forms/team-membership'
import { nanoId16 } from '@/lib/id'
import { zodRecordStatus, zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, createTRPCRouter, systemAdminProcedure, teamAdminProcedure, teamProcedure } from '../init'
import { TeamMembershipBasic, TeamMembershipWithPerson, TeamMembershipWithPersonAndTeam, TeamMembershipWithTeam } from '../types'

import { getPersonById } from './personnel'
import { getActiveTeam, getTeamById } from './teams'


export const teamMembershipsRouter = createTRPCRouter({

    create: systemAdminProcedure
        .input(systemTeamMembershipFormSchema)
        .mutation(async ({ ctx, input }): Promise<TeamMembershipWithPersonAndTeam> => {

            // Check if the person and team exist
            const [person, team] = await Promise.all([
                getPersonById(ctx, input.personId),
                getTeamById(ctx, input.teamId)
            ])

            const createdMembership = await createTeamMembership(ctx, input)

            return { ...pick(createdMembership, ['teamId', 'personId', 'tags', 'status']), person, team }
        }),

    createInTeam: teamAdminProcedure
        .input(teamMembershipFormSchema)
        .mutation(async ({ ctx, input }): Promise<TeamMembershipWithPerson> => {
            
            
            const [person, team] = await Promise.all([
                getPersonById(ctx, input.personId),
                getActiveTeam(ctx)
            ])

            // Create the team membership
            const createdMembership = await createTeamMembership(ctx, { 
                personId: input.personId, 
                teamId: team.id, 
                tags: input.tags,
                status: input.status 
            })

            return { ...pick(createdMembership, ['teamId', 'personId', 'tags', 'status']), person }
        }),
    
    byCurrentTeam: teamProcedure
        .query(async ({ ctx }): Promise<TeamMembershipWithPerson[]> => {
            const team = await ctx.prisma.team.findUnique({ 
                where: { slug: ctx.teamSlug },
                include: {
                    teamMemberships: {
                        include: {
                            person: true,
                        },
                        orderBy: {
                            person: { name: 'asc' }
                        }
                    }
                }
            })

            if(!team) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' , message: `Missing active team for teamSlug='${ctx.teamSlug}'` })

            return team.teamMemberships.map(membership => ({
                ...pick(membership, ['personId', 'teamId', 'tags', 'status']),
                person: pick(membership.person, ['id', 'name', 'email', 'status'])
            })) satisfies TeamMembershipWithPerson[]
        }),

    byPerson: systemAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
        }))
        .query(async ({ ctx, input }): Promise<TeamMembershipWithTeam[]> => {
            return ctx.prisma.teamMembership.findMany({
                where: { 
                    personId: input.personId, 
                },
                include: { team: true, d4hInfo: true },
                orderBy: { team: { name: 'asc' }}
            })
        }),
    byPersonInCurrentTeam: teamProcedure
        .input(z.object({
            personId: zodNanoId8
        }))
        .query(async ({ ctx, input }): Promise<TeamMembershipBasic | null> => {
            const team = await getActiveTeam(ctx)
            const membership = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId: input.personId, teamId: team.id }},
                include: { d4hInfo: true }
            })
            if(!membership) return null
            return {
                ...pick(membership, ['personId', 'teamId', 'tags', 'status']),
            } satisfies TeamMembershipBasic
        }),

    byTeam: systemAdminProcedure
        .input(z.object({
            teamId: zodNanoId8,
            status: zodRecordStatus
        }))
        .query(async ({ ctx, input }): Promise<TeamMembershipWithPerson[]> => {
            return ctx.prisma.teamMembership.findMany({
                where: { 
                    teamId: input.teamId, 
                    status: { in: input.status }
                },
                include: { person: true, d4hInfo: true },
                orderBy: { person: { name: 'asc' }}
            })
        }),

    delete: systemAdminProcedure
        .input(z.object({
            teamId: zodNanoId8,
            personId: zodNanoId8,
        }))
        .mutation(async ({ ctx, input }): Promise<TeamMembershipBasic> => {

            const deletedMembership = await deleteTeamMembership(ctx, input)

            return pick(deletedMembership, ['teamId', 'personId', 'tags', 'status'])
        }),

    deleteInTeam: teamAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
        }))
        .mutation(async ({ ctx, input }): Promise<TeamMembershipBasic> => {

            const team = await getActiveTeam(ctx)

            const deletedMembership = await deleteTeamMembership(ctx, { personId: input.personId, teamId: team.id })

            return pick(deletedMembership, ['teamId', 'personId', 'tags', 'status'])
        }),
        

    update: systemAdminProcedure
        .input(systemTeamMembershipFormSchema)
        .mutation(async ({ ctx, input }): Promise<TeamMembershipWithPersonAndTeam> => {
            
            const [person, team] = await Promise.all([
                getPersonById(ctx, input.personId),
                getTeamById(ctx, input.teamId)
            ])

            const updatedMembership = updateTeamMembership(ctx, input)
            return { ...pick(await updatedMembership, ['teamId', 'personId', 'tags', 'status']), person, team }
        }),

    updateInTeam: teamAdminProcedure
        .input(teamMembershipFormSchema)
        .mutation(async ({ ctx, input }): Promise<TeamMembershipWithPerson> => {

            const [person, team] = await Promise.all([
                getPersonById(ctx, input.personId),
                getActiveTeam(ctx)
            ])

            const updatedMembership = await updateTeamMembership(ctx, { 
                personId: input.personId, 
                teamId: team.id, 
                tags: input.tags,
                status: input.status 
            })

            return { ...pick(updatedMembership, ['teamId', 'personId', 'tags', 'status']), person }
        }),
})


async function getTeamMembershipById(ctx: AuthenticatedContext, { personId, teamId }: { personId: string, teamId: string }): Promise<TeamMembership> {
    const membership = await ctx.prisma.teamMembership.findUnique({
        where: { personId_teamId: { personId, teamId } },
        include: { person: true, team: true }
    })

    if(!membership) throw new TRPCError({ code: 'NOT_FOUND', message: `Team membership not found for personId='${teamId}' and teamId='${teamId}'` })

    return membership
}

/**
 * Create a new team membership.
 * @param ctx TRPC Context.
 * @param teamId The team ID.
 * @param personId The person ID.
 * @returns The created team membership.
 */
export async function createTeamMembership(ctx: AuthenticatedContext, { personId, teamId, tags, status }: SystemTeamMembershipFormData): Promise<TeamMembership> {

    const [createdMembership] = await ctx.prisma.$transaction([
        ctx.prisma.teamMembership.create({
            data: {
                status,
                tags,
                team: { connect: { id: teamId }},
                person: { connect: { id: personId }},
            }
        }),
        ctx.prisma.teamChangeLog.create({
            data: {
                id: nanoId16(),
                teamId,
                actorId: ctx.personId,
                event: 'AddMember',
                fields: { personId, status }
            }
        })
    ])

    return createdMembership
}

/**
 * Remove a member from a team.
 * @param ctx TRPC Context.
 * @param membership The membership to remove.
 */
export async function deleteTeamMembership(ctx: AuthenticatedContext, { personId, teamId }: Pick<SystemTeamMembershipFormData, 'personId' | 'teamId'>): Promise<TeamMembershipBasic> {
    
    const existing = await getTeamMembershipById(ctx, { personId, teamId })

    await ctx.prisma.$transaction([
        ctx.prisma.teamMembership.delete({ where: { personId_teamId: { personId, teamId } }}),
        ctx.prisma.teamChangeLog.create({
            data: {
                id: nanoId16(),
                teamId,
                actorId: ctx.personId,
                event: 'RemoveMember',
                fields: { personId }
            }
        })
    ])

    return existing
}

/**
 * Update a team membership.
 * @param ctx TRPC Context.
 * @param membership The membership to update.
 * @param role The new role.
 * @returns The updated team membership.
 */
export async function updateTeamMembership(ctx: AuthenticatedContext, { personId, teamId, ...input  }: SystemTeamMembershipFormData): Promise<TeamMembership> {
    const existing = await getTeamMembershipById(ctx, { personId, teamId })
    
    // Pick only the fields that have changed
    const changedFields = pickBy(input, (value, key) => value != existing[key])

    const [updatedMembership] = await ctx.prisma.$transaction([
        ctx.prisma.teamMembership.update({
            where: { personId_teamId: { personId, teamId } },
            data: changedFields,
        }),
        ctx.prisma.teamChangeLog.create({
            data: {
                id: nanoId16(),
                teamId,
                actorId: ctx.personId,
                event: 'UpdateMember',
                fields: { personId, ...changedFields }
            }
        })
    ])

    return updatedMembership
}
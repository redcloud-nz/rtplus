/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { Person as PersonRecord, Team as TeamRecord, TeamMembership as TeamMembershipRecord } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { personSchema } from '@/lib/schemas/person'
import { teamSchema } from '@/lib/schemas/team'
import { TeamMembershipData, teamMembershipSchema } from '@/lib/schemas/team-membership'
import { nanoId16 } from '@/lib/id'
import { zodRecordStatus, zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter } from '../init'

import { getPersonById } from './personnel'
import { getTeamById, getTeamBySlug } from './teams'




export const teamMembershipsRouter = createTRPCRouter({

    create: authenticatedProcedure
        .meta({ teamAdminRequired: true })
        .input(teamMembershipSchema)
        .output(teamMembershipSchema.extend({
            person: personSchema,
            team: teamSchema
        }))
        .mutation(async ({ ctx, input }) => {

            // Check if the person and team exist
            const [person, team] = await Promise.all([
                getPersonById(ctx, input.personId),
                getTeamById(ctx, input.teamId)
            ])

            ctx.requireTeamAdmin(team.clerkOrgId)

            const created = await createTeamMembership(ctx, input)

            return { ...created, person: { personId: person.id, ...person }, team: { teamId: team.id, ...team } }
        }),

    byId: authenticatedProcedure
        .meta({ teamAccessRequired: true })
        .input(z.object({
            personId: zodNanoId8,
            teamId: zodNanoId8,
        }))
        .output(teamMembershipSchema.extend({
            person: personSchema,
            team: teamSchema
        }))
        .query(async ({ ctx, input }) => {

            const { person, team, ...membership } =  await getTeamMembershipById(ctx, input)

            ctx.requireTeamAccess(team.clerkOrgId)

            return { ...membership, person: { personId: person.id, ...person }, team: { teamId: team.id, ...team } }
        }),

    bySlug: authenticatedProcedure
        .meta({ teamAccessRequired: true })
        .input(z.object({
            personId: zodNanoId8,
            teamSlug: z.string(),
        }))
        .output(teamMembershipSchema.extend({
            person: personSchema,
            team: teamSchema
        }))
        .query(async ({ ctx, input }) => {

            const team = await getTeamBySlug(ctx, input.teamSlug)
            ctx.requireTeamAccess(team.clerkOrgId)

            const { person, ...membership } = await ctx.prisma.teamMembership.findUniqueOrThrow({
                where: { personId_teamId: { personId: input.personId, teamId: team.id }},
                include: { person: true }
            })

            return { ...membership, person: { personId: person.id, ...person }, team: { teamId: team.id, ...team } }
        }),

    byPerson: authenticatedProcedure
        .input(z.object({
            personId: zodNanoId8,
            status: zodRecordStatus
        }))
        .output(z.array(teamMembershipSchema.extend({
            team: teamSchema
        })))
        .query(async ({ ctx, input }) => {
            const memberships = await ctx.prisma.teamMembership.findMany({
                where: { 
                    personId: input.personId,
                    status: { in: input.status }
                },
                include: { team: true, d4hInfo: true },
                orderBy: { team: { name: 'asc' }}
            })

            return memberships.map(({ team, ...membership }) => ({ ...membership, team: { teamId: team.id, ...team } }))
        }),

    byTeam: authenticatedProcedure
        .input(z.object({
            teamId: zodNanoId8,
            status: zodRecordStatus
        }))
        .output(z.array(teamMembershipSchema.extend({
            person: personSchema,
        })))
        .query(async ({ ctx, input }) => {
            const team = await getTeamById(ctx, input.teamId)
            ctx.requireTeamAccess(team.clerkOrgId)

            const memberships = await ctx.prisma.teamMembership.findMany({
                where: { 
                    teamId: input.teamId, 
                    status: { in: input.status }
                },
                include: { person: true },
                orderBy: { person: { name: 'asc' }}
            })

            return memberships.map(({ person, ...membership }) => ({ ...membership, person: { personId: person.id, ...person } }))
        }),

    

    delete: authenticatedProcedure
        .meta({ teamAdminRequired: true })
        .input(z.object({
            teamId: zodNanoId8,
            personId: zodNanoId8,
        }))
        .output(teamMembershipSchema)
        .mutation(async ({ ctx, input }) => {

            const { team, ...membership } = await getTeamMembershipById(ctx, input)

            ctx.requireTeamAdmin(team.clerkOrgId)

            const deleted = await deleteTeamMembership(ctx, membership)

            return deleted
        }),
        

    update: authenticatedProcedure
        .meta({ teamAdminRequired: true })
        .input(teamMembershipSchema)
        .output(teamMembershipSchema)
        .mutation(async ({ ctx, input }) => {
            
            const { team, ...membership} = await getTeamMembershipById(ctx, input)

            ctx.requireTeamAdmin(team.clerkOrgId)

            const updatedMembership = await updateTeamMembership(ctx, membership, input)
            return updatedMembership
        }),

})

async function getTeamMembershipById(ctx: AuthenticatedContext, { personId, teamId }: { personId: string, teamId: string }): Promise<TeamMembershipRecord & { person: PersonRecord, team: TeamRecord }> {
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
export async function createTeamMembership(ctx: AuthenticatedContext, { personId, teamId, tags, status }: TeamMembershipData): Promise<TeamMembershipRecord> {

    const [created] = await ctx.prisma.$transaction([
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

    return created
}

/**
 * Remove a member from a team.
 * @param ctx TRPC Context.
 * @param membership The membership to remove.
 */
export async function deleteTeamMembership(ctx: AuthenticatedContext, { personId, teamId }: TeamMembershipRecord): Promise<TeamMembershipRecord> {

    const [deleted] = await ctx.prisma.$transaction([
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

    return deleted
}

/**
 * Update a team membership.
 * @param ctx TRPC Context.
 * @param membership The membership to update.
 * @param update The data to update the membership with.
 * @returns The updated team membership.
 */
export async function updateTeamMembership(ctx: AuthenticatedContext, membership: TeamMembershipRecord, update: TeamMembershipData): Promise<TeamMembershipRecord> {
    
    // Pick only the fields that have changed
    const changedFields = pickBy(update, (value, key) => value != membership[key])

    const [updated] = await ctx.prisma.$transaction([
        ctx.prisma.teamMembership.update({
            where: { personId_teamId: { personId: membership.personId, teamId: membership.teamId } },
            data: changedFields,
        }),
        ctx.prisma.teamChangeLog.create({
            data: {
                id: nanoId16(),
                teamId: membership.teamId,
                actorId: ctx.personId,
                event: 'UpdateMember',
                fields: { personId: membership.personId, ...changedFields }
            }
        })
    ])

    return updated
}
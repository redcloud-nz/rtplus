/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { personSchema, toPersonData } from '@/lib/schemas/person'
import { teamSchema, toTeamData } from '@/lib/schemas/team'
import { teamMembershipSchema, toTeamMembershipData } from '@/lib/schemas/team-membership'
import { nanoId16} from '@/lib/id'
import { zodRecordStatus, zodNanoId8 } from '@/lib/validation'

import { authenticatedProcedure, createTRPCRouter, orgAdminProcedure, orgProcedure } from '../init'
import { Messages} from '../messages'
import { getPersonById } from './personnel-router'
import { getTeamById } from './teams-router'




export const teamMembershipsRouter = createTRPCRouter({

    /**
     * Create a new team membership.
     * Requires the user to be a team admin or system admin.
     * @param input The team membership data.
     * @returns The created team membership.
     * @throws TRPCError(FORBIDDEN) If the user is not a an admin of the specified team.
     * @throws TRPCError(NOT_FOUND) If the person does not exist.
     * @throws TRPCError(CONFLICT) If the team membership already exists.
     */
    createTeamMembership: orgAdminProcedure
        .input(teamMembershipSchema)
        .output(teamMembershipSchema.extend({
            person: personSchema,
            team: teamSchema
        }))
        .mutation(async ({ ctx, input: { personId, teamId, ...fields } }) => {

            // Check if the person and team exist
            const [person, team] = await Promise.all([
                getPersonById(ctx, personId),
                getTeamById(ctx, teamId)
            ])

            if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.personNotFound(personId) })
            if(!team) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.teamNotFound(teamId) })

            const existing = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId, teamId } }
            })
            if(existing) throw new TRPCError({ code: 'CONFLICT', message: `Team membership for Person(${personId}) and Team(${teamId}) already exists.` })

            const [createdMembership] = await ctx.prisma.$transaction([
                ctx.prisma.teamMembership.create({
                    data: {
                        ...fields,
                        team: { connect: { teamId }},
                        person: { connect: { personId }},
                    }
                }),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        teamId,
                        actorId: ctx.auth.userId,
                        event: 'AddMember',
                        meta: { personId },
                        fields: fields
                    }
                })
            ])

            return { 
                ...toTeamMembershipData(createdMembership), 
                person: toPersonData(person), 
                team: toTeamData(team)
            }
        }),

    /**
     * Delete a team membership.
     * Requires the user to be a team admin or system admin.
     * @param input The team membership data.
     * @returns The deleted team membership.
     * @throws TRPCError(FORBIDDEN) If the user is not a an admin of the specified team.
     * @throws TRPCError(NOT_FOUND) If the team membership does not exist.
     */
    deleteTeamMembership: orgAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
            teamId: zodNanoId8,
        }))
        .output(teamMembershipSchema)
        .mutation(async ({ ctx, input: { personId, teamId } }) => {

            const existingMembership = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId, teamId } }
            })
            if(!existingMembership) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.teamMembershipNotFound(personId, teamId) })

            const [deletedMembership] = await ctx.prisma.$transaction([
                ctx.prisma.teamMembership.delete({ 
                    where: { personId_teamId: { personId, teamId }
                }}),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        teamId,
                        actorId: ctx.auth.userId,
                        event: 'RemoveMember',
                        meta: { personId },
                    }
                })
            ])

            return toTeamMembershipData(deletedMembership)
        }),

    /**
     * Get a team membership.
     * @param input The personId and teamId.
     * @returns The team membership.
     * @throws TRPCError(NOT_FOUND) If the team membership does not exist.
     */
    getTeamMembership: orgProcedure
        .input(z.object({
            personId: zodNanoId8,
            teamId: zodNanoId8,
        }))
        .output(teamMembershipSchema.extend({
            person: personSchema,
            team: teamSchema
        }))
        .query(async ({ ctx, input: { personId, teamId } }) => {

            const membership = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId, teamId }, team: { orgId: ctx.auth.activeOrg.orgId } },
                include: { person: true, team: true }
            })

            if(!membership) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.teamMembershipNotFound(personId, teamId) })
            

            return { 
                ...toTeamMembershipData(membership), 
                person: toPersonData(membership.person), 
                team: toTeamData(membership.team)
            }
        }),

    /**
     * Get team members filtered by person, team, or status.
     * @param input The user ID.
     * @returns The list of team memberships including person and team data.
     */
    getTeamMemberships: orgProcedure
        .input(z.object({
            personId: zodNanoId8.optional(),
            teamId: zodNanoId8.optional(),
            status: zodRecordStatus
        }))
        .output(z.array(teamMembershipSchema.extend({
            person: personSchema,
            team: teamSchema
        })))
        .query(async ({ ctx, input }) => {
            const memberships = await ctx.prisma.teamMembership.findMany({
                where: { 
                    personId: input.personId,
                    teamId: input.teamId,
                    status: { in: input.status },
                    team: { orgId: ctx.auth.activeOrg?.orgId }
                },
                include: { 
                    person: true, 
                    team: true, 
                    d4hInfo: true
                },
                orderBy: [{ team: { name: 'asc' } }, { person: { name: 'asc' } }]
            })

            return memberships.map(membership => ({ ...toTeamMembershipData(membership), person: toPersonData(membership.person), team: toTeamData(membership.team) }))
        }),

    /**
     * Update a team membership.
     * Requires the user to be a team admin or system admin.
     * @param input The person ID and team ID along with the updated fields.
     * @returns The updated team membership.
     * @throws TRPCError(FORBIDDEN) If the user is not a team admin or system admin.
     * @throws TRPCError(NOT_FOUND) If the team membership does not exist.
     */
    updateTeamMembership: orgAdminProcedure
        .input(teamMembershipSchema)
        .output(teamMembershipSchema)
        .mutation(async ({ ctx, input: { personId, teamId, ...update } }) => {

            const existing = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId, teamId } }
            })
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.teamMembershipNotFound(personId, teamId) })

            // Pick only the fields that have changed
            const changedFields = pickBy(update, (value, key) => value != existing[key])

            const [updated] = await ctx.prisma.$transaction([
                ctx.prisma.teamMembership.update({
                    where: { personId_teamId: { personId, teamId } },
                    data: changedFields,
                }),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        teamId,
                        actorId: ctx.auth.userId,
                        event: 'UpdateMember',
                        meta: { personId },
                        fields: changedFields
                    }
                })
            ])

            return toTeamMembershipData(updated)
        }),

})
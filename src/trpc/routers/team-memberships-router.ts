/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { PersonId, personRefSchema, toPersonRef } from '@/lib/schemas/person'
import { TeamId, teamRefSchema, toTeamRef } from '@/lib/schemas/team'
import { teamMembershipSchema, toTeamMembershipData } from '@/lib/schemas/team-membership'
import { recordStatusParameterSchema } from '@/lib/validation'

import { createTRPCRouter, orgAdminProcedure, orgProcedure } from '../init'
import { Messages} from '../messages'
import { getPersonById } from './personnel-router'
import { getTeamById } from './teams-router'
import { diffObject } from '@/lib/diff'




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
            person: personRefSchema,
            team: teamRefSchema
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

            const changes = diffObject({ tags: [], properties: {}, status: 'Active' }, fields)

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
                        userId: ctx.auth.userId,
                        event: 'AddMember',
                        meta: { personId },
                        changes: changes as object[]
                    }
                })
            ])

            return { 
                ...toTeamMembershipData(createdMembership), 
                person: toPersonRef(person), 
                team: toTeamRef(team)
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
            personId: PersonId.schema,
            teamId: TeamId.schema,
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
                        userId: ctx.auth.userId,
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
            personId: PersonId.schema,
            teamId: TeamId.schema,
        }))
        .output(teamMembershipSchema.extend({
            person: personRefSchema,
            team: teamRefSchema
        }))
        .query(async ({ ctx, input: { personId, teamId } }) => {

            const membership = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId, teamId }, team: { orgId: ctx.auth.activeOrg.orgId } },
                include: { person: true, team: true }
            })

            if(!membership) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.teamMembershipNotFound(personId, teamId) })
            

            return { 
                ...toTeamMembershipData(membership), 
                person: toPersonRef(membership.person), 
                team: toTeamRef(membership.team)
            }
        }),

    /**
     * Get team members filtered by person, team, or status.
     * @param input The user ID.
     * @returns The list of team memberships including person and team data.
     */
    getTeamMemberships: orgProcedure
        .input(z.object({
            personId: PersonId.schema.optional(),
            teamId: TeamId.schema.optional(),
            status: recordStatusParameterSchema
        }))
        .output(z.array(teamMembershipSchema.extend({
            person: personRefSchema,
            team: teamRefSchema
        })))
        .query(async ({ ctx, input }) => {
             await Promise.all([
                input.personId ? getPersonById(ctx, input.personId) : null,
                input.teamId ? getTeamById(ctx, input.teamId) : null
            ])

            const memberships = await ctx.prisma.teamMembership.findMany({
                where: { 
                    personId: input.personId,
                    teamId: input.teamId,
                    status: { in: input.status },
                },
                include: { 
                    person: true, 
                    team: true, 
                    d4hInfo: true
                },
                orderBy: [{ team: { name: 'asc' } }, { person: { name: 'asc' } }]
            })

            return memberships.map(membership => ({ ...toTeamMembershipData(membership), person: toPersonRef(membership.person), team: toTeamRef(membership.team) }))
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
        .mutation(async ({ ctx, input: { personId, teamId, ...fields } }) => {

            const existing = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId, teamId } }
            })
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.teamMembershipNotFound(personId, teamId) })

            const changes = diffObject(teamMembershipSchema.omit({ personId: true, teamId: true }).parse(existing), fields)


            const [updated] = await ctx.prisma.$transaction([
                ctx.prisma.teamMembership.update({
                    where: { personId_teamId: { personId, teamId } },
                    data: fields,
                }),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        teamId,
                        userId: ctx.auth.userId,
                        event: 'UpdateMember',
                        meta: { personId },
                        changes: changes as object[]
                    }
                })
            ])

            return toTeamMembershipData(updated)
        }),

})
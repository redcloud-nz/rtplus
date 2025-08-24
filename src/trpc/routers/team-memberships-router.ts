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
import { nanoId16, nanoId8 } from '@/lib/id'
import { zodRecordStatus, zodNanoId8 } from '@/lib/validation'
import { fetchPersonByIdCached } from '@/server/data/person'
import { fetchTeamByIdCached } from '@/server/data/team'

import { authenticatedProcedure, createTRPCRouter, teamAdminProcedure } from '../init'
import { Messages} from '../messages'


export const teamMembershipsRouter = createTRPCRouter({

    /**
     * Create a new team membership from a name and email address.
     * If the person already exists with the specified email address, we will use that person instead of creating a new one.
     * @param input The team membership data along with the person's name and email.
     * @returns The created team membership data.
     * @throws TRPCError(FORBIDDEN) if the user is not authorized to create the membership.
     * @throws TRPCError(CONFLICT) if the team membership already exists.
     */
    createLinkedTeamMembership: teamAdminProcedure
        .input(teamMembershipSchema.omit({ personId: true }).merge(personSchema.pick({ name: true, email: true })))
        .output(teamMembershipSchema.extend({
            person: personSchema,
            team: teamSchema
        }))
        .mutation(async ({ ctx, input }) => {
            const team = await fetchTeamByIdCached(input.teamId)
            if(!team || !ctx.hasTeamAccess(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(input.teamId) })

            // First check if the person already exists by email
            // If they do, we will use that person instead of creating a new one
            const existingPerson = await ctx.prisma.person.findUnique({
                where: { email: input.email },
            })

            if(existingPerson) {
                // If there is an existing person, check if there is an existing membership
                const existingMembership = await ctx.prisma.teamMembership.findUnique({
                    where: { personId_teamId: { personId: existingPerson.id, teamId: input.teamId } }
                })
                if(existingMembership) throw new TRPCError({ code: 'CONFLICT', message: `Team membership for Person(${existingPerson.id}) and Team(${input.teamId}) already exists.` })
            }

            const person = existingPerson || await ctx.prisma.person.create({
                data: {
                    id: nanoId8(),
                    email: input.email,
                    name: input.name,
                    status: input.status,
                    owningTeam: { connect: { id: input.teamId } },
                    sandbox: team.sandbox,

                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            actorId: ctx.session.personId,
                            event: 'Create',
                            fields: {
                                email: input.email,
                                name: input.name,
                                status: input.status
                            }
                        }
                    }
                }
            })

            // Then create the membership
            const [createdMembership] = await ctx.prisma.$transaction([
                ctx.prisma.teamMembership.create({
                    data: {
                        status: input.status,
                        tags: input.tags,
                        team: { connect: { id: input.teamId }},
                        person: { connect: { id: person.id }},
                    }
                }),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        id: nanoId16(),
                        teamId: input.teamId,
                        actorId: ctx.session.personId,
                        event: 'AddMember',
                        meta: { personId: person.id },
                        fields: { tags: input.tags, status: input.status }
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
     * Create a new team membership.
     * Requires the user to be a team admin or system admin.
     * @param input The team membership data.
     * @returns The created team membership.
     * @throws TRPCError(FORBIDDEN) If the user is not a an admin of the specified team.
     * @throws TRPCError(NOT_FOUND) If the person does not exist.
     * @throws TRPCError(CONFLICT) If the team membership already exists.
     */
    createTeamMembership: teamAdminProcedure
        .input(teamMembershipSchema)
        .output(teamMembershipSchema.extend({
            person: personSchema,
            team: teamSchema
        }))
        .mutation(async ({ ctx, input: { personId, teamId, ...fields } }) => {
            const team = await fetchTeamByIdCached(teamId)
            if(!team || !ctx.hasTeamAccess(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(teamId) })

            // Check if the person and team exist
            const person = await fetchPersonByIdCached(personId)

            if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.personNotFound(personId) })
            if(person.sandbox && !team.sandbox) throw new TRPCError({ code: 'BAD_REQUEST', message: "Sandbox personnel cannot be added to non-sandbox teams." })

            const existing = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId, teamId } }
            })
            if(existing) throw new TRPCError({ code: 'CONFLICT', message: `Team membership for Person(${personId}) and Team(${teamId}) already exists.` })

            const [createdMembership] = await ctx.prisma.$transaction([
                ctx.prisma.teamMembership.create({
                    data: {
                        ...fields,
                        team: { connect: { id: teamId }},
                        person: { connect: { id: personId }},
                    }
                }),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        id: nanoId16(),
                        teamId,
                        actorId: ctx.session.personId,
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
    deleteTeamMembership: teamAdminProcedure
        .input(z.object({
            teamId: zodNanoId8,
            personId: zodNanoId8,
        }))
        .output(teamMembershipSchema)
        .mutation(async ({ ctx, input: { personId, teamId } }) => {
            const team = await fetchTeamByIdCached(teamId)
            if(!team || !ctx.hasTeamAccess(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(teamId) })

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
                        id: nanoId16(),
                        teamId,
                        actorId: ctx.session.personId,
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
    getTeamMembership: authenticatedProcedure
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
                where: { personId_teamId: { personId, teamId } },
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
    getTeamMemberships: authenticatedProcedure
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
                    status: { in: input.status }
                },
                include: { person: true, team: true, d4hInfo: true },
                orderBy: { team: { name: 'asc' }}
            })

            return memberships.map(membership => ({ ...toTeamMembershipData(membership), person: toPersonData(membership.person), team: toTeamData(membership.team) }))
        }),

    /**
     * Update a team membership along with the linked person.
     * @param input The team membership and person data to update.
     * @returns The updated team membership and person data.
     * @throws TRPCError(NOT_FOUND) If the team membership does not exist.
     * @throws TRPCError(FORBIDDEN) If the user does not have permission to update the membership.
     */
    updateLinkedTeamMembership: teamAdminProcedure
        .input(teamMembershipSchema.merge(personSchema.pick({ name: true, email: true })))
        .output(teamMembershipSchema.extend({
            person: personSchema,
            team: teamSchema
        }))
        .mutation(async ({ ctx, input: { personId, teamId, ...update } }) => {
            const team = await fetchTeamByIdCached(teamId)
            if(!team || !ctx.hasTeamAccess(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(teamId) })

            const existingMembership = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId, teamId } },
                include: { person: true }
            })
            if(!existingMembership) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.teamMembershipNotFound(personId, teamId) })
        
            let person = existingMembership.person
            if(update.name != person.name || update.email != person.email) {
                // Person details have changed

                if(person.owningTeamId == teamId) {
                    // If the person is owned by this team, we can update them directly
                    person = await ctx.prisma.person.update({
                        where: { id: personId },
                        data: {
                            name: update.name,
                            email: update.email,
                            changeLogs: {
                                create: {
                                    id: nanoId16(),
                                    actorId: ctx.session.personId,
                                    event: 'Update',
                                    fields: pickBy({ name: update.name, email: update.email }, (value, key) => value != existingMembership.person[key])
                                }
                            }
                        }
                    })
                }
            }

            if(update.tags != existingMembership.tags || update.status != existingMembership.status) {
                // Membership details have changed
                const [updatedMembership] = await ctx.prisma.$transaction([
                    ctx.prisma.teamMembership.update({
                        where: { personId_teamId: { personId, teamId } },
                        data: pickBy({ tags: update.tags, status: update.status }, (value, key) => value != existingMembership[key])
                    }),
                    ctx.prisma.teamChangeLog.create({
                        data: {
                            id: nanoId16(),
                            teamId,
                            actorId: ctx.session.personId,
                            event: 'UpdateMember',
                            meta: { personId },
                            fields: pickBy({ tags: update.tags, status: update.status }, (value, key) => value != existingMembership[key])
                        }
                    })
                ])
                return { 
                    ...toTeamMembershipData(updatedMembership), 
                    person: toPersonData(person), 
                    team: toTeamData(team)
                }
            }

            return {
                ...toTeamMembershipData(existingMembership),
                person: toPersonData(person),
                team: toTeamData(team)
            }
        }),

    /**
     * Update a team membership.
     * Requires the user to be a team admin or system admin.
     * @param input The person ID and team ID along with the updated fields.
     * @returns The updated team membership.
     * @throws TRPCError(FORBIDDEN) If the user is not a team admin or system admin.
     * @throws TRPCError(NOT_FOUND) If the team membership does not exist.
     */
    updateTeamMembership: teamAdminProcedure
        .input(teamMembershipSchema)
        .output(teamMembershipSchema)
        .mutation(async ({ ctx, input: { personId, teamId, ...update } }) => {

            const teamRecord = await fetchTeamByIdCached(teamId)
            if(!teamRecord || !ctx.hasTeamAccess(teamRecord)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(teamId) })

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
                        id: nanoId16(),
                        teamId,
                        actorId: ctx.session.personId,
                        event: 'UpdateMember',
                        meta: { personId },
                        fields: changedFields
                    }
                })
            ])

            return toTeamMembershipData(updated)
        }),

})
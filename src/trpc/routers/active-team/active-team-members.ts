/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'
import { Person as PersonRecord } from '@prisma/client'

import { personSchema, toPersonData } from '@/lib/schemas/person'
import { teamSchema, toTeamData } from '@/lib/schemas/team'
import { teamMembershipSchema, toTeamMembershipData } from '@/lib/schemas/team-membership'
import { nanoId16, nanoId8 } from '@/lib/id'
import { zodRecordStatus, zodNanoId8 } from '@/lib/validation'

import { createTRPCRouter, teamAdminProcedure, teamProcedure } from '../../init'
import { getPersonById, updatePerson } from '../personnel'
import { getActiveTeam } from '../teams'


/**
 * Router for managing team memberships in the active team context.
 * Provides procedures to create, read, update, and delete team memberships.
 */
export const activeTeamMembersRouter = createTRPCRouter({

    /**
     * Create a new team membership for the active team using an existing person.
     * @param ctx The authenticated context.
     * @param input.personId The ID of the person to add to the team.
     * @param input.tags Optional tags for the membership.
     * @param input.status The status of the membership.
     * @returns The created team membership with person data.
     * @throws TRPCError(NOT_FOUND) if the person doesn't exist.
     * @throws TRPCError(CONFLICT) if the person is already a member of the team.
     */
    createTeamMembership: teamAdminProcedure
        .input(teamMembershipSchema.omit({ teamId: true }))
        .output(teamMembershipSchema.extend({ 
            person: personSchema, 
            team: teamSchema
        }))
        .mutation(async ({ ctx, input: { personId, tags, status } }) => {

            const team = await getActiveTeam(ctx)   
            const person = await getPersonById(ctx, personId)
            
            const existing = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId, teamId: team.id } }
            })
            if(existing) throw new TRPCError({ code: 'CONFLICT', message: `Person(${personId}) is already a member of Team(${team.id})` })

            
            const [created] = await ctx.prisma.$transaction([
                ctx.prisma.teamMembership.create({
                    data: {
                        status,
                        tags,
                        team: { connect: { id: team.id }},
                        person: { connect: { id: personId }},
                    }
                }),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        id: nanoId16(),
                        teamId: team.id,
                        actorId: ctx.session.personId,
                        event: 'AddMember',
                        fields: { personId, status }
                    }
                })
            ])

            return { ...toTeamMembershipData(created), person: toPersonData(person), team: toTeamData(team) }
        }),

    /**
     * Create a new team membership for the active team including creating a new person (if they don't exist).
     * This is useful for adding a new member to the team while also creating their person record
     * @param ctx The authenticated context.
     * @param input.name The name of the new person.
     * @param input.email The email of the new person.
     * @param input.tags Optional tags for the membership.
     * @param input.status The status of the membership.
     * @returns The created team membership with person details.
     * @throws TRPCError(CONFLICT) If a person with the same email is already a member of the team.
     */
    createTeamMembershipWithPerson: teamAdminProcedure
        .input(personSchema.pick({ name: true, email: true }).merge(teamMembershipSchema.pick({ tags: true, status: true })))
        .output(teamMembershipSchema.extend({ 
            person: personSchema, team: teamSchema
        }))
        .mutation(async ({ ctx, input }) => {
            const team = await getActiveTeam(ctx)

            // First check if the person already exists by email
            // If they do, we will use that person instead of creating a new one
            const existingPerson = await ctx.prisma.person.findUnique({
                where: { email: input.email },
            })


            if(existingPerson) {
                const existingMembership = await ctx.prisma.teamMembership.findUnique({
                    where: { personId_teamId: { personId: existingPerson.id, teamId: team.id } }
                })
                if(existingMembership) {
                    throw new TRPCError({ code: 'CONFLICT', message: `Person with email ${input.email} is already a member of Team(${team.id})` })
                }
            }

            const person = existingPerson || await ctx.prisma.person.create({
                data: {
                    id: nanoId8(),
                    name: input.name,
                    email: input.email,
                    status: input.status,
                }
            })

            // Then create the membership
            const [created] = await ctx.prisma.$transaction([
                ctx.prisma.teamMembership.create({
                    data: {
                        status: input.status,
                        tags: input.tags,
                        team: { connect: { id: team.id }},
                        person: { connect: { id: person.id }},
                    }
                }),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        id: nanoId16(),
                        teamId: team.id,
                        actorId: ctx.session.personId,
                        event: 'AddMember',
                        fields: { personId: person.id, status: input.status }
                    }
                })
            ])

            return { ...toTeamMembershipData(created), person: toPersonData(person), team: toTeamData(team) }
        }),

    /**
     * Remove a member from the active team.
     * @param ctx The authenticated context.
     * @param input.personId The ID of the person to remove from the team.
     * @returns The deleted team membership with person details.
     * @throws TRPCError(NOT_FOUND) if the membership doesn't exist.
     */
    deleteTeamMembership: teamAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
        }))
        .output(teamMembershipSchema.extend({
            person: personSchema,
        }))
        .mutation(async ({ ctx, input }) => {

            const team = await getActiveTeam(ctx)
            const membership = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId: input.personId, teamId: team.id } },
                include: { person: true }
            })
            if(!membership) throw new TRPCError({ code: 'NOT_FOUND', message: `No membership found for Person(${input.personId}) in Team(${team.id})` })

            const [deleted] = await ctx.prisma.$transaction([
                ctx.prisma.teamMembership.delete({
                    where: { personId_teamId: { personId: input.personId, teamId: team.id } }
                }),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        id: nanoId16(),
                        teamId: team.id,
                        actorId: ctx.session.personId,
                        event: 'RemoveMember',
                        fields: { personId: input.personId, status: membership.status }
                    }
                })
            ])

            return { ...toTeamMembershipData(deleted), person: toPersonData(membership.person) }
        }),

    /**
     * Fetch a specific team membership by person ID for the active team.
     * @param ctx The authenticated context.
     * @param input.personId The ID of the person to fetch the membership for.
     * @returns The team membership with person details.
     * @throws TRPCError(NOT_FOUND) if the membership doesn't exist.
     */
    getTeamMember: teamProcedure
        .input(z.object({
            personId: zodNanoId8,
        }))
        .output(teamMembershipSchema.extend({
            person: personSchema,
            team: teamSchema
        }))
        .query(async ({ ctx, input }) => {
            
            const team = await ctx.prisma.team.findUnique({
                where: { clerkOrgId: ctx.session.activeTeam.orgId },
                include: {
                    teamMemberships: {
                        where: { personId: input.personId },
                        include: { person: true, team: true }
                    }
                }
            })
            if(!team) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `No team found for active Organization(${ctx.session.activeTeam.orgId})` })
            if(team.teamMemberships.length === 0) throw new TRPCError({ code: 'NOT_FOUND', message: `No membership found for Person(${input.personId}) in Team(${team.id})` })

            const membership = team.teamMemberships[0]
            return { 
                ...toTeamMembershipData(membership), 
                person: toPersonData(membership.person),
                team: toTeamData(membership.team)
            }
        }),

    /**
     * Fetch all team members for the active team.
     * @param ctx The authenticated context.
     * @param input.status Optional filter for membership status.
     * @returns An array of team memberships with person details.
     */
    getTeamMembers: teamProcedure
        .input(z.object({
            status: zodRecordStatus
        }))
        .output(z.array(teamMembershipSchema.extend({
            person: personSchema,
        })))
        .query(async ({ ctx, input }) => {
            
            const team = await ctx.prisma.team.findUnique({
                where: { clerkOrgId: ctx.session.activeTeam.orgId },
                include: {
                    teamMemberships: {
                        where: { status: { in: input.status } },
                        include: { person: true }
                    }
                }
            })
            if(!team) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `No team found for active Organization(${ctx.session.activeTeam.orgId})` })

            return team.teamMemberships.map(m => ({
                ...m,
                person: { personId: m.person.id, ...m.person }
            }))
        }),

    /**
     * Update an existing team membership for the active team.
     * 
     * If the person details (name or email) are changed, it will also update the person record.
     * 
     * @param ctx The authenticated context.
     * @param input.personId The ID of the person to update the membership for.
     * @param input.name The new name of the person.
     * @param input.email The new email of the person.
     * @param input.tags The new tags for the membership.
     * @param input.status The new status of the membership.
     * 
     * @returns The updated team membership with person details.
     * 
     * @throws TRPCError(NOT_FOUND) if the membership doesn't exist.
     * @throws TRPCError(FORBIDDEN) if the person is not owned by the team and the name or email is being changed.
     * @throws TRPCError(CONFLICT) If the email is being changed and a person with the same email already exists.
     */
    updateTeamMembership: teamAdminProcedure
        .input(teamMembershipSchema.omit({ teamId: true }).merge(personSchema.pick({ name: true, email: true })))
        .output(teamMembershipSchema.extend({
            person: personSchema,
        }))
        .mutation(async ({ ctx, input: { personId, name, email, tags, status } }) => {
            const team = await getActiveTeam(ctx)
            const existingMembership = await ctx.prisma.teamMembership.findUnique({
                where: { personId_teamId: { personId, teamId: team.id } },
                include: { person: true }
            })
            if(!existingMembership) throw new TRPCError({ code: 'NOT_FOUND', message: `No membership found for Person(${personId}) in Team(${team.id})` })

            let person: PersonRecord = existingMembership.person
            if(name !== existingMembership.person.name || email !== existingMembership.person.email) {
                // Person details have changed

                if(existingMembership.person.owningTeamId != team.id) throw new TRPCError({ code: 'FORBIDDEN', message: `Cannot update person details for Person(${personId}) not owned by Team(${team.id})` })
                
                person = await updatePerson(ctx, existingMembership.person, { personId, name, email, status: existingMembership.person.status, owningTeamId: team.id })
                
            }

            if(tags != existingMembership.tags || status != existingMembership.status) {
                // Update the membership
                const [updatedMembership] = await ctx.prisma.$transaction([
                    ctx.prisma.teamMembership.update({
                        where: { personId_teamId: { personId, teamId: team.id }},
                        data: { tags, status }
                    }),
                    ctx.prisma.teamChangeLog.create({
                        data: {
                            id: nanoId16(),
                            teamId: team.id,
                            actorId: ctx.session.personId,
                            event: 'UpdateMember',
                            fields: { personId, status }
                        }
                    })
                ])

                return { ...toTeamMembershipData(updatedMembership), person: toPersonData(person) }
            }

            return { ...toTeamMembershipData(existingMembership), person: toPersonData(person) }
        })
})
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { pick } from 'remeda'
import { z } from 'zod'

import { Person, TeamMembership } from '@prisma/client'

import { addTeamMemberFormSchema } from '@/lib/forms/add-team-member'

import { createTRPCRouter, teamAdminProcedure, teamProcedure } from '../init'
import { PersonBasic } from '../types'

import { createPerson } from './personnel'
import { acceptInvite, createTeamMembership, updateTeamMembership } from './team-memberships'
import { nanoId8 } from '@/lib/id'




/**
 * Router for the current "Active" team
 */
export const currentTeamRouter = createTRPCRouter({

    acceptInvite: teamProcedure
        .mutation(async ({ ctx }) => {
            const team = await ctx.prisma.team.findUnique({
                where: { slug: ctx.teamSlug },
            })
            if(!team) throw new Error(`Missing active team for teamSlug='${ctx.teamSlug}'`)
        }),
    addMember: teamProcedure
        .input(addTeamMemberFormSchema)
        .mutation(async ({ ctx, input }): Promise<TeamMembership & { person: Person }> => {
            
            const team = await ctx.prisma.team.findUnique({
                where: { slug: ctx.teamSlug },
            })
            if(!team) throw new Error(`Missing active team for teamSlug='${ctx.teamSlug}'`)

            if(input.existingPersonId) {
                // Add existing person to team
                const existingPerson = await ctx.prisma.person.findUnique({
                    where: { id: input.existingPersonId },
                })
                if(!existingPerson) throw new Error(`Person with ID '${input.existingPersonId}' not found.`)

                // Check if they are already a member of the team
                const existingMembership = await ctx.prisma.teamMembership.findFirst({
                    where: {
                        personId: existingPerson.id,
                        teamId: team.id,
                    }
                })
                
                const membership = existingMembership
                    ? await updateTeamMembership(ctx, { membership: existingMembership, person: existingPerson, team, role: input.role, status: 'Active' })
                    : await createTeamMembership(ctx, { person: existingPerson, team, role: input.role, status: 'Active' })

                return { ...membership, person: existingPerson }

            } else {
                const createdPerson = await createPerson(ctx, { ...input, personId: nanoId8(), status: 'Active' })

                const createdMembership = await createTeamMembership(ctx, { person: createdPerson, team, role: input.role, status: 'Active' })

                return { ...createdMembership, person: createdPerson }
            }

            
        }),

    /**
     * Validates an email address against the current team.
     * Returns the person if found, along with their team membership if they are a member of the current team.
     * If the person is not found, returns null for both.
     */
    validateEmail: teamAdminProcedure
        .input(z.object({
            email: z.string().email('Invalid email address')
        }))
        .query(async ({ ctx, input }): Promise<{ person: PersonBasic | null, teamMembership: TeamMembership | null  }> => {
            const team = await ctx.prisma.team.findUnique({
                where: { slug: ctx.teamSlug },
            })
            if(!team) throw new Error(`Missing active team for teamSlug='${ctx.teamSlug}'`)

            const person = await ctx.prisma.person.findFirst({
                where: { email: input.email },
                include: {
                    teamMemberships: {
                        where: { teamId: team.id },
                    }
                }
            })

            return {
                person: person ? pick(person, ['id', 'name', 'email', 'status']) : null,
                teamMembership: person?.teamMemberships.length === 1 ? person.teamMemberships[0] : null
             }
        }),
        

    members: teamProcedure
        .query(async ({ ctx }): Promise<(TeamMembership & { person: Person })[]> => {
          
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

            if(!team) throw new Error(`Missing active team for teamSlug='${ctx.teamSlug}'`)

            return team.teamMemberships
        })
})

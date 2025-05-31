/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { pick } from 'remeda'
import { z } from 'zod'

import { Person, TeamMembership } from '@prisma/client'

import { addTeamMemberFormSchema } from '@/lib/forms/add-team-member'

import { createTRPCRouter, teamAdminProcedure, teamProcedure } from '../init'



/**
 * Router for the current "Active" team
 */
export const currentTeamRouter = createTRPCRouter({

    addMember: teamProcedure
        .input(addTeamMemberFormSchema)
        .mutation(async ({ ctx, input }) => {
            
        }),

    memberByEmail: teamAdminProcedure
        .input(z.object({
            email: z.string().email('Invalid email address')
        }))
        .query(async ({ ctx, input }): Promise<{ person: Pick<Person, 'id' | 'name' | 'email' | 'status'> | null, teamMembership: TeamMembership | null  }> => {
            const team = await ctx.prisma.team.findUnique({
                where: { slug: ctx.teamSlug },
            })
            if(!team) throw new Error(`Missing active team for teamSlug='${ctx.teamSlug}'`)

            const found = await ctx.prisma.person.findFirst({
                where: { email: input.email },
                include: {
                    teamMemberships: {
                        where: { teamId: team.id },
                    }
                }
            })

            return {
                person: found ? pick(found, ['id', 'name', 'email', 'status']) : null,
                teamMembership: found?.teamMemberships.length === 1 ? found.teamMemberships[0] : null
             }
        }),

    members: teamProcedure
        .query(async ({ ctx }) => {
          
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
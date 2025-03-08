/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { clerkClient } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'

import { createTRPCRouter, systemAdminProcedure } from '../init'
import { TeamMembershipWithPerson, TeamMembershipWithTeam } from '../types'


export const teamMembershipsRouter = createTRPCRouter({
    create: systemAdminProcedure
        .input(z.object({
            teamId: z.string().uuid(),
            personId: z.string().uuid(),
            role: z.enum(['Admin', 'Member', 'None'])
        }))
        .mutation(async ({ ctx, input }) => {
            const { teamId, personId, role } = input

            // Check if the team member already exists
            const existing = await ctx.prisma.teamMembership.findFirst({ where: { teamId, personId }, include: { person: true, team: true } })
            if(existing) throw new TRPCError({ code: 'CONFLICT', message: `Person(${existing.person.name}) is already a member of Team(${existing.team.name}).` })

            const [createdMembership] = await ctx.prisma.$transaction([
                ctx.prisma.teamMembership.create({
                    data: {
                        team: { connect: { id: teamId }},
                        person: { connect: { id: personId }},
                    },
                    include: { person: true, team: true, d4hInfo: true }
                }),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        teamId,
                        actorId: ctx.personId,
                        event: 'AddMember',
                        fields: { personId }
                    }
                })
            ])

            if(createdMembership.team.clerkOrgId && createdMembership.person.clerkUserId && role != 'None') {
                // Add the person to the clerk organization
                const clerk = await clerkClient()
                await clerk.organizations.createOrganizationMembership({
                    organizationId: createdMembership.team.clerkOrgId,
                    userId: createdMembership.person.clerkUserId,
                    role: role == 'Admin' ? 'org:admin' : 'org:member'
                })
            }

            return createdMembership
        }),

    byPerson: systemAdminProcedure
        .input(z.object({
            personId: z.string().uuid()
        }))
        .query(async ({ ctx, input }): Promise<TeamMembershipWithTeam[]> => {
            return ctx.prisma.teamMembership.findMany({
                where: { personId: input.personId, status: 'Active' },
                include: { team: true, d4hInfo: true }
            })
        }),

    byTeam: systemAdminProcedure
        .input(z.object({
            teamId: z.string().uuid()
        }))
        .query(async ({ ctx, input }): Promise<TeamMembershipWithPerson[]> => {
            return ctx.prisma.teamMembership.findMany({
                where: { teamId: input.teamId, status: 'Active' },
                include: { person: true, d4hInfo: true }
            })
        }),

    delete: systemAdminProcedure
        .input(z.object({
            teamId: z.string().uuid(),
            personId: z.string().uuid(),
            hard: z.boolean().optional().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.prisma.teamMembership.findFirst({ 
                where: { teamId: input.teamId, personId: input.personId },
                include: { team: true, person: true }
            })
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })

            if(input.hard) {
                // Hard delete the membership
                await ctx.prisma.teamMembership.delete({ where: { id: existing.id }})

            } else {
                // Soft delete
                await ctx.prisma.teamMembership.update({
                    where: { id: existing.id },
                    data: { role: 'None', status: 'Inactive' }
                })
            }

            // Record the change event
            await ctx.prisma.teamChangeLog.create({
                data: {
                    teamId: input.teamId,
                    actorId: ctx.personId,
                    event: 'RemoveMember',
                    fields: { personId: input.personId }    
                }
            })

            if(existing.role != 'None' && existing.team.clerkOrgId) {
                // Remove the person from the clerk organization
                const clerk = await clerkClient()
                clerk.organizations.deleteOrganizationMembership({
                    organizationId: existing.team.clerkOrgId,
                    userId: existing.person.clerkUserId!
                })
            }
        }),

    update: systemAdminProcedure
        .input(z.object({
            teamId: z.string().uuid(),
            personId: z.string().uuid(),
            role: z.enum(['Admin', 'Member', 'None'])
        }))
        .mutation(async ({ ctx, input }) => {

        })
})
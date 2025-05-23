/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pick } from 'remeda'
import { match } from 'ts-pattern'
import { z } from 'zod'

import { clerkClient, createClerkClient } from '@clerk/nextjs/server'
import { TeamMembershipRole } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { teamMembershipFormSchema } from '@/lib/forms/team-membership'
import { nanoId16 } from '@/lib/id'
import { zodDeleteType, zodRecordStatus, zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, createTRPCRouter, systemAdminProcedure } from '../init'
import { TeamMembershipWithPerson, TeamMembershipWithPersonAndTeam, TeamMembershipWithTeam } from '../types'



export const teamMembershipsRouter = createTRPCRouter({
    create: systemAdminProcedure
        .input(teamMembershipFormSchema)
        .mutation(async ({ ctx, input }) => {
            const { teamId, personId } = input

            // Check if the team member already exists
            const existing = await ctx.prisma.teamMembership.findFirst({ where: { teamId, personId }, include: { person: true, team: true } })
            if(existing?.status == 'Active' || existing?.status == 'Inactive') 
                throw new TRPCError({ code: 'CONFLICT', message: `'${existing.person.name}' is already a member of '${existing.team.name}'.` })

            return addTeamMember(ctx, { teamId, personId, role: input.role, restoreId: existing?.id })
        }),

    byPerson: systemAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
            status: zodRecordStatus
        }))
        .query(async ({ ctx, input }): Promise<TeamMembershipWithTeam[]> => {
            return ctx.prisma.teamMembership.findMany({
                where: { 
                    personId: input.personId, 
                    status: { in: input.status }
                },
                include: { team: true, d4hInfo: true },
                orderBy: { team: { name: 'asc' }}
            })
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
            deleteType: zodDeleteType
        }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.prisma.teamMembership.findFirst({ 
                where: { teamId: input.teamId, personId: input.personId },
                include: { team: true, person: true, d4hInfo: true }
            })
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })

            await removeTeamMember(ctx, { membership: existing, deleteType: input.deleteType })

            return pick(existing, ['id', 'teamId', 'personId', 'role'])
        }),

    update: systemAdminProcedure
        .input(teamMembershipFormSchema)
        .mutation(async ({ ctx, input }): Promise<TeamMembershipWithPersonAndTeam> => {
            const existing = await ctx.prisma.teamMembership.findFirst({ 
                where: { teamId: input.teamId, personId: input.personId },
                include: { team: true, person: true, d4hInfo: true }
            })
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })

            if(input.role == existing.role) return existing

            return updateTeamMember(ctx, { membership: existing, newRole: input.role })
        })
})


/**
 * Add a member to a team
 * @param ctx TRPC Context.
 * @param teamId The team ID.
 * @param personId The person ID.
 * @param role The role to assign to the person.
 * @param restoreId The ID of the membership to restore, if applicable.
 * @returns The created team membership.
 */
export async function addTeamMember(ctx: AuthenticatedContext, { teamId, personId, role, restoreId }: { teamId: string, personId: string, role: TeamMembershipRole, restoreId: string | undefined }): Promise<TeamMembershipWithPersonAndTeam> {
    
    const [createdMembership] = await ctx.prisma.$transaction([
        restoreId
            ? ctx.prisma.teamMembership.update({
                where: { id: restoreId },
                data: { status: 'Active', role },
                include: { person: true, team: true, d4hInfo: true }
            })
            : ctx.prisma.teamMembership.create({
                data: {
                    id: nanoId16(),
                    team: { connect: { id: teamId }},
                    person: { connect: { id: personId }},
                    role: role,
                },
                include: { person: true, team: true, d4hInfo: true }
            }),
        ctx.prisma.teamChangeLog.create({
            data: {
                id: nanoId16(),
                teamId,
                actorId: ctx.personId,
                event: 'AddMember',
                fields: { personId, role }
            }
        })
    ])

    if(createdMembership.person.clerkUserId && role != 'None') {
        // Add the person to the clerk organization
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
        await clerk.organizations.createOrganizationMembership({
            organizationId: createdMembership.team.clerkOrgId,
            userId: createdMembership.person.clerkUserId,
            role: role == 'Admin' ? 'org:admin' : 'org:member'
        })
    }

    return createdMembership
}

/**
 * Remove a member from a team.
 * @param ctx TRPC Context.
 * @param membership The membership to remove.
 * @param deleteType The type of delete to perform.
 */
export async function removeTeamMember(ctx: AuthenticatedContext, { membership, deleteType }: { membership: TeamMembershipWithPersonAndTeam, deleteType: 'Soft' | 'Hard' }): Promise<void> {

    const person = await ctx.prisma.person.findUnique({ where: { id: membership.personId } })
    if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person(${membership.personId}) not found.` })

    await match(deleteType)
        .with('Hard', () => 
            ctx.prisma.$transaction([
                ctx.prisma.teamMembership.delete({ where: { id: membership.id }}),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        id: nanoId16(),
                        teamId: membership.teamId,
                        actorId: ctx.personId,
                        event: 'RemoveMember',
                        fields: { personId: membership.personId }
                    }
                })
            ])
        )
        .with('Soft', () => 
            ctx.prisma.$transaction([
                ctx.prisma.teamMembership.update({
                    where: { id: membership.id },
                    data: { role: 'None', status: 'Deleted' }
                }),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        id: nanoId16(),
                        teamId: membership.teamId,
                        actorId: ctx.personId,
                        event: 'RemoveMember',
                        fields: { personId: membership.personId, role: 'None', status: 'Deleted' }
                    }
                })
            ])
        )
        .exhaustive()

    if(membership.role != 'None' && person.clerkUserId) {
        // Remove the person from the clerk organization
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
        await clerk.organizations.deleteOrganizationMembership({
            organizationId: membership.team.clerkOrgId,
            userId: person.clerkUserId
        })
    }
}

/**
 * Update a team membership.
 * @param ctx TRPC Context.
 * @param membership The membership to update.
 * @param newRole The new role.
 * @returns The updated team membership.
 */
export async function updateTeamMember(ctx: AuthenticatedContext, { membership, newRole }: { membership: TeamMembershipWithPersonAndTeam, newRole: TeamMembershipRole }): Promise<TeamMembershipWithPersonAndTeam> {

    const [updatedMembership] = await ctx.prisma.$transaction([
        ctx.prisma.teamMembership.update({
            where: { id: membership.id },
            data: { role: newRole },
            include: { person: true, team: true, d4hInfo: true }
        }),
        ctx.prisma.teamChangeLog.create({
            data: {
                id: nanoId16(),
                teamId: membership.teamId,
                actorId: ctx.personId,
                event: 'UpdateMember',
                fields: { personId: membership.personId, role: newRole }
            }
        })
    ])

    const person = await ctx.prisma.person.findUnique({ where: { id: membership.personId } })
    if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person(${membership.personId}) not found.` })

    if(person.clerkUserId) {
        // Update the person's role in the clerk organization
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

        if(newRole == 'None') {
            // Remove from organization
            await clerk.organizations.deleteOrganizationMembership({
                organizationId: membership.team.clerkOrgId,
                userId: person.clerkUserId
            })
        } else if(membership.role == 'None') {
            // Add to organization
            await clerk.organizations.createOrganizationMembership({
                organizationId: membership.team.clerkOrgId,
                userId: person.clerkUserId,
                role: newRole == 'Admin' ? 'org:admin' : 'org:member'
            })
        } else {
            // Change role
            await clerk.organizations.updateOrganizationMembership({
                organizationId: membership.team.clerkOrgId,
                userId: person.clerkUserId,
                role: newRole == 'Admin' ? 'org:admin' : 'org:member'
            })
        }
    }

    return updatedMembership
}
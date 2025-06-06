/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pick } from 'remeda'
import { match, P } from 'ts-pattern'
import { z } from 'zod'

import { Person, Team, TeamMembership } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { TeamMembershipFormData, teamMembershipFormSchema } from '@/lib/forms/team-membership'
import { nanoId16 } from '@/lib/id'
import { zodRecordStatus, zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, createTRPCRouter, systemAdminProcedure } from '../init'
import { TeamMembershipBasic, TeamMembershipRole, TeamMembershipWithPerson, TeamMembershipWithPersonAndTeam, TeamMembershipWithTeam } from '../types'

import { getPersonById } from './personnel'
import { getTeamById } from './teams'


export const teamMembershipsRouter = createTRPCRouter({
    create: systemAdminProcedure
        .input(teamMembershipFormSchema)
        .mutation(async ({ ctx, input }): Promise<TeamMembershipWithPersonAndTeam> => {

            const [person, team] = await Promise.all([
                getPersonById(ctx, input.personId),
                getTeamById(ctx, input.teamId)
            ])

            const createdMembership = await createTeamMembership(ctx, { ...input, person, team })

            return { ...pick(createdMembership, ['id', 'teamId', 'personId', 'role', 'status']), person, team }
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
        }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.prisma.teamMembership.findFirst({ 
                where: { teamId: input.teamId, personId: input.personId },
                include: { team: true, person: true }
            })
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })
            const { person, team, ...membership } = existing

            await deleteTeamMembership(ctx, { membership, person, team})

            return pick(existing, ['id', 'teamId', 'personId', 'role', 'status'])
        }),

    update: systemAdminProcedure
        .input(teamMembershipFormSchema)
        .mutation(async ({ ctx, input }): Promise<TeamMembershipWithPersonAndTeam> => {
            const existing = await ctx.prisma.teamMembership.findFirst({ 
                where: { teamId: input.teamId, personId: input.personId },
                include: { team: true, person: true }
            })
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })

            const { person, team, ...membership } = existing

            const updatedMembership = updateTeamMembership(ctx, { membership, person, team, role: input.role, status: input.status  })
            return { ...pick(await updatedMembership, ['id', 'teamId', 'personId', 'role', 'status']), person, team }
        })
})



/**
 * Create a new team membership.
 * @param ctx TRPC Context.
 * @param teamId The team ID.
 * @param personId The person ID.
 * @param role The role to assign to the person.
 * @returns The created team membership.
 */
export async function createTeamMembership(ctx: AuthenticatedContext, { team, person, role, status  }: { team: Team, person: Person } & Pick<TeamMembershipFormData, 'role' | 'status'>): Promise<TeamMembership> {
    
    let clerkInvitationId: string | undefined = undefined
    if(role != 'None') {
        // Invite the user to the clerk organization
        const invitation = await ctx.clerkClient.organizations.createOrganizationInvitation({
            organizationId: team.clerkOrgId,
            emailAddress: person.email,
            role: role == 'Admin' ? 'org:admin' : 'org:member',
            publicMetadata: { teamId: team.id, personId: person.id },
            inviterUserId: ctx.auth.userId!!,
        })
        clerkInvitationId = invitation.id
    }

    const inviteStatus = clerkInvitationId ? 'Invited' : 'None'

    const fields = { role, status, clerkInvitationId, inviteStatus } as const

    const [createdMembership] = await ctx.prisma.$transaction([
        ctx.prisma.teamMembership.create({
            data: {
                id: nanoId16(),
                ...fields,
                team: { connect: { id: team.id }},
                person: { connect: { id: person.id }},
            }
        }),
        ctx.prisma.teamChangeLog.create({
            data: {
                id: nanoId16(),
                teamId: team.id,
                actorId: ctx.personId,
                event: 'AddMember',
                fields: { personId: person.id, ...fields }
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
export async function deleteTeamMembership(ctx: AuthenticatedContext, { membership, person, team }: { membership: TeamMembership, person: Person, team: Team }): Promise<void> {

    await ctx.prisma.$transaction([
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

    if(membership.clerkMembershipId) {
        // Remove the clerk membership if it exists
        await ctx.clerkClient.organizations.deleteOrganizationMembership({
            organizationId: team.clerkOrgId,
            userId: person.clerkUserId!!,
        })
    }
    if(membership.clerkInvitationId) {
        // Remove the clerk invitation if it exists
        await ctx.clerkClient.organizations.revokeOrganizationInvitation({
            organizationId: team.clerkOrgId,
            invitationId: membership.clerkInvitationId,
            requestingUserId: ctx.auth.userId!!
        })
    }
}

/**
 * Update a team membership.
 * @param ctx TRPC Context.
 * @param membership The membership to update.
 * @param role The new role.
 * @returns The updated team membership.
 */
export async function updateTeamMembership(ctx: AuthenticatedContext, { membership, person, team, role, status  }: { membership: TeamMembership, person: Person, team: Team } & Pick<TeamMembershipFormData, 'role' | 'status'>): Promise<TeamMembership> {

    const update: Partial<TeamMembership> = await match([membership.role, role])
        .with(['None', 'None'], async () => {
            return {}
        })
        .with(['None', P.not('None')], async () => {
            // Changing from None to some role, need to create an invitation
            const invite = await ctx.clerkClient.organizations.createOrganizationInvitation({
                organizationId: team.clerkOrgId,
                emailAddress: person.email,
                role: role == 'Admin' ? 'org:admin' : 'org:member',
                publicMetadata: { teamId: membership.teamId, personId: membership.personId },
                inviterUserId: ctx.auth.userId!!,
            })
            return { inviteStatus: 'Invited', clerkInvitationId: invite.id }
        })
        .with([P.not('None'), 'None'], async () => {
            // Changing from some role to None, need to remove the membership
            if(membership.clerkMembershipId) {
                await ctx.clerkClient.organizations.deleteOrganizationMembership({
                    organizationId: team.clerkOrgId,
                    userId: person.clerkUserId!!,
                })
                return { inviteStatus: 'None', clerkMembershipId: null }
            } else if(membership.clerkInvitationId) {
                // If there was an invitation, revoke it
                await ctx.clerkClient.organizations.revokeOrganizationInvitation({
                    organizationId: team.clerkOrgId,
                    invitationId: membership.clerkInvitationId,
                    requestingUserId: ctx.auth.userId!!
                })
                return { inviteStatus: 'None', clerkInvitationId: null }
            }
            return { inviteStatus: 'None' }
        })
        .with([P.not('None'), P.not('None')], async () => {
            // Changing from one role to another, update the membership
            if(membership.clerkMembershipId) {
                await ctx.clerkClient.organizations.updateOrganizationMembership({
                    organizationId: team.clerkOrgId,
                    userId: person.clerkUserId!!,
                    role: role == 'Admin' ? 'org:admin' : 'org:member'
                })
            } else if(membership.clerkInvitationId) {
                // If there was an invitation, revoke it and create a new one
                await ctx.clerkClient.organizations.revokeOrganizationInvitation({
                    organizationId: team.clerkOrgId,
                    invitationId: membership.clerkInvitationId,
                    requestingUserId: ctx.auth.userId!!
                })
                const invitation = await ctx.clerkClient.organizations.createOrganizationInvitation({
                    organizationId: team.clerkOrgId,
                    emailAddress: person.email,
                    role: role == 'Admin' ? 'org:admin' : 'org:member',
                    publicMetadata: { teamId: membership.teamId, personId: membership.personId },
                    inviterUserId: ctx.auth.userId!!,
                })
                return { inviteStatus: 'Invited', clerkInvitationId: invitation.id }
            }
            return {}
        })
        .exhaustive()

    const [updatedMembership] = await ctx.prisma.$transaction([
        ctx.prisma.teamMembership.update({
            where: { id: membership.id },
            data: { role, status, ...update },
        }),
        ctx.prisma.teamChangeLog.create({
            data: {
                id: nanoId16(),
                teamId: membership.teamId,
                actorId: ctx.personId,
                event: 'UpdateMember',
                fields: { personId: membership.personId, role, status, ...update }
            }
        })
    ])

    return updatedMembership
}


export async function acceptInvite(ctx: AuthenticatedContext, { teamId, personId, role }: { teamId: string, personId: string, role: TeamMembershipRole }): Promise<TeamMembershipWithPersonAndTeam> {
    const [person, team] = await Promise.all([
        getPersonById(ctx, personId), 
        getTeamById(ctx, teamId)
    ])

    throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Accepting invites is not implemented yet.' })
}
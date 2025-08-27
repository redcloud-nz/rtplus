/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { teamInvitationSchema, toTeamInvitationData } from '@/lib/schemas/invitation'
import { toUserData, userSchema } from '@/lib/schemas/user'
import { zodNanoId8 } from '@/lib/validation'
import { fetchTeamByIdCached } from '@/server/data/team'

import { createTRPCRouter, teamAdminProcedure } from '@/trpc/init'
import { Messages } from '@/trpc/messages'

import { getPersonById } from './personnel'


/**
 * Router for managing users and invitations.
 */
export const usersRouter = createTRPCRouter({

    /**
     * Add an existing user to a team.
     * @param ctx The authenticated context.
     * @param input The input containing the user data.
     * @param input.personId The ID of the person to create the user for.
     * @param input.teamId The ID of the team to create the user in.
     * @param input.role The role of the user (org:admin or org:member).
     * @returns The created user data.
     * @throws TRPCError(NOT_FOUND) If the specified person is not found.
     * @throws TRPCError(FORBIDDEN) If the user is not an admin of the team.
     */
    addTeamUser: teamAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
            teamId: zodNanoId8,
            role: z.enum(['org:admin', 'org:member']),
        }))
        .output(userSchema)
        .mutation(async ({ ctx, input }) => {
            const team = await fetchTeamByIdCached(input.teamId)
            if(!team || !ctx.hasTeamAdmin(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(input.teamId) })

            const person = await getPersonById(ctx, input.personId)
            if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.personNotFound(input.personId) })
            if(!person.clerkUserId) throw new TRPCError({ code: 'BAD_REQUEST', message: Messages.personNotAUser(input.personId) })

            const user = await ctx.clerkClient.users.getUser(person.clerkUserId)

            // Create the membership
            const membership = await ctx.clerkClient.organizations.createOrganizationMembership({
                organizationId: team.clerkOrgId,
                userId: person.clerkUserId,
                role: input.role,
            })

            return toUserData(user, membership)
        }),

    /**
     * Create a new organization invitation for the active team.
     * @param ctx The authenticated context.
     * @param input The input containing the invitation data.
     * @param input.teamId The ID of the team to create the invitation for.
     * @param input.email The email address to invite.
     * @param input.role The role of the invited user (org:admin or org:member).
     * @returns The created organization invitation data.
     * @throws TRPCError(BAD_REQUEST) If an invitation for the email already exists.
     * @throws TRPCError(FORBIDDEN) If the user is not an admin of the team.
     */
    createTeamInvitation: teamAdminProcedure
        .input(teamInvitationSchema.pick({ email: true, role: true }).extend({ teamId: zodNanoId8 }))
        .output(teamInvitationSchema)
        .mutation(async ({ ctx, input }) => {
            const team = await fetchTeamByIdCached(input.teamId)
            if(!team || !ctx.hasTeamAdmin(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(input.teamId) })

            // See if there is a person with this email
            const person = await ctx.prisma.person.findUnique({ where: { email: input.email }})

            const { data: existingInvitations } = await ctx.clerkClient.organizations.getOrganizationInvitationList({ organizationId: team.clerkOrgId, status: ['pending'] })
            if (existingInvitations.some(inv => inv.emailAddress === input.email)) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: `An invitation for ${input.email} already exists.` })
            }

            const orgInvitation = await ctx.clerkClient.organizations.createOrganizationInvitation({
                organizationId: team.clerkOrgId,
                inviterUserId: ctx.session.userId,
                emailAddress: input.email,
                role: input.role,
                publicMetadata: {
                    personId: person?.id || null,
                },
            })

            return toTeamInvitationData(orgInvitation)
        }),

    /**
     * Fetch all invitations for the active team.
     * @param ctx The authenticated context.
     * @param input Optional input to filter invitations by status.
     * @param input.status An array of invitation statuses to filter by (default is ['pending']).
     * @returns An array of organization invitation data.
     */
    getTeamInvitations: teamAdminProcedure
        .input(z.object({
            teamId: zodNanoId8,
            status: z.array(z.enum(['pending', 'accepted', 'revoked', 'expired'])).min(1).max(4).optional().default(['pending'])
        }))
        .output(z.array(teamInvitationSchema))
        .query(async ({ ctx, input }) => {
            const team = await fetchTeamByIdCached(input.teamId)
            if(!team || !ctx.hasTeamAdmin(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(input.teamId) })

            const { data: orgInvitations } = await ctx.clerkClient.organizations.getOrganizationInvitationList({ 
                organizationId: team.clerkOrgId, limit: 100, status: input.status 
            })

            return orgInvitations.map(toTeamInvitationData)
        }),


    /**
     * Get users filtered by team ID.
     * This will return all users that are members of the specified team.
     * @param ctx The authenticated context.
     * @param input The input containing the team ID.
     * @param input.teamId The ID of the team to fetch users for.
     * @returns An array of user data for the specified team.
     * @throws TRPCError(NOT_FOUND) If the team is not found.
     * @throws TRPCError(FORBIDDEN) If the user is not an admin of the team.
     */
    getUsers: teamAdminProcedure
        .input(z.object({
            teamId: zodNanoId8
        }))
        .output(z.array(userSchema))
        .query(async ({ ctx, input }) => {
            const team = await fetchTeamByIdCached(input.teamId)
            if (!team) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.teamNotFound(input.teamId) })

            if(!ctx.hasTeamAdmin(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(input.teamId) })

            const { data: orgMemberships } = await ctx.clerkClient.organizations.getOrganizationMembershipList({ organizationId: ctx.session.activeTeam.orgId, limit: 100 })
            const userIds = orgMemberships.map(m => m.publicUserData!.userId)

            const { data: users } = await ctx.clerkClient.users.getUserList({ userId: userIds, limit: 100 })

            const result = orgMemberships.map(membership => {
                const user = users.find(u => u.id === membership.publicUserData!.userId)!
                
                return toUserData(user, membership)
            })

            return result
        }),

    /**
     * Remove a user from a team.
     * @param ctx The authenticated context.
     * @param input The input containing the team and user IDs.
     * @param input.teamId The ID of the team to remove the user from.
     * @param input.personId The ID of the person to remove from the team.
     * @returns The deleted organization membership data.
     * @throws TRPCError(BAD_REQUEST) If the specified person is not a valid user.
     * @throws TRPCError(FORBIDDEN) If the user is not an admin of the team.
     * @throws TRPCError(NOT_FOUND) If the specified person is not found.
     */
    removeTeamUser: teamAdminProcedure
        .meta({ teamAdminRequired: true })
        .input(z.object({
            teamId: zodNanoId8,
            personId: zodNanoId8,
        }))
        .output(userSchema)
        .mutation(async ({ ctx, input }) => {
            const team = await fetchTeamByIdCached(input.teamId)
            if(!team) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.teamNotFound(input.teamId) })

            if(!ctx.hasTeamAdmin(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(input.teamId) })

            const person = await getPersonById(ctx, input.personId)
            if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.personNotFound(input.personId) })
            if(!person.clerkUserId) throw new TRPCError({ code: 'BAD_REQUEST', message: Messages.personNotAUser(input.personId) })

            const user = await ctx.clerkClient.users.getUser(person.clerkUserId)

            // Revoke the membership
            const membership = await ctx.clerkClient.organizations.deleteOrganizationMembership({
                organizationId: team.clerkOrgId,
                userId: person.clerkUserId,
            })

            return toUserData(user, membership)
        }),

    /**
     * Resend an existing team invitation.
     * @param ctx The authenticated context.
     * @param input The input containing the team and invitation IDs.
     * @param input.teamId The ID of the team to resend the invitation for.
     * @param input.invitationId The ID of the invitation to resend.
     * @returns The resent team invitation data.
     * @throws TRPCError(BAD_REQUEST) If the invitation is not in the 'pending' status.
     * @throws TRPCError(FORBIDDEN) If the user is not an admin of the specified team.
     * @throws TRPCError(NOT_FOUND) If the invitation is not found.
     */
    resendTeamInvitation: teamAdminProcedure
        .input(z.object({
            teamId: zodNanoId8,
            invitationId: z.string()
        }))
        .output(teamInvitationSchema)
        .mutation(async ({ ctx, input }) => {
            const team = await fetchTeamByIdCached(input.teamId)
            if(!team || !ctx.hasTeamAdmin(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(input.teamId) })

            const orgInvitation = await ctx.clerkClient.organizations.getOrganizationInvitation({ organizationId: team.clerkOrgId, invitationId: input.invitationId })
            if (!orgInvitation) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Invitation with ID ${input.invitationId} not found.` })
            }
            if(orgInvitation.status != 'pending') {
                throw new TRPCError({ code: 'BAD_REQUEST', message: `Invitation with ID ${input.invitationId} is not pending.` })
            }
            
            // Revoke the existing invitation
            await ctx.clerkClient.organizations.revokeOrganizationInvitation({ organizationId: ctx.session.activeTeam.orgId, invitationId: input.invitationId })

            // Create a new invitation with the same email and role
            // This will send a new email to the user
            const newInvitation = await ctx.clerkClient.organizations.createOrganizationInvitation({
                organizationId: ctx.session.activeTeam.orgId,
                inviterUserId: ctx.session.userId,
                emailAddress: orgInvitation.emailAddress,
                role: orgInvitation.role,
                publicMetadata: orgInvitation.publicMetadata,
                })

            return toTeamInvitationData(newInvitation)
        }),

    /**
     * Revoke an existing organization invitation.
     * @param ctx The authenticated context.
     * @param input The input containing the team and invitation IDs.
     * @param input.teamId The ID of the team to revoke the invitation from.
     * @param input.invitationId The ID of the invitation to revoke.
     * @returns The revoked organization invitation data.
     * @throws TRPCError(NOT_FOUND) If the invitation is not found.
     */
    revokeInvitation: teamAdminProcedure
        .input(z.object({
            teamId: zodNanoId8,
            invitationId: z.string()
        }))
        .output(teamInvitationSchema)
        .mutation(async ({ ctx, input }) => {
            const team = await fetchTeamByIdCached(input.teamId)
            if(!team || !ctx.hasTeamAdmin(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(input.teamId) })

            const orgInvitation = await ctx.clerkClient.organizations.getOrganizationInvitation({ organizationId: ctx.session.activeTeam.orgId, invitationId: input.invitationId })
            if (!orgInvitation) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Invitation with ID ${input.invitationId} not found.` })
            }


            const revokedInvitation = await ctx.clerkClient.organizations.revokeOrganizationInvitation({ organizationId: ctx.session.activeTeam.orgId, invitationId: input.invitationId })

            return toTeamInvitationData(revokedInvitation)
        }),
    
        
    /**
     * Update an existing user's role in a team.
     * @param ctx The authenticated context.
     * @param input The input containing the team ID, user ID, and new role.
     * @param input.teamId The ID of the team to update the membership for.
     * @param input.personId The ID of the user to update the membership for.
     * @param input.role The new role to assign to the user (either 'org:admin' or 'org:member').
     * @returns The updated organization membership data.
     * @throws TRPCError(FORBIDDEN) If the user is not an admin of the specified team.
     * @throws TRPCError(NOT_FOUND) If the specified person is not found.
     */
    updateTeamUser: teamAdminProcedure
        .meta({ teamAdminRequired: true })
        .input(z.object({
            teamId: zodNanoId8,
            personId: zodNanoId8,
            role: z.enum(['org:admin', 'org:member']),
        }))
        .output(userSchema)
        .mutation(async ({ ctx, input }) => {
            const team = await fetchTeamByIdCached(input.teamId)
            if(!team || !ctx.hasTeamAdmin(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(input.teamId) })

            const person = await getPersonById(ctx, input.personId)
            if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.personNotFound(input.personId) })
            if(!person.clerkUserId) throw new TRPCError({ code: 'BAD_REQUEST', message: Messages.personNotAUser(input.personId) })

            const user = await ctx.clerkClient.users.getUser(person.clerkUserId)

            const orgMembership = await ctx.clerkClient.organizations.updateOrganizationMembership({
                organizationId: team.clerkOrgId,
                userId: person.clerkUserId,
                role: input.role,
            })

            return toUserData(user, orgMembership)
        }),
})